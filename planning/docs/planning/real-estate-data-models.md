# Real Estate Data Models & Database Schema
## Property Investment Platform

### Version 2.0 - Real Estate Focus
### Date: September 2025

---

## 1. Database Overview

### 1.1 Schema Organization
```sql
-- Real Estate Specific Schemas
CREATE SCHEMA properties;      -- Property and unit data
CREATE SCHEMA investments;     -- Investment and ownership data
CREATE SCHEMA financials;      -- Financial performance data
CREATE SCHEMA renovations;     -- Renovation and maintenance data
CREATE SCHEMA analytics;       -- Analytics and reporting
CREATE SCHEMA media;          -- Photos, videos, documents
CREATE SCHEMA auth;           -- Authentication and users
CREATE SCHEMA communications; -- Updates and notifications
```

---

## 2. Property Management Schema

### 2.1 Properties Table
```sql
-- properties.properties
CREATE TABLE properties.properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Basic Information
    property_name VARCHAR(255) NOT NULL,
    property_slug VARCHAR(255) UNIQUE NOT NULL,
    property_type VARCHAR(50) NOT NULL, -- 'apartment', 'townhome', 'mixed_use', 'senior_living'
    property_class VARCHAR(1), -- 'A', 'B', 'C', 'D'
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'under_contract', 'renovating', 'sold'
    
    -- Address Information
    street_address VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(2) NOT NULL,
    zip_code VARCHAR(10) NOT NULL,
    county VARCHAR(100),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    -- Physical Characteristics
    year_built INTEGER,
    year_renovated INTEGER,
    total_units INTEGER NOT NULL,
    total_buildings INTEGER DEFAULT 1,
    total_sqft INTEGER,
    lot_size_acres DECIMAL(10, 2),
    parking_spaces INTEGER,
    parking_type VARCHAR(50), -- 'surface', 'covered', 'garage'
    
    -- Financial Information
    purchase_price DECIMAL(15, 2),
    purchase_date DATE,
    current_valuation DECIMAL(15, 2),
    valuation_date DATE,
    target_irr DECIMAL(5, 2),
    target_multiple DECIMAL(5, 2),
    target_hold_period INTEGER, -- in months
    
    -- Amenities (JSONB for flexibility)
    amenities JSONB, -- {pool: true, gym: true, laundry: 'in-unit', etc}
    
    -- Property Management
    management_company VARCHAR(255),
    property_manager_name VARCHAR(255),
    property_manager_email VARCHAR(255),
    property_manager_phone VARCHAR(20),
    
    -- Investment Status
    investment_status VARCHAR(50) DEFAULT 'open', -- 'open', 'funded', 'closed'
    target_raise_amount DECIMAL(15, 2),
    minimum_investment DECIMAL(15, 2),
    maximum_investment DECIMAL(15, 2),
    amount_raised DECIMAL(15, 2) DEFAULT 0,
    investor_count INTEGER DEFAULT 0,
    
    -- Documents and Media
    featured_image_url VARCHAR(500),
    virtual_tour_url VARCHAR(500),
    property_website VARCHAR(500),
    
    -- Market Data
    market_name VARCHAR(100),
    submarket_name VARCHAR(100),
    msa VARCHAR(100), -- Metropolitan Statistical Area
    walk_score INTEGER,
    transit_score INTEGER,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    
    -- Indexes
    INDEX idx_property_status (status),
    INDEX idx_property_location (state, city),
    INDEX idx_property_type (property_type),
    INDEX idx_investment_status (investment_status),
    FULLTEXT idx_property_search (property_name, street_address, city)
);

-- properties.units
CREATE TABLE properties.units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties.properties(id) ON DELETE CASCADE,
    
    -- Unit Identification
    unit_number VARCHAR(20) NOT NULL,
    building_number VARCHAR(20),
    floor INTEGER,
    
    -- Unit Specifications
    unit_type VARCHAR(50), -- 'studio', '1bed1bath', '2bed2bath', etc
    bedrooms INTEGER NOT NULL,
    bathrooms DECIMAL(3, 1) NOT NULL,
    square_feet INTEGER,
    
    -- Rental Information
    market_rent DECIMAL(10, 2),
    current_rent DECIMAL(10, 2),
    deposit_amount DECIMAL(10, 2),
    
    -- Occupancy Status
    occupancy_status VARCHAR(50) DEFAULT 'vacant', -- 'occupied', 'vacant', 'maintenance', 'reserved'
    lease_start_date DATE,
    lease_end_date DATE,
    days_vacant INTEGER DEFAULT 0,
    
    -- Tenant Information (anonymized)
    tenant_id UUID, -- Reference to anonymized tenant record
    tenant_move_in_date DATE,
    
    -- Unit Condition
    condition_status VARCHAR(50), -- 'excellent', 'good', 'fair', 'needs_renovation'
    last_renovated_date DATE,
    renovation_status VARCHAR(50), -- 'not_needed', 'planned', 'in_progress', 'completed'
    
    -- Features
    features JSONB, -- {appliances: ['dishwasher', 'washer'], flooring: 'hardwood', etc}
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Constraints and Indexes
    UNIQUE(property_id, unit_number),
    INDEX idx_unit_property (property_id),
    INDEX idx_unit_occupancy (occupancy_status),
    INDEX idx_unit_type (unit_type)
);

-- properties.amenities
CREATE TABLE properties.amenities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties.properties(id) ON DELETE CASCADE,
    
    -- Amenity Details
    amenity_type VARCHAR(50) NOT NULL, -- 'pool', 'gym', 'clubhouse', 'playground', etc
    amenity_name VARCHAR(255),
    description TEXT,
    location VARCHAR(100), -- 'building_1', 'central', 'rooftop'
    
    -- Availability
    is_active BOOLEAN DEFAULT TRUE,
    hours_of_operation VARCHAR(255),
    requires_reservation BOOLEAN DEFAULT FALSE,
    additional_fee DECIMAL(10, 2),
    
    -- Condition
    condition VARCHAR(50), -- 'excellent', 'good', 'fair', 'needs_repair'
    last_maintenance_date DATE,
    next_maintenance_date DATE,
    
    -- Media
    photo_urls JSONB,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    INDEX idx_amenity_property (property_id),
    INDEX idx_amenity_type (amenity_type)
);
```

