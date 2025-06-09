/*
  # Grocery Store Logistics System - Complete Database Schema

  ## Overview
  This migration creates a comprehensive database schema for a grocery store logistics system
  supporting inventory management, deliveries, employee management, and operational tracking.

  ## New Tables
  1. **Core Business Entities**
     - `stores` - Store locations and information
     - `suppliers` - Supplier information and contact details
     - `warehouse_locations` - Physical warehouse/storage locations
     - `product_categories` - Hierarchical product categorization
     - `products` - Product catalog with inventory tracking
     - `supplier_products` - Many-to-many relationship between suppliers and products

  2. **Inventory Management**
     - `inventory` - Current stock levels by location
     - `inventory_transactions` - All inventory movements (inbound/outbound/adjustments)
     - `stock_alerts` - Automated alerts for low stock, expiry, etc.

  3. **Delivery Management**
     - `deliveries` - Delivery orders and tracking
     - `delivery_items` - Individual items within deliveries
     - `delivery_events` - Timeline of delivery status changes
     - `delivery_routes` - Planned routes for drivers

  4. **Employee Management**
     - `employees` - Employee records linked to auth users
     - `employee_shifts` - Work schedule management
     - `gas_cards` - Fuel card management for drivers

  5. **Communication & Reporting**
     - `invitations` - Employee invitation system
     - `problem_reports` - Issue reporting system
     - `notifications` - System notifications
     - `audit_logs` - Comprehensive audit trail

  6. **System Support**
     - `error_logs` - Application error tracking
     - Custom types and enums for data consistency

  ## Security
  - Row Level Security (RLS) enabled on all tables
  - Comprehensive policies for role-based access
  - Audit logging for all critical operations

  ## Performance
  - Strategic indexes for common query patterns
  - Optimized data types for storage efficiency
  - Proper foreign key relationships with cascading
*/

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Custom Types and Enums
CREATE TYPE store_country AS ENUM ('US', 'CA', 'GB', 'IN', 'DE', 'FR', 'AU', 'OTHER');
CREATE TYPE employee_role AS ENUM ('admin', 'logistics_specialist', 'driver', 'warehouse_worker');
CREATE TYPE employee_status AS ENUM ('active', 'on-leave', 'terminated');
CREATE TYPE delivery_status AS ENUM ('pending', 'in-transit', 'delivered', 'canceled');
CREATE TYPE inventory_tx_type AS ENUM ('inbound', 'outbound', 'adjustment');
CREATE TYPE gas_card_status AS ENUM ('active', 'blocked', 'expired');
CREATE TYPE report_type AS ENUM ('delivery', 'product', 'vehicle', 'other');
CREATE TYPE report_priority AS ENUM ('low', 'medium', 'high');
CREATE TYPE invitation_status AS ENUM ('pending', 'accepted', 'expired');
CREATE TYPE audit_operation AS ENUM ('INSERT', 'UPDATE', 'DELETE');
CREATE TYPE product_category AS ENUM ('produce', 'dairy', 'bakery', 'meat', 'beverage', 'frozen', 'household', 'other');

-- Stores table
CREATE TABLE IF NOT EXISTS stores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    country store_country NOT NULL DEFAULT 'US',
    postal_code VARCHAR(20),
    phone VARCHAR(20),
    email VARCHAR(255),
    timezone VARCHAR(50) DEFAULT 'UTC',
    business_hours JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT stores_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT stores_phone_check CHECK (phone ~* '^\+?[0-9\s\-\(\)]+$')
);

-- Suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    address TEXT,
    city VARCHAR(100),
    state_province VARCHAR(100),
    country store_country NOT NULL DEFAULT 'US',
    postal_code VARCHAR(20),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    website_url VARCHAR(500),
    tax_id VARCHAR(50),
    payment_terms VARCHAR(100),
    business_hours VARCHAR(255),
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT suppliers_email_check CHECK (contact_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT suppliers_phone_check CHECK (contact_phone ~* '^\+?[0-9\s\-\(\)]+$'),
    CONSTRAINT suppliers_website_check CHECK (website_url ~* '^https?://.*')
);

