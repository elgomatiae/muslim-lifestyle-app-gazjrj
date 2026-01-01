
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';
import { 
  getUserLocation, 
  getLocationWithFallback, 
  UserLocation,
  hasLocationChangedSignificantly,
  getLastKnownLocation,
  getLocationName,
  requestLocationPermission,
  isLocationEnabled,
} from './locationService';
import {
  calculatePrayerTimes as calculateWithEngine,
  validateCalculationResult,
  formatPrayerTime,
  getRecommendedMethod,
  CalculationResult,
  CALCULATION_METHODS,
} from './prayerTimeCalculationEngine';

const PRAYER_TIMES_CACHE_KEY = '@prayer_times_cache';
const PRAYER_COMPLETION_KEY = '@prayer_completion';
const CALCULATION_METHOD_KEY = '@calculation_method';
const LAST_LOCATION_KEY = '@last_prayer_location';

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
  calculationMethod: string;
  locationName?: string;
  source: string;
  confidence: number;
}

export interface PrayerTimeAdjustments {
  fajr_offset: number;
  dhuhr_offset: number;
  asr_offset: number;
  maghrib_offset: number;
  isha_offset: number;
}

const PRAYER_NAMES = {
  fajr: { english: 'Fajr', arabic: 'الفجر' },
  dhuhr: { english: 'Dhuhr', arabic: 'الظهر' },
  asr: { english: 'Asr', arabic: 'العصر' },
  maghrib: { english: 'Maghrib', arabic: 'المغرب' },
  isha: { english: 'Isha', arabic: 'العشاء' },
};

// Export calculation methods for settings
export { CALCULATION_METHODS };

/**
 * ENHANCED PRAYER TIME SERVICE v3.0
 * 
 * Complete redesign with:
 * - Multi-source calculation with consensus algorithm
 * - Confidence scoring for accuracy verification
 * - Automatic source selection
 * - Advanced validation
 * - Smart caching with confidence tracking
 */

// ============================================================================
// CALCULATION METHOD MANAGEMENT
// ============================================================================

export async function getCalculationMethod(): Promise<string> {
  try {
    const method = await AsyncStorage.getItem(CALCULATION_METHOD_KEY);
    return method || 'NorthAmerica';
  } catch (error) {
    console.log('Error getting calculation method:', error);
    return 'NorthAmerica';
  }
}

export async function saveCalculationMethod(method: string): Promise<void> {
  try {
    await AsyncStorage.setItem(CALCULATION_METHOD_KEY, method);
    console.log('Calculation method saved:', method);
    await clearPrayerTimesCache();
  } catch (error) {
    console.log('Error saving calculation method:', error);
  }
}

// ============================================================================
// PRAYER TIME ADJUSTMENTS
// ============================================================================

function applyTimeAdjustment(date: Date, offsetMinutes: number): Date {
  const adjusted = new Date(date);
  adjusted.setMinutes(adjusted.getMinutes() + offsetMinutes);
  return adjusted;
}

export async function getPrayerTimeAdjustments(): Promise<PrayerTimeAdjustments | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('prayer_time_adjustments')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.log('Error fetching prayer time adjustments:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.log('Error getting prayer time adjustments:', error);
    return null;
  }
}

export async function savePrayerTimeAdjustments(adjustments: PrayerTimeAdjustments): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('prayer_time_adjustments')
      .upsert({
        user_id: user.id,
        ...adjustments,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Error saving prayer time adjustments:', error);
    } else {
      console.log('Prayer time adjustments saved successfully');
      await clearPrayerTimesCache();
    }
  } catch (error) {
    console.error('Error saving prayer time adjustments:', error);
  }
}

// ============================================================================
// DATABASE STORAGE
// ============================================================================

