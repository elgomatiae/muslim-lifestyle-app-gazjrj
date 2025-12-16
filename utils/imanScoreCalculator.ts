
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ImanScoreData {
  score: number;
  lastUpdated: string;
  dailyGoalsCompleted: boolean;
  weeklyGoalsCompleted: boolean;
}

export interface DailyGoalsProgress {
  prayer: {
    completed: number;
    total: number;
    progress: number;
  };
  quran: {
    completed: number;
    total: number;
    progress: number;
  };
  dhikr: {
    completed: number;
    total: number;
    progress: number;
  };
  sunnahPrayers: {
    completed: number;
    total: number;
    progress: number;
  };
  dailyDuas: {
    completed: number;
    total: number;
    progress: number;
  };
  fasting: {
    isFasting: boolean;
    progress: number;
  };
  charity: {
    donated: boolean;
    progress: number;
  };
}

export interface WeeklyGoalsProgress {
  challenges: {
    completed: number;
    total: number;
    progress: number;
  };
}

// Configuration constants
const DECAY_CONFIG = {
  // Base decay rate per hour when no activity
  BASE_DECAY_RATE_PER_HOUR: 0.5, // 0.5% per hour
  
  // Maximum decay per day
  MAX_DECAY_PER_DAY: 20, // Maximum 20% decay per day
  
  // Minimum score (never goes below this)
  MIN_SCORE: 0,
  
  // Maximum score
  MAX_SCORE: 100,
  
  // Decay multipliers based on activity
  DECAY_MULTIPLIERS: {
    ALL_GOALS_MET: 0, // No decay
    MOST_GOALS_MET: 0.3, // 30% of base decay
    SOME_GOALS_MET: 0.6, // 60% of base decay
    FEW_GOALS_MET: 1.0, // Full decay
    NO_GOALS_MET: 1.5, // 150% decay (faster decline)
  },
  
  // Weight for each category in overall score
  WEIGHTS: {
    PRAYER: 0.30, // 30% weight
    QURAN: 0.25, // 25% weight
    DHIKR: 0.20, // 20% weight
    SUNNAH_PRAYERS: 0.10, // 10% weight
    DAILY_DUAS: 0.05, // 5% weight
    FASTING: 0.05, // 5% weight
    CHARITY: 0.05, // 5% weight
  },
  
  // Weekly goals contribution
  WEEKLY_GOALS_WEIGHT: 0.15, // 15% of total score comes from weekly goals
  DAILY_GOALS_WEIGHT: 0.85, // 85% of total score comes from daily goals
};

/**
 * Calculate the overall Iman score based on daily and weekly goals
 */
export function calculateImanScore(
  dailyProgress: DailyGoalsProgress,
  weeklyProgress: WeeklyGoalsProgress
): number {
  // Calculate daily goals score (0-100)
  const dailyScore = 
    (dailyProgress.prayer.progress * DECAY_CONFIG.WEIGHTS.PRAYER) +
    (dailyProgress.quran.progress * DECAY_CONFIG.WEIGHTS.QURAN) +
    (dailyProgress.dhikr.progress * DECAY_CONFIG.WEIGHTS.DHIKR) +
    (dailyProgress.sunnahPrayers.progress * DECAY_CONFIG.WEIGHTS.SUNNAH_PRAYERS) +
    (dailyProgress.dailyDuas.progress * DECAY_CONFIG.WEIGHTS.DAILY_DUAS) +
    (dailyProgress.fasting.progress * DECAY_CONFIG.WEIGHTS.FASTING) +
    (dailyProgress.charity.progress * DECAY_CONFIG.WEIGHTS.CHARITY);
  
  // Calculate weekly goals score (0-100)
  const weeklyScore = weeklyProgress.challenges.progress;
  
  // Combine daily and weekly scores with their respective weights
  const totalScore = 
    (dailyScore * DECAY_CONFIG.DAILY_GOALS_WEIGHT) +
    (weeklyScore * DECAY_CONFIG.WEEKLY_GOALS_WEIGHT);
  
  // Ensure score is between 0 and 100
  return Math.max(DECAY_CONFIG.MIN_SCORE, Math.min(DECAY_CONFIG.MAX_SCORE, totalScore * 100));
}

