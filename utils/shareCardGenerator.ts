/**
 * ============================================================================
 * SHARE CARD GENERATOR
 * ============================================================================
 * 
 * Generates beautiful shareable cards for achievements, streaks, and milestones
 * Supports sharing to Instagram Stories, Snapchat, WhatsApp, etc.
 */

import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography } from '@/styles/commonStyles';

// Standard share card dimensions (Instagram Stories: 1080x1920)
export const SHARE_CARD_WIDTH = 1080;
export const SHARE_CARD_HEIGHT = 1920;
export const SHARE_CARD_ASPECT_RATIO = SHARE_CARD_HEIGHT / SHARE_CARD_WIDTH;

export type ShareCardType = 
  | 'prayer_streak'
  | 'workout_streak'
  | 'quran_streak'
  | 'iman_score'
  | 'prayer_percentage'
  | 'achievement'
  | 'milestone';

export interface ShareCardData {
  type: ShareCardType;
  title: string;
  subtitle?: string;
  value: string | number;
  description?: string;
  icon?: string;
  color?: string;
  gradient?: string[];
}

/**
 * Get gradient colors for share card type
 */
export function getShareCardGradient(type: ShareCardType): string[] {
  switch (type) {
    case 'prayer_streak':
      return ['#10B981', '#059669', '#047857']; // Green
    case 'workout_streak':
      return ['#F59E0B', '#D97706', '#B45309']; // Amber
    case 'quran_streak':
      return ['#3B82F6', '#2563EB', '#1D4ED8']; // Blue
    case 'iman_score':
      return ['#8B5CF6', '#7C3AED', '#6D28D9']; // Purple
    case 'prayer_percentage':
      return ['#10B981', '#059669', '#047857']; // Green
    case 'achievement':
      return ['#F59E0B', '#D97706', '#B45309']; // Gold
    case 'milestone':
      return ['#EC4899', '#DB2777', '#BE185D']; // Pink
    default:
      return ['#6366F1', '#4F46E5', '#4338CA']; // Indigo
  }
}

/**
 * Get icon name for share card type
 */
export function getShareCardIcon(type: ShareCardType): { ios: string; android: string } {
  switch (type) {
    case 'prayer_streak':
      return { ios: 'moon.stars.fill', android: 'self-improvement' };
    case 'workout_streak':
      return { ios: 'figure.run', android: 'fitness-center' };
    case 'quran_streak':
      return { ios: 'book.fill', android: 'menu-book' };
    case 'iman_score':
      return { ios: 'chart.pie.fill', android: 'pie-chart' };
    case 'prayer_percentage':
      return { ios: 'checkmark.circle.fill', android: 'check-circle' };
    case 'achievement':
      return { ios: 'trophy.fill', android: 'emoji-events' };
    case 'milestone':
      return { ios: 'star.fill', android: 'star' };
    default:
      return { ios: 'sparkles', android: 'auto-awesome' };
  }
}

/**
 * Generate share card data for prayer streak
 */
export function generatePrayerStreakCard(days: number): ShareCardData {
  return {
    type: 'prayer_streak',
    title: days === 0 
      ? 'Starting My Prayer Journey'
      : `${days} Day${days !== 1 ? 's' : ''} of Consistent Prayer`,
    subtitle: days === 0 
      ? 'Building the habit, one prayer at a time'
      : days === 1
      ? 'First day complete!'
      : 'All 5 prayers completed',
    value: days,
    description: days === 0
      ? 'Every journey begins with a single step!'
      : days === 1 
      ? 'Starting my prayer journey!'
      : days < 7
      ? 'Building consistency!'
      : days < 30
      ? 'Week after week of dedication!'
      : days < 100
      ? 'Month after month of commitment!'
      : 'Incredible dedication!',
    gradient: getShareCardGradient('prayer_streak'),
  };
}

/**
 * Generate share card data for workout streak
 */
export function generateWorkoutStreakCard(days: number): ShareCardData {
  return {
    type: 'workout_streak',
    title: days === 0
      ? 'Starting My Fitness Journey'
      : `${days} Day${days !== 1 ? 's' : ''} of Consistent Workouts`,
    subtitle: days === 0
      ? 'Ready to get active!'
      : 'Staying active',
    value: days,
    description: days === 0
      ? 'Ready to build strength and health!'
      : days === 1
      ? 'First workout complete!'
      : days < 7
      ? 'Building the habit!'
      : days < 30
      ? 'Week after week of fitness!'
      : 'Incredible dedication to health!',
    gradient: getShareCardGradient('workout_streak'),
  };
}

/**
 * Generate share card data for Quran streak
 */
export function generateQuranStreakCard(days: number): ShareCardData {
  return {
    type: 'quran_streak',
    title: days === 0
      ? 'Starting My Quran Journey'
      : `${days} Day${days !== 1 ? 's' : ''} of Quran Reading`,
    subtitle: days === 0
      ? 'Connecting with the words of Allah'
      : 'Connecting with the Quran',
    value: days,
    description: days === 0
      ? 'Every page brings us closer to Allah!'
      : days === 1
      ? 'Starting my Quran journey!'
      : days < 7
      ? 'Building a daily habit!'
      : days < 30
      ? 'Week after week of reflection!'
      : 'Incredible dedication to learning!',
    gradient: getShareCardGradient('quran_streak'),
  };
}

/**
 * Generate share card data for Iman score
 */
export function generateImanScoreCard(score: number, isHighest: boolean = false): ShareCardData {
  return {
    type: 'iman_score',
    title: isHighest ? 'Highest Iman Score Yet!' : `Iman Score: ${score}%`,
    subtitle: isHighest ? 'New personal best!' : 'Tracking my spiritual growth',
    value: `${score}%`,
    description: score >= 90
      ? 'Excellent! Keep up the amazing work!'
      : score >= 75
      ? 'Great progress! You\'re doing well!'
      : score >= 60
      ? 'Good progress! Keep going!'
      : 'Every step forward counts!',
    gradient: getShareCardGradient('iman_score'),
  };
}

/**
 * Generate share card data for prayer percentage
 */
export function generatePrayerPercentageCard(percentage: number, period: 'week' | 'month' = 'week'): ShareCardData {
  return {
    type: 'prayer_percentage',
    title: `${percentage}% Fard Prayers This ${period === 'week' ? 'Week' : 'Month'}`,
    subtitle: percentage === 100 ? 'Perfect completion!' : 'Great consistency!',
    value: `${percentage}%`,
    description: percentage === 100
      ? 'All prayers completed!'
      : percentage >= 90
      ? 'Almost perfect!'
      : percentage >= 75
      ? 'Great consistency!'
      : 'Keep building the habit!',
    gradient: getShareCardGradient('prayer_percentage'),
  };
}

/**
 * Generate share card data for achievement
 */
export function generateAchievementCard(achievementName: string, description: string): ShareCardData {
  return {
    type: 'achievement',
    title: 'Achievement Unlocked!',
    subtitle: achievementName,
    value: '🏆',
    description,
    gradient: getShareCardGradient('achievement'),
  };
}

/**
 * Generate share card data for milestone
 */
export function generateMilestoneCard(milestone: string, value: string | number): ShareCardData {
  return {
    type: 'milestone',
    title: milestone,
    subtitle: 'Milestone reached!',
    value: typeof value === 'number' ? value.toString() : value,
    description: 'Celebrating this achievement!',
    gradient: getShareCardGradient('milestone'),
  };
}
