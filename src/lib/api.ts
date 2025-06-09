// API client for the new backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Auth endpoints
  async createAdmin(data: {
    storeName: string;
    storeAddress: string;
    storeCity: string;
    storeState?: string;
    storeCountry: string;
    storePhone?: string;
    storeEmail: string;
    adminName: string;
    adminEmail: string;
    adminPassword: string;
  }) {
    return this.request('/auth/create-admin', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async signIn(email: string, password: string) {
    const response = await this.request<{
      user: any;
      session: any;
      employee: any;
    }>('/auth/signin', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.session?.access_token) {
      this.setToken(response.session.access_token);
    }

    return response;
  }

  async signOut() {
    const response = await this.request('/auth/signout', {
      method: 'POST',
    });
    this.setToken(null);
    return response;
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  // Invitation endpoints
  async createInvitation(data: {
    email: string;
    role: string;
    store_id: string;
  }) {
    return this.request('/invitations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async acceptInvitation(data: {
    token: string;
    password: string;
    name: string;
    phone?: string;
  }) {
    return this.request('/invitations/accept', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getInvitations() {
    return this.request('/invitations');
  }

  async deleteInvitation(id: string) {
    return this.request(`/invitations/${id}`, {
      method: 'DELETE',
    });
  }

  // Product endpoints
  async getProducts(params?: {
    category?: string;
    low_stock?: boolean;
    search?: string;
    limit?: number;
    offset?: number;
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const query = searchParams.toString();
    return this.request(`/products${query ? `?${query}` : ''}`);
  }

  async getProduct(id: string) {
    return this.request(`/products/${id}`);
  }

  async createProduct(data: any) {
    return this.request('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProduct(id: string, data: any) {
    return this.request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteProduct(id: string) {
    return this.request(`/products/${id}`, {
      method: 'DELETE',
    });
  }

  async updateProductStock(id: string, stock: number, notes?: string) {
    return this.request(`/products/${id}/stock`, {
      method: 'PATCH',
      body: JSON.stringify({ stock, notes }),
    });
  }

  // Delivery endpoints
  async getDeliveries(params?: {
    status?: string;
    driver_id?: string;
    date_from?: string;
    date_to?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value);
        }
      });
    }
    
    const query = searchParams.toString();
    return this.request(`/deliveries${query ? `?${query}` : ''}`);
  }

  async getDelivery(id: string) {
    return this.request(`/deliveries/${id}`);
  }

  async createDelivery(data: {
    supplier_id: string;
    store_id: string;
    expected_date: string;
    priority?: number;
    special_instructions?: string;
    items: Array<{
      product_id: string;
      quantity: number;
      unit_price: number;
    }>;
  }) {
    return this.request('/deliveries', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateDeliveryStatus(id: string, data: {
    status: string;
    notes?: string;
    actual_delivery_date?: string;
  }) {
    return this.request(`/deliveries/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async assignDriver(deliveryId: string, driverId: string) {
    return this.request(`/deliveries/${deliveryId}/assign-driver`, {
      method: 'PATCH',
      body: JSON.stringify({ driver_id: driverId }),
    });
  }

  // Employee endpoints
  async getEmployees(params?: {
    role?: string;
    status?: string;
    department?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value);
        }
      });
    }
    
    const query = searchParams.toString();
    return this.request(`/employees${query ? `?${query}` : ''}`);
  }

  async getEmployee(id: string) {
    return this.request(`/employees/${id}`);
  }

  async updateEmployee(id: string, data: any) {
    return this.request(`/employees/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteEmployee(id: string) {
    return this.request(`/employees/${id}`, {
      method: 'DELETE',
    });
  }

  // Store endpoints
  async getStores() {
    return this.request('/stores');
  }

  async getStore(id: string) {
    return this.request(`/stores/${id}`);
  }

  // Supplier endpoints
  async getSuppliers(params?: {
    city?: string;
    region?: string;
    is_active?: boolean;
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const query = searchParams.toString();
    return this.request(`/suppliers${query ? `?${query}` : ''}`);
  }

  // Inventory endpoints
  async getInventory(params?: {
    warehouse_id?: string;
    low_stock?: boolean;
    search?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const query = searchParams.toString();
    return this.request(`/inventory${query ? `?${query}` : ''}`);
  }

  // Gas card endpoints
  async getGasCards(params?: {
    employee_id?: string;
    status?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value);
        }
      });
    }
    
    const query = searchParams.toString();
    return this.request(`/gas-cards${query ? `?${query}` : ''}`);
  }

  async createGasCardTransaction(cardId: string, data: {
    transaction_type: string;
    amount: number;
    merchant_name?: string;
    location?: string;
    fuel_type?: string;
    fuel_quantity_liters?: number;
    odometer_reading?: number;
  }) {
    return this.request(`/gas-cards/${cardId}/transactions`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Reports endpoints
  async getReports(params?: {
    type?: string;
    status?: string;
    priority?: string;
    submitted_by?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value);
        }
      });
    }
    
    const query = searchParams.toString();
    return this.request(`/reports${query ? `?${query}` : ''}`);
  }

  async createReport(data: {
    type: string;
    priority?: string;
    title: string;
    description: string;
    location?: string;
    delivery_id?: string;
    product_id?: string;
    images?: any;
  }) {
    return this.request('/reports', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Notifications endpoints
  async getNotifications(params?: {
    is_read?: boolean;
    priority?: string;
    limit?: number;
    offset?: number;
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const query = searchParams.toString();
    return this.request(`/notifications${query ? `?${query}` : ''}`);
  }

  async markNotificationAsRead(id: string) {
    return this.request(`/notifications/${id}/read`, {
      method: 'PATCH',
    });
  }

  async markAllNotificationsAsRead() {
    return this.request('/notifications/mark-all-read', {
      method: 'PATCH',
    });
  }

  async getUnreadNotificationsCount() {
    return this.request('/notifications/unread/count');
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export default apiClient;