### 2.2 Property Analytics
```sql
-- properties.property_metrics
CREATE TABLE properties.property_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties.properties(id),
    metric_date DATE NOT NULL,
    
    -- Occupancy Metrics
    total_units INTEGER,
    occupied_units INTEGER,
    occupancy_rate DECIMAL(5, 2),
    leased_units INTEGER,
    leased_rate DECIMAL(5, 2),
    
    -- Financial Metrics
    potential_rent DECIMAL(15, 2), -- If 100% occupied at market rent
    actual_rent DECIMAL(15, 2),
    effective_rent DECIMAL(15, 2), -- After concessions
    average_rent_per_unit DECIMAL(10, 2),
    average_rent_per_sqft DECIMAL(10, 2),
    
    -- Operating Metrics
    noi DECIMAL(15, 2), -- Net Operating Income
    noi_margin DECIMAL(5, 2),
    operating_expenses DECIMAL(15, 2),
    expense_ratio DECIMAL(5, 2),
    cap_rate DECIMAL(5, 2),
    
    -- Collection Metrics
    rent_collected DECIMAL(15, 2),
    collection_rate DECIMAL(5, 2),
    delinquency_amount DECIMAL(15, 2),
    delinquency_rate DECIMAL(5, 2),
    
    -- Turnover Metrics
    units_turned INTEGER,
    turnover_rate DECIMAL(5, 2),
    average_days_to_lease INTEGER,
    average_turnover_cost DECIMAL(10, 2),
    
    -- Market Comparison
    market_occupancy DECIMAL(5, 2),
    market_average_rent DECIMAL(10, 2),
    rent_to_market_ratio DECIMAL(5, 2),
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(property_id, metric_date),
    INDEX idx_metrics_property_date (property_id, metric_date DESC)
);

-- properties.rent_roll
CREATE TABLE properties.rent_roll (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties.properties(id),
    unit_id UUID NOT NULL REFERENCES properties.units(id),
    as_of_date DATE NOT NULL,
    
    -- Tenant Info (anonymized)
    tenant_code VARCHAR(50), -- Anonymized identifier
    
    -- Lease Terms
    lease_start_date DATE,
    lease_end_date DATE,
    lease_term_months INTEGER,
    
    -- Rent Information
    base_rent DECIMAL(10, 2),
    additional_rent DECIMAL(10, 2), -- Utilities, parking, etc
    total_rent DECIMAL(10, 2),
    market_rent DECIMAL(10, 2),
    rent_variance DECIMAL(10, 2), -- Actual vs Market
    
    -- Payments
    current_month_paid BOOLEAN DEFAULT FALSE,
    payment_date DATE,
    balance_due DECIMAL(10, 2),
    
    -- Status
    status VARCHAR(50), -- 'current', 'notice_given', 'mtm', 'eviction'
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(property_id, unit_id, as_of_date),
    INDEX idx_rent_roll_property_date (property_id, as_of_date DESC)
);
```

