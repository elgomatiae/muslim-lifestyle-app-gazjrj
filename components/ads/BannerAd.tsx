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

  // Load ad module and setup banner ad
  useEffect(() => {
    // Check if Expo Go - skip in Expo Go
    try {
      const Constants = require('expo-constants');
      if (Constants.executionEnvironment === 'storeClient') {
        // In Expo Go - don't try to load ads
        if (__DEV__) {
          console.log('[BannerAd] Skipped - running in Expo Go');
        }
        return;
      }
    } catch {
      // Can't check, skip to be safe
      return;
    }
    
    // Not in Expo Go - try to load ads
    if (adModuleLoaded || adModuleLoading) return;
    
    adModuleLoading = true;
    
    // Load ad config and ad module
    // Try require first to bypass Metro redirect, then fallback to import
    Promise.all([
      import('@/utils/adConfig').catch(() => null),
      new Promise((resolve) => {
        try {
          // Try require first - bypasses Metro redirect in native builds
          const module = require('react-native-google-mobile-ads');
          resolve(module);
        } catch {
          // If require fails, try import (will get stub)
          import('react-native-google-mobile-ads').then(resolve).catch(() => resolve(null));
        }
      })
    ])
      .then(([adConfig, adModule]) => {
        if (!adModule || !adConfig) {
          adModuleLoading = false;
          if (__DEV__) {
            console.log('[BannerAd] Module not available (expected in Expo Go)');
          }
          return;
        }
        
        // Verify we have the real module (BannerAd should be a component)
        if (!adModule.BannerAd || typeof adModule.BannerAd !== 'function') {
          adModuleLoading = false;
          if (__DEV__) {
            console.log('[BannerAd] Invalid module - BannerAd not found');
          }
          return;
        }
        
        // Real module - proceed with ad setup
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
        console.log('[BannerAd] Ready with unit ID:', unitIdToUse);
      })
      .catch((error) => {
        adModuleLoading = false;
        if (__DEV__) {
          console.log('[BannerAd] Error loading module:', error?.message || error);
        }
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
