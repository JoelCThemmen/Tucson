# Data Models & Database Schema
## Real Estate Investment Platform

### Version 2.0 - Real Estate Focus
### Date: September 2025

---

## 1. Database Overview

### 1.1 Database Strategy
- **Primary Database**: PostgreSQL 14+ with PostGIS for geographic data
- **Database per Service**: Logical separation using schemas
- **Shared Data**: Read-only views for cross-service access
- **Audit Trail**: Temporal tables for history tracking
- **Soft Deletes**: Logical deletion with deleted_at timestamps
- **Media Storage**: S3-compatible object storage with CDN

### 1.2 Schema Organization
```sql
-- Service-specific schemas
CREATE SCHEMA auth;
CREATE SCHEMA users;
CREATE SCHEMA properties;
CREATE SCHEMA investments;
CREATE SCHEMA financials;
CREATE SCHEMA renovations;
CREATE SCHEMA media;
CREATE SCHEMA market;
CREATE SCHEMA events;
CREATE SCHEMA documents;
CREATE SCHEMA communications;
CREATE SCHEMA analytics;

-- Shared views schema
CREATE SCHEMA shared;

-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pg_trgm; -- For fuzzy text search
```

---

## 2. Core Data Models

### 2.1 Authentication Schema

```sql
-- auth.users
CREATE TABLE auth.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    email_verified_at TIMESTAMP,
    phone VARCHAR(20),
    phone_verified BOOLEAN DEFAULT FALSE,
    phone_verified_at TIMESTAMP,
    password_hash VARCHAR(255) NOT NULL,
    mfa_enabled BOOLEAN DEFAULT FALSE,
    mfa_type VARCHAR(20), -- 'sms', 'authenticator', 'email'
    mfa_secret VARCHAR(255),
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'suspended', 'deleted'
    last_login_at TIMESTAMP,
    password_changed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_status (status),
    INDEX idx_last_login (last_login_at)
);

-- auth.sessions
CREATE TABLE auth.sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    token_hash VARCHAR(255) UNIQUE NOT NULL,
    refresh_token_hash VARCHAR(255) UNIQUE,
    ip_address INET,
    user_agent TEXT,
    device_id VARCHAR(100),
    device_type VARCHAR(20), -- 'web', 'ios', 'android'
    expires_at TIMESTAMP NOT NULL,
    refresh_expires_at TIMESTAMP,
    revoked_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    
    INDEX idx_user_sessions (user_id),
    INDEX idx_token (token_hash),
    INDEX idx_expires (expires_at)
);

-- auth.password_resets
CREATE TABLE auth.password_resets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    token_hash VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    
    INDEX idx_token (token_hash),
    INDEX idx_expires (expires_at)
);

-- auth.login_attempts
CREATE TABLE auth.login_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255),
    ip_address INET,
    success BOOLEAN,
    failure_reason VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW(),
    
    INDEX idx_email_attempts (email, created_at),
    INDEX idx_ip_attempts (ip_address, created_at)
);
```

### 2.2 User Profile Schema

```sql
-- users.profiles
CREATE TABLE users.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    display_name VARCHAR(200),
    avatar_url VARCHAR(500),
    bio TEXT,
    headline VARCHAR(200),
    company VARCHAR(200),
    position VARCHAR(200),
    location_city VARCHAR(100),
    location_state VARCHAR(50),
    location_country VARCHAR(50),
    timezone VARCHAR(50),
    linkedin_url VARCHAR(200),
    website_url VARCHAR(200),
    phone VARCHAR(20),
    date_of_birth DATE,
    
    -- Investment preferences
    investment_interests TEXT[],
    investment_range_min DECIMAL(15,2),
    investment_range_max DECIMAL(15,2),
    risk_tolerance VARCHAR(20), -- 'conservative', 'moderate', 'aggressive'
    investment_horizon VARCHAR(20), -- 'short', 'medium', 'long'
    sectors_of_interest TEXT[],
    
    -- Privacy settings
    profile_visibility VARCHAR(20) DEFAULT 'public', -- 'public', 'connections', 'private'
    show_email BOOLEAN DEFAULT FALSE,
    show_phone BOOLEAN DEFAULT FALSE,
    show_investments BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    profile_completed_at TIMESTAMP,
    profile_completion_score INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    INDEX idx_user_profile (user_id),
    INDEX idx_location (location_country, location_state, location_city),
    INDEX idx_sectors (sectors_of_interest),
    FULLTEXT idx_search (first_name, last_name, bio, headline)
);

-- users.verifications
CREATE TABLE users.verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    type VARCHAR(50) NOT NULL, -- 'accredited', 'kyc', 'aml', 'identity'
    status VARCHAR(20) NOT NULL, -- 'pending', 'approved', 'rejected', 'expired'
    method VARCHAR(50), -- 'income', 'net_worth', 'license', 'third_party'
    provider VARCHAR(50), -- 'jumio', 'onfido', 'manual'
    
    -- Verification details
    verification_data JSONB,
    documents JSONB,
    rejection_reason TEXT,
    expires_at TIMESTAMP,
    
    -- Audit
    submitted_at TIMESTAMP DEFAULT NOW(),
    reviewed_at TIMESTAMP,
    reviewed_by UUID,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    INDEX idx_user_verifications (user_id, type),
    INDEX idx_status (status),
    INDEX idx_expires (expires_at)
);

-- users.connections
CREATE TABLE users.connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_id UUID NOT NULL REFERENCES auth.users(id),
    recipient_id UUID NOT NULL REFERENCES auth.users(id),
    status VARCHAR(20) NOT NULL, -- 'pending', 'accepted', 'rejected', 'blocked'
    message TEXT,
    accepted_at TIMESTAMP,
    rejected_at TIMESTAMP,
    blocked_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(requester_id, recipient_id),
    INDEX idx_requester (requester_id, status),
    INDEX idx_recipient (recipient_id, status)
);

-- users.messages
CREATE TABLE users.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL,
    sender_id UUID NOT NULL REFERENCES auth.users(id),
    recipient_id UUID REFERENCES auth.users(id), -- NULL for group messages
    content TEXT NOT NULL,
    content_type VARCHAR(20) DEFAULT 'text', -- 'text', 'image', 'document'
    attachments JSONB,
    read_at TIMESTAMP,
    edited_at TIMESTAMP,
    deleted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    
    INDEX idx_conversation (conversation_id, created_at),
    INDEX idx_sender (sender_id),
    INDEX idx_recipient (recipient_id),
    INDEX idx_unread (recipient_id, read_at)
);

-- users.conversations
CREATE TABLE users.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(20) DEFAULT 'direct', -- 'direct', 'group'
    name VARCHAR(200), -- For group conversations
    participants UUID[],
    last_message_at TIMESTAMP,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    INDEX idx_participants (participants),
    INDEX idx_last_message (last_message_at DESC)
);
```

