# HABIKA Codebase Comprehensive Analysis

## Executive Summary
HABIKA is a Spanish-language habit tracking and wellness PWA built with Next.js 16, React 19, and TypeScript. The app focuses on tracking activities, habits, and cycle tracking with a Stitch-themed UI. The analysis identified 8 critical and 12 high-priority issues across code quality, performance, UX/UI, accessibility, and mobile/PWA optimization.

---

## 1. CODE QUALITY ISSUES

### 1.1 CRITICAL: Unused Component Exports and Dead Code
**Severity:** CRITICAL | **Priority:** P0

**Location:**
- `/Users/agustinmoren0/rocket-app/app/app/register-sw.tsx` - Unused return statement in cleanup function (line 40)
- `/Users/agustinmoren0/rocket-app/app/components/Confetti.tsx` - No export issues but function only used in one component
- `/Users/agustinmoren0/rocket-app/app/hooks/useTheme.ts` - `isDark` property is marked "Para futura implementación" but never used (line 19)

**Issues Found:**
```tsx
// Line 40 in register-sw.tsx - Invalid return in cleanup function
return () => clearInterval(interval);  // This returns a function, not void
```

**Impact:** Memory leak risk, confusing cleanup behavior, unused code paths.

**Recommendation:** Remove unused return statement and `isDark` property.

---

### 1.2 HIGH: Multiple useCallback Dependencies Missing
**Severity:** HIGH | **Priority:** P1

**Location:**
- `/Users/agustinmoren0/rocket-app/app/app/calendario/page.tsx` (lines 32-46)
  - `getCycleDayInfo` uses `cycleData` and `currentDate` in dependencies but missing proper tracking

**Issues Found:**
```tsx
const getCycleDayInfo = useCallback((dayNumber: number) => {
  // ... uses cycleData, currentDate but deps correct
}, [cycleData, currentDate]);

// However, cycleData is a whole object that changes frequently
// This causes excessive re-renders
```

**Impact:** Unnecessary re-renders when cycle data updates, performance degradation.

---

### 1.3 HIGH: Unsafe Type Assertions with `any`
**Severity:** HIGH | **Priority:** P1

**Locations:**
- `/Users/agustinmoren0/rocket-app/app/app/page.tsx` - Multiple `any` types (lines 44, 60, 85, 94, 97, 109)
- `/Users/agustinmoren0/rocket-app/app/app/actividades/page.tsx` - Multiple `any` types (lines 27, 43-46, 71-72, 78, 85)
- `/Users/agustinmoren0/rocket-app/app/app/habitos/page.tsx` - Widespread use of `any`
- `/Users/agustinmoren0/rocket-app/app/app/calendario/page.tsx` - Event and calendar data typed as `any`

**Issues Found:**
```tsx
const habits = JSON.parse(localStorage.getItem('habika_custom_habits') || '[]');
// habits is `any[]` - no type safety
const completions = JSON.parse(localStorage.getItem('habika_completions') || '{}');
// completions is `any` - risk of runtime errors
```

**Impact:** Loss of type safety, runtime errors not caught at compile time, harder maintenance.

**Recommendation:** Create proper TypeScript interfaces for all data structures.

---

### 1.4 HIGH: No Input Validation on Critical User Data
**Severity:** HIGH | **Priority:** P1

**Locations:**
- `/Users/agustinmoren0/rocket-app/app/components/ChangeNameModal.tsx` (lines 23-26) - Only checks if trimmed name is empty
- `/Users/agustinmoren0/rocket-app/app/context/CycleContext.tsx` (lines 113-126) - No validation on cycle length/period length inputs
- `/Users/agustinmoren0/rocket-app/app/app/actividades/page.tsx` - No validation on activity duration/units

**Issues Found:**
```tsx
// ChangeNameModal - insufficient validation
if (!trimmed) { showToast('Por favor, ingresá un nombre válido', 'error'); }
// Doesn't check for max length, special characters, or XSS

// CycleContext - no validation on numeric inputs
const activateCycleMode = (lastPeriod: string, cycleLength: number, periodLength: number) => {
  // No checks if cycleLength is reasonable (e.g., 20-40)
  // No checks if periodLength < cycleLength
```

**Impact:** Invalid data in localStorage, potential XSS vulnerabilities, broken cycle calculations.

---

### 1.5 MEDIUM: Inconsistent Error Handling
**Severity:** MEDIUM | **Priority:** P2

**Locations:**
- `/Users/agustinmoren0/rocket-app/app/lib/store.ts` (lines 177-198) - Generic try-catch returns `initData()` without logging
- `/Users/agustinmoren0/rocket-app/app/lib/streakLogic.ts` (lines 36-42, 60-81) - Silent failures in JSON parse
- `/Users/agustinmoren0/rocket-app/app/app/calendario/page.tsx` (lines 50-51) - Wrapped in try-catch but no user feedback

**Issues Found:**
```tsx
// store.ts - no error context
try {
  const data: UserData = JSON.parse(stored);
  // ...
} catch {
  return initData();  // Silently resets data - user loses all progress
}

// LogViewer shows errors but they're only visible to developers
```

**Impact:** Silent data loss, debugging difficulty, poor error reporting to users.

---

## 2. PERFORMANCE ISSUES

### 2.1 CRITICAL: Excessive localStorage Polling in Dashboard
**Severity:** CRITICAL | **Priority:** P0

**Location:** `/Users/agustinmoren0/rocket-app/app/app/page.tsx` (lines 14-40)

