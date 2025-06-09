/*
  # Initial Schema Setup for GroceryOps

  This migration sets up the complete database schema including:
  1. Core Tables
    - stores
    - employees
    - products
    - suppliers
    - deliveries
    - delivery_items
    - warehouse_locations
    - supplier_products
    - inventory
    - inventory_history
    - gas_cards
    - problem_reports
    - audit_logs
    - invitations

  2. Security
    - Row Level Security (RLS) policies
    - Audit logging system
    - User deletion triggers

  3. Functions & Triggers
    - Updated at timestamps
    - Stock level management
    - Delivery status validation
    - Audit logging
*/

-- Create updated_at column function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create stores table
CREATE TABLE IF NOT EXISTS stores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text,
  city text,
  state text,
  country text,
  phone text,
  email text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create employees table
CREATE TABLE IF NOT EXISTS employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  position text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text,
  avatar text,
  department text NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'logistics_specialist', 'driver', 'warehouse_worker')),
  store_id uuid NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  start_date date NOT NULL,
  status text NOT NULL CHECK (status IN ('active', 'on-leave', 'terminated')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text,
  city text,
  state_province text,
  country text,
  postal_code text,
  latitude numeric,
  longitude numeric,
  website text,
  tax_id text,
  registration_number text,
  business_hours text,
  contact_email text,
  contact_phone text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  price numeric NOT NULL CHECK (price >= 0),
  cost numeric NOT NULL CHECK (cost >= 0),
  stock smallint NOT NULL DEFAULT 0 CHECK (stock >= 0),
  reorder_level smallint NOT NULL DEFAULT 0 CHECK (reorder_level >= 0),
  supplier_id uuid NOT NULL REFERENCES suppliers(id),
  image_url text,
  expiry_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create deliveries table
CREATE TABLE IF NOT EXISTS deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id uuid NOT NULL,
  supplier_name text NOT NULL,
  status text NOT NULL CHECK (status IN ('pending', 'in-transit', 'delivered', 'canceled')),
  expected_date timestamptz NOT NULL CHECK (expected_date >= now()::date),
  delivered_date timestamptz CHECK (delivered_date IS NULL OR delivered_date <= now()),
  total_amount numeric NOT NULL CHECK (total_amount >= 0),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT deliveries_dates_check CHECK (delivered_date IS NULL OR delivered_date >= expected_date)
);

-- Create delivery_items table
CREATE TABLE IF NOT EXISTS delivery_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_id uuid NOT NULL REFERENCES deliveries(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  product_name text NOT NULL,
  quantity smallint NOT NULL CHECK (quantity > 0),
  unit_price numeric NOT NULL CHECK (unit_price >= 0),
  total_price numeric NOT NULL CHECK (total_price >= 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create warehouse_locations table
CREATE TABLE IF NOT EXISTS warehouse_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id uuid NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  name text NOT NULL,
  address text,
  city text,
  state_province text,
  country text,
  postal_code text,
  latitude numeric,
  longitude numeric,
  contact_name text,
  contact_phone text,
  contact_email text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create supplier_products table
CREATE TABLE IF NOT EXISTS supplier_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id uuid NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  sku text,
  cost numeric NOT NULL CHECK (cost >= 0),
  price numeric NOT NULL CHECK (price >= 0),
  reorder_level smallint NOT NULL DEFAULT 0 CHECK (reorder_level >= 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT supplier_products_unique UNIQUE (supplier_id, product_id)
);

-- Create inventory table
CREATE TABLE IF NOT EXISTS inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  warehouse_id uuid NOT NULL REFERENCES warehouse_locations(id) ON DELETE CASCADE,
  supplier_product_id uuid NOT NULL REFERENCES supplier_products(id) ON DELETE CASCADE,
  stock_level smallint NOT NULL DEFAULT 0 CHECK (stock_level >= 0),
  min_threshold smallint NOT NULL DEFAULT 0 CHECK (min_threshold >= 0),
  max_threshold smallint NOT NULL DEFAULT 0 CHECK (max_threshold >= 0),
  last_stock_update timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create inventory_history table
CREATE TABLE IF NOT EXISTS inventory_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inventory_id uuid NOT NULL REFERENCES inventory(id) ON DELETE CASCADE,
  transaction_type text NOT NULL CHECK (transaction_type IN ('inbound', 'outbound', 'adjustment')),
  quantity smallint NOT NULL,
  transaction_date timestamptz DEFAULT now(),
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Create gas_cards table
CREATE TABLE IF NOT EXISTS gas_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  card_number text NOT NULL UNIQUE,
  employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  balance numeric NOT NULL DEFAULT 0 CHECK (balance >= 0),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'blocked', 'expired')),
  expiry_date date NOT NULL,
  last_used timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create problem_reports table
