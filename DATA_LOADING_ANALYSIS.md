# Data Loading and Display Analysis: Habits, Activities, and Calendar Pages

## Executive Summary

All three pages depend on localStorage as their primary data source, with a dual-layer persistence system for authenticated users. After re-login, data may not display if the context doesn't properly reload from localStorage or if the activities context hasn't initialized yet.

---

## 1. HABITOS PAGE (`/app/app/habitos/page.tsx`)

### Data Loading Flow

**Storage Key:** `habika_custom_habits`

**Initial Load (useEffect, lines 21-28):**
```typescript
useEffect(() => {
  loadHabits();
}, []);

const loadHabits = () => {
  const savedHabits = JSON.parse(localStorage.getItem('habika_custom_habits') || '[]');
  setHabits(savedHabits);
};
```

**Critical Issues:**
1. **No dependency tracking**: useEffect has empty dependency array - only loads ONCE on mount
2. **No re-login listener**: Doesn't listen for auth changes or storage updates
3. **No context used**: This page doesn't use any context - purely localStorage dependent
4. **Hard refresh needed**: If localStorage is cleared during logout/re-login, data won't reload until full page refresh

### Filtering Logic (Lines 30-35)

```typescript
const filteredHabits = habits.filter(h => {
  if (activeTab === 'pausados') return h.status === 'paused';
  if (activeTab === 'formar') return h.type === 'formar' && h.status === 'active';
  if (activeTab === 'dejar') return h.type === 'dejar' && h.status === 'active';
  return false;
});
```

**Hidden Data Conditions:**
- Habits with `status !== 'active'` are hidden from "A Formar" and "A Dejar" tabs
- Only paused habits show in "Pausados" tab
- Any habit without a `type` property will be hidden
- Any habit without a `status` property will be hidden

### Re-login Scenario Issues

**Problem:** After logout and re-login:
1. User's old `habika_custom_habits` still exists in localStorage (from previous session)
2. On re-login, the context initializes and loads from localStorage
3. If localStorage wasn't cleared during logout, old data displays
4. If localStorage was cleared, no data displays until manual action triggers loadHabits()

---

## 2. ACTIVIDADES PAGE (`/app/app/actividades/page.tsx`)

### Data Loading Flow

**Storage Keys:**
- Activities: `habika_activities_today` (object with date strings as keys)
- Habits: `habika_custom_habits`

**Uses Context:** `useActivity()` from ActivityContext

**Initial Load (Lines 57-96):**
```typescript
const loadTodayData = useCallback(() => {
  const today = new Date().toISOString().split('T')[0];
  
  // CARGAR ACTIVIDADES: Try context first, fallback to localStorage
  let todayActivities = allActivities[today] || [];
  
  if (todayActivities.length === 0) {
    // Fallback to localStorage if context is empty
    const stored = JSON.parse(localStorage.getItem('habika_activities_today') || '{}');
    todayActivities = stored[today] || [];
  }
  
  // CARGAR HÁBITOS
  const allHabits = JSON.parse(localStorage.getItem('habika_custom_habits') || '[]');
  const activeHabits = allHabits.filter((h: any) => h.status === 'active');
  
  setActivities(todayActivities);
  setHabits(activeHabits);
}, [allActivities]);

// Load data when context changes
useEffect(() => {
  loadTodayData();
}, [allActivities, loadTodayData]);

// Listen for storage changes
useEffect(() => {
  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === 'habika_activities_today' || e.key === 'habika_custom_habits') {
      loadTodayData();
    }
  };
  
  window.addEventListener('storage', handleStorageChange);
  // ... realtime listener
  
  return () => window.removeEventListener('storage', handleStorageChange);
}, [loadTodayData]);
```

**Dual-Layer Data Loading:**
1. Context-first approach: `allActivities[today]` from ActivityContext
2. localStorage fallback: If context is empty, loads from `habika_activities_today`
3. Habits always from localStorage only

### ActivityContext Initialization (ActivityContext.tsx, Lines 44-65)

```typescript
useEffect(() => {
  // Get actual user ID from auth session
  setUserId(user?.id ?? null);
  
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
}, [user]);  // Dependency on user!
```

**Critical Issue:** Depends on `user` from UserContext

### Filtering Logic (Lines 73-74)

```typescript
const activeHabits = allHabits.filter((h: any) => h.status === 'active');
```

**Hidden Data Conditions:**
- Only habits with `status === 'active'` are shown
- Paused habits are HIDDEN from this page
- Habits with missing `status` property are hidden

### Re-login Scenario Flow

1. User logs out → `user` becomes `null`
2. ActivityContext useEffect runs with `user === null`
3. Context still loads from localStorage (old data persists)
4. User logs in → `user` is set with new session
5. ActivityContext useEffect runs again with new user
6. **Problem:** Context may have stale data if localStorage wasn't synced with new user's Supabase data