**Issues Found:**
```tsx
useEffect(() => {
  calculateStats();
  
  // Storage change listener
  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === 'habika_activities_today' || ...) calculateStats();
  };
  window.addEventListener('storage', handleStorageChange);
  
  // PROBLEM: Updates every 5 seconds regardless of changes
  const interval = setInterval(calculateStats, 5000);
  
  return () => {
    window.removeEventListener('storage', handleStorageChange);
    clearInterval(interval);
  };
}, []);
```

**Problems:**
1. **Double updates** - Both storage listener AND 5-second interval
2. **Heavy computation** - calculateStats() loops through 7 days of data, all habits, all completions (lines 44-129)
3. **No debouncing** - Every single change triggers recalculation
4. **Interval never clears properly** - `return () => clearInterval()` is INSIDE useEffect but doesn't prevent new intervals

**Performance Impact:**
- Creates 17,280 calculateStats() calls per day (every 5 seconds)
- Each call iterates 7 days × habits count × completions
- With 10 habits = 1,728,000 iterations per day
- On slow devices/low battery, this drains battery and causes jank

**Recommendation:**
```tsx
// Use Debounced calculation with smart caching
const [statsCache, setStatsCache] = useState(null);
const statsTimerRef = useRef<NodeJS.Timeout | null>(null);

const calculateStatsDebounced = useCallback(() => {
  if (statsTimerRef.current) clearTimeout(statsTimerRef.current);
  statsTimerRef.current = setTimeout(() => calculateStats(), 1000);
}, []);

useEffect(() => {
  const handleStorageChange = (e: StorageEvent) => {
    if (relevantKey(e.key)) calculateStatsDebounced();
  };
  window.addEventListener('storage', handleStorageChange);
  return () => {
    window.removeEventListener('storage', handleStorageChange);
    if (statsTimerRef.current) clearTimeout(statsTimerRef.current);
  };
}, [calculateStatsDebounced]);
```

---

### 2.2 CRITICAL: Framer Motion Animations Causing Layout Thrashing
**Severity:** CRITICAL | **Priority:** P0

**Location:** Multiple locations with Framer Motion animations:
- `/Users/agustinmoren0/rocket-app/app/app/page.tsx` - 4 motion.div animations (lines 166-297)
- `/Users/agustinmoren0/rocket-app/app/components/HabitCheckbox.tsx` - Animation on checkbox (lines 73-95)
- `/Users/agustinmoren0/rocket-app/app/app/actividades/page.tsx` - Potentially heavy drag animations
- `/Users/agustinmoren0/rocket-app/app/components/BottomNav.tsx` - FAB animations (lines 23-63)

**Issues Found:**
```tsx
// These trigger constant repaints
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.1 }}  // Sequential animations = waterfall repaints
/>

// 4 sequential animations with delays = 400-800ms of repaints
```

**Note:** Recent commit "42cb1a5 feat: remove all Framer Motion animations from onboarding page" suggests this is being addressed, but many other pages still have them.

**Performance Impact:**
- Each animation = separate repaint cycle
- Sequential delays prevent GPU optimization
- On low-end devices causes visible jank
- Battery drain on mobile devices

**Recommendation:** Replace Framer Motion with CSS animations or remove non-critical animations.

---

### 2.3 HIGH: No Image Optimization for PWA Assets
**Severity:** HIGH | **Priority:** P1

**Location:** `/Users/agustinmoren0/rocket-app/public/icons/` - Icon assets not analyzed for size
- `/Users/agustinmoren0/rocket-app/public/icons/icon-192.png`
- `/Users/agustinmoren0/rocket-app/public/icons/icon-512.png`
- `/Users/agustinmoren0/rocket-app/public/icons/maskable-192.png`
- `/Users/agustinmoren0/rocket-app/public/icons/maskable-512.png`

**Issues Found:**
```json
// manifest.json references 4 icons, likely large uncompressed files
// No WebP versions, no lazy loading, no size optimization
```

**Impact:** Large cache size, slower PWA installation, increased bandwidth.

**Recommendation:** 
- Compress images to <50KB each
- Create WebP versions
- Use responsive images

---

### 2.4 HIGH: Unoptimized LocalStorage Serialization
**Severity:** HIGH | **Priority:** P1

**Locations:**
- `/Users/agustinmoren0/rocket-app/app/lib/store.ts` - Full object serialize/deserialize
- `/Users/agustinmoren0/rocket-app/app/lib/habitLogic.ts` - Multiple JSON.parse calls in loops
- `/Users/agustinmoren0/rocket-app/app/app/calendario/page.tsx` (line 51) - Parses entire calendar each time

**Issues Found:**
```tsx
// calendario/page.tsx line 51 - In loadEventsFromCalendar callback
const calendar = JSON.parse(localStorage.getItem('habika_calendar') || '{}');
// Called every time view changes or date changes
// Could be 1000+ calendar entries being parsed

// habitLogic.ts - Called in loop
for (const habit of habits) {
  const completions = JSON.parse(localStorage.getItem('habika_completions') || '{}');
  // Parsing same data multiple times in same function
}
```

**Performance Impact:**
- JSON.parse() is synchronous and blocking
- Parsing large JSON structures freezes UI
- Mobile devices with limited RAM suffer significantly

**Recommendation:**
- Cache parsed data in memory
- Use selective serialization
- Implement data pagination

---

