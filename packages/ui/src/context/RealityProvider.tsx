import NetInfo from '@react-native-community/netinfo';
import { useStore } from '@repo/core/logic';
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import type { NetworkQuality, RealityState } from '@/context/types';
import { detectDeviceTier, detectNetworkQuality, shouldUseDataSaver } from '@/context/utils';

interface RealityContextValue {
  reality: RealityState;
  refreshReality: () => Promise<void>;
}

const RealityContext = createContext<RealityContextValue | undefined>(undefined);

export function RealityProvider({ children }: { children: ReactNode }) {
  const [reality, setReality] = useState<RealityState>({
    deviceTier: 'medium',
    totalMemoryGB: 4,
    networkQuality: 'good',
    isDataSaverMode: false,
    isBatterySaverMode: false,
  });

  const refreshReality = useCallback(async () => {
    try {
      const [deviceInfo, networkQuality] = await Promise.all([
        detectDeviceTier(),
        detectNetworkQuality(),
      ]);

      setReality((prev) => ({
        ...prev,
        deviceTier: deviceInfo.tier,
        totalMemoryGB: deviceInfo.memoryGB,
        networkQuality,
        isDataSaverMode: shouldUseDataSaver(networkQuality),
      }));
    } catch (error) {
      console.warn('[RealityProvider] Sync error:', error);
    }
  }, []);

  // Network Monitoring
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: any) => {
      let quality: NetworkQuality = 'offline';
      if (state.isConnected) {
        const type = state.type;
        const details = state.details as any;
        if (type === 'cellular') {
          const gen = details?.cellularGeneration;
          if (gen === '5g') quality = 'excellent';
          else if (gen === '4g') quality = 'good';
          else if (gen === '3g') quality = 'fair';
          else quality = 'poor';
        } else if (type === 'wifi') quality = 'good';
        else quality = 'fair';
      }

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

  // Initial Reality Check
  useEffect(() => {
    refreshReality();
  }, [refreshReality]);

  const value = useMemo(() => ({ reality, refreshReality }), [reality, refreshReality]);

  return <RealityContext value={value}>{children}</RealityContext>;
}

export function useReality() {
  const context = useContext(RealityContext);
  if (!context) throw new Error('useReality must be used within a RealityProvider');
  return context;
}
