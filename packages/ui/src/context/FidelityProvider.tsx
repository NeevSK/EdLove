import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useReality } from '@/context/RealityProvider';
import type { FidelityLevel } from '@/context/types';
import { computeEffectiveFidelity } from '@/context/utils';

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

  const effectiveFidelity = useMemo(
    () => computeEffectiveFidelity(fidelityLevel, reality.deviceTier),
    [fidelityLevel, reality.deviceTier],
  );

  const setFidelityLevel = useCallback(async (level: FidelityLevel) => {
    setFidelityLevelState(level);
    try {
      await AsyncStorage.setItem(FIDELITY_KEY, level);
    } catch (e) {
      console.warn('[FidelityProvider] Save error:', e);
    }
  }, []);

  const value = useMemo(
    () => ({
      fidelityLevel,
      effectiveFidelity,
      setFidelityLevel,
    }),
    [fidelityLevel, effectiveFidelity, setFidelityLevel],
  );

  return <FidelityContext value={value}>{children}</FidelityContext>;
}

export function useFidelity() {
  const context = useContext(FidelityContext);
  if (!context) throw new Error('useFidelity must be used within a FidelityProvider');
  return context;
}
