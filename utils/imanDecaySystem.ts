
import AsyncStorage from '@react-native-async-storage/async-storage';
import { IbadahGoals, IlmGoals, AmanahGoals, SectionScores } from './imanScoreCalculator';

/**
 * IMAN DECAY SYSTEM
 * 
 * This system treats Iman like momentum, not a daily on/off switch.
 * Progress fades gradually with inactivity, reflecting how habits weaken over time.
 * 
 * Key Principles:
 * - Gentle, time-based decay with grace periods
 * - Different decay rates for each ring (Prayer slowest, Quran moderate, Dhikr faster)
 * - Easy recovery - small actions restore progress
 * - Smooth, continuous decay (not abrupt)
 * - No punishment for slipping - just reflects reality
 */

// ============================================================================
// DECAY CONFIGURATION
// ============================================================================

interface DecayConfig {
  // Grace periods before decay begins (in hours)
  gracePeriods: {
    ibadah: number;    // Prayer anchors the day - longest grace period
    ilm: number;       // Knowledge - moderate grace period
    amanah: number;    // Well-being - moderate grace period
  };
  
  // Decay rates per hour after grace period (percentage points per hour)
  decayRates: {
    ibadah: {
      prayer: number;     // Slowest decay - prayer is foundational
      quran: number;      // Moderate decay
      dhikr: number;      // Faster decay - more frequent and fluid
      dua: number;        // Moderate decay
      fasting: number;    // Slow decay
    };
    ilm: {
      lectures: number;   // Moderate decay
      recitations: number; // Moderate decay
      quizzes: number;    // Moderate decay
      reflection: number; // Moderate decay
    };
    amanah: {
      exercise: number;   // Moderate decay
      water: number;      // Faster decay - daily habit
      workout: number;    // Moderate decay
      mentalHealth: number; // Slow decay
      sleep: number;      // Moderate decay
      stress: number;     // Moderate decay
    };
  };
  
  // Recovery multipliers - how much progress is restored per action
  recoveryMultipliers: {
    ibadah: number;
    ilm: number;
    amanah: number;
  };
  
  // Minimum score floor - never goes below this
  minScore: number;
  
  // Maximum decay per day (percentage points)
  maxDecayPerDay: number;
}

const DECAY_CONFIG: DecayConfig = {
  gracePeriods: {
    ibadah: 12,    // 12 hours grace - prayer anchors the day
    ilm: 8,        // 8 hours grace
    amanah: 6,     // 6 hours grace
  },
  
  decayRates: {
    ibadah: {
      prayer: 0.3,    // Very slow - 0.3% per hour after grace
      quran: 0.5,     // Moderate - 0.5% per hour
      dhikr: 0.8,     // Faster - 0.8% per hour
      dua: 0.5,       // Moderate
      fasting: 0.3,   // Slow
    },
    ilm: {
      lectures: 0.6,
      recitations: 0.6,
      quizzes: 0.6,
      reflection: 0.6,
    },
    amanah: {
      exercise: 0.7,
      water: 1.0,     // Faster - daily habit
      workout: 0.6,
      mentalHealth: 0.4, // Slower
      sleep: 0.7,
      stress: 0.6,
    },
  },
  
  recoveryMultipliers: {
    ibadah: 1.5,    // 50% bonus on recovery
    ilm: 1.3,       // 30% bonus
    amanah: 1.2,    // 20% bonus
  },
  
  minScore: 0,
  maxDecayPerDay: 25, // Maximum 25% decay per day
};

// ============================================================================
// DECAY STATE TRACKING
// ============================================================================

interface DecayState {
  lastActivityTimestamps: {
    ibadah: {
      prayer: string;
      quran: string;
      dhikr: string;
      dua: string;
      fasting: string;
    };
    ilm: {
      lectures: string;
      recitations: string;
      quizzes: string;
      reflection: string;
    };
    amanah: {
      exercise: string;
      water: string;
      workout: string;
      mentalHealth: string;
      sleep: string;
      stress: string;
    };
  };
  
  // Component scores for granular decay
  componentScores: {
    ibadah: {
      prayer: number;
      quran: number;
      dhikr: number;
      dua: number;
      fasting: number;
    };
    ilm: {
      lectures: number;
      recitations: number;
      quizzes: number;
      reflection: number;
    };
    amanah: {
      exercise: number;
      water: number;
      workout: number;
      mentalHealth: number;
      sleep: number;
      stress: number;
    };
  };
  
