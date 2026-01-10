# Supabase Setup Instructions

This guide will help you set up your Supabase database to work with the Muslim Life Hub app.

## Prerequisites

1. A Supabase account and project
2. Access to your Supabase SQL Editor

## Step-by-Step Setup

### Step 1: Run the Migration

1. Go to your Supabase project dashboard
2. Click on **"SQL Editor"** in the left sidebar
3. Click **"New Query"**
4. Open the file `supabase/migrations/001_create_content_tables.sql`
5. Copy the entire contents and paste it into the SQL Editor
6. Click **"Run"** or press `Ctrl+Enter` (Windows) / `Cmd+Enter` (Mac)

This will create all the necessary tables, indexes, and security policies.

### Step 2: Seed Sample Data (Optional)

1. In the SQL Editor, open the file `supabase/migrations/002_seed_sample_data.sql`
2. Copy and paste the contents
3. **Modify the video URLs** to point to your actual content
4. Run the query

### Step 3: Verify Tables Were Created

Run this query to verify all tables exist:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('daily_verses', 'daily_hadiths', 'user_daily_content', 'video_categories', 'videos')
ORDER BY table_name;
```

You should see all 5 tables listed.

### Step 4: Check Sample Data

```sql
-- Check daily verses
SELECT COUNT(*) as verse_count FROM daily_verses WHERE is_active = true;

-- Check daily hadiths
SELECT COUNT(*) as hadith_count FROM daily_hadiths WHERE is_active = true;

-- Check video categories
SELECT name, type, COUNT(*) OVER() as total FROM video_categories;
```

## Adding Your Own Content

### Adding Daily Verses

```sql
INSERT INTO daily_verses (arabic_text, translation, reference, is_active)
VALUES (
    'YOUR_ARABIC_TEXT_HERE',
    'Your English translation here',
    'Quran 1:1',
    true
);
```

### Adding Daily Hadiths

```sql
INSERT INTO daily_hadiths (arabic_text, translation, source, is_active)
VALUES (
    'YOUR_ARABIC_TEXT_HERE', -- Optional, can be NULL
    'Your English translation here',
    'Sahih al-Bukhari 1',
    true
);
```

### Adding Video Categories

```sql
-- For lectures
INSERT INTO video_categories (name, description, type, order_index)
VALUES ('New Category', 'Description here', 'lecture', 10);

-- For recitations
INSERT INTO video_categories (name, description, type, order_index)
VALUES ('New Category', 'Description here', 'recitation', 10);
```

### Adding Videos

```sql
-- First, get the category_id
SELECT id FROM video_categories WHERE name = 'Tafsir' AND type = 'lecture';

-- Then insert the video (replace CATEGORY_ID_UUID with the actual UUID)
INSERT INTO videos (
    title, 
    description, 
    video_url, 
    thumbnail_url, 
    category_id, 
    duration, 
    scholar_name, -- For lectures
    reciter_name, -- For recitations
    views, 
    order_index
)
VALUES (
    'Video Title',
    'Video description',
    'https://www.youtube.com/watch?v=VIDEO_ID', -- Or your video URL
    'https://i.ytimg.com/vi/VIDEO_ID/maxresdefault.jpg', -- Or your thumbnail URL
    'CATEGORY_ID_UUID', -- Replace with actual UUID from above
    3600, -- Duration in seconds
    'Scholar Name', -- For lectures
    NULL, -- For recitations, use reciter_name instead
    0, -- Initial views
    1 -- Order index
);
```

## Important Notes

### Row Level Security (RLS)

All tables have RLS enabled with these policies:
- **Public Read Access**: Anyone can read daily_verses, daily_hadiths, video_categories, and videos
- **Authenticated Write**: Only authenticated users can insert/update content
- **User-Specific**: Users can only see their own `user_daily_content` records

### Video URL Formats

The app supports:
- YouTube URLs (watch, embed, youtu.be formats)
- Direct video URLs (MP4, etc.)
- Any valid video URL

For YouTube videos, the app automatically:
- Extracts video IDs
- Generates thumbnail URLs
- Converts URLs to watch format

### Categories

- `type = 'lecture'` - For Islamic lectures
- `type = 'recitation'` - For Quran recitations

Videos must be linked to a category via `category_id`.

## Troubleshooting

### If tables already exist:

The migrations use `CREATE TABLE IF NOT EXISTS`, so you can safely run them again.

### If you need to reset:

```sql
-- WARNING: This will delete all data!
DROP TABLE IF EXISTS videos CASCADE;
DROP TABLE IF EXISTS video_categories CASCADE;
DROP TABLE IF EXISTS user_daily_content CASCADE;
DROP TABLE IF EXISTS daily_hadiths CASCADE;
DROP TABLE IF EXISTS daily_verses CASCADE;
```

Then run the migration again.

### If RLS is blocking reads:

Check that your RLS policies were created:

```sql
SELECT tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;
```

## Next Steps

1. Add your actual content (verses, hadiths, videos)
2. Test the app to ensure content loads correctly
3. Monitor the `user_daily_content` table to see user assignments

## Need Help?

If you encounter any issues:
1. Check the Supabase logs in the dashboard
2. Verify your Supabase URL and anon key in the app configuration
3. Ensure all required fields are populated (no NULLs where NOT NULL is required)
