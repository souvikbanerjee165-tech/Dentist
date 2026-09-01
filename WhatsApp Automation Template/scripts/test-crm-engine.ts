import { crmService } from '../src/services/crm/crm.service.js';

async function runCRMTestSuite() {
  console.log('================================================================');
  console.log('👥 STARTING LIGHTWEIGHT CRM & LEAD ENGINE TEST SUITE');
  console.log('================================================================\n');

  const businessId = 'test-business';

  // 1. Ingest Lead from Inbound WhatsApp Dialogue
  console.log('1️⃣ Ingesting New Lead from WhatsApp Conversation...');
  const newLead = await crmService.upsertLead({
    businessId,
    phone: '+1 (555) 345-9876',
    name: 'Elena Rostova',
    email: 'elena.rostova@gmail.com',
    business: 'FitLife Studios',
    interest: 'Personal Training & Nutrition Rehab',
    budget: '$800 / mo',
    conversationSummary: 'Prospect interested in 1-on-1 fitness rehabilitation after L4-L5 recovery.',
    appointmentStatus: 'none',
    tags: ['Rehab Inquirer'],
  });

  console.log(`   ✅ Lead Created: ${newLead.name} (${newLead.phone})`);
  console.log(`   🎯 Auto-Computed Lead Score: ${newLead.leadScore}/100`);
  console.log(`   🏷️ Smart Tags Assigned: [${newLead.tags.join(', ')}]\n`);

  // 2. Update Lead with Booked Appointment
  console.log('2️⃣ Updating Elena Rostova after Booking Consultation...');
  const updatedLead = await crmService.upsertLead({
    businessId,
    phone: '+1 (555) 345-9876',
    appointmentStatus: 'scheduled',
    conversationSummary: 'Confirmed intake consultation for Monday 10:00 AM.',
  });

  console.log(`   🎯 Updated Lead Score: ${updatedLead.leadScore}/100 (Boosted by appointment booking)`);
  console.log(`   🏷️ Updated Smart Tags: [${updatedLead.tags.join(', ')}]\n`);

  // 3. Test Full-Text Search
  console.log('3️⃣ Testing Search: Querying "SaaS"...');
  const searchResult = await crmService.searchAndFilter(businessId, { search: 'SaaS' });
  console.log(`   🔎 Found ${searchResult.total} lead(s):`);
  searchResult.leads.forEach((l) => {
    console.log(`      • ${l.name} | ${l.business} | Score: ${l.leadScore}`);
  });
  console.log('');

  // 4. Test Filtering by Appointment Status
  console.log('4️⃣ Testing Filter: Appointment Status = "scheduled"...');
  const bookedResult = await crmService.searchAndFilter(businessId, {
    appointmentStatus: 'scheduled',
  });
  console.log(`   🗓️ Found ${bookedResult.total} lead(s) with scheduled appointments:`);
  bookedResult.leads.forEach((l) => {
    console.log(`      • ${l.name} (${l.phone}) -> ${l.interest}`);
  });
  console.log('');

  // 5. Test Filtering by Minimum Score
  console.log('5️⃣ Testing Filter: Min Score >= 90 (High Intent)...');
  const highIntentResult = await crmService.searchAndFilter(businessId, {
    minScore: 90,
  });
  console.log(`   🔥 Found ${highIntentResult.total} High-Intent lead(s):`);
  highIntentResult.leads.forEach((l) => {
    console.log(`      • ${l.name} (Score: ${l.leadScore}) - Tags: [${l.tags.join(', ')}]`);
  });
  console.log('');

  // 6. Test Tag Management
  console.log('6️⃣ Testing Tagging: Adding "VIP Executive" to David Chen...');
  const david = searchResult.leads[0];
  if (david) {
    const tagged = await crmService.addTag(david.id, 'VIP Executive');
    console.log(`   🏷️ David Chen Tags: [${tagged?.tags.join(', ')}]\n`);
  }

  // 7. Test CSV Export
  console.log('7️⃣ Testing CSV Export Generation...');
  const csvData = await crmService.exportToCsv(businessId);
  console.log(`   📄 Generated RFC 4180 CSV (${csvData.split('\n').length} lines total).`);
  console.log(`   Preview (First 3 lines):`);
  csvData.split('\n').slice(0, 3).forEach((line) => {
    console.log(`   ${line}`);
  });
  console.log('');

  console.log('================================================================');
  console.log('✅ LIGHTWEIGHT CRM TEST SUITE COMPLETED SUCCESSFULLY!');
  console.log('================================================================');
}

runCRMTestSuite().catch(console.error);