---

## 3. CALENDARIO PAGE (`/app/app/calendario/page.tsx`)

### Data Loading Flow

**Storage Key:** `habika_calendar`

**Data Structure:**
```typescript
{
  "2025-01-15": {
    activities: [
      { id, name, duration, unit, categoria, color, notes, timestamp, type: 'activity' }
    ],
    habits: [
      { id, name, color, timestamp, type: 'habit' }
    ],
    notes: ""
  }
}
```

**Initial Load (Lines 49-122):**
```typescript
const loadEventsFromCalendar = useCallback(() => {
  const calendar = JSON.parse(localStorage.getItem('habika_calendar') || '{}');
  const allEvents: Event[] = [];
  
  // Determine dates to load based on view (day/week/month)
  let datesToLoad: Date[] = [];
  
  // ... date calculation logic ...
  
  datesToLoad.forEach(date => {
    const dateStr = date.toISOString().split('T')[0];
    const dayData = calendar[dateStr];
    
    if (dayData) {
      // Load activities
      if (dayData.activities) {
        dayData.activities.forEach((act: any) => {
          allEvents.push({
            id: act.id,
            hour: new Date(act.timestamp).getHours(),
            day: date.getDate(),
            title: act.name,
            duration: act.unit === 'hora(s)' ? act.duration * 60 : act.duration,
            color: act.color || '#FF99AC',
            type: 'activity'
          });
        });
      }
      
      // Load habits
      if (dayData.habits) {
        dayData.habits.forEach((hab: any) => {
          allEvents.push({
            id: hab.id,
            hour: new Date(hab.timestamp || new Date()).getHours(),
            day: date.getDate(),
            title: hab.name,
            duration: hab.duration || 20,
            color: hab.color || '#FFC0A9',
            type: 'habit'
          });
        });
      }
    }
  });
  
  setEvents(allEvents);
}, [currentDate, view]);

// Load on mount and when dates/view change
useEffect(() => {
  loadEventsFromCalendar();
  
  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === 'habika_calendar') {
      loadEventsFromCalendar();
    }
  };
  
  window.addEventListener('storage', handleStorageChange);
  window.addEventListener('calendarUpdated', handleCalendarUpdate);
  return () => {
    window.removeEventListener('storage', handleStorageChange);
    window.removeEventListener('calendarUpdated', handleCalendarUpdate);
  };
}, [loadEventsFromCalendar]);
```

**Critical Issue:** Only loads `habika_calendar` - doesn't access `habika_activities_today` directly

### Data Archival System (Lines 128-157)

```typescript
const setupMidnightArchive = () => {
  // Sets a timeout until midnight
  const timeUntilMidnight = tomorrow.getTime() - now.getTime();
  setTimeout(() => {
    archiveAndClear();
    setupMidnightArchive(); // Recursive
  }, timeUntilMidnight);
};

const archiveAndClear = () => {
  const today = new Date().toISOString().split('T')[0];
  const allActivities = JSON.parse(localStorage.getItem('habika_activities_today') || '{}');
  
  if (allActivities[today] && allActivities[today].length > 0) {
    syncToCalendar(today, allActivities[today]); // Copy to habika_calendar
    delete allActivities[today]; // CLEAR TODAY'S ACTIVITIES
    setStorageItem('habika_activities_today', JSON.stringify(allActivities));
  }
  loadTodayData();
};
```

**Critical Issue:** At midnight, today's activities are moved from `habika_activities_today` to `habika_calendar`

### Re-login Scenario Issues

1. If user re-logs in after midnight has passed:
   - Activities should be in `habika_calendar`
   - Calendar page should load them normally
2. If user re-logs in before midnight:
   - Activities should be in `habika_activities_today`
   - **Problem:** Calendar page doesn't load from `habika_activities_today`, only `habika_calendar`
   - **Result:** Today's activities don't appear on the calendar until midnight archival

---

## Root Cause Analysis: Re-login Data Loss

### Why Data Doesn't Display After Re-login

1. **localStorage is persistent across sessions**
   - Data from previous user session stays in localStorage
   - After logout/re-login, old data still exists

2. **But context may not initialize properly:**
   ```typescript
   // ActivityContext - depends on user
   useEffect(() => {
     setUserId(user?.id ?? null);
     const stored = localStorage.getItem('habika_activities_today');
     if (stored) setActivities(data);
   }, [user]);  // <-- Only re-runs if user changes
   ```

3. **Pages don't explicitly reload context after auth changes**
   - HabitosPage: Pure localStorage, no context listening
   - ActividadesPage: Depends on context, but context depends on user
   - CalendarioPage: Pure localStorage for calendar data

4. **Timing issue:**
   - User logs in → UserContext updates user
   - ActivityContext useEffect triggers
   - ActivityContext loads from localStorage (which might be old data)
   - Pages render with stale data

