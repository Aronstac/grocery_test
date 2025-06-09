/*
  # Seed Initial Data for Grocery Logistics System

  This migration populates the database with realistic test data for development and demonstration purposes.

  ## Data Overview
  1. **Stores** - 2 grocery store locations
  2. **Employees** - 5 employees covering all roles (admin, logistics, drivers, warehouse)
  3. **Product Categories** - 5 main categories for grocery items
  4. **Products** - 8 products with realistic pricing and stock levels
  5. **Suppliers** - 3 suppliers with warehouse locations
  6. **Deliveries** - 3 deliveries in different statuses with items
  7. **Inventory** - Stock tracking and transaction history
  8. **Gas Cards** - Driver fuel cards with transaction history
  9. **Problem Reports** - Sample issue reports from field staff
  10. **System Data** - Shifts, invitations, notifications, audit logs

  ## Important Notes
  - All UUIDs are generated using gen_random_uuid()
  - Foreign key relationships are properly maintained
  - Data follows business logic and schema constraints
  - Timestamps use realistic dates for testing
*/

-- Insert stores
INSERT INTO stores (name, address, city, state, country, postal_code, phone, email, timezone) VALUES
('FreshMart Central', '123 Main Street', 'Kyiv', 'Kyiv Oblast', 'UA', '01001', '+380441234567', 'central@freshmart.ua', 'Europe/Kiev'),
('GreenGrocer East', '456 Oak Avenue', 'Kharkiv', 'Kharkiv Oblast', 'UA', '61000', '+380577654321', 'east@greengrocer.ua', 'Europe/Kiev');

-- Insert product categories
INSERT INTO product_categories (name, description, sort_order) VALUES
('Produce', 'Fresh fruits and vegetables', 1),
('Dairy', 'Milk, cheese, yogurt and dairy products', 2),
('Bakery', 'Fresh bread, pastries and baked goods', 3),
('Meat', 'Fresh and processed meat products', 4),
('Beverage', 'Drinks and beverages', 5);

-- Insert suppliers
INSERT INTO suppliers (name, address, city, state_province, country, postal_code, contact_email, contact_phone, business_hours) VALUES
('Fresh Farms Co.', 'Rural Route 1', 'Poltava', 'Poltava Oblast', 'UA', '36000', 'orders@freshfarms.ua', '+380532111222', 'Mon-Fri 6:00-18:00'),
('Dairy Valley Ltd.', '789 Milk Road', 'Lviv', 'Lviv Oblast', 'UA', '79000', 'sales@dairyvalley.ua', '+380322333444', 'Mon-Sat 7:00-19:00'),
('Metro Wholesale', '321 Commerce Blvd', 'Dnipro', 'Dnipropetrovsk Oblast', 'UA', '49000', 'wholesale@metro.ua', '+380563555666', 'Mon-Sun 8:00-20:00');

-- Insert warehouse locations
INSERT INTO warehouse_locations (supplier_id, name, address, city, state_province, country, postal_code, contact_email, contact_phone, coordinates, capacity_cubic_meters, temperature_controlled) VALUES
((SELECT id FROM suppliers WHERE name = 'Fresh Farms Co.'), 'Fresh Farms Main Warehouse', 'Rural Route 1', 'Poltava', 'Poltava Oblast', 'UA', '36000', 'warehouse@freshfarms.ua', '+380532111223', POINT(34.5514, 49.5883), 5000.00, true),
((SELECT id FROM suppliers WHERE name = 'Dairy Valley Ltd.'), 'Dairy Valley Cold Storage', '789 Milk Road', 'Lviv', 'Lviv Oblast', 'UA', '79000', 'storage@dairyvalley.ua', '+380322333445', POINT(24.0297, 49.8397), 3000.00, true),
((SELECT id FROM suppliers WHERE name = 'Metro Wholesale'), 'Metro Distribution Center', '321 Commerce Blvd', 'Dnipro', 'Dnipropetrovsk Oblast', 'UA', '49000', 'distribution@metro.ua', '+380563555667', POINT(35.0462, 48.4647), 8000.00, false);