-- Warehouse locations table
CREATE TABLE IF NOT EXISTS warehouse_locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_id UUID REFERENCES suppliers(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state_province VARCHAR(100),
    country store_country NOT NULL DEFAULT 'US',
    postal_code VARCHAR(20),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    coordinates POINT,
    capacity_cubic_meters DECIMAL(10,2),
    temperature_controlled BOOLEAN DEFAULT false,
    security_level VARCHAR(50),
    operating_hours VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT warehouse_email_check CHECK (contact_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT warehouse_phone_check CHECK (contact_phone ~* '^\+?[0-9\s\-\(\)]+$')
);

-- Product categories table (for hierarchical categorization)
CREATE TABLE IF NOT EXISTS product_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    parent_id UUID REFERENCES product_categories(id) ON DELETE SET NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT product_categories_name_unique UNIQUE (name, parent_id)
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category product_category NOT NULL DEFAULT 'other',
    category_id UUID REFERENCES product_categories(id) ON DELETE SET NULL,
    sku VARCHAR(100) UNIQUE,
    barcode VARCHAR(100),
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    cost DECIMAL(10,2) CHECK (cost >= 0),
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    reorder_level INTEGER NOT NULL DEFAULT 0 CHECK (reorder_level >= 0),
    max_stock_level INTEGER CHECK (max_stock_level >= reorder_level),
    supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
    image_url VARCHAR(500),
    weight_grams DECIMAL(8,2),
    dimensions_cm VARCHAR(50),
    expiry_date DATE,
    batch_number VARCHAR(100),
    storage_temperature_min DECIMAL(5,2),
    storage_temperature_max DECIMAL(5,2),
    requires_refrigeration BOOLEAN DEFAULT false,
    is_hazardous BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT products_image_url_check CHECK (image_url ~* '^https?://.*'),
    CONSTRAINT products_dimensions_check CHECK (dimensions_cm ~* '^\d+(\.\d+)?x\d+(\.\d+)?x\d+(\.\d+)?$' OR dimensions_cm IS NULL)
);

-- Supplier products relationship table
CREATE TABLE IF NOT EXISTS supplier_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    sku VARCHAR(100),
    cost DECIMAL(10,2) NOT NULL CHECK (cost >= 0),
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    minimum_order_quantity INTEGER DEFAULT 1 CHECK (minimum_order_quantity > 0),
    lead_time_days INTEGER DEFAULT 1 CHECK (lead_time_days >= 0),
    reorder_level INTEGER DEFAULT 0 CHECK (reorder_level >= 0),
    is_preferred BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT supplier_products_unique UNIQUE (supplier_id, product_id),
    CONSTRAINT supplier_products_price_cost_check CHECK (price >= cost)
);

-- Inventory table
CREATE TABLE IF NOT EXISTS inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    warehouse_id UUID NOT NULL REFERENCES warehouse_locations(id) ON DELETE CASCADE,
    supplier_product_id UUID NOT NULL REFERENCES supplier_products(id) ON DELETE CASCADE,
    stock_level INTEGER NOT NULL DEFAULT 0 CHECK (stock_level >= 0),
    reserved_quantity INTEGER DEFAULT 0 CHECK (reserved_quantity >= 0),
    available_quantity INTEGER GENERATED ALWAYS AS (stock_level - reserved_quantity) STORED,
    min_threshold INTEGER DEFAULT 0 CHECK (min_threshold >= 0),
    max_threshold INTEGER CHECK (max_threshold >= min_threshold),
    location_code VARCHAR(50),
    last_counted_at TIMESTAMPTZ,
    last_restocked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT inventory_unique UNIQUE (warehouse_id, supplier_product_id),
    CONSTRAINT inventory_reserved_check CHECK (reserved_quantity <= stock_level)
);

