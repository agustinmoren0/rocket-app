# Vercel Deployment Guide for Rocket App (HABIKA)

## Overview
This guide explains how to deploy the Rocket App with Supabase integration to Vercel.

## Prerequisites
- GitHub repository connected to Vercel
- Supabase project set up with credentials
- Environment variables configured

## Step 1: Configure Environment Variables on Vercel

### What You Need
From your Supabase project, you need:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key

### How to Add Them

1. **Go to Vercel Dashboard**
   - Visit https://vercel.com/dashboard
   - Select your project (rocket-app)

2. **Open Project Settings**
   - Click "Settings" tab
   - Navigate to "Environment Variables" section

3. **Add Variables**
   - Click "Add New"
   - For each variable:
     - **Name**: `NEXT_PUBLIC_SUPABASE_URL`
     - **Value**: (paste your Supabase URL)
     - **Environments**: Select "Production", "Preview", "Development"
     - Click "Save"

   - Repeat for `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Getting Your Credentials

1. Go to https://supabase.com
2. Select your project
3. Click "Settings" → "API"
4. Copy:
   - **Project URL** → use for `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → use for `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Step 2: Redeploy Your Project

After adding environment variables:

1. Go back to Vercel dashboard
2. Click "Deployments"
3. Find your latest deployment
4. Click the three-dot menu
5. Select "Redeploy"

Wait for the deployment to complete (usually 2-3 minutes).

## Step 3: Verify the Deployment

### Check Build Status
- ✓ Build should complete successfully
- ✓ No errors during "npm run build"
- ✓ All 19 pages should be generated

### Test Authentication Features
1. Open your Vercel deployment URL
2. Navigate to Profile (`/app/perfil`)
3. You should see "Cuenta SUPABASE" section with:
   - ☁️ "Crear cuenta" button (for new users)
   - "Iniciar sesión" button (for existing users)
4. Test signup/login flow

### Monitor Logs
1. In Vercel dashboard
2. Click "Deployments" → Select deployment
3. Click "View Function Logs"
4. Check for any errors

## Step 4: Important Notes

### Environment Variable Behavior
- **Local Development** (npm run dev):
  - Uses `.env.local` file
  - Credentials should be in this file (it's in .gitignore)

- **Vercel Production**:
  - Uses environment variables from Vercel settings
  - Never commit `.env.local` to Git
  - App gracefully degrades without Supabase (offline mode only)

### Security Best Practices
✓ Never commit `.env.local` to Git
✓ Never share your Supabase anon key publicly
✓ Use `NEXT_PUBLIC_` prefix only for keys meant to be public
✓ Service role keys should NEVER be exposed in frontend

### Fallback Behavior
If Supabase environment variables are missing:
- App still loads and works
- All local features function normally (habits, activities, etc.)
- Cloud sync features show warning and won't work
- This is intentional for resilience

## Troubleshooting

### Deployment Still Fails
1. Check Vercel build logs for specific errors
2. Verify environment variables are correctly set
3. Ensure variable names match exactly:
   - `NEXT_PUBLIC_SUPABASE_URL` (not `SUPABASE_URL`)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (not `SUPABASE_KEY`)

### Login/Signup Not Working
1. Verify Supabase project is active and accessible
2. Check that authentication is enabled in Supabase
3. Check browser console for error messages
4. Verify credentials are correct in Vercel environment

### Build Warnings About Metadata
- These are non-critical warnings about Next.js metadata
- App functions normally despite warnings
- Can be fixed in future updates

## Common Environment Variable Names

| Variable | What It Is | Where to Find |
|----------|-----------|---------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Supabase → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public API key | Supabase → Settings → API → anon public |

## Next Steps

1. ✓ Add environment variables to Vercel
2. ✓ Redeploy the project
3. ✓ Test authentication features
4. ✓ Monitor logs for any issues
5. Share the Vercel URL with team for testing

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Check browser console (F12 → Console tab)
3. Verify Supabase project is healthy
4. Contact Vercel support if infrastructure issue

---

**Version**: 1.0
**Last Updated**: 2025-11-11
**Status**: ✅ Ready for Production