async function storePrayerTimes(
  prayers: PrayerTime[],
  location: UserLocation,
  calculationMethod: string,
  source: string,
  confidence: number
): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const date = getTodayString();
    const locationName = await getLocationName(location);

    const { error } = await supabase
      .from('prayer_times')
      .upsert({
        user_id: user.id,
        date,
        location_name: locationName,
        latitude: location.latitude,
        longitude: location.longitude,
        fajr_time: prayers[0].date.toTimeString().split(' ')[0],
        dhuhr_time: prayers[1].date.toTimeString().split(' ')[0],
        asr_time: prayers[2].date.toTimeString().split(' ')[0],
        maghrib_time: prayers[3].date.toTimeString().split(' ')[0],
        isha_time: prayers[4].date.toTimeString().split(' ')[0],
        calculation_method: calculationMethod,
        is_manual: false,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Error storing prayer times:', error);
    } else {
      console.log(`✅ Prayer times stored (source: ${source}, confidence: ${confidence.toFixed(1)}%)`);
    }
  } catch (error) {
    console.error('Error storing prayer times:', error);
  }
}

async function saveLastPrayerLocation(location: UserLocation): Promise<void> {
  try {
    await AsyncStorage.setItem(LAST_LOCATION_KEY, JSON.stringify(location));
  } catch (error) {
    console.log('Error saving last prayer location:', error);
  }
}

async function getLastPrayerLocation(): Promise<UserLocation | null> {
  try {
    const cached = await AsyncStorage.getItem(LAST_LOCATION_KEY);
    if (!cached) return null;
    return JSON.parse(cached);
  } catch (error) {
    console.log('Error getting last prayer location:', error);
    return null;
  }
}

// ============================================================================
// CACHING
// ============================================================================

