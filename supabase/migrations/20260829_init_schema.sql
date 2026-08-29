-- ============================================================================
-- AI WhatsApp Sales Assistant - Database Schema & Vector Search Initialization
-- ============================================================================

-- 1. Enable pgvector extension for AI embeddings & semantic search
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Businesses (Multi-tenant accounts for clinics, gyms, real estate, etc.)
CREATE TABLE IF NOT EXISTS businesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    industry VARCHAR(100) NOT NULL, -- e.g., 'clinic', 'real_estate', 'gym', 'coach', 'agency'
    phone_number_id VARCHAR(100) UNIQUE, -- Meta WhatsApp Phone Number ID
    waba_id VARCHAR(100),                -- WhatsApp Business Account ID
    whatsapp_access_token TEXT,          -- Access token for WhatsApp API
    google_calendar_token JSONB,         -- OAuth credentials for Google Calendar
    default_calendar_id VARCHAR(255),
    system_prompt_template TEXT,         -- Custom business instructions for AI
    confidence_threshold NUMERIC(3,2) DEFAULT 0.70, -- Score below this triggers human handover
    notification_phone VARCHAR(50),      -- Owner's WhatsApp number for alerts
    notification_email VARCHAR(255),     -- Owner's email for alerts
    timezone VARCHAR(50) DEFAULT 'UTC',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Users (Business owners and staff members)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'owner', -- 'owner', 'manager', 'agent'
    full_name VARCHAR(255),
    email VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Document Chunks & Vector Store (RAG Knowledge Base)
CREATE TABLE IF NOT EXISTS document_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    document_name VARCHAR(255) NOT NULL,
    document_type VARCHAR(50), -- 'faq', 'pricing', 'services', 'policy'
    chunk_content TEXT NOT NULL,
    chunk_index INT NOT NULL,
    token_count INT NOT NULL,
    embedding VECTOR(1536), -- 1536-dimensional vector for OpenAI text-embedding-3-small
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fast Approximate Nearest Neighbor search index (HNSW)
CREATE INDEX IF NOT EXISTS idx_document_chunks_embedding 
ON document_chunks USING hnsw (embedding vector_cosine_ops);

-- 5. Leads (Captured Contacts / Prospects)
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    phone_number VARCHAR(50) NOT NULL,
    full_name VARCHAR(255),
    email VARCHAR(255),
    status VARCHAR(50) DEFAULT 'new', -- 'new', 'qualified', 'booked', 'unresponsive', 'lost'
    custom_data JSONB DEFAULT '{}',   -- Extracted details (budget, clinic symptoms, gym goals, etc.)
    last_interaction TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(business_id, phone_number)
);

-- 6. Conversations (WhatsApp Session & State Management)
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'ai_active', -- 'ai_active', 'human_takeover', 'closed'
    last_confidence_score NUMERIC(3,2),
    assigned_user_id UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Messages (Audit, Chat Log & AI Context History)
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_type VARCHAR(20) NOT NULL, -- 'user', 'ai', 'human_agent', 'system'
    content TEXT NOT NULL,
    whatsapp_message_id VARCHAR(150),
    confidence_score NUMERIC(3,2),
    tools_used JSONB,                 -- Log of function calls (e.g. check_calendar, book_slot)
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Appointments (Bookings)
CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    google_event_id VARCHAR(255),
    title VARCHAR(255) NOT NULL,
    service_type VARCHAR(100),
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    status VARCHAR(50) DEFAULT 'confirmed', -- 'confirmed', 'cancelled', 'rescheduled'
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- Vector Search Function: match_document_chunks
-- Used by the backend to fetch the most relevant knowledge base chunks for RAG
-- ============================================================================
CREATE OR REPLACE FUNCTION match_document_chunks (
    query_embedding VECTOR(1536),
    match_threshold FLOAT,
    match_count INT,
    filter_business_id UUID
)
RETURNS TABLE (
    id UUID,
    document_name VARCHAR,
    document_type VARCHAR,
    chunk_content TEXT,
    similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        dc.id,
        dc.document_name,
        dc.document_type,
        dc.chunk_content,
        1 - (dc.embedding <=> query_embedding) AS similarity
    FROM document_chunks dc
    WHERE dc.business_id = filter_business_id
      AND 1 - (dc.embedding <=> query_embedding) > match_threshold
    ORDER BY dc.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;
