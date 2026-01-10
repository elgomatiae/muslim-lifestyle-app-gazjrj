# Fix Daily Verses & Hadiths Not Appearing

## Quick Fix (2 Steps)

### Step 1: Run This SQL Script

Open your Supabase SQL Editor and run this:

```sql
-- Disable RLS on quran_verses and hadiths
ALTER TABLE IF EXISTS public.quran_verses DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.hadiths DISABLE ROW LEVEL SECURITY;

-- Grant SELECT permissions
GRANT SELECT ON public.quran_verses TO anon, authenticated, public;
GRANT SELECT ON public.hadiths TO anon, authenticated, public;

-- Verify it worked
SELECT 'quran_verses' as table_name, COUNT(*) as row_count FROM public.quran_verses
UNION ALL
SELECT 'hadiths', COUNT(*) FROM public.hadiths;
```

**Expected Result:** You should see row counts (103 for quran_verses, 101 for hadiths based on your CSV).

### Step 2: RESTART Your Supabase Project ⚠️ CRITICAL ⚠️

**This is required!** PostgREST won't see the tables until you restart:

1. Go to Supabase Dashboard
2. Click **Settings** (gear icon)
3. Scroll to **General**
4. Click **Pause Project**
5. Wait 10-15 seconds
6. Click **Resume Project**
7. Wait 1-2 minutes for full restart

### Step 3: Test Your App

After restart, check your app console. You should see:
- `✅ quran_verses is accessible, count: 103`
- `✅ hadiths is accessible, count: 101`
- `✅ Selected random verse: Quran X:Y`
- `✅ Selected random hadith: Sahih Bukhari X`

## What I Added

1. **Better Error Logging** - Now shows exactly what's wrong
2. **Table Access Test** - Tests if tables are accessible before trying to fetch
3. **Detailed Console Logs** - Shows each step of loading content

## If Still Not Working

Check the console logs for:
- `❌ Error fetching daily verses:` - Shows the exact error
- `⚠️ Table visibility issue` - Means RLS/permissions problem
- `📊 Raw data received: 0 rows` - Means query worked but no data (unlikely with your CSV)

## Your Data

Based on your CSV files:
- **quran_verses**: 103 verses ✅
- **hadiths**: 101 hadiths ✅

The data exists, so this is purely a permissions/RLS issue that the SQL script above will fix.
