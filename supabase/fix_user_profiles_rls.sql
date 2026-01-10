-- ============================================================================
-- FIX PROFILES RLS POLICIES
-- ============================================================================
-- This script ensures profiles table is accessible for username lookups
-- ============================================================================

-- Check if table exists
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'profiles'
        ) THEN '✅ profiles table exists'
        ELSE '❌ profiles table does NOT exist'
    END as table_status;

-- Check current RLS status
SELECT 
    tablename,
    CASE 
        WHEN rowsecurity THEN '✅ RLS Enabled'
        ELSE '⚠️ RLS Disabled'
    END as rls_status
FROM pg_tables
WHERE schemaname = 'public' 
AND tablename = 'profiles';

-- Check existing policies
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'profiles';

-- ============================================================================
-- FIX: Enable RLS and create policies
-- ============================================================================

-- Step 1: Drop ALL existing policies first (while RLS is still enabled)
-- This dynamically drops all policies that exist
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND schemaname = 'public'
    ) 
    LOOP
        BEGIN
            EXECUTE format('DROP POLICY %I ON public.profiles', r.policyname);
            RAISE NOTICE 'Dropped policy: %', r.policyname;
        EXCEPTION
            WHEN undefined_object THEN
                RAISE NOTICE 'Policy % does not exist, skipping', r.policyname;
        END;
    END LOOP;
END $$;

-- Step 2: Also explicitly drop common policy names as a safety net
-- Using IF EXISTS so it won't error if they don't exist
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public read access for username lookups" ON public.profiles;
DROP POLICY IF EXISTS "Enable public read access" ON public.profiles;

-- Step 3: Temporarily disable RLS to ensure clean state
ALTER TABLE IF EXISTS public.profiles DISABLE ROW LEVEL SECURITY;

-- Step 4: Re-enable RLS (fresh start)
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy 1: CRITICAL - Allow ALL authenticated users to view ALL profiles
-- This is required for invite functionality - users must be able to search/find other users
-- Using (true) means any authenticated user can view any profile
CREATE POLICY "Enable public read access" ON public.profiles
    FOR SELECT
    TO authenticated, anon
    USING (true);

-- Policy 3: Users can update their own profile
CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Policy 4: Users can insert their own profile
CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Policy 5: Users can delete their own profile (for account deletion)
CREATE POLICY "Users can delete their own profile" ON public.profiles
    FOR DELETE
    USING (auth.uid() = id);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO anon, authenticated, public;

-- ============================================================================
-- VERIFY: Check usernames in the table
-- ============================================================================

-- Show sample profiles (first 10)
SELECT 
    id,
    email,
    full_name,
    created_at
FROM public.profiles
ORDER BY created_at DESC
LIMIT 10;

-- Count total profiles
SELECT 
    COUNT(*) as total_profiles,
    COUNT(full_name) as profiles_with_full_name,
    COUNT(email) as profiles_with_email
FROM public.profiles;

-- ============================================================================
-- NOTES
-- ============================================================================
-- After running this script:
-- 1. RESTART your Supabase project (Settings → General → Pause → Resume)
-- 2. This refreshes the PostgREST schema cache
-- 3. Try the invite feature again
-- ============================================================================
