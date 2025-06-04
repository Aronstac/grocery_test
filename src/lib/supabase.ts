import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.VITE_SUPABASE_URL || 'http://localhost';
const supabaseAnonKey =
  process.env.VITE_SUPABASE_ANON_KEY || 'public-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// -----------------------------
// Products
// -----------------------------

export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase.from('products').select('*');
  if (error) throw error;

  return (
    data?.map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      price: p.price,
      cost: p.cost,
      stock: p.stock,
      reorderLevel: p.reorder_level,
      supplier: (p as any).supplier ?? (p as any).supplier_name ?? '',
      imageUrl: p.image_url ?? undefined,
      expiryDate: p.expiry_date ?? undefined,
      createdAt: p.created_at,
      updatedAt: p.updated_at,
    })) ?? []
  );
}

export async function createProduct(
  product: Omit<Product, 'id' | 'created_at' | 'updated_at'>
): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .insert({
      name: product.name,
      category: product.category,
      price: product.price,
      cost: product.cost,
      stock: product.stock,
      reorder_level: product.reorderLevel,
      supplier: (product as any).supplier,
      image_url: product.imageUrl,
      expiry_date: product.expiryDate,
    })
    .select()
    .single();

  if (error || !data) throw error || new Error('Failed to create product');

  return {
    id: data.id,
    name: data.name,
    category: data.category,
    price: data.price,
    cost: data.cost,
    stock: data.stock,
    reorderLevel: data.reorder_level,
    supplier: (data as any).supplier ?? (data as any).supplier_name ?? '',
    imageUrl: data.image_url ?? undefined,
    expiryDate: data.expiry_date ?? undefined,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

export async function updateProduct(
  id: string,
  updates: Partial<Product>
): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .update({
      name: updates.name,
      category: updates.category,
      price: updates.price,
      cost: updates.cost,
      stock: updates.stock,
      reorder_level: updates.reorderLevel,
      supplier: (updates as any).supplier,
      image_url: updates.imageUrl,
      expiry_date: updates.expiryDate,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error || !data) throw error || new Error('Failed to update product');

  return {
    id: data.id,
    name: data.name,
    category: data.category,
    price: data.price,
    cost: data.cost,
    stock: data.stock,
    reorderLevel: data.reorder_level,
    supplier: (data as any).supplier ?? (data as any).supplier_name ?? '',
    imageUrl: data.image_url ?? undefined,
    expiryDate: data.expiry_date ?? undefined,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw error;
}

// -----------------------------
// Deliveries
// -----------------------------

export async function fetchDeliveries(): Promise<Delivery[]> {
  const { data, error } = await supabase
    .from('deliveries')
    .select('*, delivery_items(*)');

  if (error) throw error;

  return (
    data?.map((d) => ({
      id: d.id,
      supplierId: d.supplier_id,
      supplierName: d.supplier_name,
      status: d.status,
      items: (d.delivery_items ?? []).map((item: any) => ({
        productId: item.product_id,
        productName: item.product_name,
        quantity: item.quantity,
        unitPrice: item.unit_price,
        totalPrice: item.total_price,
      })),
      expectedDate: d.expected_date,
      deliveredDate: d.delivered_date ?? undefined,
      totalAmount: d.total_amount,
      notes: d.notes ?? undefined,
      createdAt: d.created_at,
      updatedAt: d.updated_at,
    })) ?? []
  );
}

export async function createDelivery(
  delivery: Omit<Delivery, 'id' | 'created_at' | 'updated_at'>,
  items: Omit<DeliveryItem, 'id' | 'created_at' | 'updated_at'>[]
): Promise<Delivery> {
  const { data: delData, error } = await supabase
    .from('deliveries')
    .insert({
      supplier_id: delivery.supplierId,
      supplier_name: delivery.supplierName,
      status: delivery.status,
      expected_date: delivery.expectedDate,
      delivered_date: delivery.deliveredDate,
      total_amount: delivery.totalAmount,
      notes: delivery.notes,
    })
    .select()
    .single();

  if (error || !delData) throw error || new Error('Failed to create delivery');

  if (items.length) {
    const formatted = items.map((i) => ({
      delivery_id: delData.id,
      product_id: i.productId,
      product_name: i.productName,
      quantity: i.quantity,
      unit_price: i.unitPrice,
      total_price: i.totalPrice,
    }));

    const { error: itemErr } = await supabase
      .from('delivery_items')
      .insert(formatted);

    if (itemErr) throw itemErr;
  }

  return {
    id: delData.id,
    supplierId: delData.supplier_id,
    supplierName: delData.supplier_name,
    status: delData.status,
    items,
    expectedDate: delData.expected_date,
    deliveredDate: delData.delivered_date ?? undefined,
    totalAmount: delData.total_amount,
    notes: delData.notes ?? undefined,
    createdAt: delData.created_at,
    updatedAt: delData.updated_at,
  };
}

export async function updateDelivery(
  id: string,
  updates: Partial<Delivery>
): Promise<Delivery> {
  const { data, error } = await supabase
    .from('deliveries')
    .update({
      supplier_id: updates.supplierId,
      supplier_name: updates.supplierName,
      status: updates.status,
      expected_date: updates.expectedDate,
      delivered_date: updates.deliveredDate,
      total_amount: updates.totalAmount,
      notes: updates.notes,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('*, delivery_items(*)')
    .single();

  if (error || !data) throw error || new Error('Failed to update delivery');

  return {
    id: data.id,
    supplierId: data.supplier_id,
    supplierName: data.supplier_name,
    status: data.status,
    items: (data.delivery_items ?? []).map((item: any) => ({
      productId: item.product_id,
      productName: item.product_name,
      quantity: item.quantity,
      unitPrice: item.unit_price,
      totalPrice: item.total_price,
    })),
    expectedDate: data.expected_date,
    deliveredDate: data.delivered_date ?? undefined,
    totalAmount: data.total_amount,
    notes: data.notes ?? undefined,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

export async function deleteDelivery(id: string): Promise<void> {
  const { error } = await supabase.from('deliveries').delete().eq('id', id);
  if (error) throw error;
}

// -----------------------------
// Employees
// -----------------------------

export async function fetchEmployees(): Promise<Employee[]> {
  const { data, error } = await supabase.from('employees').select('*');
  if (error) throw error;

  return (
    data?.map((e) => ({
      id: e.id,
      name: e.name,
      position: e.position,
      email: e.email,
      phone: e.phone,
      avatar: e.avatar ?? undefined,
      department: e.department,
      startDate: e.start_date,
      status: e.status,
      role: e.role,
      storeId: e.store_id,
      storeName: e.store_name ?? undefined,
    })) ?? []
  );
}

export async function createEmployee(
  employee: Omit<Employee, 'id' | 'created_at' | 'updated_at'>
): Promise<Employee> {
  const { data, error } = await supabase
    .from('employees')
    .insert({
      name: employee.name,
      position: employee.position,
      email: employee.email,
      phone: employee.phone,
      avatar: employee.avatar,
      department: employee.department,
      start_date: employee.startDate,
      status: employee.status,
      role: employee.role,
      store_id: employee.storeId,
    })
    .select()
    .single();

  if (error || !data) throw error || new Error('Failed to create employee');

  return {
    id: data.id,
    name: data.name,
    position: data.position,
    email: data.email,
    phone: data.phone,
    avatar: data.avatar ?? undefined,
    department: data.department,
    startDate: data.start_date,
    status: data.status,
    role: data.role,
    storeId: data.store_id,
    storeName: data.store_name ?? undefined,
  };
}

export async function updateEmployee(
  id: string,
  updates: Partial<Employee>
): Promise<Employee> {
  const { data, error } = await supabase
    .from('employees')
    .update({
      name: updates.name,
      position: updates.position,
      email: updates.email,
      phone: updates.phone,
      avatar: updates.avatar,
      department: updates.department,
      start_date: updates.startDate,
      status: updates.status,
      role: updates.role,
      store_id: updates.storeId,
      store_name: updates.storeName,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error || !data) throw error || new Error('Failed to update employee');

  return {
    id: data.id,
    name: data.name,
    position: data.position,
    email: data.email,
    phone: data.phone,
    avatar: data.avatar ?? undefined,
    department: data.department,
    startDate: data.start_date,
    status: data.status,
    role: data.role,
    storeId: data.store_id,
    storeName: data.store_name ?? undefined,
  };
}

export async function deleteEmployee(id: string): Promise<void> {
  const { error } = await supabase.from('employees').delete().eq('id', id);
  if (error) throw error;
}

// -----------------------------
// User Management
// -----------------------------

export async function deleteUser(userId: string): Promise<void> {
  const { error } = await supabase.functions.invoke('delete-user', {
    body: { userId },
  });

  if (error) throw error;
}
