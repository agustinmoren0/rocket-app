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
    const stored = localStorage.getItem('habika_activities_today');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setActivities(data);
      } catch (e) {
        console.error('Error parsing activities:', e);
      }
    }
  }, [user]);

  // Listen for realtime activity updates from RealtimeManager
  useEffect(() => {
    const handleActivityUpdate = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { eventType, activity } = customEvent.detail;

      console.log(`🔄 ActivityContext received ${eventType} event for activity:`, activity.id);

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

    // Update local state
    const updated = { ...activities };
    if (!updated[activity.date]) {
      updated[activity.date] = [];
    }
    updated[activity.date].push(newActivity);

    setActivities(updated);
    localStorage.setItem('habika_activities_today', JSON.stringify(updated));

    // Emit event for local UI updates
    window.dispatchEvent(
      new CustomEvent('activityUpdated', {
        detail: {
          eventType: 'INSERT',
          activity: newActivity,
          timestamp: new Date().toISOString(),
        },
      })
    );

    // Persist to Supabase if authenticated
    if (userId && deviceId) {
      console.log('📤 Persisting activity to Supabase:', { id: newActivity.id, userId, deviceId });
      try {
        const result = await persistData({
          table: 'activities',
          data: {
            user_id: userId,
            ...newActivity,
          },
          userId,
          deviceId,
        });
        console.log('✅ Activity persisted successfully:', { stored: result.stored, recordId: result.recordId });
      } catch (error) {
        console.error('❌ Error persisting activity to Supabase:', error);
      }
    } else {
      console.log('ℹ️ Activity saved to localStorage only (not authenticated)', { userId, deviceId });
    }

    notifyDataChange();
  };

  const updateActivity = async (id: string, updates: Partial<Activity>) => {
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

    if (!found) return;

    const updatedActivity = Object.values(updated)
      .flat()
      .find(a => a.id === id);

    setActivities(updated);
    localStorage.setItem('habika_activities_today', JSON.stringify(updated));

    // Emit event for local UI updates
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
    }

    // Persist to Supabase if authenticated
    if (userId && deviceId && updatedActivity) {
      console.log('📤 Updating activity in Supabase:', { id, userId });
      try {
        const result = await persistData({
          table: 'activities',
          data: {
            user_id: userId,
            ...updatedActivity,
          },
          userId,
          deviceId,
        });
        console.log('✅ Activity updated successfully:', { stored: result.stored });
      } catch (error) {
        console.error('❌ Error updating activity in Supabase:', error);
      }
    }

    notifyDataChange();
  };

  const deleteActivity = async (id: string, date: string) => {
    const updated = { ...activities };

    if (updated[date]) {
      updated[date] = updated[date].filter(a => a.id !== id);
      if (updated[date].length === 0) {
        delete updated[date];
      }
    }

    setActivities(updated);
    localStorage.setItem('habika_activities_today', JSON.stringify(updated));

    // Emit event for local UI updates
    window.dispatchEvent(
      new CustomEvent('activityUpdated', {
        detail: {
          eventType: 'DELETE',
          activity: { id, date },
          timestamp: new Date().toISOString(),
        },
      })
    );

    // Delete from Supabase if authenticated
    if (userId && deviceId) {
      console.log('📤 Deleting activity from Supabase:', { id, userId });
      try {
        const result = await deleteRecord('activities', id, userId, deviceId);
        console.log('✅ Activity deleted successfully:', { recordId: result.recordId });
      } catch (error) {
        console.error('❌ Error deleting activity from Supabase:', error);
      }
    } else {
      console.log('ℹ️ Activity deleted from localStorage only (not authenticated)');
    }

    notifyDataChange();
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
