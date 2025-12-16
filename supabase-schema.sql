
-- Supabase Database Schema for Muslim Lifestyle App
-- Run this SQL in your Supabase SQL Editor to create the necessary tables

-- Create video_categories table
CREATE TABLE IF NOT EXISTS video_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('lecture', 'recitation')),
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create videos table
CREATE TABLE IF NOT EXISTS videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT NOT NULL,
  video_url TEXT NOT NULL,
  category_id UUID REFERENCES video_categories(id) ON DELETE CASCADE,
  duration INTEGER DEFAULT 0, -- duration in seconds
  scholar_name TEXT,
  reciter_name TEXT,
  views INTEGER DEFAULT 0,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create function to increment video views
CREATE OR REPLACE FUNCTION increment_video_views(video_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE videos
  SET views = views + 1
  WHERE id = video_id;
END;
$$ LANGUAGE plpgsql;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_videos_category_id ON videos(category_id);
CREATE INDEX IF NOT EXISTS idx_video_categories_type ON video_categories(type);
CREATE INDEX IF NOT EXISTS idx_videos_order ON videos(order_index);
CREATE INDEX IF NOT EXISTS idx_categories_order ON video_categories(order_index);

-- Enable Row Level Security (RLS)
ALTER TABLE video_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access to video_categories"
  ON video_categories FOR SELECT
  USING (true);

CREATE POLICY "Allow public read access to videos"
  ON videos FOR SELECT
  USING (true);

-- Sample data for testing (optional)
-- Uncomment to insert sample categories and videos

/*
-- Insert sample lecture categories
INSERT INTO video_categories (name, description, type, order_index) VALUES
  ('Tafsir', 'Quranic exegesis and interpretation', 'lecture', 1),
  ('Hadith Studies', 'Understanding the sayings of Prophet Muhammad (PBUH)', 'lecture', 2),
  ('Islamic History', 'Learn about Islamic history and civilization', 'lecture', 3);

-- Insert sample recitation categories
INSERT INTO video_categories (name, description, type, order_index) VALUES
  ('Mishary Rashid Alafasy', 'Recitations by Sheikh Mishary Rashid Alafasy', 'recitation', 1),
  ('Abdul Rahman Al-Sudais', 'Recitations by Sheikh Abdul Rahman Al-Sudais', 'recitation', 2),
  ('Saad Al-Ghamdi', 'Recitations by Sheikh Saad Al-Ghamdi', 'recitation', 3);
*/

-- Instructions for Supabase Storage:
-- 1. Create a bucket called 'videos' in Supabase Storage
-- 2. Create a bucket called 'thumbnails' in Supabase Storage
-- 3. Set both buckets to public if you want videos accessible without authentication
-- 4. Upload your video files and thumbnails
-- 5. Get the public URLs and insert them into the videos table
