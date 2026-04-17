import React, { useEffect, useState } from 'react';
import { Icon, Box, GlobalHeader, HStack, Heading, SanctuaryCard, ScreenWrapper, Text, Theme, VStack, sageGreen, sanctuarySaffron, useTheme, useThemedColors } from '@repo/ui';


import { Icon, FlatList, ActivityIndicator, StyleSheet } from 'react-native';

import { Shield, Clock, FileText, Lock } from 'lucide-react-native';
import { privacyAPI, type PrivacyLedgerEntry } from '@repo/core';

export default function PrivacyLedgerScreen() {
    const colors = useTheme().scene;
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
            <Box style={{ mb: Theme.spacing.sm }}>
                <SanctuaryCard>
                    <Box style={{ p: Theme.spacing.md }}>
                        <HStack space="md" alignItems="flex-start">
                            <Box style={{ p: '$2', borderRadius: '$full', backgroundColor: colors.tertiary }}>
                                <Icon as={Lock} size={18} color={sanctuarySaffron} />
                            </Box>
                            <VStack flex={1} space="xs">
                                <HStack justifyContent="space-between" alignItems="center">
                                    <Text size="sm" bold style={{ color: colors.text }}>{item.activity_type}</Text>
                                    <HStack space="xs" alignItems="center">
                                        <Icon as={Clock} size={12} color={colors.textTertiary} />
                                        <Text size="xs" style={{ color: colors.textTertiary }}>{time}</Text>
                                    </HStack>
                                </HStack>
                                <Text size="xs" style={{ color: colors.textSecondary }}>{item.description}</Text>
                                <HStack space="xs" alignItems="center" mt="$1">
                                    <Icon as={FileText} size={12} color={colors.textTertiary} />
                                    <Text size="xs" italic style={{ color: colors.textTertiary }}>{item.resource_name}</Text>
                                </HStack>
                            </VStack>
                        </HStack>
                    </Box>
                </SanctuaryCard>
            </Box>
        );
    };

    return (
        <ScreenWrapper scroll={false}>
            <GlobalHeader
                title="Privacy Ledger"
                subtitle="Your data activity journey"
                showBack
            />

            <Box style={{ flex: 1, p: Theme.spacing.md }}>
                <VStack space="md" mb="$4">
                    <HStack space="sm" alignItems="center">
                        <Icon as={Shield} size={20} color={sageGreen} />
                        <Heading size="sm">Transparency Circle</Heading>
                    </HStack>
                    <Text size="sm" style={{ color: colors.textSecondary }}>
                        Every time your data is accessed or security settings change, it's recorded here for your peace of mind.
                    </Text>
                </VStack>

                {loading ? (
                    <Box style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <Icon as={ActivityIndicator} color={sanctuarySaffron} />
                    </Box>
                ) : (
                    <FlatList
                        data={entries}
                        keyExtractor={item => item.id}
                        renderItem={renderEntry}
                        ListEmptyComponent={
                            <Box style={{ flex: 1, mt: 100, alignItems: 'center', justifyContent: 'center' }}>
                                <Text style={{ color: colors.textTertiary }}>No privacy events recorded yet.</Text>
                            </Box>
                        }
                        showsVerticalScrollIndicator={false}
                    />
                )}
            </Box>
        </ScreenWrapper>
    );
}
