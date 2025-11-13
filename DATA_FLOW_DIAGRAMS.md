# Data Flow Diagrams and Architecture

## 1. HABITOS PAGE - Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    HABITOS PAGE                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  useEffect []   │
                    │  (Load once)    │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────────────────┐
                    │  loadHabits()               │
                    │  {                          │
                    │    const habits =           │
                    │      localStorage.getItem() │
                    │    setHabits(habits)        │
                    │  }                          │
                    └────────┬────────────────────┘
                             │
                             ▼
                    ┌─────────────────────────────┐
                    │ habika_custom_habits        │
                    │ (localStorage)              │
                    │ [                           │
                    │   {id, name, type,         │
                    │    status, color, ...}     │
                    │ ]                          │
                    └────────┬────────────────────┘
                             │
                             ▼
              ┌──────────────────────────────────┐
              │  Filter by Tab Selection         │
              ├──────────────────────────────────┤
              │  "A Formar"  → status='active'   │
              │              && type='formar'    │
              │  "A Dejar"   → status='active'   │
              │              && type='dejar'     │
              │  "Pausados"  → status='paused'   │
              └────────┬─────────────────────────┘
                       │
                       ▼
        ┌────────────────────────────────┐
        │  Display filteredHabits        │
        │  OR                            │
        │  "No tienes hábitos" message   │
        └────────────────────────────────┘

PROBLEM AFTER RE-LOGIN:
  1. Page only loads on mount (useEffect with [])
  2. If localStorage cleared, no data
  3. If new user logs in, previous user's data shows
  4. No auth state listener
```

---

## 2. ACTIVIDADES PAGE - Data Flow Architecture

```
┌──────────────────────────────────────────────────────────┐
│          ACTIVIDADES PAGE                                 │
└──────────────────────────────────────────────────────────┘
                    │
        ┌───────────┼───────────┐
        │                       │
        ▼                       ▼
   ┌──────────────┐      ┌──────────────┐
   │ActivityContext│      │ UserContext  │
   └────┬─────────┘      └────┬─────────┘
        │                      │
        │ useEffect([user])    │
        │                      ▼
        │           ┌────────────────┐
        │           │ user updated?  │
        │           │ (login/logout) │
        │           └────┬───────────┘
        │                │
        │ Load localStorage when user changes
        │                │
        ▼                ▼
   ┌────────────────────────────┐
   │ ActivityContext.useEffect  │
   │ [user]                     │
   │ {                          │
   │   setUserId(user?.id)      │
   │   load from localStorage   │
   │ }                          │
   └────────┬───────────────────┘
            │
            ▼
   ┌─────────────────────────────┐
   │habika_activities_today      │
   │{                            │
   │  "2025-01-15": [            │
   │    {id, name, duration,     │
   │     timestamp, ...}         │
   │  ]                          │
   │}                            │
   └────────┬────────────────────┘
            │
            ▼
   ┌──────────────────────────────────┐
   │ActividadesPage.useEffect         │
   │([allActivities, loadTodayData])   │
   │{                                  │
   │  loadTodayData()                  │
   │}                                  │
   └────────┬─────────────────────────┘
            │
            ▼
   ┌──────────────────────────────────┐
   │loadTodayData()                    │
   │{                                  │
   │  1. Try context: allActivities[]  │
   │  2. Fallback: localStorage        │
   │  3. Load habits: habika_custom_.. │
   │  4. Filter habits by status       │
   │}                                  │
   └────────┬─────────────────────────┘
            │
    ┌───────┴───────┐
    │               │
    ▼               ▼
┌─────────┐    ┌──────────┐
│Activities│    │Habits    │
└─────────┘    │(active)  │
               └──────────┘
               (status='active'
                only)

PROBLEM AFTER RE-LOGIN:
  1. ActivityContext loads from localStorage
  2. If new user logins, previous user's data shows
  3. No sync with Supabase on login
  4. Context doesn't clear on logout
  5. Timing issue: context might not be ready when page renders