### 2.3 Properties Schema

```sql
-- properties.properties
CREATE TABLE properties.properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    property_type VARCHAR(50), -- 'multi_family', 'apartment_complex', 'mixed_use'
    
    -- Location
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(50) NOT NULL,
    zip_code VARCHAR(20) NOT NULL,
    country VARCHAR(50) DEFAULT 'USA',
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    location GEOGRAPHY(POINT, 4326), -- PostGIS point
    
    -- Property details
    year_built INTEGER,
    last_renovated INTEGER,
    total_units INTEGER NOT NULL,
    total_buildings INTEGER DEFAULT 1,
    total_sqft INTEGER,
    lot_size_acres DECIMAL(10, 4),
    parking_spaces INTEGER,
    
    -- Property class
    property_class VARCHAR(10), -- 'A', 'B', 'C', 'D'
    property_subtype VARCHAR(50), -- 'garden', 'mid_rise', 'high_rise'
    
    -- Financial overview
    purchase_price DECIMAL(15, 2),
    purchase_date DATE,
    current_valuation DECIMAL(15, 2),
    valuation_date DATE,
    target_irr DECIMAL(5, 2),
    target_cash_on_cash DECIMAL(5, 2),
    
    -- Operational status
    status VARCHAR(20) DEFAULT 'active', -- 'prospect', 'active', 'renovating', 'selling', 'sold'
    acquisition_status VARCHAR(20), -- 'evaluating', 'under_contract', 'owned'
    occupancy_rate DECIMAL(5, 2),
    
    -- Management
    management_company VARCHAR(255),
    property_manager_name VARCHAR(255),
    property_manager_phone VARCHAR(20),
    property_manager_email VARCHAR(255),
    
    -- Investment details
    investment_open BOOLEAN DEFAULT FALSE,
    minimum_investment DECIMAL(15, 2),
    maximum_investment DECIMAL(15, 2),
    target_raise DECIMAL(15, 2),
    amount_raised DECIMAL(15, 2) DEFAULT 0,
    investor_count INTEGER DEFAULT 0,
    
    -- Features and amenities
    amenities TEXT[],
    features JSONB,
    utilities_included TEXT[],
    pet_policy VARCHAR(255),
    
    -- Market data
    market_name VARCHAR(100),
    submarket_name VARCHAR(100),
    walk_score INTEGER,
    transit_score INTEGER,
    bike_score INTEGER,
    
    -- Metadata
    description TEXT,
    investment_thesis TEXT,
    executive_summary TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    INDEX idx_location (city, state),
    INDEX idx_status (status),
    INDEX idx_property_type (property_type),
    INDEX idx_investment_open (investment_open),
    INDEX idx_spatial (location),
    FULLTEXT idx_search (property_name, description, executive_summary)
);

-- properties.units
CREATE TABLE properties.units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties.properties(id),
    unit_number VARCHAR(20) NOT NULL,
    building_number VARCHAR(20),
    floor INTEGER,
    
    -- Unit details
    unit_type VARCHAR(50), -- 'studio', '1br', '2br', '3br', '4br'
    bedrooms INTEGER,
    bathrooms DECIMAL(3, 1),
    sqft INTEGER,
    
    -- Rental information
    current_rent DECIMAL(10, 2),
    market_rent DECIMAL(10, 2),
    last_rent_increase DATE,
    
    -- Occupancy
    occupancy_status VARCHAR(20), -- 'occupied', 'vacant', 'notice', 'renovation'
    lease_start_date DATE,
    lease_end_date DATE,
    move_in_date DATE,
    notice_date DATE,
    
    -- Condition
    condition_rating INTEGER, -- 1-5 scale
    last_inspection_date DATE,
    renovation_status VARCHAR(20), -- 'classic', 'renovated', 'in_progress'
    renovation_completed_date DATE,
    
    -- Features
    appliances TEXT[],
    flooring_type VARCHAR(50),
    has_balcony BOOLEAN DEFAULT FALSE,
    has_patio BOOLEAN DEFAULT FALSE,
    view_type VARCHAR(50),
    
    -- Metadata
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(property_id, unit_number),
    INDEX idx_property (property_id),
    INDEX idx_occupancy (occupancy_status),
    INDEX idx_unit_type (unit_type)
);

-- properties.floor_plans
CREATE TABLE properties.floor_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties.properties(id),
    name VARCHAR(100) NOT NULL,
    unit_type VARCHAR(50),
    bedrooms INTEGER,
    bathrooms DECIMAL(3, 1),
    sqft_min INTEGER,
    sqft_max INTEGER,
    
    -- Pricing
    base_rent DECIMAL(10, 2),
    market_rent DECIMAL(10, 2),
    
    -- Units
    total_units INTEGER,
    available_units INTEGER DEFAULT 0,
    
    -- Media
    floor_plan_image_url VARCHAR(500),
    floor_plan_3d_url VARCHAR(500),
    virtual_tour_url VARCHAR(500),
    
    -- Features
    features JSONB,
    appliances TEXT[],
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    INDEX idx_property (property_id),
    INDEX idx_unit_type (unit_type)
);

-- properties.comparable_properties
CREATE TABLE properties.comparable_properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties.properties(id),
    comp_name VARCHAR(255),
    comp_address VARCHAR(500),
    distance_miles DECIMAL(5, 2),
    
    -- Comp details
    total_units INTEGER,
    year_built INTEGER,
    property_class VARCHAR(10),
    
    -- Metrics
    occupancy_rate DECIMAL(5, 2),
    average_rent DECIMAL(10, 2),
    rent_per_sqft DECIMAL(10, 4),
    
    -- Source
    data_source VARCHAR(50), -- 'costar', 'reis', 'manual'
    last_updated DATE,
    
    created_at TIMESTAMP DEFAULT NOW(),
    
    INDEX idx_property (property_id)
);
```

### 2.4 Real Estate Investment Schema

