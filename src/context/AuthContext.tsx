import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured, checkUserIsAdmin } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  isLoading: boolean;
  isConfigured: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; isAdmin?: boolean; error?: string }>;
  signOut: () => Promise<void>;
  refreshAdminStatus: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const verifyAdmin = useCallback(async (userId?: string): Promise<boolean> => {
    if (!userId) {
      setIsAdmin(false);
      return false;
    }
    const adminResult = await checkUserIsAdmin(userId);
    setIsAdmin(adminResult);
    return adminResult;
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    // Check existing session
    supabase.auth.getSession().then(async ({ data: { session: existingSession } }) => {
      if (!isMounted) return;
      setSession(existingSession);
      setUser(existingSession?.user ?? null);

      if (existingSession?.user) {
        await verifyAdmin(existingSession.user.id);
      } else {
        setIsAdmin(false);
      }
      setIsLoading(false);
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, currentSession) => {
      if (!isMounted) return;
      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (currentSession?.user) {
        await verifyAdmin(currentSession.user.id);
      } else {
        setIsAdmin(false);
      }
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [verifyAdmin]);

  const signIn = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; isAdmin?: boolean; error?: string }> => {
    if (!isSupabaseConfigured || !supabase) {
      return {
        success: false,
        error: 'Supabase credentials are not configured. Please check your environment variables.',
      };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        return {
          success: false,
          error: error.message || 'Invalid email or password. Please verify your credentials.',
        };
      }

      if (!data.user) {
        return {
          success: false,
          error: 'Login could not be completed. Please try again.',
        };
      }

      setUser(data.user);
      setSession(data.session);

      const admin = await verifyAdmin(data.user.id);

      return {
        success: true,
        isAdmin: admin,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An error occurred during authentication.';
      return {
        success: false,
        error: msg,
      };
    }
  };

  const signOut = async (): Promise<void> => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setSession(null);
    setIsAdmin(false);
  };

  const refreshAdminStatus = async (): Promise<boolean> => {
    if (!user) {
      setIsAdmin(false);
      return false;
    }
    return verifyAdmin(user.id);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAdmin,
        isLoading,
        isConfigured: isSupabaseConfigured,
        signIn,
        signOut,
        refreshAdminStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
