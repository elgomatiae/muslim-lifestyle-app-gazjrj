/**
 * ============================================================================
 * BANNER AD COMPONENT
 * ============================================================================
 * 
 * Displays a banner ad at the top or bottom of the screen
 */

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
// Lazy import adConfig to avoid loading AdMob module

// Lazy load ad components to avoid crashes in Expo Go
let RNBannerAd: any = null;
let BannerAdSize: any = null;
let TestIds: any = null;
let adModuleLoaded = false;
let adModuleLoading = false;

interface BannerAdProps {
  /**
   * Position of the banner ad
   * @default 'bottom'
   */
  position?: 'top' | 'bottom';
  
  /**
   * Custom ad unit ID (optional, uses config by default)
   */
  unitId?: string;
  
  /**
   * Size of the banner ad
   * @default BannerAdSize.BANNER
   */
  size?: BannerAdSize;
}

export default function BannerAd({
  position = 'bottom',
  unitId,
  size,
}: BannerAdProps) {
  const [adUnitId, setAdUnitId] = useState<string>(unitId || '');
  const [adReady, setAdReady] = useState(false);

  // Check if we're in Expo Go
  useEffect(() => {
    // Check if Expo Go
    try {
      const Constants = require('expo-constants');
      if (Constants.executionEnvironment === 'storeClient') {
        // In Expo Go - don't try to load ads
        return;
      }
    } catch {
      // Can't check, assume Expo Go to be safe
      return;
    }
    
    // Not in Expo Go - try to load ads
    if (adModuleLoaded || adModuleLoading) return;
    
    adModuleLoading = true;
    
    // Load ad config and ad module
    const parts = ['react-native', '-', 'google', '-', 'mobile', '-', 'ads'];
    const moduleName = parts.join('');
    Promise.all([
      import('@/utils/adConfig').catch(() => null),
      import(/* @vite-ignore */ moduleName).catch(() => null)
    ])
      .then(([adConfig, adModule]) => {
        if (!adModule || !adConfig) {
          adModuleLoading = false;
          return;
        }
        
        RNBannerAd = adModule.BannerAd;
        BannerAdSize = adModule.BannerAdSize;
        TestIds = adModule.TestIds;
        adModuleLoaded = true;
        
        // Get ad unit ID
        const unitIdToUse = unitId || adConfig.getAdUnitId('banner');
        
        // Use test ID in development if no unit ID provided
        if (__DEV__ && !unitId && TestIds) {
          setAdUnitId(TestIds.BANNER);
        } else {
          setAdUnitId(unitIdToUse);
        }
        
        setAdReady(true);
      })
      .catch(() => {
        adModuleLoading = false;
      });
  }, [unitId]);

  // If native module isn't available, don't render the ad
  if (!adReady || !RNBannerAd || !BannerAdSize) {
    return null;
  }

  const adSize = size || BannerAdSize.BANNER;

  return (
    <View style={[styles.container, position === 'top' ? styles.top : styles.bottom]}>
      <RNBannerAd
        unitId={adUnitId}
        size={adSize}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
        onAdLoaded={() => {
          console.log('Banner ad loaded');
        }}
        onAdFailedToLoad={(error) => {
          console.error('Banner ad failed to load:', error);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  top: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  bottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
});
