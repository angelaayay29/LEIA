import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { RetroData, PlanningData } from '../types';
import { initialRetroData } from '../data/retroData';
import { initialPlanningData } from '../data/planningData';

interface DataContextType {
  retroData: RetroData;
  planningData: PlanningData;
  updateRetroData: (updater: (prev: RetroData) => RetroData) => void;
  updatePlanningData: (updater: (prev: PlanningData) => PlanningData) => void;
  retroWidgetOrder: string[];
  planningWidgetOrder: string[];
  setRetroWidgetOrder: (order: string[]) => void;
  setPlanningWidgetOrder: (order: string[]) => void;
}

const DataContext = createContext<DataContextType | null>(null);

const DEFAULT_RETRO_ORDER = ['header', 'ai-insight', 'headline-stats', 'program-progress', 'work-detail', 'people-capacity', 'risks-followup'];
const DEFAULT_PLANNING_ORDER = ['header', 'ai-insight', 'headline-stats', 'program-progress', 'work-detail', 'people-capacity', 'risks-followup'];

export function DataProvider({ children }: { children: ReactNode }) {
  const [retroData, setRetroData] = useState<RetroData>(() => {
    const stored = localStorage.getItem('orbit-retro-data');
    return stored ? JSON.parse(stored) : initialRetroData;
  });

  const [planningData, setPlanningData] = useState<PlanningData>(() => {
    const stored = localStorage.getItem('orbit-planning-data');
    return stored ? JSON.parse(stored) : initialPlanningData;
  });

  const [retroWidgetOrder, setRetroOrder] = useState<string[]>(() => {
    const stored = localStorage.getItem('orbit-retro-order');
    return stored ? JSON.parse(stored) : DEFAULT_RETRO_ORDER;
  });

  const [planningWidgetOrder, setPlanningOrder] = useState<string[]>(() => {
    const stored = localStorage.getItem('orbit-planning-order');
    return stored ? JSON.parse(stored) : DEFAULT_PLANNING_ORDER;
  });

  const updateRetroData = useCallback((updater: (prev: RetroData) => RetroData) => {
    setRetroData((prev) => {
      const next = updater(prev);
      localStorage.setItem('orbit-retro-data', JSON.stringify(next));
      return next;
    });
  }, []);

  const updatePlanningData = useCallback((updater: (prev: PlanningData) => PlanningData) => {
    setPlanningData((prev) => {
      const next = updater(prev);
      localStorage.setItem('orbit-planning-data', JSON.stringify(next));
      return next;
    });
  }, []);

  const setRetroWidgetOrder = useCallback((order: string[]) => {
    setRetroOrder(order);
    localStorage.setItem('orbit-retro-order', JSON.stringify(order));
  }, []);

  const setPlanningWidgetOrder = useCallback((order: string[]) => {
    setPlanningOrder(order);
    localStorage.setItem('orbit-planning-order', JSON.stringify(order));
  }, []);

  return (
    <DataContext.Provider
      value={{
        retroData,
        planningData,
        updateRetroData,
        updatePlanningData,
        retroWidgetOrder,
        planningWidgetOrder,
        setRetroWidgetOrder,
        setPlanningWidgetOrder,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