```sql
-- investments.property_investments
CREATE TABLE investments.property_investments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties.properties(id),
    investor_id UUID NOT NULL REFERENCES auth.users(id),
    
    -- Investment details
    investment_amount DECIMAL(15, 2) NOT NULL,
    ownership_percentage DECIMAL(5, 4),
    share_class VARCHAR(50), -- 'common', 'preferred', 'class_a', 'class_b'
    
    -- Investment dates
    commitment_date DATE,
    funding_date DATE,
    expected_exit_date DATE,
    actual_exit_date DATE,
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'committed', 'funded', 'exited'
    
    -- Returns tracking
    total_distributions DECIMAL(15, 2) DEFAULT 0,
    total_returns DECIMAL(15, 2) DEFAULT 0,
    realized_gains DECIMAL(15, 2) DEFAULT 0,
    unrealized_gains DECIMAL(15, 2) DEFAULT 0,
    
    -- Documents
    subscription_agreement_url VARCHAR(500),
    operating_agreement_url VARCHAR(500),
    k1_documents JSONB,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(property_id, investor_id),
    INDEX idx_property (property_id),
    INDEX idx_investor (investor_id),
    INDEX idx_status (status)
);

-- investments.distributions
CREATE TABLE investments.distributions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties.properties(id),
    
    -- Distribution details
    distribution_type VARCHAR(50), -- 'monthly_income', 'quarterly', 'refinance', 'sale_proceeds'
    distribution_date DATE NOT NULL,
    total_amount DECIMAL(15, 2) NOT NULL,
    
    -- Per investor calculation
    per_unit_amount DECIMAL(10, 4),
    calculation_method VARCHAR(50), -- 'pro_rata', 'waterfall', 'preferred'
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'processing', 'completed'
    processed_date TIMESTAMP,
    
    -- Supporting data
    property_noi DECIMAL(15, 2),
    expense_ratio DECIMAL(5, 2),
    notes TEXT,
    
    created_at TIMESTAMP DEFAULT NOW(),
    
    INDEX idx_property (property_id),
    INDEX idx_distribution_date (distribution_date)
);

-- investments.investor_distributions
CREATE TABLE investments.investor_distributions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    distribution_id UUID NOT NULL REFERENCES investments.distributions(id),
    investor_id UUID NOT NULL REFERENCES auth.users(id),
    property_id UUID NOT NULL REFERENCES properties.properties(id),
    
    -- Distribution amounts
    distribution_amount DECIMAL(15, 2) NOT NULL,
    tax_withholding DECIMAL(15, 2) DEFAULT 0,
    net_distribution DECIMAL(15, 2) NOT NULL,
    
    -- Payment details
    payment_method VARCHAR(50), -- 'ach', 'wire', 'check'
    payment_reference VARCHAR(100),
    payment_date DATE,
    payment_status VARCHAR(20), -- 'pending', 'sent', 'completed'
    
    created_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(distribution_id, investor_id),
    INDEX idx_investor (investor_id),
    INDEX idx_distribution (distribution_id)
);

-- investments.investor_portfolios
CREATE TABLE investments.investor_portfolios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    investor_id UUID NOT NULL REFERENCES auth.users(id),
    
    -- Real estate portfolio metrics
    total_properties INTEGER DEFAULT 0,
    total_invested DECIMAL(15, 2) DEFAULT 0,
    current_value DECIMAL(15, 2) DEFAULT 0,
    total_distributions DECIMAL(15, 2) DEFAULT 0,
    
    -- Performance metrics
    weighted_avg_irr DECIMAL(5, 2),
    weighted_avg_cash_on_cash DECIMAL(5, 2),
    total_equity_multiple DECIMAL(5, 2),
    
    -- Geographic allocation
    allocation_by_state JSONB,
    allocation_by_city JSONB,
    
    -- Property type allocation
    allocation_by_property_type JSONB,
    allocation_by_property_class JSONB,
    
    -- Metadata
    last_calculated_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(investor_id),
    INDEX idx_investor (investor_id)
);
```

### 2.5 Property Financials Schema

```sql
-- financials.property_income
CREATE TABLE financials.property_income (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties.properties(id),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    
    -- Rental income
    gross_rental_income DECIMAL(15, 2),
    vacancy_loss DECIMAL(15, 2),
    concessions DECIMAL(15, 2),
    effective_rental_income DECIMAL(15, 2),
    
    -- Other income
    parking_income DECIMAL(15, 2),
    laundry_income DECIMAL(15, 2),
    pet_income DECIMAL(15, 2),
    application_fees DECIMAL(15, 2),
    late_fees DECIMAL(15, 2),
    other_income DECIMAL(15, 2),
    
    -- Totals
    total_income DECIMAL(15, 2),
    
    created_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(property_id, period_start, period_end),
    INDEX idx_property (property_id),
    INDEX idx_period (period_start, period_end)
);

-- financials.property_expenses
CREATE TABLE financials.property_expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties.properties(id),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    
    -- Operating expenses
    property_management DECIMAL(15, 2),
    maintenance_repairs DECIMAL(15, 2),
    utilities DECIMAL(15, 2),
    insurance DECIMAL(15, 2),
    property_taxes DECIMAL(15, 2),
    payroll DECIMAL(15, 2),
    advertising DECIMAL(15, 2),
    legal_professional DECIMAL(15, 2),
    landscaping DECIMAL(15, 2),
    
    -- Capital expenses
    capital_improvements DECIMAL(15, 2),
    
    -- Debt service
    mortgage_principal DECIMAL(15, 2),
    mortgage_interest DECIMAL(15, 2),
    
    -- Totals
    total_operating_expenses DECIMAL(15, 2),
    total_expenses DECIMAL(15, 2),
    
    created_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(property_id, period_start, period_end),
    INDEX idx_property (property_id),
    INDEX idx_period (period_start, period_end)
);

-- financials.property_performance
CREATE TABLE financials.property_performance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties.properties(id),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    period_type VARCHAR(20), -- 'monthly', 'quarterly', 'annual'
    
    -- Key metrics
    noi DECIMAL(15, 2),
    cap_rate DECIMAL(5, 2),
    cash_on_cash_return DECIMAL(5, 2),
    debt_service_coverage DECIMAL(5, 2),
    
    -- Occupancy metrics
    occupancy_rate DECIMAL(5, 2),
    average_rent DECIMAL(10, 2),
    rent_per_sqft DECIMAL(10, 4),
    
    -- Collections
    rent_collected DECIMAL(15, 2),
    collection_rate DECIMAL(5, 2),
    delinquency_rate DECIMAL(5, 2),
    
    created_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(property_id, period_start, period_end),
    INDEX idx_property (property_id),
    INDEX idx_period (period_start, period_end)
);

-- financials.rent_roll
CREATE TABLE financials.rent_roll (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties.properties(id),
    unit_id UUID NOT NULL REFERENCES properties.units(id),
    as_of_date DATE NOT NULL,
    
    -- Tenant info
    tenant_name VARCHAR(255),
    lease_start DATE,
    lease_end DATE,
    
    -- Rent details
    monthly_rent DECIMAL(10, 2),
    security_deposit DECIMAL(10, 2),
    
    -- Payment status
    current_balance DECIMAL(10, 2),
    days_delinquent INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT NOW(),
    
    INDEX idx_property (property_id),
    INDEX idx_unit (unit_id),
    INDEX idx_date (as_of_date)
);
```

