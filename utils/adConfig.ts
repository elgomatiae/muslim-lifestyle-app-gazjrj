/**
 * ============================================================================
 * ADMOB CONFIGURATION
 * ============================================================================
 * 
 * Configuration file for Google AdMob ads
 * Replace test IDs with your actual Ad Unit IDs from AdMob dashboard
 */

// Check if we're in Expo Go (where native modules don't work)
function isExpoGo(): boolean {
  try {
    // In Expo Go, Constants.executionEnvironment is 'storeClient'
    // In development builds, it's 'standalone' or 'bare'
    const Constants = require('expo-constants');
    return Constants.executionEnvironment === 'storeClient';
  } catch {
    // If we can't check, assume we're in Expo Go to be safe
    return true;
  }
}

// Lazy load mobileAds to avoid crashing in Expo Go
let mobileAdsModule: any = null;
const IS_EXPO_GO = isExpoGo();

async function getMobileAds() {
  // In Expo Go, skip early to avoid attempting import
  if (IS_EXPO_GO) {
    return false;
  }
  
  if (mobileAdsModule !== null) {
    return mobileAdsModule;
  }
  
  try {
    // Metro will redirect this import to our stub module
    // The stub prevents Metro from trying to load the native module
    // In Expo Go, we get the stub (which is fine - we skip anyway)
    // In native builds, Metro still redirects to stub, but we detect it and skip
    const module = await import('react-native-google-mobile-ads');
    
    // Check if we got the stub (stub's BannerAd is a function that returns null)
    // Real module's BannerAd is a component class
    if (module && typeof module.BannerAd === 'function') {
      try {
        const testResult = module.BannerAd();
        if (testResult === null) {
          // This is the stub - Metro redirected us here
          // In native builds, we can't use the stub, so return false
          // In Expo Go, this is expected and we already check IS_EXPO_GO
          if (__DEV__) {
            console.log('[AdMob] Stub module loaded via Metro redirect');
          }
          mobileAdsModule = false;
          return false;
        }
      } catch {
        // BannerAd might be a component class - this is fine, it's the real module
      }
    }
    
    // Verify we have a valid module
    if (module && module.default) {
      mobileAdsModule = module;
      return mobileAdsModule;
    }
    
    mobileAdsModule = false;
    return false;
  } catch (e: any) {
    // Import failed - this is expected in Expo Go
    if (__DEV__) {
      console.log('[AdMob] Module not available (expected in Expo Go):', e?.message || 'native module required');
    }
    mobileAdsModule = false;
    return false;
  }
}

// Initialize AdMob (call this once at app startup)
export async function initializeAds() {
  // Skip completely in Expo Go
  if (IS_EXPO_GO) {
    if (__DEV__) {
      console.log('[AdMob] Skipped - running in Expo Go. Rebuild with native code to enable ads.');
    }
    return;
  }
  
  try {
    const module = await getMobileAds();
    if (!module || !module.default) {
      if (__DEV__) {
        console.log('[AdMob] Not available - native module required. Run: npx expo prebuild');
      }
      return;
    }
    
    // Initialize AdMob SDK
    // In react-native-google-mobile-ads, we use mobileAds().initialize()
    const mobileAds = module.default;
    await mobileAds().initialize();
    console.log('[AdMob] Initialized successfully');
  } catch (error: any) {
    if (__DEV__) {
      console.error('[AdMob] Initialization error:', error?.message || error);
    }
    // Don't crash the app if AdMob fails to initialize
  }
}

// ============================================================================
// TEST AD UNIT IDs (Use these during development)
// ============================================================================
// Replace these with your actual Ad Unit IDs from AdMob dashboard before production

export const TEST_AD_UNITS = {
  // Banner Ads
  banner: {
    ios: 'ca-app-pub-3940256099942544/2934735716',
    android: 'ca-app-pub-3940256099942544/6300978111',
  },
  // Interstitial Ads (Full-screen)
  interstitial: {
    ios: 'ca-app-pub-3940256099942544/4411468910',
    android: 'ca-app-pub-3940256099942544/1033173712',
  },
  // Rewarded Ads
  rewarded: {
    ios: 'ca-app-pub-3940256099942544/1712485313',
    android: 'ca-app-pub-3940256099942544/5224354917',
  },
};

