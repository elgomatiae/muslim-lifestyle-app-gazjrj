-- ============================================================================
-- ALTERNATIVE FIX: DISABLE RLS COMPLETELY (TEMPORARY SOLUTION)
-- ============================================================================
-- If the above fix doesn't work, use this to completely disable RLS
-- This allows full public access (use only for testing/development)
-- ============================================================================

-- Disable RLS on all content tables
ALTER TABLE IF EXISTS public.quran_verses DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.hadiths DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.lectures DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.recitations DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('quran_verses', 'hadiths', 'lectures', 'recitations')
ORDER BY tablename;

-- ============================================================================
-- IMPORTANT NOTES:
-- ============================================================================
-- 1. This completely disables RLS - anyone can read/write to these tables
-- 2. Use this ONLY for development/testing
-- 3. For production, use fix_rls_policies.sql with proper policies
-- 4. After disabling RLS, refresh PostgREST schema cache if needed
-- ============================================================================
