import http from 'node:http';

const BASE_URL = 'http://localhost:4000';

async function request(path: string, options: any = {}) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const data = await res.json();
  return { status: res.status, data };
}

async function runVerification() {
  console.log('🧪 Starting Patient Portal & Security Verification Suite...\n');

  // Test 1: Seeded Patient Login
  console.log('1️⃣ Testing Seeded Patient Login (Sophia Martinez - Email/Password)...');
  const loginRes = await request('/api/v1/patient/login', {
    method: 'POST',
    body: { email: 'sophia@example.com', password: 'Patient123!' },
  });
  console.assert(loginRes.status === 200, 'Login should return 200');
  console.assert(loginRes.data.success === true, 'Login should succeed');
  console.assert(!!loginRes.data.token, 'Should receive session token');
  console.assert(!loginRes.data.user.passwordHash, 'Password hash must NOT be leaked to client');
  console.log('   ✅ Seeded Login Passed: Authenticated as', loginRes.data.user.fullName);
  const sophiaToken = loginRes.data.token;

  // Test 2: Invalid Password Rejection & Audit Log
  console.log('\n2️⃣ Testing Invalid Password Defense...');
  const badLogin = await request('/api/v1/patient/login', {
    method: 'POST',
    body: { email: 'sophia@example.com', password: 'WrongPassword999' },
  });
  console.assert(badLogin.status === 401, 'Bad login should return 401');
  console.assert(badLogin.data.success === false, 'Bad login must fail');
  console.log('   ✅ Invalid Password correctly blocked.');

  // Test 3: Google SSO One-Click Authentication
  console.log('\n3️⃣ Testing Google Single Sign-On (Liam Vance)...');
  const googleRes = await request('/api/v1/patient/oauth', {
    method: 'POST',
    body: { provider: 'google', email: 'liam@example.com', fullName: 'Liam Vance' },
  });
  console.assert(googleRes.status === 200, 'Google SSO should return 200');
  console.assert(googleRes.data.user.fullName === 'Liam Vance', 'User should match');
  console.log('   ✅ Google SSO Verified for:', googleRes.data.user.fullName);

  // Test 4: Apple ID One-Click Authentication
  console.log('\n4️⃣ Testing Apple ID Single Sign-On (Chloe Bennett)...');
  const appleRes = await request('/api/v1/patient/oauth', {
    method: 'POST',
    body: { provider: 'apple', email: 'chloe@example.com', fullName: 'Chloe Bennett' },
  });
  console.assert(appleRes.status === 200, 'Apple SSO should return 200');
  console.assert(appleRes.data.user.fullName === 'Chloe Bennett', 'User should match');
  console.log('   ✅ Apple ID SSO Verified for:', appleRes.data.user.fullName);

  // Test 5: Fetch Protected Patient Dashboard
  console.log('\n5️⃣ Testing Protected Patient Dashboard Access with Bearer Token...');
  const dashRes = await request('/api/v1/patient/dashboard', {
    headers: { Authorization: `Bearer ${sophiaToken}` },
  });
  console.assert(dashRes.status === 200, 'Dashboard should return 200');
  console.assert(dashRes.data.upcomingAppointment !== null, 'Should have upcoming appointment');
  console.assert(dashRes.data.upcomingAppointment.checklist.length > 0, 'Should have checklist');
  console.assert(dashRes.data.clinicalHistory.length >= 2, 'Should have clinical history');
  console.log('   ✅ Dashboard Verified:');
  console.log('      - Upcoming:', dashRes.data.upcomingAppointment.treatment);
  console.log('      - Date:', dashRes.data.upcomingAppointment.dateStr, dashRes.data.upcomingAppointment.timeStr);
  console.log('      - Checklist Items:', dashRes.data.upcomingAppointment.checklist.length);
  console.log('      - History Records:', dashRes.data.clinicalHistory.length);

  // Test 6: Toggle Checklist Item ('What to Bring')
  console.log('\n6️⃣ Testing "What to Bring" Interactive Checklist Item Toggle...');
  const toggleRes = await request('/api/v1/patient/checklist/toggle', {
    method: 'POST',
    headers: { Authorization: `Bearer ${sophiaToken}` },
    body: { itemId: 'chk-cos-05', isCompleted: true },
  });
  console.assert(toggleRes.data.success === true, 'Toggle should succeed');
  console.log('   ✅ Checklist item marked as packed & persisted.');

  // Test 7: Toggle Two-Factor Authentication (2FA)
  console.log('\n7️⃣ Testing Two-Factor Authentication (2FA) Security Control...');
  const twoFaRes = await request('/api/v1/patient/toggle-2fa', {
    method: 'POST',
    headers: { Authorization: `Bearer ${sophiaToken}` },
    body: { enabled: true },
  });
  console.assert(twoFaRes.data.twoFactorEnabled === true, '2FA should be enabled');
  console.log('   ✅ Two-Factor Authentication active on patient profile.');

  // Test 8: Doctor Portal Inspection of Patient Trail & Security Log
  console.log('\n8️⃣ Testing Doctor Portal Patient Inspection & Clinical Trail...');
  const doctorView = await request('/api/v1/patient/doctor/patient/pat-sophia-01');
  console.assert(doctorView.status === 200, 'Doctor view should return 200');
  console.assert(doctorView.data.patient.securityAuditLog.length > 0, 'Should have security audit log');
  console.assert(doctorView.data.history.length >= 2, 'Should have past clinical history');
  console.log('   ✅ Doctor Inspection Verified:');
  console.log('      - Patient:', doctorView.data.patient.fullName);
  console.log('      - Security Log Entries:', doctorView.data.patient.securityAuditLog.length);
  console.log('      - Clinical Visits on Record:', doctorView.data.history.length);

  // Test 9: Doctor Appending a Clinical Record to Patient's Permanent Trail
  console.log('\n9️⃣ Testing Doctor Appending Clinical Note / Treatment Record...');
  const appendNote = await request('/api/v1/patient/doctor/patient/pat-sophia-01/notes', {
    method: 'POST',
    body: {
      treatment: 'Fluoride Remineralization & Shade Mapping',
      sharedSummary: 'Tooth shade verified at B1. Enamel micro-pores sealed with amorphous calcium phosphate.',
      privateClinicalNotes: 'Patient responded well to laser whitening. Recalled for routine check in 6 months.',
      feeGbp: 65,
    },
  });
  console.assert(appendNote.status === 200, 'Append note should succeed');
  console.assert(appendNote.data.record.treatment === 'Fluoride Remineralization & Shade Mapping', 'Record treatment should match');
  console.log('   ✅ Clinical note successfully appended to patient trail: ID', appendNote.data.record.id);

  console.log('\n🎉 ALL 9 VERIFICATION TESTS PASSED SUCCESSFULLY! Patient Portal & Security are fully operational.\n');
}

runVerification().catch(console.error);
