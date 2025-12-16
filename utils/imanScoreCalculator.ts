
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
  fasting: {
    completed: number;
    goal: number;
    progress: number;
  };
}

const DECAY_CONFIG = {
  BASE_DECAY_RATE_PER_HOUR: 0.5,
  MAX_DECAY_PER_DAY: 20,
  MIN_SCORE: 0,
  MAX_SCORE: 100,
  
  DECAY_MULTIPLIERS: {
    ALL_GOALS_MET: 0,
    MOST_GOALS_MET: 0.3,
    SOME_GOALS_MET: 0.6,
    FEW_GOALS_MET: 1.0,
    NO_GOALS_MET: 1.5,
  },
  
  WEIGHTS: {
    PRAYER: 0.30,
    QURAN: 0.25,
    DHIKR: 0.20,
    SUNNAH_PRAYERS: 0.10,
    DAILY_DUAS: 0.05,
    FASTING: 0.05,
    CHARITY: 0.05,
  },
  
  WEEKLY_GOALS_WEIGHT: 0.15,
  DAILY_GOALS_WEIGHT: 0.85,
};

export function calculateImanScore(
  dailyProgress: DailyGoalsProgress,
  weeklyProgress: WeeklyGoalsProgress
): number {
  const dailyScore = 
    (dailyProgress.prayer.progress * DECAY_CONFIG.WEIGHTS.PRAYER) +
    (dailyProgress.quran.progress * DECAY_CONFIG.WEIGHTS.QURAN) +
    (dailyProgress.dhikr.progress * DECAY_CONFIG.WEIGHTS.DHIKR) +
    (dailyProgress.sunnahPrayers.progress * DECAY_CONFIG.WEIGHTS.SUNNAH_PRAYERS) +
    (dailyProgress.dailyDuas.progress * DECAY_CONFIG.WEIGHTS.DAILY_DUAS) +
    (dailyProgress.fasting.progress * DECAY_CONFIG.WEIGHTS.FASTING) +
    (dailyProgress.charity.progress * DECAY_CONFIG.WEIGHTS.CHARITY);
  
  const weeklyScore = 
    (weeklyProgress.challenges.progress * 0.6) +
    (weeklyProgress.fasting.progress * 0.4);
  
  const totalScore = 
    (dailyScore * DECAY_CONFIG.DAILY_GOALS_WEIGHT) +
    (weeklyScore * DECAY_CONFIG.WEEKLY_GOALS_WEIGHT);
  
  return Math.max(DECAY_CONFIG.MIN_SCORE, Math.min(DECAY_CONFIG.MAX_SCORE, totalScore * 100));
}

function getDecayMultiplier(overallProgress: number): number {
  if (overallProgress >= 0.9) return DECAY_CONFIG.DECAY_MULTIPLIERS.ALL_GOALS_MET;
  if (overallProgress >= 0.7) return DECAY_CONFIG.DECAY_MULTIPLIERS.MOST_GOALS_MET;
  if (overallProgress >= 0.4) return DECAY_CONFIG.DECAY_MULTIPLIERS.SOME_GOALS_MET;
  if (overallProgress >= 0.2) return DECAY_CONFIG.DECAY_MULTIPLIERS.FEW_GOALS_MET;
  return DECAY_CONFIG.DECAY_MULTIPLIERS.NO_GOALS_MET;
}

export function applyDecay(
  currentScore: number,
  lastUpdated: string,
  dailyProgress: DailyGoalsProgress,
  weeklyProgress: WeeklyGoalsProgress
): number {
  const now = new Date();
  const lastUpdate = new Date(lastUpdated);
  const hoursSinceUpdate = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60);
  
  if (hoursSinceUpdate < 1) {
    return currentScore;
  }
  
  const dailyScore = 
    (dailyProgress.prayer.progress * DECAY_CONFIG.WEIGHTS.PRAYER) +
    (dailyProgress.quran.progress * DECAY_CONFIG.WEIGHTS.QURAN) +
    (dailyProgress.dhikr.progress * DECAY_CONFIG.WEIGHTS.DHIKR) +
    (dailyProgress.sunnahPrayers.progress * DECAY_CONFIG.WEIGHTS.SUNNAH_PRAYERS) +
    (dailyProgress.dailyDuas.progress * DECAY_CONFIG.WEIGHTS.DAILY_DUAS) +
    (dailyProgress.fasting.progress * DECAY_CONFIG.WEIGHTS.FASTING) +
    (dailyProgress.charity.progress * DECAY_CONFIG.WEIGHTS.CHARITY);
  
  const weeklyScore = 
    (weeklyProgress.challenges.progress * 0.6) +
    (weeklyProgress.fasting.progress * 0.4);
    
  const overallProgress = 
    (dailyScore * DECAY_CONFIG.DAILY_GOALS_WEIGHT) +
    (weeklyScore * DECAY_CONFIG.WEEKLY_GOALS_WEIGHT);
  
  const decayMultiplier = getDecayMultiplier(overallProgress);
  
  const decayPerHour = DECAY_CONFIG.BASE_DECAY_RATE_PER_HOUR * decayMultiplier;
  const totalDecay = Math.min(
    decayPerHour * hoursSinceUpdate,
    DECAY_CONFIG.MAX_DECAY_PER_DAY
  );
  
  const newScore = currentScore - totalDecay;
  
  return Math.max(DECAY_CONFIG.MIN_SCORE, newScore);
}

