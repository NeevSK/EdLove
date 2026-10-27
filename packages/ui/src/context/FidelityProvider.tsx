import { storage } from '@repo/core/lib/storage';
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { FidelityLevel } from './types';

interface FidelityContextValue {
  fidelityLevel: FidelityLevel;
  setFidelityLevel: (level: FidelityLevel) => Promise<void>;
}

const FidelityContext = createContext<FidelityContextValue | undefined>(undefined);

const FIDELITY_KEY = '@gurudevi/fidelity_level';

function isFidelityLevel(value: string): value is FidelityLevel {
  return value === 'auto' || value === 'low' || value === 'high';
}

export function FidelityProvider({ children }: { children: ReactNode }) {
  const [fidelityLevel, setFidelityLevelState] = useState<FidelityLevel>('auto');

  useEffect(() => {
    async function loadFidelity() {
      try {
        const level = await storage.getStringAsync(FIDELITY_KEY);
        if (level && isFidelityLevel(level)) setFidelityLevelState(level);
      } catch (error) {
        console.warn('[FidelityProvider] Load error:', error);
      }
    }
    void loadFidelity();
  }, []);

  const setFidelityLevel = useCallback(async (level: FidelityLevel) => {
    if (!isFidelityLevel(level)) return;
    setFidelityLevelState(level);
    try {
      storage.set(FIDELITY_KEY, level);
    } catch (e) {
      console.warn('[FidelityProvider] Save error:', e);
    }
  }, []);

  const value = useMemo(
    () => ({
      fidelityLevel,
      setFidelityLevel,
    }),
    [fidelityLevel, setFidelityLevel],
  );

  return <FidelityContext value={value}>{children}</FidelityContext>;
}

export function useFidelity() {
  const context = useContext(FidelityContext);
  if (!context) throw new Error('useFidelity must be used within a FidelityProvider');
  return context;
}

export function useFidelityOptional(): FidelityContextValue {
  return (
    useContext(FidelityContext) ?? {
      fidelityLevel: 'auto',
      setFidelityLevel: async () => undefined,
    }
  );
}
