/**
 * GradeHeadView Component
 * 
 * Grade Overview for Grade Heads
 * Displays all classes in a specific grade
 */

import React from 'react';
import { Box, Text, Heading, VStack, Center, ScrollView, Spinner, HStack } from "@/ui";
import { Theme } from '../../constants/Theme';
import { useTranslation } from 'react-i18next';
import GlobalHeader from '../../components/shared/GlobalHeader';
import { useThemedColors } from '../../hooks/useThemedColors';
import RoleInitialState from '../../components/classroom/RoleInitialState';
import ScreenWrapper from '../../components/shared/ScreenWrapper';
import { useSchoolStats } from '../../hooks/classroom/useSchoolStats';
import { Zap } from 'lucide-react-native';
import { useFeatureAccess } from '../../hooks/useFeatureAccess';
import { SkeletonCard } from '../../components/shared/SkeletonLoader';
import PositiveInvitation from '../../components/shared/PositiveInvitation';
import { hapticLight } from '../../utils/haptics';

// Shared container styling for role-based views removed in favor of ScreenWrapper and useThemedColors

interface GradeHeadViewProps {
    schoolId?: string;
    userId?: string;
}

export default function GradeHeadView({ schoolId, userId }: GradeHeadViewProps) {
    const { t } = useTranslation();
    const colors = useThemedColors();
    const { isGuest } = useFeatureAccess();
    const { school, stats, isLoading } = useSchoolStats(schoolId || '');

    const hasData = stats && (stats.total_classrooms > 0 || stats.total_students > 0);

    return (
        <ScreenWrapper>
            <VStack space="lg" sx={{ padding: Theme.spacing.lg, flex: 1, backgroundColor: colors.primary }}>
                <GlobalHeader
                    title={t('role.grade_head') || 'Grade Overview'}
                    subtitle={school?.name}
                />

                {isLoading ? (
                    <VStack space="md">
                        <SkeletonCard height={100} />
                        <HStack space="md">
                            <SkeletonCard height={100} style={{ flex: 1 }} />
                            <SkeletonCard height={100} style={{ flex: 1 }} />
                        </HStack>
                        <SkeletonCard height={150} />
                    </VStack>
                ) : hasData ? (
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <VStack space="lg">
                            {(stats as any).is_sample && (
                                <Box sx={{
                                    backgroundColor: Theme.colors.amberGlow + '22',
                                    p: "$3",
                                    borderRadius: Theme.corners.comfortable,
                                    borderWidth: 1,
                                    borderColor: Theme.colors.amberGlow,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 8,
                                    mb: "$2"
                                }}>
                                    <Zap size={16} color={Theme.colors.amberGlow} fill={Theme.colors.amberGlow} />
                                    <Text sx={{ fontSize: 13, color: Theme.colors.amberGlow, fontWeight: '700' }}>
                                        {t('demoMode.sandboxPerspective') || "VISIONARY SANDBOX: Previewing potential institutional patterns"}
                                    </Text>
                                </Box>
                            )}

                            {/* Dashboard Stats */}
                            <HStack space="md">
                                <Box sx={{ flex: 1, p: "$4", bg: colors.secondary, borderRadius: Theme.corners.comfortable, borderLeftWidth: 4, borderLeftColor: colors.action }}>
                                    <Text size="xs" color={colors.textTertiary} bold>{t('principal.stats.totalStudents') || 'Total Students'}</Text>
                                    <Text size="2xl" color={colors.text} bold mt="$1">{stats.total_students}</Text>
                                </Box>
                                <Box sx={{ flex: 1, p: "$4", bg: colors.secondary, borderRadius: Theme.corners.comfortable, borderLeftWidth: 4, borderLeftColor: colors.success }}>
                                    <Text size="xs" color={colors.textTertiary} bold>{t('principal.stats.activeClassrooms') || 'Active Classes'}</Text>
                                    <Text size="2xl" color={colors.text} bold mt="$1">{stats.total_classrooms}</Text>
                                </Box>
                            </HStack>

                            <Box sx={{ p: "$6", bg: colors.secondary, borderRadius: Theme.corners.comfortable, alignItems: 'center', borderStyle: 'dashed', borderWidth: 1, borderColor: colors.border }}>
                                <Text color={colors.textTertiary} textAlign="center">
                                    {t('classroom.gradeDataRefinement') || "Grade-level metrics are being synchronized. Your academic coordination dashboard will appear here."}
                                </Text>
                            </Box>

                            {isGuest && (
                                <PositiveInvitation
                                    type="guest"
                                    onAction={() => {
                                        hapticLight();
                                        // TODO: Redirect to login/signup
                                    }}
                                />
                            )}
                        </VStack>
                    </ScrollView>
                ) : (
                    <RoleInitialState
                        role="grade_head"
                        onCreatePress={() => {
                            console.log('Grade Head creating first report/view');
                        }}
                        onSamplePress={(item) => {
                            console.log('Grade Head Sample pressed:', item.title);
                        }}
                    />
                )}
            </VStack>
        </ScreenWrapper>
    );
}
