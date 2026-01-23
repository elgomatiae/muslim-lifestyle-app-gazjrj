/**
 * AdMob Configuration
 * Handles rewarded ad display for access gates
 */

import { Alert } from 'react-native';

// Ad Unit ID for rewarded interstitial ads
const REWARDED_AD_UNIT_ID = __DEV__
  ? 'ca-app-pub-3940256099942544/5354046379' // Test ad unit
  : 'ca-app-pub-2757517181313212/8725693825'; // Production ad unit

let rewardedAd: any = null;
let isAdLoading = false;
let isAdLoaded = false;

/**
 * Initialize and load the rewarded ad
 */
async function loadRewardedAd(): Promise<void> {
  if (isAdLoading || isAdLoaded) return;

  try {
    // Lazy load the AdMob module to avoid errors in Expo Go
    const { RewardedAd, RewardedAdEventType } = await import('react-native-google-mobile-ads');
    
    isAdLoading = true;
    
    rewardedAd = RewardedAd.createForAdRequest(REWARDED_AD_UNIT_ID, {
      requestNonPersonalizedAdsOnly: true,
    });

    // Listen for ad loaded
    rewardedAd.addAdEventListener(RewardedAdEventType.LOADED, () => {
      isAdLoaded = true;
      isAdLoading = false;
      console.log('[AdMob] Rewarded ad loaded');
    });

    // Listen for errors
    rewardedAd.addAdEventListener(RewardedAdEventType.ERROR, (error: any) => {
      console.error('[AdMob] Rewarded ad error:', error);
      isAdLoading = false;
      isAdLoaded = false;
    });

    // Load the ad
    await rewardedAd.load();
  } catch (error) {
    console.log('[AdMob] Ad module not available (likely Expo Go):', error);
    isAdLoading = false;
    isAdLoaded = false;
  }
}

/**
 * Show a rewarded ad
 * @param onReward Callback when user earns reward (watches ad)
 * @returns Promise<boolean> - true if ad was shown, false otherwise
 */
export async function showRewardedAd(
  onReward?: (reward: { type: string; amount: number }) => void
): Promise<boolean> {
  try {
    // Try to load the ad module
    const { RewardedAd, RewardedAdEventType } = await import('react-native-google-mobile-ads');
    
    // Load ad if not already loaded
    if (!isAdLoaded && !isAdLoading) {
      await loadRewardedAd();
    }

    // Wait a bit for ad to load if it's loading
    if (isAdLoading) {
      // Wait up to 3 seconds for ad to load
      let attempts = 0;
      while (isAdLoading && attempts < 30) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }
    }

    // Check if ad is loaded
    if (!isAdLoaded || !rewardedAd) {
      console.log('[AdMob] Rewarded ad not ready');
      return false;
    }

    // Show the ad
    const shown = await rewardedAd.show();
    
    if (shown) {
      // Set up reward listener
      const unsubscribe = rewardedAd.addAdEventListener(
        RewardedAdEventType.EARNED_REWARD,
        (reward: { type: string; amount: number }) => {
          console.log('[AdMob] User earned reward:', reward);
          onReward?.(reward);
          unsubscribe();
          
          // Reset ad state after showing
          isAdLoaded = false;
          rewardedAd = null;
          
          // Preload next ad
          loadRewardedAd();
        }
      );

      return true;
    }

    return false;
  } catch (error) {
    console.log('[AdMob] Error showing rewarded ad (likely Expo Go):', error);
    // In Expo Go or if ad fails, simulate success for development
    if (__DEV__) {
      console.log('[AdMob] Simulating ad success in development mode');
      onReward?.({ type: 'access', amount: 1 });
      return true;
    }
    return false;
  }
}

/**
 * Preload rewarded ad (call on app start)
 */
export async function preloadRewardedAd(): Promise<void> {
  await loadRewardedAd();
}
