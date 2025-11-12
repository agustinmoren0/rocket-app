'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { notifyDataChange } from '../lib/storage-utils';
import { supabase, validateSupabaseConfig } from '../lib/supabase';
import { offlineManager } from '../lib/offline-manager';
import { realtimeManager } from '../lib/supabase-realtime';
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
  // Realtime sync
  isRealtimeActive: boolean;
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
  isRealtimeActive: false,
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
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [isRealtimeActive, setIsRealtimeActive] = useState(false);

  // Initialize auth state and listen for changes
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Validate Supabase is configured
        const isConfigured = validateSupabaseConfig();

        if (!isConfigured) {
          console.warn('⚠️ Supabase not configured - app will work in offline-only mode');
          setIsLoading(false);
          return;
        }

        // Get current session
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        // Start realtime if user is authenticated
        if (currentSession?.user?.id) {
          try {
            // Clean up stale offline queue operations from before login
            // This prevents old invalid data from causing sync errors
            const queueSize = offlineManager.getQueueSize();
            if (queueSize > 0) {
              console.log(`📋 Found ${queueSize} stale operations in offline queue, clearing...`);
              offlineManager.clearQueue();
            }

            await realtimeManager.startRealtime(currentSession.user.id);
            setIsRealtimeActive(true);
            console.log('✅ Realtime sync activated');
          } catch (error) {
            console.error('⚠️ Failed to start realtime:', error);
            setIsRealtimeActive(false);
          }
        }

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (_event: string, newSession: any) => {
            setSession(newSession);
            setUser(newSession?.user ?? null);

            // Handle realtime lifecycle on auth state change
            if (newSession?.user?.id) {
              try {
                // Clean up stale offline queue operations on every login
                const queueSize = offlineManager.getQueueSize();
                if (queueSize > 0) {
                  console.log(`📋 Found ${queueSize} stale operations in offline queue, clearing...`);
                  offlineManager.clearQueue();
                }

                await realtimeManager.startRealtime(newSession.user.id);
                setIsRealtimeActive(true);
                console.log('✅ Realtime sync activated');
              } catch (error) {
                console.error('⚠️ Failed to start realtime:', error);
                setIsRealtimeActive(false);
              }
            } else {
              // Stop realtime when user logs out
              realtimeManager.stopRealtime();
              setIsRealtimeActive(false);
            }
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
      // Stop realtime subscriptions on logout
      realtimeManager.stopRealtime();
      setIsRealtimeActive(false);
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
        isRealtimeActive,
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
