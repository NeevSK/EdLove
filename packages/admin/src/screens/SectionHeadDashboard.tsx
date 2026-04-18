import React from 'react';
import { ScrollView } from 'react-native';
import {
    Box,
    Text,
    HStack,
    VStack,
    Icon,
    SanctuaryButton,
    ScreenWrapper,
    useRegisterFAB,
    useThemedColors,
    useTheme,
    Theme
} from '@repo/ui';
import { useStore } from '@repo/core';
import { useAIAgent } from '@repo/ai';
import { Calendar, Users, AlertCircle, CalendarCheck } from 'lucide-react-native';

export default function SectionHeadDashboard({ schoolId, userId }: { schoolId?: string; userId?: string }) {
    const { activeGaps, refreshStatus, generateTimetable, isThinking, lastTimetableDraft } = useAIAgent();
    const userRole = useStore((state: any) => state.userRole);
    const colors = useThemedColors();
    const theme = useTheme();

    // Register FAB globally
    useRegisterFAB({
        tabType: 'section',
        hasActiveGaps: activeGaps.length > 0,
        onPress: () => refreshStatus()
    });

    return (
        <ScreenWrapper backgroundColor={colors.primary}>
            <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 100 }}>
                <VStack className="gap-4">
                    {/* Header */}
                    <Box className="py-8">
                        <Text className="text-2xl font-bold" style={{ color: theme.text.primary }}>
                            Section Coordination
                        </Text>
                        <Text style={{ color: theme.text.secondary }}>
                            Monitoring section activity and teacher coordination.
                        </Text>
                    </Box>

                    {/* Proactive Agent Notifications */}
                    {activeGaps.length > 0 && (
                        <VStack className="gap-3">
                            <Text className="font-semibold text-sm" style={{ color: colors.warning }}>
                                AI SUGGESTIONS
                            </Text>
                            {activeGaps.map((gap: any) => (
                                <Box
                                    key={gap.id}
                                    className="p-4 rounded-lg border"
                                    style={{
                                        backgroundColor: colors.warning + '11',
                                        borderColor: colors.warning
                                    }}
                                >
                                    <HStack className="gap-3 items-center">
                                        <Icon as={AlertCircle} color={colors.warning} size="md" />
                                        <VStack className="flex-1">
                                            <Text className="font-bold" style={{ color: theme.text.primary }}>{gap.title}</Text>
                                            <Text className="text-sm" style={{ color: theme.text.secondary }}>{gap.description}</Text>
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
                        className="p-6 rounded-3xl border mt-4"
                        style={{
                            backgroundColor: colors.action + '0D', // 0.05 opacity approx
                            borderColor: colors.action + '33'    // 0.2 opacity approx
                        }}
                    >
                        <HStack className="justify-between items-center mb-2">
                            <HStack className="gap-2 items-center">
                                <Icon as={CalendarCheck} size="md" color={colors.action} />
                                <Text className="font-bold" style={{ color: theme.text.primary }}>Timetable Review</Text>
                            </HStack>
                            <Box 
                                className="px-2 py-0.5 rounded-full"
                                style={{ backgroundColor: colors.action + '33' }}
                            >
                                <Text className="text-[10px] font-bold" style={{ color: colors.action }}>AGENTIC</Text>
                            </Box>
                        </HStack>

                        {lastTimetableDraft ? (
                            <VStack className="gap-2">
                                <HStack className="gap-2 items-center">
                                    <AlertCircle size={16} color={colors.warning} />
                                    <Text className="text-[13px]" style={{ color: theme.text.primary }}>
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
                                <Text style={{ color: theme.text.secondary }}>
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
                            className="flex-1 p-4 rounded-xl border"
                            style={{ 
                                backgroundColor: colors.secondary,
                                borderColor: colors.border
                            }}
                        >
                            <Text className="text-[10px]" style={{ color: theme.text.secondary }}>CLASSES</Text>
                            <Text className="font-bold text-xl" style={{ color: theme.text.primary }}>12</Text>
                        </Box>
                        <Box 
                            className="flex-1 p-4 rounded-xl border"
                            style={{ 
                                backgroundColor: colors.secondary,
                                borderColor: colors.border
                            }}
                        >
                            <Text className="text-[10px]" style={{ color: theme.text.secondary }}>TEACHERS</Text>
                            <Text className="font-bold text-xl" style={{ color: theme.text.primary }}>8</Text>
                        </Box>
                    </HStack>

                    {/* Quick Coordination */}
                    <VStack className="gap-2">
                        <Text className="font-semibold text-sm" style={{ color: theme.text.secondary }}>
                            QUICK COORDINATION
                        </Text>
                        <SanctuaryButton onPress={() => { }} variant="outline">
                            <HStack className="gap-2 items-center">
                                <Icon as={Calendar} size="sm" color={theme.text.primary} />
                                <Text style={{ color: theme.text.primary }}>Review Section Schedule</Text>
                            </HStack>
                        </SanctuaryButton>
                        <SanctuaryButton onPress={() => { }} variant="outline">
                            <HStack className="gap-2 items-center">
                                <Icon as={Users} size="sm" color={theme.text.primary} />
                                <Text style={{ color: theme.text.primary }}>Staff Workload Balance</Text>
                            </HStack>
                        </SanctuaryButton>
                    </VStack>
                </VStack>
            </ScrollView>
        </ScreenWrapper>
    );
}

