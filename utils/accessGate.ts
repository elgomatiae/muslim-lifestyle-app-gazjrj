/**
 * Access Gate Utility
 * Manages feature unlocking via rewarded ads
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { showRewardedAd } from './adConfig';

const STORAGE_KEY = '@access_gates_unlocked';

/**
 * Gated feature types
 */
export type GatedFeature =
  | 'lectures'
  | 'recitations'
  | 'wellness_journal'
  | 'wellness_meditation'
  | 'wellness_duas'
  | 'wellness_support'
  | 'wellness_activity'
  | 'wellness_sleep'
  | 'wellness_goals'
  | 'wellness_history';

/**
 * Check if a feature is already unlocked
 */
export async function isFeatureUnlocked(feature: GatedFeature): Promise<boolean> {
  try {
    const unlockedStr = await AsyncStorage.getItem(STORAGE_KEY);
    if (!unlockedStr) return false;

    const unlocked: string[] = JSON.parse(unlockedStr);
    return unlocked.includes(feature);
  } catch (error) {
    console.error('Error checking feature unlock status:', error);
    return false;
  }
}

/**
 * Unlock a feature (mark as unlocked in storage)
 */
async function unlockFeature(feature: GatedFeature): Promise<void> {
  try {
    const unlockedStr = await AsyncStorage.getItem(STORAGE_KEY);
    const unlocked: string[] = unlockedStr ? JSON.parse(unlockedStr) : [];

    if (!unlocked.includes(feature)) {
      unlocked.push(feature);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(unlocked));
      console.log(`[AccessGate] Feature unlocked: ${feature}`);
    }
  } catch (error) {
    console.error('Error unlocking feature:', error);
  }
}

/**
 * Check access gate for a feature
 * Shows ad if feature is locked, then unlocks it
 * 
 * @param feature The feature to check access for
 * @param onSuccess Callback when access is granted
 * @param onCancel Callback when user cancels or ad fails
 * @returns Promise<boolean> - true if access is granted, false otherwise
 */
export async function checkAccessGate(
  feature: GatedFeature,
  onSuccess?: () => void,
  onCancel?: () => void
): Promise<boolean> {
  try {
    // Check if already unlocked
    const isUnlocked = await isFeatureUnlocked(feature);
    if (isUnlocked) {
      console.log(`[AccessGate] Feature already unlocked: ${feature}`);
      // Don't call onSuccess here - let the caller handle navigation
      return true;
    }

    // Show confirmation modal
    return new Promise((resolve) => {
      Alert.alert(
        'Unlock Access',
        'Watch a short rewarded ad to unlock access to this feature.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => {
              console.log(`[AccessGate] User cancelled: ${feature}`);
              onCancel?.();
              resolve(false);
            },
          },
          {
            text: 'Watch Ad',
            onPress: async () => {
              console.log(`[AccessGate] Showing ad for: ${feature}`);
              
              // Show rewarded ad
              const adShown = await showRewardedAd((reward) => {
                // User watched ad and earned reward
                console.log(`[AccessGate] Ad reward earned for: ${feature}`, reward);
                
                // Unlock the feature
                unlockFeature(feature);
                
                // Show success message
                Alert.alert(
                  'Access Granted! 🎉',
                  'You now have access to this feature.',
                  [{ text: 'OK' }]
                );
                
                // Call success callback
                onSuccess?.();
                resolve(true);
              });

              if (!adShown) {
                // Ad not available
                Alert.alert(
                  'Ad Not Available',
                  'The ad is not ready. Please try again later.',
                  [{ text: 'OK' }]
                );
                onCancel?.();
                resolve(false);
              }
            },
          },
        ],
        { cancelable: true }
      );
    });
  } catch (error) {
    console.error('Error checking access gate:', error);
    onCancel?.();
    return false;
  }
}

/**
 * Get all unlocked features
 */
export async function getUnlockedFeatures(): Promise<GatedFeature[]> {
  try {
    const unlockedStr = await AsyncStorage.getItem(STORAGE_KEY);
    if (!unlockedStr) return [];
    return JSON.parse(unlockedStr);
  } catch (error) {
    console.error('Error getting unlocked features:', error);
    return [];
  }
}

/**
 * Reset all unlocks (for testing)
 */
export async function resetAllUnlocks(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
    console.log('[AccessGate] All unlocks reset');
  } catch (error) {
    console.error('Error resetting unlocks:', error);
  }
}
