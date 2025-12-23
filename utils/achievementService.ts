
import { supabase } from '@/lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { sendAchievementUnlocked } from './notificationService';

interface AchievementProgress {
  achievement_id: string;
  current_value: number;
}

interface UserStats {
  total_prayers: number;
  total_dhikr: number;
  total_quran_pages: number;
  current_streak: number;
  days_active: number;
  lectures_watched: number;
  quizzes_completed: number;
  workouts_completed: number;
  meditation_sessions: number;
}

// Calculate user stats from various sources (optimized with parallel queries)
export async function calculateUserStats(userId: string): Promise<UserStats> {
  try {
    // Execute all queries in parallel for better performance
    const [
      userStatsResult,
      streakResult,
      lecturesResult,
      quizzesResult,
      workoutsResult,
      meditationResult
    ] = await Promise.all([
      supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', userId)
        .single(),
      supabase
        .from('user_streaks')
        .select('current_streak, total_days_active')
        .eq('user_id', userId)
        .single(),
      supabase
        .from('tracked_content')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('content_type', 'lecture')
        .eq('completed', true),
      supabase
        .from('user_quiz_attempts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId),
      supabase
        .from('physical_activities')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId),
      supabase
        .from('meditation_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
    ]);

    return {
      total_prayers: userStatsResult.data?.total_prayers || 0,
      total_dhikr: userStatsResult.data?.total_dhikr || 0,
      total_quran_pages: userStatsResult.data?.total_quran_pages || 0,
      current_streak: streakResult.data?.current_streak || 0,
      days_active: streakResult.data?.total_days_active || 0,
      lectures_watched: lecturesResult.count || 0,
      quizzes_completed: quizzesResult.count || 0,
      workouts_completed: workoutsResult.count || 0,
      meditation_sessions: meditationResult.count || 0,
    };
  } catch (error) {
    console.log('Error calculating user stats:', error);
    return {
      total_prayers: 0,
      total_dhikr: 0,
      total_quran_pages: 0,
      current_streak: 0,
      days_active: 0,
      lectures_watched: 0,
      quizzes_completed: 0,
      workouts_completed: 0,
      meditation_sessions: 0,
    };
  }
}

// Update achievement progress
export async function updateAchievementProgress(
  userId: string,
  achievementId: string,
  currentValue: number
): Promise<void> {
  try {
    const { error } = await supabase
      .from('achievement_progress')
      .upsert({
        user_id: userId,
        achievement_id: achievementId,
        current_value: currentValue,
        last_updated: new Date().toISOString(),
      }, {
        onConflict: 'user_id,achievement_id'
      });

    if (error) {
      console.log('Error updating achievement progress:', error);
    }
  } catch (error) {
    console.log('Error in updateAchievementProgress:', error);
  }
}

// Check and unlock achievements (optimized)
export async function checkAndUnlockAchievements(userId: string): Promise<string[]> {
  try {
    const unlockedAchievements: string[] = [];

    // Get user stats
    const stats = await calculateUserStats(userId);

    // Load all data in parallel
    const [achievementsResult, userAchievementsResult] = await Promise.all([
      supabase
        .from('achievements')
        .select('*')
        .eq('is_active', true),
      supabase
        .from('user_achievements')
        .select('achievement_id')
        .eq('user_id', userId)
    ]);

    if (achievementsResult.error || !achievementsResult.data) {
      console.log('Error loading achievements:', achievementsResult.error);
      return [];
    }

    const achievements = achievementsResult.data;
    const unlockedIds = new Set(
      (userAchievementsResult.data || []).map(ua => ua.achievement_id)
    );

    // Batch progress updates
    const progressUpdates: any[] = [];
    const achievementsToUnlock: any[] = [];

    // Check each achievement
    for (const achievement of achievements) {
      // Skip if already unlocked
      if (unlockedIds.has(achievement.id)) {
        continue;
      }

      // Get current value based on requirement type
      let currentValue = 0;
      switch (achievement.requirement_type) {
        case 'total_prayers':
          currentValue = stats.total_prayers;
          break;
        case 'total_dhikr':
          currentValue = stats.total_dhikr;
          break;
        case 'total_quran_pages':
          currentValue = stats.total_quran_pages;
          break;
        case 'streak':
          currentValue = stats.current_streak;
          break;
        case 'days_active':
          currentValue = stats.days_active;
          break;
        case 'lectures_watched':
          currentValue = stats.lectures_watched;
          break;
        case 'quizzes_completed':
          currentValue = stats.quizzes_completed;
          break;
        case 'workouts_completed':
          currentValue = stats.workouts_completed;
          break;
        case 'meditation_sessions':
          currentValue = stats.meditation_sessions;
          break;
        default:
          currentValue = 0;
      }

      // Add to batch progress update
      progressUpdates.push({
        user_id: userId,
        achievement_id: achievement.id,
        current_value: currentValue,
        last_updated: new Date().toISOString(),
      });

      // Check if achievement should be unlocked
      if (currentValue >= achievement.requirement_value) {
        achievementsToUnlock.push({
          user_id: userId,
          achievement_id: achievement.id,
          unlocked_at: new Date().toISOString(),
        });
        unlockedAchievements.push(achievement.id);
      }
    }

    // Batch update progress (upsert all at once)
    if (progressUpdates.length > 0) {
      const { error: progressError } = await supabase
        .from('achievement_progress')
        .upsert(progressUpdates, {
          onConflict: 'user_id,achievement_id'
        });

      if (progressError) {
        console.log('Error batch updating progress:', progressError);
      }
    }

    // Batch unlock achievements
    if (achievementsToUnlock.length > 0) {
      const { error: unlockError } = await supabase
        .from('user_achievements')
        .insert(achievementsToUnlock);

      if (!unlockError) {
        // Send notifications for newly unlocked achievements
        for (const unlock of achievementsToUnlock) {
          const achievement = achievements.find(a => a.id === unlock.achievement_id);
          if (achievement) {
            // Send notification (don't await to avoid blocking)
            sendAchievementUnlocked(
              achievement.title,
              achievement.unlock_message || achievement.description
            ).catch(err => console.log('Error sending notification:', err));

            // Store locally for celebration
            const celebrationKey = `achievement_celebration_${achievement.id}`;
            AsyncStorage.setItem(celebrationKey, JSON.stringify({
              achievement,
              unlockedAt: unlock.unlocked_at,
            })).catch(err => console.log('Error storing celebration:', err));
          }
        }
      } else {
        console.log('Error batch unlocking achievements:', unlockError);
      }
    }

    return unlockedAchievements;
  } catch (error) {
    console.log('Error in checkAndUnlockAchievements:', error);
    return [];
  }
}

// Calculate progress for a specific achievement
export async function calculateAchievementProgress(
  userId: string,
  achievementId: string
): Promise<{ current: number; required: number; percentage: number }> {
  try {
    // Get achievement details
    const { data: achievement } = await supabase
      .from('achievements')
      .select('*')
      .eq('id', achievementId)
      .single();

    if (!achievement) {
      return { current: 0, required: 0, percentage: 0 };
    }

    // Get user stats
    const stats = await calculateUserStats(userId);

    // Get current value based on requirement type
    let currentValue = 0;
    switch (achievement.requirement_type) {
      case 'total_prayers':
        currentValue = stats.total_prayers;
        break;
      case 'total_dhikr':
        currentValue = stats.total_dhikr;
        break;
      case 'total_quran_pages':
        currentValue = stats.total_quran_pages;
        break;
      case 'streak':
        currentValue = stats.current_streak;
        break;
      case 'days_active':
        currentValue = stats.days_active;
        break;
      case 'lectures_watched':
        currentValue = stats.lectures_watched;
        break;
      case 'quizzes_completed':
        currentValue = stats.quizzes_completed;
        break;
      case 'workouts_completed':
        currentValue = stats.workouts_completed;
        break;
      case 'meditation_sessions':
        currentValue = stats.meditation_sessions;
        break;
      default:
        currentValue = 0;
    }

    const percentage = Math.min(100, (currentValue / achievement.requirement_value) * 100);

    return {
      current: currentValue,
      required: achievement.requirement_value,
      percentage,
    };
  } catch (error) {
    console.log('Error calculating achievement progress:', error);
    return { current: 0, required: 0, percentage: 0 };
  }
}

// Get uncelebrated milestones
export async function getUncelebratedMilestones(userId: string): Promise<any[]> {
  try {
    const { data: milestones } = await supabase
      .from('achievement_milestones')
      .select(`
        *,
        achievements (*)
      `)
      .eq('user_id', userId)
      .eq('celebrated', false)
      .order('reached_at', { ascending: false });

    return milestones || [];
  } catch (error) {
    console.log('Error getting uncelebrated milestones:', error);
    return [];
  }
}

// Mark milestone as celebrated
export async function markMilestoneAsCelebrated(milestoneId: string): Promise<void> {
  try {
    await supabase
      .from('achievement_milestones')
      .update({ celebrated: true })
      .eq('id', milestoneId);
  } catch (error) {
    console.log('Error marking milestone as celebrated:', error);
  }
}

// Get achievement suggestions based on user progress
export async function getAchievementSuggestions(userId: string): Promise<any[]> {
  try {
    // Get user stats
    const stats = await calculateUserStats(userId);

    // Get all achievements
    const { data: achievements } = await supabase
      .from('achievements')
      .select('*')
      .eq('is_active', true);

    if (!achievements) return [];

    // Get unlocked achievements
    const { data: userAchievements } = await supabase
      .from('user_achievements')
      .select('achievement_id')
      .eq('user_id', userId);

    const unlockedIds = new Set(userAchievements?.map(ua => ua.achievement_id) || []);

    // Calculate progress for each locked achievement
    const suggestions = achievements
      .filter(a => !unlockedIds.has(a.id))
      .map(achievement => {
        let currentValue = 0;
        switch (achievement.requirement_type) {
          case 'total_prayers':
            currentValue = stats.total_prayers;
            break;
          case 'total_dhikr':
            currentValue = stats.total_dhikr;
            break;
          case 'total_quran_pages':
            currentValue = stats.total_quran_pages;
            break;
          case 'streak':
            currentValue = stats.current_streak;
            break;
          case 'days_active':
            currentValue = stats.days_active;
            break;
          case 'lectures_watched':
            currentValue = stats.lectures_watched;
            break;
          case 'quizzes_completed':
            currentValue = stats.quizzes_completed;
            break;
          case 'workouts_completed':
            currentValue = stats.workouts_completed;
            break;
          case 'meditation_sessions':
            currentValue = stats.meditation_sessions;
            break;
        }

        const progress = (currentValue / achievement.requirement_value) * 100;

        return {
          ...achievement,
          current_value: currentValue,
          progress,
          remaining: achievement.requirement_value - currentValue,
        };
      })
      .filter(a => a.progress > 0) // Only show achievements with some progress
      .sort((a, b) => b.progress - a.progress) // Sort by progress descending
      .slice(0, 3); // Top 3 suggestions

    return suggestions;
  } catch (error) {
    console.log('Error getting achievement suggestions:', error);
    return [];
  }
}