```

---

## 3. CALENDARIO PAGE - Data Flow Architecture

```
┌──────────────────────────────────────────────────────────┐
│          CALENDARIO PAGE                                  │
└──────────────────────────────────────────────────────────┘
                    │
                    ▼
        ┌───────────────────────┐
        │  useEffect[]          │
        │  setupMidnightArchive()
        └───────────┬───────────┘
                    │
        ┌───────────┴──────────────────┐
        │                              │
        ▼                              ▼
┌────────────────────┐      ┌──────────────────┐
│loadEventsFromCalendar()│    │Wait until midnight│
└────────┬───────────────┘   └────────┬─────────┘
         │                            │
         ▼                            ▼
    ┌──────────────────────┐  ┌──────────────┐
    │Check localStorage:   │  │archiveAndClear()
    │habika_calendar       │  │{              │
    │{                     │  │ Move today's  │
    │  "date": {           │  │ activities to │
    │    activities: [],   │  │ calendar      │
    │    habits: []        │  │}              │
    │  }                   │  └──────┬────────┘
    └────────┬─────────────┘         │
             │                       ▼
             │            ┌──────────────────┐
             │            │habika_calendar   │
             │            │updated with      │
             │            │today's data      │
             │            └──────┬───────────┘
             │                   │
             └───────┬───────────┘
                     │
                     ▼
         ┌────────────────────────┐
         │Load events by view:    │
         │- Day: 1 day           │
         │- Week: 7 days         │
         │- Month: 30+ days      │
         └────────┬───────────────┘
                  │
                  ▼
         ┌────────────────────────┐
         │Extract activities &    │
         │habits for display      │
         └────────┬───────────────┘
                  │
                  ▼
      ┌──────────────────────────┐
      │Render calendar view      │
      │(Day/Week/Month)          │
      └──────────────────────────┘

CRITICAL ISSUE:
  ┌─────────────────────────────────────────┐
  │ TODAY'S ACTIVITIES LOCATION:            │
  ├─────────────────────────────────────────┤
  │ Before midnight:                        │
  │   habika_activities_today (NOT shown)  │
  │                                         │
  │ After midnight:                         │
  │   habika_calendar (SHOWN)               │
  │                                         │
  │ RESULT: Today's activities invisible    │
  │         until midnight!                 │
  └─────────────────────────────────────────┘
```

---

## 4. Complete Data Lifecycle Timeline

```
SCENARIO: User logs in, creates activity, logs out, logs in again

┌──────────┬────────────────────┬──────────────────┬───────────┐
│Time      │Action              │localStorage      │Context    │
├──────────┼────────────────────┼──────────────────┼───────────┤
│T0        │Page load           │Empty             │Empty      │
│          │                    │                  │           │
│T1        │User logs in        │                  │Initializes│
│          │                    │                  │with empty │
│          │                    │                  │state      │
│          │                    │                  │           │
│T2        │Create habit        │habika_custom_    │Update     │
│          │                    │habits added      │state      │
│          │                    │                  │           │
│T3        │Create activity     │habika_activities│Update     │
│          │(say 10:00 AM)      │_today added      │state      │
│          │                    │                  │           │
│T4        │User logs out       │Still contains    │User set   │
│          │                    │previous data     │to null    │
│          │                    │                  │           │
│T5        │User logs back in   │Old data still    │Reinit from│
│          │(BEFORE midnight)   │localStorage      │localstorage
│          │(say 2:00 PM)       │                  │           │
│          │                    │                  │           │
│T6        │Navigate to...      │                  │           │
│          │                    │                  │           │
│          │/habitos            │✓ Shows habits    │✓ OK       │
│          │/actividades        │✓ Shows activities│✓ OK*      │
│          │/calendario         │? Only in calendar│✗ NOT shown
│          │                    │after midnight    │           │
│          │                    │                  │           │
│T7        │Midnight passes     │Activity moved to │           │
│          │                    │habika_calendar   │           │
│          │                    │                  │           │
│T8        │Refresh calendario  │✓ Now shows       │✓ OK       │
│          │                    │activity          │           │
└──────────┴────────────────────┴──────────────────┴───────────┘

*OK: Only because fallback to localStorage, but with timing issues
```

---

## 5. Data Persistence Layers

```
                    USER ACTION
                       │
         ┌─────────────┴─────────────┐
         │                           │
         ▼                           ▼
    ┌─────────────┐          ┌──────────────────┐
    │Authenticated│          │Not Authenticated │
    │(user logged)│          │(offline/guest)   │
    └──────┬──────┘          └────────┬─────────┘
           │                          │
           ▼                          ▼
    ┌──────────────────┐      ┌──────────────────┐
    │ DUAL LAYER:      │      │ SINGLE LAYER:    │
    │                  │      │                  │
    │1. localStorage   │      │ localStorage     │
    │   (immediate)    │      │ (only option)    │
    │                  │      │                  │
    │2. Supabase       │      │                  │
    │   (async, bg)    │      │                  │
    └────────┬─────────┘      └──────┬───────────┘
             │                       │
             ▼                       ▼
    ┌──────────────────┐      ┌──────────────────┐
    │ persistData()    │      │ setStorageItem() │
    │{                 │      │{                 │
    │  localStorage ✓  │      │  localStorage ✓  │
    │  Supabase... ✓   │      │}                 │
    │}                 │      │                  │
    └──────────────────┘      └──────────────────┘

AFTER LOGIN, BEFORE LOGOUT:
  If user's Supabase ≠ localStorage:
  → localStorage takes precedence (realtime should update)
  
CROSS-DEVICE SYNC:
  Supabase → RealtimeManager → ActivityContext → Pages
  
OFFLINE SYNC:
  OfflineManager queues operations
  On network restore: processQueue()
```

---

## 6. Re-login Sequence Problem

```
┌─────────────────────────────────────────────┐
│   SCENARIO: Login as User A, Logout, Login as User B
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ STEP 1: User A Logged In                    │
├─────────────────────────────────────────────┤
│ localStorage:                               │
│  habika_custom_habits: [User A habits]      │
│  habika_activities_today: {User A data}     │
│  habika_calendar: {User A calendar}         │
│                                             │
│ Context:                                    │
│  user: {id: 'user-a', ...}                 │
│  activities: {User A data}                  │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│ STEP 2: User A Logs Out                     │
├─────────────────────────────────────────────┤
│ UserContext.logout():                       │
│  - Calls supabase.auth.signOut()           │
│  - setUser(null)                            │
│  - stopRealtime()                           │
│  - ❌ MISSING: Clear localStorage!          │
│                                             │
│ localStorage (NOT CLEARED):                 │
│  habika_custom_habits: [User A data]        │
│  habika_activities_today: {User A data}     │
│  habika_calendar: {User A calendar}         │
│                                             │
│ Context:                                    │
│  user: null                                 │
│  activities: {} (cleared by auth handler)   │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│ STEP 3: User B Logs In                      │
├─────────────────────────────────────────────┤
│ UserContext.onAuthStateChange():            │
│  setUser({id: 'user-b', ...})              │
│  → ActivityContext.useEffect([user]) runs   │
│                                             │
│ ActivityContext loads from localStorage:    │
│  const stored = localStorage.getItem(...)   │
│  setActivities(stored)                      │
│  ❌ LOADS USER A'S DATA!                    │
│                                             │
│ Result:                                     │
│ User B sees User A's habits/activities!     │
│ SECURITY BREACH + Data Privacy Issue        │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│ STEP 4: Page Renders                        │
├─────────────────────────────────────────────┤
│ HabitosPage:                                │
│  ✗ Shows User A's habits                    │
│                                             │
│ ActividadesPage:                            │
│  ✗ Shows User A's activities                │
│  ✓ At least has context (wrong data)        │
│                                             │
│ CalendarioPage:                             │
│  ✗ Shows User A's calendar                  │
└─────────────────────────────────────────────┘

MISSING FIX:
  UserContext.logout() should be:
  {
    // Clear user-specific data
    localStorage.removeItem('habika_activities_today');
    localStorage.removeItem('habika_calendar');
    localStorage.removeItem('habika_custom_habits');
    
    // Then logout
    await supabase.auth.signOut();
    setUser(null);
  }
```

---

## 7. useEffect Dependency Analysis

```
┌──────────────────────────────────────────────────────────┐
│           PAGE COMPONENT useEffect HOOKS                 │
└──────────────────────────────────────────────────────────┘

HABITOS PAGE:
┌────────────────────────────────────────────────────────┐
│ useEffect(() => {                                      │
│   loadHabits();                                        │
│ }, [])  ← EMPTY DEPENDENCY = LOAD ONCE ONLY           │
│         ← NO AUTH STATE LISTENER                       │
│         ← NO localStorage LISTENER                     │
│                                                        │
│ PROBLEM:                                               │
│  - Only loads on initial mount                         │
│  - After logout/login, data not refreshed              │
│  - User must manually refresh page                     │
└────────────────────────────────────────────────────────┘

ACTIVIDADES PAGE:
┌────────────────────────────────────────────────────────┐
│ useEffect(() => {                                      │
│   loadTodayData();                                     │
│ }, [allActivities, loadTodayData])                     │
│                                                        │
│ useEffect(() => {                                      │
│   // ... setup listeners                              │
│   window.addEventListener('storage', ...);            │
│   window.addEventListener('activityUpdated', ...);    │
│   return () => { /* cleanup */ };                      │
│ }, [loadTodayData])                                    │
│                                                        │
│ GOOD:                                                  │
│  ✓ Reloads when context changes                        │
│  ✓ Listens to storage events                           │
│  ✓ Listens to custom events                            │
│                                                        │
│ MISSING:                                               │
│  ✗ No auth state listener ([user])                     │
│  ✗ Should clear on logout                              │
└────────────────────────────────────────────────────────┘

CALENDARIO PAGE:
┌────────────────────────────────────────────────────────┐
│ useEffect(() => {                                      │
│   loadEventsFromCalendar();                            │
│   // ... setup listeners                              │
│   window.addEventListener('storage', ...);            │
│   return () => { /* cleanup */ };                      │
│ }, [loadEventsFromCalendar])                          │
│                                                        │
│ useEffect(() => {                                      │
│   setupMidnightArchive();                             │
│   // No dependencies                                   │
│ }, [])  ← Only runs once                              │
│                                                        │
│ ISSUES:                                                │
│  ✗ setupMidnightArchive recursive timeout             │
│  ✗ No auth state listener                              │
│  ✗ No user-specific data segregation                   │
│  ✗ Doesn't load habika_activities_today               │
└────────────────────────────────────────────────────────┘

ACTIVITY CONTEXT:
┌────────────────────────────────────────────────────────┐
│ useEffect(() => {                                      │
│   // Initialize with user                             │
│   setUserId(user?.id ?? null);                        │
│   const stored = localStorage.getItem(...);           │
│   if (stored) setActivities(JSON.parse(stored));      │
│ }, [user])  ← Depends on user                         │
│                                                        │
│ GOOD:                                                  │
│  ✓ Reinits when user changes                          │
│  ✓ Loads from localStorage on mount                   │
│                                                        │
│ MISSING:                                               │
│  ✗ Should load from Supabase after auth               │
│  ✗ Should clear on logout (setActivities({}))         │
└────────────────────────────────────────────────────────┘
```