-- Insert products
INSERT INTO products (name, description, category, price, cost, stock, reorder_level, sku, barcode, supplier_id, image_url, weight_grams, requires_refrigeration) VALUES
('Organic Bananas', 'Fresh organic bananas from local farms', 'produce', 2.99, 1.80, 150, 30, 'PROD-BAN-001', '1234567890123', (SELECT id FROM suppliers WHERE name = 'Fresh Farms Co.'), 'https://images.pexels.com/photos/1093038/pexels-photo-1093038.jpeg', 120.00, false),
('Whole Milk 1L', 'Fresh whole milk in 1-liter cartons', 'dairy', 1.89, 1.20, 80, 20, 'PROD-MLK-001', '2345678901234', (SELECT id FROM suppliers WHERE name = 'Dairy Valley Ltd.'), 'https://images.pexels.com/photos/236010/pexels-photo-236010.jpeg', 1030.00, true),
('Sourdough Bread', 'Artisan sourdough bread baked fresh daily', 'bakery', 4.49, 2.50, 25, 10, 'PROD-BRD-001', '3456789012345', (SELECT id FROM suppliers WHERE name = 'Metro Wholesale'), 'https://images.pexels.com/photos/209206/pexels-photo-209206.jpeg', 500.00, false),
('Ground Beef 500g', 'Fresh ground beef, 85% lean', 'meat', 8.99, 6.50, 40, 15, 'PROD-BEF-001', '4567890123456', (SELECT id FROM suppliers WHERE name = 'Fresh Farms Co.'), 'https://images.pexels.com/photos/2338407/pexels-photo-2338407.jpeg', 500.00, true),
('Orange Juice 1L', 'Fresh squeezed orange juice, no pulp', 'beverage', 3.79, 2.30, 60, 15, 'PROD-OJ-001', '5678901234567', (SELECT id FROM suppliers WHERE name = 'Fresh Farms Co.'), 'https://images.pexels.com/photos/1346155/pexels-photo-1346155.jpeg', 1050.00, true),
('Cheddar Cheese 200g', 'Aged cheddar cheese, sharp flavor', 'dairy', 5.99, 3.80, 35, 12, 'PROD-CHE-001', '6789012345678', (SELECT id FROM suppliers WHERE name = 'Dairy Valley Ltd.'), 'https://images.pexels.com/photos/773253/pexels-photo-773253.jpeg', 200.00, true),
('Croissants 6-pack', 'Buttery French croissants, pack of 6', 'bakery', 6.49, 3.90, 20, 8, 'PROD-CRO-001', '7890123456789', (SELECT id FROM suppliers WHERE name = 'Metro Wholesale'), 'https://images.pexels.com/photos/2135/food-france-morning-breakfast.jpg', 300.00, false),
('Sparkling Water 500ml', 'Natural sparkling mineral water', 'beverage', 1.49, 0.90, 120, 25, 'PROD-SW-001', '8901234567890', (SELECT id FROM suppliers WHERE name = 'Metro Wholesale'), 'https://images.pexels.com/photos/416528/pexels-photo-416528.jpeg', 500.00, false);

-- Insert supplier products relationships
INSERT INTO supplier_products (supplier_id, product_id, sku, cost, price, minimum_order_quantity, lead_time_days, reorder_level) VALUES
((SELECT id FROM suppliers WHERE name = 'Fresh Farms Co.'), (SELECT id FROM products WHERE sku = 'PROD-BAN-001'), 'FF-BAN-001', 1.80, 2.99, 50, 2, 30),
((SELECT id FROM suppliers WHERE name = 'Dairy Valley Ltd.'), (SELECT id FROM products WHERE sku = 'PROD-MLK-001'), 'DV-MLK-001', 1.20, 1.89, 24, 1, 20),
((SELECT id FROM suppliers WHERE name = 'Metro Wholesale'), (SELECT id FROM products WHERE sku = 'PROD-BRD-001'), 'MW-BRD-001', 2.50, 4.49, 12, 1, 10),
((SELECT id FROM suppliers WHERE name = 'Fresh Farms Co.'), (SELECT id FROM products WHERE sku = 'PROD-BEF-001'), 'FF-BEF-001', 6.50, 8.99, 20, 1, 15),
((SELECT id FROM suppliers WHERE name = 'Fresh Farms Co.'), (SELECT id FROM products WHERE sku = 'PROD-OJ-001'), 'FF-OJ-001', 2.30, 3.79, 24, 2, 15),
((SELECT id FROM suppliers WHERE name = 'Dairy Valley Ltd.'), (SELECT id FROM products WHERE sku = 'PROD-CHE-001'), 'DV-CHE-001', 3.80, 5.99, 10, 3, 12),
((SELECT id FROM suppliers WHERE name = 'Metro Wholesale'), (SELECT id FROM products WHERE sku = 'PROD-CRO-001'), 'MW-CRO-001', 3.90, 6.49, 6, 1, 8),
((SELECT id FROM suppliers WHERE name = 'Metro Wholesale'), (SELECT id FROM products WHERE sku = 'PROD-SW-001'), 'MW-SW-001', 0.90, 1.49, 48, 1, 25);

