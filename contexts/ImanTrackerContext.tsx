
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  getOverallImanScore,
  getCurrentSectionScores,
  updateSectionScores,
  checkAndHandleResets,
  SectionScores,
} from '@/utils/imanScoreCalculator';

interface ImanTrackerContextType {
  imanScore: number;
  sectionScores: SectionScores;
  updateImanScore: (score: number) => void;
  refreshScore: () => Promise<void>;
  isLoading: boolean;
}

const ImanTrackerContext = createContext<ImanTrackerContextType | undefined>(undefined);

export function ImanTrackerProvider({ children }: { children: ReactNode }) {
  const [imanScore, setImanScore] = useState(0);
  const [sectionScores, setSectionScores] = useState<SectionScores>({
    ibadah: 0,
    ilm: 0,
    amanah: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const updateImanScore = (score: number) => {
    setImanScore(score);
  };

  const refreshScore = async () => {
    try {
      console.log('🔄 Refreshing Iman scores...');
      
      // Check for daily/weekly resets
      await checkAndHandleResets();
      
      // Get section scores
      const scores = await getCurrentSectionScores();
      setSectionScores(scores);
      
      // Get overall score
      const overall = await getOverallImanScore();
      setImanScore(overall);
      
      console.log('✅ Iman scores refreshed:', {
        overall,
        ibadah: scores.ibadah,
        ilm: scores.ilm,
        amanah: scores.amanah,
      });
    } catch (error) {
      console.error('❌ Error refreshing Iman score:', error);
      // Set default values on error
      setImanScore(0);
      setSectionScores({ ibadah: 0, ilm: 0, amanah: 0 });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initial load
    refreshScore();
    
    // Refresh every 5 minutes to keep scores up to date
    const interval = setInterval(() => {
      refreshScore();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <ImanTrackerContext.Provider
      value={{
        imanScore,
        sectionScores,
        updateImanScore,
        refreshScore,
        isLoading,
      }}
    >
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
