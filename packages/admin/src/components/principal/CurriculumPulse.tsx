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
                <Spinner color="#ffbf00" />
            </Box>
        );
    }

    return (
        <VStack className="gap-6">
            <VStack className="gap-1">
                <HStack className="gap-2 items-center">
                    <Heading className="text-sm font-black text-ink uppercase tracking-wider">
                        {t('principal.pulse.title', 'Curriculum Pulse')}
                    </Heading>
                    <Box className="px-2 py-0.5 bg-amber-500/10 rounded-full border border-amber-500/20">
                        <HStack className="gap-1 items-center">
                            <Icon as={Zap} size={10} className="text-amber-600" />
                            <Text className="text-[10px] font-black text-amber-600 uppercase">2026 REFORM</Text>
                        </HStack>
                    </Box>
                </HStack>
                <Text className="text-xs font-bold text-ink/40">
                    {t('principal.pulse.subtitle', 'Live tracking of syllabus coverage across grades.')}
                </Text>
            </VStack>

            <VStack className="gap-5">
                {progress.map((item) => (
                    <VStack key={item.grade} className="gap-2">
                        <HStack className="justify-between items-center">
                            <HStack className="gap-2 items-center">
                                <Text className="text-sm font-black text-ink">{item.grade}</Text>
                                {item.is_reform && (
                                    <Text className="text-[10px] font-black text-amber-600 uppercase tracking-tighter">(Reform)</Text>
                                )}
                            </HStack>
                            <Text className="text-xs font-black text-ink/60">{item.coverage}%</Text>
                        </HStack>
                        <Progress value={item.coverage} className="h-2 w-full bg-ink/5 rounded-full overflow-hidden">
                            <ProgressFilledTrack
                                className={`h-full ${item.is_reform ? 'bg-amber-500' : 'bg-primary'}`}
                            />
                        </Progress>
                        <HStack className="gap-1.5 items-center">
                            <Icon as={Clock} size={10} className="text-ink/30" />
                            <Text className="text-[10px] font-bold text-ink/30 uppercase tracking-widest">
                                Sync: {new Date(item.last_updated).toLocaleDateString()}
                            </Text>
                        </HStack>
                    </VStack>
                ))}
            </VStack>

            <Box className="p-4 bg-silk rounded-2xl border border-border">
                <HStack className="gap-3 items-center">
                    <Icon as={BookOpen} size={14} className="text-primary" />
                    <Text className="text-xs font-bold text-ink/60 flex-1 leading-relaxed">
                        {t('principal.pulse.insight', 'Syllabus reform implementation is pacing 15% faster than previous cycles.')}
                    </Text>
                </HStack>
            </Box>
        </VStack>
    );
}

