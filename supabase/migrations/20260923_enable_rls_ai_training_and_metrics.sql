-- ==============================================================================
-- 🔒 SUPABASE PRODUCTION ROW LEVEL SECURITY (RLS) FOR AI & ANALYTICS TABLES
-- ==============================================================================

-- 1. Enable RLS on ai_training_queue, missed_revenue_radar, daily_executive_metrics
ALTER TABLE IF EXISTS ai_training_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS missed_revenue_radar ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS daily_executive_metrics ENABLE ROW LEVEL SECURITY;

-- 2. Drop any legacy open policies if they exist
DROP POLICY IF EXISTS "Service role has full access to ai_training_queue" ON ai_training_queue;
DROP POLICY IF EXISTS "Service role has full access to missed_revenue_radar" ON missed_revenue_radar;
DROP POLICY IF EXISTS "Service role has full access to daily_executive_metrics" ON daily_executive_metrics;

-- 3. Restrict all operations to backend service role (fail closed against anon/public)
CREATE POLICY "Service role full access on ai_training_queue"
  ON ai_training_queue
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access on missed_revenue_radar"
  ON missed_revenue_radar
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access on daily_executive_metrics"
  ON daily_executive_metrics
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
