/**
 * ============================================================================
 * AUTO-SHARE SERVICE
 * ============================================================================
 * 
 * Automatically suggests sharing when milestones are reached
 */

import { ShareCardData, generatePrayerStreakCard, generateWorkoutStreakCard, generateQuranStreakCard, generateImanScoreCard, generatePrayerPercentageCard } from './shareCardGenerator';

export interface MilestoneEvent {
  type: 'prayer_streak' | 'workout_streak' | 'quran_streak' | 'iman_score' | 'prayer_percentage';
  value: number;
  isNewRecord?: boolean;
  period?: 'week' | 'month';
}

/**
 * Check if a milestone should trigger a share suggestion
 */
export function shouldSuggestShare(event: MilestoneEvent): boolean {
  switch (event.type) {
    case 'prayer_streak':
      // Suggest at 3, 7, 14, 30, 60, 90, 100, 180, 365 days
      return [3, 7, 14, 30, 60, 90, 100, 180, 365].includes(event.value);
    case 'workout_streak':
      return [3, 7, 14, 30, 60, 90, 100].includes(event.value);
    case 'quran_streak':
      return [3, 7, 14, 30, 60, 90, 100].includes(event.value);
    case 'iman_score':
      return event.isNewRecord || false;
    case 'prayer_percentage':
      return event.value === 100; // Only suggest for 100%
    default:
      return false;
  }
}

/**
 * Generate share card for a milestone event
 */
export function generateShareCardForMilestone(event: MilestoneEvent): ShareCardData | null {
  if (!shouldSuggestShare(event)) {
    return null;
  }

  switch (event.type) {
    case 'prayer_streak':
      return generatePrayerStreakCard(event.value);
    case 'workout_streak':
      return generateWorkoutStreakCard(event.value);
    case 'quran_streak':
      return generateQuranStreakCard(event.value);
    case 'iman_score':
      return generateImanScoreCard(event.value, event.isNewRecord);
    case 'prayer_percentage':
      return generatePrayerPercentageCard(event.value, event.period || 'week');
    default:
      return null;
  }
}

/**
 * Get milestone message for notification
 */
export function getMilestoneMessage(event: MilestoneEvent): string {
  switch (event.type) {
    case 'prayer_streak':
      return `🎉 ${event.value} days of consistent prayer! Share your achievement?`;
    case 'workout_streak':
      return `🎉 ${event.value} days of workouts! Share your progress?`;
    case 'quran_streak':
      return `🎉 ${event.value} days of Quran reading! Share your journey?`;
    case 'iman_score':
      return `🎉 New highest Iman score: ${event.value}%! Share your growth?`;
    case 'prayer_percentage':
      return `🎉 ${event.value}% prayers completed this ${event.period || 'week'}! Share your consistency?`;
    default:
      return '🎉 Milestone reached! Share your achievement?';
  }
}
