-- ============================================================================
-- SUPABASE SCHEMA DISCOVERY SCRIPT
-- ============================================================================
-- Run this script in your Supabase SQL Editor to discover your table structure
-- Share the results with me so I can configure the app to match your schema
-- ============================================================================

-- ============================================================================
-- 1. LIST ALL TABLES IN YOUR DATABASE
-- ============================================================================
SELECT 
    'ALL TABLES' as section,
    table_name,
    NULL as column_name,
    NULL as data_type
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- ============================================================================
-- 2. FIND TABLES THAT MIGHT BE FOR DAILY VERSES
-- ============================================================================
SELECT 
    'POSSIBLE VERSE TABLES' as section,
    table_name,
    NULL as column_name,
    NULL as data_type
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE'
AND (
    LOWER(table_name) LIKE '%verse%' 
    OR LOWER(table_name) LIKE '%quran%'
    OR LOWER(table_name) LIKE '%ayah%'
    OR LOWER(table_name) LIKE '%ayat%'
)
ORDER BY table_name;

-- ============================================================================
-- 3. FIND TABLES THAT MIGHT BE FOR DAILY HADITHS
-- ============================================================================
SELECT 
    'POSSIBLE HADITH TABLES' as section,
    table_name,
    NULL as column_name,
    NULL as data_type
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE'
AND (
    LOWER(table_name) LIKE '%hadith%'
    OR LOWER(table_name) LIKE '%sunnah%'
)
ORDER BY table_name;

-- ============================================================================
-- 4. FIND TABLES THAT MIGHT BE FOR VIDEOS/CONTENT
-- ============================================================================
SELECT 
    'POSSIBLE VIDEO/CONTENT TABLES' as section,
    table_name,
    NULL as column_name,
    NULL as data_type
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE'
AND (
    LOWER(table_name) LIKE '%video%'
    OR LOWER(table_name) LIKE '%lecture%'
    OR LOWER(table_name) LIKE '%recitation%'
    OR LOWER(table_name) LIKE '%content%'
    OR LOWER(table_name) LIKE '%media%'
)
ORDER BY table_name;

-- ============================================================================
-- 5. FIND TABLES THAT MIGHT BE FOR CATEGORIES
-- ============================================================================
SELECT 
    'POSSIBLE CATEGORY TABLES' as section,
    table_name,
    NULL as column_name,
    NULL as data_type
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE'
AND (
    LOWER(table_name) LIKE '%categor%'
    OR LOWER(table_name) LIKE '%tag%'
    OR LOWER(table_name) LIKE '%type%'
)
ORDER BY table_name;

-- ============================================================================
-- 6. FOR EACH TABLE, SHOW ALL COLUMNS
-- ============================================================================
-- Replace 'YOUR_TABLE_NAME' with each table name you want to inspect

-- Example: Show columns for a table called 'verses'
-- SELECT 
--     'TABLE: verses' as section,
--     column_name,
--     data_type,
--     is_nullable,
--     column_default
-- FROM information_schema.columns
-- WHERE table_schema = 'public' 
-- AND table_name = 'verses'
-- ORDER BY ordinal_position;

-- ============================================================================
-- 7. GENERATE COLUMN MAPPING FOR ALL TABLES (Replace table names as needed)
-- ============================================================================

-- Run these queries one at a time, replacing TABLE_NAME with your actual table names:

/*
-- For Daily Verses table (replace 'your_verses_table' with your actual table name)
SELECT 
    'DAILY_VERSES_COLUMNS' as table_type,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'your_verses_table'  -- CHANGE THIS
ORDER BY ordinal_position;

-- For Daily Hadiths table (replace 'your_hadiths_table' with your actual table name)
SELECT 
    'DAILY_HADITHS_COLUMNS' as table_type,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'your_hadiths_table'  -- CHANGE THIS
ORDER BY ordinal_position;

-- For Videos table (replace 'your_videos_table' with your actual table name)
SELECT 
    'VIDEOS_COLUMNS' as table_type,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'your_videos_table'  -- CHANGE THIS
ORDER BY ordinal_position;

-- For Categories table (replace 'your_categories_table' with your actual table name)
SELECT 
    'CATEGORIES_COLUMNS' as table_type,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'your_categories_table'  -- CHANGE THIS
ORDER BY ordinal_position;
*/

-- ============================================================================
-- HOW TO USE THIS SCRIPT:
-- ============================================================================
-- 1. Run sections 1-5 to see what tables you have
-- 2. Identify which tables are for verses, hadiths, videos, categories
-- 3. Run section 7 queries (uncomment and replace table names)
-- 4. Share the results with me so I can configure ContentServiceConfig.ts
-- ============================================================================
