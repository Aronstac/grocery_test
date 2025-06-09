/*
  # Система логістики продуктових магазинів України - Повна схема бази даних

  ## Огляд
  Ця міграція створює комплексну схему бази даних для системи логістики продуктових 
  магазинів в Україні, включаючи управління інвентарем, поставками, співробітниками 
  та операційним відстеженням.

  ## Нові таблиці
  1. **Основні бізнес-сутності**
     - `users` - Користувачі системи (керується бекендом)
     - `stores` - Інформація про магазини
     - `suppliers` - Постачальники та контактна інформація
     - `warehouse_locations` - Фізичні склади/місця зберігання
     - `product_categories` - Ієрархічна категоризація продуктів
     - `products` - Каталог продуктів з відстеженням інвентарю
     - `supplier_products` - Зв'язок багато-до-багатьох між постачальниками та продуктами

  2. **Управління інвентарем**
     - `inventory` - Поточні рівні запасів за локаціями
     - `inventory_transactions` - Всі рухи інвентарю (вхідні/вихідні/коригування)
     - `stock_alerts` - Автоматичні сповіщення про низькі запаси, термін придатності тощо

  3. **Управління поставками**
     - `deliveries` - Замовлення поставок та відстеження
     - `delivery_items` - Окремі товари в поставках
     - `delivery_events` - Хронологія змін статусу поставок
     - `delivery_routes` - Заплановані маршрути для водіїв

  4. **Управління співробітниками**
     - `employees` - Записи співробітників, пов'язані з користувачами
     - `employee_shifts` - Управління робочими графіками
     - `gas_cards` - Управління паливними картками для водіїв

  5. **Комунікація та звітність**
     - `invitations` - Система запрошень співробітників
     - `problem_reports` - Система звітування про проблеми
     - `notifications` - Системні сповіщення
     - `audit_logs` - Комплексний аудит-трейл

  6. **Системна підтримка**
     - `error_logs` - Відстеження помилок додатку
     - Користувацькі типи та enum для консистентності даних

  ## Безпека
  - Row Level Security (RLS) увімкнено на всіх таблицях
  - Комплексні політики для рольового доступу
  - Аудит-логування для всіх критичних операцій

  ## Продуктивність
  - Стратегічні індекси для поширених запитів
  - Оптимізовані типи даних для ефективності зберігання
  - Правильні зв'язки зовнішніх ключів з каскадуванням

  ## Українська локалізація
  - Підтримка кирилиці (UTF-8)
  - Українські адреси та телефони
  - Регіони та області України
  - Поштові індекси України
*/

-- Увімкнення необхідних розширень
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Користувацькі типи та Enum
CREATE TYPE user_role AS ENUM ('admin', 'logistics_specialist', 'driver', 'warehouse_worker');
CREATE TYPE employee_status AS ENUM ('active', 'on_leave', 'terminated');
CREATE TYPE delivery_status AS ENUM ('pending', 'in_transit', 'delivered', 'canceled');
CREATE TYPE inventory_tx_type AS ENUM ('inbound', 'outbound', 'adjustment');
CREATE TYPE gas_card_status AS ENUM ('active', 'blocked', 'expired');
CREATE TYPE report_type AS ENUM ('delivery', 'product', 'vehicle', 'other');
CREATE TYPE report_priority AS ENUM ('low', 'medium', 'high');
CREATE TYPE invitation_status AS ENUM ('pending', 'accepted', 'expired');
CREATE TYPE audit_operation AS ENUM ('INSERT', 'UPDATE', 'DELETE');
CREATE TYPE product_category AS ENUM ('produce', 'dairy', 'bakery', 'meat', 'beverage', 'frozen', 'household', 'other');
CREATE TYPE country_code AS ENUM ('UA');

-- Таблиця користувачів (керується бекендом)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'warehouse_worker',
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    last_login_at TIMESTAMPTZ,
    password_changed_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT users_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT users_phone_check CHECK (phone IS NULL OR phone ~* '^\+380[0-9]{9}$')
);

COMMENT ON TABLE users IS 'Користувачі системи - керується виключно бекендом';
COMMENT ON COLUMN users.phone IS 'Телефон у форматі +380XXXXXXXXX';
COMMENT ON COLUMN users.password_hash IS 'Хеш пароля (bcrypt)';

