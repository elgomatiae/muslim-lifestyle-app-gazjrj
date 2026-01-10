-- ============================================================================
-- FIX RLS POLICIES FOR CONTENT TABLES
-- ============================================================================
-- This script enables public read access to your content tables
-- Run this in your Supabase SQL Editor to allow the app to fetch data
-- ============================================================================

-- ============================================================================
-- 1. FIRST, VERIFY TABLES EXIST
-- ============================================================================
-- If these queries return no rows, the tables don't exist!
SELECT 'Checking if tables exist...' as status;

SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('quran_verses', 'hadiths', 'lectures', 'recitations')
ORDER BY table_name;

-- ============================================================================
-- 2. DISABLE RLS TEMPORARILY TO ALLOW POSTGREST TO SEE TABLES
-- ============================================================================
-- If RLS is enabled but no policies exist, PostgREST can't see the tables
-- We'll disable RLS first, then enable it WITH policies

ALTER TABLE IF EXISTS public.quran_verses DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.hadiths DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.lectures DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.recitations DISABLE ROW LEVEL SECURITY;

-- Now enable RLS WITH policies (this is important!)
-- We enable RLS AFTER creating policies to ensure visibility

-- ============================================================================
-- 3. CREATE POLICIES FOR PUBLIC READ ACCESS (ANON ROLE)
-- ============================================================================
-- Create policies BEFORE enabling RLS to ensure they're ready

-- Policy for quran_verses: Allow anyone to read
DROP POLICY IF EXISTS "Allow public read access to quran_verses" ON public.quran_verses;
CREATE POLICY "Allow public read access to quran_verses"
  ON public.quran_verses
  FOR SELECT
  TO anon, authenticated, public
  USING (true);

-- Policy for hadiths: Allow anyone to read
DROP POLICY IF EXISTS "Allow public read access to hadiths" ON public.hadiths;
CREATE POLICY "Allow public read access to hadiths"
  ON public.hadiths
  FOR SELECT
  TO anon, authenticated, public
  USING (true);

-- Policy for lectures: Allow anyone to read
DROP POLICY IF EXISTS "Allow public read access to lectures" ON public.lectures;
CREATE POLICY "Allow public read access to lectures"
  ON public.lectures
  FOR SELECT
  TO anon, authenticated, public
  USING (true);

-- Policy for recitations: Allow anyone to read
DROP POLICY IF EXISTS "Allow public read access to recitations" ON public.recitations;
CREATE POLICY "Allow public read access to recitations"
  ON public.recitations
  FOR SELECT
  TO anon, authenticated, public
  USING (true);

-- ============================================================================
-- 4. NOW ENABLE RLS (AFTER POLICIES ARE CREATED)
-- ============================================================================
-- Enabling RLS after policies ensures PostgREST can see the tables
ALTER TABLE IF EXISTS public.quran_verses ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.hadiths ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.lectures ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.recitations ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 5. VERIFY POLICIES WERE CREATED AND RLS IS ENABLED
-- ============================================================================
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename IN ('quran_verses', 'hadiths', 'lectures', 'recitations')
ORDER BY tablename, policyname;

-- ============================================================================
-- NOTES:
-- ============================================================================
-- 1. These policies allow public read access (SELECT) to all rows
-- 2. The anon role (unauthenticated users) can read from these tables
-- 3. The authenticated role (logged-in users) can also read
-- 4. If you want to restrict access later, modify these policies
-- 5. If you want to allow writes (INSERT/UPDATE/DELETE), create additional policies
-- ============================================================================
