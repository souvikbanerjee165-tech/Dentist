import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const url = process.env.SUPABASE_URL || '';
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

console.log('================================================================');
console.log('⚡ TESTING LIVE SUPABASE CONNECTION & APPOINTMENT STORAGE');
console.log('================================================================\n');
console.log(`🔗 Connecting to: ${url}`);

const supabase = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function testLiveSupabase() {
  // Exact columns matching your Supabase table:
  // 1. customer_name
  // 2. customer_phone
  // 3. treatment
  // 4. appointment_time
  const sampleAppointment = {
    customer_name: 'Sophia Martinez',
    customer_phone: '+1 (555) 234-5678',
    customer_email: 'sophia.m@example.com',
    treatment: 'Cosmetic Laser Teeth Whitening',
    appointment_time: new Date('2026-09-04T15:00:00.000Z').toISOString(),
    status: 'confirmed',
    notes: 'Booked via AI WhatsApp Sales Assistant',
  };

  console.log('1️⃣ Inserting sample patient appointment into Supabase...');
  console.log(JSON.stringify(sampleAppointment, null, 2));

  const { data: insertData, error: insertError } = await supabase
    .from('appointments')
    .insert([sampleAppointment])
    .select();

  if (insertError) {
    console.error('\n❌ Supabase Insert Error:', insertError.message);
    return;
  }

  console.log('\n✅ SUCCESS: Appointment record created in Supabase!');
  console.log('Inserted Row:', insertData);

  // 2. Query back from Supabase
  console.log('\n2️⃣ Querying back all stored appointments from Supabase...');
  const { data: queryData, error: queryError } = await supabase
    .from('appointments')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  if (queryError) {
    console.error('Query Error:', queryError.message);
    return;
  }

  console.log(`\n🎉 Found ${queryData?.length || 0} appointment record(s) in your live Supabase database:\n`);
  queryData?.forEach((row: any, i: number) => {
    console.log(`   [Row ${i + 1}]`);
    console.log(`   👤 Name:        ${row.customer_name || row.title}`);
    console.log(`   📞 Phone:       ${row.customer_phone || 'N/A'}`);
    console.log(`   🦷 Treatment:   ${row.treatment || row.service_type}`);
    console.log(`   🗓️ Appointment: ${row.appointment_time || row.start_time}`);
    console.log(`   📌 Status:      ${row.status}`);
    console.log('   -----------------------------------------------------');
  });

  console.log('\n================================================================');
  console.log('🏆 LIVE SUPABASE INTEGRATION IS 100% CONNECTED & WORKING!');
  console.log('================================================================');
}

testLiveSupabase().catch(console.error);
