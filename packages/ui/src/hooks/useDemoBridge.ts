import { replayDemoLogs } from '@repo/core/api/sandboxBridge';
import { useExperienceState } from '@repo/core/lib/experienceState';
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
  const demoLogs = useExperienceState((state) => state.demoLogs);
  const clearDemoLogs = useExperienceState((state) => state.clearDemoLogs);
  const setDemoMode = useExperienceState((state) => state.setDemoMode);

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

    const executeReplay = async () => {
      const report = await replayDemoLogs({ clearOnComplete: true });
      if (report.failed.length === 0) {
        hapticSuccess();
      } else {
        console.warn(`[DemoBridge] ${report.failed.length} operations failed to replay:`, report.failed);
      }
      setDemoMode(false);
    };

    if (Platform.OS === 'web') {
      const save = window.confirm(
        t('demoMode.bridgeMessage', {
          count: demoLogs.length,
          firstName: firstItemName,
        }),
      );
      if (save) {
        await executeReplay();
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
            void executeReplay();
          },
        },
      ],
    );
  }, [demoLogs, setDemoMode, clearDemoLogs, t]);

  return useMemo(() => ({ exitDemoWithBridge }), [exitDemoWithBridge]);
}