### 2.6 Renovations Schema

```sql
-- renovations.projects
CREATE TABLE renovations.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties.properties(id),
    project_name VARCHAR(255) NOT NULL,
    project_type VARCHAR(50), -- 'value_add', 'maintenance', 'capital_improvement'
    
    -- Timeline
    planned_start_date DATE,
    actual_start_date DATE,
    planned_end_date DATE,
    actual_end_date DATE,
    
    -- Budget
    estimated_cost DECIMAL(15, 2),
    approved_budget DECIMAL(15, 2),
    actual_cost DECIMAL(15, 2),
    
    -- Scope
    scope_description TEXT,
    units_affected INTEGER,
    common_areas_affected TEXT[],
    
    -- Status
    status VARCHAR(20) DEFAULT 'planning', -- 'planning', 'approved', 'in_progress', 'completed'
    completion_percentage INTEGER DEFAULT 0,
    
    -- ROI
    projected_noi_increase DECIMAL(15, 2),
    projected_rent_increase DECIMAL(10, 2),
    actual_noi_increase DECIMAL(15, 2),
    actual_rent_increase DECIMAL(10, 2),
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    INDEX idx_property (property_id),
    INDEX idx_status (status)
);

-- renovations.unit_renovations
CREATE TABLE renovations.unit_renovations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES renovations.projects(id),
    unit_id UUID NOT NULL REFERENCES properties.units(id),
    
    -- Scope
    renovation_scope TEXT[],
    
    -- Timeline
    start_date DATE,
    end_date DATE,
    days_vacant INTEGER,
    
    -- Costs
    budgeted_cost DECIMAL(10, 2),
    actual_cost DECIMAL(10, 2),
    
    -- Rent impact
    pre_renovation_rent DECIMAL(10, 2),
    post_renovation_rent DECIMAL(10, 2),
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'in_progress', 'completed'
    
    created_at TIMESTAMP DEFAULT NOW(),
    
    INDEX idx_project (project_id),
    INDEX idx_unit (unit_id)
);

-- renovations.progress_updates
CREATE TABLE renovations.progress_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES renovations.projects(id),
    update_date DATE NOT NULL,
    
    -- Progress
    completion_percentage INTEGER,
    units_completed INTEGER,
    
    -- Budget
    spent_to_date DECIMAL(15, 2),
    
    -- Issues
    issues_encountered TEXT,
    change_orders JSONB,
    
    -- Media
    photo_urls TEXT[],
    video_url VARCHAR(500),
    
    -- Notes
    contractor_notes TEXT,
    manager_notes TEXT,
    
    created_at TIMESTAMP DEFAULT NOW(),
    
    INDEX idx_project (project_id),
    INDEX idx_date (update_date)
);
```

### 2.7 Media Schema

```sql
-- media.property_photos
CREATE TABLE media.property_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties.properties(id),
    unit_id UUID REFERENCES properties.units(id),
    
    -- Photo details
    file_name VARCHAR(255),
    file_url VARCHAR(500),
    cdn_url VARCHAR(500),
    thumbnail_url VARCHAR(500),
    
    -- Metadata
    photo_type VARCHAR(50), -- 'exterior', 'interior', 'amenity', 'unit', 'aerial'
    category VARCHAR(50), -- 'hero', 'gallery', 'floorplan', 'renovation'
    caption TEXT,
    tags TEXT[],
    
    -- Technical
    width INTEGER,
    height INTEGER,
    file_size INTEGER,
    mime_type VARCHAR(50),
    
    -- Ordering
    display_order INTEGER,
    is_primary BOOLEAN DEFAULT FALSE,
    
    -- Status
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'archived'
    
    created_at TIMESTAMP DEFAULT NOW(),
    
    INDEX idx_property (property_id),
    INDEX idx_unit (unit_id),
    INDEX idx_type (photo_type),
    INDEX idx_order (display_order)
);

-- media.property_videos
CREATE TABLE media.property_videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties.properties(id),
    
    -- Video details
    title VARCHAR(255),
    description TEXT,
    file_url VARCHAR(500),
    streaming_url VARCHAR(500),
    thumbnail_url VARCHAR(500),
    
    -- Type
    video_type VARCHAR(50), -- 'walkthrough', 'aerial', 'testimonial', 'update'
    duration_seconds INTEGER,
    
    -- Technical
    resolution VARCHAR(20),
    file_size INTEGER,
    
    -- Status
    status VARCHAR(20) DEFAULT 'processing', -- 'processing', 'active', 'archived'
    
    created_at TIMESTAMP DEFAULT NOW(),
    
    INDEX idx_property (property_id),
    INDEX idx_type (video_type)
);

-- media.virtual_tours
CREATE TABLE media.virtual_tours (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties.properties(id),
    floor_plan_id UUID REFERENCES properties.floor_plans(id),
    
    -- Tour details
    tour_type VARCHAR(50), -- 'matterport', '360_photos', 'video'
    tour_url VARCHAR(500),
    embed_code TEXT,
    
    -- Matterport specific
    matterport_id VARCHAR(100),
    matterport_sdk_key VARCHAR(100),
    
    -- Features
    has_measurements BOOLEAN DEFAULT FALSE,
    has_floor_plan BOOLEAN DEFAULT FALSE,
    has_dollhouse BOOLEAN DEFAULT FALSE,
    
    -- Analytics
    view_count INTEGER DEFAULT 0,
    avg_view_duration INTEGER,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    INDEX idx_property (property_id)
);
```

### 2.8 Market Data Schema

