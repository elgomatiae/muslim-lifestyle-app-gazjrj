/**
 * Safe screen dimensions utility
 * Handles cases where Dimensions might not be ready and provides reactive dimensions
 */

import { Dimensions, Platform, ScaledSize } from 'react-native';

// Safe function to get dimensions - handles cases where Dimensions might not be ready
export function getScreenDimensions(): ScaledSize {
  try {
    return Dimensions.get('window');
  } catch (error) {
    console.warn('Error getting screen dimensions, using defaults:', error);
    // Return safe defaults (iPhone 13 dimensions)
    return {
      width: 390,
      height: 844,
      scale: 3,
      fontScale: 1,
    } as ScaledSize;
  }
}

// Get screen width safely
export function getScreenWidth(): number {
  try {
    return Dimensions.get('window').width || 390;
  } catch (error) {
    console.warn('Error getting screen width:', error);
    return 390; // Default to iPhone 13 width
  }
}

// Get screen height safely
export function getScreenHeight(): number {
  try {
    return Dimensions.get('window').height || 844;
  } catch (error) {
    console.warn('Error getting screen height:', error);
    return 844; // Default to iPhone 13 height
  }
}

// Detect device type safely
export function isIPad(): boolean {
  try {
    const width = getScreenWidth();
    return Platform.OS === 'ios' && (Platform.isPad || width >= 768);
  } catch (error) {
    return false;
  }
}

// Detect small screen
export function isSmallScreen(): boolean {
  try {
    return getScreenWidth() < 400;
  } catch (error) {
    return false;
  }
}

// Detect large screen (iPad and large phones)
export function isLargeScreen(): boolean {
  try {
    return getScreenWidth() >= 768;
  } catch (error) {
    return false;
  }
}
