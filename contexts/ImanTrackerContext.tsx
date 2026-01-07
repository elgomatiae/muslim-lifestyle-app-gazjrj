
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { IbadahGoals, IlmGoals, AmanahGoals, loadIbadahGoals, loadIlmGoals, loadAmanahGoals, calculateAllSectionScores } from '@/utils/imanScoreCalculator';

interface ImanTrackerContextType {
  ibadahGoals: IbadahGoals;
  ilmGoals: IlmGoals;
  amanahGoals: AmanahGoals;
  imanScore: number;
  sectionScores: { ibadah: number; ilm: number; amanah: number };
  refreshScores: () => Promise<void>;
  loading: boolean;
}

const ImanTrackerContext = createContext<ImanTrackerContextType | undefined>(undefined);

export function useImanTracker() {
  const context = useContext(ImanTrackerContext);
  if (!context) {
    throw new Error('useImanTracker must be used within an ImanTrackerProvider');
  }
  return context;
}

export function ImanTrackerProvider({ children }: { children: ReactNode }) {
  const [ibadahGoals, setIbadahGoals] = useState<IbadahGoals>({} as IbadahGoals);
  const [ilmGoals, setIlmGoals] = useState<IlmGoals>({} as IlmGoals);
  const [amanahGoals, setAmanahGoals] = useState<AmanahGoals>({} as AmanahGoals);
  const [imanScore, setImanScore] = useState(0);
  const [sectionScores, setSectionScores] = useState({ ibadah: 0, ilm: 0, amanah: 0 });
  const [loading, setLoading] = useState(true);

  const refreshScores = async () => {
    try {
      const ibadah = await loadIbadahGoals();
      const ilm = await loadIlmGoals();
      const amanah = await loadAmanahGoals();
      
      setIbadahGoals(ibadah);
      setIlmGoals(ilm);
      setAmanahGoals(amanah);

      const scores = await calculateAllSectionScores(ibadah, ilm, amanah);
      setImanScore(scores.overall);
      setSectionScores(scores.sections);
    } catch (error) {
      console.error('Failed to refresh scores:', error);
    }
  };

  useEffect(() => {
    const init = async () => {
      await refreshScores();
      setLoading(false);
    };
    init();
  }, []);

  return (
    <ImanTrackerContext.Provider value={{ ibadahGoals, ilmGoals, amanahGoals, imanScore, sectionScores, refreshScores, loading }}>
      {children}
    </ImanTrackerContext.Provider>
  );
}
