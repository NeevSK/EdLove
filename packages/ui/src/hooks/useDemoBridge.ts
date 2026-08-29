import { api } from '@repo/core/api/client';
import { useAuthStore } from '@repo/core/store';
import { hapticSuccess, hapticWarning } from '@repo/ui/utils/haptics';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Platform } from 'react-native';

/**
 * Hook to handle the "Bridge to Reality" flow when exiting Demo Mode.
 * If the user has performed any simulated writes, it prompts them to save.
 */
export function useDemoBridge() {
  const { t } = useTranslation();
  const demoLogs = useAuthStore((state) => state.demoLogs);
  const clearDemoLogs = useAuthStore((state) => state.clearDemoLogs);
  const setDemoMode = useAuthStore((state) => state.setDemoMode);

  /**
   * Processes the shadow logs and executes real API calls.
   */
  const processDemoLogs = useCallback(
    async (logs: Array<{ module: string; method: string; payload: any }>) => {
      console.log(`[DemoBridge] Processing ${logs.length} logs for reality...`);

      for (const log of logs) {
        try {
          const apiModule = (api as Record<string, Record<string, unknown>>)[log.module];
          if (apiModule && typeof apiModule[log.method] === 'function') {
            console.log(`[DemoBridge] Realizing: ${log.module}.${log.method}`);
            const method = apiModule[log.method] as (payload: unknown) => Promise<void>;
            await method(log.payload);
          }
        } catch (err) {
          console.error(`[DemoBridge] Failed to realize ${log.module}.${log.method}:`, err);
        }
      }
    },
    [],
  );

  const exitDemoWithBridge = useCallback(async () => {
    if (demoLogs.length === 0) {
      setDemoMode(false);
      return;
    }

    // Get the name of the first item created for a personalized message
    const firstLog = demoLogs.find(
      (log) => log.method.startsWith('create') || log.method.startsWith('add'),
    );
    const firstItemName =
      (firstLog?.payload as Record<string, string> | undefined)?.name ||
      (firstLog?.payload as Record<string, string> | undefined)?.title ||
      'item';

    hapticWarning();

    if (Platform.OS === 'web') {
      // Two-action demo bridge - window.confirm is acceptable for this destructive choice on web
      const save = window.confirm(
        t('demoMode.bridgeMessage', {
          count: demoLogs.length,
          firstName: firstItemName,
        }),
      );
      if (save) {
        const setBridging = useAuthStore.getState().setBridging;
        try {
          setBridging(true);
          await processDemoLogs(demoLogs);
          hapticSuccess();
        } finally {
          setBridging(false);
          clearDemoLogs();
          setDemoMode(false);
        }
      } else {
        clearDemoLogs();
        setDemoMode(false);
      }
      return;
    }

    Alert.alert(
      t('demoMode.bridgeTitle'),
      t('demoMode.bridgeMessage', {
        count: demoLogs.length,
        firstName: firstItemName,
      }),
      [
        {
          text: t('demoMode.bridgeDiscard'),
          style: 'destructive',
          onPress: () => {
            clearDemoLogs();
            setDemoMode(false);
          },
        },
        {
          text: t('demoMode.bridgeSave'),
          onPress: () => {
            void (async () => {
              const setBridging = useAuthStore.getState().setBridging;
              try {
                // Enable bridging mode to bypass API interception
                setBridging(true);

                // Bridge the data to reality
                await processDemoLogs(demoLogs);

                hapticSuccess();
              } finally {
                setBridging(false);
                clearDemoLogs();
                setDemoMode(false);
              }
            })();
          },
        },
      ],
    );
  }, [demoLogs, setDemoMode, clearDemoLogs, t, processDemoLogs]);

  return useMemo(() => ({ exitDemoWithBridge }), [exitDemoWithBridge]);
}