-- Insert inventory records
INSERT INTO inventory (warehouse_id, supplier_product_id, stock_level, min_threshold, max_threshold, location_code) VALUES
((SELECT wl.id FROM warehouse_locations wl JOIN suppliers s ON wl.supplier_id = s.id WHERE s.name = 'Fresh Farms Co.'), (SELECT sp.id FROM supplier_products sp JOIN suppliers s ON sp.supplier_id = s.id JOIN products p ON sp.product_id = p.id WHERE s.name = 'Fresh Farms Co.' AND p.sku = 'PROD-BAN-001'), 150, 30, 200, 'A-01-01'),
((SELECT wl.id FROM warehouse_locations wl JOIN suppliers s ON wl.supplier_id = s.id WHERE s.name = 'Dairy Valley Ltd.'), (SELECT sp.id FROM supplier_products sp JOIN suppliers s ON sp.supplier_id = s.id JOIN products p ON sp.product_id = p.id WHERE s.name = 'Dairy Valley Ltd.' AND p.sku = 'PROD-MLK-001'), 80, 20, 120, 'B-02-01'),
((SELECT wl.id FROM warehouse_locations wl JOIN suppliers s ON wl.supplier_id = s.id WHERE s.name = 'Metro Wholesale'), (SELECT sp.id FROM supplier_products sp JOIN suppliers s ON sp.supplier_id = s.id JOIN products p ON sp.product_id = p.id WHERE s.name = 'Metro Wholesale' AND p.sku = 'PROD-BRD-001'), 25, 10, 50, 'C-03-01'),
((SELECT wl.id FROM warehouse_locations wl JOIN suppliers s ON wl.supplier_id = s.id WHERE s.name = 'Fresh Farms Co.'), (SELECT sp.id FROM supplier_products sp JOIN suppliers s ON sp.supplier_id = s.id JOIN products p ON sp.product_id = p.id WHERE s.name = 'Fresh Farms Co.' AND p.sku = 'PROD-BEF-001'), 40, 15, 80, 'A-01-02'),
((SELECT wl.id FROM warehouse_locations wl JOIN suppliers s ON wl.supplier_id = s.id WHERE s.name = 'Fresh Farms Co.'), (SELECT sp.id FROM supplier_products sp JOIN suppliers s ON sp.supplier_id = s.id JOIN products p ON sp.product_id = p.id WHERE s.name = 'Fresh Farms Co.' AND p.sku = 'PROD-OJ-001'), 60, 15, 100, 'A-01-03'),
((SELECT wl.id FROM warehouse_locations wl JOIN suppliers s ON wl.supplier_id = s.id WHERE s.name = 'Dairy Valley Ltd.'), (SELECT sp.id FROM supplier_products sp JOIN suppliers s ON sp.supplier_id = s.id JOIN products p ON sp.product_id = p.id WHERE s.name = 'Dairy Valley Ltd.' AND p.sku = 'PROD-CHE-001'), 35, 12, 60, 'B-02-02'),
((SELECT wl.id FROM warehouse_locations wl JOIN suppliers s ON wl.supplier_id = s.id WHERE s.name = 'Metro Wholesale'), (SELECT sp.id FROM supplier_products sp JOIN suppliers s ON sp.supplier_id = s.id JOIN products p ON sp.product_id = p.id WHERE s.name = 'Metro Wholesale' AND p.sku = 'PROD-CRO-001'), 20, 8, 40, 'C-03-02'),
((SELECT wl.id FROM warehouse_locations wl JOIN suppliers s ON wl.supplier_id = s.id WHERE s.name = 'Metro Wholesale'), (SELECT sp.id FROM supplier_products sp JOIN suppliers s ON sp.supplier_id = s.id JOIN products p ON sp.product_id = p.id WHERE s.name = 'Metro Wholesale' AND p.sku = 'PROD-SW-001'), 120, 25, 200, 'C-03-03');

