/**
 * Stub module for react-native-google-mobile-ads
 * This prevents crashes in Expo Go where the native module doesn't exist
 */

// Check if we're in Expo Go
function isExpoGo(): boolean {
  try {
    const Constants = require('expo-constants');
    return Constants.executionEnvironment === 'storeClient';
  } catch {
    return true; // Assume Expo Go if we can't check
  }
}

// Export stub implementations
export const mobileAds = {
  initialize: async () => {
    if (__DEV__) {
      console.log('AdMob stub: initialize() called (native module not available)');
    }
  },
};

export const BannerAd = () => null;
export const InterstitialAd = {
  createForAdRequest: () => ({
    load: async () => {},
    show: async () => {},
    loaded: false,
    addAdEventListener: () => () => {},
  }),
};
export const RewardedAd = {
  createForAdRequest: () => ({
    load: async () => {},
    show: async () => {},
    loaded: false,
    addAdEventListener: () => () => {},
  }),
};

export const BannerAdSize = {
  BANNER: 'BANNER',
  LARGE_BANNER: 'LARGE_BANNER',
  MEDIUM_RECTANGLE: 'MEDIUM_RECTANGLE',
  FULL_BANNER: 'FULL_BANNER',
  LEADERBOARD: 'LEADERBOARD',
  SMART_BANNER: 'SMART_BANNER',
};

export const TestIds = {
  BANNER: 'ca-app-pub-3940256099942544/6300978111',
  INTERSTITIAL: 'ca-app-pub-3940256099942544/1033173712',
  REWARDED: 'ca-app-pub-3940256099942544/5224354917',
};

export const RewardedAdEventType = {
  EARNED_REWARD: 'rewarded',
  LOADED: 'loaded',
  ERROR: 'error',
};

export default mobileAds;
