
import AsyncStorage from '@react-native-async-storage/async-storage';
import { IbadahGoals, IlmGoals, AmanahGoals, SectionScores } from './imanScoreCalculator';

/**
 * SIMPLIFIED DECAY SYSTEM
 * 
 * This system is now integrated into the main score calculator.
 * These functions are kept for backward compatibility and activity logging.
 */

// ============================================================================
// ACTIVITY RECORDING (for activity log integration)
// ============================================================================

export async function recordActivity(
  section: 'ibadah' | 'ilm' | 'amanah',
  component: string,
  progressAmount: number = 1
): Promise<void> {
  try {
    // Update last activity timestamp
    const activityLog = await loadActivityLog();
    activityLog[section][component] = new Date().toISOString();
    await saveActivityLog(activityLog);
    
    console.log(`Activity recorded: ${section}.${component} (+${progressAmount})`);
  } catch (error) {
    console.log('Error recording activity:', error);
  }
}

// ============================================================================
// ACTIVITY LOG TRACKING
// ============================================================================

interface ActivityLog {
  ibadah: Record<string, string>;
  ilm: Record<string, string>;
  amanah: Record<string, string>;
}

async function loadActivityLog(): Promise<ActivityLog> {
  try {
    const saved = await AsyncStorage.getItem('imanActivityLog');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.log('Error loading activity log:', error);
  }
  
  const now = new Date().toISOString();
  return {
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
  };
}

async function saveActivityLog(log: ActivityLog): Promise<void> {
  try {
    await AsyncStorage.setItem('imanActivityLog', JSON.stringify(log));
  } catch (error) {
    console.log('Error saving activity log:', error);
  }
}

// ============================================================================
// LEGACY COMPATIBILITY FUNCTIONS
// ============================================================================

/**
 * This function is kept for backward compatibility.
 * The actual decay logic is now in imanScoreCalculator.ts
 */
export async function updateScoresWithDecay(
  currentGoals: {
    ibadah: IbadahGoals;
    ilm: IlmGoals;
    amanah: AmanahGoals;
  },
  freshScores: SectionScores
): Promise<SectionScores> {
  // The decay is now handled in getCurrentSectionScores()
  // This function just returns the fresh scores
  return freshScores;
}

/**
 * This function is kept for backward compatibility.
 * The actual decay logic is now in imanScoreCalculator.ts
 */
export async function applyDecayToScores(): Promise<SectionScores> {
  // The decay is now handled in getCurrentSectionScores()
  // Return zeros as this function is deprecated
  return { ibadah: 0, ilm: 0, amanah: 0 };
}

/**
 * Reset decay state (for testing or manual reset)
 */
export async function resetDecayState(): Promise<void> {
  try {
    const now = new Date().toISOString();
    const state = {
      lastActivityDate: now,
      lastScoreUpdate: now,
      consecutiveDaysActive: 0,
      consecutiveDaysInactive: 0,
      momentumMultiplier: 1.0,
    };
    
    await AsyncStorage.setItem('imanDecayState', JSON.stringify(state));
    console.log('Decay state reset');
  } catch (error) {
    console.log('Error resetting decay state:', error);
  }
}

/**
 * Get decay diagnostics (for debugging)
 */
export async function getDecayDiagnostics(): Promise<{
  lastActivityDate: string;
  hoursSinceActivity: number;
  consecutiveDaysActive: number;
  momentumMultiplier: number;
}> {
  try {
    const saved = await AsyncStorage.getItem('imanDecayState');
    if (saved) {
      const state = JSON.parse(saved);
      const now = new Date();
      const lastActivity = new Date(state.lastActivityDate);
      const hoursSinceActivity = (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60);
      
      return {
        lastActivityDate: state.lastActivityDate,
        hoursSinceActivity,
        consecutiveDaysActive: state.consecutiveDaysActive,
        momentumMultiplier: state.momentumMultiplier,
      };
    }
  } catch (error) {
    console.log('Error getting decay diagnostics:', error);
  }
  
  return {
    lastActivityDate: new Date().toISOString(),
    hoursSinceActivity: 0,
    consecutiveDaysActive: 0,
    momentumMultiplier: 1.0,
  };
}