### 2.5 MEDIUM: Service Worker Update Detection Too Frequent
**Severity:** MEDIUM | **Priority:** P2

**Location:** `/Users/agustinmoren0/rocket-app/app/app/register-sw.tsx` (line 12-15)

**Issues Found:**
```tsx
const interval = setInterval(() => {
  console.log('🔄 Checking for SW updates...');
  registration.update();
}, 30000);  // Every 30 seconds = 2,880 checks per day
```

**Problems:**
1. Every 30 seconds checks for updates
2. No exponential backoff
3. No battery/connection awareness
4. Creates network request every 30s

**Impact:** Unnecessary network traffic, battery drain, server load.

**Recommendation:** Increase interval to 60+ minutes or use exponential backoff.

---

## 3. UX/UI ISSUES

### 3.1 CRITICAL: Flash/Flicker on Page Loads (Layout Shift)
**Severity:** CRITICAL | **Priority:** P0

**Location:**
- `/Users/agustinmoren0/rocket-app/app/RootLayoutContent.tsx` (lines 14-22)
- `/Users/agustinmoren0/rocket-app/app/app/layout.tsx` (lines 26-39)

**Issues Found:**
```tsx
// RootLayoutContent - No error boundary or loading state
useEffect(() => {
  const hasOnboarded = localStorage.getItem('hasOnboarded') === 'true';
  if (hasOnboarded && pathname === '/landing') {
    router.replace('/app');
  }
}, [pathname, router]);
// Doesn't wait for router - can cause flash

// app/layout.tsx - No protection against showing wrong content
if (!hasOnboarded && !isOnboarding) {
  router.push('/app/onboarding');
}
// User sees wrong content briefly before redirect
```

**Problems:**
1. No loading indicator
2. Content flashes before redirect
3. No visual feedback during routing
4. CLS (Cumulative Layout Shift) violations

**Recommendation:**
```tsx
const [mounted, setMounted] = useState(false);

useEffect(() => {
  const hasOnboarded = localStorage.getItem('hasOnboarded') === 'true';
  if (hasOnboarded && pathname === '/landing') {
    router.replace('/app');
  } else {
    setMounted(true);
  }
}, [pathname, router]);

if (!mounted) return <LoadingScreen />;
```

---

### 3.2 HIGH: Confusing Navigation Flow on Onboarding
**Severity:** HIGH | **Priority:** P1

**Location:**
- `/Users/agustinmoren0/rocket-app/app/app/onboarding/page.tsx`
- `/Users/agustinmoren0/rocket-app/app/app/layout.tsx` (lines 24-39)

**Issues Found:**
```tsx
// Redundant redirect checks
// RootLayoutContent checks hasOnboarded
// app/layout also checks hasOnboarded
// app/onboarding/layout may also check

// This causes multiple redirect evaluations
// Users might see onboarding twice if they visit /app before /app/onboarding
```

**Problems:**
1. Multiple redirect logic in different files
2. User can reach /app/onboarding directly from URL
3. Unclear what happens after onboarding
4. No protection against going back to onboarding after completion

**Recommendation:**
- Single source of truth for onboarding state
- Protect all routes except landing and onboarding
- Use middleware or single layout check

---

### 3.3 HIGH: Modal Implementation Lacks Accessibility
**Severity:** HIGH | **Priority:** P1

**Location:**
- `/Users/agustinmoren0/rocket-app/app/components/ChangeNameModal.tsx`
- `/Users/agustinmoren0/rocket-app/app/app/actividades/page.tsx` - Inline modals

**Issues Found:**
```tsx
// ChangeNameModal - No ARIA attributes
<div
  className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-6"
  onClick={onClose}  // Only clicks close, doesn't handle Escape key
>
  <div
    className="bg-white rounded-3xl p-6 w-full max-w-sm"
    onClick={(e) => e.stopPropagation()}
  >
```

**Problems:**
1. No `role="dialog"`
2. No `aria-labelledby` or `aria-describedby`
3. No Escape key handling
4. No focus trap
5. No modal backdrop ARIA

**Recommendation:**
```tsx
<div
  role="dialog"
  aria-labelledby="modal-title"
  aria-modal="true"
  className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
  onClick={onClose}
  onKeyDown={(e) => e.key === 'Escape' && onClose()}
>
  <div className="...">
    <h2 id="modal-title">Cambiar nombre</h2>
    ...
  </div>
</div>
```

---

### 3.4 HIGH: No Loading States in Long Operations
**Severity:** HIGH | **Priority:** P1

**Locations:**
- `/Users/agustinmoren0/rocket-app/app/app/calendar/page.tsx` - loadEventsFromCalendar might be slow
- `/Users/agustinmoren0/rocket-app/app/app/habitos/page.tsx` - loadHabits has no loading state
- `/Users/agustinmoren0/rocket-app/app/app/actividades/page.tsx` - loadTodayData has no loading state

**Issues Found:**
```tsx
const loadTodayData = () => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const allActivities = JSON.parse(localStorage.getItem('habika_activities_today') || '{}');
    // ... lots of processing
    setActivities(...);
  } catch (e) {
    // No error state shown to user
  }
};
```

**Problems:**
1. No loading state - appears to hang
2. No error state for users
3. No skeleton screens
4. Users don't know if app is working or frozen

**Impact:** Poor perceived performance, user frustration.

---

### 3.5 MEDIUM: Poor Empty States
**Severity:** MEDIUM | **Priority:** P2

