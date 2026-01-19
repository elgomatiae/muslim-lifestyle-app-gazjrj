/**
 * ============================================================================
 * ACCESS GATE SYSTEM
 * ============================================================================
 * 
 * Manages access gates that require watching ads to unlock features
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
// Lazy import adConfig to avoid loading AdMob module in Expo Go

// Feature keys for AsyncStorage
const ACCESS_GATE_STORAGE_KEY = '@access_gates_unlocked';

// Features that require ad access
export type GatedFeature = 
  | 'lectures'
  | 'recitations'
  | 'wellness_mental'
  | 'wellness_physical'
  | 'wellness_journal'
  | 'wellness_meditation'
  | 'wellness_duas'
  | 'wellness_support'
  | 'wellness_activity'
  | 'wellness_sleep'
  | 'wellness_goals'
  | 'wellness_history';

interface UnlockedFeatures {
  [key: string]: boolean;
}

/**
 * Check if a feature is unlocked
 */
export async function isFeatureUnlocked(feature: GatedFeature): Promise<boolean> {
  try {
    const stored = await AsyncStorage.getItem(ACCESS_GATE_STORAGE_KEY);
    if (!stored) return false;
    
    const unlocked: UnlockedFeatures = JSON.parse(stored);
    return unlocked[feature] === true;
  } catch (error) {
    console.error('Error checking feature unlock status:', error);
    return false;
  }
}

/**
 * Unlock a feature (after watching ad)
 */
export async function unlockFeature(feature: GatedFeature): Promise<void> {
  try {
    const stored = await AsyncStorage.getItem(ACCESS_GATE_STORAGE_KEY);
    const unlocked: UnlockedFeatures = stored ? JSON.parse(stored) : {};
    
    unlocked[feature] = true;
    await AsyncStorage.setItem(ACCESS_GATE_STORAGE_KEY, JSON.stringify(unlocked));
  } catch (error) {
    console.error('Error unlocking feature:', error);
  }
}

/**
 * Check if user can access a feature, and show ad if needed
 * @param feature The feature to check
 * @param onUnlocked Callback when feature is unlocked (after ad)
 * @param onCancelled Callback when user cancels or ad fails
 * @returns true if already unlocked, false if needs ad
 */
export async function checkAccessGate(
  feature: GatedFeature,
  onUnlocked?: () => void,
  onCancelled?: () => void
): Promise<boolean> {
  // Check if already unlocked
  const isUnlocked = await isFeatureUnlocked(feature);
  if (isUnlocked) {
    return true;
  }

  // Lazy load ad config to avoid crashes in Expo Go
  try {
    const adConfig = await import('./adConfig');
    const showRewardedAd = adConfig.showRewardedAd;
    
    // Show ad to unlock
    const adShown = await showRewardedAd((reward) => {
      // User watched the ad and earned reward
      unlockFeature(feature).then(() => {
        Alert.alert(
          'Access Granted! 🎉',
          'You now have access to this feature!',
          [{ text: 'OK', onPress: () => onUnlocked?.() }]
        );
      });
    });

    if (!adShown) {
      // Ad not available or user cancelled
      Alert.alert(
        'Ad Not Available',
        'The ad is not ready. Please try again later.',
        [{ text: 'OK', onPress: () => onCancelled?.() }]
      );
      return false;
    }

    // Return false - access will be granted after ad completes
    return false;
  } catch (error) {
    // AdMob module not available (Expo Go)
    console.log('AdMob not available:', error);
    Alert.alert(
      'Feature Unavailable',
      'This feature requires watching an ad. Please rebuild the app with native code to enable ads.',
      [{ text: 'OK', onPress: () => onCancelled?.() }]
    );
    return false;
  }
}

/**
 * Get feature display name
 */
export function getFeatureName(feature: GatedFeature): string {
  const names: Record<GatedFeature, string> = {
    lectures: 'Lectures',
    recitations: 'Recitations',
    wellness_mental: 'Mental Health',
    wellness_physical: 'Physical Health',
    wellness_journal: 'Journal',
    wellness_meditation: 'Meditation',
    wellness_duas: 'Healing Duas',
    wellness_support: 'Support',
    wellness_activity: 'Activity Tracker',
    wellness_sleep: 'Sleep Tracker',
    wellness_goals: 'Physical Goals',
    wellness_history: 'Activity History',
  };
  return names[feature] || feature;
}
