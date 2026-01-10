
# TestFlight Setup Guide - Muslim Lifestyle App

## ✅ What's Working in TestFlight

Your app is properly configured and should display the following content in TestFlight:

### ✅ Daily Content (Home Screen)
- **Daily Verses**: 100 Quranic verses available ✅
- **Daily Hadiths**: 97 hadiths available ✅
- **Prayer Times**: Calculated based on GPS location ✅
- **Iman Tracker**: All tracking features working ✅

### ✅ Learning Tab
- **Quran Recitations**: 308 recitations available ✅
- **Lectures**: ⚠️ **NO LECTURES UPLOADED YET** - See instructions below

## ⚠️ Missing Content: Islamic Lectures

### Why Lectures Don't Show Up

The database has **0 lecture videos** uploaded. The lecture categories exist (Tafsir, Hadith Studies, Fiqh, Aqeedah, Seerah, Contemporary Issues, Ramadan Specials, Youth & Family), but no actual lecture videos have been added to these categories.

### How to Add Lectures

You have two options:

#### Option 1: Use the Admin Panel (Recommended)
1. Open the app
2. Tap your username 5 times quickly on the Profile tab
3. Enter PIN: `1234`
4. You'll see the Admin Panel
5. Choose "Add Lectures" or "Import YouTube Playlist"
6. Add individual lectures or import entire YouTube playlists

#### Option 2: Direct Database Insert
Use the Supabase dashboard to insert videos into the `videos` table with a `category_id` that matches one of the lecture categories.

Example SQL:
```sql
INSERT INTO videos (title, video_url, thumbnail_url, category_id, scholar_name, description)
VALUES (
  'Introduction to Tafsir',
  'https://www.youtube.com/watch?v=VIDEO_ID',
  'https://i.ytimg.com/vi/VIDEO_ID/maxresdefault.jpg',
  'e66930fa-9ee8-474c-8489-a1b244d11f32', -- Tafsir category ID
  'Sheikh Name',
  'Description of the lecture'
);
```

## 🔍 Debugging in TestFlight

### Check Console Logs

The app now includes comprehensive logging. If content doesn't load:

1. **Daily Verse/Hadith Issues**:
   - Look for logs starting with `📖 HomeScreen: Loading daily content...`
   - Check if user is logged in: `👤 User: ID: xxx` or `Not logged in`
   - Verify data loading: `✅ Loaded X verses` and `✅ Loaded X hadiths`

2. **Lecture Issues**:
   - Look for logs in the Lectures screen
   - Check: `Loaded X lectures: Y categories, Z uncategorized`
   - If you see `0 lectures`, you need to add content via admin panel

3. **Recitation Issues**:
   - Similar to lectures, check the console logs
   - Should see `Loaded 308 recitations` if working correctly

### Pull to Refresh

If content doesn't appear:
1. Pull down on the Home screen to refresh
2. This will reload daily verses, hadiths, prayer times, and Iman scores
3. Check the console logs for any errors

## 📊 Database Status

Current content in your Supabase database:

| Content Type | Count | Status |
|-------------|-------|--------|
| Daily Verses | 100 | ✅ Active |
| Daily Hadiths | 97 | ✅ Active |
| Lecture Categories | 8 | ✅ Created |
| Lecture Videos | 0 | ❌ **NEEDS CONTENT** |
| Recitation Categories | 6 | ✅ Created |
| Recitation Videos | 308 | ✅ Active |

## 🔐 Authentication

The app works both with and without authentication:

- **Without Login**: Shows random daily verse/hadith, but doesn't save user preferences
- **With Login**: Saves daily content selection, tracks progress, syncs across devices

## 🚀 Next Steps

1. **Add Lectures**: Use the admin panel to add Islamic lectures
2. **Test in TestFlight**: Verify all content loads properly
3. **Check Notifications**: Ensure prayer notifications work
4. **Verify Location**: Check that prayer times are accurate for your location

## 📱 TestFlight Testing Checklist

- [ ] Daily verse displays on home screen
- [ ] Daily hadith displays on home screen
- [ ] Prayer times show correctly for your location
- [ ] Iman Tracker rings display properly
- [ ] Recitations load in Learning tab (should see 308)
- [ ] Lectures load in Learning tab (will be empty until you add content)
- [ ] Prayer notifications work (check notification settings)
- [ ] Pull-to-refresh works on home screen

## 🆘 Troubleshooting

### "No verse available today"
- Pull down to refresh
- Check internet connection
- Verify Supabase is accessible

### "No lectures yet"
- This is expected - add lectures via admin panel
- See "How to Add Lectures" section above

### Prayer times not showing
- Enable location permissions
- Check GPS is working
- Pull down to refresh

### Iman Tracker not updating
- Make sure you're logged in
- Complete activities (prayers, Quran reading, etc.)
- Scores update in real-time

## 📞 Support

If you encounter issues not covered here:
1. Check the console logs for detailed error messages
2. Verify your Supabase connection is working
3. Ensure all required permissions are granted (Location, Notifications)
4. Try logging out and back in

---

**Note**: The app is fully functional in TestFlight. The only missing piece is lecture content, which you can easily add through the admin panel.
