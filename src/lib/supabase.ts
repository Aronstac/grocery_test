import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

// Authentication helpers
export function signInWithPassword({
  email,
  password
}: { email: string; password: string }) {
  return supabase.auth.signInWithPassword({ email, password });
}

export function signOut() {
  return supabase.auth.signOut();
}

export function getSession() {
  return supabase.auth.getSession();
}

// Products
export async function fetchProducts() {
  const { data, error } = await supabase.from('products').select('*');
  if (error) throw error;
  return data as Product[];
}

export async function createProduct(
  product: Omit<Product, 'id' | 'created_at' | 'updated_at'>
) {
  const { data, error } = await supabase
    .from('products')
    .insert(product)
    .select()
    .single();
  if (error) throw error;
  return data as Product;
}

export async function updateProduct(id: string, updates: Partial<Product>) {
  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as Product;
}

export async function deleteProduct(id: string) {
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw error;
}

// Deliveries
export async function fetchDeliveries() {
  const { data, error } = await supabase.from('deliveries').select('*');
  if (error) throw error;
  return data as Delivery[];
}

export async function createDelivery(
  delivery: Omit<Delivery, 'id' | 'created_at' | 'updated_at'>,
  items: Omit<DeliveryItem, 'id' | 'created_at' | 'updated_at'>[]
) {
  const { data, error } = await supabase
    .from('deliveries')
    .insert(delivery)
    .select()
    .single();
  if (error) throw error;

  if (items.length > 0) {
    const itemsWithDelivery = items.map((item) => ({
      ...item,
      delivery_id: data.id
    }));
    const { error: itemError } = await supabase
      .from('delivery_items')
      .insert(itemsWithDelivery);
    if (itemError) throw itemError;
  }

  return data as Delivery;
}

export async function updateDelivery(id: string, updates: Partial<Delivery>) {
  const { data, error } = await supabase
    .from('deliveries')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as Delivery;
}

export async function deleteDelivery(id: string) {
  const { error } = await supabase.from('deliveries').delete().eq('id', id);
  if (error) throw error;
}

// Employees
export async function fetchEmployees() {
  const { data, error } = await supabase.from('employees').select('*');
  if (error) throw error;
  return data as Employee[];
}

export async function createEmployee(
  employee: Omit<Employee, 'id' | 'created_at' | 'updated_at'>
) {
  const { data, error } = await supabase
    .from('employees')
    .insert(employee)
    .select()
    .single();
  if (error) throw error;
  return data as Employee;
}

export async function updateEmployee(id: string, updates: Partial<Employee>) {
  const { data, error } = await supabase
    .from('employees')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as Employee;
}

export async function deleteEmployee(id: string) {
  const { error } = await supabase.from('employees').delete().eq('id', id);
  if (error) throw error;
}

// User Management
export async function deleteUser(userId: string) {
  const { error } = await supabase.functions.invoke('delete-user', {
    body: { userId }
  });
  if (error) throw error;
}