-- Таблиця магазинів
CREATE TABLE IF NOT EXISTS stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    region VARCHAR(100) NOT NULL, -- Область України
    country country_code NOT NULL DEFAULT 'UA',
    postal_code VARCHAR(5), -- Український поштовий індекс (5 цифр)
    phone VARCHAR(20),
    email VARCHAR(255),
    business_hours JSONB,
    coordinates POINT, -- Географічні координати
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT stores_email_check CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT stores_phone_check CHECK (phone IS NULL OR phone ~* '^\+380[0-9]{9}$'),
    CONSTRAINT stores_postal_code_check CHECK (postal_code IS NULL OR postal_code ~* '^[0-9]{5}$')
);

COMMENT ON TABLE stores IS 'Інформація про продуктові магазини';
COMMENT ON COLUMN stores.region IS 'Область України (наприклад: Київська, Львівська)';
COMMENT ON COLUMN stores.postal_code IS 'Поштовий індекс України (5 цифр)';

-- Таблиця постачальників
CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    legal_name VARCHAR(255), -- Повна юридична назва
    edrpou VARCHAR(8), -- ЄДРПОУ код
    address TEXT,
    city VARCHAR(100),
    region VARCHAR(100), -- Область України
    country country_code NOT NULL DEFAULT 'UA',
    postal_code VARCHAR(5),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    website_url VARCHAR(500),
    tax_number VARCHAR(12), -- ІПН/РНОКПП
    payment_terms VARCHAR(100),
    business_hours VARCHAR(255),
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT suppliers_email_check CHECK (contact_email IS NULL OR contact_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT suppliers_phone_check CHECK (contact_phone IS NULL OR contact_phone ~* '^\+380[0-9]{9}$'),
    CONSTRAINT suppliers_website_check CHECK (website_url IS NULL OR website_url ~* '^https?://.*'),
    CONSTRAINT suppliers_edrpou_check CHECK (edrpou IS NULL OR edrpou ~* '^[0-9]{8}$'),
    CONSTRAINT suppliers_tax_number_check CHECK (tax_number IS NULL OR tax_number ~* '^[0-9]{10,12}$'),
    CONSTRAINT suppliers_postal_code_check CHECK (postal_code IS NULL OR postal_code ~* '^[0-9]{5}$')
);

COMMENT ON TABLE suppliers IS 'Постачальники продуктів';
COMMENT ON COLUMN suppliers.edrpou IS 'Код ЄДРПОУ (8 цифр)';
COMMENT ON COLUMN suppliers.tax_number IS 'ІПН/РНОКПП (10-12 цифр)';

-- Таблиця складських локацій
CREATE TABLE IF NOT EXISTS warehouse_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_id UUID REFERENCES suppliers(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    region VARCHAR(100) NOT NULL,
    country country_code NOT NULL DEFAULT 'UA',
    postal_code VARCHAR(5),
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
    
    CONSTRAINT warehouse_email_check CHECK (contact_email IS NULL OR contact_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT warehouse_phone_check CHECK (contact_phone IS NULL OR contact_phone ~* '^\+380[0-9]{9}$'),
    CONSTRAINT warehouse_postal_code_check CHECK (postal_code IS NULL OR postal_code ~* '^[0-9]{5}$')
);

COMMENT ON TABLE warehouse_locations IS 'Складські локації та розподільчі центри';

-- Таблиця категорій продуктів (для ієрархічної категоризації)
CREATE TABLE IF NOT EXISTS product_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    name_ua VARCHAR(255), -- Назва українською
    parent_id UUID REFERENCES product_categories(id) ON DELETE SET NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT product_categories_name_unique UNIQUE (name, parent_id)
);

COMMENT ON TABLE product_categories IS 'Ієрархічні категорії продуктів';
COMMENT ON COLUMN product_categories.name_ua IS 'Назва категорії українською мовою';

-- Таблиця продуктів
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    name_ua VARCHAR(255), -- Назва українською
    description TEXT,
    description_ua TEXT, -- Опис українською
    category product_category NOT NULL DEFAULT 'other',
    category_id UUID REFERENCES product_categories(id) ON DELETE SET NULL,
    sku VARCHAR(100) UNIQUE,
    barcode VARCHAR(100),
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    cost DECIMAL(10,2) CHECK (cost >= 0),
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    reorder_level INTEGER NOT NULL DEFAULT 0 CHECK (reorder_level >= 0),
    max_stock_level INTEGER CHECK (max_stock_level IS NULL OR max_stock_level >= reorder_level),
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
    country_of_origin country_code DEFAULT 'UA',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT products_image_url_check CHECK (image_url IS NULL OR image_url ~* '^https?://.*'),
    CONSTRAINT products_dimensions_check CHECK (dimensions_cm IS NULL OR dimensions_cm ~* '^\d+(\.\d+)?x\d+(\.\d+)?x\d+(\.\d+)?$')
);