  lastDecayCalculation: string;
}

// ============================================================================
// DECAY STATE MANAGEMENT
// ============================================================================

async function loadDecayState(): Promise<DecayState> {
  try {
    const saved = await AsyncStorage.getItem('imanDecayState');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.log('Error loading decay state:', error);
  }
  
  // Default state
  const now = new Date().toISOString();
  return {
    lastActivityTimestamps: {
      ibadah: {
        prayer: now,
        quran: now,
        dhikr: now,
        dua: now,
        fasting: now,
      },
      ilm: {
        lectures: now,
        recitations: now,
        quizzes: now,
        reflection: now,
      },
      amanah: {
        exercise: now,
        water: now,
        workout: now,
        mentalHealth: now,
        sleep: now,
        stress: now,
      },
    },
    componentScores: {
      ibadah: {
        prayer: 100,
        quran: 100,
        dhikr: 100,
        dua: 100,
        fasting: 100,
      },
      ilm: {
        lectures: 100,
        recitations: 100,
        quizzes: 100,
        reflection: 100,
      },
      amanah: {
        exercise: 100,
        water: 100,
        workout: 100,
        mentalHealth: 100,
        sleep: 100,
        stress: 100,
      },
    },
    lastDecayCalculation: now,
  };
}

async function saveDecayState(state: DecayState): Promise<void> {
  try {
    await AsyncStorage.setItem('imanDecayState', JSON.stringify(state));
  } catch (error) {
    console.log('Error saving decay state:', error);
  }
}

// ============================================================================
// DECAY CALCULATION
// ============================================================================

function calculateComponentDecay(
  currentScore: number,
  lastActivityTime: string,
  decayRate: number,
  gracePeriodHours: number
): number {
  const now = new Date();
  const lastActivity = new Date(lastActivityTime);
  const hoursSinceActivity = (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60);
  
  // No decay during grace period
  if (hoursSinceActivity <= gracePeriodHours) {
    return currentScore;
  }
  
  // Calculate decay after grace period
  const hoursAfterGrace = hoursSinceActivity - gracePeriodHours;
  const decay = decayRate * hoursAfterGrace;
  
  // Apply decay with floor
  const newScore = Math.max(DECAY_CONFIG.minScore, currentScore - decay);
  
  return newScore;
}

function calculateSectionDecay(
  section: 'ibadah' | 'ilm' | 'amanah',
  state: DecayState
): { newScores: any; averageScore: number } {
  const timestamps = state.lastActivityTimestamps[section];
  const scores = state.componentScores[section];
  const decayRates = DECAY_CONFIG.decayRates[section];
  const gracePeriod = DECAY_CONFIG.gracePeriods[section];
  
  const newScores: any = {};
  let totalScore = 0;
  let componentCount = 0;
  
  for (const component in scores) {
    const currentScore = scores[component as keyof typeof scores];
    const lastActivity = timestamps[component as keyof typeof timestamps];
    const decayRate = decayRates[component as keyof typeof decayRates];
    
    const newScore = calculateComponentDecay(
      currentScore,
      lastActivity,
      decayRate,
      gracePeriod
    );
    
    newScores[component] = newScore;
    totalScore += newScore;
    componentCount++;
  }
  
  const averageScore = componentCount > 0 ? totalScore / componentCount : 0;
  
  return { newScores, averageScore };
}

// ============================================================================
// ACTIVITY TRACKING & RECOVERY
// ============================================================================

