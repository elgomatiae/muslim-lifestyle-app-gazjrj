
# YouTube Playlist Import - Setup Checklist

Use this checklist to ensure everything is configured correctly.

## ✅ Setup Checklist

### Google Cloud Setup

- [ ] Created/selected a Google Cloud project
- [ ] Enabled YouTube Data API v3
- [ ] Created an API key
- [ ] (Optional) Restricted API key to YouTube Data API v3
- [ ] Copied API key for next step

### Supabase Setup

- [ ] Logged into Supabase dashboard
- [ ] Navigated to Edge Functions
- [ ] Opened "Manage secrets"
- [ ] Added secret: `YOUTUBE_API_KEY` = `your-api-key`
- [ ] Verified Edge Function `youtube-playlist-import` is deployed
- [ ] Checked Edge Function status is "ACTIVE"

### Database Setup

- [ ] Verified `videos` table exists
- [ ] Verified `video_categories` table exists
- [ ] Created at least one category with `type = 'lecture'`
- [ ] Checked RLS policies are enabled on `videos` table

### App Setup

- [ ] App is connected to Supabase
- [ ] Can navigate to Learning > Lectures
- [ ] Can see the download icon in Lectures screen
- [ ] Playlist import screen opens correctly

### Test Import

- [ ] Found a small public YouTube playlist (5-10 videos)
- [ ] Copied playlist URL
- [ ] Opened playlist import screen
- [ ] Pasted URL
- [ ] Selected a category
- [ ] Clicked "Import Playlist"
- [ ] Import completed successfully
- [ ] Videos appear in Lectures screen
- [ ] Can play videos from the app

## 🔍 Verification Commands

Run these in Supabase SQL Editor to verify setup:

### Check Categories Exist
```sql
SELECT * FROM video_categories WHERE type = 'lecture';
```
**Expected**: At least one row returned

### Check Videos Table Structure
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'videos';
```
**Expected**: Columns include title, thumbnail_url, video_url, category_id, etc.

### Check RLS is Enabled
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'videos';
```
**Expected**: `rowsecurity = true`

### Check Edge Function Exists
Check in Supabase Dashboard:
- Navigate to Edge Functions
- Look for `youtube-playlist-import`
- Status should be "ACTIVE"

## 🚨 Common Issues

### Issue: "YouTube API key not configured"

**Check**:
```
Supabase Dashboard > Edge Functions > Manage secrets
```
**Fix**: Add `YOUTUBE_API_KEY` secret

### Issue: "Invalid YouTube playlist URL"

**Check**: URL format
```
✅ https://www.youtube.com/playlist?list=PLxxx
❌ https://www.youtube.com/watch?v=xxx (no list parameter)
```

### Issue: "No videos found in playlist"

**Check**:
- Playlist is public (not private/unlisted)
- Playlist contains videos
- API key has correct permissions

### Issue: Videos not appearing in app

**Check**:
```sql
-- Verify videos were inserted
SELECT COUNT(*) FROM videos;

-- Check recent imports
SELECT title, created_at 
FROM videos 
ORDER BY created_at DESC 
LIMIT 5;
```

### Issue: Import takes too long

**Normal behavior** for large playlists:
- 10 videos: ~5 seconds
- 50 videos: ~15 seconds
- 100 videos: ~30 seconds

**If it takes longer**:
- Check Edge Function logs
- Verify API quota isn't exceeded
- Check network connection

## 📊 API Quota Check

Monitor your YouTube API usage:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to "APIs & Services" > "Dashboard"
3. Click on "YouTube Data API v3"
4. View quota usage

**Daily Limit**: 10,000 units  
**Cost per video**: ~2 units  
**Max videos/day**: ~5,000

## 🎯 Success Criteria

You're all set when:

✅ Test playlist imports successfully  
✅ Videos appear in app with thumbnails  
✅ Videos play when tapped  
✅ Tracking modal appears before playing  
✅ No errors in Edge Function logs  

## 📞 Need Help?

If you've completed this checklist and still have issues:

1. Check Edge Function logs in Supabase
2. Review the full documentation:
   - [YouTube Playlist Import Guide](./YOUTUBE_PLAYLIST_IMPORT.md)
   - [Admin Guide](./ADMIN_GUIDE.md)
3. Verify all environment variables are set correctly
4. Test with a different, smaller playlist

---

**Last Updated**: December 2024  
**Version**: 1.0
