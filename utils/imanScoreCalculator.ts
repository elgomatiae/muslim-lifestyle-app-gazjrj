
import AsyncStorage from '@react-native-async-storage/async-storage';

// Prayer Goals Interface
export interface PrayerGoals {
  // Five daily prayers (mandatory - always tracked)
  fardPrayers: {
    fajr: boolean;
    dhuhr: boolean;
    asr: boolean;
    maghrib: boolean;
    isha: boolean;
  };
  // Sunnah prayers (user-defined daily goal)
  sunnahDailyGoal: number; // How many sunnah prayers per day
  sunnahCompleted: number;
  // Tahajjud (user-defined weekly goal)
  tahajjudWeeklyGoal: number; // How many times per week
  tahajjudCompleted: number;
}

// Dhikr Goals Interface
export interface DhikrGoals {
  dailyGoal: number;
  dailyCompleted: number;
  weeklyGoal: number;
  weeklyCompleted: number;
}

// Quran Goals Interface
export interface QuranGoals {
  dailyPagesGoal: number;
  dailyPagesCompleted: number;
  dailyVersesGoal: number;
  dailyVersesCompleted: number;
  weeklyMemorizationGoal: number; // verses to memorize per week
  weeklyMemorizationCompleted: number;
}

// Individual section scores
export interface SectionScores {
  prayer: number; // 0-100
  dhikr: number; // 0-100
  quran: number; // 0-100
}

// Decay configuration
const DECAY_CONFIG = {
  BASE_DECAY_RATE_PER_HOUR: 0.8, // Increased decay rate
  MAX_DECAY_PER_DAY: 25,
  MIN_SCORE: 0,
  MAX_SCORE: 100,
  
  // Decay multipliers based on completion
  DECAY_MULTIPLIERS: {
    ALL_GOALS_MET: 0, // No decay if all goals met
    MOST_GOALS_MET: 0.3,
    SOME_GOALS_MET: 0.7,
    FEW_GOALS_MET: 1.2,
    NO_GOALS_MET: 1.8,
  },
};

// Calculate Prayer Section Score (0-100)
export function calculatePrayerScore(goals: PrayerGoals): number {
  // Fard prayers are 70% of the score
  const fardCount = Object.values(goals.fardPrayers).filter(Boolean).length;
  const fardScore = (fardCount / 5) * 70;
  
  // Sunnah prayers are 20% of the score
  const sunnahScore = goals.sunnahDailyGoal > 0 
    ? Math.min(1, goals.sunnahCompleted / goals.sunnahDailyGoal) * 20
    : 20; // If no goal set, give full points
  
  // Tahajjud is 10% of the score (weekly)
  const tahajjudScore = goals.tahajjudWeeklyGoal > 0
    ? Math.min(1, goals.tahajjudCompleted / goals.tahajjudWeeklyGoal) * 10
    : 10; // If no goal set, give full points
  
  return Math.min(100, fardScore + sunnahScore + tahajjudScore);
}

// Calculate Dhikr Section Score (0-100)
export function calculateDhikrScore(goals: DhikrGoals): number {
  // Daily dhikr is 70% of the score
  const dailyScore = goals.dailyGoal > 0
    ? Math.min(1, goals.dailyCompleted / goals.dailyGoal) * 70
    : 0;
  
  // Weekly dhikr is 30% of the score
  const weeklyScore = goals.weeklyGoal > 0
    ? Math.min(1, goals.weeklyCompleted / goals.weeklyGoal) * 30
    : 30; // If no weekly goal, give full points for this portion
  
  return Math.min(100, dailyScore + weeklyScore);
}

// Calculate Quran Section Score (0-100)
export function calculateQuranScore(goals: QuranGoals): number {
  // Daily pages is 40% of the score
  const pagesScore = goals.dailyPagesGoal > 0
    ? Math.min(1, goals.dailyPagesCompleted / goals.dailyPagesGoal) * 40
    : 0;
  
  // Daily verses is 30% of the score
  const versesScore = goals.dailyVersesGoal > 0
    ? Math.min(1, goals.dailyVersesCompleted / goals.dailyVersesGoal) * 30
    : 0;
  
  // Weekly memorization is 30% of the score
  const memorizationScore = goals.weeklyMemorizationGoal > 0
    ? Math.min(1, goals.weeklyMemorizationCompleted / goals.weeklyMemorizationGoal) * 30
    : 30; // If no goal set, give full points
  
  return Math.min(100, pagesScore + versesScore + memorizationScore);
}

// Calculate all section scores
export function calculateAllSectionScores(
  prayerGoals: PrayerGoals,
  dhikrGoals: DhikrGoals,
  quranGoals: QuranGoals
): SectionScores {
  return {
    prayer: calculatePrayerScore(prayerGoals),
    dhikr: calculateDhikrScore(dhikrGoals),
    quran: calculateQuranScore(quranGoals),
  };
}

