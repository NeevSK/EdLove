import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FidelityLevel } from '../types';
import { computeEffectiveFidelity } from '../utils';
import { useReality } from './RealityProvider';

interface FidelityContextValue {
  fidelityLevel: FidelityLevel;
  effectiveFidelity: 'low' | 'high';
  setFidelityLevel: (level: FidelityLevel) => Promise<void>;
}

const FidelityContext = createContext<FidelityContextValue | undefined>(undefined);

const FIDELITY_KEY = '@gurudevi/fidelity_level';

export function FidelityProvider({ children }: { children: ReactNode }) {
  const { reality } = useReality();
  const [fidelityLevel, setFidelityLevelState] = useState<FidelityLevel>('auto');

  useEffect(() => {
    async function loadFidelity() {
      const level = await AsyncStorage.getItem(FIDELITY_KEY);
      if (level) setFidelityLevelState(level as FidelityLevel);
    }
    loadFidelity();
  }, []);

  const effectiveFidelity = useMemo(() => 
    computeEffectiveFidelity(fidelityLevel, reality.deviceTier),
  [fidelityLevel, reality.deviceTier]);

  const setFidelityLevel = useCallback(async (level: FidelityLevel) => {
    setFidelityLevelState(level);
    try {
      await AsyncStorage.setItem(FIDELITY_KEY, level);
    } catch (e) {
      console.warn('[FidelityProvider] Save error:', e);
    }
  }, []);

  const value = useMemo(() => ({
    fidelityLevel,
    effectiveFidelity,
    setFidelityLevel
  }), [fidelityLevel, effectiveFidelity, setFidelityLevel]);

  return <FidelityContext.Provider value={value}>{children}</FidelityContext.Provider>;
}

export function useFidelity() {
  const context = useContext(FidelityContext);
  if (!context) throw new Error('useFidelity must be used within a FidelityProvider');
  return context;
}