```sql
-- market.market_areas
CREATE TABLE market.market_areas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    market_name VARCHAR(100) NOT NULL,
    state VARCHAR(50),
    metro_area VARCHAR(100),
    
    -- Demographics
    population INTEGER,
    population_growth_rate DECIMAL(5, 2),
    median_household_income DECIMAL(10, 2),
    unemployment_rate DECIMAL(5, 2),
    
    -- Housing metrics
    median_home_price DECIMAL(15, 2),
    median_rent DECIMAL(10, 2),
    vacancy_rate DECIMAL(5, 2),
    
    -- Last updated
    data_date DATE,
    data_source VARCHAR(50),
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(market_name, state),
    INDEX idx_market (market_name)
);

-- market.property_valuations
CREATE TABLE market.property_valuations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties.properties(id),
    valuation_date DATE NOT NULL,
    
    -- Valuation details
    valuation_type VARCHAR(50), -- 'appraisal', 'bpo', 'automated', 'internal'
    valuation_amount DECIMAL(15, 2),
    
    -- Method details
    valuation_method VARCHAR(50), -- 'income', 'sales_comp', 'cost'
    cap_rate_used DECIMAL(5, 2),
    
    -- Supporting data
    noi_used DECIMAL(15, 2),
    comparable_sales JSONB,
    
    -- Professional details
    appraiser_name VARCHAR(255),
    appraiser_license VARCHAR(100),
    report_url VARCHAR(500),
    
    created_at TIMESTAMP DEFAULT NOW(),
    
    INDEX idx_property (property_id),
    INDEX idx_date (valuation_date)
);

-- investments.transactions
CREATE TABLE investments.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    investor_id UUID NOT NULL REFERENCES auth.users(id),
    investment_id UUID REFERENCES investments.investments(id),
    
    -- Transaction details
    type VARCHAR(50) NOT NULL, -- 'investment', 'distribution', 'fee', 'return_of_capital'
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    
    -- Reference
    reference_number VARCHAR(100),
    description TEXT,
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'completed', 'failed'
    completed_at TIMESTAMP,
    
    -- Metadata
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    
    INDEX idx_investor (investor_id),
    INDEX idx_investment (investment_id),
    INDEX idx_type (type),
    INDEX idx_created (created_at DESC)
);

-- investments.distributions
CREATE TABLE investments.distributions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    opportunity_id UUID NOT NULL REFERENCES investments.opportunities(id),
    
    -- Distribution details
    type VARCHAR(50), -- 'dividend', 'interest', 'return_of_capital', 'capital_gain'
    total_amount DECIMAL(15,2) NOT NULL,
    per_share_amount DECIMAL(10,4),
    
    -- Dates
    record_date DATE,
    payment_date DATE,
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'processing', 'completed'
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    processed_at TIMESTAMP,
    
    INDEX idx_opportunity (opportunity_id),
    INDEX idx_payment_date (payment_date)
);

-- investments.statements
CREATE TABLE investments.statements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    investor_id UUID NOT NULL REFERENCES auth.users(id),
    
    -- Statement details
    type VARCHAR(20), -- 'monthly', 'quarterly', 'annual', 'tax'
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    
    -- Content
    summary JSONB,
    transactions JSONB,
    holdings JSONB,
    performance JSONB,
    
    -- Document
    document_url VARCHAR(500),
    document_hash VARCHAR(64), -- SHA-256 hash for integrity
    
    -- Status
    status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'final', 'sent'
    sent_at TIMESTAMP,
    viewed_at TIMESTAMP,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    
    INDEX idx_investor (investor_id),
    INDEX idx_period (period_start, period_end),
    UNIQUE(investor_id, type, period_start, period_end)
);
```

### 2.4 Events Schema

```sql
-- events.events
CREATE TABLE events.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    
    -- Event details
    type VARCHAR(50), -- 'webinar', 'conference', 'meetup', 'summit'
    format VARCHAR(20), -- 'virtual', 'in_person', 'hybrid'
    
    -- Schedule
    start_datetime TIMESTAMP NOT NULL,
    end_datetime TIMESTAMP NOT NULL,
    timezone VARCHAR(50),
    
    -- Location (for in-person)
    venue_name VARCHAR(200),
    venue_address TEXT,
    venue_city VARCHAR(100),
    venue_state VARCHAR(50),
    venue_country VARCHAR(50),
    venue_coordinates POINT,
    
    -- Virtual details
    virtual_platform VARCHAR(50), -- 'zoom', 'teams', 'custom'
    virtual_url VARCHAR(500),
    virtual_meeting_id VARCHAR(100),
    virtual_passcode VARCHAR(50),
    
    -- Capacity
    max_attendees INTEGER,
    current_attendees INTEGER DEFAULT 0,
    waitlist_enabled BOOLEAN DEFAULT FALSE,
    
    -- Registration
    registration_required BOOLEAN DEFAULT TRUE,
    registration_deadline TIMESTAMP,
    registration_fee DECIMAL(10,2),
    
    -- Content
    agenda JSONB,
    speakers JSONB,
    materials JSONB,
    recording_url VARCHAR(500),
    
    -- Status
    status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'published', 'cancelled', 'completed'
    visibility VARCHAR(20) DEFAULT 'public', -- 'public', 'private', 'invited'
    
    -- Metadata
    created_by UUID,
    published_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    INDEX idx_start_date (start_datetime),
    INDEX idx_type (type),
    INDEX idx_status (status),
    FULLTEXT idx_search (title, description)
);

-- events.registrations
CREATE TABLE events.registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events.events(id),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    
    -- Registration details
    status VARCHAR(20) DEFAULT 'registered', -- 'registered', 'waitlisted', 'cancelled'
    registration_type VARCHAR(20), -- 'attendee', 'speaker', 'sponsor'
    
    -- Payment
    payment_status VARCHAR(20), -- 'pending', 'paid', 'refunded'
    payment_amount DECIMAL(10,2),
    payment_reference VARCHAR(100),
    
    -- Attendance
    checked_in BOOLEAN DEFAULT FALSE,
    checked_in_at TIMESTAMP,
    check_in_method VARCHAR(20), -- 'qr_code', 'manual', 'virtual'
    
    -- Virtual attendance
    joined_at TIMESTAMP,
    left_at TIMESTAMP,
    attendance_duration INTEGER, -- in minutes
    
    -- Metadata
    notes TEXT,
    dietary_requirements TEXT,
    special_requirements TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    cancelled_at TIMESTAMP,
    
    UNIQUE(event_id, user_id),
    INDEX idx_event (event_id, status),
    INDEX idx_user (user_id),
    INDEX idx_status (status)
);

-- events.event_interactions
CREATE TABLE events.event_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events.events(id),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    registration_id UUID REFERENCES events.registrations(id),
    
    -- Interaction type
    type VARCHAR(50), -- 'question', 'poll_response', 'chat_message', 'reaction'
    content TEXT,
    metadata JSONB,
    
    -- Timestamp
    created_at TIMESTAMP DEFAULT NOW(),
    
    INDEX idx_event (event_id),
    INDEX idx_user (user_id),
    INDEX idx_type (type)
);
```

