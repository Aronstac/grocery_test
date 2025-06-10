// User Types
export interface User {
  id: string;
  email: string;
  role: 'admin' | 'logistics_specialist' | 'driver' | 'warehouse_worker';
  storeId: string;
  storeName?: string;
}

// Product Types
export interface Product {
  id: string;
  name: string;
  name_ua?: string;
  description?: string;
  category: string;
  sku?: string;
  barcode?: string;
  price: number;
  cost?: number;
  stock: number;
  reorder_level: number;
  supplier_id?: string;
  image_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Delivery Types
export interface Delivery {
  id: string;
  delivery_number: string;
  supplier_id: string;
  supplier_name: string;
  store_id: string;
  status: 'pending' | 'in_transit' | 'delivered' | 'canceled';
  priority: number;
  expected_date: string;
  actual_delivery_date?: string;
  total_amount: number;
  total_items: number;
  driver_id?: string;
  special_instructions?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  items: DeliveryItem[];
}

export interface DeliveryItem {
  id: string;
  delivery_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  received_quantity?: number;
  damaged_quantity?: number;
}

// Employee Types
export interface Employee {
  id: string;
  name: string;
  name_ua?: string;
  email: string;
  phone?: string;
  position: string;
  department: string;
  role: 'admin' | 'logistics_specialist' | 'driver' | 'warehouse_worker';
  status: 'active' | 'on_leave' | 'terminated';
  store_id: string;
  avatar?: string;
  hire_date: string;
  created_at: string;
  updated_at: string;
}

// Store Types
export interface Store {
  id: string;
  name: string;
  address: string;
  city: string;
  region: string;
  country: string;
  postal_code?: string;
  phone?: string;
  email?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Gas Card Types
export interface GasCard {
  id: string;
  card_number: string;
  employee_id: string;
  balance: number;
  credit_limit?: number;
  status: 'active' | 'blocked' | 'expired';
  expiry_date: string;
  last_used_at?: string;
  daily_limit?: number;
  monthly_limit?: number;
  created_at: string;
  updated_at: string;
  employee?: Employee;
}

// Report Types
export interface Report {
  id: string;
  report_number: string;
  submitted_by: string;
  type: 'delivery' | 'product' | 'vehicle' | 'other';
  priority: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  assigned_to?: string;
  created_at: string;
  updated_at: string;
  submitted_by_employee?: Employee;
  assigned_to_employee?: Employee;
}

// Notification Types
export interface Notification {
  id: string;
  recipient_id: string;
  sender_id?: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  read_at?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  action_url?: string;
  created_at: string;
}

// Analytics Types
export interface AnalyticsSummary {
  stats: {
    totalProducts: number;
    totalDeliveries: number;
    activeEmployees: number;
    lowStockItems: number;
    totalRevenue: number;
    pendingDeliveries: number;
    todaysRevenue: number;
  };
  charts: {
    dailyRevenue: Array<{
      date: string;
      revenue: number;
      expenses: number;
      profit: number;
    }>;
    monthlySales: Array<{
      month: string;
      revenue: number;
    }>;
    topSellingCategories: Array<{
      category: string;
      sales: number;
    }>;
  };
}