-- Insert employees (using gen_random_uuid() for id)
INSERT INTO employees (id, store_id, employee_number, name, email, phone, position, department, role, status, hire_date, avatar) VALUES
(gen_random_uuid(), (SELECT id FROM stores WHERE name = 'FreshMart Central'), 'EMP-001', 'John Smith', 'john.smith@freshmart.ua', '+380441111111', 'Store Manager', 'Management', 'admin', 'active', '2023-01-15', 'https://randomuser.me/api/portraits/men/1.jpg'),
(gen_random_uuid(), (SELECT id FROM stores WHERE name = 'FreshMart Central'), 'EMP-002', 'Maria Kovalenko', 'maria.kovalenko@freshmart.ua', '+380442222222', 'Logistics Coordinator', 'Logistics', 'logistics_specialist', 'active', '2023-03-20', 'https://randomuser.me/api/portraits/women/2.jpg'),
(gen_random_uuid(), (SELECT id FROM stores WHERE name = 'FreshMart Central'), 'EMP-003', 'Oleksandr Petrenko', 'oleksandr.petrenko@freshmart.ua', '+380443333333', 'Delivery Driver', 'Logistics', 'driver', 'active', '2023-05-10', 'https://randomuser.me/api/portraits/men/3.jpg'),
(gen_random_uuid(), (SELECT id FROM stores WHERE name = 'GreenGrocer East'), 'EMP-004', 'Oksana Shevchenko', 'oksana.shevchenko@greengrocer.ua', '+380444444444', 'Delivery Driver', 'Logistics', 'driver', 'active', '2023-07-01', 'https://randomuser.me/api/portraits/women/4.jpg'),
(gen_random_uuid(), (SELECT id FROM stores WHERE name = 'GreenGrocer East'), 'EMP-005', 'Viktor Bondarenko', 'viktor.bondarenko@greengrocer.ua', '+380445555555', 'Warehouse Associate', 'Warehouse', 'warehouse_worker', 'active', '2023-08-15', 'https://randomuser.me/api/portraits/men/5.jpg');

-- Insert deliveries
INSERT INTO deliveries (delivery_number, supplier_id, supplier_name, store_id, status, expected_date, actual_delivery_date, total_amount, total_items, driver_id, notes) VALUES
('DEL-20250601-001', (SELECT id FROM suppliers WHERE name = 'Fresh Farms Co.'), 'Fresh Farms Co.', (SELECT id FROM stores WHERE name = 'FreshMart Central'), 'delivered', '2025-06-01 10:00:00+00', '2025-06-01 09:45:00+00', 450.75, 3, (SELECT id FROM employees WHERE email = 'oleksandr.petrenko@freshmart.ua'), 'Delivered on time, all items in good condition'),
('DEL-20250602-001', (SELECT id FROM suppliers WHERE name = 'Dairy Valley Ltd.'), 'Dairy Valley Ltd.', (SELECT id FROM stores WHERE name = 'GreenGrocer East'), 'in-transit', '2025-06-02 14:00:00+00', NULL, 285.50, 2, (SELECT id FROM employees WHERE email = 'oksana.shevchenko@greengrocer.ua'), 'En route to destination'),
('DEL-20250603-001', (SELECT id FROM suppliers WHERE name = 'Metro Wholesale'), 'Metro Wholesale', (SELECT id FROM stores WHERE name = 'FreshMart Central'), 'pending', '2025-06-03 11:30:00+00', NULL, 195.25, 2, NULL, 'Awaiting driver assignment');

