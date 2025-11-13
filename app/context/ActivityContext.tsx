'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { notifyDataChange } from '../lib/storage-utils';
import { persistData, deleteRecord } from '../lib/persistence-layer';
import { useUser } from './UserContext';
import { generateUUID } from '../lib/uuid';

export interface Activity {
  id: string;
  name: string;
  duration: number;
  unit: 'min' | 'hs';
  categoria: string;
  color: string;
  date: string;
  notes?: string;
  timestamp: string;
  createdAt: string;
}

export interface ActivityData {
  [date: string]: Activity[];
}

interface ActivityContextType {
  activities: ActivityData;
  addActivity: (activity: Omit<Activity, 'id' | 'timestamp' | 'createdAt'>) => Promise<void>;
  updateActivity: (id: string, updates: Partial<Activity>) => Promise<void>;
  deleteActivity: (id: string, date: string) => Promise<void>;
  getActivitiesForDate: (date: string) => Activity[];
  getAllActivities: () => Activity[];
}

const ActivityContext = createContext<ActivityContextType | null>(null);

export const ActivityProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useUser();
  const [activities, setActivities] = useState<ActivityData>({});
  const [userId, setUserId] = useState<string | null>(null);
  const [deviceId, setDeviceId] = useState<string>('');

  // Initialize device ID and get userId from UserContext
  useEffect(() => {
    // Get actual user ID from auth session
    setUserId(user?.id ?? null);

    let dId = localStorage.getItem('device_id');
    if (!dId) {
      dId = `device_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('device_id', dId);
    }
    setDeviceId(dId);

    // Load activities from localStorage
    const loadActivitiesFromStorage = () => {
      const stored = localStorage.getItem('habika_activities_today');
      if (stored) {
        try {
          const data = JSON.parse(stored);
          setActivities(data);
          console.log('📊 ActivityContext loaded activities from localStorage:', Object.keys(data).length, 'dates');
        } catch (e) {
          console.error('Error parsing activities:', e);
        }
      } else {
        setActivities({});
        console.log('📊 ActivityContext: No activities found in localStorage');
      }
    };

    loadActivitiesFromStorage();

    // P3 Fix: Listen for initial sync completion to reload activities after sync populates localStorage
    const handleSyncComplete = (event: Event) => {
      console.log('🔄 ActivityContext: Initial sync complete, reloading activities');
      loadActivitiesFromStorage();
    };

    // Also listen for localStorage changes (in case activities updated from elsewhere)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'habika_activities_today') {
        console.log('💾 ActivityContext: Storage changed, reloading activities');
        loadActivitiesFromStorage();
      }
    };

    window.addEventListener('habika-initial-sync-complete', handleSyncComplete);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('habika-initial-sync-complete', handleSyncComplete);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [user]);

  // Listen for realtime activity updates from RealtimeManager (other devices only)
  useEffect(() => {
    const handleActivityUpdate = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { eventType, activity } = customEvent.detail;

      console.log(`🔄 ActivityContext received ${eventType} event for activity:`, activity.id);

      // Only update state for events that come from RealtimeManager (other devices)
      // Local updates are already handled by addActivity/updateActivity/deleteActivity
      // Check if this event came from elsewhere by looking at the timestamp
      const isLocalEvent = eventType === 'INSERT' && event.timeStamp && (Date.now() - event.timeStamp) < 100;

      if (isLocalEvent) {
        console.log('⏭️ Skipping local event, already handled by addActivity');
        return;
      }

      setActivities((prev) => {
        const updated = { ...prev };

        if (eventType === 'DELETE') {
          // Remove activity from all dates
          for (const date in updated) {
            updated[date] = updated[date].filter(a => a.id !== activity.id);
            if (updated[date].length === 0) {
              delete updated[date];
            }
          }
        } else if (eventType === 'INSERT' || eventType === 'UPDATE') {
          // Add or update activity
          const activityDate = activity.date;
          if (!updated[activityDate]) {
            updated[activityDate] = [];
          }

          const existingIndex = updated[activityDate].findIndex(a => a.id === activity.id);
          if (existingIndex >= 0) {
            updated[activityDate][existingIndex] = activity;
          } else {
            updated[activityDate].push(activity);
          }
        }

        // Persist to localStorage
        localStorage.setItem('habika_activities_today', JSON.stringify(updated));
        return updated;
      });
    };

    // Listen for activity updates
    window.addEventListener('activityUpdated', handleActivityUpdate);
    return () => window.removeEventListener('activityUpdated', handleActivityUpdate);
  }, []);

  const addActivity = async (activity: Omit<Activity, 'id' | 'timestamp' | 'createdAt'>) => {
    const id = generateUUID();
    const now = new Date().toISOString();

    const newActivity: Activity = {
      ...activity,
      id,
      timestamp: now,
      createdAt: now,
    };

    console.log('📝 Creating activity:', { id, name: newActivity.name, date: newActivity.date, userId });

    try {
      // STEP 1: Update local state (sync)
      const updated = { ...activities };
      if (!updated[activity.date]) {
        updated[activity.date] = [];
      }
      updated[activity.date].push(newActivity);

      // STEP 2: Persist to localStorage FIRST (this is synchronous and immediate)
      localStorage.setItem('habika_activities_today', JSON.stringify(updated));
      console.log('✅ Activity saved to localStorage immediately:', { id, date: activity.date });

      // STEP 3: Update React state (triggers re-renders)
      setActivities(updated);
      console.log('✅ React state updated with new activity:', { id });

      // STEP 4: Emit event for local UI updates (non-blocking)
      window.dispatchEvent(
        new CustomEvent('activityUpdated', {
          detail: {
            eventType: 'INSERT',
            activity: newActivity,
            timestamp: now,
          },
        })
      );
      console.log('📢 Activity event emitted:', { id, eventType: 'INSERT' });

      // STEP 5: Persist to Supabase if authenticated (async, non-blocking)
      if (userId && typeof userId === 'string' && userId.trim().length > 0) {
        console.log('📤 Queueing Supabase persistence for activity:', { id, userId });

        persistData({
          table: 'activities',
          data: {
            user_id: userId,
            ...newActivity,
          },
          userId,
          deviceId,
        })
          .then((result) => {
            console.log('✅ Activity persisted to Supabase:', { stored: result.stored, recordId: result.recordId, error: result.error });
          })
          .catch((error) => {
            console.error('❌ Error persisting activity to Supabase:', error);
          });
      } else {
        console.log('ℹ️ Activity saved to localStorage only (user not authenticated)', { userId, authenticated: !!userId });
      }

      notifyDataChange();
    } catch (error) {
      console.error('❌ Critical error in addActivity:', error);
      throw error;
    }
  };

  const updateActivity = async (id: string, updates: Partial<Activity>) => {
    console.log('📝 Updating activity:', { id, updates });

    try {
      const updated = { ...activities };
      let found = false;

      // Find and update the activity
      for (const date in updated) {
        const activityIndex = updated[date].findIndex(a => a.id === id);
        if (activityIndex !== -1) {
          updated[date][activityIndex] = {
            ...updated[date][activityIndex],
            ...updates,
            timestamp: new Date().toISOString(),
          };
          found = true;
          break;
        }
      }

      if (!found) {
        console.warn('⚠️ Activity not found for update:', { id });
        return;
      }

      const updatedActivity = Object.values(updated)
        .flat()
        .find(a => a.id === id);

      // STEP 1: Save to localStorage FIRST (immediate, synchronous)
      localStorage.setItem('habika_activities_today', JSON.stringify(updated));
      console.log('✅ Activity updated in localStorage:', { id });

      // STEP 2: Update React state
      setActivities(updated);
      console.log('✅ React state updated for activity:', { id });

      // STEP 3: Emit event for local UI updates
      if (updatedActivity) {
        window.dispatchEvent(
          new CustomEvent('activityUpdated', {
            detail: {
              eventType: 'UPDATE',
              activity: updatedActivity,
              timestamp: new Date().toISOString(),
            },
          })
        );
        console.log('📢 Activity update event emitted:', { id });
      }

      // STEP 4: Persist to Supabase if authenticated (async, non-blocking)
      if (userId && typeof userId === 'string' && userId.trim().length > 0 && deviceId && updatedActivity) {
        console.log('📤 Queueing Supabase update for activity:', { id, userId });

        persistData({
          table: 'activities',
          data: {
            user_id: userId,
            ...updatedActivity,
          },
          userId,
          deviceId,
        })
          .then((result) => {
            console.log('✅ Activity updated in Supabase:', { stored: result.stored, error: result.error });
          })
          .catch((error) => {
            console.error('❌ Error updating activity in Supabase:', error);
          });
      }

      notifyDataChange();
    } catch (error) {
      console.error('❌ Critical error in updateActivity:', error);
      throw error;
    }
  };

  const deleteActivity = async (id: string, date: string) => {
    console.log('📝 Deleting activity:', { id, date, userId });

    try {
      const updated = { ...activities };

      if (updated[date]) {
        updated[date] = updated[date].filter(a => a.id !== id);
        if (updated[date].length === 0) {
          delete updated[date];
        }
      }

      // STEP 1: Delete from localStorage FIRST (immediate, synchronous)
      localStorage.setItem('habika_activities_today', JSON.stringify(updated));
      console.log('✅ Activity deleted from localStorage:', { id, date });

      // STEP 2: Update React state
      setActivities(updated);
      console.log('✅ React state updated, activity removed:', { id });

      // STEP 3: Emit event for local UI updates
      window.dispatchEvent(
        new CustomEvent('activityUpdated', {
          detail: {
            eventType: 'DELETE',
            activity: { id, date },
            timestamp: new Date().toISOString(),
          },
        })
      );
      console.log('📢 Activity delete event emitted:', { id });

      // STEP 4: Delete from Supabase if authenticated (async, non-blocking)
      if (userId && typeof userId === 'string' && userId.trim().length > 0 && deviceId) {
        console.log('📤 Queueing Supabase deletion for activity:', { id, userId });

        deleteRecord('activities', id, userId, deviceId)
          .then((result) => {
            console.log('✅ Activity deleted from Supabase:', { recordId: result.recordId, success: result.success });
          })
          .catch((error) => {
            console.error('❌ Error deleting activity from Supabase:', error);
          });
      } else {
        console.log('ℹ️ Activity deleted from localStorage only (user not authenticated)', { userId, authenticated: !!userId });
      }

      notifyDataChange();
    } catch (error) {
      console.error('❌ Critical error in deleteActivity:', error);
      throw error;
    }
  };

  const getActivitiesForDate = (date: string): Activity[] => {
    return activities[date] || [];
  };

  const getAllActivities = (): Activity[] => {
    return Object.values(activities).flat();
  };

  return (
    <ActivityContext.Provider
      value={{
        activities,
        addActivity,
        updateActivity,
        deleteActivity,
        getActivitiesForDate,
        getAllActivities,
      }}
    >
      {children}
    </ActivityContext.Provider>
  );
};

export const useActivity = () => {
  const context = useContext(ActivityContext);
  if (!context) throw new Error('useActivity must be used within ActivityProvider');
  return context;
};