### 2.5 Documents Schema

```sql
-- documents.documents
CREATE TABLE documents.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES auth.users(id),
    
    -- Document details
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50), -- 'contract', 'report', 'presentation', 'tax_form'
    category VARCHAR(50), -- 'investment', 'legal', 'financial', 'marketing'
    
    -- File details
    file_name VARCHAR(255),
    file_size INTEGER,
    file_type VARCHAR(50),
    file_hash VARCHAR(64), -- SHA-256
    storage_url VARCHAR(500),
    
    -- Versioning
    version INTEGER DEFAULT 1,
    parent_document_id UUID REFERENCES documents.documents(id),
    is_latest_version BOOLEAN DEFAULT TRUE,
    
    -- Access control
    visibility VARCHAR(20) DEFAULT 'private', -- 'public', 'private', 'shared'
    requires_signature BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    description TEXT,
    tags TEXT[],
    metadata JSONB,
    
    -- Timestamps
    uploaded_at TIMESTAMP DEFAULT NOW(),
    modified_at TIMESTAMP,
    deleted_at TIMESTAMP,
    
    INDEX idx_owner (owner_id),
    INDEX idx_type (type),
    INDEX idx_category (category),
    INDEX idx_tags (tags),
    FULLTEXT idx_search (name, description)
);

-- documents.document_shares
CREATE TABLE documents.document_shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES documents.documents(id),
    shared_by UUID NOT NULL REFERENCES auth.users(id),
    shared_with UUID NOT NULL REFERENCES auth.users(id),
    
    -- Permissions
    can_view BOOLEAN DEFAULT TRUE,
    can_download BOOLEAN DEFAULT FALSE,
    can_edit BOOLEAN DEFAULT FALSE,
    can_share BOOLEAN DEFAULT FALSE,
    
    -- Expiration
    expires_at TIMESTAMP,
    
    -- Access tracking
    accessed_at TIMESTAMP,
    access_count INTEGER DEFAULT 0,
    
    -- Metadata
    shared_at TIMESTAMP DEFAULT NOW(),
    revoked_at TIMESTAMP,
    
    UNIQUE(document_id, shared_with),
    INDEX idx_document (document_id),
    INDEX idx_shared_with (shared_with)
);

-- documents.signatures
CREATE TABLE documents.signatures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES documents.documents(id),
    signer_id UUID NOT NULL REFERENCES auth.users(id),
    
    -- Signature details
    signature_type VARCHAR(20), -- 'electronic', 'digital'
    signature_data TEXT,
    signature_image_url VARCHAR(500),
    
    -- Verification
    ip_address INET,
    user_agent TEXT,
    verification_method VARCHAR(50), -- 'email', 'sms', 'id_verification'
    verification_data JSONB,
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'signed', 'declined'
    
    -- Timestamps
    requested_at TIMESTAMP DEFAULT NOW(),
    signed_at TIMESTAMP,
    declined_at TIMESTAMP,
    
    UNIQUE(document_id, signer_id),
    INDEX idx_document (document_id),
    INDEX idx_signer (signer_id),
    INDEX idx_status (status)
);
```

### 2.6 Communications Schema

```sql
-- communications.email_campaigns
CREATE TABLE communications.email_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    
    -- Content
    html_content TEXT,
    text_content TEXT,
    template_id UUID,
    
    -- Targeting
    recipient_filter JSONB,
    recipient_count INTEGER,
    
    -- Schedule
    scheduled_at TIMESTAMP,
    sent_at TIMESTAMP,
    
    -- Status
    status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'scheduled', 'sending', 'sent'
    
    -- Metrics
    sent_count INTEGER DEFAULT 0,
    open_count INTEGER DEFAULT 0,
    click_count INTEGER DEFAULT 0,
    bounce_count INTEGER DEFAULT 0,
    unsubscribe_count INTEGER DEFAULT 0,
    
    -- Metadata
    created_by UUID,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    INDEX idx_status (status),
    INDEX idx_scheduled (scheduled_at)
);

-- communications.email_sends
CREATE TABLE communications.email_sends (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES communications.email_campaigns(id),
    recipient_id UUID NOT NULL REFERENCES auth.users(id),
    
    -- Send details
    to_email VARCHAR(255) NOT NULL,
    from_email VARCHAR(255) NOT NULL,
    subject VARCHAR(255),
    
    -- Status
    status VARCHAR(20), -- 'pending', 'sent', 'delivered', 'bounced', 'failed'
    
    -- Tracking
    sent_at TIMESTAMP,
    delivered_at TIMESTAMP,
    opened_at TIMESTAMP,
    clicked_at TIMESTAMP,
    bounced_at TIMESTAMP,
    unsubscribed_at TIMESTAMP,
    
    -- Error handling
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    
    -- Provider details
    provider VARCHAR(50), -- 'sendgrid', 'ses'
    provider_message_id VARCHAR(255),
    
    INDEX idx_campaign (campaign_id),
    INDEX idx_recipient (recipient_id),
    INDEX idx_status (status)
);

-- communications.notifications
CREATE TABLE communications.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    
    -- Notification details
    type VARCHAR(50), -- 'investment_update', 'event_reminder', 'connection_request'
    title VARCHAR(255),
    message TEXT,
    
    -- Delivery channels
    channels TEXT[], -- ['email', 'sms', 'push', 'in_app']
    
    -- Status
    read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    
    -- Action
    action_type VARCHAR(50), -- 'view_investment', 'accept_connection'
    action_url VARCHAR(500),
    action_data JSONB,
    
    -- Metadata
    priority VARCHAR(20) DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    
    INDEX idx_user (user_id, read),
    INDEX idx_type (type),
    INDEX idx_created (created_at DESC)
);
```

### 2.7 Analytics Schema

