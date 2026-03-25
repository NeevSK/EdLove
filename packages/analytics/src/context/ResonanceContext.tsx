import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

interface ResonanceState {
  pulse: number; // 0 to 1, representing recent activity intensity
  lastEventTime: number;
  intensity: number; // Cumulative intensity
}

interface ResonanceContextType {
  state: ResonanceState;
  registerPulse: (strength?: number) => void;
}

const ResonanceContext = createContext<ResonanceContextType | undefined>(undefined);

export const ResonanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<ResonanceState>({
    pulse: 0,
    lastEventTime: Date.now(),
    intensity: 0,
  });

  const decayRef = useRef<number | null>(null);

  const registerPulse = (strength: number = 0.2) => {
    setState(prev => ({
      ...prev,
      pulse: Math.min(1, prev.pulse + strength),
      lastEventTime: Date.now(),
      intensity: prev.intensity + strength,
    }));
  };

  useEffect(() => {
    // Decay function to make the pulse fade over time
    const decay = () => {
      setState(prev => {
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

  return (
    <ResonanceContext.Provider value={{ state, registerPulse }}>
      {children}
    </ResonanceContext.Provider>
  );
};

export const useResonance = () => {
  const context = useContext(ResonanceContext);
  if (!context) {
    throw new Error('useResonance must be used within a ResonanceProvider');
  }
  return context;
};
