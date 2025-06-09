import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

// Admin client for seeding (bypasses RLS)
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Ukrainian data for realistic seeding
const ukrainianCities = [
  { name: 'Kyiv', region: 'Kyiv Oblast', postal: '01001' },
  { name: 'Lviv', region: 'Lviv Oblast', postal: '79000' },
  { name: 'Kharkiv', region: 'Kharkiv Oblast', postal: '61000' },
  { name: 'Odesa', region: 'Odesa Oblast', postal: '65000' },
  { name: 'Dnipro', region: 'Dnipropetrovsk Oblast', postal: '49000' },
  { name: 'Zaporizhzhia', region: 'Zaporizhzhia Oblast', postal: '69000' }
];

const ukrainianNames = [
  'Олександр Петренко', 'Марія Коваленко', 'Іван Шевченко', 'Анна Бондаренко',
  'Дмитро Мельник', 'Катерина Ткаченко', 'Сергій Кравченко', 'Оксана Лисенко',
  'Андрій Гриценко', 'Тетяна Савченко', 'Володимир Морозенко', 'Наталія Павленко'
];

const ukrainianCompanies = [
  'ТОВ "Свіжі продукти"', 'ПП "Молочна ферма"', 'ТОВ "Хлібний дім"',
  'ПАТ "Українські делікатеси"', 'ТОВ "Зелений сад"', 'ПП "М\'ясний двір"'
];

const productData = [
  {
    name: 'Organic Bananas',
    name_ua: 'Органічні банани',
    category: 'produce',
    price: 45.50,
    cost: 32.00,
    stock: 120,
    reorder_level: 20,
    image_url: 'https://images.pexels.com/photos/1093038/pexels-photo-1093038.jpeg',
    weight_grams: 150,
    requires_refrigeration: false
  },
  {
    name: 'Fresh Milk 1L',
    name_ua: 'Свіже молоко 1л',
    category: 'dairy',
    price: 28.90,
    cost: 22.00,
    stock: 85,
    reorder_level: 15,
    image_url: 'https://images.pexels.com/photos/8148587/pexels-photo-8148587.jpeg',
    weight_grams: 1030,
    requires_refrigeration: true
  },
  {
    name: 'Sourdough Bread',
    name_ua: 'Хліб на заквасці',
    category: 'bakery',
    price: 35.00,
    cost: 18.50,
    stock: 45,
    reorder_level: 10,
    image_url: 'https://images.pexels.com/photos/2286776/pexels-photo-2286776.jpeg',
    weight_grams: 500,
    requires_refrigeration: false
  },
  {
    name: 'Free Range Eggs (12 pcs)',
    name_ua: 'Яйця вільного вигулу (12 шт)',
    category: 'dairy',
    price: 65.00,
    cost: 48.00,
    stock: 60,
    reorder_level: 12,
    image_url: 'https://images.pexels.com/photos/6941028/pexels-photo-6941028.jpeg',
    weight_grams: 720,
    requires_refrigeration: true
  },
  {
    name: 'Fresh Spinach',
    name_ua: 'Свіжий шпинат',
    category: 'produce',
    price: 42.00,
    cost: 28.00,
    stock: 35,
    reorder_level: 8,
    image_url: 'https://images.pexels.com/photos/2325843/pexels-photo-2325843.jpeg',
    weight_grams: 200,
    requires_refrigeration: true
  },
  {
    name: 'Ground Coffee 250g',
    name_ua: 'Мелена кава 250г',
    category: 'beverage',
    price: 125.00,
    cost: 85.00,
    stock: 75,
    reorder_level: 15,
    image_url: 'https://images.pexels.com/photos/894695/pexels-photo-894695.jpeg',
    weight_grams: 250,
    requires_refrigeration: false
  },
  {
    name: 'Chicken Breast 1kg',
    name_ua: 'Куряче філе 1кг',
    category: 'meat',
    price: 180.00,
    cost: 140.00,
    stock: 25,
    reorder_level: 8,
    image_url: 'https://images.pexels.com/photos/6210876/pexels-photo-6210876.jpeg',
    weight_grams: 1000,
    requires_refrigeration: true
  },
  {
    name: 'Pasta Sauce 500ml',
    name_ua: 'Соус для пасти 500мл',
    category: 'other',
    price: 55.00,
    cost: 35.00,
    stock: 90,
    reorder_level: 20,
    image_url: 'https://images.pexels.com/photos/5908256/pexels-photo-5908256.jpeg',
    weight_grams: 520,
    requires_refrigeration: false
  },
  {
    name: 'Greek Yogurt 400g',
    name_ua: 'Грецький йогурт 400г',
    category: 'dairy',
    price: 48.50,
    cost: 32.00,
    stock: 55,
    reorder_level: 12,
    image_url: 'https://images.pexels.com/photos/1435735/pexels-photo-1435735.jpeg',
    weight_grams: 400,
    requires_refrigeration: true
  },
  {
    name: 'Frozen Pizza 350g',
    name_ua: 'Заморожена піца 350г',
    category: 'frozen',
    price: 95.00,
    cost: 65.00,
    stock: 40,
    reorder_level: 10,
    image_url: 'https://images.pexels.com/photos/2147491/pexels-photo-2147491.jpeg',
    weight_grams: 350,
    requires_refrigeration: false
  }
];