// ============================================================================
// PRODUCTION AD UNIT IDs
// ============================================================================
// Your actual Ad Unit IDs from AdMob dashboard

export const PRODUCTION_AD_UNITS = {
  banner: {
    ios: 'ca-app-pub-3940256099942544/2934735716', // Using test ID - create banner ad unit in AdMob
    android: 'ca-app-pub-3940256099942544/6300978111', // Using test ID - create banner ad unit in AdMob
  },
  interstitial: {
    ios: 'ca-app-pub-3940256099942544/4411468910', // Using test ID - create interstitial ad unit in AdMob
    android: 'ca-app-pub-3940256099942544/1033173712', // Using test ID - create interstitial ad unit in AdMob
  },
  rewarded: {
    ios: 'ca-app-pub-2757517181313212/8725693825', // Rewarded Interstitial Ad Unit ID
    android: 'ca-app-pub-2757517181313212/8725693825', // Rewarded Interstitial Ad Unit ID
  },
};

// ============================================================================
// AD CONFIGURATION
// ============================================================================

// Use test ads in development, production ads in production
// Set to true to use production ads
const USE_PRODUCTION_ADS = true; // Using production ads with your real ad unit
const isDevelopment = __DEV__ && !USE_PRODUCTION_ADS;

export const AD_UNITS = isDevelopment ? TEST_AD_UNITS : PRODUCTION_AD_UNITS;

// Get platform-specific ad unit ID
export function getAdUnitId(type: 'banner' | 'interstitial' | 'rewarded'): string {
  const { Platform } = require('react-native');
  const platform = Platform.OS === 'ios' ? 'ios' : 'android';
  return AD_UNITS[type][platform];
}

// ============================================================================
// AD SHOWING HELPERS
// ============================================================================

let interstitialAd: any = null;
let rewardedAd: any = null;

/**
 * Load an interstitial ad
 */
export async function loadInterstitialAd() {
  // Skip completely in Expo Go
  if (IS_EXPO_GO) {
    return;
  }
  
  try {
    // Metro will redirect this import to our stub module
    const adModule = await import('react-native-google-mobile-ads').catch(() => null);
    
    if (!adModule || !adModule.InterstitialAd) {
      return;
    }
    
    const { InterstitialAd } = adModule;
    interstitialAd = InterstitialAd.createForAdRequest(getAdUnitId('interstitial'), {
      requestNonPersonalizedAdsOnly: true,
    });

    // Preload the ad
    await interstitialAd.load();
    console.log('Interstitial ad loaded');
  } catch (error: any) {
    // Silently fail - don't log in production
    if (__DEV__) {
      console.error('Error loading interstitial ad:', error?.message || error);
    }
  }
}

/**
 * Show an interstitial ad
 */
export async function showInterstitialAd(): Promise<boolean> {
  try {
    if (!interstitialAd) {
      await loadInterstitialAd();
    }

    if (interstitialAd && interstitialAd.loaded) {
      await interstitialAd.show();
      // Reload for next time
      await loadInterstitialAd();
      return true;
    } else {
      console.log('Interstitial ad not ready');
      return false;
    }
  } catch (error) {
    console.error('Error showing interstitial ad:', error);
    return false;
  }
}

/**
 * Check if we have the real native module (not the stub)
 * Real module's default export is a function (mobileAds()), stub's is an object
 */
function isRealModule(adModule: any): boolean {
  if (!adModule) return false;
  
  // Real module's default export is a function: mobileAds()
  // Stub's default export is an object: { initialize: ... }
  if (adModule.default) {
    return typeof adModule.default === 'function';
  }
  
  // Fallback: check if RewardedInterstitialAd exists and has proper methods
  return adModule.RewardedInterstitialAd && 
         typeof adModule.RewardedInterstitialAd.createForAdRequest === 'function';
}

/**
 * Load a rewarded interstitial ad
 * Note: Using RewardedInterstitialAd since your ad unit ID is for rewarded interstitial
 */
