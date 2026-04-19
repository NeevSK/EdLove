import React from 'react';
import { ScrollView, ActivityIndicator } from 'react-native';
import {
    Box,
    Text,
    HStack,
    VStack,
    SanctuaryButton,
    useRegisterFAB,
    ScreenWrapper,
    Pressable,
    Icon
} from '@repo/ui';
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
        <ScreenWrapper>
            <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 100 }}>
                <VStack className="gap-4">
                    {/* Header */}
                    <Box className="py-xl">
                        <Text className="text-2xl font-bold text-phaseText-primary">
                            Grade Coordination
                        </Text>
                        <Text className="text-phaseText-secondary">
                            Overview of grade status and teacher coordination.
                        </Text>
                    </Box>

                    {/* Proactive Agent Notifications */}
                    {activeGaps.length > 0 && (
                        <VStack className="gap-3">
                            <Text className="font-semibold text-sm text-phase-accent uppercase">
                                AI SUGGESTIONS
                            </Text>
                            {activeGaps.map((gap: any) => (
                                <Box
                                    key={gap.id}
                                    className="p-md rounded-lg bg-phase-accent/10 border border-phase-accent"
                                >
                                    <HStack className="gap-3 items-center">
                                        <Icon as={AlertCircle} className="text-phase-accent" size="lg" />
                                        <VStack className="flex-1">
                                            <Text className="font-bold text-phaseText-primary">{gap.title}</Text>
                                            <Text className="text-sm text-phaseText-secondary">{gap.description}</Text>
                                        </VStack>
                                    </HStack>
                                    <Box className="mt-3">
                                        <SanctuaryButton
                                            onPress={() => console.log('Executing relief:', gap.suggestedAction)}
                                            size="sm"
                                        >
                                            <Text className="text-white font-bold">Assign Relief Teacher</Text>
                                        </SanctuaryButton>
                                    </Box>
                                </Box>
                            ))}
                        </VStack>
                    )}

                    {/* Operational Overview */}
                    <HStack className="gap-3">
                        <Box className="flex-1 p-md rounded-xl bg-phase-surface border border-phase-border">
                            <Text className="text-[10px] text-phaseText-muted uppercase tracking-wider">CLASSES</Text>
                            <Text className="font-bold text-xl text-phaseText-primary mt-1">5</Text>
                        </Box>
                        <Box className="flex-1 p-md rounded-xl bg-phase-surface border border-phase-border">
                            <Text className="text-[10px] text-phaseText-muted uppercase tracking-wider">STUDENTS</Text>
                            <Text className="font-bold text-xl text-phaseText-primary mt-1">210</Text>
                        </Box>
                    </HStack>

                    {/* Quick Coordination */}
                    <VStack className="gap-2">
                        <Text className="font-semibold text-sm text-phaseText-secondary uppercase">
                            GRADE MANAGEMENT
                        </Text>
                        <SanctuaryButton onPress={() => { }} variant="outline">
                            <HStack className="gap-2 items-center">
                                <Icon as={BookOpen} size="md" className="text-phaseText-primary" />
                                <Text className="text-phaseText-primary">Curriculum Alignment Pulse</Text>
                            </HStack>
                        </SanctuaryButton>
                        <SanctuaryButton onPress={() => { }} variant="outline">
                            <HStack className="gap-2 items-center">
                                <Icon as={Users} size="md" className="text-phaseText-primary" />
                                <Text className="text-phaseText-primary">Student Wellbeing Reports</Text>
                            </HStack>
                        </SanctuaryButton>
                    </VStack>
                </VStack>
            </ScrollView>
        </ScreenWrapper>
    );
}

