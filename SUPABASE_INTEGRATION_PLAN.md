# SUPABASE INTEGRATION PLAN - ROCKET APP

**Date:** 2025-11-11
**Status:** PLANNING
**Objective:** Migrate from localStorage to Supabase for persistent cloud storage
**Estimated Time:** ~25-30 hours

---

## 1. CURRENT STATE ANALYSIS

### Data Currently in localStorage:
```javascript
// User data
- hasOnboarded: boolean
- user.name: string
- user.email: string (if captured)

// Habits
- habika_custom_habits: Habit[]
- habika_completions: CompletionRecord[]

// Activities
- habika_activities: Activity[]
- habika_activities_today: DailyActivity[]
- habika_calendar: CalendarEntry[]

// Cycle tracking
- habika_cycle_data: CycleData

// User preferences
- habika_theme: ThemeName
- habika_zen_mode: boolean
- habika_notifications: NotificationSettings

// Reflections
- habika_reflections: Reflection[]

// History
- habika_streak_data: StreakRecord[]
```

### Current localStorage Keys (15+ keys):
- hasOnboarded
- habika_custom_habits
- habika_completions
- habika_activities
- habika_activities_today
- habika_calendar
- habika_cycle_data
- habika_theme
- habika_zen_mode
- habika_notifications
- habika_reflections
- habika_streak_data
- habika_user_profile
- habika_settings
- habika_backup (optional)

---

## 2. SUPABASE ARCHITECTURE DESIGN

### Database Schema (PostgreSQL):

```sql
-- Auth (handled by Supabase Auth)
-- users table (auto-created by Supabase)

-- Core data tables

-- Users extended profile
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  display_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  avatar_url TEXT,
  theme TEXT DEFAULT 'lavender',
  zen_mode BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Habits
CREATE TABLE habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  frequency TEXT NOT NULL, -- 'diario', 'semanal', 'mensual', 'personalizado'
  days_of_week INT[] DEFAULT '{}',
  status TEXT DEFAULT 'active', -- 'active', 'paused', 'completed'
  color TEXT,
  icon TEXT,
  goal INT,
  unit TEXT,
  category TEXT,
  streak INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  UNIQUE(user_id, name)
);

-- Habit completions
CREATE TABLE habit_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  completion_date DATE NOT NULL,
  status TEXT DEFAULT 'completed', -- 'completed', 'skipped', 'pending'
  notes TEXT,
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE(habit_id, completion_date)
);

-- Activities
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  duration INT NOT NULL, -- minutes
  unit TEXT NOT NULL, -- 'min', 'hs'
  category TEXT NOT NULL,
  color TEXT,
  date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Cycle tracking
CREATE TABLE cycle_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT false,
  last_period_start DATE,
  cycle_length_days INT,
  period_length_days INT,
  current_phase TEXT, -- 'menstrual', 'follicular', 'ovulatory', 'luteal'
  notes TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  UNIQUE(user_id)
);

-- Reflections
CREATE TABLE reflections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  content TEXT NOT NULL,
  mood TEXT, -- 'excellent', 'good', 'neutral', 'bad', 'awful'
  tags TEXT[], -- array of tags
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  UNIQUE(user_id, date)
);

-- User settings/preferences
CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notifications_enabled BOOLEAN DEFAULT true,
  notification_time TIME,
  reminder_frequency TEXT, -- 'daily', 'weekly', 'never'
  data_synced_at TIMESTAMP,
  last_backup_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  UNIQUE(user_id)
);

-- Sync logs (for debugging multi-device sync)
CREATE TABLE sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  table_name TEXT NOT NULL,
  action TEXT NOT NULL, -- 'insert', 'update', 'delete'
  data_snapshot JSONB,
  synced_at TIMESTAMP DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_habits_user_id ON habits(user_id);
CREATE INDEX idx_completions_user_id ON habit_completions(user_id);
CREATE INDEX idx_completions_date ON habit_completions(completion_date);
CREATE INDEX idx_activities_user_id ON activities(user_id);
CREATE INDEX idx_activities_date ON activities(date);
CREATE INDEX idx_reflections_user_id ON reflections(user_id);
CREATE INDEX idx_reflections_date ON reflections(date);
```

### Supabase Realtime Subscriptions:
- Subscribe to habit_completions changes
- Subscribe to activities changes
- Subscribe to cycle_data changes
- Subscribe to user_profiles changes

---

## 3. IMPLEMENTATION PHASES