export async function loadRewardedAd() {
  // Skip completely in Expo Go
  if (IS_EXPO_GO) {
    return;
  }
  
  try {
    // Try to load real module - use require to bypass Metro redirect
    let adModule: any;
    try {
      adModule = require('react-native-google-mobile-ads');
    } catch {
      // If require fails, try import (will get stub in Expo Go)
      adModule = await import('react-native-google-mobile-ads').catch(() => null);
    }
    
    if (!adModule) {
      if (__DEV__) {
        console.log('[AdMob] Module not available');
      }
      return;
    }
    
    // Check if we have the real module (not stub)
    if (!isRealModule(adModule)) {
      if (__DEV__) {
        console.log('[AdMob] Stub module detected - this should not happen in native builds');
        console.log('[AdMob] If you rebuilt with native code, try: npx expo start --clear');
      }
      return;
    }
    
    // Use RewardedInterstitialAd instead of RewardedAd
    // This matches your ad unit ID: ca-app-pub-2757517181313212/8725693825
    const { RewardedInterstitialAd } = adModule;
    
    if (!RewardedInterstitialAd) {
      if (__DEV__) {
        console.warn('[AdMob] RewardedInterstitialAd not available');
      }
      return;
    }
    
    rewardedAd = RewardedInterstitialAd.createForAdRequest(getAdUnitId('rewarded'), {
      requestNonPersonalizedAdsOnly: true,
    });

    // Preload the ad
    await rewardedAd.load();
    console.log('[AdMob] Rewarded interstitial ad loaded');
  } catch (error: any) {
    if (__DEV__) {
      console.error('[AdMob] Error loading rewarded ad:', error?.message || error);
    }
  }
}

/**
 * Show a rewarded interstitial ad
 * @param onReward Callback when user earns reward
 */
export async function showRewardedAd(
  onReward?: (reward: { type: string; amount: number }) => void
): Promise<boolean> {
  // Skip completely in Expo Go
  if (IS_EXPO_GO) {
    if (__DEV__) {
      console.log('[AdMob] Cannot show ad in Expo Go - native module required');
    }
    return false;
  }
  
  try {
    // Try to load real module - use require to bypass Metro redirect
    let adModule: any;
    try {
      adModule = require('react-native-google-mobile-ads');
    } catch {
      // If require fails, try import (will get stub in Expo Go)
      adModule = await import('react-native-google-mobile-ads').catch(() => null);
    }
    
    if (!adModule) {
      if (__DEV__) {
        console.log('[AdMob] Module not available');
      }
      return false;
    }
    
    // Check if we have the real module (not stub)
    if (!isRealModule(adModule)) {
      if (__DEV__) {
        console.log('[AdMob] Stub module detected - this should not happen in native builds');
        console.log('[AdMob] If you rebuilt with native code, try: npx expo start --clear');
      }
      return false;
    }

    // Load ad if not already loaded
    if (!rewardedAd) {
      await loadRewardedAd();
    }

    // Check if ad is loaded and ready
    if (rewardedAd && rewardedAd.loaded) {
      // RewardedInterstitialAd uses RewardedAdEventType (same as RewardedAd)
      const { RewardedAdEventType } = adModule;
      
      if (!RewardedAdEventType) {
        if (__DEV__) {
          console.error('[AdMob] RewardedAdEventType not available');
        }
        return false;
      }
      
      // Set up reward listener before showing
      if (onReward) {
        const unsubscribeReward = rewardedAd.addAdEventListener(
          RewardedAdEventType.EARNED_REWARD,
          (reward: any) => {
            console.log('[AdMob] Reward earned:', reward);
            onReward(reward);
            unsubscribeReward();
          }
        );
        
        // Also handle ad dismissed event to reload
        rewardedAd.addAdEventListener(
          RewardedAdEventType.DISMISSED,
          () => {
            console.log('[AdMob] Ad dismissed');
            // Reload for next time
            loadRewardedAd().catch(() => {});
          }
        );
      }

      // Show the ad
      await rewardedAd.show();
      console.log('[AdMob] Rewarded interstitial ad shown');
      
      return true;
    } else {
      if (__DEV__) {
        console.log('[AdMob] Ad not loaded yet. Loading...');
      }
      // Try to load and show
      await loadRewardedAd();
      if (rewardedAd && rewardedAd.loaded) {
        return await showRewardedAd(onReward);
      }
      return false;
    }
  } catch (error: any) {
    if (__DEV__) {
      console.error('[AdMob] Error showing rewarded ad:', error?.message || error);
    }
    return false;
  }
}
