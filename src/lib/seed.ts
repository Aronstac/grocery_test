import { supabase } from './supabase';
import { mockProducts, mockEmployees, mockDeliveries } from '../data/mockData';
import { nanoid } from 'nanoid';

async function seedDatabase() {
  try {
    console.log('Starting database seeding...');

    // Create demo store
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .insert({
        name: 'GroceryOps Demo Store',
        address: 'Peremohy Avenue, 37',
        city: 'Kyiv',
        state: 'Kyiv Oblast',
        country: 'Ukraine',
        phone: '+380442204198',
        email: 'demo@groceryops.com'
      })
      .select()
      .single();

    if (storeError) {
      throw new Error(`Failed to create store: ${storeError.message}`);
    }

    console.log('Created demo store:', store.id);

    // Create suppliers
    const suppliers = [
      {
        name: 'Fresh Farms Inc.',
        address: 'Khreshchatyk Street, 1',
        city: 'Kyiv',
        state_province: 'Kyiv Oblast',
        country: 'Ukraine',
        postal_code: '01001',
        contact_email: 'contact@freshfarms.com',
        contact_phone: '+380441234567',
        business_hours: 'Mon-Fri 9:00-18:00'
      },
      {
        name: 'Valley Dairy Co.',
        address: 'Svobody Avenue, 1',
        city: 'Lviv',
        state_province: 'Lviv Oblast',
        country: 'Ukraine',
        postal_code: '79000',
        contact_email: 'info@valleydairy.com',
        contact_phone: '+380322345678',
        business_hours: 'Mon-Sat 8:00-20:00'
      },
      {
        name: 'Green Gardens',
        address: 'Soborna Square, 1',
        city: 'Dnipro',
        state_province: 'Dnipropetrovsk Oblast',
        country: 'Ukraine',
        postal_code: '49000',
        contact_email: 'hello@greengardens.com',
        contact_phone: '+380563456789',
        business_hours: 'Mon-Fri 8:00-17:00'
      }
    ];

    const { data: createdSuppliers, error: suppliersError } = await supabase
      .from('suppliers')
      .insert(suppliers)
      .select();

    if (suppliersError) {
      throw new Error(`Failed to create suppliers: ${suppliersError.message}`);
    }

    console.log('Created suppliers:', createdSuppliers.length);

    // Create warehouse locations for each supplier
    const warehouses = createdSuppliers.map(supplier => ({
      supplier_id: supplier.id,
      name: `${supplier.name} Main Warehouse`,
      address: supplier.address,
      city: supplier.city,
      state_province: supplier.state_province,
      country: supplier.country,
      postal_code: supplier.postal_code,
      contact_email: supplier.contact_email,
      contact_phone: supplier.contact_phone
    }));

    const { data: createdWarehouses, error: warehousesError } = await supabase
      .from('warehouse_locations')
      .insert(warehouses)
      .select();

    if (warehousesError) {
      throw new Error(`Failed to create warehouses: ${warehousesError.message}`);
    }

    console.log('Created warehouses:', createdWarehouses.length);

    // Create products and link them to suppliers
    const productsToCreate = mockProducts.map(product => {
      const supplier = createdSuppliers.find(s => s.name === product.supplier) || createdSuppliers[0];
      return {
        name: product.name,
        category: product.category,
        price: product.price,
        cost: product.cost,
        stock: product.stock,
        reorder_level: product.reorderLevel,
        supplier_id: supplier.id,
        image_url: product.imageUrl,
        expiry_date: product.expiryDate
      };
    });

    const { data: createdProducts, error: productsError } = await supabase
      .from('products')
      .insert(productsToCreate)
      .select();

    if (productsError) {
      throw new Error(`Failed to create products: ${productsError.message}`);
    }

    console.log('Created products:', createdProducts.length);

    // Create supplier_products entries
    const supplierProducts = createdProducts.map(product => ({
      supplier_id: product.supplier_id,
      product_id: product.id,
      sku: `SKU-${nanoid(8)}`,
      cost: product.cost,
      price: product.price,
      reorder_level: product.reorder_level
    }));

    const { data: createdSupplierProducts, error: supplierProductsError } = await supabase
      .from('supplier_products')
      .insert(supplierProducts)
      .select();

    if (supplierProductsError) {
      throw new Error(`Failed to create supplier products: ${supplierProductsError.message}`);
    }

    console.log('Created supplier products:', createdSupplierProducts.length);

    // Create inventory entries
    const inventoryEntries = createdSupplierProducts.map((sp, index) => {
      const warehouse = createdWarehouses.find(w => w.supplier_id === sp.supplier_id);
      const product = createdProducts[index];
      return {
        warehouse_id: warehouse.id,
        supplier_product_id: sp.id,
        stock_level: product.stock,
        min_threshold: product.reorder_level,
        max_threshold: product.reorder_level * 3
      };
    });

    const { data: createdInventory, error: inventoryError } = await supabase
      .from('inventory')
      .insert(inventoryEntries)
      .select();

    if (inventoryError) {
      throw new Error(`Failed to create inventory: ${inventoryError.message}`);
    }

    console.log('Created inventory entries:', createdInventory.length);

    // Create employees
    const employeesToCreate = mockEmployees.map(employee => ({
      ...employee,
      store_id: store.id
    }));

    const { data: createdEmployees, error: employeesError } = await supabase
      .from('employees')
      .insert(employeesToCreate)
      .select();

    if (employeesError) {
      throw new Error(`Failed to create employees: ${employeesError.message}`);
    }

    console.log('Created employees:', createdEmployees.length);

    // Create deliveries
    const deliveriesToCreate = mockDeliveries.map(delivery => {
      const supplier = createdSuppliers.find(s => s.name === delivery.supplierName) || createdSuppliers[0];
      return {
        supplier_id: supplier.id,
        supplier_name: supplier.name,
        status: delivery.status,
        expected_date: delivery.expectedDate,
        delivered_date: delivery.deliveredDate,
        total_amount: delivery.totalAmount,
        notes: delivery.notes
      };
    });

    const { data: createdDeliveries, error: deliveriesError } = await supabase
      .from('deliveries')
      .insert(deliveriesToCreate)
      .select();

    if (deliveriesError) {
      throw new Error(`Failed to create deliveries: ${deliveriesError.message}`);
    }

    console.log('Created deliveries:', createdDeliveries.length);

    // Create delivery items
    const deliveryItems = mockDeliveries.flatMap((delivery, index) => {
      return delivery.items.map(item => {
        const product = createdProducts.find(p => p.name === item.productName);
        return {
          delivery_id: createdDeliveries[index].id,
          product_id: product.id,
          product_name: item.productName,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          total_price: item.totalPrice
        };
      });
    });

    const { error: deliveryItemsError } = await supabase
      .from('delivery_items')
      .insert(deliveryItems);

    if (deliveryItemsError) {
      throw new Error(`Failed to create delivery items: ${deliveryItemsError.message}`);
    }

    console.log('Created delivery items');

    // Create gas cards for drivers
    const driverEmployees = createdEmployees.filter(e => e.position === 'Driver');
    const gasCards = driverEmployees.map(driver => ({
      card_number: `GC-${nanoid(8)}`,
      employee_id: driver.id,
      balance: 1000.00,
      expiry_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }));

    if (gasCards.length > 0) {
      const { error: gasCardsError } = await supabase
        .from('gas_cards')
        .insert(gasCards);

      if (gasCardsError) {
        throw new Error(`Failed to create gas cards: ${gasCardsError.message}`);
      }

      console.log('Created gas cards:', gasCards.length);
    }

    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Seeding error:', error);
    throw error;
  }
}

// Run the seeding function
seedDatabase().catch(console.error);