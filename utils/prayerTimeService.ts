
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Coordinates, CalculationMethod, PrayerTimes, Prayer, Madhab, HighLatitudeRule } from 'adhan';

export interface PrayerTime {
  name: string;
  time: string;
  arabicName: string;
  completed: boolean;
  date: Date;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  timezone: string;
  city?: string;
  country?: string;
}

const PRAYER_NAMES = {
  fajr: { english: 'Fajr', arabic: 'الفجر' },
  sunrise: { english: 'Sunrise', arabic: 'الشروق' },
  dhuhr: { english: 'Dhuhr', arabic: 'الظهر' },
  asr: { english: 'Asr', arabic: 'العصر' },
  maghrib: { english: 'Maghrib', arabic: 'المغرب' },
  isha: { english: 'Isha', arabic: 'العشاء' },
};

const STORAGE_KEYS = {
  LOCATION: '@prayer_location',
  PRAYER_TIMES: '@prayer_times',
  LAST_CALCULATION: '@last_prayer_calculation',
  NOTIFICATION_IDS: '@prayer_notification_ids',
};

// Request location permissions
export async function requestLocationPermission(): Promise<boolean> {
  try {
    const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
    
    if (foregroundStatus !== 'granted') {
      console.log('Location permission not granted');
      return false;
    }

    console.log('Location permission granted');
    return true;
  } catch (error) {
    console.error('Error requesting location permission:', error);
    return false;
  }
}

// Get user's current location
export async function getCurrentLocation(): Promise<LocationData | null> {
  try {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      console.log('No location permission, using cached location');
      return await getCachedLocation();
    }

    console.log('Getting current location...');
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    // Get timezone
    const timezone = await Location.getTimeZoneAsync();

    // Try to get city/country info
    let city, country;
    try {
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (reverseGeocode && reverseGeocode.length > 0) {
        city = reverseGeocode[0].city || reverseGeocode[0].subregion;
        country = reverseGeocode[0].country;
      }
    } catch (geoError) {
      console.log('Error getting reverse geocode:', geoError);
    }

    const locationData: LocationData = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      timezone,
      city,
      country,
    };

    // Cache the location
    await AsyncStorage.setItem(STORAGE_KEYS.LOCATION, JSON.stringify(locationData));
    console.log('Location cached:', locationData);

    return locationData;
  } catch (error) {
    console.error('Error getting current location:', error);
    return await getCachedLocation();
  }
}

// Get cached location
export async function getCachedLocation(): Promise<LocationData | null> {
  try {
    const cached = await AsyncStorage.getItem(STORAGE_KEYS.LOCATION);
    if (cached) {
      return JSON.parse(cached);
    }
    return null;
  } catch (error) {
    console.error('Error getting cached location:', error);
    return null;
  }
}

// Calculate prayer times for a given location and date
export async function calculatePrayerTimes(
  locationData: LocationData,
  date: Date = new Date()
): Promise<PrayerTime[]> {
  try {
    console.log('Calculating prayer times for:', locationData, date);

    const coordinates = new Coordinates(locationData.latitude, locationData.longitude);
    
    // Use Muslim World League method as default (can be customized)
    const params = CalculationMethod.MuslimWorldLeague();
    params.madhab = Madhab.Shafi; // Can be changed to Madhab.Hanafi
    params.highLatitudeRule = HighLatitudeRule.MiddleOfTheNight;

    const prayerTimes = new PrayerTimes(coordinates, date, params);

    // Format times in local timezone
    const formatTime = (date: Date): string => {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    };

    const prayers: PrayerTime[] = [
      {
        name: PRAYER_NAMES.fajr.english,
        arabicName: PRAYER_NAMES.fajr.arabic,
        time: formatTime(prayerTimes.fajr),
        date: prayerTimes.fajr,
        completed: false,
      },
      {
        name: PRAYER_NAMES.dhuhr.english,
        arabicName: PRAYER_NAMES.dhuhr.arabic,
        time: formatTime(prayerTimes.dhuhr),
        date: prayerTimes.dhuhr,
        completed: false,
      },
      {
        name: PRAYER_NAMES.asr.english,
        arabicName: PRAYER_NAMES.asr.arabic,
        time: formatTime(prayerTimes.asr),
        date: prayerTimes.asr,
        completed: false,
      },
      {
        name: PRAYER_NAMES.maghrib.english,
        arabicName: PRAYER_NAMES.maghrib.arabic,
        time: formatTime(prayerTimes.maghrib),
        date: prayerTimes.maghrib,
        completed: false,
      },
      {
        name: PRAYER_NAMES.isha.english,
        arabicName: PRAYER_NAMES.isha.arabic,
        time: formatTime(prayerTimes.isha),
        date: prayerTimes.isha,
        completed: false,
      },
    ];

    // Cache the prayer times
    await AsyncStorage.setItem(STORAGE_KEYS.PRAYER_TIMES, JSON.stringify(prayers));
    await AsyncStorage.setItem(STORAGE_KEYS.LAST_CALCULATION, date.toISOString());

    console.log('Prayer times calculated:', prayers);
    return prayers;
  } catch (error) {
    console.error('Error calculating prayer times:', error);
    throw error;
  }
}

