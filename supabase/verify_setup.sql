-- ============================================================================
-- SUPABASE SETUP VERIFICATION SCRIPT
-- ============================================================================
-- Run this script to verify your database is set up correctly
-- Share the results with me so I can verify everything matches the app's expectations
-- ============================================================================

-- ============================================================================
-- 1. CHECK IF ALL TABLES EXIST
-- ============================================================================
SELECT 
    'Tables Check' as check_type,
    CASE 
        WHEN COUNT(*) = 5 THEN '✅ All tables exist'
        ELSE '❌ Missing tables: Expected 5, found ' || COUNT(*)::text
    END as status,
    STRING_AGG(table_name, ', ' ORDER BY table_name) as details
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('daily_verses', 'daily_hadiths', 'user_daily_content', 'video_categories', 'videos');

-- ============================================================================
-- 2. CHECK DAILY VERSES TABLE STRUCTURE
-- ============================================================================
SELECT 
    'Daily Verses Structure' as check_type,
    'Columns' as status,
    STRING_AGG(column_name || ' (' || data_type || ')', ', ' ORDER BY ordinal_position) as details
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'daily_verses';

-- Check for active verses
SELECT 
    'Daily Verses Data' as check_type,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ ' || COUNT(*)::text || ' active verses found'
        ELSE '⚠️ No active verses - add some content!'
    END as status,
    NULL as details
FROM daily_verses 
WHERE is_active = true;

-- ============================================================================
-- 3. CHECK DAILY HADITHS TABLE STRUCTURE
-- ============================================================================
SELECT 
    'Daily Hadiths Structure' as check_type,
    'Columns' as status,
    STRING_AGG(column_name || ' (' || data_type || ')', ', ' ORDER BY ordinal_position) as details
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'daily_hadiths';

-- Check for active hadiths
SELECT 
    'Daily Hadiths Data' as check_type,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ ' || COUNT(*)::text || ' active hadiths found'
        ELSE '⚠️ No active hadiths - add some content!'
    END as status,
    NULL as details
FROM daily_hadiths 
WHERE is_active = true;

-- ============================================================================
-- 4. CHECK USER DAILY CONTENT TABLE
-- ============================================================================
SELECT 
    'User Daily Content Structure' as check_type,
    'Columns' as status,
    STRING_AGG(column_name || ' (' || data_type || ')', ', ' ORDER BY ordinal_position) as details
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'user_daily_content';

-- ============================================================================
-- 5. CHECK VIDEO CATEGORIES
-- ============================================================================
SELECT 
    'Video Categories' as check_type,
    'Categories' as status,
    STRING_AGG(name || ' (' || type || ')', ', ' ORDER BY type, order_index) as details
FROM video_categories;

-- Count by type
SELECT 
    'Video Categories Count' as check_type,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ ' || COUNT(*)::text || ' categories found'
        ELSE '⚠️ No categories - add lecture and recitation categories!'
    END as status,
    'Lectures: ' || COUNT(*) FILTER (WHERE type = 'lecture')::text || 
    ', Recitations: ' || COUNT(*) FILTER (WHERE type = 'recitation')::text as details
FROM video_categories;

-- ============================================================================
-- 6. CHECK VIDEOS
-- ============================================================================
SELECT 
    'Videos Structure' as check_type,
    'Columns' as status,
    STRING_AGG(column_name || ' (' || data_type || ')', ', ' ORDER BY ordinal_position) as details
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'videos';

-- Count videos by category type
SELECT 
    'Videos Count' as check_type,
    'Videos by Type' as status,
    'Lectures: ' || COUNT(*) FILTER (WHERE vc.type = 'lecture')::text || 
    ', Recitations: ' || COUNT(*) FILTER (WHERE vc.type = 'recitation')::text as details
FROM videos v
JOIN video_categories vc ON v.category_id = vc.id;

-- ============================================================================
-- 7. CHECK ROW LEVEL SECURITY (RLS)
-- ============================================================================
SELECT 
    'RLS Status' as check_type,
    tablename as status,
    CASE 
        WHEN rowsecurity THEN '✅ RLS Enabled'
        ELSE '❌ RLS Disabled'
    END as details
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('daily_verses', 'daily_hadiths', 'user_daily_content', 'video_categories', 'videos')
ORDER BY tablename;

-- ============================================================================
-- 8. CHECK RLS POLICIES
-- ============================================================================
SELECT 
    'RLS Policies' as check_type,
    tablename as status,
    STRING_AGG(policyname, ', ' ORDER BY policyname) as details
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('daily_verses', 'daily_hadiths', 'user_daily_content', 'video_categories', 'videos')
GROUP BY tablename
ORDER BY tablename;

-- ============================================================================
-- 9. CHECK FOREIGN KEYS
-- ============================================================================
SELECT 
    'Foreign Keys' as check_type,
    tc.table_name || '.' || kcu.column_name as status,
    ccu.table_name || '.' || ccu.column_name || ' ON ' || 
    CASE 
        WHEN rc.delete_rule = 'CASCADE' THEN 'DELETE CASCADE'
        ELSE 'DELETE ' || rc.delete_rule
    END as details
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
JOIN information_schema.referential_constraints AS rc
    ON rc.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_schema = 'public'
AND tc.table_name IN ('daily_verses', 'daily_hadiths', 'user_daily_content', 'video_categories', 'videos')
ORDER BY tc.table_name, kcu.column_name;

-- ============================================================================
-- 10. SAMPLE DATA PREVIEW
-- ============================================================================

-- Sample verse
SELECT 
    'Sample Verse' as check_type,
    reference as status,
    LEFT(translation, 100) || '...' as details
FROM daily_verses 
WHERE is_active = true 
LIMIT 1;

-- Sample hadith
SELECT 
    'Sample Hadith' as check_type,
    source as status,
    LEFT(translation, 100) || '...' as details
FROM daily_hadiths 
WHERE is_active = true 
LIMIT 1;

-- Sample video
SELECT 
    'Sample Video' as check_type,
    v.title as status,
    vc.name || ' (' || vc.type || ') - ' || COALESCE(v.scholar_name, v.reciter_name, 'Unknown') as details
FROM videos v
JOIN video_categories vc ON v.category_id = vc.id
LIMIT 1;

-- ============================================================================
-- VERIFICATION COMPLETE
-- ============================================================================
-- Review all the results above and share them if you need help
-- ============================================================================
