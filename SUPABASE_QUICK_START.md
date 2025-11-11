# SUPABASE QUICK START GUIDE

**Purpose:** Step-by-step guide to begin Supabase integration
**Time to Read:** 10 minutes
**Complexity:** Beginner-friendly

---

## STEP 1: Create Supabase Project (5 minutes)

### 1.1 Sign up / Sign in
1. Go to https://supabase.com
2. Click "Start your project"
3. Sign up with email or GitHub
4. Create a new organization (or use existing)

### 1.2 Create a new project
1. Click "New Project"
2. **Project Name:** `rocket-app` (or similar)
3. **Database Password:** Generate strong password (save it!)
4. **Region:** Select closest to your users (e.g., us-east-1 for US)
5. Click "Create new project"
6. **Wait for database to spin up** (~2 minutes)

### 1.3 Get your API keys
Once project is created:
1. Go to Settings → API
2. Copy these values:
   ```
   NEXT_PUBLIC_SUPABASE_URL: https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY: eyJxxx... (long key)
   SUPABASE_SERVICE_ROLE_KEY: eyJxxx... (backend only - save separately)
   ```

---

## STEP 2: Setup Environment Variables (2 minutes)

Create `.env.local` in project root:

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx... (optional, backend only)
```

**Important:**
- Never commit `.env.local` (add to `.gitignore`)
- NEXT_PUBLIC_* variables are exposed to client
- Service role key must never be in client code

---

## STEP 3: Install Dependencies (2 minutes)

```bash
# Install Supabase JavaScript client
npm install @supabase/supabase-js

# Optional: Install TypeScript types
npm install --save-dev @types/postgres
```

---

## STEP 4: Create Supabase Client (5 minutes)

Create `app/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Type definitions for database
export type Database = {
  public: {
    Tables: {
      // Add table types here as you create them
    }
  }
}
```

---

## STEP 5: Create Database Tables (10-15 minutes)

In Supabase Dashboard:

### 5.1 Go to SQL Editor
1. Left sidebar → "SQL Editor"
2. Click "New Query"
3. Paste the SQL schema from `SUPABASE_INTEGRATION_PLAN.md`
4. Run the query

### 5.2 Wait for tables to be created
Check "Tables" in left sidebar to verify:
- ✅ user_profiles
- ✅ habits
- ✅ habit_completions
- ✅ activities
- ✅ cycle_data
- ✅ reflections
- ✅ user_settings
- ✅ sync_logs

---

## STEP 6: Enable Authentication (5 minutes)

In Supabase Dashboard:

### 6.1 Setup Email Provider
1. Left sidebar → Authentication → Providers
2. Make sure "Email" is enabled
3. Click on Email provider
4. Confirm settings (default is usually fine)

### 6.2 Configure Redirects (Important!)
1. Authentication → URL Configuration
2. **Redirect URLs:**
   - Add: `http://localhost:3000/auth/callback` (development)
   - Add: `https://yourapp.com/auth/callback` (production)
3. Click Save

### 6.3 (Optional) Setup Google OAuth
1. Get Google OAuth credentials from Google Cloud Console
2. Add Client ID and Client Secret to Supabase
3. Enable in Providers

---

## STEP 7: Test Connection (5 minutes)

Create a test file `app/lib/__tests__/supabase.test.ts`:

```typescript
import { supabase } from '../supabase'

// Test 1: Can we connect?
async function testConnection() {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('count(*)')
    .limit(1)

  if (error) {
    console.error('❌ Connection failed:', error)
    return false
  }

  console.log('✅ Connected to Supabase!')
  return true
}

// Run test
testConnection()
```

Run test:
```bash
npx ts-node app/lib/__tests__/supabase.test.ts
```

Expected output:
```
✅ Connected to Supabase!
```

---

## STEP 8: Verify Builds Still Work (5 minutes)

```bash
# Rebuild project
npm run build

# Start dev server
npm run dev

# Visit http://localhost:3000
# Check browser console for errors
```

Expected:
```
✅ Compiled successfully in X.Xs
```

---

## NEXT STEPS

Once you've completed all 8 steps above:

1. **✅ Done?** Create a simple form to test auth
2. **✅ Next:** Create AuthContext for authentication
3. **✅ Then:** Create login/signup forms
4. **✅ Then:** Begin migrating habits data
5. **✅ Finally:** Migrate other modules

---

## TROUBLESHOOTING

### "Missing Supabase environment variables"
- Check `.env.local` exists in project root
- Restart dev server after creating `.env.local`
- Verify keys are copied exactly (no extra spaces)

### "Connection refused" error
- Check internet connection
- Verify Supabase project is running (check dashboard)
- Try accessing Supabase dashboard directly

### "Unauthorized" error
- Check API key is correct
- Verify table has no row-level security (RLS) policies yet
- Check user permissions in Supabase

### Port 3000 already in use
```bash
# Kill existing process
lsof -ti:3000 | xargs kill -9

# Then start again
npm run dev
```

### Build fails with TypeScript errors
- Run `npm install` to ensure all dependencies installed
- Check that `.env.local` is in `.gitignore`
- Delete `node_modules` and `.next` folder, run `npm install` again

---

## SECURITY CHECKLIST

Before going to production:

- [ ] `.env.local` is in `.gitignore`
- [ ] Service role key NOT in client code
- [ ] Row-level security (RLS) policies setup on tables
- [ ] Authentication routes protected
- [ ] HTTPS configured
- [ ] Database backups enabled
- [ ] Rate limiting configured
- [ ] API rate limits set

---

## USEFUL LINKS

- [Supabase Dashboard](https://app.supabase.com)
- [Supabase Docs](https://supabase.com/docs)
- [JavaScript Reference](https://supabase.com/docs/reference/javascript)
- [Auth Guide](https://supabase.com/docs/guides/auth)
- [Realtime Subscriptions](https://supabase.com/docs/guides/realtime)

---

## CHECKPOINT SUMMARY

After completing this guide, you should have:

✅ Supabase project created
✅ Database tables setup
✅ Environment variables configured
✅ Client library installed
✅ Connection tested
✅ Authentication enabled
✅ Build working

**Status:** Ready to start Phase 1 implementation! 🚀

---

**Guide created:** 2025-11-11
**Last updated:** Ready for use
