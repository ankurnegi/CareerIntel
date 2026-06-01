-- CareerIntel AI Relational Database Schema Blueprints
-- Engine: PostgreSQL 14+
-- Purpose: Strict type-safe schemas tracking user accounts, biometric verifications, target resumes, historical calibrations, and active vacancies.

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    last_uploaded_resume TEXT,
    normalized_target_role VARCHAR(150),
    active_sector_vectors VARCHAR(100)[] DEFAULT '{}',
    biometric_confidence NUMERIC(5,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE match_diagnostics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    overall_match_score INTEGER CHECK (overall_match_score BETWEEN 0 AND 100),
    ats_score INTEGER CHECK (ats_score BETWEEN 0 AND 100),
    market_demand INTEGER CHECK (market_demand BETWEEN 0 AND 100),
    confidence_interval INTEGER CHECK (confidence_interval BETWEEN 0 AND 100),
    salary_current NUMERIC(12,2),
    salary_min NUMERIC(12,2),
    salary_avg NUMERIC(12,2),
    salary_max NUMERIC(12,2),
    salary_percentile INTEGER CHECK (salary_percentile BETWEEN 0 AND 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE match_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    diagnostic_id UUID REFERENCES match_diagnostics(id) ON DELETE CASCADE,
    skill_name VARCHAR(100) NOT NULL,
    user_rating INTEGER CHECK (user_rating BETWEEN 0 AND 100),
    market_required INTEGER CHECK (market_required BETWEEN 0 AND 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE pivot_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    diagnostic_id UUID REFERENCES match_diagnostics(id) ON DELETE CASCADE,
    pivot_role VARCHAR(150) NOT NULL,
    match_likelihood VARCHAR(50) NOT NULL, -- e.g., 'High', 'Medium', 'Low'
    semantic_justification TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE active_vacancies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_title VARCHAR(150) NOT NULL,
    company_name VARCHAR(100) NOT NULL,
    location_desc VARCHAR(150),
    matching_score INTEGER NOT NULL CHECK (matching_score BETWEEN 0 AND 100),
    recruiter_sector VARCHAR(100) NOT NULL,
    critical_skills VARCHAR(100)[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    raw_text_specs TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action_type VARCHAR(100) NOT NULL,
    ip_profile VARCHAR(255),
    hardware_agent TEXT,
    biometrics_status VARCHAR(50) DEFAULT 'NOT_ATTEMPTED',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- CREATE INDEXES FOR FAST PERFORMANCE LOOKUPS
CREATE INDEX idx_user_profiles_user ON user_profiles(user_id);
CREATE INDEX idx_diagnostics_profile ON match_diagnostics(profile_id);
CREATE INDEX idx_skills_diag ON match_skills(diagnostic_id);
CREATE INDEX idx_vacancies_sector ON active_vacancies(recruiter_sector);
