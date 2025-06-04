import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  fetchProducts, 
  fetchDeliveries, 
  fetchEmployees,
  createProduct,
  updateProduct,
  deleteProduct,
  createDelivery,
  updateDelivery,
  deleteDelivery,
  createEmployee,
  updateEmployee,
  deleteEmployee
} from '../lib/supabase';
import { mockProducts, mockDeliveries, mockEmployees } from '../data/mockData';

interface AppContextType {
  products: Product[];
  deliveries: Delivery[];
  employees: Employee[];
  currentUser: UserSession['user'] | null;
  loading: boolean;
  error: string | null;
  setCurrentUser: (user: UserSession['user'] | null) => void;
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to fetch data from Supabase
      const [productsData, deliveriesData, employeesData] = await Promise.all([
        fetchProducts(),
        fetchDeliveries(),
        fetchEmployees()
      ]);

      // Use fetched data or fall back to mock data if empty
      setProducts(productsData?.length ? productsData : mockProducts);
      setDeliveries(deliveriesData?.length ? deliveriesData : mockDeliveries);
      setEmployees(employeesData?.length ? employeesData : mockEmployees);

    } catch (err) {
      console.error('Data fetching error:', err);
      // Fall back to mock data on error
      setProducts(mockProducts);
      setDeliveries(mockDeliveries);
      setEmployees(mockEmployees);
      setError('Failed to fetch data from database. Using mock data instead.');
    } finally {
      setLoading(false);
    }
  };

  const addProduct = async (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newProduct = await createProduct(product);
      setProducts(prev => [...prev, newProduct]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add product');
      throw err;
    }
  };

  const handleUpdateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      const updatedProduct = await updateProduct(id, updates);
      setProducts(prev => prev.map(product => 
        product.id === id ? { ...product, ...updatedProduct } : product
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update product');
      throw err;
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await deleteProduct(id);
      setProducts(prev => prev.filter(product => product.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete product');
      throw err;
    }
  };

  const addDelivery = async (delivery: Omit<Delivery, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newDelivery = await createDelivery(delivery, delivery.items);
      setDeliveries(prev => [...prev, newDelivery]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add delivery');
      throw err;
    }
  };

  const handleUpdateDelivery = async (id: string, updates: Partial<Delivery>) => {
    try {
      const updatedDelivery = await updateDelivery(id, updates);
      setDeliveries(prev => prev.map(delivery => 
        delivery.id === id ? { ...delivery, ...updatedDelivery } : delivery
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update delivery');
      throw err;
    }
  };

  const handleDeleteDelivery = async (id: string) => {
    try {
      await deleteDelivery(id);
      setDeliveries(prev => prev.filter(delivery => delivery.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete delivery');
      throw err;
    }
  };

  const addEmployee = async (employee: Omit<Employee, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newEmployee = await createEmployee(employee);
      setEmployees(prev => [...prev, newEmployee]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add employee');
      throw err;
    }
  };

  const handleUpdateEmployee = async (id: string, updates: Partial<Employee>) => {
    try {
      const updatedEmployee = await updateEmployee(id, updates);
      setEmployees(prev => prev.map(employee => 
        employee.id === id ? { ...employee, ...updatedEmployee } : employee
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update employee');
      throw err;
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    try {
      await deleteEmployee(id);
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