**Location:**
- `/Users/agustinmoren0/rocket-app/app/components/EmptyState.tsx` exists but usage unclear
- `/Users/agustinmoren0/rocket-app/app/app/actividades/page.tsx` - No empty state when no activities
- `/Users/agustinmoren0/rocket-app/app/app/habitos/page.tsx` - No empty state for new users

**Issues Found:**
```tsx
// No clear messaging when:
// - User has no habits created
// - User has no activities today
// - User has no reflections
// - Calendar is empty
```

**Problems:**
1. Users see blank screens
2. No call-to-action
3. No guidance on what to do next

---

## 4. ACCESSIBILITY ISSUES

### 4.1 CRITICAL: No Focus Management or Keyboard Navigation
**Severity:** CRITICAL | **Priority:** P0

**Locations:**
- `/Users/agustinmoren0/rocket-app/app/components/BottomNav.tsx` - No focus trap on FAB menu
- `/Users/agustinmoren0/rocket-app/app/components/TopBar.tsx` - No keyboard shortcuts
- `/Users/agustinmoren0/rocket-app/app/app/actividades/page.tsx` - Modal opens without focus

**Issues Found:**
```tsx
// BottomNav FAB menu - no keyboard support
{showFAB && (
  <motion.div className="...">
    <button onClick={() => router.push(...)} />
    <button onClick={() => router.push(...)} />
  </motion.div>
)}
// Users with keyboard must use mouse

// No tabIndex management when modal opens
// Focus doesn't move to modal
// Background is still focusable
```

**Impact:**
- Keyboard-only users cannot use app
- Screen reader users confused about focus
- Tab navigation broken

**Recommendation:**
```tsx
const [showFAB, setShowFAB] = useState(false);
const fabRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  if (showFAB && fabRef.current) {
    const firstButton = fabRef.current.querySelector('button');
    firstButton?.focus();
  }
}, [showFAB]);
```

---

### 4.2 HIGH: Missing ARIA Labels on Interactive Elements
**Severity:** HIGH | **Priority:** P1

**Locations:**
- `/Users/agustinmoren0/rocket-app/app/components/HabitCheckbox.tsx` - No aria-label
- `/Users/agustinmoren0/rocket-app/app/components/CircularProgress.tsx` - SVG not accessible
- `/Users/agustinmoren0/rocket-app/app/components/TopBar.tsx` - Icon buttons no labels
- `/Users/agustinmoren0/rocket-app/app/components/BottomNav.tsx` - Navigation items have text but buttons unlabeled

**Issues Found:**
```tsx
// HabitCheckbox - button has no accessible name
<motion.button
  whileTap={{ scale: 0.9 }}
  onClick={handleToggle}
  className={`relative w-8 h-8 ...`}
>
  {/* No aria-label, no title */}
</motion.button>

// CircularProgress - percentage not announced
<svg className="w-full h-full">
  <circle ... />
</svg>
<span>{percentage}%</span>
```

**Impact:**
- Screen reader users don't know what buttons do
- SVGs not described to assistive tech
- No semantic HTML

---

### 4.3 HIGH: Color Contrast Issues in Dark Mode
**Severity:** HIGH | **Priority:** P1

**Location:** `/Users/agustinmoren0/rocket-app/app/globals.css` (lines 192-320)

**Issues Found:**
```css
/* Dark mode colors - potential contrast issues */
--text-tertiary: #71717a;  /* Gray on dark background - may fail WCAG AA */
--text-secondary: #a1a1aa; /* Better but still borderline */

/* Some light colors on light backgrounds */
.text-slate-400 { color: var(--text-tertiary); }
/* On light backgrounds this might fail contrast */
```

**Recommendation:**
- Test with WebAIM contrast checker
- Ensure minimum 4.5:1 for normal text
- Ensure 3:1 for large text

---

### 4.4 MEDIUM: No Alt Text for Decorative Elements
**Severity:** MEDIUM | **Priority:** P2

**Locations:**
- `/Users/agustinmoren0/rocket-app/app/app/page.tsx` (lines 146-150) - Decorative blobs
- `/Users/agustinmoren0/rocket-app/app/app/onboarding/page.tsx` - Decorative elements
- `/Users/agustinmoren0/rocket-app/public/icons/` - SVG icons in manifest

**Issues Found:**
```tsx
// No alt text, no role=presentation
<div className="absolute -top-20 -left-20 w-80 h-80 bg-[#FF99AC]/30 rounded-full filter blur-3xl opacity-60 animate-float" />

// SVG emoji icons
<span className="text-xl">🌸</span>  // OK - emoji fine
<Edit3 className="w-8 h-8 text-[#FF8C66]" />  // Missing aria-label
```

---

## 5. ERROR HANDLING & EDGE CASES

### 5.1 CRITICAL: No Error Boundary for React Errors
**Severity:** CRITICAL | **Priority:** P0

**Location:** Missing from entire app

**Issues Found:**
```tsx
// No Error Boundary component exists
// If any component crashes, entire page crashes
// Users see blank screen or browser error

// Examples that could crash:
// - JSON.parse() with corrupted localStorage
// - Division by zero in calculations
// - Accessing null properties
```

**Recommendation:**
```tsx
// Create app/components/ErrorBoundary.tsx
class ErrorBoundary extends React.Component {
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App error:', error, errorInfo);
    this.setState({ hasError: true, error });
  }

  render() {
    if (this.state?.hasError) {
      return (
        <div className="...">
          <h1>Algo salió mal</h1>
          <button onClick={() => window.location.reload()}>Recargar</button>
        </div>
      );
    }
    return this.props.children;
  }
}
```