export async function recordActivity(
  section: 'ibadah' | 'ilm' | 'amanah',
  component: string,
  progressAmount: number = 1
): Promise<void> {
  try {
    const state = await loadDecayState();
    const now = new Date().toISOString();
    
    // Update last activity timestamp
    if (state.lastActivityTimestamps[section] && 
        state.lastActivityTimestamps[section][component as keyof typeof state.lastActivityTimestamps[typeof section]]) {
      (state.lastActivityTimestamps[section] as any)[component] = now;
    }
    
    // Apply recovery boost
    const recoveryMultiplier = DECAY_CONFIG.recoveryMultipliers[section];
    const recoveryAmount = progressAmount * recoveryMultiplier;
    
    if (state.componentScores[section] && 
        state.componentScores[section][component as keyof typeof state.componentScores[typeof section]]) {
      const currentScore = (state.componentScores[section] as any)[component];
      const newScore = Math.min(100, currentScore + recoveryAmount);
      (state.componentScores[section] as any)[component] = newScore;
    }
    
    await saveDecayState(state);
    
    console.log(`Activity recorded: ${section}.${component} - Recovery: +${recoveryAmount.toFixed(1)}%`);
  } catch (error) {
    console.log('Error recording activity:', error);
  }
}

// ============================================================================
// MAIN DECAY APPLICATION
// ============================================================================

export async function applyDecayToScores(): Promise<SectionScores> {
  try {
    const state = await loadDecayState();
    
    // Calculate decay for each section
    const ibadahResult = calculateSectionDecay('ibadah', state);
    const ilmResult = calculateSectionDecay('ilm', state);
    const amanahResult = calculateSectionDecay('amanah', state);
    
    // Update state with new component scores
    state.componentScores.ibadah = ibadahResult.newScores;
    state.componentScores.ilm = ilmResult.newScores;
    state.componentScores.amanah = amanahResult.newScores;
    state.lastDecayCalculation = new Date().toISOString();
    
    await saveDecayState(state);
    
    const decayedScores: SectionScores = {
      ibadah: Math.round(ibadahResult.averageScore),
      ilm: Math.round(ilmResult.averageScore),
      amanah: Math.round(amanahResult.averageScore),
    };
    
    console.log('Decay applied:', decayedScores);
    
    return decayedScores;
  } catch (error) {
    console.log('Error applying decay:', error);
    return { ibadah: 0, ilm: 0, amanah: 0 };
  }
}

// ============================================================================
// INTEGRATION WITH EXISTING SYSTEM
// ============================================================================

export async function updateScoresWithDecay(
  currentGoals: {
    ibadah: IbadahGoals;
    ilm: IlmGoals;
    amanah: AmanahGoals;
  },
  freshScores: SectionScores
): Promise<SectionScores> {
  try {
    // Apply decay
    const decayedScores = await applyDecayToScores();
    
    // Take the maximum of decayed scores and fresh scores
    // This ensures that new activity always increases the score
    const finalScores: SectionScores = {
      ibadah: Math.max(decayedScores.ibadah, freshScores.ibadah),
      ilm: Math.max(decayedScores.ilm, freshScores.ilm),
      amanah: Math.max(decayedScores.amanah, freshScores.amanah),
    };
    
    // Update component scores based on fresh activity
    await updateComponentScoresFromGoals(currentGoals, freshScores);
    
    return finalScores;
  } catch (error) {
    console.log('Error updating scores with decay:', error);
    return freshScores;
  }
}