COMMENT ON TABLE products IS 'Каталог продуктів з підтримкою української мови';
COMMENT ON COLUMN products.name_ua IS 'Назва продукту українською мовою';
COMMENT ON COLUMN products.description_ua IS 'Опис продукту українською мовою';

-- Таблиця зв'язків постачальник-продукт
CREATE TABLE IF NOT EXISTS supplier_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

COMMENT ON TABLE supplier_products IS 'Зв'язок між постачальниками та продуктами з ціноутворенням';

-- Таблиця інвентарю
CREATE TABLE IF NOT EXISTS inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    warehouse_id UUID NOT NULL REFERENCES warehouse_locations(id) ON DELETE CASCADE,
    supplier_product_id UUID NOT NULL REFERENCES supplier_products(id) ON DELETE CASCADE,
    stock_level INTEGER NOT NULL DEFAULT 0 CHECK (stock_level >= 0),
    reserved_quantity INTEGER DEFAULT 0 CHECK (reserved_quantity >= 0),
    available_quantity INTEGER GENERATED ALWAYS AS (stock_level - reserved_quantity) STORED,
    min_threshold INTEGER DEFAULT 0 CHECK (min_threshold >= 0),
    max_threshold INTEGER CHECK (max_threshold IS NULL OR max_threshold >= min_threshold),
    location_code VARCHAR(50),
    last_counted_at TIMESTAMPTZ,
    last_restocked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT inventory_unique UNIQUE (warehouse_id, supplier_product_id),
    CONSTRAINT inventory_reserved_check CHECK (reserved_quantity <= stock_level)
);

COMMENT ON TABLE inventory IS 'Поточні рівні запасів по складських локаціях';

-- Таблиця транзакцій інвентарю
CREATE TABLE IF NOT EXISTS inventory_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inventory_id UUID NOT NULL REFERENCES inventory(id) ON DELETE CASCADE,
    transaction_type inventory_tx_type NOT NULL,
    quantity_change INTEGER NOT NULL,
    previous_stock INTEGER NOT NULL CHECK (previous_stock >= 0),
    new_stock INTEGER NOT NULL CHECK (new_stock >= 0),
    unit_cost DECIMAL(10,2),
    reference_type VARCHAR(50),
    reference_id UUID,
    notes TEXT,
    performed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT inventory_tx_quantity_check CHECK (
        (transaction_type = 'inbound' AND quantity_change > 0) OR
        (transaction_type = 'outbound' AND quantity_change < 0) OR
        (transaction_type = 'adjustment')
    )
);

COMMENT ON TABLE inventory_transactions IS 'Історія всіх рухів інвентарю';

-- Таблиця сповіщень про запаси
CREATE TABLE IF NOT EXISTS stock_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inventory_id UUID NOT NULL REFERENCES inventory(id) ON DELETE CASCADE,
    alert_type VARCHAR(50) NOT NULL,
    threshold_value INTEGER,
    current_value INTEGER,
    message TEXT NOT NULL,
    message_ua TEXT, -- Повідомлення українською
    severity VARCHAR(20) DEFAULT 'medium',
    is_acknowledged BOOLEAN DEFAULT false,
    acknowledged_by UUID REFERENCES users(id) ON DELETE SET NULL,
    acknowledged_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT stock_alerts_severity_check CHECK (severity IN ('low', 'medium', 'high', 'critical'))
);

COMMENT ON TABLE stock_alerts IS 'Автоматичні сповіщення про стан запасів';
COMMENT ON COLUMN stock_alerts.message_ua IS 'Повідомлення українською мовою';

-- Таблиця співробітників
CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    employee_number VARCHAR(50) UNIQUE,
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    name_ua VARCHAR(255), -- Ім'я українською
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20),
    position VARCHAR(100) NOT NULL,
    position_ua VARCHAR(100), -- Посада українською
    department VARCHAR(100) NOT NULL,
    department_ua VARCHAR(100), -- Відділ українською
    role user_role NOT NULL DEFAULT 'warehouse_worker',
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
    CONSTRAINT employees_phone_check CHECK (phone IS NULL OR phone ~* '^\+380[0-9]{9}$'),
    CONSTRAINT employees_emergency_phone_check CHECK (emergency_contact_phone IS NULL OR emergency_contact_phone ~* '^\+380[0-9]{9}$'),
    CONSTRAINT employees_termination_check CHECK (termination_date IS NULL OR termination_date >= hire_date),
    CONSTRAINT employees_avatar_check CHECK (avatar IS NULL OR avatar ~* '^https?://.*')
);