```sql
-- analytics.user_events
CREATE TABLE analytics.user_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    session_id UUID,
    
    -- Event details
    event_name VARCHAR(100) NOT NULL,
    event_category VARCHAR(50),
    event_action VARCHAR(50),
    event_label VARCHAR(100),
    event_value DECIMAL(10,2),
    
    -- Context
    page_url VARCHAR(500),
    referrer_url VARCHAR(500),
    user_agent TEXT,
    ip_address INET,
    
    -- Device info
    device_type VARCHAR(20),
    os VARCHAR(50),
    browser VARCHAR(50),
    screen_resolution VARCHAR(20),
    
    -- Geo info
    country VARCHAR(50),
    region VARCHAR(50),
    city VARCHAR(50),
    
    -- Metadata
    properties JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    
    INDEX idx_user (user_id),
    INDEX idx_event (event_name),
    INDEX idx_created (created_at),
    INDEX idx_session (session_id)
);

-- analytics.page_views
CREATE TABLE analytics.page_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    session_id UUID,
    
    -- Page details
    page_path VARCHAR(500),
    page_title VARCHAR(255),
    
    -- Timing
    time_on_page INTEGER, -- seconds
    bounce BOOLEAN DEFAULT FALSE,
    
    -- Entry/exit
    is_entrance BOOLEAN DEFAULT FALSE,
    is_exit BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    
    INDEX idx_user (user_id),
    INDEX idx_path (page_path),
    INDEX idx_session (session_id)
);

-- analytics.investment_funnel
CREATE TABLE analytics.investment_funnel (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    opportunity_id UUID NOT NULL REFERENCES investments.opportunities(id),
    
    -- Funnel stages
    viewed_at TIMESTAMP,
    clicked_details_at TIMESTAMP,
    downloaded_docs_at TIMESTAMP,
    expressed_interest_at TIMESTAMP,
    committed_at TIMESTAMP,
    funded_at TIMESTAMP,
    
    -- Drop-off point
    drop_off_stage VARCHAR(50),
    drop_off_at TIMESTAMP,
    
    -- Metadata
    source VARCHAR(50), -- 'email', 'platform', 'referral'
    created_at TIMESTAMP DEFAULT NOW(),
    
    INDEX idx_user (user_id),
    INDEX idx_opportunity (opportunity_id)
);
```

---

## 3. Relationships and Constraints

### 3.1 Foreign Key Relationships

```sql
-- User relationships
ALTER TABLE users.profiles 
    ADD CONSTRAINT fk_profile_user 
    FOREIGN KEY (user_id) 
    REFERENCES auth.users(id) 
    ON DELETE CASCADE;

ALTER TABLE users.verifications 
    ADD CONSTRAINT fk_verification_user 
    FOREIGN KEY (user_id) 
    REFERENCES auth.users(id) 
    ON DELETE CASCADE;

-- Investment relationships
ALTER TABLE investments.investments 
    ADD CONSTRAINT fk_investment_investor 
    FOREIGN KEY (investor_id) 
    REFERENCES auth.users(id);

ALTER TABLE investments.investments 
    ADD CONSTRAINT fk_investment_opportunity 
    FOREIGN KEY (opportunity_id) 
    REFERENCES investments.opportunities(id);

-- Event relationships
ALTER TABLE events.registrations 
    ADD CONSTRAINT fk_registration_event 
    FOREIGN KEY (event_id) 
    REFERENCES events.events(id) 
    ON DELETE CASCADE;

ALTER TABLE events.registrations 
    ADD CONSTRAINT fk_registration_user 
    FOREIGN KEY (user_id) 
    REFERENCES auth.users(id);
```

### 3.2 Check Constraints

```sql
-- Investment constraints
ALTER TABLE investments.opportunities 
    ADD CONSTRAINT chk_investment_amounts 
    CHECK (minimum_investment <= maximum_investment);

ALTER TABLE investments.opportunities 
    ADD CONSTRAINT chk_dates 
    CHECK (open_date <= close_date);

-- User constraints
ALTER TABLE users.profiles 
    ADD CONSTRAINT chk_investment_range 
    CHECK (investment_range_min <= investment_range_max);

-- Event constraints
ALTER TABLE events.events 
    ADD CONSTRAINT chk_event_times 
    CHECK (start_datetime < end_datetime);

ALTER TABLE events.registrations 
    ADD CONSTRAINT chk_attendance_times 
    CHECK (joined_at <= left_at);
```

### 3.3 Unique Constraints

```sql
-- Ensure unique connections
ALTER TABLE users.connections 
    ADD CONSTRAINT uk_unique_connection 
    UNIQUE (requester_id, recipient_id);

-- Ensure unique registrations
ALTER TABLE events.registrations 
    ADD CONSTRAINT uk_unique_registration 
    UNIQUE (event_id, user_id);

-- Ensure unique document shares
ALTER TABLE documents.document_shares 
    ADD CONSTRAINT uk_unique_share 
    UNIQUE (document_id, shared_with);
```

---

## 4. Indexes and Performance

### 4.1 Performance Indexes

```sql
-- Composite indexes for common queries
CREATE INDEX idx_active_opportunities 
    ON investments.opportunities(status, open_date) 
    WHERE status = 'open';

CREATE INDEX idx_user_investments 
    ON investments.investments(investor_id, status, created_at DESC);

CREATE INDEX idx_upcoming_events 
    ON events.events(start_datetime, status) 
    WHERE status = 'published' AND start_datetime > NOW();

CREATE INDEX idx_unread_messages 
    ON users.messages(recipient_id, read_at) 
    WHERE read_at IS NULL;

-- Partial indexes for filtered queries
CREATE INDEX idx_verified_users 
    ON users.verifications(user_id) 
    WHERE status = 'approved' AND type = 'accredited';

CREATE INDEX idx_pending_investments 
    ON investments.investments(opportunity_id) 
    WHERE status = 'pending';
```

### 4.2 Full-Text Search Indexes

```sql
-- PostgreSQL full-text search
CREATE INDEX idx_profile_search 
    ON users.profiles 
    USING gin(to_tsvector('english', 
        coalesce(first_name, '') || ' ' || 
        coalesce(last_name, '') || ' ' || 
        coalesce(bio, '') || ' ' || 
        coalesce(headline, '')
    ));

CREATE INDEX idx_opportunity_search 
    ON investments.opportunities 
    USING gin(to_tsvector('english', 
        coalesce(name, '') || ' ' || 
        coalesce(description, '') || ' ' || 
        coalesce(executive_summary, '')
    ));
```

---

## 5. Views and Materialized Views

### 5.1 Shared Views

