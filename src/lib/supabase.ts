// DEMO MODE: This file has been refactored to use mock data instead of Supabase
// Original Supabase implementation is commented out for future reference

import { mockProducts, mockDeliveries, mockEmployees } from '../data/mockData';

// Mock authentication functions
export const supabase = {
  auth: {
    signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
      // In demo mode, accept any credentials
      return {
        data: {
          user: {
            id: 'demo-user-id',
            email,
            role: 'admin'
          },
          session: {
            access_token: 'demo-token',
            expires_at: Date.now() + 24 * 60 * 60 * 1000 // 24 hours from now
          }
        },
        error: null
      };
    },
    signOut: async () => {
      return { error: null };
    },
    getSession: async () => {
      // Return a mock session
      return {
        data: {
          session: {
            user: {
              id: 'demo-user-id',
              email: 'demo@example.com',
              role: 'admin'
            },
            access_token: 'demo-token',
            expires_at: Date.now() + 24 * 60 * 60 * 1000
          }
        },
        error: null
      };
    },
    onAuthStateChange: (callback: Function) => {
      // Return a mock subscription that does nothing
      return {
        data: { subscription: { unsubscribe: () => {} } }
      };
    }
  }
};

// Products
export async function fetchProducts() {
  return mockProducts;
}

export async function createProduct(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) {
  const newProduct = {
    ...product,
    id: `prod_${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  mockProducts.push(newProduct);
  return newProduct;
}

export async function updateProduct(id: string, updates: Partial<Product>) {
  const index = mockProducts.findIndex(p => p.id === id);
  if (index === -1) throw new Error('Product not found');
  
  mockProducts[index] = {
    ...mockProducts[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  return mockProducts[index];
}

export async function deleteProduct(id: string) {
  const index = mockProducts.findIndex(p => p.id === id);
  if (index === -1) throw new Error('Product not found');
  mockProducts.splice(index, 1);
}

// Deliveries
export async function fetchDeliveries() {
  return mockDeliveries;
}

export async function createDelivery(
  delivery: Omit<Delivery, 'id' | 'created_at' | 'updated_at'>,
  items: Omit<DeliveryItem, 'id' | 'created_at' | 'updated_at'>[]
) {
  const newDelivery = {
    ...delivery,
    id: `del_${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  mockDeliveries.push(newDelivery);
  return newDelivery;
}

export async function updateDelivery(id: string, updates: Partial<Delivery>) {
  const index = mockDeliveries.findIndex(d => d.id === id);
  if (index === -1) throw new Error('Delivery not found');
  
  mockDeliveries[index] = {
    ...mockDeliveries[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  return mockDeliveries[index];
}

export async function deleteDelivery(id: string) {
  const index = mockDeliveries.findIndex(d => d.id === id);
  if (index === -1) throw new Error('Delivery not found');
  mockDeliveries.splice(index, 1);
}

// Employees
export async function fetchEmployees() {
  return mockEmployees;
}

export async function createEmployee(employee: Omit<Employee, 'id' | 'created_at' | 'updated_at'>) {
  const newEmployee = {
    ...employee,
    id: `emp_${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  mockEmployees.push(newEmployee);
  return newEmployee;
}

export async function updateEmployee(id: string, updates: Partial<Employee>) {
  const index = mockEmployees.findIndex(e => e.id === id);
  if (index === -1) throw new Error('Employee not found');
  
  mockEmployees[index] = {
    ...mockEmployees[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  return mockEmployees[index];
}

export async function deleteEmployee(id: string) {
  const index = mockEmployees.findIndex(e => e.id === id);
  if (index === -1) throw new Error('Employee not found');
  mockEmployees.splice(index, 1);
}

// User Management
export async function deleteUser(userId: string) {
  // In demo mode, just delete the employee record
  await deleteEmployee(userId);
}