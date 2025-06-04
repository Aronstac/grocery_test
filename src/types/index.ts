// Product Types
interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
  reorderLevel: number;
  supplier: string;
  imageUrl?: string;
  expiryDate?: string;
  createdAt: string;
  updatedAt: string;
}

// Delivery Types
interface Delivery {
  id: string;
  supplierId: string;
  supplierName: string;
  status: 'pending' | 'in-transit' | 'delivered' | 'canceled';
  items: DeliveryItem[];
  expectedDate: string;
  deliveredDate?: string;
  totalAmount: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface DeliveryItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

// Employee Types
interface Employee {
  id: string;
  name: string;
  position: string;
  email: string;
  phone: string;
  avatar?: string;
  department: string;
  startDate: string;
  status: 'active' | 'on-leave' | 'terminated';
  role: 'admin' | 'logistics_specialist' | 'driver' | 'warehouse_worker';
  storeId: string;
  storeName?: string;
}

// Store Types
interface Store {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  phone: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

// Invitation Types
interface Invitation {
  id: string;
  email: string;
  role: Employee['role'];
  storeId: string;
  token: string;
  status: 'pending' | 'accepted' | 'expired';
  expiresAt: string;
  createdAt: string;
}

// Financial Types
interface FinancialData {
  date: string;
  revenue: number;
  expenses: number;
  profit: number;
}

// Delivery Point Types
interface DeliveryPoint {
  id: string;
  name: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  lastUsed: string;
}

// Gas Card Types
interface GasCard {
  id: string;
  cardNumber: string;
  employeeId: string;
  balance: number;
  status: 'active' | 'blocked' | 'expired';
  expiryDate: string;
  lastUsed?: string;
}

// Problem Report Types
interface ProblemReport {
  id: string;
  employeeId: string;
  type: 'delivery' | 'product' | 'vehicle' | 'other';
  description: string;
  imageUrl?: string;
  status: 'pending' | 'in-progress' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

// Auth Types
interface UserSession {
  user: {
    id: string;
    email: string;
    role: Employee['role'];
    storeId: string;
    storeName?: string;
  };
  expires_at: number;
}