-- Inventory transactions table
CREATE TABLE IF NOT EXISTS inventory_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inventory_id UUID NOT NULL REFERENCES inventory(id) ON DELETE CASCADE,
    transaction_type inventory_tx_type NOT NULL,
    quantity_change INTEGER NOT NULL,
    previous_stock INTEGER NOT NULL CHECK (previous_stock >= 0),
    new_stock INTEGER NOT NULL CHECK (new_stock >= 0),
    unit_cost DECIMAL(10,2),
    reference_type VARCHAR(50),
    reference_id UUID,
    notes TEXT,
    performed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT inventory_tx_quantity_check CHECK (
        (transaction_type = 'inbound' AND quantity_change > 0) OR
        (transaction_type = 'outbound' AND quantity_change < 0) OR
        (transaction_type = 'adjustment')
    )
);

-- Stock alerts table
CREATE TABLE IF NOT EXISTS stock_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inventory_id UUID NOT NULL REFERENCES inventory(id) ON DELETE CASCADE,
    alert_type VARCHAR(50) NOT NULL,
    threshold_value INTEGER,
    current_value INTEGER,
    message TEXT NOT NULL,
    severity VARCHAR(20) DEFAULT 'medium',
    is_acknowledged BOOLEAN DEFAULT false,
    acknowledged_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    acknowledged_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT stock_alerts_severity_check CHECK (severity IN ('low', 'medium', 'high', 'critical'))
);

-- Employees table
CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    employee_number VARCHAR(50) UNIQUE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20),
    position VARCHAR(100) NOT NULL,
    department VARCHAR(100) NOT NULL,
    role employee_role NOT NULL DEFAULT 'warehouse_worker',
    status employee_status NOT NULL DEFAULT 'active',
    hire_date DATE NOT NULL DEFAULT CURRENT_DATE,
    termination_date DATE,
    salary DECIMAL(10,2),
    hourly_rate DECIMAL(8,2),
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(20),
    address TEXT,
    avatar VARCHAR(500),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT employees_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT employees_phone_check CHECK (phone ~* '^\+?[0-9\s\-\(\)]+$'),
    CONSTRAINT employees_emergency_phone_check CHECK (emergency_contact_phone ~* '^\+?[0-9\s\-\(\)]+$'),
    CONSTRAINT employees_termination_check CHECK (termination_date IS NULL OR termination_date >= hire_date),
    CONSTRAINT employees_avatar_check CHECK (avatar ~* '^https?://.*')
);

-- Employee shifts table
CREATE TABLE IF NOT EXISTS employee_shifts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    shift_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    break_duration_minutes INTEGER DEFAULT 0 CHECK (break_duration_minutes >= 0),
    actual_start_time TIMESTAMPTZ,
    actual_end_time TIMESTAMPTZ,
    status VARCHAR(20) DEFAULT 'scheduled',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT employee_shifts_time_check CHECK (end_time > start_time),
    CONSTRAINT employee_shifts_status_check CHECK (status IN ('scheduled', 'in-progress', 'completed', 'missed', 'canceled')),
    CONSTRAINT employee_shifts_unique UNIQUE (employee_id, shift_date, start_time)
);

-- Deliveries table
CREATE TABLE IF NOT EXISTS deliveries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    delivery_number VARCHAR(100) UNIQUE NOT NULL,
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE RESTRICT,
    supplier_name VARCHAR(255) NOT NULL,
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    warehouse_id UUID REFERENCES warehouse_locations(id) ON DELETE SET NULL,
    status delivery_status NOT NULL DEFAULT 'pending',
    priority INTEGER DEFAULT 1 CHECK (priority BETWEEN 1 AND 5),
    expected_date TIMESTAMPTZ NOT NULL,
    actual_delivery_date TIMESTAMPTZ,
    estimated_arrival TIMESTAMPTZ,
    total_amount DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
    total_items INTEGER DEFAULT 0 CHECK (total_items >= 0),
    driver_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    vehicle_info JSONB,
    delivery_address TEXT,
    special_instructions TEXT,
    notes TEXT,
    tracking_number VARCHAR(100),
    proof_of_delivery_url VARCHAR(500),
    signature_url VARCHAR(500),
    temperature_log JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT deliveries_dates_check CHECK (actual_delivery_date IS NULL OR actual_delivery_date >= expected_date - INTERVAL '7 days'),
    CONSTRAINT deliveries_proof_url_check CHECK (proof_of_delivery_url ~* '^https?://.*'),
    CONSTRAINT deliveries_signature_url_check CHECK (signature_url ~* '^https?://.*')
);

