DO $$
DECLARE
    store_central_id UUID;
    store_east_id UUID;
    
    supplier_fresh_farms_id UUID;
    supplier_dairy_valley_id UUID;
    supplier_metro_wholesale_id UUID;

    warehouse_fresh_farms_id UUID;
    warehouse_dairy_valley_id UUID;
    warehouse_metro_wholesale_id UUID;

    category_produce_id UUID;
    category_dairy_id UUID;
    category_bakery_id UUID;
    category_meat_id UUID;
    category_beverage_id UUID;
    category_groceries_id UUID;

    product_bananas_id UUID;
    product_milk_id UUID;
    product_rye_bread_id UUID; -- Хліб Житній
    product_beef_id UUID;
    product_orange_juice_id UUID;
    product_cheddar_id UUID;
    product_croissants_id UUID;
    product_sparkling_water_id UUID;
    product_buckwheat_id UUID; -- Гречка
    product_kefir_id UUID; -- Кефір
    product_sausage_id UUID; -- Ковбаса

    supplier_product_bananas_id UUID;
    supplier_product_milk_id UUID;
    supplier_product_rye_bread_id UUID;
    supplier_product_beef_id UUID;
    supplier_product_orange_juice_id UUID;
    supplier_product_cheddar_id UUID;
    supplier_product_croissants_id UUID;
    supplier_product_sparkling_water_id UUID;
    supplier_product_buckwheat_id UUID;
    supplier_product_kefir_id UUID;
    supplier_product_sausage_id UUID;

    inventory_bananas_id UUID;
    inventory_milk_id UUID;
    inventory_rye_bread_id UUID;
    inventory_beef_id UUID;
    inventory_orange_juice_id UUID;
    inventory_cheddar_id UUID;
    inventory_croissants_id UUID;
    inventory_sparkling_water_id UUID;
    inventory_buckwheat_id UUID;
    inventory_kefir_id UUID;
    inventory_sausage_id UUID;

    employee_admin_id UUID;
    employee_logistics_id UUID;
    employee_driver1_id UUID;
    employee_driver2_id UUID;
    employee_warehouse_id UUID;

    delivery1_id UUID;
    delivery2_id UUID;
    delivery3_id UUID;

    gas_card1_id UUID;
    gas_card2_id UUID;

    problem_report1_id UUID;
    problem_report2_id UUID;

    invitation_driver_id UUID;
    invitation_warehouse_id UUID;
    invitation_logistics_id UUID;