---

## 3. Financial Schema

### 3.1 Property Financials
```sql
-- financials.property_income
CREATE TABLE financials.property_income (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties.properties(id),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    
    -- Rental Income
    gross_potential_rent DECIMAL(15, 2),
    vacancy_loss DECIMAL(15, 2),
    concessions DECIMAL(15, 2),
    net_rental_income DECIMAL(15, 2),
    
    -- Other Income
    application_fees DECIMAL(15, 2),
    late_fees DECIMAL(15, 2),
    parking_income DECIMAL(15, 2),
    laundry_income DECIMAL(15, 2),
    pet_fees DECIMAL(15, 2),
    other_income DECIMAL(15, 2),
    
    -- Total Income
    total_income DECIMAL(15, 2),
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(property_id, period_start, period_end),
    INDEX idx_income_property_period (property_id, period_start DESC)
);

-- financials.property_expenses
CREATE TABLE financials.property_expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties.properties(id),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    
    -- Operating Expenses
    property_management DECIMAL(15, 2),
    maintenance_repairs DECIMAL(15, 2),
    utilities DECIMAL(15, 2),
    insurance DECIMAL(15, 2),
    property_taxes DECIMAL(15, 2),
    
    -- Administrative
    advertising_marketing DECIMAL(15, 2),
    legal_professional DECIMAL(15, 2),
    administrative DECIMAL(15, 2),
    
    -- Payroll
    payroll_benefits DECIMAL(15, 2),
    contract_services DECIMAL(15, 2),
    
    -- Other
    landscaping DECIMAL(15, 2),
    pest_control DECIMAL(15, 2),
    trash_removal DECIMAL(15, 2),
    security DECIMAL(15, 2),
    other_expenses DECIMAL(15, 2),
    
    -- Capital Expenses
    capital_improvements DECIMAL(15, 2),
    
    -- Total Expenses
    total_operating_expenses DECIMAL(15, 2),
    total_expenses DECIMAL(15, 2),
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(property_id, period_start, period_end),
    INDEX idx_expenses_property_period (property_id, period_start DESC)
);

-- financials.property_performance
CREATE TABLE financials.property_performance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties.properties(id),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    
    -- Income Statement
    total_income DECIMAL(15, 2),
    total_operating_expenses DECIMAL(15, 2),
    net_operating_income DECIMAL(15, 2),
    
    -- Debt Service
    mortgage_principal DECIMAL(15, 2),
    mortgage_interest DECIMAL(15, 2),
    total_debt_service DECIMAL(15, 2),
    
    -- Cash Flow
    cash_flow_before_tax DECIMAL(15, 2),
    tax_expense DECIMAL(15, 2),
    cash_flow_after_tax DECIMAL(15, 2),
    
    -- Returns
    cash_on_cash_return DECIMAL(5, 2),
    cap_rate DECIMAL(5, 2),
    
    -- Distributions
    distribution_amount DECIMAL(15, 2),
    distribution_per_unit DECIMAL(10, 2),
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(property_id, period_start, period_end),
    INDEX idx_performance_property_period (property_id, period_start DESC)
);
```

---

## 4. Investment Schema