-- Delivery items table
CREATE TABLE IF NOT EXISTS delivery_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    delivery_id UUID NOT NULL REFERENCES deliveries(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    product_name VARCHAR(255) NOT NULL,
    sku VARCHAR(100),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
    total_price DECIMAL(12,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    received_quantity INTEGER DEFAULT 0 CHECK (received_quantity >= 0),
    damaged_quantity INTEGER DEFAULT 0 CHECK (damaged_quantity >= 0),
    expiry_date DATE,
    batch_number VARCHAR(100),
    temperature_at_delivery DECIMAL(5,2),
    quality_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT delivery_items_received_check CHECK (received_quantity <= quantity),
    CONSTRAINT delivery_items_damaged_check CHECK (damaged_quantity <= received_quantity)
);

-- Delivery events table
CREATE TABLE IF NOT EXISTS delivery_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    delivery_id UUID NOT NULL REFERENCES deliveries(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    event_status VARCHAR(50) NOT NULL,
    event_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    location_coordinates POINT,
    location_address TEXT,
    notes TEXT,
    created_by UUID REFERENCES employees(id) ON DELETE SET NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT delivery_events_type_check CHECK (event_type IN ('created', 'dispatched', 'in_transit', 'arrived', 'unloading', 'completed', 'delayed', 'canceled', 'returned'))
);

-- Delivery routes table
CREATE TABLE IF NOT EXISTS delivery_routes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    route_name VARCHAR(255) NOT NULL,
    driver_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    route_date DATE NOT NULL,
    start_location POINT,
    end_location POINT,
    estimated_distance_km DECIMAL(8,2),
    estimated_duration_minutes INTEGER,
    actual_distance_km DECIMAL(8,2),
    actual_duration_minutes INTEGER,
    fuel_consumed_liters DECIMAL(8,2),
    route_coordinates JSONB,
    status VARCHAR(20) DEFAULT 'planned',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT delivery_routes_status_check CHECK (status IN ('planned', 'in_progress', 'completed', 'canceled')),
    CONSTRAINT delivery_routes_distance_check CHECK (actual_distance_km IS NULL OR actual_distance_km >= 0),
    CONSTRAINT delivery_routes_duration_check CHECK (actual_duration_minutes IS NULL OR actual_duration_minutes >= 0)
);

-- Gas cards table
CREATE TABLE IF NOT EXISTS gas_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    card_number VARCHAR(50) NOT NULL UNIQUE,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    balance DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (balance >= 0),
    credit_limit DECIMAL(10,2) DEFAULT 1000 CHECK (credit_limit >= 0),
    status gas_card_status NOT NULL DEFAULT 'active',
    expiry_date DATE NOT NULL,
    pin_hash VARCHAR(255),
    last_used_at TIMESTAMPTZ,
    last_used_location TEXT,
    daily_limit DECIMAL(8,2) DEFAULT 200 CHECK (daily_limit >= 0),
    monthly_limit DECIMAL(10,2) DEFAULT 2000 CHECK (monthly_limit >= 0),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT gas_cards_expiry_check CHECK (expiry_date > CURRENT_DATE),
    CONSTRAINT gas_cards_limits_check CHECK (monthly_limit >= daily_limit)
);

-- Gas card transactions table
CREATE TABLE IF NOT EXISTS gas_card_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gas_card_id UUID NOT NULL REFERENCES gas_cards(id) ON DELETE CASCADE,
    transaction_type VARCHAR(20) NOT NULL,
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    previous_balance DECIMAL(10,2) NOT NULL,
    new_balance DECIMAL(10,2) NOT NULL,
    merchant_name VARCHAR(255),
    location TEXT,
    fuel_type VARCHAR(50),
    fuel_quantity_liters DECIMAL(8,2),
    odometer_reading INTEGER,
    receipt_url VARCHAR(500),
    transaction_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT gas_card_tx_type_check CHECK (transaction_type IN ('purchase', 'refund', 'credit', 'fee')),
    CONSTRAINT gas_card_tx_receipt_check CHECK (receipt_url ~* '^https?://.*')
);

