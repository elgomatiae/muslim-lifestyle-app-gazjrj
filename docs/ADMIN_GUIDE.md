
# Admin Guide - Content Management

This guide explains how to manage content in your Muslim Lifestyle app.

## Table of Contents

1. [YouTube Playlist Import](#youtube-playlist-import)
2. [Managing Categories](#managing-categories)
3. [Manual Video Upload](#manual-video-upload)
4. [Content Organization](#content-organization)

## YouTube Playlist Import

### Quick Start

The easiest way to add lectures to your app is by importing YouTube playlists:

1. **Find a Playlist**: Locate an Islamic lecture playlist on YouTube
2. **Copy URL**: Copy the playlist URL from your browser
3. **Import**: Use the in-app import feature (Learning > Lectures > Download icon)
4. **Select Category**: Choose where to add the lectures
5. **Done**: All videos are automatically added with thumbnails and metadata

### Setup Requirements

Before you can import playlists, you need:

- A YouTube Data API v3 key (see [YouTube Playlist Import Guide](./YOUTUBE_PLAYLIST_IMPORT.md))
- The API key added to Supabase Edge Functions as `YOUTUBE_API_KEY`

### What Gets Imported

For each video in the playlist:
- Title
- Description
- Thumbnail URL (high quality)
- Video URL
- Duration
- Channel name (as scholar name)
- Position in playlist

## Managing Categories

### View Categories

Categories organize your lectures and recitations. To view them:

```sql
SELECT * FROM video_categories ORDER BY order_index;
```

### Create a New Category

To add a new category via Supabase SQL Editor:

```sql
INSERT INTO video_categories (name, description, type, order_index)
VALUES (
  'Tafsir',
  'Quranic exegesis and interpretation',
  'lecture',
  1
);
```

### Update Category Order

To change the display order:

```sql
UPDATE video_categories
SET order_index = 2
WHERE name = 'Tafsir';
```

### Delete a Category

**Warning**: This will affect all videos in that category.

```sql
-- First, reassign or delete videos in this category
UPDATE videos
SET category_id = 'new-category-id'
WHERE category_id = 'old-category-id';

-- Then delete the category
DELETE FROM video_categories
WHERE id = 'category-id';
```

## Manual Video Upload

If you need to add individual videos (not from a playlist):

### Using Supabase Dashboard

1. Go to your Supabase project
2. Navigate to Table Editor > videos
3. Click "Insert row"
4. Fill in the fields:
   - `title`: Video title
   - `description`: Video description
   - `thumbnail_url`: URL to thumbnail image
   - `video_url`: YouTube video URL
   - `category_id`: Select from video_categories
   - `duration`: Video length in seconds
   - `scholar_name`: Name of the scholar
   - `views`: Start at 0
   - `order_index`: Position in list

### Using SQL

```sql
INSERT INTO videos (
  title,
  description,
  thumbnail_url,
  video_url,
  category_id,
  duration,
  scholar_name,
  views,
  order_index
)
VALUES (
  'The Importance of Prayer',
  'A lecture about the significance of Salah in Islam',
  'https://img.youtube.com/vi/VIDEO_ID/maxresdefault.jpg',
  'https://www.youtube.com/watch?v=VIDEO_ID',
  'category-uuid-here',
  1800,
  'Sheikh Name',
  0,
  1
);
```

### Getting YouTube Thumbnail URLs

YouTube thumbnails follow this pattern:
- High quality: `https://img.youtube.com/vi/VIDEO_ID/maxresdefault.jpg`
- Medium quality: `https://img.youtube.com/vi/VIDEO_ID/hqdefault.jpg`
- Standard: `https://img.youtube.com/vi/VIDEO_ID/sddefault.jpg`

Replace `VIDEO_ID` with the actual YouTube video ID.

## Content Organization

### Best Practices

1. **Use Clear Category Names**: Make categories descriptive and specific
   - Good: "Tafsir - Surah Al-Baqarah"
   - Bad: "Videos 1"

2. **Maintain Order**: Use `order_index` to control display order
   - Lower numbers appear first
   - Leave gaps (10, 20, 30) to allow inserting items later

3. **Consistent Scholar Names**: Use the same spelling for scholar names
   - Good: "Nouman Ali Khan" (always)
   - Bad: "Nouman Ali Khan", "NAK", "Nouman Khan" (inconsistent)

4. **Quality Thumbnails**: Use high-resolution thumbnails
   - Minimum: 640x480
   - Recommended: 1280x720 or higher

5. **Accurate Durations**: Ensure video durations are correct
   - Helps users plan their learning time
   - Automatically captured during playlist import

### Bulk Operations

#### Update Multiple Videos

Change category for multiple videos:

```sql
UPDATE videos
SET category_id = 'new-category-id'
WHERE scholar_name = 'Sheikh Name';
```

#### Reorder Videos

Reset order for a category:

```sql
WITH ordered_videos AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as new_order
  FROM videos
  WHERE category_id = 'category-id'
)
UPDATE videos
SET order_index = ordered_videos.new_order
FROM ordered_videos
WHERE videos.id = ordered_videos.id;
```

#### Delete Old Videos

Remove videos with low views:

```sql
DELETE FROM videos
WHERE views < 10
AND created_at < NOW() - INTERVAL '6 months';
```

### Content Quality Checklist

Before publishing content, verify:

- [ ] Title is clear and descriptive
- [ ] Description provides context
- [ ] Thumbnail is high quality and relevant
- [ ] Video URL is correct and accessible
- [ ] Category is appropriate
- [ ] Duration is accurate
- [ ] Scholar name is spelled correctly
- [ ] Order index is set appropriately

## Monitoring Content

### View Popular Videos

```sql
SELECT title, scholar_name, views, created_at
FROM videos
ORDER BY views DESC
LIMIT 20;
```

### Check Recent Additions

```sql
SELECT title, scholar_name, created_at
FROM videos
ORDER BY created_at DESC
LIMIT 10;
```

### Category Statistics

```sql
SELECT 
  vc.name as category,
  COUNT(v.id) as video_count,
  SUM(v.views) as total_views,
  AVG(v.duration) as avg_duration
FROM video_categories vc
LEFT JOIN videos v ON v.category_id = vc.id
GROUP BY vc.name
ORDER BY video_count DESC;
```

## Troubleshooting

### Videos Not Appearing in App

1. Check if video exists in database:
   ```sql
   SELECT * FROM videos WHERE title LIKE '%search term%';
   ```

2. Verify category is correct type:
   ```sql
   SELECT * FROM video_categories WHERE id = 'category-id';
   ```

3. Check RLS policies are enabled:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'videos';
   ```

### Import Failures

If playlist import fails:

1. Check Edge Function logs in Supabase dashboard
2. Verify YouTube API key is set correctly
3. Ensure playlist is public
4. Check API quota hasn't been exceeded

### Duplicate Videos

To find duplicates:

```sql
SELECT video_url, COUNT(*) as count
FROM videos
GROUP BY video_url
HAVING COUNT(*) > 1;
```

To remove duplicates (keeps newest):

```sql
DELETE FROM videos a
USING videos b
WHERE a.video_url = b.video_url
AND a.created_at < b.created_at;
```

## Security Notes

### Row Level Security (RLS)

The `videos` table has RLS enabled. Current policies:

- **SELECT**: Anyone can view videos (public access)
- **INSERT/UPDATE/DELETE**: Requires authentication

To modify policies, use the Supabase dashboard or SQL:

```sql
-- View current policies
SELECT * FROM pg_policies WHERE tablename = 'videos';

-- Create new policy
CREATE POLICY "Allow public read access"
ON videos FOR SELECT
TO public
USING (true);
```

### API Key Security

**Important**: Never expose your YouTube API key in client-side code. It should only be stored as a Supabase Edge Function secret.

## Support

For additional help:
- Check the [YouTube Playlist Import Guide](./YOUTUBE_PLAYLIST_IMPORT.md)
- Review Supabase documentation
- Check Edge Function logs for errors
- Verify database schema and RLS policies