/**
 * Calculate decay multiplier based on overall progress
 */
function getDecayMultiplier(overallProgress: number): number {
  if (overallProgress >= 0.9) return DECAY_CONFIG.DECAY_MULTIPLIERS.ALL_GOALS_MET;
  if (overallProgress >= 0.7) return DECAY_CONFIG.DECAY_MULTIPLIERS.MOST_GOALS_MET;
  if (overallProgress >= 0.4) return DECAY_CONFIG.DECAY_MULTIPLIERS.SOME_GOALS_MET;
  if (overallProgress >= 0.2) return DECAY_CONFIG.DECAY_MULTIPLIERS.FEW_GOALS_MET;
  return DECAY_CONFIG.DECAY_MULTIPLIERS.NO_GOALS_MET;
}

/**
 * Apply time-based decay to the score
 */
export function applyDecay(
  currentScore: number,
  lastUpdated: string,
  dailyProgress: DailyGoalsProgress,
  weeklyProgress: WeeklyGoalsProgress
): number {
  const now = new Date();
  const lastUpdate = new Date(lastUpdated);
  const hoursSinceUpdate = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60);
  
  // If less than 1 hour, no decay
  if (hoursSinceUpdate < 1) {
    return currentScore;
  }
  
  // Calculate overall progress to determine decay rate
  const dailyScore = 
    (dailyProgress.prayer.progress * DECAY_CONFIG.WEIGHTS.PRAYER) +
    (dailyProgress.quran.progress * DECAY_CONFIG.WEIGHTS.QURAN) +
    (dailyProgress.dhikr.progress * DECAY_CONFIG.WEIGHTS.DHIKR) +
    (dailyProgress.sunnahPrayers.progress * DECAY_CONFIG.WEIGHTS.SUNNAH_PRAYERS) +
    (dailyProgress.dailyDuas.progress * DECAY_CONFIG.WEIGHTS.DAILY_DUAS) +
    (dailyProgress.fasting.progress * DECAY_CONFIG.WEIGHTS.FASTING) +
    (dailyProgress.charity.progress * DECAY_CONFIG.WEIGHTS.CHARITY);
  
  const weeklyScore = weeklyProgress.challenges.progress;
  const overallProgress = 
    (dailyScore * DECAY_CONFIG.DAILY_GOALS_WEIGHT) +
    (weeklyScore * DECAY_CONFIG.WEEKLY_GOALS_WEIGHT);
  
  // Get decay multiplier based on progress
  const decayMultiplier = getDecayMultiplier(overallProgress);
  
  // Calculate decay amount
  const decayPerHour = DECAY_CONFIG.BASE_DECAY_RATE_PER_HOUR * decayMultiplier;
  const totalDecay = Math.min(
    decayPerHour * hoursSinceUpdate,
    DECAY_CONFIG.MAX_DECAY_PER_DAY
  );
  
  // Apply decay
  const newScore = currentScore - totalDecay;
  
  // Ensure score doesn't go below minimum
  return Math.max(DECAY_CONFIG.MIN_SCORE, newScore);
}

/**
 * Load daily goals progress from AsyncStorage
 */