-- Insert delivery items
INSERT INTO delivery_items (delivery_id, product_id, product_name, sku, quantity, unit_price, received_quantity, batch_number) VALUES
((SELECT id FROM deliveries WHERE delivery_number = 'DEL-20250601-001'), (SELECT id FROM products WHERE sku = 'PROD-BAN-001'), 'Organic Bananas', 'PROD-BAN-001', 100, 1.80, 100, 'BATCH-BAN-20250601'),
((SELECT id FROM deliveries WHERE delivery_number = 'DEL-20250601-001'), (SELECT id FROM products WHERE sku = 'PROD-BEF-001'), 'Ground Beef 500g', 'PROD-BEF-001', 30, 6.50, 30, 'BATCH-BEF-20250601'),
((SELECT id FROM deliveries WHERE delivery_number = 'DEL-20250601-001'), (SELECT id FROM products WHERE sku = 'PROD-OJ-001'), 'Orange Juice 1L', 'PROD-OJ-001', 40, 2.30, 40, 'BATCH-OJ-20250601'),
((SELECT id FROM deliveries WHERE delivery_number = 'DEL-20250602-001'), (SELECT id FROM products WHERE sku = 'PROD-MLK-001'), 'Whole Milk 1L', 'PROD-MLK-001', 120, 1.20, 0, 'BATCH-MLK-20250602'),
((SELECT id FROM deliveries WHERE delivery_number = 'DEL-20250602-001'), (SELECT id FROM products WHERE sku = 'PROD-CHE-001'), 'Cheddar Cheese 200g', 'PROD-CHE-001', 25, 3.80, 0, 'BATCH-CHE-20250602'),
((SELECT id FROM deliveries WHERE delivery_number = 'DEL-20250603-001'), (SELECT id FROM products WHERE sku = 'PROD-BRD-001'), 'Sourdough Bread', 'PROD-BRD-001', 20, 2.50, 0, 'BATCH-BRD-20250603');

-- Insert delivery routes
INSERT INTO delivery_routes (route_name, driver_id, route_date, estimated_distance_km, estimated_duration_minutes, actual_distance_km, actual_duration_minutes, status, notes) VALUES
('Route Central-001', (SELECT id FROM employees WHERE email = 'oleksandr.petrenko@freshmart.ua'), '2025-06-01', 25.5, 45, 26.2, 42, 'completed', 'Efficient route, arrived early'),
('Route East-001', (SELECT id FROM employees WHERE email = 'oksana.shevchenko@greengrocer.ua'), '2025-06-02', 32.8, 55, NULL, NULL, 'in_progress', 'Currently en route');

-- Insert delivery events
INSERT INTO delivery_events (delivery_id, event_type, event_status, event_timestamp, location_address, notes, created_by) VALUES
((SELECT id FROM deliveries WHERE delivery_number = 'DEL-20250601-001'), 'created', 'completed', '2025-06-01 08:00:00+00', 'Fresh Farms Co. Warehouse', 'Delivery order created', (SELECT id FROM employees WHERE role = 'logistics_specialist' LIMIT 1)),
((SELECT id FROM deliveries WHERE delivery_number = 'DEL-20250601-001'), 'dispatched', 'completed', '2025-06-01 08:30:00+00', 'Fresh Farms Co. Warehouse', 'Driver assigned and departed', (SELECT id FROM employees WHERE email = 'oleksandr.petrenko@freshmart.ua')),
((SELECT id FROM deliveries WHERE delivery_number = 'DEL-20250601-001'), 'arrived', 'completed', '2025-06-01 09:45:00+00', 'FreshMart Central', 'Arrived at destination', (SELECT id FROM employees WHERE email = 'oleksandr.petrenko@freshmart.ua')),
((SELECT id FROM deliveries WHERE delivery_number = 'DEL-20250601-001'), 'completed', 'completed', '2025-06-01 10:15:00+00', 'FreshMart Central', 'Delivery completed successfully', (SELECT id FROM employees WHERE email = 'oleksandr.petrenko@freshmart.ua')),
((SELECT id FROM deliveries WHERE delivery_number = 'DEL-20250602-001'), 'created', 'completed', '2025-06-02 09:00:00+00', 'Dairy Valley Ltd. Warehouse', 'Delivery order created', (SELECT id FROM employees WHERE role = 'logistics_specialist' LIMIT 1)),
((SELECT id FROM deliveries WHERE delivery_number = 'DEL-20250602-001'), 'dispatched', 'completed', '2025-06-02 10:00:00+00', 'Dairy Valley Ltd. Warehouse', 'Driver assigned and departed', (SELECT id FROM employees WHERE email = 'oksana.shevchenko@greengrocer.ua')),
((SELECT id FROM deliveries WHERE delivery_number = 'DEL-20250602-001'), 'in_transit', 'in_progress', '2025-06-02 12:30:00+00', 'Highway M03', 'En route to destination', (SELECT id FROM employees WHERE email = 'oksana.shevchenko@greengrocer.ua'));