async function clearExistingData() {
  console.log('🧹 Clearing existing data...');
  
  // Delete in reverse dependency order
  const tables = [
    'gas_card_transactions',
    'gas_cards',
    'delivery_events',
    'delivery_items',
    'deliveries',
    'delivery_routes',
    'employee_shifts',
    'inventory_transactions',
    'stock_alerts',
    'inventory',
    'supplier_products',
    'products',
    'warehouse_locations',
    'suppliers',
    'problem_reports',
    'notifications',
    'invitations',
    'employees',
    'stores',
    'product_categories'
  ];

  for (const table of tables) {
    try {
      const { error } = await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (error && !error.message.includes('does not exist')) {
        console.warn(`Warning clearing ${table}:`, error.message);
      }
    } catch (err) {
      console.warn(`Warning clearing ${table}:`, err);
    }
  }

  // Clear users table using auth admin
  try {
    const { data: users } = await supabase.auth.admin.listUsers();
    if (users?.users) {
      for (const user of users.users) {
        await supabase.auth.admin.deleteUser(user.id);
      }
    }
  } catch (err) {
    console.warn('Warning clearing users:', err);
  }

  console.log('✅ Existing data cleared');
}

async function seedStores() {
  console.log('🏪 Seeding stores...');
  
  const stores = [
    {
      id: uuidv4(),
      name: 'GroceryOps Центральний',
      address: 'вул. Хрещатик, 22',
      city: 'Kyiv',
      region: 'Kyiv Oblast',
      postal_code: '01001',
      phone: '+380442234567',
      email: 'central@groceryops.ua',
      business_hours: {
        monday: '08:00-22:00',
        tuesday: '08:00-22:00',
        wednesday: '08:00-22:00',
        thursday: '08:00-22:00',
        friday: '08:00-22:00',
        saturday: '09:00-21:00',
        sunday: '10:00-20:00'
      }
    },
    {
      id: uuidv4(),
      name: 'GroceryOps Львівський',
      address: 'пр. Свободи, 15',
      city: 'Lviv',
      region: 'Lviv Oblast',
      postal_code: '79000',
      phone: '+380322345678',
      email: 'lviv@groceryops.ua',
      business_hours: {
        monday: '08:00-21:00',
        tuesday: '08:00-21:00',
        wednesday: '08:00-21:00',
        thursday: '08:00-21:00',
        friday: '08:00-21:00',
        saturday: '09:00-20:00',
        sunday: '10:00-19:00'
      }
    }
  ];

  const { data, error } = await supabase.from('stores').insert(stores).select();
  if (error) throw error;
  
  console.log(`✅ Created ${data.length} stores`);
  return data;
}

