import React from 'react';
import { Icon, View, StyleSheet, ScrollView } from 'react-native';
import {
    Box,
    Text,
    HStack,
    VStack,
    
    SanctuaryButton,
    useRegisterFAB,
    ScreenWrapper } from '@repo/ui';
import { useStore } from '@repo/core';
import { useAIAgent } from '@repo/ai';
import { BookOpen, Users, AlertCircle } from 'lucide-react-native';

export default function GradeHeadDashboard({ schoolId, userId }: { schoolId?: string; userId?: string }) {
    const { activeGaps, refreshStatus } = useAIAgent();
    const userRole = useStore((state: any) => state.userRole);

    // Register FAB globally
    useRegisterFAB({
        tabType: 'grade',
        hasActiveGaps: activeGaps.length > 0,
        onPress: () => refreshStatus()
    });

    return (
        <ScreenWrapper backgroundColor={'#2A2318'}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <VStack gap="$4">
                    {/* Header */}
                    <Box sx={{ paddingVertical: '$xl' as any }}>
                        <Text sx={{
                            fontSize: '$2xl' as any,
                            fontWeight: '700',
                            color: sacredWhite
                        }}>
                            Grade Coordination
                        </Text>
                        <Text sx={{ color: starlightGray }}>
                            Overview of grade status and teacher coordination.
                        </Text>
                    </Box>

                    {/* Proactive Agent Notifications */}
                    {activeGaps.length > 0 && (
                        <VStack gap="$3">
                            <Text sx={{ fontWeight: '600', fontSize: '$sm' as any, color: sanctuarySaffron }}>
                                AI SUGGESTIONS
                            </Text>
                            {activeGaps.map((gap: any) => (
                                <Box
                                    key={gap.id}
                                    sx={{
                                        padding: '$md' as any,
                                        borderRadius: '$lg' as any,
                                        backgroundColor: 'rgba(230, 126, 34, 0.1)',
                                        borderWidth: 1,
                                        borderColor: sanctuarySaffron
                                    }}
                                >
                                    <HStack gap="$3" alignItems="center">
                                        <AlertCircle color={sanctuarySaffron} size={20} />
                                        <VStack sx={{ flex: 1 }}>
                                            <Text sx={{ fontWeight: '700', color: sacredWhite }}>{gap.title}</Text>
                                            <Text sx={{ fontSize: '$sm' as any, color: starlightGray }}>{gap.description}</Text>
                                        </VStack>
                                    </HStack>
                                    <Box sx={{ marginTop: '$3' as any }}>
                                        <SanctuaryButton
                                            onPress={() => console.log('Executing relief:', gap.suggestedAction)}
                                            size="sm"
                                            variant="solid"
                                        >
                                            Assign Relief Teacher
                                        </SanctuaryButton>
                                    </Box>
                                </Box>
                            ))}
                        </VStack>
                    )}

                    {/* Operational Overview */}
                    <HStack gap="$3">
                        <Box sx={styles.statBox}>
                            <Text sx={{ fontSize: '$xs' as any, color: starlightGray }}>CLASSES</Text>
                            <Text sx={{ fontWeight: '700', fontSize: '$xl' as any, color: sacredWhite }}>5</Text>
                        </Box>
                        <Box sx={styles.statBox}>
                            <Text sx={{ fontSize: '$xs' as any, color: starlightGray }}>STUDENTS</Text>
                            <Text sx={{ fontWeight: '700', fontSize: '$xl' as any, color: sacredWhite }}>210</Text>
                        </Box>
                    </HStack>

                    {/* Quick Coordination */}
                    <VStack gap="$2">
                        <Text sx={{ fontWeight: '600', fontSize: '$sm' as any, color: starlightGray }}>
                            GRADE MANAGEMENT
                        </Text>
                        <SanctuaryButton onPress={() => { }} variant="outline">
                            <HStack gap="$2" alignItems="center">
                                <Icon as={Book}Open size={18} color={sacredWhite} />
                                <Text sx={{ color: sacredWhite }}>Curriculum Alignment Pulse</Text>
                            </HStack>
                        </SanctuaryButton>
                        <SanctuaryButton onPress={() => { }} variant="outline">
                            <HStack gap="$2" alignItems="center">
                                <Icon as={User}s size={18} color={sacredWhite} />
                                <Text sx={{ color: sacredWhite }}>Student Wellbeing Reports</Text>
                            </HStack>
                        </SanctuaryButton>
                    </VStack>
                </VStack>
            </ScrollView>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        padding: Theme.spacing.lg,
        paddingBottom: 100},
    statBox: {
        flex: 1,
        padding: Theme.spacing.md,
        borderRadius: Theme.corners.comfortable,
        backgroundColor: shroud,
        borderWidth: 1,
        borderColor: '#E8E2CF'}
});
