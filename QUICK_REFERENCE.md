# Quick Reference: Data Loading Issues

## The Core Problem

After user logout and re-login, data may not display properly. This happens because:

1. **localStorage persists across sessions** - Old user's data stays in localStorage
2. **Context initialization doesn't sync with Supabase** - It just reloads from localStorage
3. **Pages don't listen to auth state changes** - They only load once on mount
4. **Data structures get tangled** - Activities are in multiple places (context, localStorage, calendar)

## Three Different Data Sources, Three Different Problems

### 1. HABITOS Page - Simplest, Most Broken

**File:** `/app/app/habitos/page.tsx`

**Storage:** `habika_custom_habits` (localStorage)

**Problem:** Pure localStorage, never reloads after login
```typescript
// Bad: Only loads once
useEffect(() => {
  loadHabits();
}, []);  // Empty dependency!
```

**Fix:** Add auth listener
```typescript
const { user } = useUser();

useEffect(() => {
  if (user) {
    loadHabits();  // Reload on login
  } else {
    setHabits([]);  // Clear on logout
  }
}, [user]);
```

**Hidden Data:** Habits with `status !== 'active'` or `type` undefined don't show in main tabs

---

### 2. ACTIVIDADES Page - Context-Based, Fallback to localStorage

**File:** `/app/app/actividades/page.tsx`

**Storage:** 
- Activities: Context + fallback to `habika_activities_today`
- Habits: `habika_custom_habits`

**Problem:** Context loads from localStorage, but doesn't clear old user's data on logout
```typescript
// In ActivityContext
useEffect(() => {
  setUserId(user?.id ?? null);
  const stored = localStorage.getItem('habika_activities_today');
  if (stored) setActivities(JSON.parse(stored));  // ← Loads old data!
}, [user]);
```

**Fix:** Clear on logout
```typescript
useEffect(() => {
  if (user?.id) {
    // Load data
    const stored = localStorage.getItem('habika_activities_today');
    if (stored) setActivities(JSON.parse(stored));
  } else {
    // Clear on logout
    setActivities({});
    localStorage.removeItem('habika_activities_today');
  }
}, [user?.id]);
```

**Hidden Data:** Habits with `status !== 'active'` don't show

**Also Hidden:** Today's activities don't show on calendar until midnight (when they move to `habika_calendar`)

---

### 3. CALENDARIO Page - Only Reads from habika_calendar, Not Today

**File:** `/app/app/calendario/page.tsx`

**Storage:** `habika_calendar` only (NOT `habika_activities_today`)

**Problem:** Today's activities live in `habika_activities_today` but calendar only shows `habika_calendar`
```typescript
// Only loads habika_calendar
const loadEventsFromCalendar = useCallback(() => {
  const calendar = JSON.parse(localStorage.getItem('habika_calendar') || '{}');
  // ↑ Missing: habika_activities_today
```

**Fix:** Load both sources
```typescript
const loadEventsFromCalendar = useCallback(() => {
  const calendar = JSON.parse(localStorage.getItem('habika_calendar') || '{}');
  const today = new Date().toISOString().split('T')[0];
  
  // Include today's activities from activities context
  const todayActivities = JSON.parse(localStorage.getItem('habika_activities_today') || '{}');
  if (todayActivities[today]) {
    // Add to calendar for today
    if (!calendar[today]) calendar[today] = { activities: [], habits: [] };
    calendar[today].activities.push(...todayActivities[today]);
  }
  
  // Then load events...
```

---

## The Re-Login Security Issue

**CRITICAL:** If User A logs out without clearing localStorage, then User B logs in, User B sees User A's data!

**Current Flow:**
```
User A logs out → localStorage unchanged (User A's data stays)
                ↓
User B logs in → ActivityContext loads from localStorage
               → User B sees User A's data 😱
```

**Required Fix in UserContext.logout():**
```typescript
const logout = async () => {
  // Clear user-specific data FIRST
  localStorage.removeItem('habika_activities_today');
  localStorage.removeItem('habika_calendar');
  localStorage.removeItem('habika_custom_habits');
  
  // Then logout
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
  
  setUser(null);
  setSession(null);
  realtimeManager.stopRealtime();
  setIsRealtimeActive(false);
};
```

---

## Files to Check/Fix

| File | Issue | Priority |
|------|-------|----------|
| `/app/context/UserContext.tsx` | logout() doesn't clear localStorage | CRITICAL |
| `/app/context/ActivityContext.tsx` | Doesn't clear on logout | HIGH |
| `/app/app/habitos/page.tsx` | No auth state listener | HIGH |
| `/app/app/actividades/page.tsx` | No auth state listener | MEDIUM |
| `/app/app/calendario/page.tsx` | Doesn't load today's activities | MEDIUM |

---

## Storage Keys Reference

```
habika_custom_habits
  → Used by: HabitosPage, ActividadesPage (for filtering)
  → Type: Habit[]
  → Hidden data: status !== 'active' or type undefined

habika_activities_today
  → Used by: ActividadesPage (context + fallback)
  → Type: { [date: string]: Activity[] }
  → Hidden data: Today's activities (only visible on calendar after midnight)

habika_calendar
  → Used by: CalendarioPage
  → Type: { [date: string]: { activities: [], habits: [] } }
  → Receives data from habika_activities_today at midnight

habika_username
  → User settings (preserved across sessions)
```

---

## Testing Checklist

- [ ] User A logs in → Creates habit/activity → Data shows ✓
- [ ] User A logs out → No error ✓
- [ ] User B logs in → Sees ONLY User B's data (not User A's) ✓
- [ ] User B creates activity before midnight → Shows on calendar ✓
- [ ] User B creates activity → Logs out → Logs back in → Data still there ✓
- [ ] Close tab → Reopen → Data still there ✓

---

## Key Insights

1. **localStorage is persistent and shared** - Not cleared on logout automatically
2. **Context depends on User but doesn't clear itself** - Manual cleanup needed
3. **Activities have 3 homes: context, activities_today, calendar** - Easy to lose data
4. **No Supabase sync on login** - Just reloads from localStorage
5. **Midnight is a state change point** - Activities move between storage keys
6. **Pages load once, don't react to auth changes** - No re-login listener

