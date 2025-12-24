
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LOCATION_CACHE_KEY = '@cached_location';
const LOCATION_CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

export interface UserLocation {
  latitude: number;
  longitude: number;
  timestamp: number;
}

/**
 * Simple location service - handles all location-related operations
 */

// Check if location services are enabled on device
export async function isLocationEnabled(): Promise<boolean> {
  try {
    return await Location.hasServicesEnabledAsync();
  } catch (error) {
    console.log('Error checking location services:', error);
    return false;
  }
}

// Check location permission status
export async function checkLocationPermission(): Promise<boolean> {
  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.log('Error checking location permission:', error);
    return false;
  }
}

// Request location permission
export async function requestLocationPermission(): Promise<boolean> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.log('Error requesting location permission:', error);
    return false;
  }
}

// Get cached location
async function getCachedLocation(): Promise<UserLocation | null> {
  try {
    const cached = await AsyncStorage.getItem(LOCATION_CACHE_KEY);
    if (!cached) return null;

    const location: UserLocation = JSON.parse(cached);
    
    // Check if cache is still valid (within 24 hours)
    const now = Date.now();
    if (now - location.timestamp < LOCATION_CACHE_EXPIRY) {
      console.log('Using cached location:', location);
      return location;
    }

    console.log('Cached location expired');
    return null;
  } catch (error) {
    console.log('Error reading cached location:', error);
    return null;
  }
}

// Save location to cache
async function cacheLocation(location: UserLocation): Promise<void> {
  try {
    await AsyncStorage.setItem(LOCATION_CACHE_KEY, JSON.stringify(location));
    console.log('Location cached successfully');
  } catch (error) {
    console.log('Error caching location:', error);
  }
}

// Get user's current location
export async function getUserLocation(): Promise<UserLocation | null> {
  try {
    // First check if location services are enabled
    const servicesEnabled = await isLocationEnabled();
    if (!servicesEnabled) {
      console.log('Location services are disabled');
      return await getCachedLocation();
    }

    // Check permission
    const hasPermission = await checkLocationPermission();
    if (!hasPermission) {
      console.log('Location permission not granted');
      return await getCachedLocation();
    }

    // Try to get current position
    console.log('Getting current location...');
    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    const location: UserLocation = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      timestamp: Date.now(),
    };

    // Cache the location
    await cacheLocation(location);

    console.log('Location retrieved successfully:', location);
    return location;
  } catch (error) {
    console.log('Error getting current location:', error);
    // Return cached location as fallback
    return await getCachedLocation();
  }
}

// Get location with fallback to default (Mecca coordinates)
export async function getLocationWithFallback(): Promise<UserLocation> {
  const location = await getUserLocation();
  
  if (location) {
    return location;
  }

  // Default to Mecca coordinates if no location available
  console.log('Using default location (Mecca)');
  return {
    latitude: 21.4225,
    longitude: 39.8262,
    timestamp: Date.now(),
  };
}

// Clear cached location
export async function clearLocationCache(): Promise<void> {
  try {
    await AsyncStorage.removeItem(LOCATION_CACHE_KEY);
    console.log('Location cache cleared');
  } catch (error) {
    console.log('Error clearing location cache:', error);
  }
}
