
# Achievement System Guide

## Overview

The achievement system in the Muslim Lifestyle app tracks user progress across various activities and unlocks achievements when specific milestones are reached. This guide explains how the system works and how each achievement is linked to user actions.

## Architecture

### Core Components

1. **`achievementService.ts`** - Main service for achievement tracking and unlocking
2. **`imanActivityIntegration.ts`** - Integration layer between Iman Tracker and achievements
3. **`user_stats` table** - Single source of truth for lifetime statistics
4. **`achievements` table** - Defines all available achievements
5. **`user_achievements` table** - Tracks which achievements users have unlocked
6. **`achievement_progress` table** - Tracks current progress toward each achievement

### Data Flow

```
User Action (Prayer/Dhikr/Quran/etc.)
    ↓
Iman Tracker Context Updates
    ↓
Activity Integration Layer (imanActivityIntegration.ts)
    ↓
user_stats Table Updated (lifetime totals)
    ↓
Achievement Service Checks Progress (achievementService.ts)
    ↓
Achievement Unlocked (if criteria met)
    ↓
Notification Sent + UI Updated
```

## Achievement Categories

### 1. Ibadah (Worship) Achievements

#### Prayer Achievements (`total_prayers`)
- **Tracking**: Counts completed fard prayers (Fajr, Dhuhr, Asr, Maghrib, Isha)
- **Data Source**: `user_stats.total_prayers`
- **Update Trigger**: When user marks a fard prayer as completed in Iman Tracker
- **Achievements**:
  - First Prayer (1 prayer)
  - Prayer Beginner (25 prayers)
  - Prayer Apprentice (50 prayers)
  - Prayer Champion (100 prayers)
  - Prayer Master (250 prayers)
  - Prayer Legend (500 prayers)
  - Prayer Icon (1000 prayers)

#### Dhikr Achievements (`total_dhikr`)
- **Tracking**: Counts total dhikr recitations
- **Data Source**: `user_stats.total_dhikr`
- **Update Trigger**: When user completes dhikr in Iman Tracker
- **Achievements**:
  - First Dhikr (100 dhikr)
  - Dhikr Beginner (1,000 dhikr)
  - Dhikr Enthusiast (5,000 dhikr)
  - Dhikr Master (10,000 dhikr)
  - Dhikr Champion (25,000 dhikr)
  - Dhikr Legend (50,000 dhikr)
  - Dhikr Icon (100,000 dhikr)

#### Quran Achievements (`total_quran_pages`)
- **Tracking**: Counts total Quran pages read
- **Data Source**: `user_stats.total_quran_pages`
- **Update Trigger**: When user logs Quran reading in Iman Tracker
- **Achievements**:
  - First Page (1 page)
  - Quran Beginner (10 pages)
  - Quran Reader (30 pages)
  - Quran Lover (100 pages)
  - Quran Devotee (300 pages)
  - Quran Completer (604 pages - full Quran)
  - Quran Master (1,208 pages - 2x full Quran)

### 2. Ilm (Knowledge) Achievements

#### Lecture Achievements (`lectures_watched`)
- **Tracking**: Counts completed Islamic lectures
- **Data Source**: `tracked_content` table (where `content_type='lecture'` and `completed=true`)
- **Update Trigger**: When user marks a lecture as completed
- **Achievements**:
  - First Lesson (1 lecture)
  - Knowledge Seeker (5 lectures)
  - Knowledge Student (10 lectures)
  - Knowledge Scholar (25 lectures)
  - Knowledge Master (50 lectures)
  - Knowledge Expert (100 lectures)
  - Knowledge Icon (200 lectures)

#### Quiz Achievements (`quizzes_completed`)
- **Tracking**: Counts completed quizzes
- **Data Source**: `user_quiz_attempts` table
- **Update Trigger**: When user completes a quiz
- **Achievements**:
  - First Quiz (1 quiz)
  - Quiz Taker (5 quizzes)
  - Quiz Enthusiast (10 quizzes)
  - Quiz Master (25 quizzes)
  - Quiz Champion (50 quizzes)
  - Quiz Legend (100 quizzes)

### 3. Amanah (Well-Being) Achievements

#### Workout Achievements (`workouts_completed`)
- **Tracking**: Counts completed workout sessions
- **Data Source**: `physical_activities` table
- **Update Trigger**: When user logs a workout
- **Achievements**:
  - First Workout (1 workout)
  - Fitness Beginner (5 workouts)
  - Fitness Enthusiast (10 workouts)
  - Fitness Champion (25 workouts)
  - Fitness Master (50 workouts)
  - Fitness Legend (100 workouts)

#### Meditation Achievements (`meditation_sessions`)
- **Tracking**: Counts completed meditation sessions
- **Data Source**: `meditation_sessions` table
- **Update Trigger**: When user logs a meditation session
- **Achievements**:
  - First Meditation (1 session)
  - Mindfulness Beginner (5 sessions)
  - Mindfulness Practitioner (10 sessions)
  - Mindfulness Master (25 sessions)
  - Mindfulness Champion (50 sessions)
  - Mindfulness Legend (100 sessions)