BEGIN
    -- 1. stores
    INSERT INTO stores (name, address, city, state, country, postal_code, phone, email, timezone)
    VALUES
    ('FreshMart Центральний', 'вул. Хрещатик, 22', 'Київ', 'Київська область', 'UA', '01001', '+380441234567', 'central@freshmart.ua', 'Europe/Kyiv')
    RETURNING id INTO store_central_id;

    INSERT INTO stores (name, address, city, state, country, postal_code, phone, email, timezone)
    VALUES
    ('GreenGrocer Східний', 'пр. Гагаріна, 10', 'Харків', 'Харківська область', 'UA', '61000', '+380577654321', 'east@greengrocer.ua', 'Europe/Kyiv')
    RETURNING id INTO store_east_id;

    -- 3. product_categories
    INSERT INTO product_categories (name, description, sort_order)
    VALUES
    ('Produce', 'Свіжі фрукти та овочі', 1) RETURNING id INTO category_produce_id;
    INSERT INTO product_categories (name, description, sort_order)
    VALUES
    ('Dairy & Eggs', 'Молочні продукти та яйця', 2) RETURNING id INTO category_dairy_id;
    INSERT INTO product_categories (name, description, sort_order)
    VALUES
    ('Bakery', 'Свіжий хліб та випічка', 3) RETURNING id INTO category_bakery_id;
    INSERT INTO product_categories (name, description, sort_order)
    VALUES
    ('Meat & Seafood', 'М''ясні та рибні продукти', 4) RETURNING id INTO category_meat_id;
    INSERT INTO product_categories (name, description, sort_order)
    VALUES
    ('Beverages', 'Напої', 5) RETURNING id INTO category_beverage_id;
    INSERT INTO product_categories (name, description, sort_order)
    VALUES
    ('Groceries', 'Бакалія', 6) RETURNING id INTO category_groceries_id;

    -- 5. suppliers
    INSERT INTO suppliers (name, address, city, state_province, country, postal_code, contact_email, contact_phone, business_hours)
    VALUES
    ('Фермерські Господарства', 'с. Калинівка, вул. Центральна, 5', 'Полтава', 'Полтавська область', 'UA', '36000', 'orders@fermer.ua', '+380532111222', 'Пн-Пт 6:00-18:00')
    RETURNING id INTO supplier_fresh_farms_id;

    INSERT INTO suppliers (name, address, city, state_province, country, postal_code, contact_email, contact_phone, business_hours)
    VALUES
    ('Молочна Долина', 'вул. Молочна, 15', 'Львів', 'Львівська область', 'UA', '79000', 'sales@molokodolina.ua', '+380322333444', 'Пн-Сб 7:00-19:00')
    RETURNING id INTO supplier_dairy_valley_id;

    INSERT INTO suppliers (name, address, city, state_province, country, postal_code, contact_email, contact_phone, business_hours)
    VALUES
    ('Метро Опт', 'пр. Свободи, 1', 'Дніпро', 'Дніпропетровська область', 'UA', '49000', 'wholesale@metroopt.ua', '+380563555666', 'Пн-Нд 8:00-20:00')
    RETURNING id INTO supplier_metro_wholesale_id;

    -- 5. warehouse_locations
    INSERT INTO warehouse_locations (supplier_id, name, address, city, state_province, country, postal_code, contact_email, contact_phone, coordinates, capacity_cubic_meters, temperature_controlled)
    VALUES
    (supplier_fresh_farms_id, 'Склад Фермерських Господарств', 'с. Калинівка, вул. Центральна, 5', 'Полтава', 'Полтавська область', 'UA', '36000', 'warehouse@fermer.ua', '+380532111223', POINT(34.5514, 49.5883), 5000.00, TRUE)
    RETURNING id INTO warehouse_fresh_farms_id;

    INSERT INTO warehouse_locations (supplier_id, name, address, city, state_province, country, postal_code, contact_email, contact_phone, coordinates, capacity_cubic_meters, temperature_controlled)
    VALUES
    (supplier_dairy_valley_id, 'Холодний Склад Молочна Долина', 'вул. Молочна, 15', 'Львів', 'Львівська область', 'UA', '79000', 'storage@molokodolina.ua', '+380322333445', POINT(24.0297, 49.8397), 3000.00, TRUE)
    RETURNING id INTO warehouse_dairy_valley_id;

    INSERT INTO warehouse_locations (supplier_id, name, address, city, state_province, country, postal_code, contact_email, contact_phone, coordinates, capacity_cubic_meters, temperature_controlled)
    VALUES
    (supplier_metro_wholesale_id, 'Розподільчий Центр Метро', 'пр. Свободи, 1', 'Дніпро', 'Дніпропетровська область', 'UA', '49000', 'distribution@metroopt.ua', '+380563555667', POINT(35.0462, 48.4647), 8000.00, FALSE)
    RETURNING id INTO warehouse_metro_wholesale_id;

    -- 4. products
    INSERT INTO products (name, description, category, category_id, price, cost, stock, reorder_level, sku, barcode, supplier_id, image_url, weight_grams, requires_refrigeration)
    VALUES
    ('Органічні Банани', 'Свіжі органічні банани з місцевих ферм', 'produce', category_produce_id, 59.99, 35.00, 150, 30, 'PROD-BAN-001', '1234567890123', supplier_fresh_farms_id, 'https://images.pexels.com/photos/1093038/pexels-photo-1093038.jpeg', 120.00, FALSE)
    RETURNING id INTO product_bananas_id;

    INSERT INTO products (name, description, category, category_id, price, cost, stock, reorder_level, sku, barcode, supplier_id, image_url, weight_grams, requires_refrigeration)
    VALUES
    ('Молоко 1Л', 'Свіже цільне молоко в 1-літрових упаковках', 'dairy', category_dairy_id, 35.50, 22.00, 80, 20, 'PROD-MLK-001', '2345678901234', supplier_dairy_valley_id, 'https://images.pexels.com/photos/236010/pexels-photo-236010.jpeg', 1030.00, TRUE)
    RETURNING id INTO product_milk_id;

    INSERT INTO products (name, description, category, category_id, price, cost, stock, reorder_level, sku, barcode, supplier_id, image_url, weight_grams, requires_refrigeration)
    VALUES
    ('Хліб Житній', 'Свіжий житній хліб, випечений щодня', 'bakery', category_bakery_id, 45.00, 28.00, 25, 10, 'PROD-BRD-001', '3456789012345', supplier_metro_wholesale_id, 'https://images.pexels.com/photos/209206/pexels-photo-209206.jpeg', 500.00, FALSE)
    RETURNING id INTO product_rye_bread_id;

    INSERT INTO products (name, description, category, category_id, price, cost, stock, reorder_level, sku, barcode, supplier_id, image_url, weight_grams, requires_refrigeration)
    VALUES
    ('Яловичий Фарш 500г', 'Свіжий яловичий фарш, 85% нежирний', 'meat', category_meat_id, 180.00, 130.00, 40, 15, 'PROD-BEF-001', '4567890123456', supplier_fresh_farms_id, 'https://images.pexels.com/photos/2338407/pexels-photo-2338407.jpeg', 500.00, TRUE)
    RETURNING id INTO product_beef_id;

    INSERT INTO products (name, description, category, category_id, price, cost, stock, reorder_level, sku, barcode, supplier_id, image_url, weight_grams, requires_refrigeration)
    VALUES
    ('Апельсиновий Сік 1Л', 'Свіжовичавлений апельсиновий сік, без м''якоті', 'beverage', category_beverage_id, 75.00, 45.00, 60, 15, 'PROD-OJ-001', '5678901234567', supplier_fresh_farms_id, 'https://images.pexels.com/photos/1346155/pexels-photo-1346155.jpeg', 1050.00, TRUE)
    RETURNING id INTO product_orange_juice_id;

    INSERT INTO products (name, description, category, category_id, price, cost, stock, reorder_level, sku, barcode, supplier_id, image_url, weight_grams, requires_refrigeration)
    VALUES
    ('Сир Чеддер 200г', 'Витриманий сир чеддер, гострий смак', 'dairy', category_dairy_id, 120.00, 75.00, 35, 12, 'PROD-CHE-001', '6789012345678', supplier_dairy_valley_id, 'https://images.pexels.com/photos/773253/pexels-photo-773253.jpeg', 200.00, TRUE)
    RETURNING id INTO product_cheddar_id;

    INSERT INTO products (name, description, category, category_id, price, cost, stock, reorder_level, sku, barcode, supplier_id, image_url, weight_grams, requires_refrigeration)
    VALUES
    ('Круасани 6 шт.', 'Масляні французькі круасани, упаковка 6 шт.', 'bakery', category_bakery_id, 130.00, 78.00, 20, 8, 'PROD-CRO-001', '7890123456789', supplier_metro_wholesale_id, 'https://images.pexels.com/photos/2135/food-france-morning-breakfast.jpg', 300.00, FALSE)
    RETURNING id INTO product_croissants_id;

    INSERT INTO products (name, description, category, category_id, price, cost, stock, reorder_level, sku, barcode, supplier_id, image_url, weight_grams, requires_refrigeration)
    VALUES
    ('Газована Вода 500мл', 'Натуральна газована мінеральна вода', 'beverage', category_beverage_id, 29.00, 18.00, 120, 25, 'PROD-SW-001', '8901234567890', supplier_metro_wholesale_id, 'https://images.pexels.com/photos/416528/pexels-photo-416528.jpeg', 500.00, FALSE)
    RETURNING id INTO product_sparkling_water_id;

    INSERT INTO products (name, description, category, category_id, price, cost, stock, reorder_level, sku, barcode, supplier_id, image_url, weight_grams, requires_refrigeration)
    VALUES
    ('Гречка 1кг', 'Крупа гречана, вищий сорт', 'other', category_groceries_id, 40.00, 25.00, 100, 20, 'PROD-GRC-001', '9012345678901', supplier_fresh_farms_id, 'https://images.pexels.com/photos/4049920/pexels-photo-4049920.jpeg', 1000.00, FALSE)
    RETURNING id INTO product_buckwheat_id;

    INSERT INTO products (name, description, category, category_id, price, cost, stock, reorder_level, sku, barcode, supplier_id, image_url, weight_grams, requires_refrigeration)
    VALUES
    ('Кефір 0.5Л', 'Натуральний кефір 2.5% жирності', 'dairy', category_dairy_id, 28.00, 17.00, 70, 15, 'PROD-KFR-001', '9123456789012', supplier_dairy_valley_id, 'https://images.pexels.com/photos/4197490/pexels-photo-4197490.jpeg', 500.00, TRUE)
    RETURNING id INTO product_kefir_id;

    INSERT INTO products (name, description, category, category_id, price, cost, stock, reorder_level, sku, barcode, supplier_id, image_url, weight_grams, requires_refrigeration)
    VALUES
    ('Ковбаса Домашня', 'Домашня копчена ковбаса', 'meat', category_meat_id, 250.00, 180.00, 30, 10, 'PROD-KOL-001', '9234567890123', supplier_fresh_farms_id, 'https://images.pexels.com/photos/1624487/pexels-photo-1624487.jpeg', 700.00, TRUE)
    RETURNING id INTO product_sausage_id;

    -- supplier_products
    INSERT INTO supplier_products (supplier_id, product_id, sku, cost, price, minimum_order_quantity, lead_time_days, reorder_level)
    VALUES (supplier_fresh_farms_id, product_bananas_id, 'FF-BAN-001', 35.00, 59.99, 50, 2, 30)
    RETURNING id INTO supplier_product_bananas_id;

    INSERT INTO supplier_products (supplier_id, product_id, sku, cost, price, minimum_order_quantity, lead_time_days, reorder_level)
    VALUES (supplier_dairy_valley_id, product_milk_id, 'DV-MLK-001', 22.00, 35.50, 24, 1, 20)
    RETURNING id INTO supplier_product_milk_id;

    INSERT INTO supplier_products (supplier_id, product_id, sku, cost, price, minimum_order_quantity, lead_time_days, reorder_level)
    VALUES (supplier_metro_wholesale_id, product_rye_bread_id, 'MW-BRD-001', 28.00, 45.00, 12, 1, 10)
    RETURNING id INTO supplier_product_rye_bread_id;

    INSERT INTO supplier_products (supplier_id, product_id, sku, cost, price, minimum_order_quantity, lead_time_days, reorder_level)
    VALUES (supplier_fresh_farms_id, product_beef_id, 'FF-BEF-001', 130.00, 180.00, 20, 1, 15)
    RETURNING id INTO supplier_product_beef_id;

    INSERT INTO supplier_products (supplier_id, product_id, sku, cost, price, minimum_order_quantity, lead_time_days, reorder_level)
    VALUES (supplier_fresh_farms_id, product_orange_juice_id, 'FF-OJ-001', 45.00, 75.00, 24, 2, 15)
    RETURNING id INTO supplier_product_orange_juice_id;

    INSERT INTO supplier_products (supplier_id, product_id, sku, cost, price, minimum_order_quantity, lead_time_days, reorder_level)
    VALUES (supplier_dairy_valley_id, product_cheddar_id, 'DV-CHE-001', 75.00, 120.00, 10, 3, 12)
    RETURNING id INTO supplier_product_cheddar_id;

    INSERT INTO supplier_products (supplier_id, product_id, sku, cost, price, minimum_order_quantity, lead_time_days, reorder_level)
    VALUES (supplier_metro_wholesale_id, product_croissants_id, 'MW-CRO-001', 78.00, 130.00, 6, 1, 8)
    RETURNING id INTO supplier_product_croissants_id;

    INSERT INTO supplier_products (supplier_id, product_id, sku, cost, price, minimum_order_quantity, lead_time_days, reorder_level)
    VALUES (supplier_metro_wholesale_id, product_sparkling_water_id, 'MW-SW-001', 18.00, 29.00, 48, 1, 25)
    RETURNING id INTO supplier_product_sparkling_water_id;

    INSERT INTO supplier_products (supplier_id, product_id, sku, cost, price, minimum_order_quantity, lead_time_days, reorder_level)
    VALUES (supplier_fresh_farms_id, product_buckwheat_id, 'FF-GRC-001', 25.00, 40.00, 50, 2, 20)
    RETURNING id INTO supplier_product_buckwheat_id;

    INSERT INTO supplier_products (supplier_id, product_id, sku, cost, price, minimum_order_quantity, lead_time_days, reorder_level)
    VALUES (supplier_dairy_valley_id, product_kefir_id, 'DV-KFR-001', 17.00, 28.00, 30, 1, 15)
    RETURNING id INTO supplier_product_kefir_id;

    INSERT INTO supplier_products (supplier_id, product_id, sku, cost, price, minimum_order_quantity, lead_time_days, reorder_level)
    VALUES (supplier_fresh_farms_id, product_sausage_id, 'FF-KOL-001', 180.00, 250.00, 10, 2, 10)
    RETURNING id INTO supplier_product_sausage_id;

    -- 8. inventory
    INSERT INTO inventory (warehouse_id, supplier_product_id, stock_level, min_threshold, max_threshold, location_code)
    VALUES (warehouse_fresh_farms_id, supplier_product_bananas_id, 150, 30, 200, 'A-01-01')
    RETURNING id INTO inventory_bananas_id;

    INSERT INTO inventory (warehouse_id, supplier_product_id, stock_level, min_threshold, max_threshold, location_code)
    VALUES (warehouse_dairy_valley_id, supplier_product_milk_id, 80, 20, 120, 'B-02-01')
    RETURNING id INTO inventory_milk_id;

    INSERT INTO inventory (warehouse_id, supplier_product_id, stock_level, min_threshold, max_threshold, location_code)
    VALUES (warehouse_metro_wholesale_id, supplier_product_rye_bread_id, 25, 10, 50, 'C-03-01')
    RETURNING id INTO inventory_rye_bread_id;

    INSERT INTO inventory (warehouse_id, supplier_product_id, stock_level, min_threshold, max_threshold, location_code)
    VALUES (warehouse_fresh_farms_id, supplier_product_beef_id, 40, 15, 80, 'A-01-02')
    RETURNING id INTO inventory_beef_id;

    INSERT INTO inventory (warehouse_id, supplier_product_id, stock_level, min_threshold, max_threshold, location_code)
    VALUES (warehouse_fresh_farms_id, supplier_product_orange_juice_id, 60, 15, 100, 'A-01-03')
    RETURNING id INTO inventory_orange_juice_id;

    INSERT INTO inventory (warehouse_id, supplier_product_id, stock_level, min_threshold, max_threshold, location_code)
    VALUES (warehouse_dairy_valley_id, supplier_product_cheddar_id, 35, 12, 60, 'B-02-02')
    RETURNING id INTO inventory_cheddar_id;

    INSERT INTO inventory (warehouse_id, supplier_product_id, stock_level, min_threshold, max_threshold, location_code)
    VALUES (warehouse_metro_wholesale_id, supplier_product_croissants_id, 20, 8, 40, 'C-03-02')
    RETURNING id INTO inventory_croissants_id;

    INSERT INTO inventory (warehouse_id, supplier_product_id, stock_level, min_threshold, max_threshold, location_code)
    VALUES (warehouse_metro_wholesale_id, supplier_product_sparkling_water_id, 120, 25, 200, 'C-03-03')
    RETURNING id INTO inventory_sparkling_water_id;

    INSERT INTO inventory (warehouse_id, supplier_product_id, stock_level, min_threshold, max_threshold, location_code)
    VALUES (warehouse_fresh_farms_id, supplier_product_buckwheat_id, 100, 20, 150, 'A-02-01')
    RETURNING id INTO inventory_buckwheat_id;

    INSERT INTO inventory (warehouse_id, supplier_product_id, stock_level, min_threshold, max_threshold, location_code)
    VALUES (warehouse_dairy_valley_id, supplier_product_kefir_id, 70, 15, 100, 'B-01-03')
    RETURNING id INTO inventory_kefir_id;

    INSERT INTO inventory (warehouse_id, supplier_product_id, stock_level, min_threshold, max_threshold, location_code)
    VALUES (warehouse_fresh_farms_id, supplier_product_sausage_id, 30, 10, 50, 'A-02-02')
    RETURNING id INTO inventory_sausage_id;

    -- 2. employees (using gen_random_uuid() for id, assuming FK to auth.users is handled externally for seeding)
    INSERT INTO employees (id, store_id, employee_number, name, email, phone, position, department, role, status, hire_date, avatar)
    VALUES
    (gen_random_uuid(), store_central_id, 'EMP-001', 'Іван Коваленко', 'ivan.kovalenko@freshmart.ua', '+380671234567', 'Менеджер магазину', 'Управління', 'admin', 'active', '2023-01-15', 'https://randomuser.me/api/portraits/men/1.jpg')
    RETURNING id INTO employee_admin_id;

    INSERT INTO employees (id, store_id, employee_number, name, email, phone, position, department, role, status, hire_date, avatar)
    VALUES
    (gen_random_uuid(), store_central_id, 'EMP-002', 'Олена Петренко', 'olena.petrenko@freshmart.ua', '+380962345678', 'Координатор логістики', 'Логістика', 'logistics_specialist', 'active', '2023-03-20', 'https://randomuser.me/api/portraits/women/2.jpg')
    RETURNING id INTO employee_logistics_id;

    INSERT INTO employees (id, store_id, employee_number, name, email, phone, position, department, role, status, hire_date, avatar)
    VALUES
    (gen_random_uuid(), store_central_id, 'EMP-003', 'Андрій Шевченко', 'andriy.shevchenko@freshmart.ua', '+380503456789', 'Водій доставки', 'Логістика', 'driver', 'active', '2023-05-10', 'https://randomuser.me/api/portraits/men/3.jpg')
    RETURNING id INTO employee_driver1_id;

    INSERT INTO employees (id, store_id, employee_number, name, email, phone, position, department, role, status, hire_date, avatar)
    VALUES
    (gen_random_uuid(), store_east_id, 'EMP-004', 'Наталія Мельник', 'nataliia.melnyk@greengrocer.ua', '+380634567890', 'Водій доставки', 'Логістика', 'driver', 'active', '2023-07-01', 'https://randomuser.me/api/portraits/women/4.jpg')
    RETURNING id INTO employee_driver2_id;

    INSERT INTO employees (id, store_id, employee_number, name, email, phone, position, department, role, status, hire_date, avatar)
    VALUES
    (gen_random_uuid(), store_east_id, 'EMP-005', 'Віктор Бондаренко', 'viktor.bondarenko@greengrocer.ua', '+380975678901', 'Працівник складу', 'Склад', 'warehouse_worker', 'active', '2023-08-15', 'https://randomuser.me/api/portraits/men/5.jpg')
    RETURNING id INTO employee_warehouse_id;

    -- 6. deliveries (insert with placeholder total_amount/items, will update later)
    INSERT INTO deliveries (delivery_number, supplier_id, supplier_name, store_id, status, expected_date, total_amount, total_items, driver_id, notes)
    VALUES
    ('DEL-20250601-001', supplier_fresh_farms_id, 'Фермерські Господарства', store_central_id, 'delivered', '2025-06-01 10:00:00+03', 0.00, 0, employee_driver1_id, 'Доставлено вчасно, всі товари в хорошому стані')
    RETURNING id INTO delivery1_id;

    INSERT INTO deliveries (delivery_number, supplier_id, supplier_name, store_id, status, expected_date, total_amount, total_items, driver_id, notes)
    VALUES
    ('DEL-20250602-001', supplier_dairy_valley_id, 'Молочна Долина', store_east_id, 'in-transit', '2025-06-02 14:00:00+03', 0.00, 0, employee_driver2_id, 'В дорозі до місця призначення')
    RETURNING id INTO delivery2_id;

    INSERT INTO deliveries (delivery_number, supplier_id, supplier_name, store_id, status, expected_date, total_amount, total_items, driver_id, notes)
    VALUES
    ('DEL-20250603-001', supplier_metro_wholesale_id, 'Метро Опт', store_central_id, 'pending', '2025-06-03 11:30:00+03', 0.00, 0, NULL, 'Очікує призначення водія')
    RETURNING id INTO delivery3_id;

    -- 6. delivery_items
    INSERT INTO delivery_items (delivery_id, product_id, product_name, sku, quantity, unit_price, received_quantity, batch_number)
    VALUES
    (delivery1_id, product_bananas_id, 'Органічні Банани', 'PROD-BAN-001', 50, 35.00, 50, 'BATCH-BAN-20250601');
    INSERT INTO delivery_items (delivery_id, product_id, product_name, sku, quantity, unit_price, received_quantity, batch_number)
    VALUES
    (delivery1_id, product_beef_id, 'Яловичий Фарш 500г', 'PROD-BEF-001', 20, 130.00, 20, 'BATCH-BEF-20250601');
    INSERT INTO delivery_items (delivery_id, product_id, product_name, sku, quantity, unit_price, received_quantity, batch_number)
    VALUES
    (delivery1_id, product_orange_juice_id, 'Апельсиновий Сік 1Л', 'PROD-OJ-001', 30, 45.00, 30, 'BATCH-OJ-20250601');
    INSERT INTO delivery_items (delivery_id, product_id, product_name, sku, quantity, unit_price, received_quantity, batch_number)
    VALUES
    (delivery1_id, product_buckwheat_id, 'Гречка 1кг', 'PROD-GRC-001', 50, 25.00, 50, 'BATCH-GRC-20250601');
    INSERT INTO delivery_items (delivery_id, product_id, product_name, sku, quantity, unit_price, received_quantity, batch_number)
    VALUES
    (delivery1_id, product_sausage_id, 'Ковбаса Домашня', 'PROD-KOL-001', 10, 180.00, 10, 'BATCH-KOL-20250601');

    INSERT INTO delivery_items (delivery_id, product_id, product_name, sku, quantity, unit_price, received_quantity, batch_number)
    VALUES
    (delivery2_id, product_milk_id, 'Молоко 1Л', 'PROD-MLK-001', 60, 22.00, 0, 'BATCH-MLK-20250602');
    INSERT INTO delivery_items (delivery_id, product_id, product_name, sku, quantity, unit_price, received_quantity, batch_number)
    VALUES
    (delivery2_id, product_cheddar_id, 'Сир Чеддер 200г', 'PROD-CHE-001', 15, 75.00, 0, 'BATCH-CHE-20250602');
    INSERT INTO delivery_items (delivery_id, product_id, product_name, sku, quantity, unit_price, received_quantity, batch_number)
    VALUES
    (delivery2_id, product_kefir_id, 'Кефір 0.5Л', 'PROD-KFR-001', 30, 17.00, 0, 'BATCH-KFR-20250602');

    INSERT INTO delivery_items (delivery_id, product_id, product_name, sku, quantity, unit_price, received_quantity, batch_number)
    VALUES
    (delivery3_id, product_rye_bread_id, 'Хліб Житній', 'PROD-BRD-001', 20, 28.00, 0, 'BATCH-BRD-20250603');
    INSERT INTO delivery_items (delivery_id, product_id, product_name, sku, quantity, unit_price, received_quantity, batch_number)
    VALUES
    (delivery3_id, product_croissants_id, 'Круасани 6 шт.', 'PROD-CRO-001', 10, 78.00, 0, 'BATCH-CRO-20250603');

    -- Update deliveries with actual total_amount and total_items
    UPDATE deliveries
    SET
        total_amount = (SELECT SUM(quantity * unit_price) FROM delivery_items WHERE delivery_id = delivery1_id),
        total_items = (SELECT SUM(quantity) FROM delivery_items WHERE delivery_id = delivery1_id),
        actual_delivery_date = '2025-06-01 09:45:00+03'
    WHERE id = delivery1_id;

    UPDATE deliveries
    SET
        total_amount = (SELECT SUM(quantity * unit_price) FROM delivery_items WHERE delivery_id = delivery2_id),
        total_items = (SELECT SUM(quantity) FROM delivery_items WHERE delivery_id = delivery2_id)
    WHERE id = delivery2_id;

    UPDATE deliveries
    SET
        total_amount = (SELECT SUM(quantity * unit_price) FROM delivery_items WHERE delivery_id = delivery3_id),
        total_items = (SELECT SUM(quantity) FROM delivery_items WHERE delivery_id = delivery3_id)
    WHERE id = delivery3_id;

    -- 6. delivery_routes
    INSERT INTO delivery_routes (route_name, driver_id, route_date, start_location, end_location, estimated_distance_km, estimated_duration_minutes, actual_distance_km, actual_duration_minutes, status, notes)
    VALUES
    ('Маршрут Київ-001', employee_driver1_id, '2025-06-01', POINT(30.523333, 50.450001), POINT(30.523333, 50.450001), 25.5, 45, 26.2, 42, 'completed', 'Ефективний маршрут, прибув раніше');

    INSERT INTO delivery_routes (route_name, driver_id, route_date, start_location, end_location, estimated_distance_km, estimated_duration_minutes, actual_distance_km, actual_duration_minutes, status, notes)
    VALUES
    ('Маршрут Харків-001', employee_driver2_id, '2025-06-02', POINT(36.2292, 50.0000), POINT(36.2292, 50.0000), 32.8, 55, NULL, NULL, 'in_progress', 'Наразі в дорозі');

    -- 6. delivery_events
    INSERT INTO delivery_events (delivery_id, event_type, event_status, event_timestamp, location_address, notes, created_by)
    VALUES
    (delivery1_id, 'created', 'completed', '2025-06-01 08:00:00+03', 'Склад Фермерських Господарств', 'Замовлення на доставку створено', employee_logistics_id);
    INSERT INTO delivery_events (delivery_id, event_type, event_status, event_timestamp, location_address, notes, created_by)
    VALUES
    (delivery1_id, 'dispatched', 'completed', '2025-06-01 08:30:00+03', 'Склад Фермерських Господарств', 'Водій призначений та виїхав', employee_driver1_id);
    INSERT INTO delivery_events (delivery_id, event_type, event_status, event_timestamp, location_address, notes, created_by)
    VALUES
    (delivery1_id, 'arrived', 'completed', '2025-06-01 09:45:00+03', 'FreshMart Центральний', 'Прибув до місця призначення', employee_driver1_id);
    INSERT INTO delivery_events (delivery_id, event_type, event_status, event_timestamp, location_address, notes, created_by)
    VALUES
    (delivery1_id, 'completed', 'completed', '2025-06-01 10:15:00+03', 'FreshMart Центральний', 'Доставка успішно завершена', employee_driver1_id);

    INSERT INTO delivery_events (delivery_id, event_type, event_status, event_timestamp, location_address, notes, created_by)
    VALUES
    (delivery2_id, 'created', 'completed', '2025-06-02 09:00:00+03', 'Холодний Склад Молочна Долина', 'Замовлення на доставку створено', employee_logistics_id);
    INSERT INTO delivery_events (delivery_id, event_type, event_status, event_timestamp, location_address, notes, created_by)
    VALUES
    (delivery2_id, 'dispatched', 'completed', '2025-06-02 10:00:00+03', 'Холодний Склад Молочна Долина', 'Водій призначений та виїхав', employee_driver2_id);
    INSERT INTO delivery_events (delivery_id, event_type, event_status, event_timestamp, location_address, notes, created_by)
    VALUES
    (delivery2_id, 'in_transit', 'in_progress', '2025-06-02 12:30:00+03', 'Траса М03', 'В дорозі до місця призначення', employee_driver2_id);

    -- 7. gas_cards
    INSERT INTO gas_cards (card_number, employee_id, balance, credit_limit, status, expiry_date, daily_limit, monthly_limit)
    VALUES
    ('GC-4567-8901-2345', employee_driver1_id, 750.00, 1500.00, 'active', '2026-12-31', 200.00, 2000.00)
    RETURNING id INTO gas_card1_id;

    INSERT INTO gas_cards (card_number, employee_id, balance, credit_limit, status, expiry_date, daily_limit, monthly_limit)
    VALUES
    ('GC-5678-9012-3456', employee_driver2_id, 825.50, 1500.00, 'active', '2026-12-31', 200.00, 2000.00)
    RETURNING id INTO gas_card2_id;

    -- 7. gas_card_transactions
    INSERT INTO gas_card_transactions (gas_card_id, transaction_type, amount, previous_balance, new_balance, merchant_name, location, fuel_type, fuel_quantity_liters, transaction_timestamp)
    VALUES
    (gas_card1_id, 'purchase', 65.75, 815.75, 750.00, 'АЗС Shell', 'Київ, вул. Хрещатик', 'purchase', 45.50, '2025-06-01 11:30:00+03');
    INSERT INTO gas_card_transactions (gas_card_id, transaction_type, amount, previous_balance, new_balance, merchant_name, location, fuel_type, fuel_quantity_liters, transaction_timestamp)
    VALUES
    (gas_card1_id, 'purchase', 58.20, 750.00, 691.80, 'АЗС WOG', 'Київ, пр. Перемоги', 'purchase', 40.25, '2025-05-30 14:15:00+03');
    INSERT INTO gas_card_transactions (gas_card_id, transaction_type, amount, previous_balance, new_balance, merchant_name, location, fuel_type, fuel_quantity_liters, transaction_timestamp)
    VALUES
    (gas_card2_id, 'purchase', 72.30, 897.80, 825.50, 'АЗС OKKO', 'Харків, вул. Сумська', 'purchase', 50.75, '2025-06-02 09:45:00+03');

    -- 8. inventory_transactions
    INSERT INTO inventory_transactions (inventory_id, transaction_type, quantity_change, previous_stock, new_stock, unit_cost, reference_type, notes, performed_by)
    VALUES
    (inventory_bananas_id, 'inbound', 50, 100, 150, 35.00, 'delivery', 'Доставка DEL-20250601-001', employee_warehouse_id);
    INSERT INTO inventory_transactions (inventory_id, transaction_type, quantity_change, previous_stock, new_stock, unit_cost, reference_type, notes, performed_by)
    VALUES
    (inventory_milk_id, 'outbound', -15, 95, 80, 22.00, 'other', 'Продаж в магазині', employee_warehouse_id);
    INSERT INTO inventory_transactions (inventory_id, transaction_type, quantity_change, previous_stock, new_stock, unit_cost, reference_type, notes, performed_by)
    VALUES
    (inventory_rye_bread_id, 'adjustment', -2, 27, 25, 28.00, 'other', 'Пошкоджені товари вилучено', employee_warehouse_id);

    -- 8. stock_alerts
    INSERT INTO stock_alerts (inventory_id, alert_type, threshold_value, current_value, message, severity)
    VALUES
    (inventory_rye_bread_id, 'low_stock', 10, 25, 'Залишок Житнього Хліба наближається до мінімального порогу', 'medium');

    INSERT INTO stock_alerts (inventory_id, alert_type, threshold_value, current_value, message, severity)
    VALUES
    (inventory_croissants_id, 'low_stock', 8, 20, 'Залишок Круасанів наближається до мінімального порогу', 'medium');

    -- 9. problem_reports
    INSERT INTO problem_reports (report_number, submitted_by, type, priority, title, description, location, delivery_id, product_id, status)
    VALUES
    ('RPT-20250601-001', employee_driver1_id, 'vehicle', 'medium', 'Проблема з кондиціонером у вантажівці', 'Кондиціонер у вантажівці доставки №3 працює некоректно. Це може вплинути на товари, чутливі до температури.', 'Вантажівка доставки №3', NULL, NULL, 'open')
    RETURNING id INTO problem_report1_id;

    INSERT INTO problem_reports (report_number, submitted_by, type, priority, title, description, location, delivery_id, product_id, status)
    VALUES
    ('RPT-20250602-001', employee_warehouse_id, 'product', 'high', 'Пошкоджена партія молока', 'Отримана партія молока з кількома пошкодженими упаковками. Потрібно повідомити постачальника та скоригувати інвентар.', 'Склад, Секція B-02', delivery2_id, product_milk_id, 'in_progress')
    RETURNING id INTO problem_report2_id;

    -- 9. employee_shifts
    INSERT INTO employee_shifts (employee_id, shift_date, start_time, end_time, break_duration_minutes, status)
    VALUES
    (employee_warehouse_id, '2025-06-01', '08:00:00', '16:00:00', 60, 'completed');
    INSERT INTO employee_shifts (employee_id, shift_date, start_time, end_time, break_duration_minutes, status)
    VALUES
    (employee_warehouse_id, '2025-06-02', '08:00:00', '16:00:00', 60, 'in-progress');
    INSERT INTO employee_shifts (employee_id, shift_date, start_time, end_time, break_duration_minutes, status)
    VALUES
    (employee_driver1_id, '2025-06-03', '09:00:00', '17:00:00', 30, 'scheduled');

    -- 10. invitations
    INSERT INTO invitations (email, role, store_id, invited_by, token, status, expires_at)
    VALUES
    ('new.driver@freshmart.ua', 'driver', store_central_id, employee_admin_id, 'inv_' || gen_random_uuid()::text, 'pending', '2025-06-10 23:59:59+03')
    RETURNING id INTO invitation_driver_id;

    INSERT INTO invitations (email, role, store_id, invited_by, token, status, expires_at)
    VALUES
    ('warehouse.worker@greengrocer.ua', 'warehouse_worker', store_east_id, employee_admin_id, 'inv_' || gen_random_uuid()::text, 'pending', '2025-06-12 23:59:59+03')
    RETURNING id INTO invitation_warehouse_id;

    INSERT INTO invitations (email, role, store_id, invited_by, token, status, expires_at)
    VALUES
    ('logistics.manager@freshmart.ua', 'logistics_specialist', store_central_id, employee_admin_id, 'inv_' || gen_random_uuid()::text, 'pending', '2025-06-15 23:59:59+03')
    RETURNING id INTO invitation_logistics_id;

    -- 11. notifications
    INSERT INTO notifications (recipient_id, sender_id, type, title, message, priority, created_at)
    VALUES
    (employee_driver1_id, employee_logistics_id, 'delivery_assignment', 'Нове призначення доставки', 'Вам призначено доставку DEL-20250601-001, заплановану на 10:00 сьогодні.', 'high', '2025-06-01 08:00:00+03');
    INSERT INTO notifications (recipient_id, sender_id, type, title, message, priority, created_at)
    VALUES
    (employee_warehouse_id, employee_logistics_id, 'stock_alert', 'Попередження про низький запас', 'Запас Житнього Хліба закінчується. Поточний запас: 25 одиниць, мінімальний поріг: 10 одиниць.', 'medium', '2025-06-02 09:00:00+03');

    -- 11. audit_logs
    INSERT INTO audit_logs (table_name, record_id, operation, new_values, user_id, user_email, created_at)
    VALUES
    ('deliveries', delivery1_id, 'UPDATE', ('{"status": "delivered", "actual_delivery_date": "' || TO_CHAR(NOW(), 'YYYY-MM-DD"T"HH24:MI:SS"+03"') || '"}')::jsonb, employee_driver1_id, 'andriy.shevchenko@freshmart.ua', '2025-06-01 09:45:00+03');
    INSERT INTO audit_logs (table_name, record_id, operation, new_values, user_id, user_email, created_at)
    VALUES
    ('inventory', inventory_bananas_id, 'UPDATE', ('{"stock_level": 150, "last_restocked_at": "' || TO_CHAR(NOW(), 'YYYY-MM-DD"T"HH24:MI:SS"+03"') || '"}')::jsonb, employee_warehouse_id, 'viktor.bondarenko@greengrocer.ua', '2025-06-01 10:15:00+03');

    -- 11. error_logs
    INSERT INTO error_logs (error_type, error_message, user_id, request_url, request_method, severity, created_at)
    VALUES
    ('ValidationError', 'Невірний формат SKU продукту при оновленні інвентарю', employee_warehouse_id, '/api/inventory/update', 'POST', 'warning', '2025-06-01 14:30:00+03');
    INSERT INTO error_logs (error_type, error_message, user_id, request_url, request_method, severity, created_at)
    VALUES
    ('DatabaseError', 'Тайм-аут з''єднання під час обробки оновлення статусу доставки', employee_driver1_id, '/api/deliveries/status', 'PUT', 'error', '2025-06-02 16:45:00+03');

END $$;