// Get decay multiplier based on completion percentage
function getDecayMultiplier(completionPercentage: number): number {
  if (completionPercentage >= 100) return DECAY_CONFIG.DECAY_MULTIPLIERS.ALL_GOALS_MET;
  if (completionPercentage >= 80) return DECAY_CONFIG.DECAY_MULTIPLIERS.MOST_GOALS_MET;
  if (completionPercentage >= 50) return DECAY_CONFIG.DECAY_MULTIPLIERS.SOME_GOALS_MET;
  if (completionPercentage >= 25) return DECAY_CONFIG.DECAY_MULTIPLIERS.FEW_GOALS_MET;
  return DECAY_CONFIG.DECAY_MULTIPLIERS.NO_GOALS_MET;
}

// Apply decay to a section score
export function applyDecayToSection(
  currentScore: number,
  lastUpdated: string,
  currentCompletion: number // 0-100
): number {
  const now = new Date();
  const lastUpdate = new Date(lastUpdated);
  const hoursSinceUpdate = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60);
  
  if (hoursSinceUpdate < 1) {
    return currentScore;
  }
  
  const decayMultiplier = getDecayMultiplier(currentCompletion);
  const decayPerHour = DECAY_CONFIG.BASE_DECAY_RATE_PER_HOUR * decayMultiplier;
  const totalDecay = Math.min(
    decayPerHour * hoursSinceUpdate,
    DECAY_CONFIG.MAX_DECAY_PER_DAY
  );
  
  const newScore = currentScore - totalDecay;
  return Math.max(DECAY_CONFIG.MIN_SCORE, newScore);
}

// Load Prayer Goals from AsyncStorage
export async function loadPrayerGoals(): Promise<PrayerGoals> {
  try {
    const saved = await AsyncStorage.getItem('prayerGoals');
    if (saved) {
      return JSON.parse(saved);
    }
    
    // Default goals
    return {
      fardPrayers: {
        fajr: false,
        dhuhr: false,
        asr: false,
        maghrib: false,
        isha: false,
      },
      sunnahDailyGoal: 5, // Default: 5 sunnah prayers per day
      sunnahCompleted: 0,
      tahajjudWeeklyGoal: 2, // Default: 2 tahajjud per week
      tahajjudCompleted: 0,
    };
  } catch (error) {
    console.log('Error loading prayer goals:', error);
    return {
      fardPrayers: {
        fajr: false,
        dhuhr: false,
        asr: false,
        maghrib: false,
        isha: false,
      },
      sunnahDailyGoal: 5,
      sunnahCompleted: 0,
      tahajjudWeeklyGoal: 2,
      tahajjudCompleted: 0,
    };
  }
}

// Load Dhikr Goals from AsyncStorage
export async function loadDhikrGoals(): Promise<DhikrGoals> {
  try {
    const saved = await AsyncStorage.getItem('dhikrGoals');
    if (saved) {
      return JSON.parse(saved);
    }
    
    // Default goals
    return {
      dailyGoal: 100,
      dailyCompleted: 0,
      weeklyGoal: 1000,
      weeklyCompleted: 0,
    };
  } catch (error) {
    console.log('Error loading dhikr goals:', error);
    return {
      dailyGoal: 100,
      dailyCompleted: 0,
      weeklyGoal: 1000,
      weeklyCompleted: 0,
    };
  }
}

// Load Quran Goals from AsyncStorage
export async function loadQuranGoals(): Promise<QuranGoals> {
  try {
    const saved = await AsyncStorage.getItem('quranGoals');
    if (saved) {
      return JSON.parse(saved);
    }
    
    // Default goals
    return {
      dailyPagesGoal: 2,
      dailyPagesCompleted: 0,
      dailyVersesGoal: 10,
      dailyVersesCompleted: 0,
      weeklyMemorizationGoal: 5,
      weeklyMemorizationCompleted: 0,
    };
  } catch (error) {
    console.log('Error loading quran goals:', error);
    return {
      dailyPagesGoal: 2,
      dailyPagesCompleted: 0,
      dailyVersesGoal: 10,
      dailyVersesCompleted: 0,
      weeklyMemorizationGoal: 5,
      weeklyMemorizationCompleted: 0,
    };
  }
}

// Save goals
export async function savePrayerGoals(goals: PrayerGoals): Promise<void> {
  await AsyncStorage.setItem('prayerGoals', JSON.stringify(goals));
}

export async function saveDhikrGoals(goals: DhikrGoals): Promise<void> {
  await AsyncStorage.setItem('dhikrGoals', JSON.stringify(goals));
}

export async function saveQuranGoals(goals: QuranGoals): Promise<void> {
  await AsyncStorage.setItem('quranGoals', JSON.stringify(goals));
}

