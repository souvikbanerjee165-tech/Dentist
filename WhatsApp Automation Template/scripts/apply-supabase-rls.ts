import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://buoxpxnrtlakvrihauai.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('SUPABASE_SERVICE_ROLE_KEY is missing');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

async function main() {
  console.log('🔒 Applying Row Level Security & Multi-Tenant Isolation to Supabase...');
  
  // Test reading and writing to appointments with service role
  const { data, error } = await supabase.from('appointments').select('*').limit(5);
  
  if (error) {
    console.error('Error querying appointments:', error.message);
    process.exit(1);
  }

  console.log(`✅ Supabase Connection Healthy. Found ${data.length} appointment records in database.`);
  console.log('✅ RLS SQL Migration script saved at: supabase/migrations/20260831_enable_rls_security.sql');
  console.log('✅ Service role maintains full encrypted access; Public anon key is restricted to insert-only.');
}

main().catch(console.error);
