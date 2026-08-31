-- ==============================================================================
-- 🔒 SUPABASE PRODUCTION ROW LEVEL SECURITY (RLS) & MULTI-TENANT ISOLATION
-- ==============================================================================

-- 1. Enable RLS on all tables
ALTER TABLE IF EXISTS businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS document_chunks ENABLE ROW LEVEL SECURITY;

-- 2. Drop any legacy open policies if they exist
DROP POLICY IF EXISTS "Service role has full access to businesses" ON businesses;
DROP POLICY IF EXISTS "Service role has full access to appointments" ON appointments;
DROP POLICY IF EXISTS "Public can create appointments" ON appointments;
DROP POLICY IF EXISTS "Service role has full access to leads" ON leads;
DROP POLICY IF EXISTS "Public can create leads" ON leads;
DROP POLICY IF EXISTS "Service role has full access to conversations" ON conversations;
DROP POLICY IF EXISTS "Service role has full access to messages" ON messages;
DROP POLICY IF EXISTS "Service role has full access to document_chunks" ON document_chunks;

-- 3. APPOINTMENTS POLICIES
-- Service Role (Backend AI Engine) has full administrative access
CREATE POLICY "Service role full access on appointments"
  ON appointments
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Public Website Intake: Patients can INSERT their appointment safely (cannot SELECT other rows)
CREATE POLICY "Public intake can insert appointments"
  ON appointments
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- 4. LEADS POLICIES
CREATE POLICY "Service role full access on leads"
  ON leads
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public intake can insert leads"
  ON leads
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- 5. CONVERSATIONS & MESSAGES POLICIES
CREATE POLICY "Service role full access on conversations"
  ON conversations
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access on messages"
  ON messages
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 6. BUSINESSES & KNOWLEDGE CHUNKS POLICIES
CREATE POLICY "Service role full access on businesses"
  ON businesses
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access on document_chunks"
  ON document_chunks
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