### Scenario 1: User Logs Out and Logs In as Same User
- localStorage still has their data
- Context reloads from localStorage
- Data appears correctly
- WORKS: No data loss

### Scenario 2: User Logs Out and Logs In as Different User
- localStorage still has PREVIOUS USER'S data
- Context loads previous user's data from localStorage
- Current user sees previous user's habits/activities
- BROKEN: Data privacy issue + wrong data

### Scenario 3: localStorage Cleared on Logout
- User logs out → localStorage cleared
- Logs in → localStorage is empty
- Context initializes with empty state
- No data appears until first activity/habit is created
- BROKEN: No data recovery

---

## Critical Code Paths and Missing Handlers

### Missing: logout() should clear or sync user-specific data

**Current UserContext.logout() (Lines 212-230):**
```typescript
const logout = async () => {
  setUser(null);
  setSession(null);
  realtimeManager.stopRealtime();
  setIsRealtimeActive(false);
  // MISSING: Clear localStorage of user-specific data
  // MISSING: Signal to context that auth changed
};
```

### Missing: Explicit context reset on auth state change

**Should have in ActividadesPage:**
```typescript
// MISSING useEffect to reset context on auth change
useEffect(() => {
  if (!user) {
    // Clear activities on logout
    setActivities([]);
    setHabits([]);
  }
}, [user]);
```

### Missing: Cross-tab/device sync on login

**ActivityContext doesn't reload from Supabase on re-login:**
```typescript
// After user logs in, should sync from Supabase
useEffect(() => {
  if (user) {
    // MISSING: Load user's activities from Supabase
    // MISSING: Sync with stored localStorage data
  }
}, [user]);
```

---

## Data Visibility Matrix

| Page | Data Source | Requires Auth | Filters | Hidden Conditions |
|------|-------------|---------------|---------|-------------------|
| Habitos | localStorage only | No | by status + type | `status !== 'active'` OR `type` undefined |
| Actividades | Context + localStorage fallback | No | by status | `status !== 'active'` |
| Calendario | localStorage only | No | by date | Data must be in `habika_calendar`, not `habika_activities_today` |

---

## Storage Key Dependencies

```
habika_custom_habits
├── Used by: HabitosPage, ActividadesPage, Calendario (via sync)
├── Structure: Habit[]
└── Sync point: Direct updates + calendar sync

habika_activities_today
├── Used by: ActividadesPage (context + fallback)
├── Structure: { [date: string]: Activity[] }
├── Archival: Moved to habika_calendar at midnight
└── Sync point: Context listener + ActivityUpdated event

habika_calendar
├── Used by: CalendarioPage
├── Structure: { [date: string]: { activities: [], habits: [], notes: "" } }
├── Archival: Receives data from habika_activities_today
└── Sync point: Via syncToCalendar() function
```

---

## Recommended Fixes

### 1. Add Auth State Listener to Each Page
```typescript
const { user } = useUser();

useEffect(() => {
  // Reset/reload data when auth state changes
  if (user) {
    loadData(); // Fresh load
  } else {
    setData([]); // Clear on logout
  }
}, [user]);
```

### 2. Explicit Context Initialization After Login
```typescript
// In ActivityContext
useEffect(() => {
  if (user) {
    // Reload from Supabase if available
    reloadFromSupabase();
    // Or at minimum, re-read localStorage
    const stored = localStorage.getItem('habika_activities_today');
    if (stored) setActivities(JSON.parse(stored));
  } else {
    // Clear on logout
    setActivities({});
  }
}, [user]);
```

### 3. Clear User Data on Logout
```typescript
// In UserContext logout()
const logout = async () => {
  // Clear user-specific localStorage before signing out
  // But keep app-level settings
  localStorage.removeItem('habika_activities_today');
  localStorage.removeItem('habika_calendar');
  // Keep habika_custom_habits for offline use
  
  await supabase.auth.signOut();
  setUser(null);
};
```

### 4. Sync Activities to Calendar More Frequently
```typescript
// In ActividadesPage, after any activity change
useEffect(() => {
  const today = new Date().toISOString().split('T')[0];
  const todayActivities = activities[today];
  if (todayActivities?.length > 0) {
    syncToCalendar(today, todayActivities);
  }
}, [activities]);
```

### 5. Handle Cross-Device Sync
```typescript
// In ActivityContext
useEffect(() => {
  // On re-login, check if Supabase has newer data
  if (user && !loadedFromSupabase) {
    supabase.from('activities')
      .select('*')
      .eq('user_id', user.id)
      .then(({ data }) => {
        // Merge with localStorage
        // Prefer newest timestamp
        const merged = mergeActivities(localActivities, remoteActivities);
        setActivities(merged);
        setLoadedFromSupabase(true);
      });
  }
}, [user]);
```