---

### 5.2 HIGH: Corrupted LocalStorage Not Handled Gracefully
**Severity:** HIGH | **Priority:** P1

**Locations:**
- `/Users/agustinmoren0/rocket-app/app/lib/store.ts` (lines 177-198)
- `/Users/agustinmoren0/rocket-app/app/lib/streakLogic.ts` (lines 36-42)
- All components that use localStorage

**Issues Found:**
```tsx
// store.ts - Generic recovery
try {
  const data: UserData = JSON.parse(stored);
} catch {
  return initData();  // Silent data loss!
}

// If corrupted localStorage, user loses:
// - All habits
// - All completions
// - All activities
// - All reflections

// No backup, no warning, no recovery
```

**Problems:**
1. User loses data silently
2. No warning about corruption
3. No recovery option
4. Data loss without user knowledge

**Recommendation:**
```tsx
try {
  const data = JSON.parse(stored);
  return data;
} catch (error) {
  console.error('Corrupted localStorage:', error);
  
  // Try to restore from backup
  const backup = localStorage.getItem('rocket.data.backup');
  if (backup) {
    try {
      return JSON.parse(backup);
    } catch {}
  }
  
  // Show warning to user
  showToast('Se detectó corrupción en datos. Se restauró última copia conocida.', 'warn');
  return initData();
}
```

---

### 5.3 HIGH: No Validation of Cycle Data Consistency
**Severity:** HIGH | **Priority:** P1

**Location:** `/Users/agustinmoren0/rocket-app/app/context/CycleContext.tsx`

**Issues Found:**
```tsx
// No validation that:
// periodLengthDays < cycleLengthDays
// cycleLengthDays > 0
// lastPeriodStart is valid date
// Date arithmetic might fail

// Could cause:
// - Phase calculations wrong
// - Negative days
// - Wrong fertility window
// - NaN values in UI

const activateCycleMode = (lastPeriod: string, cycleLength: number, periodLength: number) => {
  // Should validate:
  if (cycleLength <= 0 || periodLength <= 0 || periodLength >= cycleLength) {
    throw new Error('Invalid cycle parameters');
  }
  if (isNaN(new Date(lastPeriod).getTime())) {
    throw new Error('Invalid date');
  }
```

---

### 5.4 MEDIUM: Race Conditions in Habit Updates
**Severity:** MEDIUM | **Priority:** P2

**Locations:**
- `/Users/agustinmoren0/rocket-app/app/components/HabitCheckbox.tsx` (lines 29-69)
- `/Users/agustinmoren0/rocket-app/app/app/habitos/page.tsx`

**Issues Found:**
```tsx
const handleToggle = async () => {
  const completions = JSON.parse(localStorage.getItem('habika_completions') || '{}');
  // Fetch data
  
  // If another tab updates habit simultaneously:
  // This data is now stale
  // Both updates overwrite each other
  
  completions[habitId] = updated;
  localStorage.setItem('habika_completions', JSON.stringify(completions));
  // No conflict resolution
};
```

**Problems:**
1. Multiple tabs can corrupt data
2. No locking mechanism
3. No last-write-wins strategy
4. Completions can be lost

**Note:** This affects multi-tab scenarios where user has HABIKA open on phone and desktop simultaneously.

---

## 6. MOBILE/PWA SPECIFIC ISSUES

### 6.1 CRITICAL: Service Worker Cache Strategy Inefficient
**Severity:** CRITICAL | **Priority:** P0

**Location:** `/Users/agustinmoren0/rocket-app/public/sw.js` (lines 43-102)

**Issues Found:**
```javascript
// Problem 1: Network First then falls back to cache
event.respondWith(
  fetch(request)
    .then((response) => {
      // Cache successful response
      if (response && response.status === 200) {
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          if (request.mode === 'navigate') {
            cache.put(request, responseToCache);
          }
        });
      }
      return response;
    })
    .catch(() => {
      // Only cache fallback on error
      // If network is slow, user waits forever
    })
);

// Problem 2: Dynamic pages cached forever
// If user goes to /app/habitos, it caches the entire page
// Next offline visit shows stale data from days ago

// Problem 3: Missing cache versions
// CACHE_NAME = 'habika-v4' but no version bump on code changes
```

**Problems:**
1. **Slow offline experience** - Waits for network first
2. **Stale data** - Caches pages with old data
3. **No cache invalidation** - Old data served forever
4. **Cache bloat** - Every page URL cached separately

**Impact:**
- App feels slow (waits for network)
- Users see outdated information
- Cache grows indefinitely

**Recommendation:**
```javascript
// Stale-while-revalidate pattern
event.respondWith(
  caches.match(request).then((cachedResponse) => {
    const fetchPromise = fetch(request).then((response) => {
      // Cache response for next time
      const responseToCache = response.clone();
      caches.open(CACHE_NAME).then((cache) => {
        cache.put(request, responseToCache);
      });
      return response;
    });
    
    // Return cached if available, else wait for fetch
    return cachedResponse || fetchPromise;
  })
);
```

---

### 6.2 CRITICAL: No PWA Installation Guidance
**Severity:** CRITICAL | **Priority:** P0

**Location:** Missing from app