### 4. General Achievements

#### Streak Achievements (`streak`)
- **Tracking**: Counts consecutive days active
- **Data Source**: `user_streaks.current_streak`
- **Update Trigger**: Automatically calculated based on daily activity
- **Achievements**:
  - Three Day Streak (3 days)
  - Week Warrior (7 days)
  - Two Week Champion (14 days)
  - Month of Dedication (30 days)
  - Two Month Master (60 days)
  - Three Month Legend (90 days)
  - Half Year Icon (180 days)
  - Year of Excellence (365 days)

#### Days Active Achievements (`days_active`)
- **Tracking**: Counts total days active (not necessarily consecutive)
- **Data Source**: `user_streaks.total_days_active`
- **Update Trigger**: Automatically calculated based on activity
- **Achievements**:
  - First Day (1 day)

## How Achievements Are Tracked

### 1. Prayer Tracking

When a user marks a prayer as completed:

```typescript
// In Iman Tracker Context
await updatePrayerGoals({
  fardPrayers: {
    fajr: true,  // User completed Fajr
    dhuhr: false,
    asr: false,
    maghrib: false,
    isha: false
  },
  // ... other fields
});

// This triggers:
// 1. Save to iman_tracker_goals table
// 2. Increment user_stats.total_prayers
// 3. Check for new achievements
```

### 2. Dhikr Tracking

When a user completes dhikr:

```typescript
// In Dhikr Counter
await updateDhikrGoals({
  dailyGoal: 100,
  dailyCompleted: 50,  // User completed 50 dhikr
  // ... other fields
});

// This triggers:
// 1. Save to iman_tracker_goals table
// 2. Increment user_stats.total_dhikr by the increase
// 3. Check for new achievements
```

### 3. Quran Tracking

When a user reads Quran:

```typescript
// In Quran Goals
await updateQuranGoals({
  dailyPagesGoal: 2,
  dailyPagesCompleted: 1,  // User read 1 page
  // ... other fields
});

// This triggers:
// 1. Save to iman_tracker_goals table
// 2. Increment user_stats.total_quran_pages by the increase
// 3. Check for new achievements
```

### 4. Lecture Tracking

When a user completes a lecture:

```typescript
// In Video Player
await supabase
  .from('tracked_content')
  .insert({
    user_id: userId,
    content_type: 'lecture',
    video_id: videoId,
    completed: true,
    completed_at: new Date().toISOString()
  });

// Then trigger achievement check
await trackLectureCompletion(userId);
```

### 5. Quiz Tracking

When a user completes a quiz:

```typescript
// In Quiz Take Screen
await supabase
  .from('user_quiz_attempts')
  .insert({
    user_id: userId,
    category_id: categoryId,
    score: score,
    total_questions: 10,
    percentage: percentage,
    completed_at: new Date().toISOString()
  });

// Then trigger achievement check
await trackQuizCompletion(userId);
```

### 6. Workout Tracking

When a user logs a workout:

```typescript
// In Activity Tracker
await supabase
  .from('physical_activities')
  .insert({
    user_id: userId,
    activity_type: 'workout',
    duration_minutes: duration,
    date: new Date().toISOString().split('T')[0]
  });

// Then trigger achievement check
await trackWorkoutCompletion(userId);
```

### 7. Meditation Tracking

When a user logs a meditation session:

```typescript
// In Meditation Screen
await supabase
  .from('meditation_sessions')
  .insert({
    user_id: userId,
    practice_type: 'mindfulness',
    duration_minutes: duration,
    date: new Date().toISOString().split('T')[0]
  });

// Then trigger achievement check
await trackMeditationSession(userId);
```

## Achievement Checking Process

The `checkAndUnlockAchievements` function runs whenever:

1. User completes any tracked activity
2. Iman Tracker Context updates (every 30 seconds)
3. User opens the Achievements screen

### Process Flow:

1. **Calculate User Stats** - Gather all lifetime statistics from various tables
2. **Load Achievements** - Get all active achievements from database
3. **Check Progress** - For each achievement, compare user's current value with requirement
4. **Update Progress** - Save current progress to `achievement_progress` table
5. **Unlock Achievements** - If requirement met, add to `user_achievements` table
6. **Send Notifications** - Notify user of newly unlocked achievements
7. **Store Celebration** - Save achievement data locally for celebration UI

## Database Schema

