
import { Coordinates, CalculationMethod, PrayerTimes } from 'adhan';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserLocation, getLocationWithFallback, UserLocation } from './locationService';

const PRAYER_TIMES_CACHE_KEY = '@prayer_times_cache';
const PRAYER_COMPLETION_KEY = '@prayer_completion';

export interface PrayerTime {
  name: string;
  arabicName: string;
  time: string;
  date: Date;
  completed: boolean;
}

export interface PrayerTimesData {
  prayers: PrayerTime[];
  date: string;
  location: UserLocation;
}

const PRAYER_NAMES = {
  fajr: { english: 'Fajr', arabic: 'الفجر' },
  dhuhr: { english: 'Dhuhr', arabic: 'الظهر' },
  asr: { english: 'Asr', arabic: 'العصر' },
  maghrib: { english: 'Maghrib', arabic: 'المغرب' },
  isha: { english: 'Isha', arabic: 'العشاء' },
};

/**
 * Simple prayer time service - calculates and manages prayer times
 */

// Format time to readable string
function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

// Get today's date string (YYYY-MM-DD)
function getTodayString(): string {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

// Calculate prayer times for a location
export async function calculatePrayerTimes(location: UserLocation): Promise<PrayerTime[]> {
  try {
    console.log('Calculating prayer times for location:', location);

    const coordinates = new Coordinates(location.latitude, location.longitude);
    const params = CalculationMethod.MuslimWorldLeague();
    const date = new Date();
    
    const prayerTimes = new PrayerTimes(coordinates, date, params);

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

    console.log('Prayer times calculated successfully');
    return prayers;
  } catch (error) {
    console.error('Error calculating prayer times:', error);
    throw error;
  }
}

// Get cached prayer times
async function getCachedPrayerTimes(): Promise<PrayerTimesData | null> {
  try {
    const cached = await AsyncStorage.getItem(PRAYER_TIMES_CACHE_KEY);
    if (!cached) return null;

    const data: PrayerTimesData = JSON.parse(cached);
    
    // Check if cache is for today
    if (data.date === getTodayString()) {
      // Convert date strings back to Date objects
      data.prayers = data.prayers.map(p => ({
        ...p,
        date: new Date(p.date),
      }));
      console.log('Using cached prayer times');
      return data;
    }

    console.log('Cached prayer times are outdated');
    return null;
  } catch (error) {
    console.log('Error reading cached prayer times:', error);
    return null;
  }
}

// Cache prayer times
async function cachePrayerTimes(data: PrayerTimesData): Promise<void> {
  try {
    await AsyncStorage.setItem(PRAYER_TIMES_CACHE_KEY, JSON.stringify(data));
    console.log('Prayer times cached successfully');
  } catch (error) {
    console.log('Error caching prayer times:', error);
  }
}

// Get prayer completion status
async function getPrayerCompletionStatus(): Promise<Record<string, boolean>> {
  try {
    const today = getTodayString();
    const cached = await AsyncStorage.getItem(`${PRAYER_COMPLETION_KEY}_${today}`);
    if (!cached) return {};
    return JSON.parse(cached);
  } catch (error) {
    console.log('Error reading prayer completion status:', error);
    return {};
  }
}

// Save prayer completion status
export async function savePrayerCompletionStatus(completionStatus: Record<string, boolean>): Promise<void> {
  try {
    const today = getTodayString();
    await AsyncStorage.setItem(`${PRAYER_COMPLETION_KEY}_${today}`, JSON.stringify(completionStatus));
    console.log('Prayer completion status saved');
  } catch (error) {
    console.log('Error saving prayer completion status:', error);
  }
}

// Get prayer times (with caching)
export async function getPrayerTimes(): Promise<PrayerTime[]> {
  try {
    // Try to get cached prayer times first
    const cached = await getCachedPrayerTimes();
    if (cached) {
      // Apply completion status
      const completionStatus = await getPrayerCompletionStatus();
      cached.prayers = cached.prayers.map(p => ({
        ...p,
        completed: completionStatus[p.name.toLowerCase()] || false,
      }));
      return cached.prayers;
    }

    // Calculate new prayer times
    console.log('Calculating fresh prayer times...');
    const location = await getLocationWithFallback();
    const prayers = await calculatePrayerTimes(location);

    // Apply completion status
    const completionStatus = await getPrayerCompletionStatus();
    const prayersWithStatus = prayers.map(p => ({
      ...p,
      completed: completionStatus[p.name.toLowerCase()] || false,
    }));

    // Cache the prayer times
    await cachePrayerTimes({
      prayers: prayersWithStatus,
      date: getTodayString(),
      location,
    });

    return prayersWithStatus;
  } catch (error) {
    console.error('Error getting prayer times:', error);
    // Return default prayer times as fallback
    return getDefaultPrayerTimes();
  }
}

// Refresh prayer times (force recalculation)
export async function refreshPrayerTimes(): Promise<PrayerTime[]> {
  try {
    console.log('Refreshing prayer times...');
    
    // Clear cache
    await AsyncStorage.removeItem(PRAYER_TIMES_CACHE_KEY);
    
    // Get fresh location and calculate
    const location = await getLocationWithFallback();
    const prayers = await calculatePrayerTimes(location);

    // Apply completion status
    const completionStatus = await getPrayerCompletionStatus();
    const prayersWithStatus = prayers.map(p => ({
      ...p,
      completed: completionStatus[p.name.toLowerCase()] || false,
    }));

    // Cache the new prayer times
    await cachePrayerTimes({
      prayers: prayersWithStatus,
      date: getTodayString(),
      location,
    });

    return prayersWithStatus;
  } catch (error) {
    console.error('Error refreshing prayer times:', error);
    return await getPrayerTimes();
  }
}

// Get next prayer
export function getNextPrayer(prayers: PrayerTime[]): PrayerTime | null {
  const now = new Date();
  
  for (const prayer of prayers) {
    if (prayer.date > now) {
      return prayer;
    }
  }

  // If no prayer is left today, return Fajr (next day)
  return prayers[0] || null;
}

// Get time until prayer
export function getTimeUntilPrayer(prayer: PrayerTime): string {
  const now = new Date();
  const diff = prayer.date.getTime() - now.getTime();

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

// Default prayer times (fallback)
function getDefaultPrayerTimes(): PrayerTime[] {
  const now = new Date();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  return [
    {
      name: PRAYER_NAMES.fajr.english,
      arabicName: PRAYER_NAMES.fajr.arabic,
      time: '5:30 AM',
      date: new Date(today.getTime() + 5.5 * 60 * 60 * 1000),
      completed: false,
    },
    {
      name: PRAYER_NAMES.dhuhr.english,
      arabicName: PRAYER_NAMES.dhuhr.arabic,
      time: '12:45 PM',
      date: new Date(today.getTime() + 12.75 * 60 * 60 * 1000),
      completed: false,
    },
    {
      name: PRAYER_NAMES.asr.english,
      arabicName: PRAYER_NAMES.asr.arabic,
      time: '4:15 PM',
      date: new Date(today.getTime() + 16.25 * 60 * 60 * 1000),
      completed: false,
    },
    {
      name: PRAYER_NAMES.maghrib.english,
      arabicName: PRAYER_NAMES.maghrib.arabic,
      time: '6:30 PM',
      date: new Date(today.getTime() + 18.5 * 60 * 60 * 1000),
      completed: false,
    },
    {
      name: PRAYER_NAMES.isha.english,
      arabicName: PRAYER_NAMES.isha.arabic,
      time: '8:00 PM',
      date: new Date(today.getTime() + 20 * 60 * 60 * 1000),
      completed: false,
    },
  ];
}
