import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { AppState } from 'react-native';
import type { TrubeEnvironment, TrubeThermalState } from '../core/types';
import { driverManager } from './DriverManager';

interface TrubeTelemetry {
  onFailover?: (reason: string) => void;
  onThermalChange?: (state: TrubeThermalState) => void;
}

interface TrubeContextType {
  environment: TrubeEnvironment;
  setEnvironment: (env: Partial<TrubeEnvironment>) => void;
  telemetry?: TrubeTelemetry;
}

const TrubeContext = createContext<TrubeContextType | undefined>(undefined);

export function TrubeProvider({ 
  children, 
  telemetry 
}: { 
  children: React.ReactNode;
  telemetry?: TrubeTelemetry;
}) {
  const [environment, setEnvState] = useState<TrubeEnvironment>({
    capabilityTier: 'tier-1',
    thermalState: 'nominal',
    lowPowerMode: false,
    prefersReducedMotion: false,
    pixelRatio: 2,
  });

  const setEnvironment = (newEnv: Partial<TrubeEnvironment>) => {
    setEnvState(prev => ({ ...prev, ...newEnv }));
  };

  useEffect(() => {
    // 0. Register Failover Telemetry
    driverManager.setOnFailoverListener((reason) => {
      telemetry?.onFailover?.(reason);
    });

    // 1. Initial Capability Probe & Pre-warm
    const bestBackend = driverManager.getBestBackend();
    setEnvironment({
      capabilityTier: bestBackend.includes('native') ? 'tier-1' : bestBackend === 'webgpu' ? 'tier-2' : 'tier-3',
    });

    // 2. Trigger GPU Pre-warm Sequence
    driverManager.prewarm();

    // 3. Mock Thermal/Power Listeners (In real production, use react-native-device-info)
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'background') {
        // Optimization: Drop quality to static when app is backgrounded
        setEnvironment({ thermalState: 'warm' });
      } else {
        setEnvironment({ thermalState: 'nominal' });
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (environment.thermalState) {
      telemetry?.onThermalChange?.(environment.thermalState);
    }
  }, [environment.thermalState]);

  const value = useMemo(() => ({ 
    environment, 
    setEnvironment,
    telemetry 
  }), [environment, telemetry]);

  return (
    <TrubeContext.Provider value={value}      {children}
    </TrubeContext.Provider  );
}

export function useTrubeEnvironment() {
  const context = useContext(TrubeContext);
  if (!context) {
    // Return a default environment if not wrapped in Provider
    return {
      environment: {
        capabilityTier: 'tier-2' as const,
        thermalState: 'nominal' as const,
      },
      setEnvironment: () => {},
    };
  }
  return context;
}
