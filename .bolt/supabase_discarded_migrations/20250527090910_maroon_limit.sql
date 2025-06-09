-- Drop existing policies if they exist
DO $$
BEGIN
    DROP POLICY IF EXISTS "Allow authenticated users to read stores" ON stores;
    DROP POLICY IF EXISTS "Allow authenticated users to read employees" ON employees;
    DROP POLICY IF EXISTS "Allow authenticated users to read products" ON products;
    DROP POLICY IF EXISTS "Allow authenticated users to read suppliers" ON suppliers;
    DROP POLICY IF EXISTS "Allow authenticated users to read deliveries" ON deliveries;
    DROP POLICY IF EXISTS "Allow authenticated users to read delivery_items" ON delivery_items;
    DROP POLICY IF EXISTS "Allow authenticated users to read warehouse_locations" ON warehouse_locations;
    DROP POLICY IF EXISTS "Allow authenticated users to read supplier_products" ON supplier_products;
    DROP POLICY IF EXISTS "Allow authenticated users to read inventory" ON inventory;
    DROP POLICY IF EXISTS "Allow authenticated users to read inventory_history" ON inventory_history;
    DROP POLICY IF EXISTS "Drivers can view their own gas cards" ON gas_cards;
    DROP POLICY IF EXISTS "Employees can view their own reports" ON problem_reports;
    DROP POLICY IF EXISTS "Allow authenticated users to read audit_logs" ON audit_logs;
    DROP POLICY IF EXISTS "Allow authenticated users to read invitations" ON invitations;
END $$;

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

-- Analyze tables to update statistics
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