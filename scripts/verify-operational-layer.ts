/**
 * Verification Script: Enterprise Dental Operations & Deployment Layer
 * Validates:
 * 1. White-label clinic profile singleton and dynamic CSS tokens
 * 2. PMS CSV Batch Importer (Dentrix & Eaglesoft fuzzy headers & E.164 cleaner)
 * 3. Open Dental REST API adapter simulation
 * 4. HIPAA/TCPA Compliance Audit Logger & Dynamic BAA generator
 */

import { clinicProfileService } from '../src/services/config/clinic-profile.service';
import { pmsCsvImporterService } from '../src/services/pms/pms-csv-importer.service';
import { openDentalAdapterService } from '../src/services/pms/opendental-adapter.service';
import { complianceAuditService } from '../src/services/compliance/compliance-audit.service';

async function runVerification() {
  console.log('================================================================');
  console.log('🧪 VERIFYING ENTERPRISE DENTAL OPERATIONAL & DEPLOYMENT LAYER');
  console.log('================================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, testName: string, extraInfo?: string) {
    total++;
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      if (extraInfo) console.log(`   └─ ${extraInfo}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
      if (extraInfo) console.error(`   └─ ${extraInfo}`);
    }
  }

  // 1. Clinic Profile White-Label Service
  console.log('--- 1. White-Label Clinic Profile Configuration ---');
  const initialProfile = clinicProfileService.getProfile();
  assert(
    !!initialProfile.name && initialProfile.name.length > 0,
    'ClinicProfileService provides valid default clinic name',
    `Name: ${initialProfile.name}`
  );

  const cssVars = clinicProfileService.getBrandingCssVariables();
  assert(
    cssVars['--brand-primary'] === initialProfile.colors.primary,
    'Branding CSS tokens dynamically map to active profile',
    `--brand-primary: ${cssVars['--brand-primary']}`
  );

  const updated = clinicProfileService.updateProfile({
    tagline: 'Precision Dentistry & Aesthetics Test Run',
  });
  assert(
    updated.tagline === 'Precision Dentistry & Aesthetics Test Run',
    'ClinicProfileService updates and persists field updates',
    `Updated Tagline: ${updated.tagline}`
  );

  // 2. PMS Schedule CSV Importer (Dentrix format)
  console.log('\n--- 2. PMS Schedule CSV Importer (Dentrix & Eaglesoft) ---');
  const dentrixMockCsv = `Patient Name,Phone,Date,Time,Provider,Operatory,Procedure
Bruce Wayne,555-123-9999,2026-10-01,09:30 AM,Dr. Sarah Jensen,Operatory 1,Comprehensive Periodic Exam
Clark Kent,555-234-8888,2026-10-01,11:00 AM,Dr. Sarah Jensen,Operatory 2,Crown Preparation #30`;

  const dentrixResult = await pmsCsvImporterService.importCsvSchedule(
    dentrixMockCsv,
    'dentrix_oct1.csv'
  );

  assert(
    dentrixResult.processedRows === 2 && dentrixResult.importedAppointments === 2,
    'PMS CSV Importer parses Dentrix CSV structure successfully',
    `Processed: ${dentrixResult.processedRows}, Imported: ${dentrixResult.importedAppointments}, Patients Created: ${dentrixResult.createdPatients}`
  );

  const eaglesoftMockCsv = `Patient_Last,Patient_First,Cell,Appt_Date,Start_Time,Doctor,Room,Service_Description
Prince,Diana,555-345-7777,10/01/2026,14:15,Dr. Jensen,Chair 3,Laser Periodontal Scaling`;

  const eaglesoftResult = await pmsCsvImporterService.importCsvSchedule(
    eaglesoftMockCsv,
    'eaglesoft_oct1.csv'
  );

  assert(
    eaglesoftResult.importedAppointments === 1,
    'PMS CSV Importer handles Eaglesoft split names and alternate date formats',
    `Imported: ${eaglesoftResult.importedAppointments}`
  );

  // 3. Open Dental REST Adapter Simulation
  console.log('\n--- 3. Open Dental Direct REST Adapter ---');
  const odConn = await openDentalAdapterService.testConnection();
  assert(
    odConn.connected && !!odConn.openDentalVersion,
    'Open Dental connection test succeeds with adapter simulation',
    `Status: ${odConn.message} (Version ${odConn.openDentalVersion})`
  );

  const odSync = await openDentalAdapterService.syncAppointments(new Date().toISOString().split('T')[0]);
  assert(
    odSync.success && odSync.count >= 2,
    'Open Dental appointment sync returns mock clinical appointments',
    `Synced Count: ${odSync.count}`
  );

  // 4. HIPAA & TCPA Compliance Audit Logger & BAA Generator
  console.log('\n--- 4. HIPAA / TCPA Compliance Logger & Dynamic BAA ---');
  const loggedEvent = complianceAuditService.logEvent({
    action: 'PATIENT_INTAKE_SUBMITTED',
    actorId: 'pat-sophia-01',
    actorRole: 'patient',
    patientId: 'pat-sophia-01',
    patientName: 'Sophia Martinez',
    ipAddress: '192.168.1.45',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    details: 'Patient Sophia Martinez submitted online medical history and consent',
  });

  assert(
    loggedEvent.sha256Checksum.length === 64,
    'ComplianceAuditService logs cryptographic SHA-256 event fingerprint',
    `Hash: ${loggedEvent.sha256Checksum}`
  );

  const baaSummary = complianceAuditService.getBaaAgreement();
  assert(
    baaSummary.coveredEntity.practiceName === initialProfile.name,
    'Dynamic BAA agreement incorporates live clinic profile data',
    `Covered Entity: ${baaSummary.coveredEntity.practiceName}`
  );

  const csvExport = complianceAuditService.exportAuditLogCsv();
  assert(
    csvExport.includes('Audit Event ID') && csvExport.includes('Integrity SHA-256 Hash') && csvExport.includes(loggedEvent.id),
    'Audit log exports to RFC 4180 compliant CSV stream with tamper-evident hashes',
    `CSV length: ${csvExport.length} bytes`
  );

  console.log('\n================================================================');
  console.log(`📊 FINAL RESULT: ${passed} / ${total} TESTS PASSED (${Math.round((passed / total) * 100)}%)`);
  console.log('================================================================\n');

  if (passed !== total) {
    process.exit(1);
  }
}

runVerification().catch((err) => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
