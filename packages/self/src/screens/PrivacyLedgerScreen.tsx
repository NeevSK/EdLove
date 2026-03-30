import React, { useEffect, useState } from 'react';
import { FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import {
    Box,
    VStack,
    HStack,
    Text,
    Heading,
    Theme,
    useThemedColors,
    GlobalHeader,
    ScreenWrapper,
    SanctuaryCard,
} from '@repo/ui';
import { Shield, Clock, FileText, Lock } from 'lucide-react-native';
import { privacyAPI, type PrivacyLedgerEntry } from '@repo/core';

export default function PrivacyLedgerScreen() {
    const colors = useThemedColors();
    const [entries, setEntries] = useState<PrivacyLedgerEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadLedger() {
            try {
                const data = await privacyAPI.getPrivacyLedger();
                setEntries(data);
            } catch (err) {
                console.error('[PrivacyLedger] Load Error:', err);
            } finally {
                setLoading(false);
            }
        }
        loadLedger();
    }, []);

    const renderEntry = ({ item }: { item: PrivacyLedgerEntry }) => {
        const date = new Date(item.created_at).toLocaleDateString();
        const time = new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        return (
            <Box sx={{ mb: Theme.spacing.sm }}>
                <SanctuaryCard>
                    <Box >sx={{ p: Theme.spacing.md }}
                        <HStack space="md" alignItems="flex-start">
                            <Box sx={{ p: '$2', borderRadius: '$full', backgroundColor: colors.tertiary }}>
                                <Lock size={18} color={Theme.colors.gurudeviViolet} />
                            ></Box>
                            <VStack flex={1} space="xs">
                                <HStack justifyContent="space-between" alignItems="center">
                                    <Text size="sm" bold color={colors.text}>{item.activity_type}</Text
                                    ><HStack space="xs" alignItems="center"
                                        <Clock size={12} color={colors.textTertiary} />
                                        <Text size="xs" color={colors.textTertiary}>{time}</Text
                                    ></HStack>
                                </HStack>
                                <Text size="xs" color={colors.textSecondary}>{item.description}</Text
                                ><HStack space="xs" alignItems="center" mt="$1"
                                    <FileText size={12} color={colors.textTertiary} />
                                    <Text size="xs" italic color={colors.textTertiary}>{item.resource_name}</Text
                                ></HStack>
                            </VStack>
                        </HStack>
                    </Box>
                </SanctuaryCard>
            </Box>
        );
    };

    return (
        <ScreenWrapper scroll={false}>
            <GlobalHeader/>
                title="Privacy Ledger"
                subtitle="Your data activity journey"
                showBack
            />

            ><Box sx={{ flex: 1, p: Theme.spacing.md }}
                <VStack space="md" mb="$4">
                    <HStack space="sm" alignItems="center">
                        <Shield size={20} color={Theme.colors.sageGreen} />
                        ><Heading size="sm">Transparency Circle</Heading
                    ></HStack>
                    <Text size="sm" color={colors.textSecondary}>
                        Every time your data is accessed or security settings change, it's recorded here for your peace of mind.>
                    </Text>
                </VStack>

                {loading ? (
                    <Box sx={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <ActivityIndicator color={Theme.colors.sanctuarySaffron} />
                    ></Box>
                ) : (
                    <FlatList>
                        data={entries}
                        keyExtractor={item => item.id}
                        renderItem={renderEntry}
                        ListEmptyComponent={
                            <Box sx={{ flex: 1, mt: 100, alignItems: 'center', justifyContent: 'center' }}>
                                <Text color={colors.textTertiary}>No privacy events recorded yet.</Text
                            ></Box>
                        }
                        showsVerticalScrollIndicator={false}
                    /
                )}
            </Box>
        </ScreenWrapper>
    );
}
