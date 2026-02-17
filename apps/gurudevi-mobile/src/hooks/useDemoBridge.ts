import { Alert } from 'react-native';
import { useStore } from '../store/useStore';
import { api } from '../lib/api';
import { useTranslation } from 'react-i18next';
import { hapticSuccess, hapticWarning } from '../utils/haptics';

/**
 * Hook to handle the "Bridge to Reality" flow when exiting Demo Mode.
 * If the user has performed any simulated writes, it prompts them to save.
 */
export function useDemoBridge() {
    const { t } = useTranslation();
    const { demoLogs, clearDemoLogs, setDemoMode } = useStore();

    const exitDemoWithBridge = async () => {
        if (demoLogs.length === 0) {
            setDemoMode(false);
            return;
        }

        // Get the name of the first item created for a personalized message
        const firstLog = demoLogs.find(log => log.method.startsWith('create') || log.method.startsWith('add'));
        const firstItemName = firstLog?.payload?.name || firstLog?.payload?.title || 'item';

        hapticWarning();

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
                    }
                },
                {
                    text: t('demoMode.bridgeSave'),
                    onPress: async () => {
                        const { setIsBridging } = useStore.getState();
                        try {
                            // Enable bridging mode to bypass API interception
                            setIsBridging(true);

                            // Bridge the data to reality
                            await processDemoLogs(demoLogs);

                            hapticSuccess();
                        } finally {
                            setIsBridging(false);
                            clearDemoLogs();
                            setDemoMode(false);
                        }
                    }
                }
            ]
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
