import { GuestDataSync } from '@repo/core/native';

import { Check, CircleAlert, TriangleAlert } from '@repo/ui/icons';
import { useCallback, useEffect, useReducer } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, HStack, Spinner, Text, VStack } from '@/gluestack';
import { SanctuaryButton } from '@/components/SanctuaryButton';
import SanctuaryModal from '@/components/SanctuaryModal';

interface GuestDataSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onSyncComplete: () => void;
}

// ============================================================================
// STATE MACHINE DEFINITION
// ============================================================================

type SyncStatus = 'idle' | 'loading' | 'ready' | 'confirm_skip' | 'syncing' | 'completed' | 'error';

interface SyncSummary {
  timetablePeriods: number;
  moodLogs: number;
  journalEntries: number;
  students: number;
  total: number;
}

interface State {
  status: SyncStatus;
  summary: SyncSummary;
  progress: { current: number; total: number; step: string };
  error: string | null;
}

type Action =
  | { type: 'START_LOADING' }
  | { type: 'SET_SUMMARY'; summary: SyncSummary }
  | { type: 'START_SYNC' }
  | { type: 'UPDATE_PROGRESS'; current: number; total: number; step: string }
  | { type: 'SET_COMPLETED' }
  | { type: 'SET_ERROR'; message: string }
  | { type: 'TRIGGER_CONFIRM_SKIP' }
  | { type: 'CANCEL_CONFIRM_SKIP' }
  | { type: 'RESET' };

const initialState: State = {
  status: 'idle',
  summary: {
    timetablePeriods: 0,
    moodLogs: 0,
    journalEntries: 0,
    students: 0,
    total: 0,
  },
  progress: { current: 0, total: 0, step: '' },
  error: null,
};

function syncReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'START_LOADING':
      return { ...state, status: 'loading', error: null };
    case 'SET_SUMMARY':
      return { ...state, status: 'ready', summary: action.summary };
    case 'START_SYNC':
      return { ...state, status: 'syncing', error: null };
    case 'UPDATE_PROGRESS':
      return {
        ...state,
        progress: {
          current: action.current,
          total: action.total,
          step: action.step,
        },
      };
    case 'SET_COMPLETED':
      return { ...state, status: 'completed' };
    case 'SET_ERROR':
      return { ...state, status: 'error', error: action.message };
    case 'TRIGGER_CONFIRM_SKIP':
      return { ...state, status: 'confirm_skip' };
    case 'CANCEL_CONFIRM_SKIP':
      return { ...state, status: 'ready' };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

/**
 * AnonymousDataSyncModal - Hardened v3 implementation with State Machine.
 */
export default function GuestDataSyncModal({
  isOpen,
  onClose,
  userId,
  onSyncComplete,
}: GuestDataSyncModalProps) {
  const { t } = useTranslation();
  const [state, dispatch] = useReducer(syncReducer, initialState);

  const fetchSyncSummary = useCallback(async () => {
    dispatch({ type: 'START_LOADING' });
    try {
      const dataSummary = await GuestDataSync.getGuestDataSummary();
      dispatch({ type: 'SET_SUMMARY', summary: dataSummary });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      dispatch({ type: 'SET_ERROR', message });
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      void fetchSyncSummary();
    } else {
      dispatch({ type: 'RESET' });
    }
  }, [isOpen, fetchSyncSummary]);

  const handleSync = useCallback(async () => {
    dispatch({ type: 'START_SYNC' });

    try {
      const result = await GuestDataSync.syncAllData(userId, (prog) => {
        dispatch({
          type: 'UPDATE_PROGRESS',
          current: prog.completed,
          total: prog.total,
          step: prog.currentStep,
        });
      });

      if (result.success) {
        dispatch({ type: 'SET_COMPLETED' });
        setTimeout(onSyncComplete, 2000);
      } else {
        dispatch({ type: 'SET_ERROR', message: result.errors.join(', ') });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      dispatch({ type: 'SET_ERROR', message });
    }
  }, [userId, onSyncComplete]);

  const handleSkip = useCallback(() => {
    if (state.summary.total > 0 && state.status === 'ready') {
      dispatch({ type: 'TRIGGER_CONFIRM_SKIP' });
      return;
    }
    onClose();
  }, [state.summary.total, state.status, onClose]);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const footer =
    state.status !== 'completed' ? (
      <HStack className="gap-4 w-full">
        <SanctuaryButton
          variant="ghost"
          action="secondary"
          onPress={handleSkip}
          isDisabled={state.status === 'syncing'}
        >
          {t('common.skip') || 'Skip'}
        </SanctuaryButton>
        <SanctuaryButton
          action="primary"
          onPress={() => {
            void handleSync();
          }}
          isLoading={state.status === 'syncing'}
          className="flex-1"
        >
          {state.status === 'syncing'
            ? t('sync.syncing') || 'Syncing...'
            : t('sync.syncButton') || 'Sync Data'}
        </SanctuaryButton>
      </HStack>
    ) : undefined;

  return (
    <SanctuaryModal
      isOpen={isOpen}
      onClose={handleSkip}
      title={
        state.status === 'completed'
          ? t('sync.completeTitle') || 'Sync Complete!'
          : t('sync.title') || 'Sync Your Data'
      }
      footer={footer}
    >
      <VStack className="gap-6">
        {state.status === 'loading' && (
          <HStack className="justify-center p-8">
            <Spinner size="large" className="text-phase-accent" />
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
                onPress={() => dispatch({ type: 'CANCEL_CONFIRM_SKIP' })}
                className="flex-1"
              >
                {t('common.back') || 'Back'}
              </SanctuaryButton>
              <SanctuaryButton
                variant="solid"
                action="negative"
                onPress={onClose}
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
              {t('sync.description') ||
                'We found data from your anonymous session. Would you like to sync it to your new account?'}
            </Text>

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
            <Spinner size="large" className="text-phase-accent" />
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
