import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient } from '../api/client';
import { useAuth } from './AuthContext';

interface AppContextType {
  products: any[];
  deliveries: any[];
  employees: any[];
  stores: any[];
  gasCards: any[];
  reports: any[];
  notifications: any[];
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
}

interface AppProviderProps {
  children: ReactNode;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [stores, setStores] = useState<any[]>([]);
  const [gasCards, setGasCards] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      refreshData();
    }
  }, [user]);

  const refreshData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const [
        productsResponse,
        deliveriesResponse,
        employeesResponse,
        storesResponse,
        gasCardsResponse,
        reportsResponse,
        notificationsResponse
      ] = await Promise.all([
        apiClient.getProducts().catch(() => ({ products: [] })),
        apiClient.getDeliveries().catch(() => ({ deliveries: [] })),
        apiClient.getEmployees().catch(() => ({ employees: [] })),
        apiClient.getStores().catch(() => ({ stores: [] })),
        apiClient.getGasCards().catch(() => ({ gasCards: [] })),
        apiClient.getReports().catch(() => ({ reports: [] })),
        apiClient.getNotifications().catch(() => ({ notifications: [] }))
      ]);

      setProducts(productsResponse.products || []);
      setDeliveries(deliveriesResponse.deliveries || []);
      setEmployees(employeesResponse.employees || []);
      setStores(storesResponse.stores || []);
      setGasCards(gasCardsResponse.gasCards || []);
      setReports(reportsResponse.reports || []);
      setNotifications(notificationsResponse.notifications || []);

    } catch (err) {
      console.error('Data fetching error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppContext.Provider
      value={{
        products,
        deliveries,
        employees,
        stores,
        gasCards,
        reports,
        notifications,
        loading,
        error,
        refreshData,
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