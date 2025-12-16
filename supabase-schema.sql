
-- Islamic Lectures Database Schema
-- This file documents the database structure for the Islamic Lectures feature

-- Tables created:
-- 1. video_categories - Stores categories for organizing videos
-- 2. videos - Stores video metadata and URLs

-- Sample categories have been pre-populated for Islamic Lectures:
-- - Tafsir (Quranic exegesis)
-- - Hadith Studies
-- - Fiqh (Islamic jurisprudence)
-- - Aqeedah (Islamic creed)
-- - Seerah (Life of Prophet Muhammad)
-- - Contemporary Issues
-- - Ramadan Specials
-- - Youth & Family

-- To add videos to your app:
-- 1. Upload video files to Supabase Storage
-- 2. Upload thumbnail images to Supabase Storage
-- 3. Insert video records into the 'videos' table

-- Example: Adding a new video
-- INSERT INTO videos (
--   title,
--   description,
--   thumbnail_url,
--   video_url,
--   category_id,
--   duration,
--   scholar_name,
--   views,
--   order_index
-- ) VALUES (
--   'Understanding Tawheed',
--   'A comprehensive lecture on the concept of Islamic monotheism',
--   'https://your-supabase-url.supabase.co/storage/v1/object/public/thumbnails/tawheed.jpg',
--   'https://your-supabase-url.supabase.co/storage/v1/object/public/videos/tawheed.mp4',
--   (SELECT id FROM video_categories WHERE name = 'Aqeedah' LIMIT 1),
--   3600,
--   'Sheikh Ahmad',
--   0,
--   1
-- );

-- To add a new category:
-- INSERT INTO video_categories (name, description, type, order_index)
-- VALUES ('New Category', 'Description here', 'lecture', 9);

-- For Quran Recitations, use type = 'recitation' instead of 'lecture'
-- and use reciter_name instead of scholar_name in the videos table

-- RLS Policies:
-- - Anyone can view videos and categories (public read access)
-- - Only authenticated users can insert/update/delete (admin access)
