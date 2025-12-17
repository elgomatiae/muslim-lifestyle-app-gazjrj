
import { supabase } from '@/lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  PrayerGoals,
  DhikrGoals,
  QuranGoals,
  loadPrayerGoals,
  loadDhikrGoals,
  loadQuranGoals,
  savePrayerGoals,
  saveDhikrGoals,
  saveQuranGoals,
} from './imanScoreCalculator';

export interface ImanTrackerData {
  id?: string;
  user_id: string;
  
  // Prayer goals
  fard_fajr: boolean;
  fard_dhuhr: boolean;
  fard_asr: boolean;
  fard_maghrib: boolean;
  fard_isha: boolean;
  sunnah_daily_goal: number;
  sunnah_completed: number;
  tahajjud_weekly_goal: number;
  tahajjud_completed: number;
  
  // Quran goals
  quran_daily_pages_goal: number;
  quran_daily_pages_completed: number;
  quran_daily_verses_goal: number;
  quran_daily_verses_completed: number;
  quran_weekly_memorization_goal: number;
  quran_weekly_memorization_completed: number;
  
  // Dhikr goals
  dhikr_daily_goal: number;
  dhikr_daily_completed: number;
  dhikr_weekly_goal: number;
  dhikr_weekly_completed: number;
  
  // Scores
  prayer_score: number;
  quran_score: number;
  dhikr_score: number;
  
  // Tracking dates
  last_updated?: string;
  last_daily_reset?: string;
  last_weekly_reset?: string;
}

// Load Iman Tracker data from Supabase
export async function loadImanTrackerFromSupabase(userId: string): Promise<ImanTrackerData | null> {
  try {
    const { data, error } = await supabase
      .from('iman_tracker_goals')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        console.log('No iman tracker data found for user');
        return null;
      }
      console.error('Error loading iman tracker from Supabase:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error loading iman tracker from Supabase:', error);
    return null;
  }
}

// Save Iman Tracker data to Supabase
export async function saveImanTrackerToSupabase(userId: string, data: Partial<ImanTrackerData>): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('iman_tracker_goals')
      .upsert({
        user_id: userId,
        ...data,
        last_updated: new Date().toISOString(),
      }, {
        onConflict: 'user_id',
      });

    if (error) {
      console.error('Error saving iman tracker to Supabase:', error);
      return false;
    }

    console.log('Iman tracker data saved to Supabase');
    return true;
  } catch (error) {
    console.error('Error saving iman tracker to Supabase:', error);
    return false;
  }
}

// Sync local AsyncStorage data to Supabase
export async function syncLocalToSupabase(userId: string): Promise<boolean> {
  try {
    console.log('Syncing local data to Supabase for user:', userId);
    
    // Load local data
    const prayerGoals = await loadPrayerGoals();
    const dhikrGoals = await loadDhikrGoals();
    const quranGoals = await loadQuranGoals();
    
    // Get last reset dates
    const lastDailyReset = await AsyncStorage.getItem('lastImanDate');
    const lastWeeklyReset = await AsyncStorage.getItem('lastImanWeek');
    
    // Prepare data for Supabase
    const imanData: Partial<ImanTrackerData> = {
      // Prayer
      fard_fajr: prayerGoals.fardPrayers.fajr,
      fard_dhuhr: prayerGoals.fardPrayers.dhuhr,
      fard_asr: prayerGoals.fardPrayers.asr,
      fard_maghrib: prayerGoals.fardPrayers.maghrib,
      fard_isha: prayerGoals.fardPrayers.isha,
      sunnah_daily_goal: prayerGoals.sunnahDailyGoal,
      sunnah_completed: prayerGoals.sunnahCompleted,
      tahajjud_weekly_goal: prayerGoals.tahajjudWeeklyGoal,
      tahajjud_completed: prayerGoals.tahajjudCompleted,
      
      // Quran
      quran_daily_pages_goal: quranGoals.dailyPagesGoal,
      quran_daily_pages_completed: quranGoals.dailyPagesCompleted,
      quran_daily_verses_goal: quranGoals.dailyVersesGoal,
      quran_daily_verses_completed: quranGoals.dailyVersesCompleted,
      quran_weekly_memorization_goal: quranGoals.weeklyMemorizationGoal,
      quran_weekly_memorization_completed: quranGoals.weeklyMemorizationCompleted,
      
      // Dhikr
      dhikr_daily_goal: dhikrGoals.dailyGoal,
      dhikr_daily_completed: dhikrGoals.dailyCompleted,
      dhikr_weekly_goal: dhikrGoals.weeklyGoal,
      dhikr_weekly_completed: dhikrGoals.weeklyCompleted,
      
      // Scores
      prayer_score: prayerGoals.score || 0,
      quran_score: quranGoals.score || 0,
      dhikr_score: dhikrGoals.score || 0,
      
      // Dates
      last_daily_reset: lastDailyReset || new Date().toDateString(),
      last_weekly_reset: lastWeeklyReset || new Date().toDateString(),
    };
    
    return await saveImanTrackerToSupabase(userId, imanData);
  } catch (error) {
    console.error('Error syncing local to Supabase:', error);
    return false;
  }
}

