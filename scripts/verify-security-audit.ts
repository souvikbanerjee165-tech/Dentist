import { SsrfGuard } from '../src/utils/ssrf.guard.js';
import { SafeLogger } from '../src/utils/safe-logger.js';
import { patientAuthService } from '../src/services/patient/patient-auth.service.js';
import { aftercareTrackerService } from '../src/services/clinical/aftercare-tracker.service.js';
import { GoogleCalendarService } from '../src/services/calendar/calendar.service.js';
import { aiConversationService } from '../src/services/ai/ai.service.js';
import { preventWebhookReplay } from '../src/middleware/auth.middleware.js';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${testName}${detail ? ` - ${detail}` : ''}`);
    failed++;
  }
}

async function runSecurityAuditSuite() {
  console.log('\n============================================================');
  console.log('🛡️  ADVERSARIAL PRODUCTION SECURITY & CLINICAL AUDIT SUITE');
  console.log('============================================================\n');

  // -------------------------------------------------------------
  // 1. SSRF GUARD TESTS
  // -------------------------------------------------------------
  console.log('--- TEST GROUP 1: SSRF Guard (Cloud Metadata & Private CIDRs) ---');
  
  const ssrfPayloads = [
    'http://169.254.169.254/latest/meta-data',
    'http://169.254.169.254/computeMetadata/v1/',
    'http://127.0.0.1:8080/internal',
    'http://localhost:3000',
    'http://10.0.0.1/admin',
    'http://172.16.0.1/status',
    'http://192.168.1.1/router',
    'ftp://example.com/secret.pdf',
    'file:///etc/passwd',
  ];

  for (const url of ssrfPayloads) {
    let blocked = false;
    try {
      await SsrfGuard.validateUrl(url);
    } catch (err: any) {
      blocked = true;
    }
    assert(blocked, `SSRF Guard rejects forbidden target: ${url}`);
  }

  // Safe public URLs must pass
  let safeAccepted = false;
  try {
    const valid = await SsrfGuard.validateUrl('https://example.com/api/test');
    safeAccepted = valid instanceof URL && valid.origin === 'https://example.com';
  } catch (err: any) {
    safeAccepted = false;
  }
  assert(safeAccepted, 'SSRF Guard permits valid public HTTPS URL');

  // -------------------------------------------------------------
  // 2. TIMING-SAFE AUTHENTICATION & JWT FORGERY DEFENSE
  // -------------------------------------------------------------
  console.log('\n--- TEST GROUP 2: Timing-Safe Auth & Signature Verification ---');

  // Register test patient
  const regResult = patientAuthService.register({
    fullName: 'Audit Security Test Patient',
    email: `audit.test.${Date.now()}@example.com`,
    phone: '+15559876543',
    password: 'SuperSecurePassword!2026',
  });
  const token = regResult.token || (regResult as any).sessionToken;
  assert(Boolean(regResult.success && token), 'Patient registration yields signed session token');

  if (token) {
    // Valid token
    const validPayload = patientAuthService.verifySessionToken(token);
    assert(Boolean(validPayload && validPayload.patientId === regResult.user?.id), 'Valid session token verifies successfully');

    // Tampered payload
    const parts = token.split('.');
    const tamperedPayload = Buffer.from(JSON.stringify({ patientId: 'pat-tampered-admin', exp: Date.now() + 99999 })).toString('base64url');
    const tamperedToken = `${parts[0]}.${tamperedPayload}.${parts[2]}`;
    const forgedResult = patientAuthService.verifySessionToken(tamperedToken);
    assert(forgedResult === null, 'Forged payload with original signature is rejected (timingSafeEqual)');

    // Corrupted signature
    const corruptedToken = `${parts[0]}.${parts[1]}.CORRUPTED_SIGNATURE_HERE`;
    const corruptedResult = patientAuthService.verifySessionToken(corruptedToken);
    assert(corruptedResult === null, 'Corrupted signature is rejected');
  }

  // -------------------------------------------------------------
  // 3. CLINICAL TRIAGE & ESCALATION TIMEOUT ENGINE
  // -------------------------------------------------------------
  console.log('\n--- TEST GROUP 3: Clinical Triage & Escalation Timeout Engine ---');

  const checkinResult = aftercareTrackerService.logDailyCheckin({
    patientId: 'pat-audit-emergency-01',
    dayNumber: 2,
    painScale: 9, // Severe pain (>7 triggers alert)
    bleedingLevel: 'heavy',
    swellingLevel: 'moderate',
    tookPrescribedMedication: true,
    notes: 'Severe throbbing pain not subsiding with ibuprofen.',
  });

  assert(checkinResult.alertTriggered === true, 'Severe pain/bleeding triggers immediate clinical alert');

  const initialAlerts = aftercareTrackerService.getCriticalAlerts();
  const alert = initialAlerts.find((a) => a.patientId === 'pat-audit-emergency-01');
  assert(Boolean(alert), 'Critical alert recorded in doctor aftercare triage queue');

  if (alert) {
    assert(alert.status === 'pending_doctor_ack', 'Initial alert status is pending_doctor_ack');

    // Simulate 20 minutes passing without doctor acknowledgment
    alert.timestampIso = new Date(Date.now() - 20 * 60 * 1000).toISOString();
    const escalationCount = aftercareTrackerService.checkEscalationTimeouts();
    assert(escalationCount > 0, `Escalation timeout triggered (${escalationCount} alert(s) escalated)`);

    const updatedAlert = aftercareTrackerService.getCriticalAlerts().find((a) => a.alertId === alert.alertId);
    assert(
      updatedAlert?.status === 'escalated_to_secondary_oncall',
      'Unacknowledged alert auto-escalates to secondary on-call after 15m timeout'
    );

    // Doctor acknowledges alert
    const ackSuccess = aftercareTrackerService.acknowledgeAlert(alert.alertId, 'Dr. Sarah Jensen, DDS');
    assert(ackSuccess === true, 'Doctor acknowledgment records successfully');

    const ackedAlert = aftercareTrackerService.getCriticalAlerts().find((a) => a.alertId === alert.alertId);
    assert(ackedAlert?.status === 'acknowledged', 'Alert status updates to acknowledged');
    assert(ackedAlert?.acknowledgedBy === 'Dr. Sarah Jensen, DDS', 'Alert stores acknowledging clinician identity');
  }

  // -------------------------------------------------------------
  // 4. CONCURRENT CALENDAR BOOKING RACE CONDITION DEFENSE
  // -------------------------------------------------------------
  console.log('\n--- TEST GROUP 4: Calendar TOCTOU Double-Booking Race Condition Defense ---');

  const calendarService = new GoogleCalendarService();
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + 5);
  targetDate.setHours(14, 0, 0, 0); // 2:00 PM
  const startTimeIso = targetDate.toISOString();

  // Fire two concurrent booking requests at the exact same millisecond
  const [book1, book2] = await Promise.all([
    calendarService.bookAppointment({
      businessId: 'clinic-audit-1',
      customerName: 'Patient Alpha',
      customerPhone: '+15551112222',
      customerEmail: 'alpha@example.com',
      serviceType: 'Emergency Toothache Exam',
      startTime: startTimeIso,
      durationMinutes: 45,
    }),
    calendarService.bookAppointment({
      businessId: 'clinic-audit-1',
      customerName: 'Patient Beta',
      customerPhone: '+15553334444',
      customerEmail: 'beta@example.com',
      serviceType: 'Laser Teeth Whitening',
      startTime: startTimeIso,
      durationMinutes: 45,
    }),
  ]);

  const oneSucceeded = (book1.success && !book2.success) || (!book1.success && book2.success);
  assert(oneSucceeded, 'Concurrent booking race condition prevented: exactly one appointment succeeded');
  const conflictOccurred = book1.error === 'DoubleBookingConflict' || book1.error === 'SlotBookingConflict' ||
                           book2.error === 'DoubleBookingConflict' || book2.error === 'SlotBookingConflict';
  assert(conflictOccurred, 'Conflicting concurrent booking was rejected with DoubleBooking/SlotBooking conflict');

  // -------------------------------------------------------------
  // 5. AI CLINICAL SAFETY BOUNDARIES & POST-GENERATION SANITIZER
  // -------------------------------------------------------------
  console.log('\n--- TEST GROUP 5: AI Clinical Safety Boundaries & Prescription Defense ---');

  // Verify post-generation clinical boundary sanitizer
  const testAITurnWithPrescription = (aiConversationService as any).sanitizeClinicalBoundaries({
    reply: 'You should take 500mg amoxicillin twice a day for the toothache.',
    intent: 'faq_inquiry',
    confidence: 0.95,
    collected_data: {},
    missing_fields: [],
    handover_required: false,
    handover_reason: null,
    knowledge_sources_used: [],
  });

  assert(
    !testAITurnWithPrescription.reply.toLowerCase().includes('take 500mg amoxicillin'),
    'AI prescription attempt intercepted and redacted from reply'
  );
  assert(
    testAITurnWithPrescription.reply.includes('Clinical Note: As an automated AI assistant, I cannot diagnose'),
    'Mandatory clinical safety disclaimer appended when prescription language is detected'
  );

  const testAITurnWithDiagnosis = (aiConversationService as any).sanitizeClinicalBoundaries({
    reply: 'Based on your symptoms, you definitely have irreversible pulpitis in your molar.',
    intent: 'faq_inquiry',
    confidence: 0.95,
    collected_data: {},
    missing_fields: [],
    handover_required: false,
    handover_reason: null,
    knowledge_sources_used: [],
  });

  assert(
    !testAITurnWithDiagnosis.reply.includes('you definitely have irreversible pulpitis'),
    'Definitive diagnostic claim intercepted and softened to symptoms suggestive requiring clinical exam'
  );

  // -------------------------------------------------------------
  // 6. SAFE-LOGGER PII / ePHI SANITIZATION
  // -------------------------------------------------------------
  console.log('\n--- TEST GROUP 6: SafeLogger PII/ePHI Sanitization ---');

  const maskedPhone = SafeLogger.maskPhone('+1 (555) 234-5678');
  assert(maskedPhone === '+1****5678', `Phone number correctly masked: ${maskedPhone}`);

  const maskedName = SafeLogger.maskPatientName('Sophia Martinez');
  assert(maskedName === 'S*** M***', `Patient name correctly masked: ${maskedName}`);

  const maskedEmail = SafeLogger.maskEmail('sophia.martinez@gmail.com');
  assert(maskedEmail === 'so***@gmail.com', `Patient email correctly masked: ${maskedEmail}`);

  // -------------------------------------------------------------
  // 7. WEBHOOK REPLAY ATTACK PREVENTION
  // -------------------------------------------------------------
  console.log('\n--- TEST GROUP 7: Webhook Replay Attack Prevention ---');

  const testWebhookId = `wh-event-${Date.now()}`;
  let req1NextCalled = false;
  let req2Status = 200;

  const mockReq1: any = { headers: { 'x-webhook-id': testWebhookId }, body: {} };
  const mockRes1: any = {};
  const mockNext1 = () => { req1NextCalled = true; };

  preventWebhookReplay(mockReq1, mockRes1, mockNext1);
  assert(req1NextCalled === true, 'First incoming webhook with unique ID passes through');

  let testWebhookPayload: any = null;
  const mockReq2: any = { headers: { 'x-webhook-id': testWebhookId }, body: {} };
  const mockRes2: any = {
    status: (code: number) => {
      req2Status = code;
      return {
        json: (data: any) => {
          testWebhookPayload = data;
        },
      };
    },
  };
  const mockNext2 = () => {};

  preventWebhookReplay(mockReq2, mockRes2, mockNext2);
  assert(
    req2Status === 200 && testWebhookPayload?.status === 'duplicate_ignored',
    'Replay of same webhook ID within TTL window safely ignored with duplicate_ignored (prevents retry storms)'
  );

  // Summary
  console.log('\n============================================================');
  console.log(`AUDIT RESULTS: Passed: ${passed} | Failed: ${failed}`);
  console.log('============================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runSecurityAuditSuite().catch((err) => {
  console.error('Test runner encountered error:', err);
  process.exit(1);
});
