import React, { useState, useEffect } from 'react';
import { Box, VStack, HStack, Text, Spinner } from '../gluestack';
import { GuestDataSync } from '@repo/core/native';
import { Check, AlertCircle, AlertTriangle } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import SanctuaryModal from './SanctuaryModal';
import SanctuaryButton from './SanctuaryButton';

interface GuestDataSyncModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
    onSyncComplete: () => void;
}

/**
 * GuestDataSyncModal - Hardened v3 implementation.
 */
export default function GuestDataSyncModal({
    isOpen,
    onClose,
    userId,
    onSyncComplete
}: GuestDataSyncModalProps) {
    const { t } = useTranslation();

    const [syncing, setSyncing] = useState(false);
    const [progress, setProgress] = useState({ current: 0, total: 0, step: '' });
    const [completed, setCompleted] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [summary, setSummary] = useState({ timetablePeriods: 0, moodLogs: 0, journalEntries: 0, students: 0, total: 0 });
    const [confirmSkip, setConfirmSkip] = useState(false);

    useEffect(() => {
        if (isOpen) {
            loadSummary();
        }
    }, [isOpen]);

    const loadSummary = async () => {
        const dataSummary = await GuestDataSync.getGuestDataSummary();
        setSummary(dataSummary);
    };

    const handleSync = async () => {
        setSyncing(true);
        setError(null);

        try {
            const result = await GuestDataSync.syncAllData(userId, (prog) => {
                setProgress({
                    current: prog.completed,
                    total: prog.total,
                    step: prog.currentStep
                });
            });

            if (result.success) {
                setCompleted(true);
                setTimeout(() => {
                    onSyncComplete();
                }, 2000);
            } else {
                setError(result.errors.join(', '));
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSyncing(false);
        }
    };

    const handleSkip = () => {
        // If user has data to lose, show a confirmation step first
        if (summary.total > 0 && !confirmSkip) {
            setConfirmSkip(true);
            return;
        }
        onClose();
    };

    const footer = !completed ? (
        <HStack className="gap-4 w-full">
            <SanctuaryButton
                variant="ghost"
                action="secondary"
                onPress={handleSkip}
                isDisabled={syncing}
            >
                {t('common.skip') || 'Skip'}
            </SanctuaryButton>
            <SanctuaryButton
                action="primary"
                onPress={handleSync}
                isLoading={syncing}
                className="flex-1"
            >
                {syncing ? (t('sync.syncing') || 'Syncing...') : (t('sync.syncButton') || 'Sync Data')}
            </SanctuaryButton>
        </HStack>
    ) : undefined;

    return (
        <SanctuaryModal
            isOpen={isOpen}
            onClose={handleSkip}
            title={completed ? (t('sync.completeTitle') || 'Sync Complete!') : (t('sync.title') || 'Sync Your Data')}
            footer={footer}
        >
            <VStack className="gap-6">
                {/* Confirm-skip warning shown when user tries to skip with unsaved data */}
                {confirmSkip && !completed && (
                    <VStack className="gap-4">
                        <HStack className="gap-2 items-center">
                            <AlertTriangle size={18} className="text-phase-accent" />
                            <Text className="font-bold text-phase-text-primary">
                                {t('sync.skipWarningTitle') || 'Your data will be lost'}
                            </Text>
                        </HStack>
                        <Text className="text-phase-text-secondary text-sm">
                            {t('sync.skipWarningBody') || `Skipping will permanently discard ${summary.total} item${summary.total !== 1 ? 's' : ''} from your guest session. This cannot be undone.`}
                        </Text>
                        <HStack className="gap-2">
                            <SanctuaryButton
                                variant="ghost"
                                action="secondary"
                                onPress={() => setConfirmSkip(false)}
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

                {!confirmSkip && !completed && !syncing && (
                    <>
                        <Text className="text-phase-text-secondary text-sm">
                            {t('sync.description') || 'We found data from your guest session. Would you like to sync it to your new account?'}
                        </Text>

                        {/* Data Summary */}
                        <Box className="bg-phase-surface rounded-xl border border-white/5 p-4">
                            <VStack className="gap-2">
                                {summary.timetablePeriods > 0 && (
                                    <HStack className="justify-between">
                                        <Text className="text-phase-text-secondary text-sm">Timetable Periods</Text>
                                        <Text className="text-phase-text-primary font-bold">{summary.timetablePeriods}</Text>
                                    </HStack>
                                )}
                                {summary.moodLogs > 0 && (
                                    <HStack className="justify-between">
                                        <Text className="text-phase-text-secondary text-sm">Mood Logs</Text>
                                        <Text className="text-phase-text-primary font-bold">{summary.moodLogs}</Text>
                                    </HStack>
                                )}
                                {summary.journalEntries > 0 && (
                                    <HStack className="justify-between">
                                        <Text className="text-phase-text-secondary text-sm">Journal Entries</Text>
                                        <Text className="text-phase-text-primary font-bold">{summary.journalEntries}</Text>
                                    </HStack>
                                )}
                                {summary.students > 0 && (
                                    <HStack className="justify-between">
                                        <Text className="text-phase-text-secondary text-sm">Students</Text>
                                        <Text className="text-phase-text-primary font-bold">{summary.students}</Text>
                                    </HStack>
                                )}
                                <Box className="h-px bg-white/5 my-1" />
                                <HStack className="justify-between">
                                    <Text className="text-phase-text-primary font-bold text-sm">Total Items</Text>
                                    <Text className="text-phase-accent font-bold">{summary.total}</Text>
                                </HStack>
                            </VStack>
                        </Box>
                    </>
                )}

                {syncing && (
                    <VStack className="gap-4 items-center">
                        <Spinner size="large" className="text-phase-accent" />
                        <Text className="text-phase-text-primary text-center">
                            {progress.step}
                        </Text>
                        <Text className="text-phase-text-secondary text-xs">
                            {progress.current} / {progress.total} items synced
                        </Text>
                        <Box className="w-full h-2 bg-phase-surface rounded-full overflow-hidden">
                            <Box
                                className="h-full bg-phase-accent"
                                style={{
                                    width: progress.total > 0
                                        ? `${Math.round((progress.current / progress.total) * 100)}%`
                                        : '0%',
                                }}
                            />
                        </Box>
                    </VStack>
                )}

                {completed && (
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

                {error && (
                    <Box className="p-4 bg-phase-danger/10 rounded-xl border border-phase-danger">
                        <HStack className="gap-2">
                            <AlertCircle size={20} className="text-phase-danger" />
                            <Text className="text-phase-danger text-sm flex-1">
                                {error}
                            </Text>
                        </HStack>
                    </Box>
                )}
            </VStack>
        </SanctuaryModal>
    );
}