// Sync Supabase data to local AsyncStorage
export async function syncSupabaseToLocal(userId: string): Promise<boolean> {
  try {
    console.log('Syncing Supabase data to local for user:', userId);
    
    const data = await loadImanTrackerFromSupabase(userId);
    
    if (!data) {
      console.log('No data to sync from Supabase');
      return false;
    }
    
    // Update local storage with Supabase data
    const prayerGoals: PrayerGoals = {
      fardPrayers: {
        fajr: data.fard_fajr,
        dhuhr: data.fard_dhuhr,
        asr: data.fard_asr,
        maghrib: data.fard_maghrib,
        isha: data.fard_isha,
      },
      sunnahDailyGoal: data.sunnah_daily_goal,
      sunnahCompleted: data.sunnah_completed,
      tahajjudWeeklyGoal: data.tahajjud_weekly_goal,
      tahajjudCompleted: data.tahajjud_completed,
      score: data.prayer_score,
    };
    
    const quranGoals: QuranGoals = {
      dailyPagesGoal: data.quran_daily_pages_goal,
      dailyPagesCompleted: data.quran_daily_pages_completed,
      dailyVersesGoal: data.quran_daily_verses_goal,
      dailyVersesCompleted: data.quran_daily_verses_completed,
      weeklyMemorizationGoal: data.quran_weekly_memorization_goal,
      weeklyMemorizationCompleted: data.quran_weekly_memorization_completed,
      score: data.quran_score,
    };
    
    const dhikrGoals: DhikrGoals = {
      dailyGoal: data.dhikr_daily_goal,
      dailyCompleted: data.dhikr_daily_completed,
      weeklyGoal: data.dhikr_weekly_goal,
      weeklyCompleted: data.dhikr_weekly_completed,
      score: data.dhikr_score,
    };
    
    await savePrayerGoals(prayerGoals);
    await saveQuranGoals(quranGoals);
    await saveDhikrGoals(dhikrGoals);
    
    if (data.last_daily_reset) {
      await AsyncStorage.setItem('lastImanDate', data.last_daily_reset);
    }
    
    if (data.last_weekly_reset) {
      await AsyncStorage.setItem('lastImanWeek', data.last_weekly_reset);
    }
    
    console.log('Supabase data synced to local');
    return true;
  } catch (error) {
    console.error('Error syncing Supabase to local:', error);
    return false;
  }
}

// Initialize Iman Tracker for a new user
export async function initializeImanTrackerForUser(userId: string): Promise<boolean> {
  try {
    console.log('Initializing Iman Tracker for user:', userId);
    
    // Check if user already has data
    const existingData = await loadImanTrackerFromSupabase(userId);
    
    if (existingData) {
      console.log('User already has Iman Tracker data, syncing to local');
      return await syncSupabaseToLocal(userId);
    }
    
    // Check if there's local data to migrate
    const localPrayerGoals = await loadPrayerGoals();
    const hasLocalData = localPrayerGoals.sunnahDailyGoal > 0 || 
                         Object.values(localPrayerGoals.fardPrayers).some(v => v);
    
    if (hasLocalData) {
      console.log('Found local data, migrating to Supabase');
      return await syncLocalToSupabase(userId);
    }
    
    // Create default data for new user
    const defaultData: Partial<ImanTrackerData> = {
      fard_fajr: false,
      fard_dhuhr: false,
      fard_asr: false,
      fard_maghrib: false,
      fard_isha: false,
      sunnah_daily_goal: 2,
      sunnah_completed: 0,
      tahajjud_weekly_goal: 3,
      tahajjud_completed: 0,
      quran_daily_pages_goal: 2,
      quran_daily_pages_completed: 0,
      quran_daily_verses_goal: 10,
      quran_daily_verses_completed: 0,
      quran_weekly_memorization_goal: 5,
      quran_weekly_memorization_completed: 0,
      dhikr_daily_goal: 100,
      dhikr_daily_completed: 0,
      dhikr_weekly_goal: 1000,
      dhikr_weekly_completed: 0,
      prayer_score: 0,
      quran_score: 0,
      dhikr_score: 0,
      last_daily_reset: new Date().toDateString(),
      last_weekly_reset: new Date().toDateString(),
    };
    
    return await saveImanTrackerToSupabase(userId, defaultData);
  } catch (error) {
    console.error('Error initializing Iman Tracker for user:', error);
    return false;
  }
}