async function updateComponentScoresFromGoals(
  goals: {
    ibadah: IbadahGoals;
    ilm: IlmGoals;
    amanah: AmanahGoals;
  },
  freshScores: SectionScores
): Promise<void> {
  try {
    const state = await loadDecayState();
    const now = new Date().toISOString();
    
    // Update Ibadah components based on activity
    // Prayer
    const prayerCompleted = Object.values(goals.ibadah.fardPrayers).filter(Boolean).length;
    if (prayerCompleted > 0) {
      state.lastActivityTimestamps.ibadah.prayer = now;
      state.componentScores.ibadah.prayer = Math.min(100, state.componentScores.ibadah.prayer + (prayerCompleted * 5));
    }
    
    // Quran
    if (goals.ibadah.quranDailyPagesCompleted > 0 || goals.ibadah.quranDailyVersesCompleted > 0) {
      state.lastActivityTimestamps.ibadah.quran = now;
      const quranProgress = (goals.ibadah.quranDailyPagesCompleted / Math.max(1, goals.ibadah.quranDailyPagesGoal)) * 100;
      state.componentScores.ibadah.quran = Math.min(100, Math.max(state.componentScores.ibadah.quran, quranProgress));
    }
    
    // Dhikr
    if (goals.ibadah.dhikrDailyCompleted > 0) {
      state.lastActivityTimestamps.ibadah.dhikr = now;
      const dhikrProgress = (goals.ibadah.dhikrDailyCompleted / Math.max(1, goals.ibadah.dhikrDailyGoal)) * 100;
      state.componentScores.ibadah.dhikr = Math.min(100, Math.max(state.componentScores.ibadah.dhikr, dhikrProgress));
    }
    
    // Dua
    if (goals.ibadah.duaDailyCompleted > 0) {
      state.lastActivityTimestamps.ibadah.dua = now;
      const duaProgress = (goals.ibadah.duaDailyCompleted / Math.max(1, goals.ibadah.duaDailyGoal)) * 100;
      state.componentScores.ibadah.dua = Math.min(100, Math.max(state.componentScores.ibadah.dua, duaProgress));
    }
    
    // Fasting
    if (goals.ibadah.fastingWeeklyCompleted > 0) {
      state.lastActivityTimestamps.ibadah.fasting = now;
      const fastingProgress = (goals.ibadah.fastingWeeklyCompleted / Math.max(1, goals.ibadah.fastingWeeklyGoal)) * 100;
      state.componentScores.ibadah.fasting = Math.min(100, Math.max(state.componentScores.ibadah.fasting, fastingProgress));
    }
    
    // Update Ilm components
    if (goals.ilm.weeklyLecturesCompleted > 0) {
      state.lastActivityTimestamps.ilm.lectures = now;
      const lecturesProgress = (goals.ilm.weeklyLecturesCompleted / Math.max(1, goals.ilm.weeklyLecturesGoal)) * 100;
      state.componentScores.ilm.lectures = Math.min(100, Math.max(state.componentScores.ilm.lectures, lecturesProgress));
    }
    
    if (goals.ilm.weeklyRecitationsCompleted > 0) {
      state.lastActivityTimestamps.ilm.recitations = now;
      const recitationsProgress = (goals.ilm.weeklyRecitationsCompleted / Math.max(1, goals.ilm.weeklyRecitationsGoal)) * 100;
      state.componentScores.ilm.recitations = Math.min(100, Math.max(state.componentScores.ilm.recitations, recitationsProgress));
    }
    
    if (goals.ilm.weeklyQuizzesCompleted > 0) {
      state.lastActivityTimestamps.ilm.quizzes = now;
      const quizzesProgress = (goals.ilm.weeklyQuizzesCompleted / Math.max(1, goals.ilm.weeklyQuizzesGoal)) * 100;
      state.componentScores.ilm.quizzes = Math.min(100, Math.max(state.componentScores.ilm.quizzes, quizzesProgress));
    }
    
    if (goals.ilm.weeklyReflectionCompleted > 0) {
      state.lastActivityTimestamps.ilm.reflection = now;
      const reflectionProgress = (goals.ilm.weeklyReflectionCompleted / Math.max(1, goals.ilm.weeklyReflectionGoal)) * 100;
      state.componentScores.ilm.reflection = Math.min(100, Math.max(state.componentScores.ilm.reflection, reflectionProgress));
    }
    
    // Update Amanah components
    if (goals.amanah.dailyExerciseCompleted > 0) {
      state.lastActivityTimestamps.amanah.exercise = now;
      const exerciseProgress = (goals.amanah.dailyExerciseCompleted / Math.max(1, goals.amanah.dailyExerciseGoal)) * 100;
      state.componentScores.amanah.exercise = Math.min(100, Math.max(state.componentScores.amanah.exercise, exerciseProgress));
    }
    
    if (goals.amanah.dailyWaterCompleted > 0) {
      state.lastActivityTimestamps.amanah.water = now;
      const waterProgress = (goals.amanah.dailyWaterCompleted / Math.max(1, goals.amanah.dailyWaterGoal)) * 100;
      state.componentScores.amanah.water = Math.min(100, Math.max(state.componentScores.amanah.water, waterProgress));
    }
    
    if (goals.amanah.weeklyWorkoutCompleted > 0) {
      state.lastActivityTimestamps.amanah.workout = now;
      const workoutProgress = (goals.amanah.weeklyWorkoutCompleted / Math.max(1, goals.amanah.weeklyWorkoutGoal)) * 100;
      state.componentScores.amanah.workout = Math.min(100, Math.max(state.componentScores.amanah.workout, workoutProgress));
    }
    
    if (goals.amanah.weeklyMentalHealthCompleted > 0) {
      state.lastActivityTimestamps.amanah.mentalHealth = now;
      const mentalHealthProgress = (goals.amanah.weeklyMentalHealthCompleted / Math.max(1, goals.amanah.weeklyMentalHealthGoal)) * 100;
      state.componentScores.amanah.mentalHealth = Math.min(100, Math.max(state.componentScores.amanah.mentalHealth, mentalHealthProgress));
    }
    
    if (goals.amanah.dailySleepCompleted > 0) {
      state.lastActivityTimestamps.amanah.sleep = now;
      const sleepProgress = (goals.amanah.dailySleepCompleted / Math.max(1, goals.amanah.dailySleepGoal)) * 100;
      state.componentScores.amanah.sleep = Math.min(100, Math.max(state.componentScores.amanah.sleep, sleepProgress));
    }
    
    if (goals.amanah.weeklyStressManagementCompleted > 0) {
      state.lastActivityTimestamps.amanah.stress = now;
      const stressProgress = (goals.amanah.weeklyStressManagementCompleted / Math.max(1, goals.amanah.weeklyStressManagementGoal)) * 100;
      state.componentScores.amanah.stress = Math.min(100, Math.max(state.componentScores.amanah.stress, stressProgress));
    }
    
    await saveDecayState(state);
  } catch (error) {
    console.log('Error updating component scores from goals:', error);
  }
}