export async function loadDailyGoalsProgress(): Promise<DailyGoalsProgress> {
  try {
    // Load prayer progress
    const prayerProgressStr = await AsyncStorage.getItem('prayerProgress');
    const prayerProgress = prayerProgressStr ? JSON.parse(prayerProgressStr) : { completed: 0, total: 5 };
    
    // Load Quran progress
    const quranProgressStr = await AsyncStorage.getItem('quranProgress');
    const quranProgress = quranProgressStr ? JSON.parse(quranProgressStr) : {
      versesToMemorize: 5,
      versesMemorized: 0,
      pagesToRead: 2,
      pagesRead: 0,
    };
    
    // Load Dhikr progress
    const dhikrProgressStr = await AsyncStorage.getItem('dhikrProgress');
    const dhikrProgress = dhikrProgressStr ? JSON.parse(dhikrProgressStr) : {
      dailyTarget: 100,
      currentCount: 0,
    };
    
    // Load Sunnah prayers
    const sunnahPrayersStr = await AsyncStorage.getItem('sunnahPrayers');
    const sunnahPrayers = sunnahPrayersStr ? JSON.parse(sunnahPrayersStr) : [];
    const sunnahTotal = 7; // Total number of sunnah prayers
    
    // Load daily duas
    const completedDuasStr = await AsyncStorage.getItem('completedDuas');
    const completedDuas = completedDuasStr ? JSON.parse(completedDuasStr) : [];
    const duasTotal = 3; // Total number of daily duas
    
    // Load fasting status
    const todayFasting = await AsyncStorage.getItem('todayFasting');
    const isFasting = todayFasting === 'true';
    
    // Load charity status (check if donated today)
    const charityDataStr = await AsyncStorage.getItem('charityData');
    const charityData = charityDataStr ? JSON.parse(charityDataStr) : [];
    const today = new Date().toDateString();
    const donatedToday = charityData.some((entry: any) => 
      new Date(entry.date).toDateString() === today
    );
    
    // Calculate Quran progress
    const quranMemorizeProgress = quranProgress.versesMemorized / quranProgress.versesToMemorize;
    const quranReadProgress = quranProgress.pagesRead / quranProgress.pagesToRead;
    const quranOverallProgress = (quranMemorizeProgress + quranReadProgress) / 2;
    
    return {
      prayer: {
        completed: prayerProgress.completed,
        total: prayerProgress.total,
        progress: prayerProgress.completed / prayerProgress.total,
      },
      quran: {
        completed: quranProgress.versesMemorized + quranProgress.pagesRead,
        total: quranProgress.versesToMemorize + quranProgress.pagesToRead,
        progress: quranOverallProgress,
      },
      dhikr: {
        completed: dhikrProgress.currentCount,
        total: dhikrProgress.dailyTarget,
        progress: Math.min(1, dhikrProgress.currentCount / dhikrProgress.dailyTarget),
      },
      sunnahPrayers: {
        completed: sunnahPrayers.length,
        total: sunnahTotal,
        progress: sunnahPrayers.length / sunnahTotal,
      },
      dailyDuas: {
        completed: completedDuas.length,
        total: duasTotal,
        progress: completedDuas.length / duasTotal,
      },
      fasting: {
        isFasting,
        progress: isFasting ? 1 : 0,
      },
      charity: {
        donated: donatedToday,
        progress: donatedToday ? 1 : 0,
      },
    };
  } catch (error) {
    console.log('Error loading daily goals progress:', error);
    return {
      prayer: { completed: 0, total: 5, progress: 0 },
      quran: { completed: 0, total: 7, progress: 0 },
      dhikr: { completed: 0, total: 100, progress: 0 },
      sunnahPrayers: { completed: 0, total: 7, progress: 0 },
      dailyDuas: { completed: 0, total: 3, progress: 0 },
      fasting: { isFasting: false, progress: 0 },
      charity: { donated: false, progress: 0 },
    };
  }
}

/**
 * Load weekly goals progress from AsyncStorage
 */
export async function loadWeeklyGoalsProgress(): Promise<WeeklyGoalsProgress> {
  try {
    const challengesStr = await AsyncStorage.getItem('challenges');
    const challenges = challengesStr ? JSON.parse(challengesStr) : [];
    
    const completedChallenges = challenges.filter((c: any) => c.completed).length;
    const totalChallenges = challenges.length || 3; // Default to 3 if no challenges
    
    return {
      challenges: {
        completed: completedChallenges,
        total: totalChallenges,
        progress: completedChallenges / totalChallenges,
      },
    };
  } catch (error) {
    console.log('Error loading weekly goals progress:', error);
    return {
      challenges: {
        completed: 0,
        total: 3,
        progress: 0,
      },
    };
  }
}

/**
 * Get the current Iman score with decay applied
 */
