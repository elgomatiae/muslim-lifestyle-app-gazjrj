-- ============================================================================
-- FORCE FIX FOR ALL CONTENT TABLES
-- ============================================================================
-- This script fixes visibility for ALL content tables at once
-- Run this to ensure all tables are accessible
-- ============================================================================

-- Disable RLS on all tables
ALTER TABLE IF EXISTS public.quran_verses DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.hadiths DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.lectures DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.recitations DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DO $$
DECLARE
    r RECORD;
    tables TEXT[] := ARRAY['quran_verses', 'hadiths', 'lectures', 'recitations'];
    t TEXT;
BEGIN
    FOREACH t IN ARRAY tables LOOP
        FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = t) LOOP
            EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.' || quote_ident(t);
        END LOOP;
    END LOOP;
END $$;

-- Grant permissions to all roles
GRANT USAGE ON SCHEMA public TO anon, authenticated, public;
GRANT SELECT ON public.quran_verses TO anon, authenticated, public;
GRANT SELECT ON public.hadiths TO anon, authenticated, public;
GRANT SELECT ON public.lectures TO anon, authenticated, public;
GRANT SELECT ON public.recitations TO anon, authenticated, public;

-- Verify tables exist and are accessible
SELECT 
    t.table_name,
    CASE WHEN pg_tables.rowsecurity THEN 'RLS Enabled' ELSE 'RLS Disabled' END as rls_status,
    (SELECT COUNT(*) FROM information_schema.role_table_grants 
     WHERE table_name = t.table_name AND privilege_type = 'SELECT') as select_grants
FROM information_schema.tables t
LEFT JOIN pg_tables ON pg_tables.tablename = t.table_name
WHERE t.table_schema = 'public'
AND t.table_name IN ('quran_verses', 'hadiths', 'lectures', 'recitations')
ORDER BY t.table_name;

-- Test queries
SELECT 'quran_verses' as table_name, COUNT(*) as row_count FROM public.quran_verses
UNION ALL
SELECT 'hadiths', COUNT(*) FROM public.hadiths
UNION ALL
SELECT 'lectures', COUNT(*) FROM public.lectures
UNION ALL
SELECT 'recitations', COUNT(*) FROM public.recitations;

-- ============================================================================
-- NEXT STEPS:
-- ============================================================================
-- 1. RESTART YOUR SUPABASE PROJECT to refresh PostgREST schema cache
--    Dashboard → Settings → General → Pause → Wait 10s → Resume
--
-- 2. Wait 1-2 minutes after restart for schema cache to refresh
--
-- 3. Test your app - it should now be able to see all tables
-- ============================================================================