### 4.1 Investment Tracking
```sql
-- investments.property_investments
CREATE TABLE investments.property_investments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    investor_id UUID NOT NULL REFERENCES auth.users(id),
    property_id UUID NOT NULL REFERENCES properties.properties(id),
    
    -- Investment Details
    investment_amount DECIMAL(15, 2) NOT NULL,
    investment_date DATE NOT NULL,
    ownership_percentage DECIMAL(5, 4),
    share_class VARCHAR(50), -- 'common', 'preferred'
    
    -- Status
    status VARCHAR(50) DEFAULT 'active', -- 'pending', 'active', 'exited'
    
    -- Exit Information
    exit_date DATE,
    exit_amount DECIMAL(15, 2),
    total_distributions_received DECIMAL(15, 2),
    total_return DECIMAL(15, 2),
    irr DECIMAL(5, 2),
    multiple DECIMAL(5, 2),
    
    -- Documents
    subscription_document_id UUID,
    k1_documents JSONB, -- Array of K-1 document IDs by year
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    INDEX idx_investment_investor (investor_id),
    INDEX idx_investment_property (property_id),
    INDEX idx_investment_status (status)
);

-- investments.distributions
CREATE TABLE investments.distributions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties.properties(id),
    
    -- Distribution Details
    distribution_date DATE NOT NULL,
    distribution_type VARCHAR(50), -- 'income', 'return_of_capital', 'capital_gain'
    total_amount DECIMAL(15, 2) NOT NULL,
    per_dollar_invested DECIMAL(10, 6),
    
    -- Source
    source_period_start DATE,
    source_period_end DATE,
    
    -- Tax Information
    tax_year INTEGER,
    k1_issued BOOLEAN DEFAULT FALSE,
    k1_issue_date DATE,
    
    -- Status
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'processing', 'completed'
    payment_date DATE,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    processed_at TIMESTAMP,
    
    INDEX idx_distribution_property (property_id),
    INDEX idx_distribution_date (distribution_date DESC)
);

-- investments.investor_distributions
CREATE TABLE investments.investor_distributions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    distribution_id UUID NOT NULL REFERENCES investments.distributions(id),
    investor_id UUID NOT NULL REFERENCES auth.users(id),
    investment_id UUID NOT NULL REFERENCES investments.property_investments(id),
    
    -- Distribution Amount
    distribution_amount DECIMAL(15, 2) NOT NULL,
    
    -- Payment Details
    payment_method VARCHAR(50), -- 'ach', 'wire', 'check'
    payment_reference VARCHAR(100),
    payment_status VARCHAR(50), -- 'pending', 'sent', 'completed', 'failed'
    payment_date DATE,
    
    -- Tax Reporting
    tax_category VARCHAR(50),
    reported_on_k1 BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    
    INDEX idx_investor_distribution (investor_id),
    INDEX idx_distribution_investment (investment_id)
);
```

---

## 5. Renovation Schema

### 5.1 Renovation Projects
```sql
-- renovations.projects
CREATE TABLE renovations.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties.properties(id),
    
    -- Project Details
    project_name VARCHAR(255) NOT NULL,
    project_type VARCHAR(50), -- 'value_add', 'maintenance', 'emergency'
    scope VARCHAR(50), -- 'unit', 'building', 'property', 'amenity'
    
    -- Timeline
    planned_start_date DATE,
    actual_start_date DATE,
    planned_end_date DATE,
    actual_end_date DATE,
    duration_days INTEGER,
    
    -- Budget
    budgeted_amount DECIMAL(15, 2),
    actual_amount DECIMAL(15, 2),
    contingency_amount DECIMAL(15, 2),
    
    -- Status
    status VARCHAR(50) DEFAULT 'planned', -- 'planned', 'in_progress', 'completed', 'on_hold'
    completion_percentage INTEGER DEFAULT 0,
    
    -- Impact
    expected_rent_increase DECIMAL(10, 2),
    expected_value_increase DECIMAL(15, 2),
    actual_rent_increase DECIMAL(10, 2),
    actual_value_increase DECIMAL(15, 2),
    
    -- Contractor
    contractor_name VARCHAR(255),
    contractor_contact VARCHAR(255),
    contract_number VARCHAR(100),
    
    -- Documentation
    scope_document_url VARCHAR(500),
    before_photos JSONB,
    progress_photos JSONB,
    after_photos JSONB,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    
    INDEX idx_renovation_property (property_id),
    INDEX idx_renovation_status (status)
);

-- renovations.milestones
CREATE TABLE renovations.milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES renovations.projects(id),
    
    -- Milestone Details
    milestone_name VARCHAR(255) NOT NULL,
    description TEXT,
    sequence_number INTEGER,
    
    -- Timeline
    planned_date DATE,
    actual_date DATE,
    
    -- Status
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'delayed'
    
    -- Dependencies
    depends_on UUID REFERENCES renovations.milestones(id),
    
    -- Documentation
    photos JSONB,
    notes TEXT,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    INDEX idx_milestone_project (project_id),
    INDEX idx_milestone_status (status)
);

-- renovations.unit_renovations
CREATE TABLE renovations.unit_renovations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES renovations.projects(id),
    unit_id UUID NOT NULL REFERENCES properties.units(id),
    
    -- Scope
    renovation_scope JSONB, -- {kitchen: true, bathroom: true, flooring: true, etc}
    
    -- Timeline
    start_date DATE,
    end_date DATE,
    days_out_of_service INTEGER,
    
    -- Costs
    total_cost DECIMAL(15, 2),
    cost_breakdown JSONB, -- {kitchen: 5000, bathroom: 3000, etc}
    
    -- Rent Impact
    rent_before DECIMAL(10, 2),
    rent_after DECIMAL(10, 2),
    rent_increase_amount DECIMAL(10, 2),
    rent_increase_percentage DECIMAL(5, 2),
    
    -- Status
    status VARCHAR(50) DEFAULT 'planned',
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    INDEX idx_unit_renovation_unit (unit_id),
    INDEX idx_unit_renovation_project (project_id)
);
```