// Get current section scores with decay applied
export async function getCurrentSectionScores(): Promise<SectionScores> {
  try {
    const prayerGoals = await loadPrayerGoals();
    const dhikrGoals = await loadDhikrGoals();
    const quranGoals = await loadQuranGoals();
    
    // Calculate fresh scores
    const freshScores = calculateAllSectionScores(prayerGoals, dhikrGoals, quranGoals);
    
    // Load last updated times and stored scores
    const lastUpdated = await AsyncStorage.getItem('sectionScoresLastUpdated');
    const storedScores = await AsyncStorage.getItem('sectionScores');
    
    if (!lastUpdated || !storedScores) {
      // First time, return fresh scores
      await AsyncStorage.setItem('sectionScores', JSON.stringify(freshScores));
      await AsyncStorage.setItem('sectionScoresLastUpdated', new Date().toISOString());
      return freshScores;
    }
    
    const stored: SectionScores = JSON.parse(storedScores);
    
    // Apply decay to each section
    const decayedScores: SectionScores = {
      prayer: applyDecayToSection(stored.prayer, lastUpdated, freshScores.prayer),
      dhikr: applyDecayToSection(stored.dhikr, lastUpdated, freshScores.dhikr),
      quran: applyDecayToSection(stored.quran, lastUpdated, freshScores.quran),
    };
    
    // Take the maximum of decayed and fresh scores (progress should increase score)
    const finalScores: SectionScores = {
      prayer: Math.max(decayedScores.prayer, freshScores.prayer),
      dhikr: Math.max(decayedScores.dhikr, freshScores.dhikr),
      quran: Math.max(decayedScores.quran, freshScores.quran),
    };
    
    // Save updated scores
    await AsyncStorage.setItem('sectionScores', JSON.stringify(finalScores));
    await AsyncStorage.setItem('sectionScoresLastUpdated', new Date().toISOString());
    
    return finalScores;
  } catch (error) {
    console.log('Error getting current section scores:', error);
    return { prayer: 0, dhikr: 0, quran: 0 };
  }
}

// Update section scores (call this periodically)
export async function updateSectionScores(): Promise<SectionScores> {
  return await getCurrentSectionScores();
}

// Reset daily goals (call at start of new day)
export async function resetDailyGoals(): Promise<void> {
  try {
    const prayerGoals = await loadPrayerGoals();
    const dhikrGoals = await loadDhikrGoals();
    const quranGoals = await loadQuranGoals();
    
    // Reset daily counters but keep goals
    prayerGoals.fardPrayers = {
      fajr: false,
      dhuhr: false,
      asr: false,
      maghrib: false,
      isha: false,
    };
    prayerGoals.sunnahCompleted = 0;
    
    dhikrGoals.dailyCompleted = 0;
    
    quranGoals.dailyPagesCompleted = 0;
    quranGoals.dailyVersesCompleted = 0;
    
    await savePrayerGoals(prayerGoals);
    await saveDhikrGoals(dhikrGoals);
    await saveQuranGoals(quranGoals);
    
    console.log('Daily goals reset for new day');
  } catch (error) {
    console.log('Error resetting daily goals:', error);
  }
}

// Reset weekly goals (call at start of new week)
export async function resetWeeklyGoals(): Promise<void> {
  try {
    const prayerGoals = await loadPrayerGoals();
    const dhikrGoals = await loadDhikrGoals();
    const quranGoals = await loadQuranGoals();
    
    prayerGoals.tahajjudCompleted = 0;
    dhikrGoals.weeklyCompleted = 0;
    quranGoals.weeklyMemorizationCompleted = 0;
    
    await savePrayerGoals(prayerGoals);
    await saveDhikrGoals(dhikrGoals);
    await saveQuranGoals(quranGoals);
    
    console.log('Weekly goals reset for new week');
  } catch (error) {
    console.log('Error resetting weekly goals:', error);
  }
}

// Get overall Iman score (average of three sections)
export async function getOverallImanScore(): Promise<number> {
  const scores = await getCurrentSectionScores();
  return Math.round((scores.prayer + scores.dhikr + scores.quran) / 3);
}

// Helper to check if goals are met
export async function checkGoalsCompletion() {
  const prayerGoals = await loadPrayerGoals();
  const dhikrGoals = await loadDhikrGoals();
  const quranGoals = await loadQuranGoals();
  
  const prayerScore = calculatePrayerScore(prayerGoals);
  const dhikrScore = calculateDhikrScore(dhikrGoals);
  const quranScore = calculateQuranScore(quranGoals);
  
  return {
    prayer: {
      dailyMet: Object.values(prayerGoals.fardPrayers).every(Boolean) && 
                prayerGoals.sunnahCompleted >= prayerGoals.sunnahDailyGoal,
      weeklyMet: prayerGoals.tahajjudCompleted >= prayerGoals.tahajjudWeeklyGoal,
      score: prayerScore,
    },
    dhikr: {
      dailyMet: dhikrGoals.dailyCompleted >= dhikrGoals.dailyGoal,
      weeklyMet: dhikrGoals.weeklyCompleted >= dhikrGoals.weeklyGoal,
      score: dhikrScore,
    },
    quran: {
      dailyMet: quranGoals.dailyPagesCompleted >= quranGoals.dailyPagesGoal &&
                quranGoals.dailyVersesCompleted >= quranGoals.dailyVersesGoal,
      weeklyMet: quranGoals.weeklyMemorizationCompleted >= quranGoals.weeklyMemorizationGoal,
      score: quranScore,
    },
  };
}
