import { GuestDataSync } from '@repo/core/native/guestDataSync';
import { useActorSnapshot } from '@repo/core/hooks/useActorSnapshot';
import {
  createGuestDataSyncActor,
  executeFetchGuestDataSummaryEffect,
  executeGuestDataSyncEffect,
  type SyncSummary,
} from '@repo/ui/machines/guestDataSyncMachine';
import { SanctuaryButton } from '@repo/ui/components/SanctuaryButton';
import SanctuaryModal from '@repo/ui/components/SanctuaryModal';
import { Check, CircleAlert, TriangleAlert } from '@repo/ui/icons';
import { Box, HStack, Text, VStack } from '@repo/ui/primitives';
import { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { BrandPulse } from './BrandPulse';

interface GuestDataSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onSyncComplete: () => void;
  onSkipEmpty?: () => void | Promise<void>;
  onDiscard?: () => void | Promise<void>;
}

type SyncStatus = 'idle' | 'loading' | 'ready' | 'confirm_skip' | 'syncing' | 'completed' | 'error';

/**
 * AnonymousDataSyncModal - Hardened v3 implementation with XState v6 + Effect v4.
 */
export default function GuestDataSyncModal({
  isOpen,
  onClose,
  userId,
  onSyncComplete,
  onSkipEmpty,
  onDiscard,
}: GuestDataSyncModalProps) {
  const { t } = useTranslation();
  const actor = useMemo(() => createGuestDataSyncActor({ userId }), [userId]);
  const snapshot = useActorSnapshot(actor);
  const state = useMemo(
    () => ({
      status: snapshot.value as SyncStatus,
      summary: snapshot.context.summary,
      progress: snapshot.context.progress,
      error: snapshot.context.error,
    }),
    [snapshot.value, snapshot.context],
  );
  const transferAvailability = GuestDataSync.getTransferAvailability();

  const fetchSyncSummary = useCallback(async () => {
    await executeFetchGuestDataSummaryEffect(actor, () => GuestDataSync.getGuestDataSummary());
  }, [actor]);

  useEffect(() => {
    if (isOpen) {
      void fetchSyncSummary();
    } else {
      actor.send({ type: 'RESET' });
    }
  }, [isOpen, fetchSyncSummary, actor]);

  const handleSync = useCallback(async () => {
    const result = await executeGuestDataSyncEffect(actor, userId, (uid, onProg) =>
      GuestDataSync.syncAllData(uid, onProg),
    );

    if (result.success) {
      setTimeout(onSyncComplete, 2000);
    }
  }, [actor, userId, onSyncComplete]);

  const handleSkip = useCallback(() => {
    if (state.summary.total > 0 && (state.status === 'ready' || state.status === 'error')) {
      actor.send({ type: 'TRIGGER_CONFIRM_SKIP' });
      return;
    }
    Promise.resolve(onSkipEmpty?.())
      .then(onClose)
      .catch((error: unknown) => {
        actor.send({
          type: 'SET_ERROR',
          message: error instanceof Error ? error.message : 'Could not close the migration safely.',
        });
      });
  }, [actor, state.summary.total, state.status, onClose, onSkipEmpty]);

  const handleKeepOnDevice = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleDiscard = useCallback(() => {
    Promise.resolve(onDiscard?.())
      .then(onClose)
      .catch((error: unknown) => {
        actor.send({
          type: 'SET_ERROR',
          message:
            error instanceof Error ? error.message : 'Could not discard the saved guest data.',
        });
      });
  }, [actor, onClose, onDiscard]);

  const footer =
    state.status === 'ready' || state.status === 'error' ? (
      <HStack className="gap-4 w-full">
        {state.summary.total > 0 ? (
          <>
            <SanctuaryButton variant="ghost" action="secondary" onPress={handleKeepOnDevice}>
              Keep on device
            </SanctuaryButton>
            <SanctuaryButton variant="outline" action="negative" onPress={handleSkip}>
              Discard
            </SanctuaryButton>
            {transferAvailability.isAvailable ? (
              <SanctuaryButton
                action="primary"
                onPress={() => {
                  void handleSync();
                }}
                className="flex-1"
              >
                {t('sync.syncButton') || 'Transfer data'}
              </SanctuaryButton>
            ) : null}
          </>
        ) : (
          <SanctuaryButton variant="ghost" action="secondary" onPress={handleSkip}>
            {t('common.continue') || 'Continue'}
          </SanctuaryButton>
        )}
      </HStack>
    ) : undefined;

  return (
    <SanctuaryModal
      isOpen={isOpen}
      onClose={handleKeepOnDevice}
      title={
        state.status === 'completed'
          ? t('sync.completeTitle') || 'Sync Complete!'
          : transferAvailability.isAvailable
            ? t('sync.title') || 'Sync Your Data'
            : 'Guest data options'
      }
      footer={footer}
    >
      <VStack className="gap-6">
        {state.status === 'loading' && (
          <HStack className="justify-center p-8">
            <BrandPulse size={40} tintColor="#D4843A" />
          </HStack>
        )}

        {state.status === 'confirm_skip' && (
          <VStack className="gap-4">
            <HStack className="gap-2 items-center">
              <TriangleAlert size={18} className="text-phase-accent" />
              <Text className="font-bold text-phase-text-primary">
                {t('sync.skipWarningTitle') || 'Your data will be lost'}
              </Text>
            </HStack>
            <Text className="text-phase-text-secondary text-sm">
              {t('sync.skipWarningBody') ||
                `Skipping will permanently discard ${state.summary.total} item${state.summary.total !== 1 ? 's' : ''} from your anonymous session. This cannot be undone.`}
            </Text>
            <HStack className="gap-2">
              <SanctuaryButton
                variant="ghost"
                action="secondary"
                onPress={() => actor.send({ type: 'CANCEL_CONFIRM_SKIP' })}
                className="flex-1"
              >
                {t('common.back') || 'Back'}
              </SanctuaryButton>
              <SanctuaryButton
                variant="solid"
                action="negative"
                onPress={handleDiscard}
                className="flex-1"
              >
                {t('sync.discardButton') || 'Discard data'}
              </SanctuaryButton>
            </HStack>
          </VStack>
        )}

        {state.status === 'ready' && (
          <>
            <Text className="text-phase-text-secondary text-sm">
              {transferAvailability.isAvailable
                ? t('sync.description') ||
                  'We found data from your anonymous session. Would you like to sync it to your new account?'
                : 'We found data from your guest session. You can keep it on this device or discard it permanently.'}
            </Text>

            {!transferAvailability.isAvailable ? (
              <Box className="rounded-xl border border-phase-accent/30 bg-phase-accent/10 p-4">
                <Text className="text-sm text-phase-text-secondary">
                  {transferAvailability.reason} Your work will remain safely on this device until
                  transfer is available.
                </Text>
              </Box>
            ) : null}

            <Box className="bg-phase-surface rounded-xl border border-white/5 p-4">
              <VStack className="gap-2">
                {state.summary.timetablePeriods > 0 && (
                  <HStack className="justify-between">
                    <Text className="text-phase-text-secondary text-sm">Timetable Periods</Text>
                    <Text className="text-phase-text-primary font-bold">
                      {state.summary.timetablePeriods}
                    </Text>
                  </HStack>
                )}
                {state.summary.moodLogs > 0 && (
                  <HStack className="justify-between">
                    <Text className="text-phase-text-secondary text-sm">Mood Logs</Text>
                    <Text className="text-phase-text-primary font-bold">
                      {state.summary.moodLogs}
                    </Text>
                  </HStack>
                )}
                {state.summary.journalEntries > 0 && (
                  <HStack className="justify-between">
                    <Text className="text-phase-text-secondary text-sm">Journal Entries</Text>
                    <Text className="text-phase-text-primary font-bold">
                      {state.summary.journalEntries}
                    </Text>
                  </HStack>
                )}
                {state.summary.students > 0 && (
                  <HStack className="justify-between">
                    <Text className="text-phase-text-secondary text-sm">Students</Text>
                    <Text className="text-phase-text-primary font-bold">
                      {state.summary.students}
                    </Text>
                  </HStack>
                )}
                <Box className="h-px bg-white/5 my-1" />
                <HStack className="justify-between">
                  <Text className="text-phase-text-primary font-bold text-sm">Total Items</Text>
                  <Text className="text-phase-accent font-bold">{state.summary.total}</Text>
                </HStack>
              </VStack>
            </Box>
          </>
        )}

        {state.status === 'syncing' && (
          <VStack className="gap-4 items-center">
            <BrandPulse size={40} tintColor="#D4843A" />
            <Text className="text-phase-text-primary text-center">{state.progress.step}</Text>
            <Text className="text-phase-text-secondary text-xs">
              {state.progress.current} / {state.progress.total} items synced
            </Text>
            <Box className="w-full h-2 bg-phase-surface rounded-full overflow-hidden">
              <Box
                className="h-full bg-phase-accent"
                style={{
                  width:
                    state.progress.total > 0
                      ? `${Math.round((state.progress.current / state.progress.total) * 100)}%`
                      : '0%',
                }}
              />
            </Box>
          </VStack>
        )}

        {state.status === 'completed' && (
          <VStack className="gap-4 items-center">
            <Box className="w-16 h-16 rounded-full bg-phase-accent/20 items-center justify-center">
              <Check size={32} className="text-phase-accent" />
            </Box>
            <Text className="text-phase-text-primary text-center font-bold">
              {t('sync.successMessage') || 'All your data has been synced successfully!'}
            </Text>
            <Text className="text-phase-text-secondary text-xs text-center">
              {t('sync.successDescription') || 'You can now access your data from any device.'}
            </Text>
          </VStack>
        )}

        {state.error && (
          <Box className="p-4 bg-phase-danger/10 rounded-xl border border-phase-danger">
            <HStack className="gap-2">
              <CircleAlert size={20} className="text-phase-danger" />
              <Text className="text-phase-danger text-sm flex-1">{state.error}</Text>
            </HStack>
          </Box>
        )}
      </VStack>
    </SanctuaryModal>
  );
}
