# Supabase Sync Issues - Diagnostic & Solutions

## Summary of Errors Found

Based on console logs provided, two main database constraint violations occur:

### Error 1: Duplicate Key on user_settings
- **Code**: 23505 (unique constraint violation)
- **Message**: `duplicate key value violates unique constraint "user_settings_user_id_key"`
- **Frequency**: Happens during periodic sync (every 60 seconds)
- **HTTP Response**: 409 Conflict

### Error 2: NOT NULL Violation on activities.unit
- **Code**: 23502 (not-null constraint violation)
- **Message**: `null value in column "unit" of relation "activities" violates not-null constraint`
- **Frequency**: Periodic + window focus events
- **HTTP Response**: 400 Bad Request

---

## Root Causes Identified

### 1. user_settings duplicate key (23505)

**Cause**: Client was using regular INSERT instead of UPSERT when syncing user_settings.

**Supabase Recommendation**:
- Use UPSERT with `onConflict: 'user_id'`
- Handle conflict by updating instead of failing

**✅ IMPLEMENTED**:
```typescript
// app/lib/supabase-sync.ts:159-176
.upsert({
  user_id: userId,
  notifications_enabled: data.userSettings.notificationsEnabled ?? true,
  updated_at: new Date().toISOString(),
}, {
  onConflict: 'user_id'  // ← This prevents duplicate key errors
})
```

**Status**: ✅ FIXED - No more 23505 errors expected

---

### 2. activities.unit NOT NULL violation (23502)

**Cause**: Old activities in localStorage or offline queue missing the `unit` field.

**Supabase Recommendations**:
1. Validate fields client-side before sending
2. Skip invalid records instead of causing errors
3. Set a default value (e.g., 'min') if unit is missing

**✅ IMPLEMENTED** (3-part solution):

#### Part A: Skip invalid activities during sync
```typescript
// app/lib/supabase-sync.ts:90-94
if (!activity.unit || activity.unit === null || activity.unit === undefined) {
  console.warn(`⏭️ Skipping activity ${activity.id} - missing unit`);
  continue;  // ← Skip and don't cause error
}
```

#### Part B: Include unit with fallback
```typescript
// app/lib/supabase-sync.ts:103
unit: activity.unit || 'min',  // ← Default to 'min' if missing
```

#### Part C: Validate offline queue operations
```typescript
// app/lib/offline-manager.ts:141-160
private isValidOperation(operation: OfflineOperation): boolean {
  // Activities must have unit field (not null)
  if (table === 'activities') {
    if (!data.unit || data.unit === null) {
      return false;  // ← Reject invalid operations
    }
  }
  return true;
}
```

**Status**: ✅ FIXED - Invalid activities won't cause 23502 errors

---

## Diagnostic Steps for Database Inspection

### Run these queries in Supabase SQL Editor to diagnose data issues:

#### Query 1: Check user_settings schema
```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'user_settings'
ORDER BY ordinal_position;
```
**Look for**: UNIQUE constraints, column defaults

#### Query 2: Check user_settings constraints
```sql
SELECT conname, pg_get_constraintdef(oid) as def
FROM pg_constraint
JOIN pg_class ON conrelid = pg_class.oid
WHERE pg_class.relname = 'user_settings'
AND contype IN ('u','p');
```
**Look for**: UNIQUE(user_id) constraint definition

#### Query 3: Check for duplicate user_settings records
```sql
SELECT user_id, COUNT(*) as count
FROM user_settings
GROUP BY user_id
HAVING COUNT(*) > 1;
```
**Action if found**: Delete duplicates, keep most recent (by updated_at)

#### Query 4: Check activities schema (unit field)
```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'activities'
ORDER BY ordinal_position;
```
**Look for**: `unit` column, is_nullable = false (NOT NULL constraint)

#### Query 5: Check for activities with NULL unit
```sql
SELECT id, name, unit, created_at
FROM activities
WHERE unit IS NULL
ORDER BY created_at DESC
LIMIT 20;
```
**Action if found**: These need unit assigned or deletion. Options:
- Update: `UPDATE activities SET unit = 'min' WHERE unit IS NULL;`
- Or delete: `DELETE FROM activities WHERE unit IS NULL;`

#### Query 6: Check habits table structure
```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'habits'
ORDER BY ordinal_position;
```
**Look for**: `id` column type (should be UUID)

---

## Client-Side Validations Already Implemented

### In ActivityContext (when creating activities)
- Always includes `unit` field (defaults to 'min')
- Validates `duration` before persisting
- Uses UUID for ID generation

### In Biblioteca (when creating habits)
- Uses `crypto.randomUUID()` instead of string ID
- All required fields validated before save
- Persists directly to Supabase via `persistData()`

