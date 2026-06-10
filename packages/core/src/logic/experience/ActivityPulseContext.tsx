import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

interface ActivityPulseState {
  pulse: number; // 0 to 1, representing recent activity intensity
  lastEventTime: number;
  intensity: number; // Cumulative intensity
}

interface ActivityPulseContextType {
  state: ActivityPulseState;
  registerPulse: (strength?: number) => void;
}

const ActivityPulseContext = createContext<ActivityPulseContextType | undefined>(undefined);

export const ActivityPulseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<ActivityPulseState>({
    pulse: 0,
    lastEventTime: 0, // DETERMINISTIC: Start at 0 for hydration parity
    intensity: 0,
  });

  const decayRef = useRef<number | null>(null);

  const registerPulse = useCallback((strength: number = 0.2) => {
    setState((prev) => ({
      ...prev,
      pulse: Math.min(1, prev.pulse + strength),
      // DETERMINISTIC_OK: This runs in an interactive event callback, not during hydration.
      // eslint-disable-next-line no-restricted-syntax
      lastEventTime: Date.now(),
      intensity: prev.intensity + strength,
    }));
  }, []);

  useEffect(() => {
    // DETERMINISTIC_OK: Setting real time once hydrated ensures server/client parity on first render.
    // eslint-disable-next-line no-restricted-syntax
    setState((prev) => ({ ...prev, lastEventTime: Date.now() }));

    // Decay function to make the pulse fade over time
    const decay = () => {
      setState((prev) => {
        if (prev.pulse <= 0.01) return prev;
        return {
          ...prev,
          pulse: prev.pulse * 0.95, // 5% decay per frame-ish
        };
      });
      decayRef.current = requestAnimationFrame(decay);
    };

    decayRef.current = requestAnimationFrame(decay);
    return () => {
      if (decayRef.current) cancelAnimationFrame(decayRef.current);
    };
  }, []);

  const value = useMemo(() => ({ state, registerPulse }), [state, registerPulse]);

  return <ActivityPulseContext.Provider value={value}>{children}</ActivityPulseContext.Provider>;
};

export const useActivityPulse = () => {
  const context = useContext(ActivityPulseContext);
  if (!context) {
    throw new Error('useActivityPulse must be used within an ActivityPulseProvider');
  }
  return context;
};
