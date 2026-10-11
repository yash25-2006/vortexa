-- Schema for India Development Intelligence Platform
-- GDG Hackathon Project - Phase 1

CREATE TABLE IF NOT EXISTS development_requests (
    id SERIAL PRIMARY KEY,
    request_code VARCHAR(30) UNIQUE,
    original_text TEXT NOT NULL,
    language VARCHAR(50) DEFAULT 'Unknown',
    category VARCHAR(100) NOT NULL,
    issue VARCHAR(255) NOT NULL,
    urgency VARCHAR(50) NOT NULL,
    affected_group VARCHAR(255),
    location_details TEXT,
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),
    ai_summary TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'New',
    is_synthetic BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_dev_req_category ON development_requests(category);
CREATE INDEX IF NOT EXISTS idx_dev_req_urgency ON development_requests(urgency);
CREATE INDEX IF NOT EXISTS idx_dev_req_status ON development_requests(status);
CREATE INDEX IF NOT EXISTS idx_dev_req_created ON development_requests(created_at DESC);
