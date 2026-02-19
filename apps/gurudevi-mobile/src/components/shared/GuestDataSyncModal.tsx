import React, { useState, useEffect } from 'react';
import {
    Box,
    VStack,
    HStack,
    Text,
    Heading,
    Button,
    ButtonText,
    Modal,
    ModalBackdrop,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Spinner
} from '@repo/ui';
import { Theme } from '@repo/ui';
import { useThemedColors } from '@repo/ui';
import { GuestDataSync } from '../../lib/guestDataSync';
import { Check, AlertCircle, Cloud, Database } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

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
    const colors = useThemedColors();

    const [syncing, setSyncing] = useState(false);
    const [progress, setProgress] = useState({ current: 0, total: 0, step: '' });
    const [completed, setCompleted] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [summary, setSummary] = useState({ timetablePeriods: 0, moodLogs: 0, journalEntries: 0, students: 0, total: 0 });

    useEffect(() => {
        if (isOpen) {
            // Load guest data summary
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

    return (
        <Modal isOpen={isOpen} onClose={handleSkip} size="lg">
            <ModalBackdrop />
            <ModalContent
                sx={{
                    backgroundColor: colors.secondary,
                    borderColor: colors.border,
                    borderWidth: 1,
                    maxWidth: 450
                }}
            >
                <ModalHeader>
                    <Heading color={colors.text} size="lg">
                        {completed ? '✨ ' : '☁️ '}
                        {completed
                            ? (t('sync.completeTitle') || 'Sync Complete!')
                            : (t('sync.title') || 'Sync Your Data')
                        }
                    </Heading>
                </ModalHeader>

                <ModalBody>
                    <VStack space="lg">
                        {!completed && !syncing && (
                            <>
                                <Text color={colors.textSecondary} size="sm">
                                    {t('sync.description') || 'We found data from your guest session. Would you like to sync it to your new account?'}
                                </Text>

                                {/* Data Summary */}
                                <Box
                                    sx={{
                                        backgroundColor: colors.tertiary,
                                        borderRadius: Theme.corners.comfortable,
                                        padding: Theme.spacing.md
                                    }}
                                >
                                    <VStack space="sm">
                                        {summary.timetablePeriods > 0 && (
                                            <HStack justifyContent="space-between">
                                                <Text color={colors.textSecondary} size="sm">Timetable Periods</Text>
                                                <Text color={colors.text} bold>{summary.timetablePeriods}</Text>
                                            </HStack>
                                        )}
                                        {summary.moodLogs > 0 && (
                                            <HStack justifyContent="space-between">
                                                <Text color={colors.textSecondary} size="sm">Mood Logs</Text>
                                                <Text color={colors.text} bold>{summary.moodLogs}</Text>
                                            </HStack>
                                        )}
                                        {summary.journalEntries > 0 && (
                                            <HStack justifyContent="space-between">
                                                <Text color={colors.textSecondary} size="sm">Journal Entries</Text>
                                                <Text color={colors.text} bold>{summary.journalEntries}</Text>
                                            </HStack>
                                        )}
                                        {summary.students > 0 && (
                                            <HStack justifyContent="space-between">
                                                <Text color={colors.textSecondary} size="sm">Students</Text>
                                                <Text color={colors.text} bold>{summary.students}</Text>
                                            </HStack>
                                        )}
                                        <Box sx={{ height: 1, backgroundColor: colors.border, marginVertical: 4 }} />
                                        <HStack justifyContent="space-between">
                                            <Text color={colors.text} bold size="sm">Total Items</Text>
                                            <Text color={Theme.colors.sanctuarySaffron} bold>{summary.total}</Text>
                                        </HStack>
                                    </VStack>
                                </Box>
                            </>
                        )}

                        {syncing && (
                            <VStack space="md" alignItems="center">
                                <Spinner size="large" color={Theme.colors.sanctuarySaffron} />
                                <Text color={colors.text} textAlign="center">
                                    {progress.step}
                                </Text>
                                <Text color={colors.textSecondary} size="xs">
                                    {progress.current} / {progress.total} items synced
                                </Text>
                                <Box
                                    sx={{
                                        width: '100%',
                                        height: 8,
                                        backgroundColor: colors.tertiary,
                                        borderRadius: 4,
                                        overflow: 'hidden'
                                    }}
                                >
                                    <Box
                                        sx={{
                                            width: `${(progress.current / progress.total) * 100}%`,
                                            height: '100%',
                                            backgroundColor: Theme.colors.sanctuarySaffron
                                        }}
                                    />
                                </Box>
                            </VStack>
                        )}

                        {completed && (
                            <VStack space="md" alignItems="center">
                                <Box
                                    sx={{
                                        width: 64,
                                        height: 64,
                                        borderRadius: 32,
                                        backgroundColor: Theme.colors.sanctuarySaffron + '20',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <Check size={32} color={Theme.colors.sanctuarySaffron} />
                                </Box>
                                <Text color={colors.text} textAlign="center" bold>
                                    {t('sync.successMessage') || 'All your data has been synced successfully!'}
                                </Text>
                                <Text color={colors.textSecondary} size="xs" textAlign="center">
                                    {t('sync.successDescription') || 'You can now access your data from any device.'}
                                </Text>
                            </VStack>
                        )}

                        {error && (
                            <Box
                                sx={{
                                    padding: Theme.spacing.md,
                                    backgroundColor: Theme.colors.emberRed + '20',
                                    borderRadius: Theme.corners.comfortable,
                                    borderWidth: 1,
                                    borderColor: Theme.colors.emberRed
                                }}
                            >
                                <HStack space="sm">
                                    <AlertCircle size={20} color={Theme.colors.emberRed} />
                                    <Text color={Theme.colors.emberRed} size="sm" sx={{ flex: 1 }}>
                                        {error}
                                    </Text>
                                </HStack>
                            </Box>
                        )}
                    </VStack>
                </ModalBody>

                <ModalFooter>
                    {!completed && (
                        <HStack space="md" sx={{ width: '100%' }}>
                            <Button
                                variant="outline"
                                onPress={handleSkip}
                                sx={{ flex: 1, borderColor: colors.border }}
                                isDisabled={syncing}
                            >
                                <ButtonText color={colors.textSecondary}>
                                    {t('common.skip') || 'Skip'}
                                </ButtonText>
                            </Button>
                            <Button
                                variant="solid"
                                onPress={handleSync}
                                sx={{ flex: 1, backgroundColor: Theme.colors.sanctuarySaffron }}
                                isDisabled={syncing}
                            >
                                {syncing ? (
                                    <Spinner size="small" color={Theme.colors.sacredWhite} />
                                ) : (
                                    <ButtonText color={Theme.colors.sacredWhite}>
                                        {t('sync.syncButton') || 'Sync Data'}
                                    </ButtonText>
                                )}
                            </Button>
                        </HStack>
                    )}
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