// Get prayer times (from cache or calculate new)
export async function getPrayerTimes(): Promise<PrayerTime[]> {
  try {
    // Check if we have cached prayer times for today
    const lastCalculation = await AsyncStorage.getItem(STORAGE_KEYS.LAST_CALCULATION);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (lastCalculation) {
      const lastDate = new Date(lastCalculation);
      lastDate.setHours(0, 0, 0, 0);

      // If we have prayer times from today, return them
      if (lastDate.getTime() === today.getTime()) {
        const cached = await AsyncStorage.getItem(STORAGE_KEYS.PRAYER_TIMES);
        if (cached) {
          const prayers = JSON.parse(cached);
          // Convert date strings back to Date objects
          return prayers.map((p: any) => ({
            ...p,
            date: new Date(p.date),
          }));
        }
      }
    }

    // Calculate new prayer times
    const location = await getCurrentLocation();
    if (!location) {
      throw new Error('Unable to get location for prayer times');
    }

    return await calculatePrayerTimes(location);
  } catch (error) {
    console.error('Error getting prayer times:', error);
    // Return default times as fallback
    return getDefaultPrayerTimes();
  }
}

// Get default prayer times (fallback)
function getDefaultPrayerTimes(): PrayerTime[] {
  const now = new Date();
  return [
    {
      name: PRAYER_NAMES.fajr.english,
      arabicName: PRAYER_NAMES.fajr.arabic,
      time: '5:30 AM',
      date: new Date(now.setHours(5, 30, 0, 0)),
      completed: false,
    },
    {
      name: PRAYER_NAMES.dhuhr.english,
      arabicName: PRAYER_NAMES.dhuhr.arabic,
      time: '12:45 PM',
      date: new Date(now.setHours(12, 45, 0, 0)),
      completed: false,
    },
    {
      name: PRAYER_NAMES.asr.english,
      arabicName: PRAYER_NAMES.asr.arabic,
      time: '4:15 PM',
      date: new Date(now.setHours(16, 15, 0, 0)),
      completed: false,
    },
    {
      name: PRAYER_NAMES.maghrib.english,
      arabicName: PRAYER_NAMES.maghrib.arabic,
      time: '6:30 PM',
      date: new Date(now.setHours(18, 30, 0, 0)),
      completed: false,
    },
    {
      name: PRAYER_NAMES.isha.english,
      arabicName: PRAYER_NAMES.isha.arabic,
      time: '8:00 PM',
      date: new Date(now.setHours(20, 0, 0, 0)),
      completed: false,
    },
  ];
}

