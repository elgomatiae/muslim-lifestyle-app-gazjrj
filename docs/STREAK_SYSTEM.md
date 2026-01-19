# Streak System Documentation

## Overview
The streak system tracks daily user activity across all Iman tracker actions. A day is considered "active" if the user completes ANY action (prayer, Quran reading, dhikr, exercise, etc.). The system maintains:
- **Current Streak**: Consecutive days of activity
- **Longest Streak**: Best streak ever achieved
- **Total Days Active**: Total number of days with activity

## How It Works

### 1. Action Tracking
Every action in the app triggers a streak update:
- **Ibadah Actions**: Prayers, Quran reading, dhikr, dua, fasting
- **Ilm Actions**: Lectures, recitations, quizzes, reflections
- **Amanah Actions**: Exercise, water, sleep, workouts, meditation, journal entries

### 2. Streak Logic
- **First Day**: If no previous activity, starts at 1 day
- **Consecutive Days**: If yesterday was active, increments current streak
- **Broken Streak**: If more than 1 day gap, resets to 1 day
- **Same Day**: Multiple actions on the same day don't increment streak (only counts once per day)

### 3. Data Storage
- **Local Storage**: Primary storage in AsyncStorage (works offline)
- **Supabase**: Synced to `user_stats` table (column: `days_active`)
- **Fallback**: If `user_stats` doesn't exist, tries `user_streaks` table

## Integration Points

### Activity Logging
All activities are logged through:
1. `activityLogger.ts` - Central activity logging (automatically updates streak)
2. `activityLoggingHelper.ts` - Ibadah, Ilm, Amanah activity helpers (updates streak)
3. `imanActivityIntegration.ts` - Direct activity tracking (updates streak)

### UI Components
- `StreakDisplay.tsx` - Compact streak display
- `StreakCard.tsx` - Full-featured streak card
- Displayed on:
  - Home screen
  - Iman Tracker screen

## Database Schema

### user_stats Table
```sql
current_streak INTEGER DEFAULT 0
longest_streak INTEGER DEFAULT 0
days_active INTEGER DEFAULT 0  -- Note: column name is 'days_active'
last_active_date DATE
```

### Sync Process
1. Action completed → `updateStreakOnAction()` called
2. Streak calculated and saved locally
3. Synced to Supabase with retry logic (3 attempts)
4. Falls back gracefully if Supabase unavailable

## Achievements
Streak achievements are tracked:
- 3 days, 7 days, 14 days, 30 days, 60 days, 90 days, 180 days, 365 days
- Achievements are automatically checked when streak updates

## Testing
To verify streaks work:
1. Complete any action (prayer, Quran, etc.)
2. Check streak display on home screen or Iman tracker
3. Verify streak increments on consecutive days
4. Verify streak resets if day is missed
5. Check Supabase `user_stats` table for sync

## Troubleshooting
- **Streak not updating**: Check that action is logged through `activityLogger.ts`
- **Supabase sync failing**: Check network connection, verify table exists
- **Streak resetting incorrectly**: Check date calculation logic in `updateStreakOnAction()`