function getTodayString(): string {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

async function getCachedPrayerTimes(): Promise<PrayerTimesData | null> {
  try {
    const cached = await AsyncStorage.getItem(PRAYER_TIMES_CACHE_KEY);
    if (!cached) return null;

    const data: PrayerTimesData = JSON.parse(cached);
    
    if (data.date === getTodayString()) {
      data.prayers = data.prayers.map(p => ({
        ...p,
        date: new Date(p.date),
      }));
      console.log(`✅ Using cached prayer times (confidence: ${data.confidence?.toFixed(1) || 'N/A'}%)`);
      return data;
    }

    console.log('⏰ Cached prayer times are outdated (new day)');
    return null;
  } catch (error) {
    console.log('Error reading cached prayer times:', error);
    return null;
  }
}

async function cachePrayerTimes(data: PrayerTimesData): Promise<void> {
  try {
    await AsyncStorage.setItem(PRAYER_TIMES_CACHE_KEY, JSON.stringify(data));
    console.log(`✅ Prayer times cached (confidence: ${data.confidence?.toFixed(1) || 'N/A'}%)`);
  } catch (error) {
    console.log('Error caching prayer times:', error);
  }
}

export async function clearPrayerTimesCache(): Promise<void> {
  try {
    await AsyncStorage.removeItem(PRAYER_TIMES_CACHE_KEY);
    console.log('✅ Prayer times cache cleared');
  } catch (error) {
    console.log('Error clearing prayer times cache:', error);
  }
}

// ============================================================================
// PRAYER COMPLETION STATUS
// ============================================================================

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

export async function savePrayerCompletionStatus(completionStatus: Record<string, boolean>): Promise<void> {
  try {
    const today = getTodayString();
    await AsyncStorage.setItem(`${PRAYER_COMPLETION_KEY}_${today}`, JSON.stringify(completionStatus));
    console.log('✅ Prayer completion status saved');
  } catch (error) {
    console.log('Error saving prayer completion status:', error);
  }
}

// ============================================================================
// MAIN PRAYER TIME FUNCTIONS
// ============================================================================

/**
 * Calculate prayer times using the new comprehensive engine
 */
async function calculatePrayerTimesWithEngine(
  location: UserLocation,
  methodName?: string
): Promise<{ prayers: PrayerTime[]; source: string; confidence: number }> {
  try {
    const method = methodName || await getCalculationMethod();
    
    console.log('🕌 Calculating prayer times with comprehensive engine...');
    
    // Use the new calculation engine
    const result: CalculationResult = await calculateWithEngine(location, method);
    
    // Validate the result
    if (!validateCalculationResult(result)) {
      throw new Error('Calculation result validation failed');
    }
    
    // Get adjustments if any
    const adjustments = await getPrayerTimeAdjustments();
    
    // Convert to PrayerTime format
    const prayers: PrayerTime[] = [
      {
        name: PRAYER_NAMES.fajr.english,
        arabicName: PRAYER_NAMES.fajr.arabic,
        time: formatPrayerTime(adjustments ? applyTimeAdjustment(result.times.fajr, adjustments.fajr_offset) : result.times.fajr),
        date: adjustments ? applyTimeAdjustment(result.times.fajr, adjustments.fajr_offset) : result.times.fajr,
        completed: false,
      },
      {
        name: PRAYER_NAMES.dhuhr.english,
        arabicName: PRAYER_NAMES.dhuhr.arabic,
        time: formatPrayerTime(adjustments ? applyTimeAdjustment(result.times.dhuhr, adjustments.dhuhr_offset) : result.times.dhuhr),
        date: adjustments ? applyTimeAdjustment(result.times.dhuhr, adjustments.dhuhr_offset) : result.times.dhuhr,
        completed: false,
      },
      {
        name: PRAYER_NAMES.asr.english,
        arabicName: PRAYER_NAMES.asr.arabic,
        time: formatPrayerTime(adjustments ? applyTimeAdjustment(result.times.asr, adjustments.asr_offset) : result.times.asr),
        date: adjustments ? applyTimeAdjustment(result.times.asr, adjustments.asr_offset) : result.times.asr,
        completed: false,
      },
      {
        name: PRAYER_NAMES.maghrib.english,
        arabicName: PRAYER_NAMES.maghrib.arabic,
        time: formatPrayerTime(adjustments ? applyTimeAdjustment(result.times.maghrib, adjustments.maghrib_offset) : result.times.maghrib),
        date: adjustments ? applyTimeAdjustment(result.times.maghrib, adjustments.maghrib_offset) : result.times.maghrib,
        completed: false,
      },
      {
        name: PRAYER_NAMES.isha.english,
        arabicName: PRAYER_NAMES.isha.arabic,
        time: formatPrayerTime(adjustments ? applyTimeAdjustment(result.times.isha, adjustments.isha_offset) : result.times.isha),
        date: adjustments ? applyTimeAdjustment(result.times.isha, adjustments.isha_offset) : result.times.isha,
        completed: false,
      },
    ];
    
    console.log('✅ Prayer times calculated successfully');
    console.log(`📊 Source: ${result.selectedSource}`);
    console.log(`📊 Confidence: ${result.overallConfidence.toFixed(1)}%`);
    console.log('🕌 Times:', prayers.map(p => `${p.name}: ${p.time}`).join(', '));
    
    if (adjustments) {
      const hasAdjustments = Object.values(adjustments).some(v => v !== 0);
      if (hasAdjustments) {
        console.log('⚙️ Applied user adjustments (fine-tuning)');
      }
    }
    
    // Store in database
    await storePrayerTimes(prayers, location, method, result.selectedSource, result.overallConfidence);
    await saveLastPrayerLocation(location);
    
    return {
      prayers,
      source: result.selectedSource,
      confidence: result.overallConfidence,
    };
  } catch (error) {
    console.error('❌ Error calculating prayer times:', error);
    throw error;
  }
}

/**
 * GET PRAYER TIMES - Main function to retrieve prayer times
 */
export async function getPrayerTimes(forceRefresh: boolean = false): Promise<PrayerTime[]> {
  try {
    const today = getTodayString();

    console.log('🕌 Getting prayer times...');

    // Try to get cached prayer times first (if not forcing refresh)
    if (!forceRefresh) {
      const cached = await getCachedPrayerTimes();
      if (cached) {
        // Check if location has changed significantly
        const currentLocation = await getLastKnownLocation();
        const lastPrayerLocation = await getLastPrayerLocation();
        
        if (currentLocation && lastPrayerLocation) {
          const locationChanged = await hasLocationChangedSignificantly(currentLocation);
          if (locationChanged) {
            console.log('📍 Location changed significantly (>5km), recalculating...');
            return await getPrayerTimes(true);
          }
        }

        // Apply completion status
        const completionStatus = await getPrayerCompletionStatus();
        cached.prayers = cached.prayers.map(p => ({
          ...p,
          completed: completionStatus[p.name.toLowerCase()] || false,
        }));
        return cached.prayers;
      }
    }

    // Fetch new prayer times based on GPS location
    console.log('🔄 Fetching fresh prayer times based on GPS location...');
    
    // Ensure we have location permissions
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      console.log('⚠️ Location permission not granted, using fallback location');
    }
    
    const location = await getLocationWithFallback();
    const method = await getCalculationMethod();
    
    // Calculate with the new engine
    const { prayers, source, confidence } = await calculatePrayerTimesWithEngine(location, method);

    // Apply completion status
    const completionStatus = await getPrayerCompletionStatus();
    const prayersWithStatus = prayers.map(p => ({
      ...p,
      completed: completionStatus[p.name.toLowerCase()] || false,
    }));

    // Get location name
    const locationName = await getLocationName(location);

    // Cache the prayer times
    await cachePrayerTimes({
      prayers: prayersWithStatus,
      date: today,
      location,
      calculationMethod: method,
      locationName: locationName || undefined,
      source,
      confidence,
    });

    return prayersWithStatus;
  } catch (error) {
    console.error('❌ Error getting prayer times:', error);
    // Return default prayer times as fallback
    return getDefaultPrayerTimes();
  }
}

