import React, { useState, useEffect } from 'react';
import { Box, VStack, HStack, Text, Spinner } from '../gluestack';
import { Theme } from '../theme/Theme';
import { useTheme } from '../hooks/useTheme';
import { GuestDataSync } from '@repo/core';
import { Check, AlertCircle } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import SanctuaryModal from './SanctuaryModal';
import SanctuaryButton from './SanctuaryButton';

interface GuestDataSyncModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
    onSyncComplete: () => void;
}

export default function GuestDataSyncModal({
    isOpen,
    onClose,
    userId,
    onSyncComplete
}: GuestDataSyncModalProps) {
    const { t } = useTranslation();
    const { text, accent, glass } = useTheme();

    const [syncing, setSyncing] = useState(false);
    const [progress, setProgress] = useState({ current: 0, total: 0, step: '' });
    const [completed, setCompleted] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [summary, setSummary] = useState({ timetablePeriods: 0, moodLogs: 0, journalEntries: 0, students: 0, total: 0 });

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
        onClose();
    };

    const footer = !completed ? (
        <HStack {...({ space: "md", width: "100%" } as any)}>
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
            >
                {syncing ? (t('sync.syncing') || 'Syncing…') : (t('sync.syncButton') || 'Sync Data')}
            </SanctuaryButton>
        </HStack>
    ) : undefined;

    return (
        <SanctuaryModal
            isOpen={isOpen}
            onClose={handleSkip}
            title={completed ? '✨ ' + (t('sync.completeTitle') || 'Sync Complete!') : '☁️ ' + (t('sync.title') || 'Sync Your Data')}
            footer={footer}
        >
            <VStack {...({ space: "lg" } as any)}>
                {!completed && !syncing && (
                    <>
                        <Text {...({ color: text.secondary, size: "sm" } as any)}>
                            {t('sync.description') || 'We found data from your guest session. Would you like to sync it to your new account?'}
                        </Text>

                        {/* Data Summary */}
                        <Box
                            sx={{
                                backgroundColor: glass.interact.bg,
                                borderRadius: Theme.corners.comfortable,
                                borderWidth: 1,
                                borderColor: glass.interact.border,
                                padding: Theme.spacing.md
                            }}
                        >
                            <VStack {...({ space: "sm" } as any)}>
                                {summary.timetablePeriods > 0 && (
                                    <HStack justifyContent="space-between">
                                        <Text {...({ color: text.secondary, size: "sm" } as any)}>Timetable Periods</Text>
                                        <Text {...({ color: text.primary, bold: true } as any)}>{summary.timetablePeriods}</Text>
                                    </HStack>
                                )}
                                {summary.moodLogs > 0 && (
                                    <HStack justifyContent="space-between">
                                        <Text {...({ color: text.secondary, size: "sm" } as any)}>Mood Logs</Text>
                                        <Text {...({ color: text.primary, bold: true } as any)}>{summary.moodLogs}</Text>
                                    </HStack>
                                )}
                                {summary.journalEntries > 0 && (
                                    <HStack justifyContent="space-between">
                                        <Text {...({ color: text.secondary, size: "sm" } as any)}>Journal Entries</Text>
                                        <Text {...({ color: text.primary, bold: true } as any)}>{summary.journalEntries}</Text>
                                    </HStack>
                                )}
                                {summary.students > 0 && (
                                    <HStack justifyContent="space-between">
                                        <Text {...({ color: text.secondary, size: "sm" } as any)}>Students</Text>
                                        <Text {...({ color: text.primary, bold: true } as any)}>{summary.students}</Text>
                                    </HStack>
                                )}
                                <Box sx={{ height: 1, backgroundColor: glass.interact.border, marginVertical: 4 }} />
                                <HStack justifyContent="space-between">
                                    <Text {...({ color: text.primary, bold: true, size: "sm" } as any)}>Total Items</Text>
                                    <Text {...({ color: accent.action, bold: true } as any)}>{summary.total}</Text>
                                </HStack>
                            </VStack>
                        </Box>
                    </>
                )}

                {syncing && (
                    <VStack {...({ space: "md", alignItems: "center" } as any)}>
                        <Spinner {...({ size: "large", color: accent.action } as any)} />
                        <Text {...({ color: text.primary, textAlign: "center" } as any)}>
                            {progress.step}
                        </Text>
                        <Text {...({ color: text.secondary, size: "xs" } as any)}>
                            {progress.current} / {progress.total} items synced
                        </Text>
                        <Box
                            sx={{
                                width: '100%',
                                height: 8,
                                backgroundColor: glass.interact.bg,
                                borderRadius: 4,
                                overflow: 'hidden'
                            }}
                        >
                            <Box
                                sx={{
                                    // Guard against division by zero when total is 0
                                    width: progress.total > 0
                                        ? `${Math.round((progress.current / progress.total) * 100)}%`
                                        : '0%',
                                    height: '100%',
                                    backgroundColor: accent.action
                                }}
                            />
                        </Box>
                    </VStack>
                )}

                {completed && (
                    <VStack {...({ space: "md", alignItems: "center" } as any)}>
                        <Box
                            sx={{
                                width: 64,
                                height: 64,
                                borderRadius: 32,
                                backgroundColor: `${accent.action}20`,
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <Check size={32} color={accent.action} />
                        </Box>
                        <Text {...({ color: text.primary, textAlign: "center", bold: true } as any)}>
                            {t('sync.successMessage') || 'All your data has been synced successfully!'}
                        </Text>
                        <Text {...({ color: text.secondary, size: "xs", textAlign: "center" } as any)}>
                            {t('sync.successDescription') || 'You can now access your data from any device.'}
                        </Text>
                    </VStack>
                )}

                {error && (
                    <Box
                        sx={{
                            padding: Theme.spacing.md,
                            backgroundColor: `${accent.danger}20`,
                            borderRadius: Theme.corners.comfortable,
                            borderWidth: 1,
                            borderColor: accent.danger
                        }}
                    >
                        <HStack {...({ space: "sm" } as any)}>
                            <AlertCircle size={20} color={accent.danger} />
                            <Text {...({ color: accent.danger, size: "sm", flex: 1 } as any)}>
                                {error}
                            </Text>
                        </HStack>
                    </Box>
                )}
            </VStack>
        </SanctuaryModal>
    );
}
