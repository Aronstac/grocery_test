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

  // Products
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

  // Deliveries
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

  // Employees
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

  // Stores
  async getStores() {
    return this.request('/stores');
  }

  // Gas Cards
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

  // Reports
  async getReports(params?: {
    type?: string;
    status?: string;
    priority?: string;
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
  }) {
    return this.request('/reports', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Notifications
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

  // Analytics
  async getAnalyticsSummary(params?: {
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
    return this.request(`/analytics/dashboard${query ? `?${query}` : ''}`);
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export default apiClient;