-- Invitations table
CREATE TABLE IF NOT EXISTS invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL,
    role employee_role NOT NULL,
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    invited_by UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL UNIQUE,
    status invitation_status NOT NULL DEFAULT 'pending',
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
    accepted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT invitations_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT invitations_expiry_check CHECK (expires_at > created_at)
);

-- Problem reports table
CREATE TABLE IF NOT EXISTS problem_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_number VARCHAR(100) UNIQUE NOT NULL,
    submitted_by UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    type report_type NOT NULL,
    priority report_priority NOT NULL DEFAULT 'medium',
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    location TEXT,
    delivery_id UUID REFERENCES deliveries(id) ON DELETE SET NULL,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'open',
    assigned_to UUID REFERENCES employees(id) ON DELETE SET NULL,
    resolution TEXT,
    images JSONB,
    estimated_cost DECIMAL(10,2),
    actual_cost DECIMAL(10,2),
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT problem_reports_status_check CHECK (status IN ('open', 'in_progress', 'resolved', 'closed', 'canceled')),
    CONSTRAINT problem_reports_cost_check CHECK (actual_cost IS NULL OR actual_cost >= 0)
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    priority VARCHAR(20) DEFAULT 'normal',
    expires_at TIMESTAMPTZ,
    action_url VARCHAR(500),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT notifications_priority_check CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    CONSTRAINT notifications_action_url_check CHECK (action_url ~* '^https?://.*')
);

-- Audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    operation audit_operation NOT NULL,
    old_values JSONB,
    new_values JSONB,
    changed_fields TEXT[],
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    user_email VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT audit_logs_operation_check CHECK (
        (operation = 'INSERT' AND old_values IS NULL) OR
        (operation = 'DELETE' AND new_values IS NULL) OR
        (operation = 'UPDATE' AND old_values IS NOT NULL AND new_values IS NOT NULL)
    )
);

-- Error logs table
CREATE TABLE IF NOT EXISTS error_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    error_type VARCHAR(100) NOT NULL,
    error_message TEXT NOT NULL,
    stack_trace TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    request_url VARCHAR(500),
    request_method VARCHAR(10),
    request_body JSONB,
    response_status INTEGER,
    user_agent TEXT,
    ip_address INET,
    severity VARCHAR(20) DEFAULT 'error',
    is_resolved BOOLEAN DEFAULT false,
    resolved_by UUID REFERENCES employees(id) ON DELETE SET NULL,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT error_logs_severity_check CHECK (severity IN ('debug', 'info', 'warning', 'error', 'critical'))
);