// ============================================================================
// RESET FUNCTIONS
// ============================================================================

export async function resetDecayState(): Promise<void> {
  try {
    const now = new Date().toISOString();
    const state: DecayState = {
      lastActivityTimestamps: {
        ibadah: {
          prayer: now,
          quran: now,
          dhikr: now,
          dua: now,
          fasting: now,
        },
        ilm: {
          lectures: now,
          recitations: now,
          quizzes: now,
          reflection: now,
        },
        amanah: {
          exercise: now,
          water: now,
          workout: now,
          mentalHealth: now,
          sleep: now,
          stress: now,
        },
      },
      componentScores: {
        ibadah: {
          prayer: 100,
          quran: 100,
          dhikr: 100,
          dua: 100,
          fasting: 100,
        },
        ilm: {
          lectures: 100,
          recitations: 100,
          quizzes: 100,
          reflection: 100,
        },
        amanah: {
          exercise: 100,
          water: 100,
          workout: 100,
          mentalHealth: 100,
          sleep: 100,
          stress: 100,
        },
      },
      lastDecayCalculation: now,
    };
    
    await saveDecayState(state);
    console.log('Decay state reset to 100%');
  } catch (error) {
    console.log('Error resetting decay state:', error);
  }
}

// ============================================================================
// DIAGNOSTIC FUNCTIONS
// ============================================================================

export async function getDecayDiagnostics(): Promise<{
  state: DecayState;
  timeSinceLastActivity: {
    ibadah: Record<string, number>;
    ilm: Record<string, number>;
    amanah: Record<string, number>;
  };
  gracePeriodStatus: {
    ibadah: Record<string, boolean>;
    ilm: Record<string, boolean>;
    amanah: Record<string, boolean>;
  };
}> {
  const state = await loadDecayState();
  const now = new Date();
  
  const timeSinceLastActivity: any = {
    ibadah: {},
    ilm: {},
    amanah: {},
  };
  
  const gracePeriodStatus: any = {
    ibadah: {},
    ilm: {},
    amanah: {},
  };
  
  // Calculate time since last activity for each component
  for (const section of ['ibadah', 'ilm', 'amanah'] as const) {
    const timestamps = state.lastActivityTimestamps[section];
    const gracePeriod = DECAY_CONFIG.gracePeriods[section];
    
    for (const component in timestamps) {
      const lastActivity = new Date(timestamps[component as keyof typeof timestamps]);
      const hoursSince = (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60);
      
      timeSinceLastActivity[section][component] = hoursSince;
      gracePeriodStatus[section][component] = hoursSince <= gracePeriod;
    }
  }
  
  return {
    state,
    timeSinceLastActivity,
    gracePeriodStatus,
  };
}
