import { api, useStore } from '@repo/core/logic';
import { useTranslation } from 'react-i18next';
import { Alert, Platform } from 'react-native';
import { hapticSuccess, hapticWarning } from '../utils/haptics';

/**
 * Hook to handle the "Bridge to Reality" flow when exiting Demo Mode.
 * If the user has performed any simulated writes, it prompts them to save.
 */
export function useDemoBridge() {
  const { t } = useTranslation();
  const { demoLogs, clearDemoLogs, setDemoMode } = useStore() as any;

  const exitDemoWithBridge = async () => {
    if (demoLogs.length === 0) {
      setDemoMode(false);
      return;
    }

    // Get the name of the first item created for a personalized message
    const firstLog = demoLogs.find(
      (log: any) => log.method.startsWith('create') || log.method.startsWith('add'),
    );
    const firstItemName =
      (firstLog?.payload as any)?.name || (firstLog?.payload as any)?.title || 'item';

    hapticWarning();

    if (Platform.OS === 'web') {
      // Two-action demo bridge - window.confirm is acceptable for this destructive choice on web
      const save = window.confirm(
        t('demoMode.bridgeMessage', { count: demoLogs.length, firstName: firstItemName }),
      );
      if (save) {
        const { setBridging } = useStore.getState() as any;
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
      t('demoMode.bridgeMessage', { count: demoLogs.length, firstName: firstItemName }),
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
          onPress: async () => {
            const { setBridging } = useStore.getState() as any;
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
          },
        },
      ],
    );
  };

  /**
   * Processes the shadow logs and executes real API calls.
   */
  const processDemoLogs = async (logs: any[]) => {
    console.log(`[DemoBridge] Processing ${logs.length} logs for reality...`);

    for (const log of logs) {
      try {
        const apiModule = (api as any)[log.module];
        if (apiModule && typeof apiModule[log.method] === 'function') {
          // Execute the REAL API call (no proxy interception because we'll be in production mode or we force it)
          // Note: Since isDemoMode is still true during this loop,
          // we need to make sure the proxy doesn't intercept these "bridging" calls.
          // A simple way is to pass a special flag in args or rely on the fact that
          // we'll toggle demoMode AFTER this loop correctly.
          // Actually, the Proxy checks useStore.getState().isDemoMode.
          // We can temporarily set a "isBridging" flag or just toggle demoMode first.

          console.log(`[DemoBridge] Realizing: ${log.module}.${log.method}`);
          await apiModule[log.method](log.payload);
        }
      } catch (err) {
        console.error(`[DemoBridge] Failed to realize ${log.module}.${log.method}:`, err);
      }
    }
  };

  return { exitDemoWithBridge };
}