---

## 6. Media Schema

### 6.1 Property Media
```sql
-- media.property_photos
CREATE TABLE media.property_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties.properties(id),
    
    -- Photo Details
    photo_url VARCHAR(500) NOT NULL,
    thumbnail_url VARCHAR(500),
    photo_type VARCHAR(50), -- 'exterior', 'interior', 'amenity', 'unit', 'neighborhood'
    category VARCHAR(100), -- More specific category
    
    -- Metadata
    title VARCHAR(255),
    description TEXT,
    tags TEXT[],
    
    -- Technical Details
    width INTEGER,
    height INTEGER,
    file_size INTEGER,
    mime_type VARCHAR(50),
    
    -- Ordering
    display_order INTEGER,
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Attribution
    photographer VARCHAR(255),
    taken_date DATE,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    uploaded_by UUID REFERENCES auth.users(id),
    
    INDEX idx_photo_property (property_id),
    INDEX idx_photo_type (photo_type),
    INDEX idx_photo_featured (is_featured)
);

-- media.property_videos
CREATE TABLE media.property_videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties.properties(id),
    
    -- Video Details
    video_url VARCHAR(500) NOT NULL,
    thumbnail_url VARCHAR(500),
    video_type VARCHAR(50), -- 'tour', 'drone', 'testimonial', 'update'
    
    -- Metadata
    title VARCHAR(255),
    description TEXT,
    duration_seconds INTEGER,
    
    -- Technical Details
    resolution VARCHAR(20), -- '1080p', '4k'
    file_size INTEGER,
    mime_type VARCHAR(50),
    
    -- Ordering
    display_order INTEGER,
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    uploaded_by UUID REFERENCES auth.users(id),
    
    INDEX idx_video_property (property_id),
    INDEX idx_video_type (video_type)
);

-- media.property_documents
CREATE TABLE media.property_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties.properties(id),
    
    -- Document Details
    document_url VARCHAR(500) NOT NULL,
    document_type VARCHAR(50), -- 'ppm', 'financials', 'inspection', 'insurance', etc
    document_name VARCHAR(255) NOT NULL,
    
    -- Access Control
    access_level VARCHAR(50) DEFAULT 'investor', -- 'public', 'investor', 'admin'
    requires_nda BOOLEAN DEFAULT FALSE,
    
    -- Versioning
    version_number INTEGER DEFAULT 1,
    is_current BOOLEAN DEFAULT TRUE,
    replaces_document_id UUID REFERENCES media.property_documents(id),
    
    -- Metadata
    file_size INTEGER,
    mime_type VARCHAR(50),
    page_count INTEGER,
    
    -- Dates
    document_date DATE,
    expiration_date DATE,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    uploaded_by UUID REFERENCES auth.users(id),
    
    INDEX idx_document_property (property_id),
    INDEX idx_document_type (document_type),
    INDEX idx_document_access (access_level)
);

-- media.virtual_tours
CREATE TABLE media.virtual_tours (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties.properties(id),
    
    -- Tour Details
    tour_type VARCHAR(50), -- 'matterport', '360', 'video'
    tour_url VARCHAR(500) NOT NULL,
    embed_code TEXT,
    
    -- Provider Details
    provider VARCHAR(50), -- 'matterport', 'eyespy360', 'custom'
    provider_tour_id VARCHAR(100),
    
    -- Coverage
    coverage_areas JSONB, -- ['lobby', 'unit_1bed', 'amenities', etc]
    
    -- Settings
    autoplay BOOLEAN DEFAULT TRUE,
    show_measurements BOOLEAN DEFAULT TRUE,
    show_dollhouse BOOLEAN DEFAULT TRUE,
    show_floorplan BOOLEAN DEFAULT TRUE,
    
    -- Analytics
    view_count INTEGER DEFAULT 0,
    average_view_duration INTEGER, -- seconds
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    INDEX idx_tour_property (property_id)
);
```