```sql
-- Investor summary view
CREATE VIEW shared.investor_summary AS
SELECT 
    u.id,
    u.email,
    p.first_name,
    p.last_name,
    p.company,
    p.location_city,
    p.location_state,
    v.status as verification_status,
    port.total_invested,
    port.total_value,
    COUNT(DISTINCT i.id) as investment_count
FROM auth.users u
LEFT JOIN users.profiles p ON u.id = p.user_id
LEFT JOIN users.verifications v ON u.id = v.user_id AND v.type = 'accredited'
LEFT JOIN investments.portfolios port ON u.id = port.investor_id
LEFT JOIN investments.investments i ON u.id = i.investor_id
GROUP BY u.id, u.email, p.first_name, p.last_name, p.company, 
         p.location_city, p.location_state, v.status, 
         port.total_invested, port.total_value;

-- Active opportunities view
CREATE VIEW shared.active_opportunities AS
SELECT 
    o.*,
    COUNT(DISTINCT i.investor_id) as investor_count,
    SUM(i.amount) as total_raised,
    (o.target_raise - COALESCE(SUM(i.amount), 0)) as remaining_amount
FROM investments.opportunities o
LEFT JOIN investments.investments i ON o.id = i.opportunity_id 
    AND i.status = 'funded'
WHERE o.status = 'open' 
    AND o.close_date >= CURRENT_DATE
GROUP BY o.id;
```

### 5.2 Materialized Views for Performance

```sql
-- Portfolio performance materialized view
CREATE MATERIALIZED VIEW analytics.portfolio_performance AS
SELECT 
    p.investor_id,
    p.total_invested,
    p.total_value,
    p.total_returns,
    p.irr,
    p.multiple,
    COUNT(DISTINCT i.opportunity_id) as investment_count,
    AVG(DATE_PART('day', NOW() - i.created_at)) as avg_holding_period
FROM investments.portfolios p
JOIN investments.investments i ON p.investor_id = i.investor_id
WHERE i.status = 'funded'
GROUP BY p.investor_id, p.total_invested, p.total_value, 
         p.total_returns, p.irr, p.multiple;

-- Refresh strategy
CREATE INDEX idx_portfolio_performance_investor 
    ON analytics.portfolio_performance(investor_id);

-- Schedule refresh every hour
-- REFRESH MATERIALIZED VIEW CONCURRENTLY analytics.portfolio_performance;
```

---

## 6. Triggers and Functions

### 6.1 Audit Triggers

```sql
-- Generic audit function
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        NEW.created_at = NOW();
        NEW.updated_at = NOW();
    ELSIF TG_OP = 'UPDATE' THEN
        NEW.updated_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables
CREATE TRIGGER audit_trigger
BEFORE INSERT OR UPDATE ON users.profiles
FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
```

### 6.2 Business Logic Triggers

```sql
-- Update portfolio on new investment
CREATE OR REPLACE FUNCTION update_portfolio_on_investment()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'funded' AND OLD.status != 'funded' THEN
        UPDATE investments.portfolios
        SET 
            total_invested = total_invested + NEW.amount,
            updated_at = NOW()
        WHERE investor_id = NEW.investor_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER investment_portfolio_trigger
AFTER UPDATE ON investments.investments
FOR EACH ROW EXECUTE FUNCTION update_portfolio_on_investment();

-- Update opportunity metrics
CREATE OR REPLACE FUNCTION update_opportunity_metrics()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE investments.opportunities
    SET 
        amount_raised = (
            SELECT COALESCE(SUM(amount), 0)
            FROM investments.investments
            WHERE opportunity_id = NEW.opportunity_id
            AND status = 'funded'
        ),
        investor_count = (
            SELECT COUNT(DISTINCT investor_id)
            FROM investments.investments
            WHERE opportunity_id = NEW.opportunity_id
            AND status = 'funded'
        )
    WHERE id = NEW.opportunity_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER opportunity_metrics_trigger
AFTER INSERT OR UPDATE ON investments.investments
FOR EACH ROW EXECUTE FUNCTION update_opportunity_metrics();
```

---

## 7. Data Migration Strategy

### 7.1 Migration Approach
1. Schema-first migrations using tools like Flyway or Liquibase
2. Version control for all migration scripts
3. Rollback procedures for each migration
4. Data validation after each migration

### 7.2 Migration Script Example

```sql
-- Migration: V001__initial_schema.sql
BEGIN;

-- Create schemas
CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS users;
CREATE SCHEMA IF NOT EXISTS investments;

-- Create tables
-- ... (all CREATE TABLE statements)

-- Create indexes
-- ... (all CREATE INDEX statements)

-- Insert initial data
INSERT INTO auth.users (email, password_hash, status)
VALUES ('admin@platform.com', '$2b$10$...', 'active');

COMMIT;

-- Rollback: V001__initial_schema_rollback.sql
BEGIN;
DROP SCHEMA IF EXISTS auth CASCADE;
DROP SCHEMA IF EXISTS users CASCADE;
DROP SCHEMA IF EXISTS investments CASCADE;
COMMIT;
```

---

## 8. Data Retention and Archival

### 8.1 Retention Policies

```sql
-- Archive old analytics data
CREATE TABLE analytics.user_events_archive (LIKE analytics.user_events);

-- Move data older than 1 year
INSERT INTO analytics.user_events_archive
SELECT * FROM analytics.user_events
WHERE created_at < NOW() - INTERVAL '1 year';

DELETE FROM analytics.user_events
WHERE created_at < NOW() - INTERVAL '1 year';
```

### 8.2 Soft Delete Implementation

```sql
-- Soft delete function
CREATE OR REPLACE FUNCTION soft_delete()
RETURNS TRIGGER AS $$
BEGIN
    NEW.deleted_at = NOW();
    NEW.status = 'deleted';
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to users table
CREATE TRIGGER soft_delete_user
BEFORE DELETE ON auth.users
FOR EACH ROW EXECUTE FUNCTION soft_delete();
```

---

## Appendices

### A. Naming Conventions
- **Tables**: snake_case, plural (e.g., `users`, `investments`)
- **Columns**: snake_case (e.g., `first_name`, `created_at`)
- **Indexes**: idx_table_column (e.g., `idx_users_email`)
- **Foreign Keys**: fk_table_reference (e.g., `fk_investment_user`)
- **Constraints**: chk_description (e.g., `chk_positive_amount`)

### B. Data Types Guide
- **IDs**: UUID for all primary keys
- **Money**: DECIMAL(15,2) for amounts
- **Percentages**: DECIMAL(5,4) for rates
- **Timestamps**: TIMESTAMP for all dates/times
- **Status**: VARCHAR(20) with check constraints
- **JSON**: JSONB for flexible structured data

### C. Performance Considerations
- Index foreign keys
- Use partial indexes for filtered queries
- Consider table partitioning for large tables
- Regular VACUUM and ANALYZE
- Monitor slow queries with pg_stat_statements