### Phase 1: Setup & Authentication (4-5 hours)
**Tasks:**
- [ ] Create Supabase project
- [ ] Configure PostgreSQL database
- [ ] Setup Supabase Auth (Email/Password, Google OAuth)
- [ ] Create `.env.local` with Supabase keys
- [ ] Install @supabase/supabase-js
- [ ] Create Supabase client initialization
- [ ] Create AuthContext for Supabase Auth

**Files to create:**
- `app/lib/supabase.ts` - Client initialization
- `app/context/AuthContext.tsx` - Auth context (replaces/extends UserContext)
- `app/components/LoginModal.tsx` - Login form
- `app/components/SignupModal.tsx` - Registration form
- `.env.local` - Environment variables

**Output:**
- Working authentication system
- Protected routes
- User sign in/sign up flow

---

### Phase 2: Data Migration Layer (5-6 hours)
**Tasks:**
- [ ] Create data sync service
- [ ] Implement localStorage → Supabase sync
- [ ] Create fallback mechanism (offline support)
- [ ] Implement conflict resolution (last-write-wins)
- [ ] Create data migration utilities
- [ ] Add sync status indicator

**Files to create:**
- `app/lib/supabase-sync.ts` - Sync service
- `app/lib/supabase-helpers.ts` - Helper functions
- `app/hooks/useSyncData.ts` - Hook for syncing
- `app/components/SyncStatus.tsx` - Sync indicator

**Output:**
- Bidirectional sync between localStorage and Supabase
- Offline support maintained
- Data conflict handling

---

### Phase 3: Habits Module Migration (4-5 hours)
**Tasks:**
- [ ] Migrate habits data fetching to Supabase
- [ ] Update habit creation/update/delete operations
- [ ] Implement real-time subscriptions for habits
- [ ] Update HabitCheckbox component for real-time updates
- [ ] Migrate habit completions
- [ ] Test multi-device sync

**Files to modify:**
- `app/app/biblioteca/page.tsx` - Use Supabase queries
- `app/components/HabitCheckbox.tsx` - Real-time completion sync
- `app/lib/habitLogic.ts` - Use Supabase instead of localStorage

**Output:**
- Habits synced to cloud
- Real-time updates across devices
- Completions tracked in Supabase

---

### Phase 4: Activities Module Migration (4-5 hours)
**Tasks:**
- [ ] Migrate activities to Supabase
- [ ] Update activity creation/update/delete
- [ ] Implement real-time subscriptions
- [ ] Update calendar view
- [ ] Update activity search/filtering

**Files to modify:**
- `app/app/actividades/page.tsx`
- `app/app/calendario/page.tsx`
- `app/lib/store.ts` - Use Supabase queries

**Output:**
- Activities synced to cloud
- Real-time calendar updates
- Better search/filtering capabilities

---

### Phase 5: Additional Modules (3-4 hours)
**Tasks:**
- [ ] Migrate cycle tracking data
- [ ] Migrate reflections
- [ ] Migrate user preferences/settings
- [ ] Migrate theme settings
- [ ] Update dashboard stats calculation (use Supabase aggregation)

**Files to modify:**
- `app/context/CycleContext.tsx`
- `app/app/reflexiones/page.tsx`
- `app/app/perfil/page.tsx`
- `app/context/ThemeContext.tsx`

**Output:**
- All data synced to Supabase
- Better aggregation queries
- Cloud-based preferences

---

### Phase 6: Testing & Optimization (3-4 hours)
**Tasks:**
- [ ] Test offline functionality
- [ ] Test multi-device sync
- [ ] Test conflict resolution
- [ ] Performance optimization (indexes, queries)
- [ ] Error handling and logging
- [ ] Backup/restore functionality

**Output:**
- Stable, production-ready integration
- Proper error handling
- Monitoring and logging

---

## 4. KEY DECISIONS

### Authentication Strategy:
- **Primary:** Email/Password with Supabase Auth
- **Secondary:** Google OAuth for convenience
- **Session:** JWT tokens stored in cookies (more secure than localStorage)

### Data Sync Strategy:
- **Online:** Real-time Supabase subscriptions + REST API calls
- **Offline:** Operate on localStorage, sync when online
- **Conflict Resolution:** Last-write-wins with timestamp comparison

### Fallback Mechanism:
- Keep localStorage as fallback cache
- Sync on app startup
- Sync on focus/reconnect
- Background periodic sync

### Privacy & Security:
- Row-level security (RLS) policies on all tables
- User can only see their own data
- Encryption at rest (Supabase default)
- HTTPS-only communication