CREATE TABLE IF NOT EXISTS problem_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES employees(id),
  type text NOT NULL CHECK (type IN ('delivery', 'product', 'vehicle', 'other')),
  description text NOT NULL,
  image_url text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'resolved')),
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  resolved_at timestamptz
);

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name text NOT NULL,
  record_id uuid NOT NULL,
  operation text NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
  old_data jsonb,
  new_data jsonb,
  changed_by uuid NOT NULL,
  changed_at timestamptz DEFAULT now()
);

-- Create invitations table
CREATE TABLE IF NOT EXISTS invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'logistics_specialist', 'driver', 'warehouse_worker')),
  store_id uuid NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  token text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouse_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE gas_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE problem_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
CREATE POLICY "Allow authenticated users to read stores"
  ON stores FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to read employees"
  ON employees FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to read products"
  ON products FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to read suppliers"
  ON suppliers FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to read deliveries"
  ON deliveries FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to read delivery_items"
  ON delivery_items FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to read warehouse_locations"
  ON warehouse_locations FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to read supplier_products"
  ON supplier_products FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to read inventory"
  ON inventory FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to read inventory_history"
  ON inventory_history FOR SELECT TO authenticated USING (true);

CREATE POLICY "Drivers can view their own gas cards"
  ON gas_cards FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM employees
    WHERE id = gas_cards.employee_id
    AND employees.id = auth.uid()
    AND employees.role = 'driver'
  ));

CREATE POLICY "Employees can view their own reports"
  ON problem_reports FOR SELECT TO authenticated
  USING (employee_id = auth.uid());

CREATE POLICY "Allow authenticated users to read audit_logs"
  ON audit_logs FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to read invitations"
  ON invitations FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM employees
    WHERE employees.id = auth.uid()
    AND employees.store_id = invitations.store_id
    AND employees.role IN ('admin', 'logistics_specialist')
  ));

-- Create Functions
CREATE OR REPLACE FUNCTION process_audit_trigger()
RETURNS TRIGGER AS $$
DECLARE
    v_changed_by uuid;
BEGIN
    v_changed_by := coalesce(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid);
    
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_logs (table_name, record_id, operation, new_data, changed_by)
        VALUES (TG_TABLE_NAME, NEW.id, TG_OP, to_jsonb(NEW), v_changed_by);
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_logs (table_name, record_id, operation, old_data, new_data, changed_by)
        VALUES (TG_TABLE_NAME, NEW.id, TG_OP, to_jsonb(OLD), to_jsonb(NEW), v_changed_by);
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_logs (table_name, record_id, operation, old_data, changed_by)
        VALUES (TG_TABLE_NAME, OLD.id, TG_OP, to_jsonb(OLD), v_changed_by);
        RETURN OLD;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION validate_delivery_status_transition()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status = 'pending' AND NEW.status NOT IN ('in-transit', 'canceled') THEN
        RAISE EXCEPTION 'Invalid status transition from pending to %', NEW.status;
    ELSIF OLD.status = 'in-transit' AND NEW.status NOT IN ('delivered', 'canceled') THEN
        RAISE EXCEPTION 'Invalid status transition from in-transit to %', NEW.status;
    ELSIF OLD.status IN ('delivered', 'canceled') AND OLD.status != NEW.status THEN
        RAISE EXCEPTION 'Cannot change status once delivery is % to %', OLD.status, NEW.status;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_stock_on_delivery_status()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'delivered' AND OLD.status != 'delivered' THEN
        UPDATE products p
        SET stock = p.stock + di.quantity
        FROM delivery_items di
        WHERE di.delivery_id = NEW.id
        AND di.product_id = p.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION check_stock_levels()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.stock < 0 THEN
        RAISE EXCEPTION 'Stock cannot be negative';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION handle_auth_user_deleted()
RETURNS trigger AS $$
BEGIN
  DELETE FROM employees WHERE id = OLD.id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create Triggers
CREATE TRIGGER update_stores_updated_at
    BEFORE UPDATE ON stores
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employees_updated_at
    BEFORE UPDATE ON employees
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_suppliers_updated_at
    BEFORE UPDATE ON suppliers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deliveries_updated_at
    BEFORE UPDATE ON deliveries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_delivery_items_updated_at
    BEFORE UPDATE ON delivery_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_warehouse_locations_updated_at
    BEFORE UPDATE ON warehouse_locations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_supplier_products_updated_at
    BEFORE UPDATE ON supplier_products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_updated_at
    BEFORE UPDATE ON inventory
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gas_cards_updated_at
    BEFORE UPDATE ON gas_cards
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_problem_reports_updated_at
    BEFORE UPDATE ON problem_reports
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER validate_delivery_status_trigger
    BEFORE UPDATE OF status ON deliveries
    FOR EACH ROW
    EXECUTE FUNCTION validate_delivery_status_transition();

CREATE TRIGGER update_stock_on_delivery_trigger
    AFTER UPDATE OF status ON deliveries
    FOR EACH ROW
    EXECUTE FUNCTION update_stock_on_delivery_status();