// Schedule prayer notifications
export async function schedulePrayerNotifications(
  prayerTimes: PrayerTime[],
  enabled: boolean = true
): Promise<void> {
  try {
    if (!enabled) {
      console.log('Prayer notifications disabled, skipping scheduling');
      return;
    }

    // Cancel existing prayer notifications
    await cancelPrayerNotifications();

    const notificationIds: string[] = [];

    for (const prayer of prayerTimes) {
      // Only schedule if the prayer time is in the future
      if (prayer.date > new Date()) {
        const id = await Notifications.scheduleNotificationAsync({
          content: {
            title: `🕌 ${prayer.name} Prayer Time`,
            body: `It's time for ${prayer.name} prayer (${prayer.arabicName})`,
            sound: 'default',
            priority: Notifications.AndroidNotificationPriority.HIGH,
            categoryIdentifier: 'prayer',
            data: {
              type: 'prayer',
              prayerName: prayer.name,
              prayerTime: prayer.time,
            },
          },
          trigger: {
            date: prayer.date,
          },
        });

        notificationIds.push(id);
        console.log(`Scheduled notification for ${prayer.name} at ${prayer.time}`);
      }
    }

    // Save notification IDs for later cancellation
    await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATION_IDS, JSON.stringify(notificationIds));
    console.log('All prayer notifications scheduled:', notificationIds.length);
  } catch (error) {
    console.error('Error scheduling prayer notifications:', error);
  }
}

// Cancel prayer notifications
export async function cancelPrayerNotifications(): Promise<void> {
  try {
    const idsJson = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATION_IDS);
    if (idsJson) {
      const ids: string[] = JSON.parse(idsJson);
      for (const id of ids) {
        await Notifications.cancelScheduledNotificationAsync(id);
      }
      console.log('Cancelled prayer notifications:', ids.length);
    }

    await AsyncStorage.removeItem(STORAGE_KEYS.NOTIFICATION_IDS);
  } catch (error) {
    console.error('Error cancelling prayer notifications:', error);
  }
}

// Get next prayer
export async function getNextPrayer(prayerTimes: PrayerTime[]): Promise<PrayerTime | null> {
  const now = new Date();
  
  for (const prayer of prayerTimes) {
    if (prayer.date > now) {
      return prayer;
    }
  }

  // If no prayer is left today, return Fajr (next day)
  return prayerTimes[0];
}

// Get time until next prayer
export function getTimeUntilPrayer(prayerTime: PrayerTime): string {
  const now = new Date();
  const diff = prayerTime.date.getTime() - now.getTime();

  if (diff < 0) {
    return 'Passed';
  }

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

// Initialize prayer times and notifications
export async function initializePrayerTimes(notificationsEnabled: boolean = true): Promise<PrayerTime[]> {
  try {
    console.log('Initializing prayer times...');
    
    // Get or calculate prayer times
    const prayerTimes = await getPrayerTimes();
    
    // Schedule notifications if enabled
    if (notificationsEnabled) {
      await schedulePrayerNotifications(prayerTimes, true);
    }

    return prayerTimes;
  } catch (error) {
    console.error('Error initializing prayer times:', error);
    return getDefaultPrayerTimes();
  }
}

// Refresh prayer times (call this daily or when location changes)
export async function refreshPrayerTimes(notificationsEnabled: boolean = true): Promise<PrayerTime[]> {
  try {
    console.log('Refreshing prayer times...');
    
    // Get fresh location
    const location = await getCurrentLocation();
    if (!location) {
      throw new Error('Unable to get location');
    }

    // Calculate new prayer times
    const prayerTimes = await calculatePrayerTimes(location);

    // Reschedule notifications
    if (notificationsEnabled) {
      await schedulePrayerNotifications(prayerTimes, true);
    }

    return prayerTimes;
  } catch (error) {
    console.error('Error refreshing prayer times:', error);
    return await getPrayerTimes();
  }
}

// Update calculation method
export async function updateCalculationMethod(
  method: 'MuslimWorldLeague' | 'Egyptian' | 'Karachi' | 'UmmAlQura' | 'Dubai' | 'Qatar' | 'Kuwait' | 'MoonsightingCommittee' | 'Singapore' | 'NorthAmerica' | 'Tehran',
  madhab: 'Shafi' | 'Hanafi' = 'Shafi'
): Promise<void> {
  try {
    await AsyncStorage.setItem('@prayer_calculation_method', method);
    await AsyncStorage.setItem('@prayer_madhab', madhab);
    
    // Recalculate prayer times with new method
    await refreshPrayerTimes();
  } catch (error) {
    console.error('Error updating calculation method:', error);
  }
}