-- Create indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_supplier ON products(supplier_id);
CREATE INDEX IF NOT EXISTS idx_products_stock_level ON products(stock, reorder_level);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku) WHERE sku IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode) WHERE barcode IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_inventory_warehouse ON inventory(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_inventory_supplier_product ON inventory(supplier_product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_stock_levels ON inventory(stock_level, min_threshold);
CREATE INDEX IF NOT EXISTS idx_inventory_location ON inventory(location_code) WHERE location_code IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_inventory_transactions_inventory ON inventory_transactions(inventory_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_type ON inventory_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_date ON inventory_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_reference ON inventory_transactions(reference_type, reference_id);

CREATE INDEX IF NOT EXISTS idx_deliveries_supplier ON deliveries(supplier_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_store ON deliveries(store_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_status ON deliveries(status);
CREATE INDEX IF NOT EXISTS idx_deliveries_date ON deliveries(expected_date);
CREATE INDEX IF NOT EXISTS idx_deliveries_driver ON deliveries(driver_id) WHERE driver_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_deliveries_number ON deliveries(delivery_number);

CREATE INDEX IF NOT EXISTS idx_delivery_items_delivery ON delivery_items(delivery_id);
CREATE INDEX IF NOT EXISTS idx_delivery_items_product ON delivery_items(product_id);

CREATE INDEX IF NOT EXISTS idx_delivery_events_delivery ON delivery_events(delivery_id);
CREATE INDEX IF NOT EXISTS idx_delivery_events_type ON delivery_events(event_type);
CREATE INDEX IF NOT EXISTS idx_delivery_events_timestamp ON delivery_events(event_timestamp);

CREATE INDEX IF NOT EXISTS idx_employees_store ON employees(store_id);
CREATE INDEX IF NOT EXISTS idx_employees_role ON employees(role);
CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(status);
CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email);

CREATE INDEX IF NOT EXISTS idx_employee_shifts_employee ON employee_shifts(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_shifts_date ON employee_shifts(shift_date);
CREATE INDEX IF NOT EXISTS idx_employee_shifts_status ON employee_shifts(status);

CREATE INDEX IF NOT EXISTS idx_gas_cards_employee ON gas_cards(employee_id);
CREATE INDEX IF NOT EXISTS idx_gas_cards_status ON gas_cards(status);
CREATE INDEX IF NOT EXISTS idx_gas_cards_number ON gas_cards(card_number);

CREATE INDEX IF NOT EXISTS idx_gas_card_transactions_card ON gas_card_transactions(gas_card_id);
CREATE INDEX IF NOT EXISTS idx_gas_card_transactions_timestamp ON gas_card_transactions(transaction_timestamp);

CREATE INDEX IF NOT EXISTS idx_problem_reports_submitted_by ON problem_reports(submitted_by);
CREATE INDEX IF NOT EXISTS idx_problem_reports_status ON problem_reports(status);
CREATE INDEX IF NOT EXISTS idx_problem_reports_type ON problem_reports(type);
CREATE INDEX IF NOT EXISTS idx_problem_reports_priority ON problem_reports(priority);
CREATE INDEX IF NOT EXISTS idx_problem_reports_delivery ON problem_reports(delivery_id) WHERE delivery_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(recipient_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at);

CREATE INDEX IF NOT EXISTS idx_audit_logs_table_record ON audit_logs(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at);

CREATE INDEX IF NOT EXISTS idx_error_logs_type ON error_logs(error_type);
CREATE INDEX IF NOT EXISTS idx_error_logs_severity ON error_logs(severity);
CREATE INDEX IF NOT EXISTS idx_error_logs_unresolved ON error_logs(is_resolved) WHERE is_resolved = false;
CREATE INDEX IF NOT EXISTS idx_error_logs_created ON error_logs(created_at);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to relevant tables
CREATE TRIGGER update_stores_updated_at BEFORE UPDATE ON stores FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_warehouse_locations_updated_at BEFORE UPDATE ON warehouse_locations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_product_categories_updated_at BEFORE UPDATE ON product_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_supplier_products_updated_at BEFORE UPDATE ON supplier_products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON inventory FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_employee_shifts_updated_at BEFORE UPDATE ON employee_shifts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_deliveries_updated_at BEFORE UPDATE ON deliveries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_delivery_items_updated_at BEFORE UPDATE ON delivery_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_delivery_routes_updated_at BEFORE UPDATE ON delivery_routes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_gas_cards_updated_at BEFORE UPDATE ON gas_cards FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_problem_reports_updated_at BEFORE UPDATE ON problem_reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create audit trigger function
CREATE OR REPLACE FUNCTION process_audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        INSERT INTO audit_logs (
            table_name, record_id, operation, old_values, user_id, user_email
        ) VALUES (
            TG_TABLE_NAME, OLD.id, 'DELETE', to_jsonb(OLD), 
            auth.uid(), auth.email()
        );
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_logs (
            table_name, record_id, operation, old_values, new_values, 
            changed_fields, user_id, user_email
        ) VALUES (
            TG_TABLE_NAME, NEW.id, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW),
            (SELECT array_agg(key) FROM jsonb_each(to_jsonb(NEW)) WHERE to_jsonb(NEW) ->> key IS DISTINCT FROM to_jsonb(OLD) ->> key),
            auth.uid(), auth.email()
        );
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO audit_logs (
            table_name, record_id, operation, new_values, user_id, user_email
        ) VALUES (
            TG_TABLE_NAME, NEW.id, 'INSERT', to_jsonb(NEW),
            auth.uid(), auth.email()
        );
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Apply audit triggers to critical tables
CREATE TRIGGER audit_stores AFTER INSERT OR UPDATE OR DELETE ON stores FOR EACH ROW EXECUTE FUNCTION process_audit_trigger();
CREATE TRIGGER audit_products AFTER INSERT OR UPDATE OR DELETE ON products FOR EACH ROW EXECUTE FUNCTION process_audit_trigger();
CREATE TRIGGER audit_deliveries AFTER INSERT OR UPDATE OR DELETE ON deliveries FOR EACH ROW EXECUTE FUNCTION process_audit_trigger();
CREATE TRIGGER audit_employees AFTER INSERT OR UPDATE OR DELETE ON employees FOR EACH ROW EXECUTE FUNCTION process_audit_trigger();
CREATE TRIGGER audit_inventory AFTER INSERT OR UPDATE OR DELETE ON inventory FOR EACH ROW EXECUTE FUNCTION process_audit_trigger();

-- Enable Row Level Security on all tables
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouse_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE gas_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE gas_card_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE problem_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies for authenticated users
-- Note: These are basic policies - you should customize them based on your specific role-based access requirements

-- Stores policies
CREATE POLICY "Users can view stores" ON stores FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage stores" ON stores FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM employees WHERE id = auth.uid() AND role = 'admin')
);

-- Products policies
CREATE POLICY "Users can view products" ON products FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins and logistics can manage products" ON products FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM employees WHERE id = auth.uid() AND role IN ('admin', 'logistics_specialist'))
);

-- Deliveries policies
CREATE POLICY "Users can view deliveries" ON deliveries FOR SELECT TO authenticated USING (true);
CREATE POLICY "Drivers can view assigned deliveries" ON deliveries FOR SELECT TO authenticated USING (
    driver_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM employees WHERE id = auth.uid() AND role IN ('admin', 'logistics_specialist'))
);

-- Employees policies
CREATE POLICY "Users can view employees in same store" ON employees FOR SELECT TO authenticated USING (
    store_id = (SELECT store_id FROM employees WHERE id = auth.uid())
);
CREATE POLICY "Users can update own profile" ON employees FOR UPDATE TO authenticated USING (id = auth.uid());
CREATE POLICY "Admins can manage employees" ON employees FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM employees WHERE id = auth.uid() AND role = 'admin')
);