-- Insert gas cards
INSERT INTO gas_cards (card_number, employee_id, balance, credit_limit, status, expiry_date, daily_limit, monthly_limit) VALUES
('GC-4567-8901-2345', (SELECT id FROM employees WHERE email = 'oleksandr.petrenko@freshmart.ua'), 750.00, 1500.00, 'active', '2026-12-31', 200.00, 2000.00),
('GC-5678-9012-3456', (SELECT id FROM employees WHERE email = 'oksana.shevchenko@greengrocer.ua'), 825.50, 1500.00, 'active', '2026-12-31', 200.00, 2000.00);

-- Insert gas card transactions
INSERT INTO gas_card_transactions (gas_card_id, transaction_type, amount, previous_balance, new_balance, merchant_name, location, fuel_type, fuel_quantity_liters, transaction_timestamp) VALUES
((SELECT id FROM gas_cards WHERE card_number = 'GC-4567-8901-2345'), 'purchase', 65.75, 815.75, 750.00, 'Shell Station', 'Kyiv, Khreshchatyk St.', 'Diesel', 45.50, '2025-06-01 11:30:00+00'),
((SELECT id FROM gas_cards WHERE card_number = 'GC-4567-8901-2345'), 'purchase', 58.20, 750.00, 691.80, 'WOG Station', 'Kyiv, Peremohy Ave.', 'Diesel', 40.25, '2025-05-30 14:15:00+00'),
((SELECT id FROM gas_cards WHERE card_number = 'GC-5678-9012-3456'), 'purchase', 72.30, 897.80, 825.50, 'OKKO Station', 'Kharkiv, Sumska St.', 'Diesel', 50.75, '2025-06-02 09:45:00+00');

-- Insert inventory transactions
INSERT INTO inventory_transactions (inventory_id, transaction_type, quantity_change, previous_stock, new_stock, unit_cost, reference_type, notes) VALUES
((SELECT i.id FROM inventory i JOIN supplier_products sp ON i.supplier_product_id = sp.id JOIN products p ON sp.product_id = p.id WHERE p.sku = 'PROD-BAN-001'), 'inbound', 100, 50, 150, 1.80, 'delivery', 'Delivery DEL-20250601-001'),
((SELECT i.id FROM inventory i JOIN supplier_products sp ON i.supplier_product_id = sp.id JOIN products p ON sp.product_id = p.id WHERE p.sku = 'PROD-MLK-001'), 'outbound', -15, 95, 80, 1.20, 'sale', 'Store sales'),
((SELECT i.id FROM inventory i JOIN supplier_products sp ON i.supplier_product_id = sp.id JOIN products p ON sp.product_id = p.id WHERE p.sku = 'PROD-BRD-001'), 'adjustment', -2, 27, 25, 2.50, 'damage', 'Damaged items removed');

-- Insert stock alerts
INSERT INTO stock_alerts (inventory_id, alert_type, threshold_value, current_value, message, severity) VALUES
((SELECT i.id FROM inventory i JOIN supplier_products sp ON i.supplier_product_id = sp.id JOIN products p ON sp.product_id = p.id WHERE p.sku = 'PROD-BRD-001'), 'low_stock', 10, 25, 'Sourdough Bread stock is approaching minimum threshold', 'medium'),
((SELECT i.id FROM inventory i JOIN supplier_products sp ON i.supplier_product_id = sp.id JOIN products p ON sp.product_id = p.id WHERE p.sku = 'PROD-CRO-001'), 'low_stock', 8, 20, 'Croissants stock is approaching minimum threshold', 'medium');

-- Insert problem reports
INSERT INTO problem_reports (report_number, submitted_by, type, priority, title, description, location, status, created_at) VALUES
('RPT-20250601-001', (SELECT id FROM employees WHERE email = 'oleksandr.petrenko@freshmart.ua'), 'vehicle', 'medium', 'Vehicle Air Conditioning Issue', 'The air conditioning in delivery truck #3 is not working properly. This could affect temperature-sensitive deliveries.', 'Delivery Truck #3', 'open', '2025-06-01 15:30:00+00'),
('RPT-20250602-001', (SELECT id FROM employees WHERE email = 'viktor.bondarenko@greengrocer.ua'), 'product', 'high', 'Damaged Product Shipment', 'Received a shipment of milk cartons with several damaged packages. Need to report to supplier and adjust inventory.', 'Warehouse Section B-02', 'in_progress', '2025-06-02 11:15:00+00');