export async function loadDailyGoalsProgress(): Promise<DailyGoalsProgress> {
  try {
    const prayerProgressStr = await AsyncStorage.getItem('prayerProgress');
    const prayerProgress = prayerProgressStr ? JSON.parse(prayerProgressStr) : { completed: 0, total: 5 };
    
    const quranProgressStr = await AsyncStorage.getItem('quranProgress');
    const quranProgress = quranProgressStr ? JSON.parse(quranProgressStr) : {
      versesToMemorize: 5,
      versesMemorized: 0,
      pagesToRead: 2,
      pagesRead: 0,
    };
    
    const dhikrProgressStr = await AsyncStorage.getItem('dhikrProgress');
    const dhikrProgress = dhikrProgressStr ? JSON.parse(dhikrProgressStr) : {
      dailyTarget: 100,
      currentCount: 0,
    };
    
    const sunnahGoalsStr = await AsyncStorage.getItem('sunnahPrayerGoals');
    const sunnahGoals = sunnahGoalsStr ? JSON.parse(sunnahGoalsStr) : [];
    const enabledSunnahPrayers = sunnahGoals.filter((p: any) => p.enabled);
    const sunnahTotal = enabledSunnahPrayers.length || 1;
    
    const sunnahPrayersStr = await AsyncStorage.getItem('sunnahPrayers');
    const sunnahPrayers = sunnahPrayersStr ? JSON.parse(sunnahPrayersStr) : [];
    const sunnahCompleted = sunnahPrayers.filter((id: string) => 
      enabledSunnahPrayers.some((p: any) => p.id === id)
    ).length;
    
    const duaGoalsStr = await AsyncStorage.getItem('duaGoals');
    const duaGoals = duaGoalsStr ? JSON.parse(duaGoalsStr) : [];
    const enabledDuas = duaGoals.filter((d: any) => d.enabled);
    const duasTotal = enabledDuas.length || 1;
    
    const completedDuasStr = await AsyncStorage.getItem('completedDuas');
    const completedDuas = completedDuasStr ? JSON.parse(completedDuasStr) : [];
    const duasCompleted = completedDuas.filter((id: string) => 
      enabledDuas.some((d: any) => d.id === id)
    ).length;
    
    const todayFasting = await AsyncStorage.getItem('todayFasting');
    const isFasting = todayFasting === 'true';
    
    const charityDataStr = await AsyncStorage.getItem('charityData');
    const charityData = charityDataStr ? JSON.parse(charityDataStr) : [];
    const today = new Date().toDateString();
    const donatedToday = charityData.some((entry: any) => 
      new Date(entry.date).toDateString() === today
    );
    
    const quranMemorizeProgress = quranProgress.versesToMemorize > 0 
      ? quranProgress.versesMemorized / quranProgress.versesToMemorize 
      : 0;
    const quranReadProgress = quranProgress.pagesToRead > 0 
      ? quranProgress.pagesRead / quranProgress.pagesToRead 
      : 0;
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
        completed: sunnahCompleted,
        total: sunnahTotal,
        progress: sunnahCompleted / sunnahTotal,
      },
      dailyDuas: {
        completed: duasCompleted,
        total: duasTotal,
        progress: duasCompleted / duasTotal,
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
      sunnahPrayers: { completed: 0, total: 1, progress: 0 },
      dailyDuas: { completed: 0, total: 1, progress: 0 },
      fasting: { isFasting: false, progress: 0 },
      charity: { donated: false, progress: 0 },
    };
  }
}