/**
 * REFRESH PRAYER TIMES - Force recalculation with fresh GPS location
 */
export async function refreshPrayerTimes(): Promise<PrayerTime[]> {
  try {
    console.log('🔄 REFRESHING PRAYER TIMES WITH FRESH GPS LOCATION');
    
    // Clear cache
    await AsyncStorage.removeItem(PRAYER_TIMES_CACHE_KEY);
    
    // Ensure location services are enabled
    const servicesEnabled = await isLocationEnabled();
    if (!servicesEnabled) {
      console.log('⚠️ Location services are disabled');
    }
    
    // Get fresh location with high accuracy
    console.log('📍 Getting fresh GPS location with high accuracy...');
    const location = await getUserLocation(true);
    const finalLocation = location || await getLocationWithFallback();
    
    const method = await getCalculationMethod();
    
    // Calculate with the new engine
    const { prayers, source, confidence } = await calculatePrayerTimesWithEngine(finalLocation, method);

    // Apply completion status
    const completionStatus = await getPrayerCompletionStatus();
    const prayersWithStatus = prayers.map(p => ({
      ...p,
      completed: completionStatus[p.name.toLowerCase()] || false,
    }));

    // Get location name
    const locationName = await getLocationName(finalLocation);

    // Cache the new prayer times
    await cachePrayerTimes({
      prayers: prayersWithStatus,
      date: getTodayString(),
      location: finalLocation,
      calculationMethod: method,
      locationName: locationName || undefined,
      source,
      confidence,
    });

    console.log('✅ Prayer times refreshed successfully');
    return prayersWithStatus;
  } catch (error) {
    console.error('❌ Error refreshing prayer times:', error);
    return await getPrayerTimes();
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function getNextPrayer(prayers: PrayerTime[]): PrayerTime | null {
  const now = new Date();
  
  for (const prayer of prayers) {
    if (prayer.date > now) {
      return prayer;
    }
  }

  return prayers[0] || null;
}

export function getCurrentPrayer(prayers: PrayerTime[]): PrayerTime | null {
  const now = new Date();
  let currentPrayer: PrayerTime | null = null;
  
  for (const prayer of prayers) {
    if (prayer.date <= now) {
      currentPrayer = prayer;
    } else {
      break;
    }
  }

  return currentPrayer;
}

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

export function getTimeSincePrayer(prayer: PrayerTime): string {
  const now = new Date();
  const diff = now.getTime() - prayer.date.getTime();

  if (diff < 0) {
    return 'Not yet';
  }

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return `${hours}h ${minutes}m ago`;
  }
  return `${minutes}m ago`;
}

export async function getCachedPrayerTimesData(): Promise<PrayerTimesData | null> {
  return await getCachedPrayerTimes();
}

function getDefaultPrayerTimes(): PrayerTime[] {
  const now = new Date();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  console.log('⚠️ Using default fallback prayer times (location unavailable)');

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