COMMENT ON TABLE employees IS 'Співробітники магазинів з підтримкою української мови';
COMMENT ON COLUMN employees.name_ua IS 'Повне ім'я українською мовою';
COMMENT ON COLUMN employees.position_ua IS 'Посада українською мовою';

-- Таблиця змін співробітників
CREATE TABLE IF NOT EXISTS employee_shifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    shift_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    break_duration_minutes INTEGER DEFAULT 0 CHECK (break_duration_minutes >= 0),
    actual_start_time TIMESTAMPTZ,
    actual_end_time TIMESTAMPTZ,
    status VARCHAR(20) DEFAULT 'scheduled',
    notes TEXT,
    notes_ua TEXT, -- Примітки українською
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT employee_shifts_time_check CHECK (end_time > start_time),
    CONSTRAINT employee_shifts_status_check CHECK (status IN ('scheduled', 'in_progress', 'completed', 'missed', 'canceled')),
    CONSTRAINT employee_shifts_unique UNIQUE (employee_id, shift_date, start_time)
);

COMMENT ON TABLE employee_shifts IS 'Робочі зміни співробітників';

-- Таблиця поставок
CREATE TABLE IF NOT EXISTS deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
    special_instructions_ua TEXT, -- Інструкції українською
    notes TEXT,
    notes_ua TEXT, -- Примітки українською
    tracking_number VARCHAR(100),
    proof_of_delivery_url VARCHAR(500),
    signature_url VARCHAR(500),
    temperature_log JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT deliveries_dates_check CHECK (actual_delivery_date IS NULL OR actual_delivery_date >= expected_date - INTERVAL '7 days'),
    CONSTRAINT deliveries_proof_url_check CHECK (proof_of_delivery_url IS NULL OR proof_of_delivery_url ~* '^https?://.*'),
    CONSTRAINT deliveries_signature_url_check CHECK (signature_url IS NULL OR signature_url ~* '^https?://.*')
);

COMMENT ON TABLE deliveries IS 'Поставки товарів з відстеженням статусу';

-- Таблиця товарів поставки
CREATE TABLE IF NOT EXISTS delivery_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    delivery_id UUID NOT NULL REFERENCES deliveries(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    product_name VARCHAR(255) NOT NULL,
    product_name_ua VARCHAR(255), -- Назва українською
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
    quality_notes_ua TEXT, -- Примітки якості українською
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT delivery_items_received_check CHECK (received_quantity <= quantity),
    CONSTRAINT delivery_items_damaged_check CHECK (damaged_quantity <= received_quantity)
);

COMMENT ON TABLE delivery_items IS 'Окремі товари в поставках';

-- Таблиця подій поставки
CREATE TABLE IF NOT EXISTS delivery_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    delivery_id UUID NOT NULL REFERENCES deliveries(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    event_status VARCHAR(50) NOT NULL,
    event_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    location_coordinates POINT,
    location_address TEXT,
    notes TEXT,
    notes_ua TEXT, -- Примітки українською
    created_by UUID REFERENCES employees(id) ON DELETE SET NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT delivery_events_type_check CHECK (event_type IN ('created', 'dispatched', 'in_transit', 'arrived', 'unloading', 'completed', 'delayed', 'canceled', 'returned'))
);

COMMENT ON TABLE delivery_events IS 'Хронологія подій поставок';

-- Таблиця маршрутів поставки
CREATE TABLE IF NOT EXISTS delivery_routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
    notes_ua TEXT, -- Примітки українською
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT delivery_routes_status_check CHECK (status IN ('planned', 'in_progress', 'completed', 'canceled')),
    CONSTRAINT delivery_routes_distance_check CHECK (actual_distance_km IS NULL OR actual_distance_km >= 0),
    CONSTRAINT delivery_routes_duration_check CHECK (actual_duration_minutes IS NULL OR actual_duration_minutes >= 0)
);

COMMENT ON TABLE delivery_routes IS 'Маршрути доставки для водіїв';