async function seedSuppliers() {
  console.log('🚚 Seeding suppliers...');
  
  const suppliers = [
    {
      id: uuidv4(),
      name: 'Свіжі продукти України',
      legal_name: 'ТОВ "Свіжі продукти України"',
      edrpou: '12345678',
      address: 'вул. Промислова, 45',
      city: 'Kyiv',
      region: 'Kyiv Oblast',
      postal_code: '03150',
      contact_email: 'orders@freshukraine.ua',
      contact_phone: '+380442567890',
      website_url: 'https://freshukraine.ua',
      tax_number: '1234567890',
      payment_terms: 'Оплата протягом 14 днів',
      business_hours: 'Пн-Пт 08:00-17:00'
    },
    {
      id: uuidv4(),
      name: 'Молочна долина',
      legal_name: 'ПАТ "Молочна долина"',
      edrpou: '87654321',
      address: 'вул. Фермерська, 12',
      city: 'Lviv',
      region: 'Lviv Oblast',
      postal_code: '79020',
      contact_email: 'supply@dairyvalley.ua',
      contact_phone: '+380322678901',
      website_url: 'https://dairyvalley.ua',
      tax_number: '0987654321',
      payment_terms: 'Передоплата 50%',
      business_hours: 'Пн-Сб 07:00-16:00'
    },
    {
      id: uuidv4(),
      name: 'Хлібний дім',
      legal_name: 'ПП "Хлібний дім"',
      edrpou: '11223344',
      address: 'вул. Пекарська, 8',
      city: 'Kharkiv',
      region: 'Kharkiv Oblast',
      postal_code: '61000',
      contact_email: 'orders@breadhouse.ua',
      contact_phone: '+380577123456',
      website_url: 'https://breadhouse.ua',
      tax_number: '1122334455',
      payment_terms: 'Оплата при доставці',
      business_hours: 'Пн-Нд 06:00-18:00'
    }
  ];

  const { data, error } = await supabase.from('suppliers').insert(suppliers).select();
  if (error) throw error;
  
  console.log(`✅ Created ${data.length} suppliers`);
  return data;
}

async function seedWarehouseLocations(suppliers: any[]) {
  console.log('🏭 Seeding warehouse locations...');
  
  const warehouses = suppliers.map(supplier => ({
    id: uuidv4(),
    supplier_id: supplier.id,
    name: `Склад ${supplier.name}`,
    address: supplier.address,
    city: supplier.city,
    region: supplier.region,
    postal_code: supplier.postal_code,
    contact_email: supplier.contact_email,
    contact_phone: supplier.contact_phone,
    capacity_cubic_meters: Math.floor(Math.random() * 5000) + 1000,
    temperature_controlled: Math.random() > 0.5,
    security_level: ['basic', 'medium', 'high'][Math.floor(Math.random() * 3)],
    operating_hours: 'Пн-Пт 08:00-17:00'
  }));

  const { data, error } = await supabase.from('warehouse_locations').insert(warehouses).select();
  if (error) throw error;
  
  console.log(`✅ Created ${data.length} warehouse locations`);
  return data;
}

async function seedUsers() {
  console.log('👥 Seeding users...');
  
  const users = [
    {
      email: 'admin@groceryops.ua',
      password: 'Admin123!',
      role: 'admin',
      full_name: 'Олександр Петренко'
    },
    {
      email: 'logistics@groceryops.ua',
      password: 'Logistics123!',
      role: 'logistics_specialist',
      full_name: 'Марія Коваленко'
    },
    {
      email: 'driver@groceryops.ua',
      password: 'Driver123!',
      role: 'driver',
      full_name: 'Іван Шевченко'
    },
    {
      email: 'warehouse@groceryops.ua',
      password: 'Warehouse123!',
      role: 'warehouse_worker',
      full_name: 'Анна Бондаренко'
    }
  ];

  const createdUsers = [];
  
  for (const userData of users) {
    try {
      // Create user in auth
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true
      });

      if (authError) {
        console.error(`Failed to create user ${userData.email}:`, authError);
        continue;
      }

      createdUsers.push({
        id: authUser.user.id,
        email: userData.email,
        role: userData.role,
        full_name: userData.full_name
      });

    } catch (error) {
      console.error(`Error creating user ${userData.email}:`, error);
    }
  }

  console.log(`✅ Created ${createdUsers.length} users`);
  return createdUsers;
}

