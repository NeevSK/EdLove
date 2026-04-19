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
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            <VStack className="gap-6 p-4">
                <Pressable onPress={onBack} className="active:opacity-70">
                    <HStack className="items-center gap-2 bg-white/50 self-start px-4 py-2 rounded-xl border border-border">
                        <Icon as={ArrowLeft} size="sm" className="text-ink" />
                        <Text className="text-sm font-bold text-ink">Back to Dashboard</Text>
                    </HStack>
                </Pressable>

                <VStack className="gap-1">
                    <Heading className="text-2xl font-black text-ink">System Hierarchy</Heading>
                    <Text className="text-sm text-ink/60">
                        Grades, sections and class structure for your school.
                    </Text>
                </VStack>
                
                <Box className={`bg-white p-5 rounded-3xl border border-border gap-4 ${isPastView ? 'opacity-60' : ''}`}>
                    <Heading className="text-xs font-black uppercase tracking-widest text-ink/40">Add Section</Heading>
                    
                    <HStack className="gap-3 flex-wrap">
                        <FormControl className="flex-1 min-w-[140px]">
                            <Input className="h-12 rounded-2xl">
                                <InputField 
                                    value={newSectionGrade} 
                                    onChangeText={setNewSectionGrade}
                                    disabled={isPastView} 
                                    placeholder="Grade (e.g. 8)" 
                                />
                            </Input>
                        </FormControl>

                        <FormControl className="flex-1 min-w-[140px]">
                            <Input className="h-12 rounded-2xl">
                                <InputField 
                                    value={newSectionName} 
                                    onChangeText={setNewSectionName}
                                    disabled={isPastView} 
                                    placeholder="Name (e.g. 8A)" 
                                />
                            </Input>
                        </FormControl>

                        <Button 
                            onPress={handleCreateSection} 
                            isDisabled={!newSectionName.trim() || saving || isPastView} 
                            className="bg-primary rounded-2xl h-12 shadow-sm active:scale-95 px-5"
                        >
                            {saving ? (
                                <ButtonText>...</ButtonText>
                            ) : (
                                <>
                                    <ButtonIcon as={Plus} className="mr-2" />
                                    <ButtonText>Add</ButtonText>
                                </>
                            )}
                        </Button>
                    </HStack>
                </Box>

                {loading ? (
                    <VStack className="gap-3">
                        <SkeletonCard height={80} />
                        <SkeletonCard height={80} />
                    </VStack>
                ) : sections.length === 0 ? (
                    <Box className="p-10 items-center justify-center bg-ink/5 rounded-3xl border border-dashed border-border">
                        <Text className="text-ink/40 italic font-bold">No sections yet.</Text>
                    </Box>
                ) : (
                    <HStack className="flex-wrap gap-3">
                        {sections.map(s => (
                            <Box 
                                key={s.id} 
                                className="bg-white p-5 rounded-3xl border border-border border-l-4 border-l-primary min-w-[160px] flex-1"
                            >
                                <VStack className="gap-1">
                                    <Text className="font-extrabold text-lg text-ink">{s.name}</Text>
                                    {s.grade && (
                                        <HStack className="items-center gap-1.5">
                                            <Icon as={Castle} size={12} className="text-ink/40" />
                                            <Text className="text-xs text-ink/60 font-medium">Grade {s.grade}</Text>
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
