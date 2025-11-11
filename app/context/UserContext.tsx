'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { notifyDataChange } from '../lib/storage-utils';
import { supabase } from '../lib/supabase';
import { offlineManager } from '../lib/offline-manager';
import type { User } from '@supabase/supabase-js';

interface UserContextType {
  username: string;
  setUsername: (name: string) => void;
  // Auth properties
  user: User | null;
  session: any | null;
  isPremium: boolean;
  isLoading: boolean;
  authError: string | null;
  isOnline: boolean;
  // Auth methods
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, username: string) => Promise<void>;
  logout: () => Promise<void>;
  // Offline methods
  queueOperation: (type: 'create' | 'update' | 'delete', table: string, data: any) => void;
  processOfflineQueue: () => Promise<void>;
  getQueueSize: () => number;
}

const UserContext = createContext<UserContextType>({
  username: 'Usuario',
  setUsername: () => {},
  user: null,
  session: null,
  isPremium: false,
  isLoading: true,
  authError: null,
  isOnline: true,
  login: async () => {},
  signup: async () => {},
  logout: async () => {},
  queueOperation: () => {},
  processOfflineQueue: async () => {},
  getQueueSize: () => 0,
});

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [username, setUsernameState] = useState('Usuario');
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Initialize auth state and listen for changes
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Get current session
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (event, newSession) => {
            setSession(newSession);
            setUser(newSession?.user ?? null);
          }
        );

        return () => subscription?.unsubscribe();
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Load username from localStorage (for backward compatibility)
    const stored = localStorage.getItem('habika_username');
    if (stored) setUsernameState(stored);
  }, []);

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      console.log('📡 App came online');
    };

    const handleOffline = () => {
      setIsOnline(false);
      console.log('📡 App went offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const setUsername = (name: string) => {
    setUsernameState(name);
    localStorage.setItem('habika_username', name);
    notifyDataChange();
  };

  const login = async (email: string, password: string) => {
    try {
      setAuthError(null);
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      setAuthError(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, newUsername: string) => {
    try {
      setAuthError(null);
      setIsLoading(true);
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: newUsername,
          },
        },
      });
      if (error) throw error;
      setUsername(newUsername);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Signup failed';
      setAuthError(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setAuthError(null);
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setSession(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Logout failed';
      setAuthError(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const isPremium = user !== null;

  const queueOperation = (type: 'create' | 'update' | 'delete', table: string, data: any) => {
    offlineManager.queueOperation(type, table, data);
  };

  const processOfflineQueue = async () => {
    await offlineManager.processQueue();
  };

  const getQueueSize = () => {
    return offlineManager.getQueueSize();
  };

  return (
    <UserContext.Provider
      value={{
        username,
        setUsername,
        user,
        session,
        isPremium,
        isLoading,
        authError,
        isOnline,
        login,
        signup,
        logout,
        queueOperation,
        processOfflineQueue,
        getQueueSize,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
