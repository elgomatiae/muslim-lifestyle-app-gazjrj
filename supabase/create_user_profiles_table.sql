-- ============================================================================
-- CREATE/UPDATE PROFILES TABLE
-- ============================================================================
-- This script sets up the profiles table with proper RLS policies
-- Note: Your table is called 'profiles', not 'user_profiles'
-- ============================================================================

-- Create profiles table if it doesn't exist (or use existing if it already exists)
-- Note: If your table is already called 'profiles', you can skip this CREATE TABLE statement
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT,
    display_name TEXT,
    phone TEXT,
    location TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index for username lookups (for invites)
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username) 
WHERE username IS NOT NULL;

-- Create index for user_id lookups
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);

-- Enable RLS
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON public.profiles;

-- Policy 1: Users can view all profiles (needed for username lookups in invites)
CREATE POLICY "Users can view all profiles" ON public.profiles
    FOR SELECT
    USING (true);

-- Policy 2: Users can view their own profile
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy 3: Users can update their own profile
CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy 4: Users can insert their own profile (needed for signup)
CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy 5: Users can delete their own profile (needed for account deletion)
CREATE POLICY "Users can delete their own profile" ON public.profiles
    FOR DELETE
    USING (auth.uid() = user_id);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO anon, authenticated, public;

-- Add comment
COMMENT ON TABLE public.profiles IS 'Stores user profile information including usernames for invites';

-- ============================================================================
-- VERIFY TABLE CREATION
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

-- Show sample data (if any)
SELECT 
    user_id,
    username,
    display_name,
    created_at
FROM public.profiles
ORDER BY created_at DESC
LIMIT 10;

-- ============================================================================
-- NOTES
-- ============================================================================
-- After running this script:
-- 1. RESTART your Supabase project (Settings → General → Pause → Resume)
-- 2. This refreshes the PostgREST schema cache
-- 3. Users can now sign up and their usernames will be saved
-- ============================================================================
