
# YouTube Playlist Import Feature

This feature allows you to import entire YouTube playlists into your Muslim Lifestyle app's lectures database with just a few clicks.

## Overview

The YouTube Playlist Import feature extracts video information from YouTube playlists and automatically adds them to your Supabase `videos` table. For each video, it captures:

- **Video Title**: The title of the YouTube video
- **Thumbnail URL**: High-quality thumbnail image URL
- **Video URL**: Direct link to the YouTube video
- **Description**: Video description from YouTube
- **Duration**: Video length in seconds
- **Channel/Scholar Name**: The YouTube channel name (used as scholar name)

## Setup Instructions

### 1. Get a YouTube Data API Key

To use this feature, you need a YouTube Data API v3 key:

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **YouTube Data API v3**:
   - Navigate to "APIs & Services" > "Library"
   - Search for "YouTube Data API v3"
   - Click "Enable"
4. Create credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy your API key
5. (Optional but recommended) Restrict your API key:
   - Click on your API key to edit it
   - Under "API restrictions", select "Restrict key"
   - Choose "YouTube Data API v3"
   - Save

### 2. Add API Key to Supabase Edge Functions

Add your YouTube API key as an environment variable in Supabase:

1. Go to your Supabase project dashboard
2. Navigate to "Edge Functions" > "Manage secrets"
3. Add a new secret:
   - Name: `YOUTUBE_API_KEY`
   - Value: Your YouTube API key from step 1
4. Save the secret

### 3. Verify Edge Function Deployment

The Edge Function `youtube-playlist-import` should already be deployed. You can verify this in your Supabase dashboard under "Edge Functions".

## How to Use

### In the App

1. **Navigate to Lectures**:
   - Open the app and go to the "Learning" tab
   - Tap on "Lectures"

2. **Open Playlist Import**:
   - Tap the download icon (↓) in the top right corner
   - This opens the "Import YouTube Playlist" screen

3. **Get Your Playlist URL**:
   - Open YouTube in your browser
   - Navigate to the playlist you want to import
   - Copy the URL from the address bar
   - The URL should look like: `https://www.youtube.com/playlist?list=PLxxxxxxxxxx`

4. **Import the Playlist**:
   - Paste the playlist URL into the text field
   - Select the category where you want to add these lectures
   - Tap "Import Playlist"
   - Wait for the import to complete (this may take a few moments for large playlists)

5. **Success**:
   - You'll see a success message showing how many videos were imported
   - The videos will now appear in your lectures list

### Supported URL Formats

The feature supports these YouTube playlist URL formats:

- `https://www.youtube.com/playlist?list=PLxxxxxxxxxx`
- `https://youtube.com/playlist?list=PLxxxxxxxxxx`
- `https://www.youtube.com/watch?v=xxxxxxx&list=PLxxxxxxxxxx`

## Technical Details

### Edge Function

The `youtube-playlist-import` Edge Function:

1. Validates the playlist URL
2. Extracts the playlist ID
3. Calls YouTube Data API v3 to fetch all videos in the playlist
4. Retrieves video details including duration
5. Inserts each video into the Supabase `videos` table
6. Returns a summary of the import operation

### Database Schema

Videos are inserted into the `videos` table with these fields:

```sql
- id: uuid (auto-generated)
- title: text
- description: text
- thumbnail_url: text
- video_url: text
- category_id: uuid (selected by user)
- duration: integer (in seconds)
- scholar_name: text (channel name)
- views: integer (starts at 0)
- order_index: integer (position in playlist)
- created_at: timestamp
```

### API Quota

YouTube Data API v3 has a daily quota limit:

- Default quota: 10,000 units per day
- Fetching playlist items: ~1 unit per video
- Fetching video details: ~1 unit per video
- Total cost: ~2 units per video

This means you can import approximately 5,000 videos per day with the default quota.

## Troubleshooting

### "YouTube API key not configured"

**Solution**: Make sure you've added the `YOUTUBE_API_KEY` secret to your Supabase Edge Functions (see Setup step 2).

### "Invalid YouTube playlist URL"

**Solution**: Ensure your URL contains the `list=` parameter. Copy the URL directly from YouTube's address bar when viewing a playlist.

### "No videos found in playlist"

**Possible causes**:
- The playlist is empty
- The playlist is private
- The API key doesn't have permission to access the playlist

**Solution**: Make sure the playlist is public and contains videos.

### Import takes a long time

**Explanation**: Large playlists (50+ videos) may take several seconds to import because the Edge Function needs to:
1. Fetch all playlist items (paginated)
2. Fetch video details for duration
3. Insert each video into the database

This is normal behavior. The app will show a loading indicator during the import.

### Some videos failed to import

**Possible causes**:
- Duplicate videos (already in database)
- Invalid video data
- Database constraints

**Solution**: Check the success message which shows how many videos were successfully imported vs. errors. The successfully imported videos will still be available.

## Best Practices

1. **Organize by Category**: Create specific categories for different types of lectures (e.g., "Tafsir", "Fiqh", "Seerah") before importing

2. **Test with Small Playlists**: Start by importing a small playlist to verify everything works correctly

3. **Monitor API Quota**: If you're importing many playlists, keep track of your YouTube API quota usage

4. **Review Imported Videos**: After importing, review the videos in the app to ensure they imported correctly

5. **Update Metadata**: You can manually update video information (like scholar names) in the Supabase dashboard if needed

## Future Enhancements

Potential improvements for this feature:

- Batch import from multiple playlists
- Automatic thumbnail download to Supabase Storage
- Duplicate detection before import
- Import progress indicator showing current video
- Schedule automatic playlist syncing
- Import from other video platforms

## Support

If you encounter any issues with the YouTube Playlist Import feature:

1. Check the Edge Function logs in Supabase dashboard
2. Verify your YouTube API key is valid and has quota remaining
3. Ensure the playlist URL is correct and the playlist is public
4. Check that the selected category exists in your database

For additional help, refer to the main app documentation or contact support.