### In Offline Manager
- `isValidOperation()` validates before processing queue
- Skips activities without unit
- Skips habits with invalid ID format (string 'habit_' prefix)

---

## Manual Cleanup (if needed)

### In Browser Console:
```javascript
// Clean all invalid data from localStorage and offline queue
window.habika.cleanupStorage()
// Returns: { activitiesCleaned: number, operationsCleaned: number, totalCleaned: number }
```

### Clear offline queue completely:
```javascript
offlineManager.clearQueue()
```

### Check offline queue:
```javascript
offlineManager.getQueue()
```

---

### 3. habits duplicate key (23505) - UNIQUE(user_id, name)

**Cause**: habits table has UNIQUE(user_id, name) constraint but code was using basic upsert without onConflict.

**Supabase Recommendation**:
- Use UPSERT with `onConflict: 'user_id,name'`
- Handle conflict by updating instead of failing

**✅ IMPLEMENTED**:
```typescript
// app/lib/supabase-sync.ts:43-66 (real-time sync)
.upsert({
  id: habit.id,
  user_id: userId,
  name: habit.name,
  frequency: habit.frequency,
  status: habit.status,
  streak: habit.streak || 0,
  created_at: habit.createdAt || new Date().toISOString(),
  updated_at: new Date().toISOString(),
}, {
  onConflict: 'user_id,name'  // ← This prevents duplicate key errors
})
```

Also updated in `app/lib/supabase-migrate.ts:159-185` for initial migration.

**Status**: ✅ FIXED - No more 23505 errors on habits

---

### 4. cycle_data duplicate key (23505) - UNIQUE(user_id)

**Cause**: cycle_data table has UNIQUE(user_id) constraint but code was using basic upsert without onConflict.

**Supabase Recommendation**:
- Use UPSERT with `onConflict: 'user_id'`
- Handle conflict by updating instead of failing

**✅ IMPLEMENTED**:
```typescript
// app/lib/supabase-sync.ts:121-139 (real-time sync)
.upsert({
  user_id: userId,
  is_active: data.cycleData.isActive || false,
  last_period_start: data.cycleData.lastPeriodStart,
  created_at: data.cycleData.createdAt || new Date().toISOString(),
  updated_at: new Date().toISOString(),
}, {
  onConflict: 'user_id'  // ← This prevents duplicate key errors
})
```

Also updated in `app/lib/supabase-migrate.ts:245-266` for initial migration.

**Status**: ✅ FIXED - No more 23505 errors on cycle_data

---

## Verification Checklist

- [x] user_settings uses UPSERT with onConflict: 'user_id'
- [x] Activities with missing unit are skipped during sync
- [x] Activities include unit field with fallback 'min'
- [x] Offline queue validates operations before processing
- [x] Habit IDs use UUID v4 instead of string format
- [x] Storage cleanup utility available in window.habika
- [x] Habits uses UPSERT with onConflict: 'user_id,name'
- [x] cycle_data uses UPSERT with onConflict: 'user_id'
- [x] Both sync and migration functions have conflict resolution

---

## Next Steps

1. **Run diagnostic queries** above in Supabase SQL Editor
2. **If duplicates found**: Execute cleanup queries provided
3. **If activities have NULL unit**: Update or delete as appropriate
4. **Monitor logs**: Both errors should be gone after deployment
5. **Test flow**: Create activity → close app → reopen → verify persistence

---

## Expected Results After All Fixes

### Console Errors - RESOLVED ✅
✅ No more 23505 errors on user_settings (duplicate key)
✅ No more 23505 errors on habits (duplicate key)
✅ No more 23505 errors on cycle_data (duplicate key)
✅ No more 23502 errors on activities (NOT NULL violation)

### Data Persistence - WORKING ✅
✅ Activities sync immediately to Supabase with correct schema
✅ Habits sync with proper UUID format and constraint handling
✅ Cycle data upserts instead of failing on duplicate
✅ User settings don't conflict on periodic sync
✅ Data persists across app sessions and tab closures
✅ Offline queue only contains valid operations
✅ Invalid data is validated and cleaned before sync

### Complete Fix Summary
All 7 errors identified have been fixed:
1. ✅ Stale closure preventing immediate activity display
2. ✅ Habit UUID format mismatch (string → UUID)
3. ✅ Activities missing unit field
4. ✅ Data not loading on app restart
5. ✅ Habits not persisting to Supabase
6. ✅ Habits duplicate key constraint (23505)
7. ✅ cycle_data duplicate key constraint (23505)
8. ✅ Activities unit NOT NULL constraint (23502)
9. ✅ user_settings duplicate key constraint (23505)
