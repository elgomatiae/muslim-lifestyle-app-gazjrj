
# Quick Start: Import YouTube Playlists

Add Islamic lectures to your app in 3 easy steps!

## Prerequisites

✅ YouTube Data API v3 key (one-time setup)  
✅ API key added to Supabase Edge Functions  
✅ Public YouTube playlist URL

## Step-by-Step Guide

### 1️⃣ Get Your API Key (One-Time Setup)

1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Create/select a project
3. Enable "YouTube Data API v3"
4. Create an API key
5. Add to Supabase: Edge Functions > Secrets > `YOUTUBE_API_KEY`

### 2️⃣ Find a Playlist

1. Go to YouTube
2. Find an Islamic lecture playlist
3. Copy the URL (should contain `list=`)

Example URL:
```
https://www.youtube.com/playlist?list=PLxxxxxxxxxxxxxxxxxxx
```

### 3️⃣ Import in App

1. Open app → **Learning** tab
2. Tap **Lectures**
3. Tap **Download icon** (↓) in top right
4. Paste playlist URL
5. Select category
6. Tap **Import Playlist**
7. Wait for completion ✨

## That's It!

All videos from the playlist are now in your app with:
- Titles
- Thumbnails
- Descriptions
- Durations
- Scholar names

## Tips

💡 **Start Small**: Test with a small playlist first  
💡 **Organize**: Create categories before importing  
💡 **Be Patient**: Large playlists take a few moments  
💡 **Check Quota**: You can import ~5,000 videos/day  

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "API key not configured" | Add `YOUTUBE_API_KEY` to Supabase secrets |
| "Invalid URL" | Make sure URL contains `list=` parameter |
| "No videos found" | Check playlist is public and not empty |
| Import is slow | Normal for large playlists (50+ videos) |

## Need Help?

📖 Read the full guide: [YOUTUBE_PLAYLIST_IMPORT.md](./YOUTUBE_PLAYLIST_IMPORT.md)  
🛠️ Admin guide: [ADMIN_GUIDE.md](./ADMIN_GUIDE.md)

---

**Happy Learning! 📚🕌**