**Issues Found:**
```tsx
// App has PWA manifest but:
// - No install prompt handling
// - No "Install App" button
// - No A2HS (Add to Home Screen) guidance
// - Users don't know app is installable

// manifest.json exists but:
// - No beforeinstallprompt event handler
// - No install button shown
// - No onappinstalled event handling
```

**Problems:**
1. Users don't know app can be installed
2. Missed opportunity for offline access
3. No way to trigger install prompt
4. No tracking of installations

**Recommendation:**
```tsx
// Create InstallPrompt component
const InstallButton = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstall(true);
    });
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`App install ${outcome}`);
  };

  return showInstall ? <button onClick={handleInstall}>Instalar App</button> : null;
};
```

---

### 6.3 HIGH: No Offline-First Strategy
**Severity:** HIGH | **Priority:** P1

**Location:** App-wide architecture issue

**Issues Found:**
```tsx
// Current approach:
// 1. Try to load from network
// 2. Fall back to cache if network fails
// 3. Show offline indicator

// Problems:
// - On slow 3G, waits 30+ seconds
// - No optimistic updates
// - Form submissions fail offline
// - No offline queue for syncing

// Example - adding activity:
const handleAdd = async () => {
  const activity = { ... };
  localStorage.setItem('habika_activities_today', JSON.stringify(...));
  // This works offline, good!
  // But no way to sync later if user had network error
};
```

**Missing Features:**
1. Offline activity queue
2. Sync on reconnection
3. Conflict resolution
4. Optimistic UI updates

---

### 6.4 HIGH: Input Font Size Doesn't Prevent iOS Zoom
**Severity:** HIGH | **Priority:** P1

**Location:** `/Users/agustinmoren0/rocket-app/app/globals.css` (lines 410-422)

**Issues Found:**
```css
/* Correct - sets font-size 16px to prevent zoom */
input[type="text"],
input[type="email"],
input[type="password"],
input[type="date"],
input[type="tel"],
input[type="number"],
textarea,
select {
  font-size: 16px !important;
  -webkit-appearance: none;
  appearance: none;
}

/* HOWEVER: Bootstrap/Tailwind might override this */
/* Some inputs might still have smaller font-size from Tailwind classes */
/* Users might still experience zoom on iOS */
```

**Issue:** If any input has a CSS class that sets font-size < 16px, iOS will zoom on focus.

**Recommendation:**
```tsx
// In ChangeNameModal and all input forms:
<input
  type="text"
  className="text-base"  // Ensure base font size
  style={{ fontSize: '16px' }}  // Force 16px
/>
```

---

### 6.5 MEDIUM: Missing Safe Area Support on Notched Devices
**Severity:** MEDIUM | **Priority:** P2

**Location:** `/Users/agustinmoren0/rocket-app/app/globals.css` (lines 44-59)

**Issues Found:**
```css
/* Safe area utilities defined but not used everywhere */
.pt-safe { padding-top: max(0.75rem, env(safe-area-inset-top)); }
.pb-safe { padding-bottom: max(0.75rem, env(safe-area-inset-bottom)); }

/* But many components don't use pt-safe */
/* Example: TopBar uses fixed positioning without safe area */
```

**Problems:**
1. Content hidden under notches on iPhone X+
2. Content hidden under status bar on Android
3. Bottom nav can be hidden by gestures on iPhone

**Locations missing safe area:**
- `/Users/agustinmoren0/rocket-app/app/components/TopBar.tsx` - Fixed top bar
- `/Users/agustinmoren0/rocket-app/app/components/BottomNav.tsx` - Uses pb-safe (good!)
- Dashboard header - Uses pt-safe (good!)

---

## 7. DATA PERSISTENCE & STATE MANAGEMENT

### 7.1 HIGH: Multiple State Management Patterns Mixed
**Severity:** HIGH | **Priority:** P1

**Locations:**
- React Context (ThemeContext, UserContext, CycleContext)
- localStorage (store.ts functions)
- localStorage (individual keys like 'habika_custom_habits')
- Local component state (useState)

**Issues Found:**
```tsx
// Different patterns for different data:
// Theme: Context + localStorage + THEMES object
// User: Context + localStorage
// Cycle: Context + localStorage
// Habits: localStorage directly + some context usage
// Activities: localStorage directly

// This causes:
// - Duplicate data (in memory and localStorage)
// - Sync issues between Context and localStorage
// - No single source of truth
// - Hard to track state flow

// Example: User updates name in ChangeNameModal
const handleSave = () => {
  const data = loadData();  // From store.ts (fresh parse)
  data.name = trimmed;
  saveData(data);  // Saves to localStorage
  window.location.reload();  // Forces reload to update Context
  
  // Better: setUsername(trimmed) would update Context
  // Then Context would sync to localStorage
};
```

**Problems:**
1. Data duplication
2. Sync issues
3. Unclear flow
4. Difficult to add features

**Recommendation:**
- Decide: Use Context OR localStorage as source of truth
- If using Context: persist to localStorage on changes
- If using localStorage: load in Context and subscribe to changes
- OR use a state management library (Redux, Zustand, Jotai)

---

### 7.2 HIGH: No Data Versioning Strategy
**Severity:** HIGH | **Priority:** P1

**Locations:**
- `/Users/agustinmoren0/rocket-app/app/lib/store.ts` (lines 156-198)
- All localStorage keys

