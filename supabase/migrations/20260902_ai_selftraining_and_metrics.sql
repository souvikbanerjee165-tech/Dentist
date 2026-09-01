-- ============================================================================
-- AI Self-Training, Missed Revenue Radar & Executive Metrics Migration
-- ============================================================================

-- 1. AI Training & Improvement Queue
CREATE TABLE IF NOT EXISTS ai_training_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    frequency INT DEFAULT 1,
    suggested_answer TEXT,
    category VARCHAR(50) DEFAULT 'Insurance & Pricing',
    status VARCHAR(50) DEFAULT 'unanswered', -- 'unanswered', 'draft_ready', 'approved', 'rejected'
    source_conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
    last_asked_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_training_queue_status ON ai_training_queue(status);
CREATE INDEX IF NOT EXISTS idx_ai_training_queue_frequency ON ai_training_queue(frequency DESC);

-- 2. Missed Revenue & High-Ticket Opportunity Radar
CREATE TABLE IF NOT EXISTS missed_revenue_radar (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
    patient_name VARCHAR(255),
    patient_phone VARCHAR(50) NOT NULL,
    treatment_name VARCHAR(100) NOT NULL, -- 'Dental Implants', 'Emax Veneers', 'Clear Aligners'
    estimated_value NUMERIC(10,2) NOT NULL, -- e.g. 2800.00, 850.00
    status VARCHAR(50) DEFAULT 'unrecovered', -- 'unrecovered', 'vip_offer_sent', 'recovered', 'expired'
    last_inquiry_at TIMESTAMPTZ DEFAULT NOW(),
    vip_offer_sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_missed_revenue_status ON missed_revenue_radar(status);

-- 3. Daily Executive Briefing Metrics (8:00 AM Morning Snapshot)
CREATE TABLE IF NOT EXISTS daily_executive_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    metric_date DATE DEFAULT CURRENT_DATE,
    total_inquiries INT DEFAULT 0,
    appointments_booked INT DEFAULT 0,
    revenue_generated NUMERIC(10,2) DEFAULT 0.00,
    hours_saved NUMERIC(5,2) DEFAULT 0.00,
    accuracy_rate NUMERIC(4,1) DEFAULT 94.0,
    hallucinations_prevented INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(business_id, metric_date)
);
