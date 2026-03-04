import React, { useState } from 'react';
import {
    Box,
    VStack,
    Heading,
    Text,
    Input,
    InputField,
    Pressable,
    Theme,
    hapticLight,
    PositiveInvitation,
    ScrollView
} from '@repo/ui';
import { supabase, useSafeMutation } from '@repo/core';
import { useDecisionJournal } from '../hooks/useDecisionJournal';
import { useNavigation } from '@react-navigation/native';

interface DecisionJournalSectionProps {
    userId: string | null;
    colors: any;
    t: any;
}

export default function DecisionJournalSection({ userId, colors, t }: DecisionJournalSectionProps) {
    const navigation = useNavigation<any>();
    const [decisionText, setDecisionText] = useState('');
    const { decisions, refreshData } = useDecisionJournal(userId ?? undefined);

    const { mutate, isLoading: isSaving } = useSafeMutation(
        async (text: string) => {
            const { error } = await supabase
                .from('decision_journals')
                .insert({
                    user_id: userId,
                    decision_text: text,
                    is_reviewed: false
                });
            if (error) {
                // Fallback if table doesn't exist yet
                if (error.code === '42P01') {
                    console.warn("Backend table missing, saving locally only.");
                    return;
                }
                throw error;
            }
        },
        {
            onSuccess: () => {
                hapticLight();
                setDecisionText('');
                refreshData();
            },
            retryCount: 3
        }
    );

    const handleSave = async () => {
        if (!userId || !decisionText.trim()) return;
        hapticLight();
        await mutate(decisionText.trim());
    };

    if (!userId) {
        return <PositiveInvitation type="guest" onAction={() => navigation.navigate('Auth' as never)} />;
    }

    return (
        <VStack space="md" sx={{ flex: 1 }}>
            <Box
                p={Theme.spacing.md}
                sx={{
                    backgroundColor: colors.tertiary,
                    borderRadius: Theme.corners.comfortable,
                    minHeight: 120
                }}
            >
                <Input sx={{ borderWidth: 0, flex: 1 }}>
                    <InputField
                        placeholder={t('principal.decisionPlaceholder') || t('self.decisionPlaceholder') || "What decision is weighing on you today?"}
                        multiline
                        color={colors.text}
                        placeholderTextColor={colors.textTertiary}
                        sx={{ textAlignVertical: 'top', minHeight: 100 }}
                        value={decisionText}
                        onChangeText={setDecisionText}
                    />
                </Input>
                <Box alignItems="flex-end" mt="$2">
                    <Pressable
                        onPress={handleSave}
                        disabled={!decisionText.trim() || isSaving}
                        sx={{
                            backgroundColor: decisionText.trim() ? colors.action : colors.border,
                            paddingHorizontal: Theme.spacing.md,
                            paddingVertical: Theme.spacing.xs,
                            borderRadius: Theme.corners.comfortable,
                            opacity: isSaving ? 0.7 : 1
                        }}
                    >
                        <Text color={Theme.colors.white} size="sm" bold>
                            {isSaving ? (t('common.saving') || "Saving...") : (t('common.save') || "Save")}
                        </Text>
                    </Pressable>
                </Box>
            </Box>

            <Heading size="sm" color={colors.textSecondary} mt="$4">
                {t('principal.recentDecisions') || t('self.recentDecisions') || "Recent Decisions"}
            </Heading>

            <ScrollView style={{ maxHeight: 300 }} nestedScrollEnabled>
                <VStack space="sm">
                    {decisions.map((decision) => (
                        <Box
                            key={decision.id}
                            p={Theme.spacing.md}
                            sx={{
                                backgroundColor: colors.secondary,
                                borderRadius: Theme.corners.comfortable,
                                borderLeftWidth: 3,
                                borderLeftColor: colors.action
                            }}
                        >
                            <Text color={colors.text} size="sm" numberOfLines={3}>
                                {decision.decision_text}
                            </Text>
                            <Text color={colors.textTertiary} size="xs" mt="$1">
                                {new Date(decision.created_at).toLocaleDateString()}
                            </Text>
                        </Box>
                    ))}
                    {decisions.length === 0 && (
                        <Text color={colors.textTertiary} size="sm" fontStyle="italic">
                            {t('principal.noDecisionsYet') || t('self.noDecisionsYet') || "No decisions logged yet."}
                        </Text>
                    )}
                </VStack>
            </ScrollView>
        </VStack>
    );
}