**Issues Found:**
```tsx
// Current migration approach:
export function loadData(): UserData {
  const data = JSON.parse(stored);
  
  // Migrations
  if (!data.theme) data.theme = 'lavender';
  if (data.zenMode === undefined) data.zenMode = false;
  
  // This only works while code is in-sync with data
  // If you add new features:
  // - Old users have missing properties
  // - No version tracking
  // - Hard to make breaking changes
}

// Example: What if you add a new field "preferences.notifications"?
// Old data doesn't have it - causes bugs

// What if you rename "habika_custom_habits" to "habits"?
// Old users still have old key - data lost
```

**Problems:**
1. No version tracking
2. Difficult migrations
3. No rollback strategy
4. Risk of data loss

**Recommendation:**
```tsx
interface StorageVersion {
  version: number;  // Add version number
  data: UserData;
}

const CURRENT_VERSION = 2;

export function loadData(): UserData {
  const stored = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(stored || '{}');
  
  // Handle different versions
  if (data.version === 1) {
    // Migrate from v1 to v2
    data = migrateV1toV2(data);
  }
  
  data.version = CURRENT_VERSION;
  return data;
}
```

---

### 7.3 HIGH: No Data Backup/Recovery Strategy
**Severity:** HIGH | **Priority:** P1

**Locations:**
- `/Users/agustinmoren0/rocket-app/app/lib/store.ts` - `clearAllData()` function (line 356)
- No backup mechanism

**Issues Found:**
```tsx
export function clearAllData() {
  // Clears 15+ localStorage keys
  // No backup created
  // No confirmation dialog
  // No recovery option
  // Data lost forever
}

// Also no:
// - Periodic backups
// - Export functionality
// - Recovery from cloud
// - Last good state saved
```

**Problems:**
1. Users can accidentally delete all data
2. No recovery option
3. Data is only on device
4. Lost if device breaks

**Recommendation:**
```tsx
export function clearAllData() {
  // Create backup first
  const backup = {
    timestamp: new Date().toISOString(),
    data: loadData(),
  };
  localStorage.setItem('rocket.data.backup', JSON.stringify(backup));
  
  // Then confirm with user
  const confirmed = window.confirm(
    'Esta acción eliminará todos tus datos. ¿Estás seguro?\n\n' +
    'Se creó una copia de seguridad.'
  );
  
  if (!confirmed) return;
  
  // Clear data
}

// Add export function
export function exportData() {
  const data = loadData();
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `habika-backup-${new Date().toISOString()}.json`;
  a.click();
}
```

---

### 7.4 MEDIUM: No Data Expiration/Cleanup
**Severity:** MEDIUM | **Priority:** P2

**Locations:**
- `/Users/agustinmoren0/rocket-app/app/lib/store.ts`
- Calendar storage grows unbounded

**Issues Found:**
```tsx
// LocalStorage growth:
// Calendar stores every activity/habit forever
// Activities stored indefinitely
// Reflections accumulate
// No cleanup mechanism

// Example - calendar can contain:
// 365 days × multiple activities/habits = thousands of entries
// Each entry parsed on every page load

// After 2 years of use:
// localStorage might hit browser limits (5-10MB)
// Performance degrades
// Sync becomes slow
```

**Problems:**
1. Unbounded growth
2. Performance degradation
3. Hit localStorage limits
4. No cleanup strategy

**Recommendation:**
```tsx
export function cleanupOldData(daysToKeep: number = 365) {
  const calendar = JSON.parse(localStorage.getItem('habika_calendar') || '{}');
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
  
  let deletedDays = 0;
  for (const dateStr in calendar) {
    if (new Date(dateStr) < cutoffDate) {
      delete calendar[dateStr];
      deletedDays++;
    }
  }
  
  localStorage.setItem('habika_calendar', JSON.stringify(calendar));
  console.log(`Cleaned up ${deletedDays} days of old data`);
}

// Call on app startup
useEffect(() => {
  cleanupOldData();
}, []);
```

---

## 8. ANIMATION/TRANSITION ISSUES

### 8.1 CRITICAL: Animations Don't Respect prefers-reduced-motion
**Severity:** CRITICAL | **Priority:** P0

**Location:**
- `/Users/agustinmoren0/rocket-app/app/globals.css` (lines 3-13) - Good! Has prefers-reduced-motion media query
- **BUT** Framer Motion animations ignore it

**Issues Found:**
```css
/* globals.css - Good implementation */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

/* HOWEVER: Framer Motion animations defined in components */
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  // Ignores prefers-reduced-motion!
/>
```

**Problems:**
1. Users with vestibular disorders experience motion sickness
2. Users with photosensitivity can have seizures
3. Many users prefer reduced motion for accessibility
4. App is not compliant with WCAG 2.1 Level AAA

**Impact:**
- Accessibility violation
- Medical risk to users
- WCAG non-compliance

**Recommendation:**
```tsx
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

<motion.div
  initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
  animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
  transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.3 }}
/>
```

---

### 8.2 HIGH: Confetti Not Disabled for Accessibility
**Severity:** HIGH | **Priority:** P1

**Location:** `/Users/agustinmoren0/rocket-app/app/lib/confetti.ts`

**Issues Found:**
```tsx
// Confetti triggers automatically on habit completion
export const triggerSuccess = () => {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#10b981', '#34d399', '#6ee7b7'],
  });
};

// No check for prefers-reduced-motion
// Users with photosensitivity or motion sensitivity disabled
```

**Recommendation:**
```tsx
export const triggerSuccess = () => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;  // Don't show confetti for users with reduced motion preference
  }
  
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#10b981', '#34d399', '#6ee7b7'],
  });
};
```