export async function getCurrentImanScore(): Promise<number> {
  try {
    // Load stored score data
    const scoreDataStr = await AsyncStorage.getItem('imanScoreData');
    const scoreData: ImanScoreData = scoreDataStr ? JSON.parse(scoreDataStr) : {
      score: 50, // Start at 50%
      lastUpdated: new Date().toISOString(),
      dailyGoalsCompleted: false,
      weeklyGoalsCompleted: false,
    };
    
    // Load current progress
    const dailyProgress = await loadDailyGoalsProgress();
    const weeklyProgress = await loadWeeklyGoalsProgress();
    
    // Apply decay based on time elapsed
    const decayedScore = applyDecay(
      scoreData.score,
      scoreData.lastUpdated,
      dailyProgress,
      weeklyProgress
    );
    
    // Calculate fresh score based on current progress
    const freshScore = calculateImanScore(dailyProgress, weeklyProgress);
    
    // Use the higher of the two (so completing goals increases score)
    const finalScore = Math.max(decayedScore, freshScore);
    
    return finalScore;
  } catch (error) {
    console.log('Error getting current Iman score:', error);
    return 50; // Default to 50%
  }
}

/**
 * Update the Iman score and save to storage
 */
export async function updateImanScore(): Promise<number> {
  try {
    const score = await getCurrentImanScore();
    
    // Load progress to check if goals are completed
    const dailyProgress = await loadDailyGoalsProgress();
    const weeklyProgress = await loadWeeklyGoalsProgress();
    
    const dailyGoalsCompleted = 
      dailyProgress.prayer.progress === 1 &&
      dailyProgress.quran.progress === 1 &&
      dailyProgress.dhikr.progress === 1 &&
      dailyProgress.sunnahPrayers.progress === 1 &&
      dailyProgress.dailyDuas.progress === 1;
    
    const weeklyGoalsCompleted = weeklyProgress.challenges.progress === 1;
    
    // Save updated score
    const scoreData: ImanScoreData = {
      score,
      lastUpdated: new Date().toISOString(),
      dailyGoalsCompleted,
      weeklyGoalsCompleted,
    };
    
    await AsyncStorage.setItem('imanScoreData', JSON.stringify(scoreData));
    
    return score;
  } catch (error) {
    console.log('Error updating Iman score:', error);
    return 50;
  }
}

/**
 * Get detailed breakdown of score components
 */
export async function getScoreBreakdown() {
  const dailyProgress = await loadDailyGoalsProgress();
  const weeklyProgress = await loadWeeklyGoalsProgress();
  
  const dailyScores = {
    prayer: dailyProgress.prayer.progress * DECAY_CONFIG.WEIGHTS.PRAYER * 100,
    quran: dailyProgress.quran.progress * DECAY_CONFIG.WEIGHTS.QURAN * 100,
    dhikr: dailyProgress.dhikr.progress * DECAY_CONFIG.WEIGHTS.DHIKR * 100,
    sunnahPrayers: dailyProgress.sunnahPrayers.progress * DECAY_CONFIG.WEIGHTS.SUNNAH_PRAYERS * 100,
    dailyDuas: dailyProgress.dailyDuas.progress * DECAY_CONFIG.WEIGHTS.DAILY_DUAS * 100,
    fasting: dailyProgress.fasting.progress * DECAY_CONFIG.WEIGHTS.FASTING * 100,
    charity: dailyProgress.charity.progress * DECAY_CONFIG.WEIGHTS.CHARITY * 100,
  };
  
  const dailyTotal = Object.values(dailyScores).reduce((sum, score) => sum + score, 0);
  const weeklyTotal = weeklyProgress.challenges.progress * 100 * DECAY_CONFIG.WEEKLY_GOALS_WEIGHT;
  
  return {
    daily: dailyScores,
    dailyTotal: dailyTotal * DECAY_CONFIG.DAILY_GOALS_WEIGHT,
    weekly: weeklyTotal,
    total: (dailyTotal * DECAY_CONFIG.DAILY_GOALS_WEIGHT) + weeklyTotal,
    breakdown: {
      dailyProgress,
      weeklyProgress,
    },
  };
}

/**
 * Reset daily goals (call this at the start of each new day)
 */
export async function resetDailyGoals() {
  try {
    const today = new Date().toDateString();
    await AsyncStorage.setItem('lastImanDate', today);
    
    // Don't reset the score, just mark that it's a new day
    // The decay system will handle score changes
    console.log('Daily goals reset for new day');
  } catch (error) {
    console.log('Error resetting daily goals:', error);
  }
}