---

## 7. Market Data Schema

### 7.1 Market Intelligence
```sql
-- analytics.market_comparables
CREATE TABLE analytics.market_comparables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties.properties(id),
    
    -- Comparable Property
    comp_name VARCHAR(255),
    comp_address VARCHAR(500),
    distance_miles DECIMAL(5, 2),
    
    -- Property Details
    year_built INTEGER,
    total_units INTEGER,
    property_class VARCHAR(1),
    
    -- Performance Metrics
    occupancy_rate DECIMAL(5, 2),
    average_rent DECIMAL(10, 2),
    rent_per_sqft DECIMAL(10, 2),
    
    -- Transaction Data
    last_sale_date DATE,
    last_sale_price DECIMAL(15, 2),
    price_per_unit DECIMAL(15, 2),
    cap_rate DECIMAL(5, 2),
    
    -- Data Source
    data_source VARCHAR(50), -- 'costar', 'manual', 'public_records'
    data_date DATE,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    INDEX idx_comp_property (property_id),
    INDEX idx_comp_date (data_date DESC)
);

-- analytics.market_trends
CREATE TABLE analytics.market_trends (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    market_name VARCHAR(100),
    submarket_name VARCHAR(100),
    trend_date DATE NOT NULL,
    
    -- Market Metrics
    average_occupancy DECIMAL(5, 2),
    average_rent DECIMAL(10, 2),
    rent_growth_yoy DECIMAL(5, 2),
    
    -- Supply and Demand
    total_units INTEGER,
    units_under_construction INTEGER,
    absorption_rate DECIMAL(5, 2),
    
    -- Economic Indicators
    population_growth DECIMAL(5, 2),
    employment_growth DECIMAL(5, 2),
    median_household_income DECIMAL(15, 2),
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    
    INDEX idx_trend_market (market_name, trend_date DESC),
    INDEX idx_trend_submarket (submarket_name, trend_date DESC)
);
```

---

## 8. Views and Materialized Views

### 8.1 Investment Dashboard Views
```sql
-- Investor Portfolio Summary
CREATE MATERIALIZED VIEW investments.investor_portfolio_summary AS
SELECT 
    i.investor_id,
    COUNT(DISTINCT i.property_id) as property_count,
    SUM(i.investment_amount) as total_invested,
    SUM(i.total_distributions_received) as total_distributions,
    AVG(i.ownership_percentage) as avg_ownership,
    SUM(i.investment_amount * (p.current_valuation / p.purchase_price)) as current_value,
    (SUM(i.investment_amount * (p.current_valuation / p.purchase_price)) - SUM(i.investment_amount)) / NULLIF(SUM(i.investment_amount), 0) * 100 as unrealized_return_pct
FROM investments.property_investments i
JOIN properties.properties p ON i.property_id = p.id
WHERE i.status = 'active'
GROUP BY i.investor_id;

CREATE INDEX idx_portfolio_summary_investor ON investments.investor_portfolio_summary(investor_id);

-- Property Performance Summary
CREATE MATERIALIZED VIEW properties.property_performance_summary AS
SELECT 
    p.id as property_id,
    p.property_name,
    p.status,
    pm.occupancy_rate,
    pm.average_rent_per_unit,
    pm.noi,
    pm.cap_rate,
    pi.total_income as monthly_income,
    pe.total_operating_expenses as monthly_expenses,
    (pi.total_income - pe.total_operating_expenses) as monthly_noi,
    COUNT(DISTINCT i.investor_id) as investor_count,
    SUM(i.investment_amount) as total_invested
FROM properties.properties p
LEFT JOIN properties.property_metrics pm ON p.id = pm.property_id 
    AND pm.metric_date = (SELECT MAX(metric_date) FROM properties.property_metrics WHERE property_id = p.id)
LEFT JOIN financials.property_income pi ON p.id = pi.property_id
    AND pi.period_start = DATE_TRUNC('month', CURRENT_DATE)
LEFT JOIN financials.property_expenses pe ON p.id = pe.property_id
    AND pe.period_start = DATE_TRUNC('month', CURRENT_DATE)
LEFT JOIN investments.property_investments i ON p.id = i.property_id AND i.status = 'active'
GROUP BY p.id, p.property_name, p.status, pm.occupancy_rate, pm.average_rent_per_unit, 
         pm.noi, pm.cap_rate, pi.total_income, pe.total_operating_expenses;

CREATE INDEX idx_performance_summary_property ON properties.property_performance_summary(property_id);
```

