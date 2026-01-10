# 🚨 URGENT FIX: "Could not find the table 'public.lectures'"

## The Problem
PostgREST can see `video_categories` but NOT `lectures`. This means:
- PostgREST is working ✅
- The `lectures` table exists ✅ (you showed us the schema)
- But PostgREST's schema cache doesn't include `lectures` ❌

## The Solution (Do This Now)

### Step 1: Run the Force Fix Script
Open `force_fix_all_tables.sql` in your Supabase SQL Editor and run the **ENTIRE** script.

This will:
- Disable RLS on all tables
- Drop all blocking policies
- Grant explicit SELECT permissions
- Verify everything is set up correctly

### Step 2: RESTART YOUR SUPABASE PROJECT ⚠️ CRITICAL ⚠️
**This is the most important step!** PostgREST's schema cache won't refresh until you restart.

1. Go to your Supabase Dashboard
2. Click on **Settings** (gear icon)
3. Scroll to **General** section
4. Click **Pause Project**
5. Wait 10-15 seconds
6. Click **Resume Project**
7. Wait 1-2 minutes for full restart

### Step 3: Test
After restart, test your app. The error should be gone.

## Why This Happens

PostgREST maintains a schema cache. When:
- RLS is enabled but no policies exist
- Permissions aren't granted properly
- Tables are created/modified

PostgREST's cache can get out of sync. **Restarting forces a cache refresh.**

## Alternative: If Restart Doesn't Work

If restarting doesn't work, the table might not actually exist in your Supabase instance:

1. Run this in SQL Editor to verify:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'lectures';
```

2. If it returns no rows, the table doesn't exist - you need to create it
3. If it returns a row, then it's definitely a cache/permission issue

## Quick Test Query

After running the fix and restarting, test this in SQL Editor:
```sql
SELECT COUNT(*) FROM public.lectures;
```

If this works, PostgREST should be able to see it too.

## Still Not Working?

1. Check Supabase logs for errors
2. Verify you're using the correct project
3. Try the `force_fix_lectures.sql` script (more detailed)
4. Contact Supabase support if issue persists