---

### 8.3 MEDIUM: Animation Performance on Low-End Devices
**Severity:** MEDIUM | **Priority:** P2

**Location:** Multiple components with animations

**Issues Found:**
```tsx
// GPU animations not optimized
<motion.div
  animate={{ opacity: 1 }}  // Will rasterize
  transition={{ duration: 0.5 }}
/>

// Better:
<motion.div
  animate={{ x: 0 }}  // GPU-accelerated
  transition={{ duration: 0.5 }}
/>
```

**Problems:**
1. opacity/color animations are CPU-intensive
2. No will-change hints
3. No transform-based animations
4. Low-end devices drop frames

---

## Summary Table

| # | Issue | Severity | Priority | File(s) | Estimate |
|---|-------|----------|----------|---------|----------|
| 1.1 | Unused exports/dead code | CRITICAL | P0 | register-sw.tsx, useTheme.ts | 30m |
| 1.2 | Missing useCallback deps | HIGH | P1 | calendario/page.tsx | 45m |
| 1.3 | Unsafe type assertions | HIGH | P1 | Multiple files | 4h |
| 1.4 | No input validation | HIGH | P1 | ChangeNameModal, CycleContext | 2h |
| 1.5 | Inconsistent error handling | MEDIUM | P2 | store.ts, streakLogic.ts | 2h |
| 2.1 | Excessive localStorage polling | CRITICAL | P0 | app/page.tsx | 1.5h |
| 2.2 | Framer Motion animations | CRITICAL | P0 | Multiple | 3h |
| 2.3 | No image optimization | HIGH | P1 | public/icons/ | 1h |
| 2.4 | Unoptimized serialization | HIGH | P1 | store.ts, calendario | 2h |
| 2.5 | SW update frequency | MEDIUM | P2 | register-sw.tsx | 30m |
| 3.1 | Flash/flicker on load | CRITICAL | P0 | RootLayoutContent, app/layout | 1h |
| 3.2 | Confusing nav flow | HIGH | P1 | Onboarding | 2h |
| 3.3 | Modal accessibility | HIGH | P1 | ChangeNameModal | 1h |
| 3.4 | No loading states | HIGH | P1 | Multiple pages | 3h |
| 3.5 | Poor empty states | MEDIUM | P2 | Multiple pages | 2h |
| 4.1 | No focus management | CRITICAL | P0 | BottomNav, forms | 2h |
| 4.2 | Missing ARIA labels | HIGH | P1 | Multiple | 2h |
| 4.3 | Contrast issues | HIGH | P1 | globals.css | 1h |
| 4.4 | Missing alt text | MEDIUM | P2 | Multiple | 1h |
| 5.1 | No error boundary | CRITICAL | P0 | App-wide | 2h |
| 5.2 | Corrupted localStorage | HIGH | P1 | store.ts | 1h |
| 5.3 | No cycle validation | HIGH | P1 | CycleContext | 1h |
| 5.4 | Race conditions | MEDIUM | P2 | HabitCheckbox | 2h |
| 6.1 | Cache strategy | CRITICAL | P0 | sw.js | 2h |
| 6.2 | No PWA install UX | CRITICAL | P0 | App-wide | 1.5h |
| 6.3 | No offline-first | HIGH | P1 | Architecture | 8h |
| 6.4 | Input zoom on iOS | HIGH | P1 | globals.css | 1h |
| 6.5 | Safe area support | MEDIUM | P2 | TopBar | 1h |
| 7.1 | Mixed state patterns | HIGH | P1 | Architecture | 6h |
| 7.2 | No data versioning | HIGH | P1 | store.ts | 3h |
| 7.3 | No backup/recovery | HIGH | P1 | store.ts | 2h |
| 7.4 | No data cleanup | MEDIUM | P2 | store.ts | 2h |
| 8.1 | Ignore prefers-reduced-motion | CRITICAL | P0 | confetti.ts, animations | 1.5h |
| 8.2 | Confetti accessibility | HIGH | P1 | confetti.ts | 30m |
| 8.3 | Animation performance | MEDIUM | P2 | Multiple | 2h |

---

## Priority Roadmap

### Phase 1: Critical Fixes (1-2 weeks)
1. Fix excessive localStorage polling (2.1)
2. Add Error Boundary (5.1)
3. Fix cache strategy (6.1)
4. Fix prefers-reduced-motion handling (8.1)
5. Fix flash on page load (3.1)
6. Fix focus management (4.1)
7. Add PWA install prompt (6.2)

### Phase 2: High Priority (2-3 weeks)
1. Add input validation (1.4)
2. Remove animations from non-critical paths (2.2)
3. Add modal accessibility (3.3)
4. Add loading states (3.4)
5. Add ARIA labels (4.2)
6. Validate cycle data (5.3)
7. Type safety - replace `any` types (1.3)

### Phase 3: Medium Priority (1 month)
1. Improve error handling (1.5)
2. Optimize serialization (2.4)
3. Clean up data (7.4)
4. Improve empty states (3.5)
5. Add data backup (7.3)

---

## Quick Wins (< 1 hour each)

1. Remove unused imports and exports
2. Disable LogViewer in production
3. Increase SW update interval
4. Fix pt-safe on TopBar
5. Add ARIA labels to icon buttons
6. Validate cycle lengths
7. Add prefers-reduced-motion to confetti
8. Add focus management to FAB menu

