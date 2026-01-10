# Quick Start Guide - Supabase Setup

This is a quick reference for setting up your Supabase database.

## 🚀 Fast Setup (5 minutes)

### Step 1: Run the Main Migration

1. Open Supabase Dashboard → SQL Editor
2. Open file: `supabase/migrations/001_create_content_tables.sql`
3. Copy entire contents → Paste in SQL Editor → Run ✅

### Step 2: Add Sample Content (Optional)

1. Open file: `supabase/migrations/002_seed_sample_data.sql`
2. **IMPORTANT**: Replace the example video URLs with your actual YouTube/video URLs
3. Copy → Paste in SQL Editor → Run ✅

### Step 3: Verify Setup

1. Open file: `supabase/verify_setup.sql`
2. Copy → Paste → Run
3. Check all results show ✅ (green checkmarks)

## ✅ Success Checklist

After running the migrations, you should have:

- [x] 5 tables created: `daily_verses`, `daily_hadiths`, `user_daily_content`, `video_categories`, `videos`
- [x] At least 1 active daily verse
- [x] At least 1 active daily hadith
- [x] At least 1 video category (lecture type)
- [x] At least 1 video category (recitation type)
- [x] RLS enabled on all tables
- [x] Foreign keys properly set up

## 📝 Next Steps

1. **Add Your Content**: Use the examples in `SETUP_INSTRUCTIONS.md` to add your own verses, hadiths, and videos
2. **Test the App**: Open the app and verify content loads correctly
3. **Share Results**: If you want me to verify your setup, run `verify_setup.sql` and share the results

## 🔧 Common Issues

**Issue**: Tables already exist
- **Solution**: The migration uses `IF NOT EXISTS`, so it's safe to run again

**Issue**: No content showing in app
- **Solution**: Make sure you have at least one verse and one hadith with `is_active = true`

**Issue**: Videos not loading
- **Solution**: Check that video URLs are valid and accessible

## 💡 Tips

- Use YouTube URLs directly - the app handles them automatically
- For thumbnails, YouTube format: `https://i.ytimg.com/vi/VIDEO_ID/maxresdefault.jpg`
- Make sure `is_active = true` for verses and hadiths you want to show
- Use `order_index` to control display order in categories

## 📞 Need Help?

Run `verify_setup.sql` and share the results - I can help diagnose any issues!
