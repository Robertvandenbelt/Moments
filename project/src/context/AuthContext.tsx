import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { getCurrentUser } from '../services/supabase';
import { User } from '../lib/types';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  refreshUser: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      console.log('AuthContext: Refreshing user');
      const currentUser = await getCurrentUser();
      console.log('AuthContext: Current user:', currentUser);
      setUser(currentUser as User | null);
    } catch (error) {
      console.error('AuthContext: Error refreshing user:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('AuthContext: Initializing auth state');
    refreshUser();

    // Set up auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('AuthContext: Auth state change:', event, !!session?.user);
        if (session?.user) {
          setUser(session.user as User);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => {
      // Clean up the subscription
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// For convenience
export const useSupabaseUser = useAuth;