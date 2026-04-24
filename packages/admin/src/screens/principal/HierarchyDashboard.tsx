import React, { useEffect, useState } from 'react';
import { 
    Box, 
    VStack, 
    HStack, 
    Text, 
    Heading, 
    Icon, 
    Button,
    ButtonText,
    ButtonIcon,
    Input,
    InputField,
    FormControl,
    ScrollView,
    SkeletonCard,
    hapticSuccess,
    hapticLight,
    Pressable
} from '@repo/ui';
import { sectionsAPI, type SchoolSectionRow } from '../../sections';
import { ArrowLeft, Plus, Castle } from 'lucide-react-native';


interface HierarchyDashboardProps {
    schoolId: string;
    isPastView: boolean;
    onBack: () => void;
}

export const HierarchyDashboard: React.FC<HierarchyDashboardProps> = ({ schoolId, isPastView, onBack }) => {
    const [sections, setSections] = useState<SchoolSectionRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [newSectionName, setNewSectionName] = useState('');
    const [newSectionGrade, setNewSectionGrade] = useState('');

    const loadSections = async () => {
        if (!schoolId) return;
        setLoading(true);
        try {
            const data = await sectionsAPI.listSchoolSections(schoolId);
            setSections(data ?? []);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSections();
    }, [schoolId]);

    const handleCreateSection = async () => {
        if (!newSectionName.trim()) return;
        setSaving(true);
        try {
            const data = await sectionsAPI.createSchoolSection({
                schoolId,
                name: newSectionName,
                grade: newSectionGrade
            });
            setSections(prev => [...prev, data]);
            setNewSectionName(''); 
            setNewSectionGrade('');
            hapticSuccess();
        } catch (err) {
            console.error('Failed to create section:', err);
        } finally {
            setSaving(false);
        }
    };

    return (
        <ScrollView className="flex-1 bg-phase-canvas" showsVerticalScrollIndicator={false}>
            <VStack className="gap-8 p-5">
                <Pressable onPress={() => { hapticLight(); onBack(); }} className="active:scale-95 transition-all">
                    <HStack className="items-center gap-2 bg-phase-surface self-start px-5 py-2.5 rounded-2xl border border-phase-border shadow-sm">
                        <Icon as={ArrowLeft} size="sm" className="text-phaseText-primary" />
                        <Text className="text-[13px] font-black text-phaseText-primary uppercase tracking-wider">Dashboard</Text>
                    </HStack>
                </Pressable>

                <VStack className="gap-1.5">
                    <Heading className="text-3xl font-black text-phaseText-primary tracking-tighter">System Hierarchy</Heading>
                    <Text className="text-[14px] font-bold text-phaseText-muted uppercase tracking-widest">
                        Governance structure & class taxonomy
                    </Text>
                </VStack>
                
                <Box className={`bg-phase-surface p-6 rounded-3xl border border-phase-border gap-5 shadow-sm ${isPastView ? 'opacity-60' : ''}`}>
                    <Heading className="text-[11px] font-black uppercase tracking-[0.2em] text-phaseText-muted">Initialize New Tier</Heading>
                    
                    <HStack className="gap-3 flex-wrap">
                        <FormControl className="flex-1 min-w-[140px]">
                            <Input className="h-14 rounded-2xl bg-phase-canvas border-phase-border shadow-inner">
                                <InputField 
                                    value={newSectionGrade} 
                                    onChangeText={setNewSectionGrade}
                                    readOnly={isPastView} 
                                    placeholder="Grade (e.g. 8)" 
                                    placeholderTextColor="rgba(0,0,0,0.2)"
                                    className="font-bold text-phaseText-primary"
                                />
                            </Input>
                        </FormControl>

                        <FormControl className="flex-1 min-w-[140px]">
                            <Input className="h-14 rounded-2xl bg-phase-canvas border-phase-border shadow-inner">
                                <InputField 
                                    value={newSectionName} 
                                    onChangeText={setNewSectionName}
                                    readOnly={isPastView} 
                                    placeholder="Section (e.g. 8A)" 
                                    placeholderTextColor="rgba(0,0,0,0.2)"
                                    className="font-bold text-phaseText-primary"
                                />
                            </Input>
                        </FormControl>

                        <Button 
                            onPress={() => { hapticLight(); handleCreateSection(); }} 
                            isDisabled={!newSectionName.trim() || saving || isPastView} 
                            className="bg-phase-interactive rounded-2xl h-14 shadow-sm active:scale-95 px-6"
                        >
                            {saving ? (
                                <ButtonText className="font-black">...</ButtonText>
                            ) : (
                                <>
                                    <ButtonIcon as={Plus} className="text-white" />
                                    <ButtonText className="font-black uppercase tracking-widest text-white ml-2">Add</ButtonText>
                                </>
                            )}
                        </Button>
                    </HStack>
                </Box>

                {loading ? (
                    <VStack className="gap-4">
                        <SkeletonCard height={90} className="rounded-3xl" />
                        <SkeletonCard height={90} className="rounded-3xl" />
                        <SkeletonCard height={90} className="rounded-3xl" />
                    </VStack>
                ) : sections.length === 0 ? (
                    <Box className="p-12 items-center justify-center bg-phase-canvas rounded-3xl border border-dashed border-phase-border">
                        <Text className="text-phaseText-muted italic font-black text-sm uppercase tracking-widest">No active modules found</Text>
                    </Box>
                ) : (
                    <HStack className="flex-wrap gap-4">
                        {sections.map(s => (
                            <Box 
                                key={s.id} 
                                className="bg-phase-surface p-6 rounded-3xl border border-phase-border border-l-[6px] border-l-phase-interactive min-w-[160px] flex-1 shadow-sm active:scale-98 transition-all"
                            >
                                <VStack className="gap-1.5">
                                    <Text className="font-black text-xl text-phaseText-primary tracking-tight">{s.name}</Text>
                                    {s.grade && (
                                        <HStack className="items-center gap-2">
                                            <Icon as={Castle} size="xs" className="text-phase-interactive" />
                                            <Text className="text-[12px] text-phaseText-muted font-bold uppercase tracking-widest">Grade {s.grade}</Text>
                                        </HStack>
                                    )}
                                </VStack>
                            </Box>
                        ))}
                    </HStack>
                )}
            </VStack>
        </ScrollView>
    );
};

export type { HierarchyDashboardProps };
