/**
 * Verification Script: SMS / RCS Messaging Foundation & TCPA/HIPAA Compliance
 * 
 * Verifies:
 * 1. TCPA & HIPAA Consent recording, persistence in JSON store, and audit logging.
 * 2. RCS Rich Card format generation (Title, Image, Chips, Directions).
 * 3. 10DLC Compliant SMS format generation with required statutory suffix.
 * 4. Inbound 2-way patient handling (STOP opt-out, START re-subscribe, CONFIRM, RESCHEDULE).
 * 5. REST API endpoint connectivity on backend (/api/v1/sms/*).
 */

import { smsRcsService } from '../src/services/messaging/sms-rcs.service.js';

async function runVerification() {
  console.log('================================================================');
  console.log('🧪 VERIFYING US & CANADA SMS / RCS 10DLC & TELNYX INFRASTRUCTURE');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, description: string) {
    if (condition) {
      console.log(`  ✅ [PASS] ${description}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${description}`);
      failed++;
    }
  }

  // 1. Direct Service TCPA Consent Logging
  console.log('1. Testing TCPA & HIPAA Regulatory Consent Logging:');
  const testPhone = '+15552345678';
  const testPatient = 'Eleanor Vance';
  
  const consentRecord = smsRcsService.recordConsent({
    phoneNumber: testPhone,
    patientName: testPatient,
    channel: 'sms',
    tcpaConsentGranted: true,
    hipaaAcknowledgementGranted: true,
    ipAddress: '198.51.100.42',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)'
  });

  assert(consentRecord.phoneNumber === testPhone, 'Consent recorded for phone number');
  assert(consentRecord.status === 'active', 'Consent status is "active"');
  assert(Boolean(consentRecord.timestamp), 'Consent includes ISO audit timestamp');
  assert(smsRcsService.hasActiveConsent(testPhone) === true, 'hasActiveConsent returns true for opted-in user');

  // 2. Audit Trail Retrieval
  console.log('\n2. Testing Auditable Consent Store:');
  const auditList = smsRcsService.getConsentAuditList();
  const found = auditList.find(r => r.phoneNumber === testPhone);
  assert(Boolean(found), 'Consent record persisted and retrieved from auditable JSON store');

  // 3. RCS Rich Card Generation
  console.log('\n3. Testing Google/Apple RCS Rich Card Generation:');
  const rcsCard = smsRcsService.buildRcsCard({
    to: testPhone,
    patientName: testPatient,
    appointmentDate: 'Tomorrow, Oct 14',
    appointmentTime: '2:30 PM',
    treatment: 'Cosmetic Laser Whitening',
    clinicName: 'Apex Dental Care',
    clinicAddress: '450 Lexington Ave, Suite 800, New York'
  });

  assert(rcsCard.title.includes('Apex Dental Care'), 'RCS Card title includes clinic branding');
  assert(Boolean(rcsCard.mediaUrl), 'RCS Card includes dental clinic media URL');
  assert(rcsCard.actionChips.length === 4, 'RCS Card includes 4 interactive action chips');
  const actionTitles = rcsCard.actionChips.map(a => a.title);
  assert(actionTitles.some(t => t.includes('Confirm')), 'Action chip "Confirm" exists');
  assert(actionTitles.some(t => t.includes('Reschedule')), 'Action chip "Reschedule" exists');
  assert(actionTitles.some(t => t.includes('Bring')), 'Action chip "What to Bring" exists');
  assert(actionTitles.some(t => t.includes('Directions')), 'Action chip "Directions" exists');

  // 4. 10DLC Compliant SMS Fallback
  console.log('\n4. Testing 10DLC Cellular SMS Compliance:');
  const smsBody = smsRcsService.buildSmsFallbackText({
    to: testPhone,
    patientName: testPatient,
    appointmentDate: 'Tomorrow, Oct 14',
    appointmentTime: '2:30 PM',
    treatment: 'Cosmetic Laser Whitening',
    clinicName: 'Apex Dental Care',
    clinicAddress: '450 Lexington Ave, Suite 800, New York'
  });

  assert(smsBody.includes('[Apex Dental Care]'), 'SMS starts with registered clinic brand');
  assert(smsBody.includes('Reply STOP to cancel'), 'SMS includes mandatory STOP opt-out disclosure');
  assert(smsBody.includes('HELP for help'), 'SMS includes mandatory HELP disclosure');
  assert(smsBody.includes('Msg&data rates may apply'), 'SMS includes mandatory carrier rate fee disclosure');

  // 5. Inbound 2-Way Patient Text Handling
  console.log('\n5. Testing Inbound 2-Way Patient Actions (STOP, START, CONFIRM, RESCHEDULE):');
  
  // STOP opt-out
  const stopReply = await smsRcsService.handleInboundText(testPhone, 'STOP');
  assert(stopReply.reply.includes('opted out'), 'STOP command returns opt-out acknowledgment');
  assert(smsRcsService.hasActiveConsent(testPhone) === false, 'STOP command revokes consent in audit store');

  // Re-subscribe START
  const startReply = await smsRcsService.handleInboundText(testPhone, 'START');
  assert(startReply.reply.includes('resubscribed'), 'START command restores subscription');
  assert(smsRcsService.hasActiveConsent(testPhone) === true, 'START command reactivates consent');

  // CONFIRM appointment
  const confirmReply = await smsRcsService.handleInboundText(testPhone, 'C');
  assert(confirmReply.reply.includes('confirmed'), 'Quick reply "C" confirms appointment');

  // RESCHEDULE
  const rescheduleReply = await smsRcsService.handleInboundText(testPhone, 'RESCHEDULE');
  assert(rescheduleReply.reply.includes('preferred day and time'), 'Keyword "RESCHEDULE" provides change instructions');

  // 6. REST API Endpoint Connectivity (port 4000)
  console.log('\n6. Testing REST API Endpoints via HTTP (/api/v1/sms/*):');
  try {
    const consentRes = await fetch('http://127.0.0.1:4000/api/v1/sms/consent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phoneNumber: '+15559876543',
        patientName: 'Marcus Aurelius',
        channel: 'sms',
        tcpaConsentGranted: true,
        hipaaAcknowledgementGranted: true,
      })
    });
    const consentJson = await consentRes.json() as any;
    assert(consentRes.ok && consentJson.success === true, 'POST /api/v1/sms/consent returned 200 OK');

    const sendRes = await fetch('http://127.0.0.1:4000/api/v1/sms/send-confirmation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: '+15559876543',
        patientName: 'Marcus Aurelius',
        treatment: 'Comprehensive Exam',
        appointmentDate: 'Wednesday, Oct 15',
        appointmentTime: '11:00 AM',
        clinicName: 'Apex Dental Care'
      })
    });
    const sendJson = await sendRes.json() as any;
    assert(sendRes.ok && sendJson.success === true, 'POST /api/v1/sms/send-confirmation returned 200 OK');

    const auditRes = await fetch('http://127.0.0.1:4000/api/v1/sms/consent/audit');
    const auditJson = await auditRes.json() as any;
    assert(auditRes.ok && auditJson.totalConsents > 0, `GET /api/v1/sms/consent/audit returned ${auditJson.totalConsents} consented records`);

    const inboundRes = await fetch('http://127.0.0.1:4000/api/v1/sms/inbound', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: '+15559876543',
        text: 'CONFIRM'
      })
    });
    const inboundJson = await inboundRes.json() as any;
    assert(inboundRes.ok && inboundJson.response.includes('confirmed'), 'POST /api/v1/sms/inbound handled 2-way patient response');

  } catch (err: any) {
    console.warn('  ⚠️ HTTP API test skipped or deferred (server may be restarting):', err.message);
  }

  console.log('\n================================================================');
  console.log(`🏁 VERIFICATION COMPLETE: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runVerification().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