-- Insert employee shifts
INSERT INTO employee_shifts (employee_id, shift_date, start_time, end_time, break_duration_minutes, status) VALUES
((SELECT id FROM employees WHERE email = 'viktor.bondarenko@greengrocer.ua'), '2025-06-01', '08:00:00', '16:00:00', 60, 'completed'),
((SELECT id FROM employees WHERE email = 'viktor.bondarenko@greengrocer.ua'), '2025-06-02', '08:00:00', '16:00:00', 60, 'in-progress');

-- Insert invitations
INSERT INTO invitations (email, role, store_id, invited_by, token, status, expires_at) VALUES
('new.driver@freshmart.ua', 'driver', (SELECT id FROM stores WHERE name = 'FreshMart Central'), (SELECT id FROM employees WHERE role = 'admin' LIMIT 1), 'inv_' || gen_random_uuid()::text, 'pending', '2025-06-10 23:59:59+00'),
('warehouse.worker@greengrocer.ua', 'warehouse_worker', (SELECT id FROM stores WHERE name = 'GreenGrocer East'), (SELECT id FROM employees WHERE role = 'admin' LIMIT 1), 'inv_' || gen_random_uuid()::text, 'pending', '2025-06-12 23:59:59+00'),
('logistics.manager@freshmart.ua', 'logistics_specialist', (SELECT id FROM stores WHERE name = 'FreshMart Central'), (SELECT id FROM employees WHERE role = 'admin' LIMIT 1), 'inv_' || gen_random_uuid()::text, 'pending', '2025-06-15 23:59:59+00');

-- Insert audit logs
INSERT INTO audit_logs (table_name, record_id, operation, new_values, user_email, created_at) VALUES
('deliveries', (SELECT id FROM deliveries WHERE delivery_number = 'DEL-20250601-001'), 'UPDATE', '{"status": "delivered", "actual_delivery_date": "2025-06-01T09:45:00Z"}', 'oleksandr.petrenko@freshmart.ua', '2025-06-01 09:45:00+00'),
('inventory', (SELECT i.id FROM inventory i JOIN supplier_products sp ON i.supplier_product_id = sp.id JOIN products p ON sp.product_id = p.id WHERE p.sku = 'PROD-BAN-001'), 'UPDATE', '{"stock_level": 150, "last_restocked_at": "2025-06-01T10:15:00Z"}', 'viktor.bondarenko@greengrocer.ua', '2025-06-01 10:15:00+00');

-- Insert notifications
INSERT INTO notifications (recipient_id, sender_id, type, title, message, priority, created_at) VALUES
((SELECT id FROM employees WHERE email = 'oleksandr.petrenko@freshmart.ua'), (SELECT id FROM employees WHERE role = 'logistics_specialist' LIMIT 1), 'delivery_assignment', 'New Delivery Assignment', 'You have been assigned delivery DEL-20250601-001 scheduled for 10:00 AM today.', 'high', '2025-06-01 08:00:00+00'),
((SELECT id FROM employees WHERE email = 'viktor.bondarenko@greengrocer.ua'), (SELECT id FROM employees WHERE role = 'logistics_specialist' LIMIT 1), 'stock_alert', 'Low Stock Alert', 'Sourdough Bread inventory is running low. Current stock: 25 units, minimum threshold: 10 units.', 'medium', '2025-06-02 09:00:00+00');

-- Insert error logs
INSERT INTO error_logs (error_type, error_message, user_id, request_url, request_method, severity, created_at) VALUES
('ValidationError', 'Invalid product SKU format provided in inventory update', (SELECT id FROM employees WHERE role = 'warehouse_worker' LIMIT 1), '/api/inventory/update', 'POST', 'warning', '2025-06-01 14:30:00+00'),
('DatabaseError', 'Connection timeout while processing delivery status update', (SELECT id FROM employees WHERE role = 'driver' LIMIT 1), '/api/deliveries/status', 'PUT', 'error', '2025-06-02 16:45:00+00');