CREATE TRIGGER check_stock_levels_trigger
    BEFORE UPDATE OF stock ON products
    FOR EACH ROW
    EXECUTE FUNCTION check_stock_levels();

CREATE TRIGGER on_auth_user_deleted
    AFTER DELETE ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_auth_user_deleted();

-- Create Indexes
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_supplier_id ON products(supplier_id);
CREATE INDEX idx_products_stock_status ON products (id, name, category, price, stock, reorder_level)
WHERE stock <= reorder_level;
CREATE INDEX idx_products_name_category ON products (category, name);

CREATE INDEX idx_deliveries_status ON deliveries(status);
CREATE INDEX idx_deliveries_supplier_id ON deliveries(supplier_id);
CREATE INDEX idx_deliveries_status_dates ON deliveries (id, status, expected_date, delivered_date, supplier_name)
WHERE status IN ('pending', 'in-transit');
CREATE INDEX idx_deliveries_pending ON deliveries (expected_date)
WHERE status = 'pending';
CREATE INDEX idx_deliveries_in_transit ON deliveries (expected_date)
WHERE status = 'in-transit';

CREATE INDEX idx_delivery_items_delivery_id ON delivery_items(delivery_id);
CREATE INDEX idx_delivery_items_product_id ON delivery_items(product_id);

CREATE INDEX idx_employees_department ON employees(department);
CREATE INDEX idx_employees_status ON employees(status);
CREATE INDEX idx_employees_store ON employees(store_id);
CREATE INDEX idx_employees_role ON employees(role);
CREATE INDEX idx_employees_active_dept ON employees (id, name, position, department, email)
WHERE status = 'active';
CREATE INDEX idx_employees_department_name ON employees (department, name);

CREATE INDEX idx_suppliers_city ON suppliers(city);
CREATE INDEX idx_suppliers_country ON suppliers(country);
CREATE INDEX idx_suppliers_postal_code ON suppliers(postal_code);
CREATE INDEX idx_suppliers_name ON suppliers(name);

CREATE INDEX idx_warehouse_locations_supplier_id ON warehouse_locations(supplier_id);
CREATE INDEX idx_warehouse_locations_city ON warehouse_locations(city);
CREATE INDEX idx_warehouse_locations_country ON warehouse_locations(country);
CREATE INDEX idx_warehouse_locations_postal_code ON warehouse_locations(postal_code);

CREATE INDEX idx_supplier_products_composite ON supplier_products (supplier_id, product_id, cost, price);

CREATE INDEX idx_inventory_warehouse_id ON inventory(warehouse_id);
CREATE INDEX idx_inventory_supplier_product_id ON inventory(supplier_product_id);
CREATE INDEX idx_inventory_composite ON inventory (warehouse_id, supplier_product_id, stock_level);

CREATE INDEX idx_inventory_history_inventory_id ON inventory_history(inventory_id);
CREATE INDEX idx_inventory_history_transaction_date ON inventory_history(transaction_date);

CREATE INDEX idx_gas_cards_employee ON gas_cards(employee_id);
CREATE INDEX idx_gas_cards_status ON gas_cards(status);

CREATE INDEX idx_problem_reports_employee ON problem_reports(employee_id);
CREATE INDEX idx_problem_reports_status ON problem_reports(status);
CREATE INDEX idx_problem_reports_type ON problem_reports(type);

CREATE INDEX idx_audit_logs_table_record ON audit_logs (table_name, record_id);
CREATE INDEX idx_audit_logs_changed_by ON audit_logs (changed_by);
CREATE INDEX idx_audit_logs_changed_at ON audit_logs (changed_at);
CREATE INDEX idx_audit_logs_operation_date ON audit_logs (operation, changed_at);

CREATE INDEX idx_invitations_email ON invitations(email);
CREATE INDEX idx_invitations_token ON invitations(token);
CREATE INDEX idx_invitations_store ON invitations(store_id);

-- Create full text search capabilities
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX idx_products_name_trgm ON products USING gin (name gin_trgm_ops);
CREATE INDEX idx_suppliers_name_trgm ON suppliers USING gin (name gin_trgm_ops);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA auth TO postgres;
GRANT SELECT ON auth.users TO postgres;

-- Set statistics targets for better query planning
ALTER TABLE products ALTER COLUMN category SET STATISTICS 1000;
ALTER TABLE deliveries ALTER COLUMN status SET STATISTICS 1000;
ALTER TABLE employees ALTER COLUMN department SET STATISTICS 1000;

-- Analyze tables
ANALYZE stores;
ANALYZE employees;
ANALYZE products;
ANALYZE suppliers;
ANALYZE deliveries;
ANALYZE delivery_items;
ANALYZE warehouse_locations;
ANALYZE supplier_products;
ANALYZE inventory;
ANALYZE inventory_history;
ANALYZE gas_cards;
ANALYZE problem_reports;
ANALYZE audit_logs;
ANALYZE invitations;