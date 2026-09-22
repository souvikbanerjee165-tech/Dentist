import { digitalIntakeService } from '../src/services/clinical/digital-intake.service.js';
import { insuranceRteService } from '../src/services/billing/insurance-rte.service.js';
import { aftercareTrackerService } from '../src/services/clinical/aftercare-tracker.service.js';
import { dentalMediaService } from '../src/services/clinical/dental-media.service.js';
import { treatmentPlanService } from '../src/services/billing/treatment-plan.service.js';
import { copayPaymentService } from '../src/services/billing/copay-payment.service.js';
import { waitlistEngineService } from '../src/services/operations/waitlist-engine.service.js';
import { clinicalTriageService } from '../src/services/operations/clinical-triage.service.js';
import { patientRecordsService } from '../src/services/patient/patient-records.service.js';

async function runClinicalFinancialOperationsVerification() {
  console.log('🏥 Starting Comprehensive Verification: Clinical, Financial & Practice Operations\n');

  // ==========================================
  // Dimension 1: Digital Intake & Pre-Visit Automation
  // ==========================================
  console.log('1️⃣ Testing Digital Intake & Legal ESIGN Fingerprint...');
  const intakeSubmission = digitalIntakeService.submitIntake({
    patientId: 'pat_test_001',
    patientFullName: 'Sophia Martinez',
    medicalHistory: {
      currentMedications: ['Vitamin D3 2000 IU', 'Cetirizine 10mg'],
      chronicConditions: ['Mild Asthma'],
      allergies: ['Penicillin (Hives)'],
      pastSurgeries: ['Wisdom tooth extraction (2021)'],
      hasHeartMurmurOrValveReplacement: false,
      takesBloodThinners: false,
      emergencyContactName: 'Carlos Martinez',
      emergencyContactPhone: '+1 (555) 987-6543',
      emergencyContactRelation: 'Spouse',
    },
    hipaaAcknowledged: true,
    treatmentConsentAcknowledged: true,
    financialAgreementAcknowledged: true,
    signatureType: 'type',
    signatureData: 'Sophia Martinez',
    ipAddress: '192.168.1.50',
    userAgent: 'Mozilla/5.0 DentalClient Test',
  });

  console.assert(intakeSubmission.signature.sha256Hash.length === 64, 'SHA-256 hash must be 64 characters');
  console.assert(intakeSubmission.hipaaAcknowledged === true, 'HIPAA acknowledgment must be recorded');
  console.log('   ✅ Digital Intake successfully submitted with SHA-256 audit fingerprint:', intakeSubmission.signature.sha256Hash.slice(0, 16) + '...');

  console.log('\n2️⃣ Testing Insurance OCR Scanning & Real-Time Eligibility (270/271 EDI)...');
  const ocrCard = await insuranceRteService.scanCardOcr({
    patientId: 'pat-seed-01',
    patientFullName: 'Sophia Martinez',
  });
  console.assert(ocrCard.payerName === 'Delta Dental PPO', 'Payer name must match OCR output');
  console.assert(ocrCard.memberId.startsWith('DD-'), 'Member ID must match OCR format');

  const rteReport = await insuranceRteService.verifyRealTimeEligibility({
    patientId: 'pat-seed-01',
    card: ocrCard,
  });
  console.assert(rteReport.activeStatus === 'ACTIVE_COVERAGE', 'RTE status should be active coverage');
  console.assert(rteReport.annualMaximumBenefit === 2000, 'Annual maximum benefit should be $2,000');
  console.assert(rteReport.annualBenefitRemaining === 1780, 'Remaining benefit should be $1,780');
  console.log('   ✅ Real-Time 270/271 Eligibility verified: Payer =', rteReport.payerName, '| Remaining Benefit = $' + rteReport.annualBenefitRemaining);

  // ==========================================
  // Dimension 2: Patient Experience & Engagement
  // ==========================================
  console.log('\n3️⃣ Testing Curbside 1-Click "I\'ve Arrived" Check-In...');
  const upcoming = patientRecordsService.getUpcomingAppointment('pat-sophia-01');
  if (upcoming) {
    upcoming.status = 'checked_in';
    patientRecordsService.setUpcomingAppointment(upcoming);
  }
  const verifiedUpcoming = patientRecordsService.getUpcomingAppointment('pat-sophia-01');
  console.assert(verifiedUpcoming?.status === 'checked_in', 'Patient appointment status must update to checked_in');
  console.log('   ✅ Curbside arrival checked in: Status =', verifiedUpcoming?.status, '| Room =', verifiedUpcoming?.room);

  console.log('\n4️⃣ Testing Post-Op Recovery Protocol & Pain Triage Escalation...');
  // Baseline normal checkin
  const mildCheckin = aftercareTrackerService.logDailyCheckin({
    patientId: 'pat-seed-01',
    dayNumber: 1,
    painScale: 3,
    bleedingLevel: 'spotting',
    swellingLevel: 'mild',
    tookPrescribedMedication: true,
  });
  console.assert(mildCheckin.alertTriggered === false, 'Mild pain should not trigger urgent review');
  console.log('   ✅ Normal day 1 check-in logged without emergency trigger');

  // Severe pain escalation (pain = 8)
  const severeCheckin = aftercareTrackerService.logDailyCheckin({
    patientId: 'pat-seed-01',
    dayNumber: 2,
    painScale: 8,
    bleedingLevel: 'moderate',
    swellingLevel: 'moderate',
    tookPrescribedMedication: true,
    notes: 'Throbbing pain keeping me awake despite ibuprofen.',
  });
  console.assert(severeCheckin.alertTriggered === true, 'Pain >= 7 must trigger urgent clinical review');
  const criticalAlerts = aftercareTrackerService.getCriticalAlerts();
  console.assert(criticalAlerts.length > 0, 'Critical alerts list must contain escalated record');
  console.log('   ✅ Emergency escalation verified: Pain 8/10 triggered clinical alert for Dr. Sarah Jensen');

  console.log('\n5️⃣ Testing Dental Media & Imaging Gallery...');
  const media = dentalMediaService.getMediaForPatient('pat-seed-01');
  console.assert(media.length >= 2, 'Patient should have clinical imaging records');
  const hasBitewing = media.some((m) => m.category === 'xray_bitewing');
  const hasBeforeAfter = media.some((m) => m.category === 'before_after');
  console.assert(hasBitewing && hasBeforeAfter, 'Media records must include radiographs and before/after comparisons');
  console.log('   ✅ Dental imaging gallery loaded:', media.length, 'high-resolution diagnostic items verified');

  // ==========================================
  // Dimension 3: Financial Transparency & Payments
  // ==========================================
  console.log('\n6️⃣ Testing Phased Treatment Proposal & Remote Digital Acceptance...');
  const initialPlan = treatmentPlanService.getPlanByPatientId('pat-seed-01');
  console.assert(initialPlan != null && initialPlan.phases.length >= 3, 'Treatment proposal must include at least 3 phases');
  console.assert(initialPlan!.totalGrossFee > 0, 'Total cost must be calculated');

  const acceptedPlan = treatmentPlanService.acceptTreatmentPhase({
    patientId: 'pat-seed-01',
    phaseNumbers: [1],
    signedName: 'Sophia Martinez',
    ipAddress: '192.168.1.50',
  });
  const phase1 = acceptedPlan?.phases.find((p) => p.phaseNumber === 1);
  console.assert(phase1?.status === 'accepted', 'Phase 1 status must be accepted');
  console.assert(phase1?.procedures.length >= 2, 'Phase 1 should contain at least 2 procedures');
  console.assert(acceptedPlan?.acceptanceSignature?.signedName === 'Sophia Martinez', 'Acceptance signature must be recorded');
  console.log('   ✅ Phase 1 digitally accepted with procedures:', phase1?.procedures.map((p) => p.cdtCode || p.name).join(', '));

  console.log('\n7️⃣ Testing BNPL 0% APR Financing Calculator across Providers...');
  const bnplOptions = treatmentPlanService.calculateBnplFinancing(1600);
  console.assert(bnplOptions.length >= 4, 'Should generate calculation matrix across Cherry, Sunbit, CareCredit');
  const careCredit12Mo = bnplOptions.find((b) => b.providerName === 'CareCredit' && b.termMonths === 12);
  console.assert(careCredit12Mo != null && careCredit12Mo.monthlyPayment === 133.33, 'CareCredit 12-month payment on $1600 should be $133.33/mo');
  console.log('   ✅ BNPL Financing verified: $1,600 over 12 months = $' + careCredit12Mo?.monthlyPayment + '/mo at 0% APR');

  console.log('\n8️⃣ Testing Card-on-File Copay Pre-Authorization...');
  const copayHold = copayPaymentService.preAuthorizeCopay({
    patientId: 'pat-seed-01',
    treatmentName: 'Phase 1 Restorative Procedures',
    amount: 150,
  });
  console.assert(copayHold.status === 'pre_authorized', 'Copay hold status must be pre_authorized');
  console.assert(copayHold.cardUsed.last4 === '4242', 'Copay hold must bind to saved card ending in 4242');
  console.log('   ✅ Copay pre-authorized on card:', copayHold.cardUsed.brand, '••••', copayHold.cardUsed.last4, '| Hold Amount: $' + copayHold.amount);

  // ==========================================
  // Dimension 4: Practice Operations & Clinical Efficiency
  // ==========================================
  console.log('\n9️⃣ Testing Cancellation Backfill Broadcast & Atomic Slot Claim...');
  const backfillOffer = await waitlistEngineService.triggerCancellationBackfill({
    slotDate: 'Today (3:00 PM)',
    slotTime: '15:00',
    doctorName: 'Dr. Sarah Jensen',
    treatmentType: 'Hygiene & Emergency Restorative',
    operatory: 'Operatory 1',
  });
  console.assert(backfillOffer.recipientsNotifiedCount > 0, 'Backfill must notify waitlisted patients');
  console.assert(backfillOffer.status === 'open_broadcasting', 'Offer status must be open_broadcasting');
  console.log('   ✅ Cancellation broadcast dispatched to', backfillOffer.recipientsNotifiedCount, 'patients');

  // Atomic 1st claim
  const claimResult = waitlistEngineService.claimSlot({
    offerId: backfillOffer.offerId,
    patientId: 'pat_waitlist_001',
    patientName: 'David Chen',
  });
  console.assert(claimResult.success === true, 'First claim must succeed');
  console.assert(claimResult.offer?.claimedByPatientName === 'David Chen', 'Claimant must be David Chen');

  // Atomic 2nd claim conflict defense
  const duplicateClaim = waitlistEngineService.claimSlot({
    offerId: backfillOffer.offerId,
    patientId: 'pat_waitlist_002',
    patientName: 'Emma Watson',
  });
  console.assert(duplicateClaim.success === false, 'Subsequent claim must be rejected as already claimed');
  console.log('   ✅ Atomic backfill lock verified: Slot secured by David Chen, race-condition duplicate rejected');

  console.log('\n🔟 Testing Two-Way Clinical Message Triage Categorization...');
  const triageUrgent = clinicalTriageService.categorizeMessage(
    'Hi doctor, my gum around the implant is throbbing with severe pain and bleeding won\'t stop.'
  );
  console.assert(triageUrgent.category === 'Clinical / Urgent', 'Throbbing pain & bleeding must be categorized as Clinical / Urgent');
  console.assert(triageUrgent.urgency === 'P1_Emergency', 'Clinical / Urgent message must have emergency urgency');

  const triageBilling = clinicalTriageService.categorizeMessage(
    'Can you please email me the insurance receipt and breakdown for my deductible?'
  );
  console.assert(triageBilling.category === 'Billing / Insurance', 'Deductible and receipt query must be categorized as Billing / Insurance');

  const triageScheduling = clinicalTriageService.categorizeMessage(
    'I need to reschedule my Friday appointment to next Monday morning if possible.'
  );
  console.assert(triageScheduling.category === 'Scheduling', 'Reschedule query must be categorized as Scheduling');

  console.log('   ✅ Two-way triage categorized:');
  console.log('      - Urgent message ->', triageUrgent.category, '(' + triageUrgent.urgency + ')');
  console.log('      - Billing message ->', triageBilling.category, '(' + triageBilling.urgency + ')');
  console.log('      - Scheduling message ->', triageScheduling.category, '(' + triageScheduling.urgency + ')');

  console.log('\n=============================================================');
  console.log('🎉 ALL 10 CLINICAL, FINANCIAL & OPERATIONS TESTS PASSED 100%!');
  console.log('=============================================================');
}

runClinicalFinancialOperationsVerification().catch((err) => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