-- Gas cards policies
CREATE POLICY "Drivers can view own gas card" ON gas_cards FOR SELECT TO authenticated USING (
    employee_id = auth.uid()
);
CREATE POLICY "Admins can manage gas cards" ON gas_cards FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM employees WHERE id = auth.uid() AND role = 'admin')
);

-- Problem reports policies
CREATE POLICY "Users can view and create problem reports" ON problem_reports FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create problem reports" ON problem_reports FOR INSERT TO authenticated WITH CHECK (
    submitted_by = auth.uid()
);
CREATE POLICY "Admins can manage problem reports" ON problem_reports FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM employees WHERE id = auth.uid() AND role = 'admin')
);

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT TO authenticated USING (
    recipient_id = auth.uid()
);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE TO authenticated USING (
    recipient_id = auth.uid()
);

-- Audit logs policies (read-only for admins)
CREATE POLICY "Admins can view audit logs" ON audit_logs FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM employees WHERE id = auth.uid() AND role = 'admin')
);

-- Insert some initial data for product categories
INSERT INTO product_categories (name, description) VALUES
    ('Fresh Produce', 'Fresh fruits and vegetables'),
    ('Dairy & Eggs', 'Milk, cheese, yogurt, and eggs'),
    ('Meat & Seafood', 'Fresh and frozen meat and seafood'),
    ('Bakery', 'Bread, pastries, and baked goods'),
    ('Pantry Staples', 'Canned goods, grains, and dry goods'),
    ('Beverages', 'Drinks and beverages'),
    ('Frozen Foods', 'Frozen meals and ingredients'),
    ('Household Items', 'Cleaning supplies and household goods')
ON CONFLICT (name, parent_id) DO NOTHING;