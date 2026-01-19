/**
 * ============================================================================
 * INTERSTITIAL AD COMPONENT
 * ============================================================================
 * 
 * Helper component for managing interstitial (full-screen) ads
 * This component doesn't render anything, it just manages ad loading
 */

import { useEffect } from 'react';

interface InterstitialAdManagerProps {
  /**
   * Whether to preload the ad on mount
   * @default true
   */
  preload?: boolean;
}

/**
 * Component that preloads interstitial ads in the background
 * Use this at the app level to preload ads for better performance
 */
export default function InterstitialAdManager({ preload = true }: InterstitialAdManagerProps) {
  useEffect(() => {
    if (preload) {
      // Lazy load to avoid crashes in Expo Go
      import('@/utils/adConfig').then((module) => {
        module.loadInterstitialAd().catch(() => {
          // Silently fail if native module not available
        });
      }).catch(() => {
        // Ignore import errors
      });
    }
  }, [preload]);

  // This component doesn't render anything
  return null;
}

// Export the show function for easy use (lazy loaded)
export async function showInterstitialAd() {
  const module = await import('@/utils/adConfig');
  return module.showInterstitialAd();
}
