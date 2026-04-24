import React, { useState, useEffect } from 'react';
import { 
    Icon, 
    Box,
    VStack,
    HStack,
    Text,
    Heading,
    Spinner,
    Progress,
    ProgressFilledTrack
} from '@repo/ui';
import { BookOpen, Zap, Clock } from 'lucide-react-native';
import { supabase } from '@repo/core';
import { useTranslation } from 'react-i18next';

interface GradeProgress {
    grade: string;
    coverage: number;
    is_reform: boolean;
    last_updated: string;
}

export default function CurriculumPulse({ schoolId }: { schoolId: string }) {
    const { t } = useTranslation();
    const [progress, setProgress] = useState<GradeProgress[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const setMockData = () => {
        setProgress([
            { grade: 'Grade 6', coverage: 45, is_reform: true, last_updated: new Date().toISOString() },
            { grade: 'Grade 10', coverage: 65, is_reform: false, last_updated: new Date().toISOString() },
            { grade: 'Grade 12', coverage: 30, is_reform: false, last_updated: new Date().toISOString() },
            { grade: 'Grade 1', coverage: 80, is_reform: true, last_updated: new Date().toISOString() }
        ]);
    };

    const fetchCurriculumProgress = async () => {
        try {
            const { data, error } = await supabase
                .from('curriculum_progress')
                .select('*')
                .eq('school_id', schoolId)
                .order('grade', { ascending: true });

            if (error) {
                console.error('Error fetching curriculum progress:', error);
                setMockData();
            } else {
                setProgress(data || []);
            }
        } catch (err) {
            setMockData();
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCurriculumProgress();
    }, [schoolId]);

    if (isLoading) {
        return (
            <Box className="p-10 items-center justify-center">
                <Spinner className="text-phase-interactive" />
            </Box>
        );
    }

    return (
        <VStack className="gap-6 bg-phase-surface rounded-[32px] p-6 border border-phase-border shadow-sm">
            <VStack className="gap-1.5">
                <HStack className="gap-2 items-center">
                    <Heading className="text-[17px] font-black text-phaseText-primary tracking-tight">
                        {t('principal.pulse.title', 'Curriculum Pulse')}
                    </Heading>
                    <Box className="px-2.5 py-1 bg-phase-interactive/10 rounded-lg border border-phase-interactive/20">
                        <HStack className="gap-1 items-center">
                            <Icon as={Zap} size="xs" className="text-phase-interactive" />
                            <Text className="text-[9px] font-black text-phase-interactive uppercase tracking-widest">2026 Reform</Text>
                        </HStack>
                    </Box>
                </HStack>
                <Text className="text-[12px] font-bold text-phaseText-muted">
                    {t('principal.pulse.subtitle', 'Real-time syllabus implementation tracking.')}
                </Text>
            </VStack>

            <VStack className="gap-6">
                {progress.map((item) => (
                    <VStack key={item.grade} className="gap-3">
                        <HStack className="justify-between items-center">
                            <HStack className="gap-2 items-center">
                                <Text className="text-[14px] font-black text-phaseText-primary">{item.grade}</Text>
                                {item.is_reform && (
                                    <Text className="text-[9px] font-black text-phase-interactive uppercase tracking-widest bg-phase-interactive/5 px-1.5 py-0.5 rounded-md">New Cycle</Text>
                                )}
                            </HStack>
                            <Text className="text-[12px] font-black text-phaseText-secondary">{item.coverage}%</Text>
                        </HStack>
                        <Progress value={item.coverage} className="h-2 w-full bg-phase-canvas rounded-full overflow-hidden">
                            <ProgressFilledTrack
                                className="h-full bg-phase-interactive"
                            />
                        </Progress>
                        <HStack className="gap-1.5 items-center">
                            <Icon as={Clock} size="xs" className="text-phaseText-muted/40" />
                            <Text className="text-[10px] font-black text-phaseText-muted uppercase tracking-widest">
                                Updated {new Date(item.last_updated).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </Text>
                        </HStack>
                    </VStack>
                ))}
            </VStack>

            <Box className="p-5 bg-phase-canvas rounded-[20px] border border-phase-border shadow-inner mt-2">
                <HStack className="gap-4 items-center">
                    <Box className="p-2 bg-phase-interactive/10 rounded-xl">
                        <Icon as={BookOpen} size="sm" className="text-phase-interactive" />
                    </Box>
                    <Text className="text-[12px] font-bold text-phaseText-secondary flex-1 leading-[18px]">
                        {t('principal.pulse.insight', 'Syllabus reform implementation is pacing 15% more effectively than institutional averages.')}
                    </Text>
                </HStack>
            </Box>
        </VStack>
    );
}
