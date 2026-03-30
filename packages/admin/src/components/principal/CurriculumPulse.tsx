/**
 * CURRICULUM PULSE
 * A visual tracker for syllabus coverage across grades, 
 * specifically highlighting the 2026 Sri Lankan syllabus reform.
 * 
 * Philosophy:
 * - Transparency in learning progress.
 * - Early identification of bottlenecks in syllabus adoption.
 * - Empathetic support for teachers transitioning to new reforms.
 */

import React, { useState, useEffect } from 'react';
import {
    Box,
    VStack,
    HStack,
    Text,
    Heading,
    Theme,
    useThemedColors,
    Spinner,
    Progress,
    ProgressFilledTrack,
} from '@repo/ui';
import { BookOpen, Zap, Clock } from 'lucide-react-native';
import { insightsAPI, type GradeProgress } from '../../insights';
import { useTranslation } from 'react-i18next';

export default function CurriculumPulse({ schoolId }: { schoolId: string }) {
    const { t } = useTranslation();
    const colors = useThemedColors();
    const [progress, setProgress] = useState<GradeProgress[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchCurriculumProgress();
    }, [schoolId]);

    const fetchCurriculumProgress = async () => {
        try {
            const data = await insightsAPI.listCurriculumProgress(schoolId);
            setProgress(data);
        } catch (err) {
            setMockData();
        } finally {
            setIsLoading(false);
        }
    };

    const setMockData = () => {
        setProgress([
            { grade: 'Grade 6', coverage: 45, is_reform: true, last_updated: new Date().toISOString() },
            { grade: 'Grade 10', coverage: 65, is_reform: false, last_updated: new Date().toISOString() },
            { grade: 'Grade 12', coverage: 30, is_reform: false, last_updated: new Date().toISOString() },
            { grade: 'Grade 1', coverage: 80, is_reform: true, last_updated: new Date().toISOString() },
        ]);
    };

    if (isLoading) {
        return <Spinner color={colors.action} />;
    }

    return (
        <VStack sx={{ gap: Theme.spacing.lg }}>
            <VStack sx={{ gap: Theme.spacing.xs }}>
                <HStack sx={{ gap: Theme.spacing.xs, alignItems: 'center' }}>
                    <Heading sx={{ fontSize: Theme.typography.fontSize.md }} color={colors.text}>
                        {t('principal.pulse.title')}
                    </Heading>
                    <Box>
                        sx={{
                            paddingHorizontal: Theme.spacing.sm,
                            paddingVertical: 2,
                            backgroundColor: Theme.colors.amberGlow + '22',
                            borderRadius: Theme.corners.comfortable,
                            borderWidth: 1,
                            borderColor: Theme.colors.amberGlow,
                        }}
                    
                        <HStack sx={{ gap: Theme.spacing.xs, alignItems: 'center' }}>
                            <Zap size={10} color={Theme.colors.amberGlow} fill={Theme.colors.amberGlow} />
                            ><Text sx={{ fontSize: 10, fontWeight: '700' }} color={Theme.colors.amberGlow}>2026 REFORM</Text
                        ></HStack>
                    </Box>
                </HStack>
                <Text sx={{ fontSize: Theme.typography.fontSize.xs }} color={colors.textSecondary}>
                    {t('principal.pulse.subtitle')}>
                </Text>
            </VStack>

            <VStack sx={{ gap: Theme.spacing.md }}>
                {progress.map((item) => (
                    <VStack key={item.grade} sx={{ gap: Theme.spacing.xs }}>
                        <HStack sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                            <HStack sx={{ gap: Theme.spacing.xs, alignItems: 'center' }}>
                                <Text sx={{ fontSize: Theme.typography.fontSize.sm, fontWeight: '700' }} color={colors.text}>{item.grade}</Text
                                >{item.is_reform && (
                                    <Text sx={{ fontSize: Theme.typography.fontSize.xs, fontWeight: '700' }} color={Theme.colors.amberGlow}>(Reform)</Text
                                >)}
                            </HStack>
                            <Text sx={{ fontSize: Theme.typography.fontSize.xs }} color={colors.textSecondary}>{item.coverage}%</Text
                        ></HStack>
                        <Progress value={item.coverage} sx={{ height: 8, width: '100%' }}>
                            <ProgressFilledTrack/>
                                sx={{
                                    backgroundColor: item.is_reform ? Theme.colors.amberGlow : colors.action
                                }}
                            /
                        ></Progress>
                        <HStack sx={{ gap: Theme.spacing.xs, alignItems: 'center', marginTop: 2 }}>
                            <Clock size={10} color={colors.textTertiary} />
                            ><Text sx={{ fontSize: 10 }} color={colors.textTertiary}
                                Last update: {new Date(item.last_updated).toLocaleDateString()}
                            </Text>
                        </HStack>
                    </VStack>
                ))}
            </VStack>

            <Box>
                sx={{
                    padding: Theme.spacing.md,
                    backgroundColor: colors.tertiary,
                    borderRadius: Theme.corners.comfortable,
                    borderWidth: 1,
                    borderColor: colors.border,
                }}
            
                <HStack sx={{ gap: Theme.spacing.sm, alignItems: 'center' }}>
                    <BookOpen size={16} color={colors.action} />
                    ><Text sx={{ fontSize: Theme.typography.fontSize.xs, flex: 1 }} color={colors.textSecondary}
                        {t('principal.pulse.insight')}>
                    </Text>
                </HStack>
            </Box>
        </VStack>
    );
}