---

## 9. Triggers and Functions

### 9.1 Automated Calculations
```sql
-- Update property metrics when units change
CREATE OR REPLACE FUNCTION update_property_occupancy()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE properties.property_metrics
    SET 
        occupied_units = (
            SELECT COUNT(*) FROM properties.units 
            WHERE property_id = NEW.property_id AND occupancy_status = 'occupied'
        ),
        occupancy_rate = (
            SELECT COUNT(*) * 100.0 / NULLIF(total_units, 0)
            FROM properties.units 
            WHERE property_id = NEW.property_id AND occupancy_status = 'occupied'
            GROUP BY property_id
        ),
        updated_at = NOW()
    WHERE property_id = NEW.property_id 
    AND metric_date = CURRENT_DATE;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER unit_occupancy_change
AFTER UPDATE OF occupancy_status ON properties.units
FOR EACH ROW EXECUTE FUNCTION update_property_occupancy();

-- Update investment totals when new investment made
CREATE OR REPLACE FUNCTION update_property_investment_totals()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE properties.properties
    SET 
        amount_raised = amount_raised + NEW.investment_amount,
        investor_count = (
            SELECT COUNT(DISTINCT investor_id)
            FROM investments.property_investments
            WHERE property_id = NEW.property_id AND status = 'active'
        ),
        updated_at = NOW()
    WHERE id = NEW.property_id;
    
    -- Update investment status if fully funded
    IF (SELECT amount_raised >= target_raise_amount FROM properties.properties WHERE id = NEW.property_id) THEN
        UPDATE properties.properties
        SET investment_status = 'funded'
        WHERE id = NEW.property_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER investment_totals_update
AFTER INSERT ON investments.property_investments
FOR EACH ROW EXECUTE FUNCTION update_property_investment_totals();
```

---

## 10. Indexes and Performance

### 10.1 Performance Indexes
```sql
-- Composite indexes for common queries
CREATE INDEX idx_property_location_status 
    ON properties.properties(state, city, status) 
    WHERE status = 'active';

CREATE INDEX idx_units_available 
    ON properties.units(property_id, occupancy_status) 
    WHERE occupancy_status = 'vacant';

CREATE INDEX idx_active_investments 
    ON investments.property_investments(investor_id, property_id) 
    WHERE status = 'active';

CREATE INDEX idx_recent_metrics 
    ON properties.property_metrics(property_id, metric_date DESC);

-- Partial indexes for filtered queries
CREATE INDEX idx_open_investments 
    ON properties.properties(investment_status) 
    WHERE investment_status = 'open';

CREATE INDEX idx_renovation_active 
    ON renovations.projects(property_id, status) 
    WHERE status = 'in_progress';

-- Full-text search indexes
CREATE INDEX idx_property_search 
    ON properties.properties 
    USING gin(to_tsvector('english', 
        property_name || ' ' || 
        street_address || ' ' || 
        city || ' ' || 
        state
    ));
```

---

## Appendices

### A. Data Types Guide
- **Money**: DECIMAL(15,2) for amounts
- **Percentages**: DECIMAL(5,2) for rates
- **IDs**: UUID for all primary keys
- **Dates**: DATE for date-only, TIMESTAMP for datetime
- **Status**: VARCHAR(50) with check constraints
- **JSON**: JSONB for flexible structured data

### B. Naming Conventions
- **Tables**: schema.table_name (snake_case, plural)
- **Columns**: column_name (snake_case)
- **Indexes**: idx_table_column
- **Foreign Keys**: fk_table_reference
- **Constraints**: chk_description

### C. Migration Strategy
1. Schema-first approach with versioned migrations
2. Blue-green deployment for zero-downtime updates
3. Rollback procedures for each migration
4. Data validation after migrations
5. Backup before major changes