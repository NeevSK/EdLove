/**
 * SectionHeadView Component
 * 
 * Section Overview for Section Heads
 * Displays Primary/Junior/Senior section
 */

import React from 'react';
import { Box, Text, Heading, VStack, Center, ScrollView, Spinner, HStack } from '@repo/ui';
import { Theme } from '@repo/ui';
import { useTranslation } from 'react-i18next';
import { GlobalHeader } from '@repo/ui';
import { useThemedColors } from '@repo/ui';
import RoleInitialState from '../components/RoleInitialState';
import { ScreenWrapper } from '@repo/ui';
import { useSchoolStats } from '../hooks/classroom/useSchoolStats';
import { Zap } from 'lucide-react-native';
import { useFeatureAccess } from '@repo/core';
import { SkeletonCard, PositiveInvitation } from '@repo/ui';
import { hapticLight } from '@repo/ui';

// Shared container styling for role-based views removed in favor of ScreenWrapper and useThemedColors

interface SectionHeadViewProps {
    schoolId?: string;
    userId?: string;
}

export default function SectionHeadView({ schoolId, userId }: SectionHeadViewProps) {
    const { t } = useTranslation();
    const colors = useThemedColors();
    const { isGuest } = useFeatureAccess();
    const { school, stats, isLoading } = useSchoolStats(schoolId || '');

    const hasData = stats && (stats.total_sections > 0 || stats.total_students > 0);

    return (
        <ScreenWrapper>
            <VStack sx={{ padding: 24, flex: 1, backgroundColor: colors.primary, gap: 24 }}>
                <GlobalHeader
                    title={t('role.section_head') || 'Section Overview'}
                    subtitle={school?.name}
                />

                {isLoading ? (
                    <VStack sx={{ gap: 16 }}>
                        <SkeletonCard height={100} />
                        <HStack sx={{ gap: 16 }}>
                            <SkeletonCard height={100} style={{ flex: 1 }} />
                            <SkeletonCard height={100} style={{ flex: 1 }} />
                        </HStack>
                        <SkeletonCard height={150} />
                    </VStack>
                ) : hasData ? (
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <VStack sx={{ gap: 24 }}>
                            {(stats as any).is_sample && (
                                <Box sx={{
                                    backgroundColor: Theme.colors.amberGlow + '22',
                                    padding: 12,
                                    borderRadius: Theme.corners.comfortable,
                                    borderWidth: 1,
                                    borderColor: Theme.colors.amberGlow,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 8,
                                    marginBottom: 8
                                }}>
                                    <Zap size={16} color={Theme.colors.amberGlow} fill={Theme.colors.amberGlow} />
                                    <Text sx={{ fontSize: 13, color: Theme.colors.amberGlow, fontWeight: '700' }}>
                                        {t('demoMode.sandboxPerspective') || "VISIONARY SANDBOX: Previewing potential institutional patterns"}
                                    </Text>
                                </Box>
                            )}

                            {/* Dashboard Stats (Simplified version of Principal view) */}
                            <HStack sx={{ gap: 16 }}>
                                <Box sx={{ flex: 1, padding: 16, backgroundColor: colors.secondary, borderRadius: Theme.corners.comfortable, borderLeftWidth: 4, borderLeftColor: colors.action }}>
                                    <Text color={colors.textTertiary} sx={{ fontSize: 12, fontWeight: '700' }}>{t('principal.stats.totalStudents') || 'Total Students'}</Text>
                                    <Text color={colors.text} sx={{ fontSize: 24, fontWeight: '700', marginTop: 4 }}>{stats.total_students}</Text>
                                </Box>
                                <Box sx={{ flex: 1, padding: 16, backgroundColor: colors.secondary, borderRadius: Theme.corners.comfortable, borderLeftWidth: 4, borderLeftColor: colors.success }}>
                                    <Text color={colors.textTertiary} sx={{ fontSize: 12, fontWeight: '700' }}>{t('principal.stats.activeClassrooms') || 'Active Classes'}</Text>
                                    <Text color={colors.text} sx={{ fontSize: 24, fontWeight: '700', marginTop: 4 }}>{stats.total_classrooms}</Text>
                                </Box>
                            </HStack>

                            <Box sx={{ padding: 24, backgroundColor: colors.secondary, borderRadius: Theme.corners.comfortable, alignItems: 'center', borderStyle: 'dashed', borderWidth: 1, borderColor: colors.border }}>
                                <Text color={colors.textTertiary} sx={{ textAlign: 'center' }}>
                                    {t('classroom.sectionDataRefinement') || "Detailed section analytics are being synchronized. Your departmental overview will appear here."}
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
                        role="section_head"
                        onCreatePress={() => {
                            console.log('Section Head creating first report/view');
                        }}
                        onSamplePress={(item) => {
                            console.log('Section Head Sample pressed:', item.title);
                        }}
                    />
                )}
            </VStack>
        </ScreenWrapper>
    );
}
