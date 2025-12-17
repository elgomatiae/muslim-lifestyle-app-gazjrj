
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  PrayerGoals,
  DhikrGoals,
  QuranGoals,
  SectionScores,
  loadPrayerGoals,
  loadDhikrGoals,
  loadQuranGoals,
  savePrayerGoals,
  saveDhikrGoals,
  saveQuranGoals,
  getCurrentSectionScores,
  getOverallImanScore,
  updateSectionScores,
  checkAndHandleResets,
} from '@/utils/imanScoreCalculator';
import { useAuth } from './AuthContext';
import { syncLocalToSupabase, syncSupabaseToLocal, initializeImanTrackerForUser } from '@/utils/imanSupabaseSync';

interface ImanTrackerContextType {
  prayerGoals: PrayerGoals | null;
  dhikrGoals: DhikrGoals | null;
  quranGoals: QuranGoals | null;
  sectionScores: SectionScores;
  overallScore: number;
  loading: boolean;
  refreshData: () => Promise<void>;
  updatePrayerGoals: (goals: PrayerGoals) => Promise<void>;
  updateDhikrGoals: (goals: DhikrGoals) => Promise<void>;
  updateQuranGoals: (goals: QuranGoals) => Promise<void>;
  forceUpdate: () => void;
}

const ImanTrackerContext = createContext<ImanTrackerContextType | undefined>(undefined);

export function ImanTrackerProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [prayerGoals, setPrayerGoals] = useState<PrayerGoals | null>(null);
  const [dhikrGoals, setDhikrGoals] = useState<DhikrGoals | null>(null);
  const [quranGoals, setQuranGoals] = useState<QuranGoals | null>(null);
  const [sectionScores, setSectionScores] = useState<SectionScores>({ prayer: 0, dhikr: 0, quran: 0 });
  const [overallScore, setOverallScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [updateTrigger, setUpdateTrigger] = useState(0);

  const loadAllData = useCallback(async () => {
    try {
      console.log('ImanTrackerContext: Loading all data...');
      
      // Check for time-based resets first
      await checkAndHandleResets();

      // If user is logged in, initialize and sync with Supabase
      if (user) {
        await initializeImanTrackerForUser(user.id);
        await syncSupabaseToLocal(user.id);
      }
      
      // Update scores
      await updateSectionScores();
      
      // Load goals
      const prayer = await loadPrayerGoals();
      const dhikr = await loadDhikrGoals();
      const quran = await loadQuranGoals();
      
      setPrayerGoals(prayer);
      setDhikrGoals(dhikr);
      setQuranGoals(quran);
      
      // Load scores
      const scores = await getCurrentSectionScores();
      const overall = await getOverallImanScore();
      
      setSectionScores(scores);
      setOverallScore(overall);
      
      console.log('ImanTrackerContext: Data loaded successfully');
    } catch (error) {
      console.log('ImanTrackerContext: Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const refreshData = useCallback(async () => {
    await loadAllData();
  }, [loadAllData]);

  const updatePrayerGoals = useCallback(async (goals: PrayerGoals) => {
    console.log('ImanTrackerContext: Updating prayer goals...');
    setPrayerGoals(goals);
    await savePrayerGoals(goals);
    await updateSectionScores();
    
    // Update scores immediately
    const scores = await getCurrentSectionScores();
    const overall = await getOverallImanScore();
    setSectionScores(scores);
    setOverallScore(overall);
    
    // Sync to Supabase if user is logged in
    if (user) {
      await syncLocalToSupabase(user.id);
    }
    
    console.log('ImanTrackerContext: Prayer goals updated');
  }, [user]);

  const updateDhikrGoals = useCallback(async (goals: DhikrGoals) => {
    console.log('ImanTrackerContext: Updating dhikr goals...');
    setDhikrGoals(goals);
    await saveDhikrGoals(goals);
    await updateSectionScores();
    
    // Update scores immediately
    const scores = await getCurrentSectionScores();
    const overall = await getOverallImanScore();
    setSectionScores(scores);
    setOverallScore(overall);
    
    // Sync to Supabase if user is logged in
    if (user) {
      await syncLocalToSupabase(user.id);
    }
    
    console.log('ImanTrackerContext: Dhikr goals updated');
  }, [user]);

  const updateQuranGoals = useCallback(async (goals: QuranGoals) => {
    console.log('ImanTrackerContext: Updating quran goals...');
    setQuranGoals(goals);
    await saveQuranGoals(goals);
    await updateSectionScores();
    
    // Update scores immediately
    const scores = await getCurrentSectionScores();
    const overall = await getOverallImanScore();
    setSectionScores(scores);
    setOverallScore(overall);
    
    // Sync to Supabase if user is logged in
    if (user) {
      await syncLocalToSupabase(user.id);
    }
    
    console.log('ImanTrackerContext: Quran goals updated');
  }, [user]);

  const forceUpdate = useCallback(() => {
    console.log('ImanTrackerContext: Force update triggered');
    setUpdateTrigger(prev => prev + 1);
  }, []);

  // Initial load
  useEffect(() => {
    loadAllData();
  }, [loadAllData, updateTrigger]);

  // Check for resets every minute
  useEffect(() => {
    const resetInterval = setInterval(async () => {
      await checkAndHandleResets();
      await refreshData();
    }, 60000);
    
    return () => clearInterval(resetInterval);
  }, [refreshData]);

  // Update scores every 30 seconds for decay
  useEffect(() => {
    const scoreInterval = setInterval(async () => {
      await updateSectionScores();
      const scores = await getCurrentSectionScores();
      const overall = await getOverallImanScore();
      setSectionScores(scores);
      setOverallScore(overall);
    }, 30000);
    
    return () => clearInterval(scoreInterval);
  }, []);

  // Sync to Supabase periodically if user is logged in
  useEffect(() => {
    if (!user) return;

    const syncInterval = setInterval(async () => {
      await syncLocalToSupabase(user.id);
    }, 300000); // Sync every 5 minutes
    
    return () => clearInterval(syncInterval);
  }, [user]);

  const value: ImanTrackerContextType = {
    prayerGoals,
    dhikrGoals,
    quranGoals,
    sectionScores,
    overallScore,
    loading,
    refreshData,
    updatePrayerGoals,
    updateDhikrGoals,
    updateQuranGoals,
    forceUpdate,
  };

  return (
    <ImanTrackerContext.Provider value={value}>
      {children}
    </ImanTrackerContext.Provider>
  );
}

export function useImanTracker() {
  const context = useContext(ImanTrackerContext);
  if (context === undefined) {
    throw new Error('useImanTracker must be used within an ImanTrackerProvider');
  }
  return context;
}
