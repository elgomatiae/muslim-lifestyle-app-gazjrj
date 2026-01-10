-- ============================================================================
-- FORCE FIX FOR LECTURES TABLE VISIBILITY
-- ============================================================================
-- This script aggressively fixes the lectures table visibility issue
-- Run this if the standard RLS fix didn't work
-- ============================================================================

-- Step 1: Verify the table actually exists
SELECT 'Step 1: Checking if lectures table exists...' as step;
SELECT 
    table_schema,
    table_name,
    table_type
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name = 'lectures';

-- Step 2: Check current RLS status
SELECT 'Step 2: Checking RLS status...' as step;
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
AND tablename = 'lectures';

-- Step 3: COMPLETELY DISABLE RLS (this ensures PostgREST can see it)
SELECT 'Step 3: Disabling RLS...' as step;
ALTER TABLE IF EXISTS public.lectures DISABLE ROW LEVEL SECURITY;

-- Step 4: Drop any existing policies that might be blocking
SELECT 'Step 4: Dropping existing policies...' as step;
DROP POLICY IF EXISTS "Allow public read access to lectures" ON public.lectures;
DROP POLICY IF EXISTS "lectures_select_policy" ON public.lectures;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.lectures;
-- Drop any other potential policy names
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'lectures') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.lectures';
    END LOOP;
END $$;

-- Step 5: Grant explicit permissions to anon role
SELECT 'Step 5: Granting permissions...' as step;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON public.lectures TO anon;
GRANT SELECT ON public.lectures TO authenticated;
GRANT SELECT ON public.lectures TO public;

-- Step 6: Verify permissions
SELECT 'Step 6: Verifying permissions...' as step;
SELECT 
    grantee,
    privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
AND table_name = 'lectures'
ORDER BY grantee, privilege_type;

-- Step 7: Test query (should work now)
SELECT 'Step 7: Testing query...' as step;
SELECT COUNT(*) as lecture_count FROM public.lectures;

-- Step 8: Show table structure
SELECT 'Step 8: Table structure...' as step;
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'lectures'
ORDER BY ordinal_position;

-- ============================================================================
-- IMPORTANT: After running this, you MUST refresh PostgREST schema cache
-- ============================================================================
-- Option 1: Restart your Supabase project (Dashboard → Settings → Pause/Resume)
-- Option 2: Wait 1-2 minutes for auto-refresh
-- Option 3: Use Supabase CLI: supabase db reset (if you have CLI access)
-- ============================================================================
