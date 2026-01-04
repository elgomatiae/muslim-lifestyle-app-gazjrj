
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { 
  getOverallImanScore, 
  getCurrentSectionScores, 
  updateSectionScores,
  SectionScores 
} from '@/utils/imanScoreCalculator';

interface ImanTrackerContextType {
  imanScore: number;
  sectionScores: SectionScores;
  refreshImanScore: () => Promise<void>;
  isLoading: boolean;
}

const ImanTrackerContext = createContext<ImanTrackerContextType | undefined>(undefined);

export const ImanTrackerProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [imanScore, setImanScore] = useState(0);
  const [sectionScores, setSectionScores] = useState<SectionScores>({ ibadah: 0, ilm: 0, amanah: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const refreshImanScore = async () => {
    try {
      console.log('Refreshing Iman score...');
      await updateSectionScores();
      const overallScore = await getOverallImanScore();
      const sections = await getCurrentSectionScores();
      console.log('Iman score refreshed:', { overallScore, sections });
      setImanScore(overallScore);
      setSectionScores(sections);
    } catch (error) {
      console.error('Error refreshing Iman score:', error);
    }
  };

  useEffect(() => {
    console.log('ImanTrackerProvider: User changed', user ? 'User exists' : 'No user');
    if (user) {
      refreshImanScore().finally(() => {
        console.log('ImanTrackerProvider: Loading complete');
        setIsLoading(false);
      });
    } else {
      // If no user, set default values and stop loading
      console.log('ImanTrackerProvider: No user, setting defaults');
      setImanScore(0);
      setSectionScores({ ibadah: 0, ilm: 0, amanah: 0 });
      setIsLoading(false);
    }
  }, [user]);

  return (
    <ImanTrackerContext.Provider value={{ imanScore, sectionScores, refreshImanScore, isLoading }}>
      {children}
    </ImanTrackerContext.Provider>
  );
};

export const useImanTracker = () => {
  const context = useContext(ImanTrackerContext);
  if (!context) {
    throw new Error('useImanTracker must be used within an ImanTrackerProvider');
  }
  return context;
};