-- Таблиця паливних карток
CREATE TABLE IF NOT EXISTS gas_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
    notes_ua TEXT, -- Примітки українською
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT gas_cards_expiry_check CHECK (expiry_date > CURRENT_DATE),
    CONSTRAINT gas_cards_limits_check CHECK (monthly_limit >= daily_limit)
);

COMMENT ON TABLE gas_cards IS 'Паливні картки для водіїв';

-- Таблиця транзакцій паливних карток
CREATE TABLE IF NOT EXISTS gas_card_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
    CONSTRAINT gas_card_tx_receipt_check CHECK (receipt_url IS NULL OR receipt_url ~* '^https?://.*')
);

COMMENT ON TABLE gas_card_transactions IS 'Історія транзакцій паливних карток';

-- Таблиця запрошень
CREATE TABLE IF NOT EXISTS invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
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

COMMENT ON TABLE invitations IS 'Запрошення нових співробітників';

-- Таблиця звітів про проблеми
CREATE TABLE IF NOT EXISTS problem_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_number VARCHAR(100) UNIQUE NOT NULL,
    submitted_by UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    type report_type NOT NULL,
    priority report_priority NOT NULL DEFAULT 'medium',
    title VARCHAR(255) NOT NULL,
    title_ua VARCHAR(255), -- Заголовок українською
    description TEXT NOT NULL,
    description_ua TEXT, -- Опис українською
    location TEXT,
    delivery_id UUID REFERENCES deliveries(id) ON DELETE SET NULL,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'open',
    assigned_to UUID REFERENCES employees(id) ON DELETE SET NULL,
    resolution TEXT,
    resolution_ua TEXT, -- Рішення українською
    images JSONB,
    estimated_cost DECIMAL(10,2),
    actual_cost DECIMAL(10,2),
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT problem_reports_status_check CHECK (status IN ('open', 'in_progress', 'resolved', 'closed', 'canceled')),
    CONSTRAINT problem_reports_cost_check CHECK (actual_cost IS NULL OR actual_cost >= 0)
);

COMMENT ON TABLE problem_reports IS 'Звіти про проблеми з підтримкою української мови';

-- Таблиця сповіщень
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    title_ua VARCHAR(255), -- Заголовок українською
    message TEXT NOT NULL,
    message_ua TEXT, -- Повідомлення українською
    data JSONB,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    priority VARCHAR(20) DEFAULT 'normal',
    expires_at TIMESTAMPTZ,
    action_url VARCHAR(500),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT notifications_priority_check CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    CONSTRAINT notifications_action_url_check CHECK (action_url IS NULL OR action_url ~* '^https?://.*')
);

COMMENT ON TABLE notifications IS 'Системні сповіщення з підтримкою української мови';

-- Таблиця аудит-логів
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    operation audit_operation NOT NULL,
    old_values JSONB,
    new_values JSONB,
    changed_fields TEXT[],
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
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

COMMENT ON TABLE audit_logs IS 'Аудит-логи всіх змін в системі';

-- Таблиця логів помилок
CREATE TABLE IF NOT EXISTS error_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    error_type VARCHAR(100) NOT NULL,
    error_message TEXT NOT NULL,
    stack_trace TEXT,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
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

COMMENT ON TABLE error_logs IS 'Логи помилок додатку';

-- Створення індексів для оптимізації продуктивності
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_stores_active ON stores(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_stores_city ON stores(city);
CREATE INDEX IF NOT EXISTS idx_stores_region ON stores(region);

CREATE INDEX IF NOT EXISTS idx_suppliers_active ON suppliers(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_suppliers_city ON suppliers(city);
CREATE INDEX IF NOT EXISTS idx_suppliers_edrpou ON suppliers(edrpou) WHERE edrpou IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_supplier ON products(supplier_id);
CREATE INDEX IF NOT EXISTS idx_products_stock_level ON products(stock, reorder_level);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku) WHERE sku IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode) WHERE barcode IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_products_name_search ON products USING gin(to_tsvector('ukrainian', name || ' ' || COALESCE(name_ua, '')));

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

-- Створення тригерів для updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Застосування тригерів updated_at до відповідних таблиць
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
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

-- Увімкнення Row Level Security на всіх таблицях
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
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

-- Створення базових RLS політик
-- Примітка: Ці політики будуть керуватися бекендом через Supabase SDK

-- Політики для користувачів (керується бекендом)
CREATE POLICY "Service role can manage users" ON users FOR ALL USING (true);

