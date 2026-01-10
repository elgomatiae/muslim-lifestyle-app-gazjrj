-- ============================================================================
-- VERIFY TABLES EXIST AND ARE ACCESSIBLE
-- ============================================================================
-- Run this first to verify your tables exist and are accessible
-- ============================================================================

-- Check if tables exist in the public schema
SELECT 
    table_schema,
    table_name,
    table_type
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('quran_verses', 'hadiths', 'lectures', 'recitations')
ORDER BY table_name;

-- Check current RLS status
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('quran_verses', 'hadiths', 'lectures', 'recitations')
ORDER BY tablename;

-- Check existing policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE tablename IN ('quran_verses', 'hadiths', 'lectures', 'recitations')
ORDER BY tablename, policyname;

-- Try to query the tables directly (this will show permission errors)
-- Uncomment these one at a time to test:

-- SELECT COUNT(*) FROM public.quran_verses;
-- SELECT COUNT(*) FROM public.hadiths;
-- SELECT COUNT(*) FROM public.lectures;
-- SELECT COUNT(*) FROM public.recitations;
