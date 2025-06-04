import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAppContext } from '../../context/AppContext';

interface AuthContextType {
  signOut: () => Promise<void>;
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
  const navigate = useNavigate();
  const { setCurrentUser } = useAppContext();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and fetch user profile
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const { data } = await supabase
          .from('users')
          .select('role, store_id, stores(name)')
          .eq('id', session.user.id)
          .single();

        if (data) {
          setCurrentUser({
            id: session.user.id,
            email: session.user.email || '',
            role: data.role,
            storeId: data.store_id,
            storeName: data.stores?.name ?? ''
          });
        }
      }
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const { data } = await supabase
          .from('users')
          .select('role, store_id, stores(name)')
          .eq('id', session.user.id)
          .single();

        if (data) {
          setCurrentUser({
            id: session.user.id,
            email: session.user.email || '',
            role: data.role,
            storeId: data.store_id,
            storeName: data.stores?.name ?? ''
          });
        }
      } else {
        setCurrentUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    navigate('/login');
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
    <AuthContext.Provider value={{ signOut }}>
      {children}
    </AuthContext.Provider>
  );
};