### user_stats Table
```sql
CREATE TABLE user_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES auth.users(id),
  total_prayers INTEGER DEFAULT 0,
  total_dhikr INTEGER DEFAULT 0,
  total_quran_pages INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_active_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### achievements Table
```sql
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon_name TEXT NOT NULL,
  requirement_type TEXT NOT NULL,  -- 'total_prayers', 'total_dhikr', etc.
  requirement_value INTEGER NOT NULL,
  points INTEGER DEFAULT 50,
  tier TEXT DEFAULT 'bronze',  -- 'bronze', 'silver', 'gold', 'platinum'
  category TEXT DEFAULT 'general',  -- 'ibadah', 'ilm', 'amanah', 'general'
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  unlock_message TEXT,
  next_steps TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### user_achievements Table
```sql
CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  achievement_id UUID REFERENCES achievements(id),
  unlocked_at TIMESTAMPTZ DEFAULT NOW()
);
```

### achievement_progress Table
```sql
CREATE TABLE achievement_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  achievement_id UUID REFERENCES achievements(id),
  current_value INTEGER DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);
```

## Testing Achievements

### Manual Testing

1. **Prayer Achievements**:
   - Go to Iman Tracker
   - Mark prayers as completed
   - Check Achievements screen to see progress

2. **Dhikr Achievements**:
   - Go to Dhikr Counter
   - Complete dhikr recitations
   - Check Achievements screen

3. **Quran Achievements**:
   - Go to Quran Goals
   - Log pages read
   - Check Achievements screen

4. **Lecture Achievements**:
   - Go to Learning tab
   - Watch and complete lectures
   - Check Achievements screen

5. **Quiz Achievements**:
   - Go to Quizzes
   - Complete quizzes
   - Check Achievements screen

6. **Workout Achievements**:
   - Go to Wellness > Physical Health
   - Log workouts
   - Check Achievements screen

7. **Meditation Achievements**:
   - Go to Wellness > Mental Health
   - Log meditation sessions
   - Check Achievements screen

### Debugging

Enable detailed logging by checking console output:

```
🏆 ========== CHECKING ACHIEVEMENTS ==========
📊 ========== CALCULATING USER STATS ==========
🕌 Prayers: X total
📿 Dhikr: X total
📖 Quran: X total pages
🎓 Lectures: X
❓ Quizzes: X
🏋️ Workouts: X
🧘 Meditation: X
🔥 Streak: X days
📅 Days Active: X days
```

## Troubleshooting

### Achievement Not Unlocking

1. **Check user_stats table**:
   ```sql
   SELECT * FROM user_stats WHERE user_id = 'your-user-id';
   ```

2. **Check achievement_progress table**:
   ```sql
   SELECT ap.*, a.title, a.requirement_value
   FROM achievement_progress ap
   JOIN achievements a ON a.id = ap.achievement_id
   WHERE ap.user_id = 'your-user-id'
   ORDER BY ap.current_value DESC;
   ```

3. **Manually trigger achievement check**:
   ```typescript
   import { checkAndUnlockAchievements } from '@/utils/achievementService';
   await checkAndUnlockAchievements(userId);
   ```

### Stats Not Updating

1. **Check iman_tracker_goals table**:
   ```sql
   SELECT * FROM iman_tracker_goals WHERE user_id = 'your-user-id';
   ```

2. **Verify activity integration is working**:
   - Check console logs for activity tracking messages
   - Ensure `imanActivityIntegration.ts` functions are being called

3. **Manually update stats**:
   ```typescript
   import { incrementPrayerCount, incrementDhikrCount, incrementQuranPagesCount } from '@/utils/achievementService';
   await incrementPrayerCount(userId, 1);
   await incrementDhikrCount(userId, 100);
   await incrementQuranPagesCount(userId, 1);
   ```

## Performance Considerations

1. **Batch Updates**: Achievement progress is updated in batches to minimize database calls
2. **Caching**: Achievement data is cached for 30 seconds to reduce load
3. **Parallel Queries**: All database queries are executed in parallel using `Promise.all()`
4. **Optimistic Updates**: UI updates immediately while background sync happens

## Future Enhancements

1. **Milestone Celebrations**: Show special UI when user reaches 25%, 50%, 75% of an achievement
2. **Achievement Suggestions**: Recommend next achievements based on user's progress
3. **Social Sharing**: Allow users to share achievements on social media
4. **Leaderboards**: Show top achievers in each category
5. **Custom Achievements**: Allow users to create personal achievement goals
6. **Achievement Badges**: Display earned badges on user profile
7. **Streak Freezes**: Allow users to freeze streaks during travel or illness
8. **Achievement Notifications**: Send push notifications for milestone progress

## Conclusion

The achievement system is now fully integrated with all user activities. Every action a user takes in the app is tracked and contributes to their achievement progress. The system is designed to be:

- **Accurate**: Single source of truth in `user_stats` table
- **Real-time**: Immediate updates when activities are completed
- **Performant**: Optimized queries and caching
- **Extensible**: Easy to add new achievement types
- **User-friendly**: Clear progress tracking and celebration UI

For any questions or issues, refer to the console logs or check the database tables directly.