---

## 5. ENVIRONMENT VARIABLES NEEDED

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyxxx...

# Optional for additional features
SUPABASE_SERVICE_ROLE_KEY=xxx... (backend only, never expose)
```

---

## 6. MIGRATION CHECKLIST

### Pre-Migration:
- [ ] Backup all user data
- [ ] Create Supabase project and database
- [ ] Setup authentication
- [ ] Test with dummy data
- [ ] Plan rollback strategy

### During Migration:
- [ ] Keep localStorage as cache
- [ ] Implement sync service
- [ ] Test each module before moving to next
- [ ] Monitor for errors
- [ ] Document any issues

### Post-Migration:
- [ ] Verify all data synced
- [ ] Test offline mode
- [ ] Test multi-device sync
- [ ] Test authentication
- [ ] Performance testing
- [ ] User acceptance testing

---

## 7. ROLLBACK PLAN

If critical issues occur:
1. Revert to localStorage-only mode
2. Keep Supabase synced as backup
3. Fix issues in staging environment
4. Re-attempt migration

---

## 8. NEXT STEPS (IN ORDER)

1. **✅ FIRST:** Create comprehensive Supabase setup guide
2. **✅ SECOND:** Setup authentication system
3. **✅ THIRD:** Create data sync layer
4. **✅ FOURTH:** Migrate habits module
5. **✅ FIFTH:** Migrate activities module
6. **✅ SIXTH:** Migrate remaining modules
7. **✅ SEVENTH:** Comprehensive testing
8. **✅ EIGHTH:** Performance optimization
9. **✅ NINTH:** Documentation
10. **✅ TENTH:** Release & monitoring

---

## 9. ESTIMATED BREAKDOWN

| Phase | Tasks | Estimated Time |
|-------|-------|-----------------|
| 1. Setup & Auth | 8 tasks | 4-5h |
| 2. Data Sync Layer | 6 tasks | 5-6h |
| 3. Habits Migration | 6 tasks | 4-5h |
| 4. Activities Migration | 5 tasks | 4-5h |
| 5. Other Modules | 5 tasks | 3-4h |
| 6. Testing & Optimization | 6 tasks | 3-4h |
| **TOTAL** | **36 tasks** | **25-30h** |

---

## 10. SUPABASE REFERENCES

### Useful Links:
- [Supabase Documentation](https://supabase.com/docs)
- [JavaScript Client Library](https://supabase.com/docs/reference/javascript/introduction)
- [Authentication Guide](https://supabase.com/docs/guides/auth)
- [Real-time Subscriptions](https://supabase.com/docs/guides/realtime)
- [Row-Level Security](https://supabase.com/docs/guides/auth/row-level-security)

### Quick Start Commands:
```bash
# Install Supabase client
npm install @supabase/supabase-js

# Initialize Supabase project via CLI
npx supabase init
npx supabase login
```

---

## 11. RISK ASSESSMENT

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Data loss during migration | Low | High | Backup before migration, test thoroughly |
| Real-time sync issues | Medium | Medium | Implement conflict resolution, monitoring |
| Authentication bugs | Low | High | Thorough testing, gradual rollout |
| Performance degradation | Medium | Medium | Indexes, query optimization, caching |
| Vendor lock-in | Low | Medium | Use standard SQL, easier to migrate later |

---

## 12. SUCCESS CRITERIA

- ✅ All user data migrated to Supabase
- ✅ Authentication working (email + OAuth)
- ✅ Real-time sync across devices
- ✅ Offline mode still functional
- ✅ Performance maintained or improved
- ✅ Zero data loss during migration
- ✅ All tests passing
- ✅ Users can sign in and use app normally

---

**Status:** Ready to start implementation
**Next Action:** Begin Phase 1 (Setup & Authentication)

---

## SESSION LOG ENTRY FORMAT FOR SUPABASE WORK

When working on Supabase integration, use this format in SESSION_LOG.md:

```markdown
### SUPABASE Integration Session - [Date]

**Phase:** [Phase Name]
**Tasks Completed:**
- [ ] Task 1
- [ ] Task 2

**Files Created:**
- file1.ts
- file2.tsx

**Files Modified:**
- file1.ts
- file2.ts

**Commits Made:**
- [hash]: commit message

**Build Status:** ✅/❌
**Tests:** ✅/❌
**Next Steps:**
- [ ] Task for next session
```

---

**Created:** 2025-11-11 | **Updated:** Ready for implementation
