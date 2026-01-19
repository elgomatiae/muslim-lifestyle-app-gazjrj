/**
 * ============================================================================
 * AD IMPLEMENTATION EXAMPLES
 * ============================================================================
 * 
 * Examples of how to use ads in your app
 * Copy and adapt these examples to your needs
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import BannerAd from './BannerAd';
// Lazy import adConfig to avoid loading AdMob module

// ============================================================================
// EXAMPLE 1: Banner Ad at Bottom of Screen
// ============================================================================

export function ExampleBannerAdScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Content Here</Text>
      
      {/* Banner ad at the bottom */}
      <BannerAd position="bottom" />
    </View>
  );
}

// ============================================================================
// EXAMPLE 2: Show Interstitial Ad After Action
// ============================================================================

export function ExampleInterstitialAd() {
  const handleCompletePrayer = async () => {
    // Your prayer completion logic here
    console.log('Prayer completed!');
    
    // Show interstitial ad after meaningful action
    try {
      const adConfig = await import('@/utils/adConfig');
      const shown = await adConfig.showInterstitialAd();
      if (!shown) {
        console.log('Ad not ready, continuing anyway');
      }
    } catch (error) {
      console.log('Ad not available:', error);
    }
  };

  return (
    <TouchableOpacity style={styles.button} onPress={handleCompletePrayer}>
      <Text style={styles.buttonText}>Complete Prayer</Text>
    </TouchableOpacity>
  );
}

// ============================================================================
// EXAMPLE 3: Rewarded Ad for Premium Feature
// ============================================================================

export function ExampleRewardedAd() {
  const handleUnlockFeature = async () => {
    try {
      const adConfig = await import('@/utils/adConfig');
      const shown = await adConfig.showRewardedAd((reward) => {
        // User watched the ad and earned reward
        Alert.alert(
          'Reward Earned!',
          `You earned ${reward.amount} ${reward.type}!`
        );
        
        // Unlock the premium feature
        console.log('Premium feature unlocked!');
      });

      if (!shown) {
        Alert.alert(
          'Ad Not Available',
          'The ad is not ready. Please try again later.'
        );
      }
    } catch (error) {
      Alert.alert(
        'Ad Not Available',
        'The ad is not ready. Please try again later.'
      );
    }
  };

  return (
    <TouchableOpacity style={styles.button} onPress={handleUnlockFeature}>
      <Text style={styles.buttonText}>Watch Ad to Unlock Feature</Text>
    </TouchableOpacity>
  );
}

// ============================================================================
// EXAMPLE 4: Conditional Ad Display
// ============================================================================

export function ExampleConditionalAd({ showAds }: { showAds: boolean }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Content</Text>
      
      {/* Only show ad if user hasn't purchased premium */}
      {showAds && <BannerAd position="bottom" />}
    </View>
  );
}

// ============================================================================
// EXAMPLE 5: Show Interstitial After Multiple Actions
// ============================================================================

let actionCount = 0;
const ADS_INTERVAL = 3; // Show ad every 3 actions

export function ExampleIntervalAd() {
  const handleAction = async () => {
    actionCount++;
    
    // Your action logic here
    console.log(`Action ${actionCount} completed`);
    
    // Show ad every N actions
    if (actionCount % ADS_INTERVAL === 0) {
      try {
        const adConfig = await import('@/utils/adConfig');
        await adConfig.showInterstitialAd();
      } catch (error) {
        console.log('Ad not available:', error);
      }
    }
  };

  return (
    <TouchableOpacity style={styles.button} onPress={handleAction}>
      <Text style={styles.buttonText}>Perform Action</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