export async function loadWeeklyGoalsProgress(): Promise<WeeklyGoalsProgress> {
  try {
    const challengeGoalsStr = await AsyncStorage.getItem('challengeGoals');
    const challengeGoals = challengeGoalsStr ? JSON.parse(challengeGoalsStr) : [];
    const enabledChallenges = challengeGoals.filter((c: any) => c.enabled);
    
    const challengesStr = await AsyncStorage.getItem('challenges');
    const challenges = challengesStr ? JSON.parse(challengesStr) : [];
    
    const completedChallenges = challenges.filter((c: any) => 
      c.completed && enabledChallenges.some((ec: any) => ec.id === c.id)
    ).length;
    const totalChallenges = enabledChallenges.length || 1;
    
    const weeklyFastingGoalStr = await AsyncStorage.getItem('weeklyFastingGoal');
    const weeklyFastingGoal = weeklyFastingGoalStr ? parseInt(weeklyFastingGoalStr) : 2;
    
    const weeklyFastingCountStr = await AsyncStorage.getItem('weeklyFastingCount');
    const weeklyFastingCount = weeklyFastingCountStr ? parseInt(weeklyFastingCountStr) : 0;
    
    return {
      challenges: {
        completed: completedChallenges,
        total: totalChallenges,
        progress: completedChallenges / totalChallenges,
      },
      fasting: {
        completed: weeklyFastingCount,
        goal: weeklyFastingGoal || 1,
        progress: weeklyFastingGoal > 0 ? Math.min(1, weeklyFastingCount / weeklyFastingGoal) : 0,
      },
    };
  } catch (error) {
    console.log('Error loading weekly goals progress:', error);
    return {
      challenges: {
        completed: 0,
        total: 1,
        progress: 0,
      },
      fasting: {
        completed: 0,
        goal: 2,
        progress: 0,
      },
    };
  }
}

export async function getCurrentImanScore(): Promise<number> {
  try {
    const scoreDataStr = await AsyncStorage.getItem('imanScoreData');
    const scoreData: ImanScoreData = scoreDataStr ? JSON.parse(scoreDataStr) : {
      score: 50,
      lastUpdated: new Date().toISOString(),
      dailyGoalsCompleted: false,
      weeklyGoalsCompleted: false,
    };
    
    const dailyProgress = await loadDailyGoalsProgress();
    const weeklyProgress = await loadWeeklyGoalsProgress();
    
    const decayedScore = applyDecay(
      scoreData.score,
      scoreData.lastUpdated,
      dailyProgress,
      weeklyProgress
    );
    
    const freshScore = calculateImanScore(dailyProgress, weeklyProgress);
    
    const finalScore = Math.max(decayedScore, freshScore);
    
    return finalScore;
  } catch (error) {
    console.log('Error getting current Iman score:', error);
    return 50;
  }
}

export async function updateImanScore(): Promise<number> {
  try {
    const score = await getCurrentImanScore();
    
    const dailyProgress = await loadDailyGoalsProgress();
    const weeklyProgress = await loadWeeklyGoalsProgress();
    
    const dailyGoalsCompleted = 
      dailyProgress.prayer.progress === 1 &&
      dailyProgress.quran.progress === 1 &&
      dailyProgress.dhikr.progress === 1 &&
      dailyProgress.sunnahPrayers.progress === 1 &&
      dailyProgress.dailyDuas.progress === 1 &&
      dailyProgress.fasting.progress === 1 &&
      dailyProgress.charity.progress === 1;
    
    const weeklyGoalsCompleted = 
      weeklyProgress.challenges.progress === 1 &&
      weeklyProgress.fasting.progress === 1;
    
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
  
  const weeklyScores = {
    challenges: weeklyProgress.challenges.progress * 100 * 0.6,
    fasting: weeklyProgress.fasting.progress * 100 * 0.4,
  };
  
  const weeklyTotal = Object.values(weeklyScores).reduce((sum, score) => sum + score, 0);
  
  return {
    daily: dailyScores,
    dailyTotal: dailyTotal * DECAY_CONFIG.DAILY_GOALS_WEIGHT,
    weekly: weeklyTotal * DECAY_CONFIG.WEEKLY_GOALS_WEIGHT,
    weeklyBreakdown: weeklyScores,
    total: (dailyTotal * DECAY_CONFIG.DAILY_GOALS_WEIGHT) + (weeklyTotal * DECAY_CONFIG.WEEKLY_GOALS_WEIGHT),
    breakdown: {
      dailyProgress,
      weeklyProgress,
    },
  };
}

export async function resetDailyGoals() {
  try {
    const today = new Date().toDateString();
    await AsyncStorage.setItem('lastImanDate', today);
    
    console.log('Daily goals reset for new day');
  } catch (error) {
    console.log('Error resetting daily goals:', error);
  }
}
