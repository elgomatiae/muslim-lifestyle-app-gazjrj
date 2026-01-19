/**
 * ============================================================================
 * REWARDED AD COMPONENT
 * ============================================================================
 * 
 * Helper component for managing rewarded ads
 * This component doesn't render anything, it just manages ad loading
 */

import { useEffect } from 'react';

interface RewardedAdManagerProps {
  /**
   * Whether to preload the ad on mount
   * @default true
   */
  preload?: boolean;
}

/**
 * Component that preloads rewarded ads in the background
 * Use this at the app level to preload ads for better performance
 */
export default function RewardedAdManager({ preload = true }: RewardedAdManagerProps) {
  useEffect(() => {
    if (preload) {
      // Lazy load to avoid crashes in Expo Go
      import('@/utils/adConfig').then((module) => {
        module.loadRewardedAd().catch(() => {
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
export async function showRewardedAd(onReward?: (reward: { type: string; amount: number }) => void) {
  const module = await import('@/utils/adConfig');
  return module.showRewardedAd(onReward);
}
