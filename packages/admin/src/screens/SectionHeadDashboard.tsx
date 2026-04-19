import React from 'react';
import {
    Box,
    Text,
    HStack,
    VStack,
    Icon,
    SanctuaryButton,
    ScreenWrapper,
    ScrollView,
    useRegisterFAB
} from '@repo/ui';
import { useStore } from '@repo/core';
import { useAIAgent } from '@repo/ai';
import { Calendar, Users, AlertCircle, CalendarCheck } from 'lucide-react-native';

export default function SectionHeadDashboard({ schoolId, userId }: { schoolId?: string; userId?: string }) {
    const { activeGaps, refreshStatus, generateTimetable, isThinking, lastTimetableDraft } = useAIAgent();
    const userRole = useStore((state: any) => state.userRole);

    // Register FAB globally
    useRegisterFAB({
        tabType: 'section',
        hasActiveGaps: activeGaps.length > 0,
        onPress: () => refreshStatus()
    });

    return (
        <ScreenWrapper className="bg-phase-canvas" noTopInset>
            <ScrollView contentContainerClassName="p-6 pb-24">
                <VStack className="gap-4">
                    {/* Header */}
                    <Box className="py-8">
                        <Text className="text-2xl font-bold text-phaseText-primary">
                            Section Coordination
                        </Text>
                        <Text className="text-phaseText-secondary">
                            Monitoring section activity and teacher coordination.
                        </Text>
                    </Box>

                    {/* Proactive Agent Notifications */}
                    {activeGaps.length > 0 && (
                        <VStack className="gap-3">
                            <Text className="font-semibold text-sm text-phase-warning">
                                AI SUGGESTIONS
                            </Text>
                            {activeGaps.map((gap: any) => (
                                <Box
                                    key={gap.id}
                                    className="p-4 rounded-lg border bg-phase-reward/10 border-phase-reward"
                                >
                                    <HStack className="gap-3 items-center">
                                        <Icon as={AlertCircle} className="text-phase-reward" size="md" />
                                        <VStack className="flex-1">
                                            <Text className="font-bold text-phaseText-primary">{gap.title}</Text>
                                            <Text className="text-sm text-phaseText-secondary">{gap.description}</Text>
                                        </VStack>
                                    </HStack>
                                    <Box className="mt-3">
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

                    {/* Agentic Structural Repair: Timetable */}
                    <Box 
                        className="p-6 rounded-3xl border mt-4 bg-phase-interactive/5 border-phase-interactive/20"
                    >
                        <HStack className="justify-between items-center mb-2">
                            <HStack className="gap-2 items-center">
                                <Icon as={CalendarCheck} size="md" className="text-phase-interactive" />
                                <Text className="font-bold text-phaseText-primary">Timetable Review</Text>
                            </HStack>
                            <Box 
                                className="px-2 py-0.5 rounded-full bg-phase-interactive/20"
                            >
                                <Text className="text-[10px] font-bold text-phase-interactive">AGENTIC</Text>
                            </Box>
                        </HStack>

                        {lastTimetableDraft ? (
                            <VStack className="gap-2">
                                <HStack className="gap-2 items-center">
                                    <Icon as={AlertCircle} size={16} className="text-phase-warning" />
                                    <Text className="text-[13px] text-phase-text-primary">
                                        Draft generated for your section.
                                    </Text>
                                </HStack>
                                <SanctuaryButton
                                    onPress={() => console.log('Reviewing draft')}
                                    variant="solid"
                                    size="sm"
                                >
                                    Review Section Draft
                                </SanctuaryButton>
                            </VStack>
                        ) : (
                            <VStack className="gap-4">
                                <Text className="text-phaseText-secondary">
                                    I can help you review and update the current schedule for this section.
                                </Text>
                                <SanctuaryButton
                                    onPress={() => generateTimetable('current-school')}
                                    action="primary"
                                    size="md"
                                    isLoading={isThinking}
                                >
                                    {isThinking ? 'Creating Draft...' : 'Create Schedule Draft'}
                                </SanctuaryButton>
                            </VStack>
                        )}
                    </Box>

                    {/* Operational Overview */}
                    <HStack className="gap-3">
                        <Box 
                            className="flex-1 p-4 rounded-xl border bg-phase-surface border-border"
                        >
                            <Text className="text-[10px] text-phaseText-secondary">CLASSES</Text>
                            <Text className="font-bold text-xl text-phaseText-primary">12</Text>
                        </Box>
                        <Box 
                            className="flex-1 p-4 rounded-xl border bg-phase-surface border-border"
                        >
                            <Text className="text-[10px] text-phaseText-secondary">TEACHERS</Text>
                            <Text className="font-bold text-xl text-phaseText-primary">8</Text>
                        </Box>
                    </HStack>

                    {/* Quick Coordination */}
                    <VStack className="gap-2">
                        <Text className="font-semibold text-sm text-phaseText-secondary">
                            QUICK COORDINATION
                        </Text>
                        <SanctuaryButton onPress={() => { }} variant="outline">
                            <HStack className="gap-2 items-center">
                                <Icon as={Calendar} size="sm" className="text-phaseText-primary" />
                                <Text className="text-phaseText-primary">Review Section Schedule</Text>
                            </HStack>
                        </SanctuaryButton>
                        <SanctuaryButton onPress={() => { }} variant="outline">
                            <HStack className="gap-2 items-center">
                                <Icon as={Users} size="sm" className="text-phaseText-primary" />
                                <Text className="text-phaseText-primary">Staff Workload Balance</Text>
                            </HStack>
                        </SanctuaryButton>
                    </VStack>
                </VStack>
            </ScrollView>
        </ScreenWrapper>
    );
}

