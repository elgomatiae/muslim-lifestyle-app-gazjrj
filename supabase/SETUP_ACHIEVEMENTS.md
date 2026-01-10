# Achievements System Setup Guide

## Quick Setup

The achievements system is now ready! Follow these steps:

### Step 1: Create Tables in Supabase (Recommended)

1. Open your Supabase Dashboard
2. Go to SQL Editor
3. Copy and paste the entire contents of `project/supabase/create_achievements_system.sql`
4. Click "Run" to execute
5. Verify tables were created:
   - `achievements` (should have 49 achievements)
   - `user_achievements`
   - `achievement_progress`

### Step 2: Verify Setup

Run this query to check achievements were created:

```sql
SELECT COUNT(*) as total, category 
FROM achievements 
GROUP BY category;
```

You should see:
- ibadah: ~21 achievements
- ilm: ~13 achievements  
- amanah: ~12 achievements
- general: ~9 achievements

### Step 3: Enable RLS (Row Level Security)

The SQL script already sets up RLS policies, but verify they're enabled:

```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('achievements', 'user_achievements', 'achievement_progress');
```

### Step 4: Test in App

1. Open the app and navigate to Iman Tracker > Achievements tab
2. You should now see all achievements with progress tracking
3. Complete some activities (prayers, dhikr, Quran reading) to see progress update
4. Achievements will automatically unlock when requirements are met

## Local Fallback (No Supabase Required)

If Supabase tables aren't available, the app will automatically use local achievements stored in `project/data/localAchievements.ts`. These achievements work with your Iman tracker data and are stored locally using AsyncStorage.

## How Achievements Are Tracked

### Prayer Achievements
- Progress is calculated from your daily prayer completions in Iman Tracker
- Each completed fard prayer (Fajr, Dhuhr, Asr, Maghrib, Isha) counts as 1

### Dhikr Achievements  
- Progress is calculated from your dhikr completions
- Based on your daily dhikr goal completions

### Quran Achievements
- Progress is calculated from pages read
- Based on your Quran reading logs in Iman Tracker

### Lecture Achievements
- Progress is calculated from completed lectures
- When you mark a lecture as completed in the Learning tab

### Streak Achievements
- Progress is calculated from your daily activity streak
- Based on consecutive days with any activity

## Troubleshooting

### "No achievements found"
- **Solution**: Run the SQL script in Supabase or use the local fallback (automatically enabled)

### Achievements not unlocking
- **Solution**: Make sure you're completing activities in the Iman Tracker
- Check that achievement progress is being calculated correctly

### Progress not updating
- **Solution**: Refresh the achievements screen
- Complete a new activity to trigger progress update

## Next Steps

After setup, achievements will:
1. ✅ Show in the Achievements tab
2. ✅ Track progress automatically
3. ✅ Unlock when requirements are met
4. ✅ Display celebrations when unlocked
5. ✅ Show in your profile and community stats

Enjoy your achievements system! 🏆
