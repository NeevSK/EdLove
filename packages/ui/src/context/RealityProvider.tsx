import NetInfo from '@react-native-community/netinfo';
import { normalizeNetworkConditions } from '@repo/core/efficiency';
import { coreRuntime } from '@repo/core/logic/runtimeRegistry';
import { useStore } from '@repo/core/store/useStore';
import { useAccessibility } from '@repo/ui/hooks/useAccessibility';
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { collectRealitySignals } from './realitySignals';
import type { NetworkQuality, RealityState } from './types';
import { detectDeviceTier, detectNetworkQuality, shouldUseDataSaver } from './utils';

interface RealityContextValue {
  reality: RealityState;
  refreshReality: () => Promise<void>;
}

const DEFAULT_REALITY: RealityState = {
  deviceTier: 'medium',
  totalMemoryGB: 4,
  networkQuality: 'good',
  isDataSaverMode: false,
  isBatterySaverMode: false,
  isReducedMotionEnabled: false,
};

const RealityContext = createContext<RealityContextValue | undefined>(undefined);

async function readPowerStateSafely(): Promise<{ lowPowerMode: boolean } | null> {
  try {
    return (await coreRuntime.device.getPowerState?.()) ?? { lowPowerMode: false };
  } catch (error) {
    console.warn('[RealityProvider] Power-state read failed; retaining last known value', error);
    return null;
  }
}

export function RealityProvider({ children }: { children: ReactNode }) {
  const [reality, setReality] = useState<RealityState>(DEFAULT_REALITY);
  const refreshSequence = useRef(0);
  const { isReduceMotionEnabled } = useAccessibility();

  const refreshReality = useCallback(async () => {
    const sequence = ++refreshSequence.current;
    const result = await collectRealitySignals(reality, isReduceMotionEnabled, {
      readDevice: detectDeviceTier,
      readNetwork: detectNetworkQuality,
      readPower: readPowerStateSafely,
    });
    if (sequence !== refreshSequence.current) return;

    setReality(result.reality);

    if (result.failureCount > 0) {
      console.warn(
        `[RealityProvider] ${result.failureCount} signal refresh failed; retained last known values`,
      );
    }
  }, [isReduceMotionEnabled]);

  // Network Monitoring
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const normalized = normalizeNetworkConditions({
        isConnected: state.isConnected,
        type: state.type,
        isMetered: state.type === 'cellular',
        details:
          state.type === 'cellular'
            ? { cellularGeneration: state.details.cellularGeneration }
            : undefined,
      });
      const quality: NetworkQuality = normalized.quality;

      setReality((prev) => ({
        ...prev,
        networkQuality: quality,
        isDataSaverMode: shouldUseDataSaver(quality),
      }));

      // Update core store for connectivity status
      useStore.getState().setIsOnline(state.isConnected ?? false);
    });

    return unsubscribe;
  }, []);

  // App State Monitoring
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') refreshReality();
    });
    return () => subscription.remove();
  }, [refreshReality]);

  useEffect(() => {
    try {
      const subscription = coreRuntime.device.addPowerStateListener?.((lowPowerMode) => {
        setReality((prev) => ({ ...prev, isBatterySaverMode: lowPowerMode }));
      });
      return () => subscription?.remove();
    } catch (error) {
      console.warn('[RealityProvider] Power-state listener unavailable', error);
      return undefined;
    }
  }, []);

  // Initial Reality Check
  useEffect(() => {
    void refreshReality().catch((error) => {
      console.warn('[RealityProvider] Initial reality refresh failed', error);
    });
  }, [refreshReality]);

  useEffect(() => {
    setReality((prev) => ({ ...prev, isReducedMotionEnabled: isReduceMotionEnabled }));
  }, [isReduceMotionEnabled]);

  const value = useMemo(() => ({ reality, refreshReality }), [reality, refreshReality]);

  return <RealityContext value={value}>{children}</RealityContext>;
}

export function useReality() {
  const context = useContext(RealityContext);
  if (!context) throw new Error('useReality must be used within a RealityProvider');
  return context;
}

export function useRealityOptional(): RealityContextValue {
  return (
    useContext(RealityContext) ?? {
      reality: DEFAULT_REALITY,
      refreshReality: async () => undefined,
    }
  );
}
