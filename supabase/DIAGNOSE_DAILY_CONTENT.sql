-- ============================================================================
-- DIAGNOSTIC SCRIPT: Check Daily Content (Verses & Hadiths)
-- ============================================================================
-- Run this in your Supabase SQL Editor to diagnose why content isn't showing
-- ============================================================================

-- 1. Check if tables exist and have data
SELECT 
  'quran_verses' as table_name,
  COUNT(*) as row_count
FROM quran_verses
UNION ALL
SELECT 
  'hadiths' as table_name,
  COUNT(*) as row_count
FROM hadiths;

-- 2. Check RLS status
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename IN ('quran_verses', 'hadiths')
  AND schemaname = 'public';

-- 3. Check if anon role has SELECT permission
SELECT 
  grantee,
  table_name,
  privilege_type
FROM information_schema.role_table_grants
WHERE table_name IN ('quran_verses', 'hadiths')
  AND grantee IN ('anon', 'authenticated', 'public')
  AND privilege_type = 'SELECT';

-- 4. Sample data from quran_verses
SELECT 
  id,
  reference,
  LEFT(translation, 50) as translation_preview,
  created_at
FROM quran_verses
LIMIT 5;

-- 5. Sample data from hadiths
SELECT 
  id,
  reference,
  collection,
  LEFT(translation, 50) as translation_preview,
  created_at
FROM hadiths
LIMIT 5;

-- ============================================================================
-- FIX: If tables have data but RLS is blocking, run this:
-- ============================================================================

-- Disable RLS temporarily
ALTER TABLE IF EXISTS public.quran_verses DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.hadiths DISABLE ROW LEVEL SECURITY;

-- Grant SELECT permissions
GRANT SELECT ON public.quran_verses TO anon, authenticated, public;
GRANT SELECT ON public.hadiths TO anon, authenticated, public;

-- Verify permissions
SELECT 
  grantee,
  table_name,
  privilege_type
FROM information_schema.role_table_grants
WHERE table_name IN ('quran_verses', 'hadiths')
  AND grantee IN ('anon', 'authenticated', 'public')
  AND privilege_type = 'SELECT';

-- ============================================================================
-- IMPORTANT: After running the fix, RESTART your Supabase project
-- Settings → General → Pause Project → Wait 10 seconds → Resume Project
-- ============================================================================
