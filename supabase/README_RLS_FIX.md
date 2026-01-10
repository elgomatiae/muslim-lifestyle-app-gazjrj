# Fixing "Could not find the table" Error

## Problem
You're seeing this error:
```
Could not find the table 'public.lectures' in the schema cache
```

## Root Cause
This happens when:
1. **RLS is enabled** on a table but **no policies exist** - PostgREST can't see the table
2. **PostgREST schema cache is stale** - The cache hasn't refreshed after table creation
3. **Table permissions** - The `anon` role doesn't have permission to see the table

## Solutions (Try in Order)

### Solution 1: Fix RLS Policies (Recommended)
Run `fix_rls_policies.sql` in your Supabase SQL Editor. This will:
- Verify tables exist
- Disable RLS temporarily
- Create public read policies
- Re-enable RLS with policies in place

**This is the recommended approach for production.**

### Solution 2: Disable RLS Completely (Development Only)
If Solution 1 doesn't work, run `alternative_fix_no_rls.sql`:
- Completely disables RLS on all content tables
- Allows full public access (use only for testing)

**⚠️ WARNING: This removes all security. Only use for development!**

### Solution 3: Refresh PostgREST Schema Cache
Sometimes PostgREST's schema cache needs to be refreshed. To do this:

1. Go to your Supabase Dashboard
2. Navigate to **Settings** → **API**
3. Look for **Schema Cache** or **PostgREST**
4. Click **Refresh Schema Cache** or **Reload Schema**

Alternatively, restart your Supabase project (this will refresh the cache).

### Solution 4: Verify Tables Exist
Run `verify_tables.sql` to check:
- If tables exist in the `public` schema
- Current RLS status
- Existing policies
- Try direct queries

## Step-by-Step Instructions

1. **First, verify tables exist:**
   ```sql
   -- Run verify_tables.sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name IN ('quran_verses', 'hadiths', 'lectures', 'recitations');
   ```

2. **If tables exist, run the fix:**
   - For production: Run `fix_rls_policies.sql`
   - For development: Run `alternative_fix_no_rls.sql`

3. **Refresh PostgREST cache:**
   - Restart your Supabase project, OR
   - Use Supabase Dashboard to refresh schema cache

4. **Test the app:**
   - Try fetching lectures, recitations, or daily content
   - Check console logs for any remaining errors

## Common Issues

### Issue: "Table still not found after running scripts"
**Solution:** 
- Make sure you ran the scripts in the Supabase SQL Editor (not locally)
- Restart your Supabase project to refresh schema cache
- Check if tables actually exist with `verify_tables.sql`

### Issue: "Permission denied" errors
**Solution:**
- Run `fix_rls_policies.sql` to create proper policies
- Make sure policies grant access to `anon` and `authenticated` roles

### Issue: "RLS policies exist but still can't access"
**Solution:**
- Check policy conditions - make sure `USING (true)` is present
- Verify policies are enabled (check `pg_policies` view)
- Try disabling and re-enabling RLS

## Verification Queries

After running the fix, verify it worked:

```sql
-- Check RLS status
SELECT tablename, rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('lectures', 'recitations', 'quran_verses', 'hadiths');

-- Check policies exist
SELECT tablename, policyname, cmd, roles
FROM pg_policies
WHERE tablename IN ('lectures', 'recitations', 'quran_verses', 'hadiths');

-- Test query (should work now)
SELECT COUNT(*) FROM public.lectures;
SELECT COUNT(*) FROM public.recitations;
```

## Need More Help?

If none of these solutions work:
1. Check Supabase logs for more details
2. Verify your Supabase project is active
3. Check if you're using the correct project URL and API key
4. Contact Supabase support if the issue persists
