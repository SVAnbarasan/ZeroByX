import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from './client';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  error: Error | null;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  error: null,
});

export const useAuth = () => useContext(AuthContext);

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    try {
      console.log('Initializing auth state...');
      
      // Set up auth state listener
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (_event, session) => {
          console.log('Auth state changed:', { event: _event, hasSession: !!session });
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
        }
      );

      // Get initial session
      supabase.auth.getSession().then(({ data: { session } }) => {
        console.log('Initial session loaded:', { hasSession: !!session });
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }).catch((err) => {
        console.error('Failed to get initial session:', err);
        setError(err);
        setLoading(false);
      });

      return () => subscription.unsubscribe();
    } catch (err) {
      console.error('Error in auth setup:', err);
      setError(err as Error);
      setLoading(false);
    }
  }, []);

  const value = {
    session,
    user,
    loading,
    error,
  };

  // Add error boundary rendering
  if (error) {
    console.error('Auth provider error:', error);
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="max-w-md p-4">
          <h2 className="text-xl font-bold text-red-500 mb-2">Authentication Error</h2>
          <p className="text-gray-300">{error.message}</p>
        </div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
