'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { notifyDataChange } from '../lib/storage-utils';
import { persistData, deleteRecord } from '../lib/persistence-layer';

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
  const [activities, setActivities] = useState<ActivityData>({});
  const [userId, setUserId] = useState<string | null>(null);
  const [deviceId, setDeviceId] = useState<string>('');

  // Initialize user and device IDs
  useEffect(() => {
    const userIdFromStorage = localStorage.getItem('supabase.auth.token') ? 'authenticated' : null;
    setUserId(userIdFromStorage);

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
  }, []);

  const addActivity = async (activity: Omit<Activity, 'id' | 'timestamp' | 'createdAt'>) => {
    const id = `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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

    // Persist to Supabase if authenticated
    if (userId && deviceId) {
      await persistData({
        table: 'activities',
        data: {
          user_id: userId,
          ...newActivity,
        },
        userId,
        deviceId,
      });
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

    setActivities(updated);
    localStorage.setItem('habika_activities_today', JSON.stringify(updated));

    // Persist to Supabase if authenticated
    if (userId && deviceId) {
      const activity = Object.values(updated)
        .flat()
        .find(a => a.id === id);

      if (activity) {
        await persistData({
          table: 'activities',
          data: {
            user_id: userId,
            ...activity,
          },
          userId,
          deviceId,
        });
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

    // Delete from Supabase if authenticated
    if (userId && deviceId) {
      await deleteRecord('activities', id, userId, deviceId);
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