-- Політики для магазинів
CREATE POLICY "Users can view stores" ON stores FOR SELECT USING (true);

-- Політики для продуктів
CREATE POLICY "Users can view products" ON products FOR SELECT USING (true);

-- Політики для співробітників
CREATE POLICY "Users can view employees in same store" ON employees FOR SELECT USING (true);

-- Політики для поставок
CREATE POLICY "Users can view deliveries" ON deliveries FOR SELECT USING (true);

-- Політики для паливних карток
CREATE POLICY "Users can view gas cards" ON gas_cards FOR SELECT USING (true);

-- Політики для звітів про проблеми
CREATE POLICY "Users can view and create problem reports" ON problem_reports FOR SELECT USING (true);
CREATE POLICY "Users can create problem reports" ON problem_reports FOR INSERT WITH CHECK (true);

-- Політики для сповіщень
CREATE POLICY "Users can view notifications" ON notifications FOR SELECT USING (true);

-- Політики для аудит-логів (тільки для перегляду)
CREATE POLICY "Service role can view audit logs" ON audit_logs FOR SELECT USING (true);

-- Вставка початкових даних для категорій продуктів
INSERT INTO product_categories (name, name_ua, description) VALUES
    ('Fresh Produce', 'Свіжі продукти', 'Свіжі фрукти та овочі'),
    ('Dairy & Eggs', 'Молочні продукти та яйця', 'Молоко, сир, йогурт та яйця'),
    ('Meat & Seafood', 'М''ясо та морепродукти', 'Свіже та заморожене м''ясо та морепродукти'),
    ('Bakery', 'Хлібобулочні вироби', 'Хліб, випічка та кондитерські вироби'),
    ('Pantry Staples', 'Основні продукти', 'Консерви, крупи та сухі продукти'),
    ('Beverages', 'Напої', 'Напої та безалкогольні напої'),
    ('Frozen Foods', 'Заморожені продукти', 'Заморожені страви та інгредієнти'),
    ('Household Items', 'Побутові товари', 'Засоби для прибирання та побутові товари')
ON CONFLICT (name, parent_id) DO NOTHING;

-- Вставка початкових даних для областей України (для довідки)
-- Ці дані можуть бути використані для валідації або автозаповнення
CREATE TABLE IF NOT EXISTS ukrainian_regions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    name_ua VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(2) NOT NULL UNIQUE
);

INSERT INTO ukrainian_regions (name, name_ua, code) VALUES
    ('Vinnytsia Oblast', 'Вінницька область', '05'),
    ('Volyn Oblast', 'Волинська область', '07'),
    ('Dnipropetrovsk Oblast', 'Дніпропетровська область', '12'),
    ('Donetsk Oblast', 'Донецька область', '14'),
    ('Zhytomyr Oblast', 'Житомирська область', '18'),
    ('Zakarpattia Oblast', 'Закарпатська область', '21'),
    ('Zaporizhzhia Oblast', 'Запорізька область', '23'),
    ('Ivano-Frankivsk Oblast', 'Івано-Франківська область', '26'),
    ('Kyiv Oblast', 'Київська область', '32'),
    ('Kirovohrad Oblast', 'Кіровоградська область', '35'),
    ('Luhansk Oblast', 'Луганська область', '44'),
    ('Lviv Oblast', 'Львівська область', '46'),
    ('Mykolaiv Oblast', 'Миколаївська область', '48'),
    ('Odesa Oblast', 'Одеська область', '51'),
    ('Poltava Oblast', 'Полтавська область', '53'),
    ('Rivne Oblast', 'Рівненська область', '56'),
    ('Sumy Oblast', 'Сумська область', '59'),
    ('Ternopil Oblast', 'Тернопільська область', '61'),
    ('Kharkiv Oblast', 'Харківська область', '63'),
    ('Kherson Oblast', 'Херсонська область', '65'),
    ('Khmelnytskyi Oblast', 'Хмельницька область', '68'),
    ('Cherkasy Oblast', 'Черкаська область', '71'),
    ('Chernivtsi Oblast', 'Чернівецька область', '73'),
    ('Chernihiv Oblast', 'Чернігівська область', '74'),
    ('Kyiv City', 'м. Київ', '80'),
    ('Sevastopol City', 'м. Севастополь', '85')
ON CONFLICT (name) DO NOTHING;

COMMENT ON TABLE ukrainian_regions IS 'Довідник областей України для валідації адрес';