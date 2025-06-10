import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';

interface User {
  id: string;
  email: string;
  role: 'admin' | 'logistics_specialist' | 'driver' | 'warehouse_worker';
  storeId: string;
  storeName?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  createAdmin: (data: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setLoading(false);
        return;
      }

      apiClient.setToken(token);
      const response = await apiClient.getCurrentUser();
      
      if (response.user && response.employee) {
        setUser({
          id: response.user.id,
          email: response.user.email,
          role: response.employee.role,
          storeId: response.employee.store_id,
          storeName: response.employee.stores?.name || 'Unknown Store'
        });
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('auth_token');
      apiClient.setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const response = await apiClient.signIn(email, password);
      
      if (response.user && response.employee) {
        setUser({
          id: response.user.id,
          email: response.user.email,
          role: response.employee.role,
          storeId: response.employee.store_id,
          storeName: response.employee.stores?.name || 'Unknown Store'
        });
        navigate('/');
      }
    } catch (error) {
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await apiClient.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setUser(null);
      navigate('/login');
    }
  };

  const createAdmin = async (data: any) => {
    try {
      await apiClient.createAdmin(data);
      navigate('/login');
    } catch (error) {
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading GroceryOps...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut, createAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};