async function seedEmployees(users: any[], stores: any[]) {
  console.log('👨‍💼 Seeding employees...');
  
  const departments = {
    admin: 'Управління',
    logistics_specialist: 'Логістика',
    driver: 'Доставка',
    warehouse_worker: 'Склад'
  };

  const positions = {
    admin: 'Директор магазину',
    logistics_specialist: 'Спеціаліст з логістики',
    driver: 'Водій',
    warehouse_worker: 'Працівник складу'
  };

  const employees = users.map((user, index) => ({
    id: user.id,
    employee_number: `EMP${String(index + 1).padStart(3, '0')}`,
    store_id: stores[index % stores.length].id,
    name: user.full_name,
    name_ua: user.full_name,
    email: user.email,
    phone: `+38067${String(Math.floor(Math.random() * 9000000) + 1000000)}`,
    position: positions[user.role as keyof typeof positions],
    position_ua: positions[user.role as keyof typeof positions],
    department: departments[user.role as keyof typeof departments],
    department_ua: departments[user.role as keyof typeof departments],
    role: user.role,
    status: 'active',
    hire_date: new Date(Date.now() - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
    salary: user.role === 'admin' ? 25000 : user.role === 'logistics_specialist' ? 18000 : 15000,
    avatar: `https://randomuser.me/api/portraits/${index % 2 === 0 ? 'men' : 'women'}/${index + 1}.jpg`
  }));

  const { data, error } = await supabase.from('employees').insert(employees).select();
  if (error) throw error;
  
  console.log(`✅ Created ${data.length} employees`);
  return data;
}

async function seedProducts(suppliers: any[]) {
  console.log('📦 Seeding products...');
  
  const products = productData.map(product => ({
    id: uuidv4(),
    ...product,
    supplier_id: suppliers[Math.floor(Math.random() * suppliers.length)].id,
    sku: `SKU${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`,
    barcode: `${Math.floor(Math.random() * 9000000000000) + 1000000000000}`,
    expiry_date: product.category === 'produce' || product.category === 'dairy' || product.category === 'meat' 
      ? new Date(Date.now() + Math.floor(Math.random() * 14) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      : null
  }));

  const { data, error } = await supabase.from('products').insert(products).select();
  if (error) throw error;
  
  console.log(`✅ Created ${data.length} products`);
  return data;
}

async function seedSupplierProducts(suppliers: any[], products: any[]) {
  console.log('🔗 Seeding supplier-product relationships...');
  
  const supplierProducts = products.map(product => ({
    id: uuidv4(),
    supplier_id: product.supplier_id,
    product_id: product.id,
    sku: `SUP-${product.sku}`,
    cost: product.cost,
    price: product.price,
    minimum_order_quantity: Math.floor(Math.random() * 10) + 1,
    lead_time_days: Math.floor(Math.random() * 7) + 1,
    reorder_level: product.reorder_level,
    is_preferred: Math.random() > 0.7,
    is_active: true
  }));

  const { data, error } = await supabase.from('supplier_products').insert(supplierProducts).select();
  if (error) throw error;
  
  console.log(`✅ Created ${data.length} supplier-product relationships`);
  return data;
}

async function seedInventory(warehouses: any[], supplierProducts: any[]) {
  console.log('📊 Seeding inventory...');
  
  const inventory = supplierProducts.map(sp => ({
    id: uuidv4(),
    warehouse_id: warehouses.find(w => w.supplier_id === sp.supplier_id)?.id || warehouses[0].id,
    supplier_product_id: sp.id,
    stock_level: Math.floor(Math.random() * 200) + 10,
    reserved_quantity: Math.floor(Math.random() * 10),
    min_threshold: sp.reorder_level,
    max_threshold: sp.reorder_level * 5,
    location_code: `${String.fromCharCode(65 + Math.floor(Math.random() * 5))}-${Math.floor(Math.random() * 20) + 1}-${Math.floor(Math.random() * 10) + 1}`,
    last_counted_at: new Date(Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000).toISOString(),
    last_restocked_at: new Date(Date.now() - Math.floor(Math.random() * 14) * 24 * 60 * 60 * 1000).toISOString()
  }));

  const { data, error } = await supabase.from('inventory').insert(inventory).select();
  if (error) throw error;
  
  console.log(`✅ Created ${data.length} inventory records`);
  return data;
}

async function seedDeliveries(suppliers: any[], stores: any[], employees: any[]) {
  console.log('🚛 Seeding deliveries...');
  
  const drivers = employees.filter(e => e.role === 'driver');
  const statuses = ['pending', 'in_transit', 'delivered', 'canceled'];
  
  const deliveries = [];
  
  for (let i = 0; i < 8; i++) {
    const supplier = suppliers[Math.floor(Math.random() * suppliers.length)];
    const store = stores[Math.floor(Math.random() * stores.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const expectedDate = new Date(Date.now() + (Math.floor(Math.random() * 14) - 7) * 24 * 60 * 60 * 1000);
    
    deliveries.push({
      id: uuidv4(),
      delivery_number: `DEL-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(i + 1).padStart(3, '0')}`,
      supplier_id: supplier.id,
      supplier_name: supplier.name,
      store_id: store.id,
      status,
      priority: Math.floor(Math.random() * 5) + 1,
      expected_date: expectedDate.toISOString(),
      actual_delivery_date: status === 'delivered' ? expectedDate.toISOString() : null,
      total_amount: Math.floor(Math.random() * 5000) + 500,
      total_items: Math.floor(Math.random() * 10) + 1,
      driver_id: status !== 'pending' && drivers.length > 0 ? drivers[Math.floor(Math.random() * drivers.length)].id : null,
      special_instructions: i % 3 === 0 ? 'Обережно з крихкими товарами' : null,
      special_instructions_ua: i % 3 === 0 ? 'Обережно з крихкими товарами' : null,
      notes: status === 'delivered' ? 'Доставлено успішно' : null,
      notes_ua: status === 'delivered' ? 'Доставлено успішно' : null
    });
  }

  const { data, error } = await supabase.from('deliveries').insert(deliveries).select();
  if (error) throw error;
  
  console.log(`✅ Created ${data.length} deliveries`);
  return data;
}

async function seedDeliveryItems(deliveries: any[], products: any[]) {
  console.log('📋 Seeding delivery items...');
  
  const deliveryItems = [];
  
  for (const delivery of deliveries) {
    const numItems = Math.floor(Math.random() * 5) + 1;
    const selectedProducts = products.sort(() => 0.5 - Math.random()).slice(0, numItems);
    
    for (const product of selectedProducts) {
      deliveryItems.push({
        id: uuidv4(),
        delivery_id: delivery.id,
        product_id: product.id,
        product_name: product.name,
        product_name_ua: product.name_ua,
        sku: product.sku,
        quantity: Math.floor(Math.random() * 20) + 1,
        unit_price: product.cost,
        received_quantity: delivery.status === 'delivered' ? Math.floor(Math.random() * 20) + 1 : 0,
        damaged_quantity: delivery.status === 'delivered' && Math.random() > 0.8 ? Math.floor(Math.random() * 3) : 0,
        expiry_date: product.expiry_date,
        batch_number: `BATCH${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
        quality_notes: Math.random() > 0.7 ? 'Товар у відмінному стані' : null,
        quality_notes_ua: Math.random() > 0.7 ? 'Товар у відмінному стані' : null
      });
    }
  }

  const { data, error } = await supabase.from('delivery_items').insert(deliveryItems).select();
  if (error) throw error;
  
  console.log(`✅ Created ${data.length} delivery items`);
  return data;
}

async function seedDeliveryEvents(deliveries: any[], employees: any[]) {
  console.log('📅 Seeding delivery events...');
  
  const events = [];
  
  for (const delivery of deliveries) {
    // Created event
    events.push({
      id: uuidv4(),
      delivery_id: delivery.id,
      event_type: 'created',
      event_status: 'completed',
      event_timestamp: new Date(new Date(delivery.expected_date).getTime() - 24 * 60 * 60 * 1000).toISOString(),
      notes: 'Замовлення створено',
      notes_ua: 'Замовлення створено',
      created_by: employees.find(e => e.role === 'logistics_specialist')?.id
    });

    if (delivery.status !== 'pending') {
      // Dispatched event
      events.push({
        id: uuidv4(),
        delivery_id: delivery.id,
        event_type: 'dispatched',
        event_status: 'completed',
        event_timestamp: new Date(new Date(delivery.expected_date).getTime() - 12 * 60 * 60 * 1000).toISOString(),
        notes: 'Відправлено зі складу',
        notes_ua: 'Відправлено зі складу',
        created_by: delivery.driver_id
      });
    }

    if (delivery.status === 'delivered') {
      // Delivered event
      events.push({
        id: uuidv4(),
        delivery_id: delivery.id,
        event_type: 'completed',
        event_status: 'completed',
        event_timestamp: delivery.actual_delivery_date,
        notes: 'Доставлено успішно',
        notes_ua: 'Доставлено успішно',
        created_by: delivery.driver_id
      });
    }
  }

  const { data, error } = await supabase.from('delivery_events').insert(events).select();
  if (error) throw error;
  
  console.log(`✅ Created ${data.length} delivery events`);
  return data;
}

async function seedGasCards(employees: any[]) {
  console.log('⛽ Seeding gas cards...');
  
  const drivers = employees.filter(e => e.role === 'driver');
  
  const gasCards = drivers.map((driver, index) => ({
    id: uuidv4(),
    card_number: `GC-${String(index + 1).padStart(4, '0')}-${Math.floor(Math.random() * 9000) + 1000}`,
    employee_id: driver.id,
    balance: Math.floor(Math.random() * 2000) + 500,
    credit_limit: 3000,
    status: 'active',
    expiry_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    daily_limit: 500,
    monthly_limit: 5000,
    notes: 'Картка для службових поїздок',
    notes_ua: 'Картка для службових поїздок'
  }));

  const { data, error } = await supabase.from('gas_cards').insert(gasCards).select();
  if (error) throw error;
  
  console.log(`✅ Created ${data.length} gas cards`);
  return data;
}

async function seedNotifications(employees: any[]) {
  console.log('🔔 Seeding notifications...');
  
  const notifications = [
    {
      id: uuidv4(),
      recipient_id: employees.find(e => e.role === 'admin')?.id,
      type: 'low_stock',
      title: 'Low Stock Alert',
      title_ua: 'Сповіщення про низький запас',
      message: 'Several products are running low on stock',
      message_ua: 'Кілька товарів мають низький рівень запасів',
      priority: 'high',
      is_read: false
    },
    {
      id: uuidv4(),
      recipient_id: employees.find(e => e.role === 'logistics_specialist')?.id,
      type: 'delivery_update',
      title: 'Delivery Status Update',
      title_ua: 'Оновлення статусу доставки',
      message: 'Delivery DEL-20250101-001 has been completed',
      message_ua: 'Доставка DEL-20250101-001 завершена',
      priority: 'normal',
      is_read: false
    },
    {
      id: uuidv4(),
      recipient_id: employees.find(e => e.role === 'driver')?.id,
      type: 'route_assignment',
      title: 'New Route Assignment',
      title_ua: 'Новий маршрут призначено',
      message: 'You have been assigned to delivery route #123',
      message_ua: 'Вам призначено маршрут доставки #123',
      priority: 'normal',
      is_read: true,
      read_at: new Date().toISOString()
    }
  ];

  const { data, error } = await supabase.from('notifications').insert(notifications).select();
  if (error) throw error;
  
  console.log(`✅ Created ${data.length} notifications`);
  return data;
}

async function seedInvitations(employees: any[], stores: any[]) {
  console.log('✉️ Seeding invitations...');
  
  const admin = employees.find(e => e.role === 'admin');
  if (!admin) return [];

  const invitations = [
    {
      id: uuidv4(),
      email: 'newdriver@groceryops.ua',
      role: 'driver',
      store_id: stores[0].id,
      invited_by: admin.id,
      token: `inv_${uuidv4()}`,
      status: 'pending',
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: uuidv4(),
      email: 'warehouse2@groceryops.ua',
      role: 'warehouse_worker',
      store_id: stores[1].id,
      invited_by: admin.id,
      token: `inv_${uuidv4()}`,
      status: 'pending',
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  const { data, error } = await supabase.from('invitations').insert(invitations).select();
  if (error) throw error;
  
  console.log(`✅ Created ${data.length} invitations`);
  return data;
}

async function main() {
  try {
    console.log('🌱 Starting database seeding...');
    console.log('📍 Target: Ukrainian Grocery Logistics System');
    
    // Clear existing data
    await clearExistingData();
    
    // Seed core data
    const stores = await seedStores();
    const suppliers = await seedSuppliers();
    const warehouses = await seedWarehouseLocations(suppliers);
    const users = await seedUsers();
    const employees = await seedEmployees(users, stores);
    
    // Seed product data
    const products = await seedProducts(suppliers);
    const supplierProducts = await seedSupplierProducts(suppliers, products);
    const inventory = await seedInventory(warehouses, supplierProducts);
    
    // Seed operational data
    const deliveries = await seedDeliveries(suppliers, stores, employees);
    const deliveryItems = await seedDeliveryItems(deliveries, products);
    const deliveryEvents = await seedDeliveryEvents(deliveries, employees);
    
    // Seed additional features
    const gasCards = await seedGasCards(employees);
    const notifications = await seedNotifications(employees);
    const invitations = await seedInvitations(employees, stores);
    
    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   • ${stores.length} stores`);
    console.log(`   • ${suppliers.length} suppliers`);
    console.log(`   • ${warehouses.length} warehouses`);
    console.log(`   • ${users.length} users`);
    console.log(`   • ${employees.length} employees`);
    console.log(`   • ${products.length} products`);
    console.log(`   • ${supplierProducts.length} supplier-product relationships`);
    console.log(`   • ${inventory.length} inventory records`);
    console.log(`   • ${deliveries.length} deliveries`);
    console.log(`   • ${deliveryItems.length} delivery items`);
    console.log(`   • ${deliveryEvents.length} delivery events`);
    console.log(`   • ${gasCards.length} gas cards`);
    console.log(`   • ${notifications.length} notifications`);
    console.log(`   • ${invitations.length} invitations`);
    
    console.log('\n🔑 Test Accounts:');
    console.log('   • Admin: admin@groceryops.ua / Admin123!');
    console.log('   • Logistics: logistics@groceryops.ua / Logistics123!');
    console.log('   • Driver: driver@groceryops.ua / Driver123!');
    console.log('   • Warehouse: warehouse@groceryops.ua / Warehouse123!');
    
    console.log('\n✅ Ready for testing and development!');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

// Run the seeding
main();