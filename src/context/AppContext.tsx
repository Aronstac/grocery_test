import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient } from '../lib/api';

interface AppContextType {
  products: Product[];
  deliveries: Delivery[];
  employees: Employee[];
  currentUser: UserSession['user'] | null;
  loading: boolean;
  error: string | null;
  setCurrentUser: (user: UserSession['user'] | null) => void;
  refreshData: () => Promise<void>;
  addProduct: (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  addDelivery: (delivery: Omit<Delivery, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateDelivery: (id: string, updates: Partial<Delivery>) => Promise<void>;
  deleteDelivery: (id: string) => Promise<void>;
  addEmployee: (employee: Omit<Employee, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateEmployee: (id: string, updates: Partial<Employee>) => Promise<void>;
  deleteEmployee: (id: string) => Promise<void>;
}

interface AppProviderProps {
  children: ReactNode;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [currentUser, setCurrentUser] = useState<UserSession['user'] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser) {
      refreshData();
    }
  }, [currentUser]);

  const refreshData = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      setError(null);

      const [productsResponse, deliveriesResponse, employeesResponse] = await Promise.all([
        apiClient.getProducts(),
        apiClient.getDeliveries(),
        apiClient.getEmployees()
      ]);

      setProducts(productsResponse.products || []);
      setDeliveries(deliveriesResponse.deliveries || []);
      setEmployees(employeesResponse.employees || []);

    } catch (err) {
      console.error('Data fetching error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const addProduct = async (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const response = await apiClient.createProduct(product);
      setProducts(prev => [...prev, response.product]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add product');
      throw err;
    }
  };

  const handleUpdateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      const response = await apiClient.updateProduct(id, updates);
      setProducts(prev => prev.map(product => 
        product.id === id ? { ...product, ...response.product } : product
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update product');
      throw err;
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await apiClient.deleteProduct(id);
      setProducts(prev => prev.filter(product => product.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete product');
      throw err;
    }
  };

  const addDelivery = async (delivery: Omit<Delivery, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const response = await apiClient.createDelivery({
        supplier_id: delivery.supplierId,
        store_id: currentUser?.storeId || '',
        expected_date: delivery.expectedDate,
        priority: 1,
        special_instructions: delivery.notes,
        items: delivery.items.map(item => ({
          product_id: item.productId,
          quantity: item.quantity,
          unit_price: item.unitPrice
        }))
      });
      setDeliveries(prev => [...prev, response.delivery]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add delivery');
      throw err;
    }
  };

  const handleUpdateDelivery = async (id: string, updates: Partial<Delivery>) => {
    try {
      if (updates.status) {
        await apiClient.updateDeliveryStatus(id, {
          status: updates.status,
          notes: updates.notes,
          actual_delivery_date: updates.deliveredDate
        });
      }
      setDeliveries(prev => prev.map(delivery => 
        delivery.id === id ? { ...delivery, ...updates } : delivery
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update delivery');
      throw err;
    }
  };

  const handleDeleteDelivery = async (id: string) => {
    try {
      // Note: Backend doesn't have delete delivery endpoint, so we'll just remove from state
      setDeliveries(prev => prev.filter(delivery => delivery.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete delivery');
      throw err;
    }
  };

  const addEmployee = async (employee: Omit<Employee, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      // Note: Employee creation should be done through invitations
      // This is a placeholder implementation
      throw new Error('Employee creation should be done through invitations');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add employee');
      throw err;
    }
  };

  const handleUpdateEmployee = async (id: string, updates: Partial<Employee>) => {
    try {
      const response = await apiClient.updateEmployee(id, updates);
      setEmployees(prev => prev.map(employee => 
        employee.id === id ? { ...employee, ...response.employee } : employee
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update employee');
      throw err;
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    try {
      await apiClient.deleteEmployee(id);
      setEmployees(prev => prev.filter(employee => employee.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete employee');
      throw err;
    }
  };

  return (
    <AppContext.Provider
      value={{
        products,
        deliveries,
        employees,
        currentUser,
        loading,
        error,
        setCurrentUser,
        refreshData,
        addProduct,
        updateProduct: handleUpdateProduct,
        deleteProduct: handleDeleteProduct,
        addDelivery,
        updateDelivery: handleUpdateDelivery,
        deleteDelivery: handleDeleteDelivery,
        addEmployee,
        updateEmployee: handleUpdateEmployee,
        deleteEmployee: handleDeleteEmployee,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};