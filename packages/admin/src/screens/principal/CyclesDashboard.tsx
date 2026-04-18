import React, { useState, useEffect } from 'react';
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
    FormControlLabel,
    FormControlLabelText,
    ScrollView,
    SkeletonCard
} from '@repo/ui';
import { api } from '@repo/core';
import { ArrowLeft, Plus, Calendar } from 'lucide-react-native';
import { TouchableOpacity } from 'react-native';

interface CyclesDashboardProps {
    schoolId: string;
    isPastView: boolean;
    onBack: () => void;
}

export const CyclesDashboard: React.FC<CyclesDashboardProps> = ({ schoolId, isPastView, onBack }) => {
    const [academicCycles, setAcademicCycles] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [newName, setNewName] = useState('');
    const [newStart, setNewStart] = useState('');
    const [newEnd, setNewEnd] = useState('');
    const [saving, setSaving] = useState(false);

    const loadAcademicCycles = async () => {
        if (!schoolId) return;
        setLoading(true);
        try {
            const data = await api.academicCycles.getAll(schoolId);
            setAcademicCycles(data || []);
        } catch (err) {
            console.error('Failed to load academic cycles:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAcademicCycles();
    }, [schoolId]);

    const handleCreateCycle = async () => {
        if (!newName.trim() || !newStart || !schoolId) return;
        setSaving(true);
        try {
            const cycle = await api.academicCycles.create({ 
                name: newName.trim(), 
                school_id: schoolId, 
                start_date: newStart, 
                end_date: newEnd || undefined, 
                status: 'upcoming' 
            } as any);
            setAcademicCycles(prev => [cycle, ...prev]);
            setNewName(''); 
            setNewStart(''); 
            setNewEnd('');
        } catch (err) {
            console.error('Failed to create academic cycle:', err);
        } finally {
            setSaving(false);
        }
    };

    return (
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            <VStack className="gap-6 p-4">
                <TouchableOpacity onPress={onBack} activeOpacity={0.7}>
                    <HStack className="items-center gap-2 bg-white/50 self-start px-4 py-2 rounded-xl border border-border">
                        <Icon as={ArrowLeft} size="sm" className="text-ink" />
                        <Text className="text-sm font-bold text-ink">Back to Dashboard</Text>
                    </HStack>
                </TouchableOpacity>

                <VStack className="gap-1">
                    <Heading className="text-2xl font-black text-ink">Academic Cycles</Heading>
                    <Text className="text-sm text-ink/60">
                        Define terms, semesters and academic periods.
                    </Text>
                </VStack>
                
                <Box className={`bg-white p-5 rounded-3xl border border-border gap-4 ${isPastView ? 'opacity-60' : ''}`}>
                    <Heading className="text-xs font-black uppercase tracking-widest text-ink/40">New Cycle</Heading>
                    
                    <FormControl className="w-full">
                        <Input className="h-12 rounded-2xl">
                            <InputField 
                                value={newName} 
                                onChangeText={setNewName}
                                disabled={isPastView} 
                                placeholder="e.g. First Term 2026" 
                            />
                        </Input>
                    </FormControl>

                    <HStack className="gap-4">
                        <FormControl className="flex-1">
                            <FormControlLabel>
                                <FormControlLabelText className="text-[10px] font-bold uppercase text-ink/40">Start Date</FormControlLabelText>
                            </FormControlLabel>
                            <Input className="h-12 rounded-2xl">
                                <InputField 
                                    value={newStart} 
                                    onChangeText={setNewStart}
                                    disabled={isPastView} 
                                    placeholder="YYYY-MM-DD"
                                />
                            </Input>
                        </FormControl>

                        <FormControl className="flex-1">
                            <FormControlLabel>
                                <FormControlLabelText className="text-[10px] font-bold uppercase text-ink/40">End Date</FormControlLabelText>
                            </FormControlLabel>
                            <Input className="h-12 rounded-2xl">
                                <InputField 
                                    value={newEnd} 
                                    onChangeText={setNewEnd}
                                    disabled={isPastView} 
                                    placeholder="YYYY-MM-DD"
                                />
                            </Input>
                        </FormControl>
                    </HStack>

                    <Button 
                        size="lg"
                        onPress={handleCreateCycle} 
                        disabled={!newName.trim() || !newStart || saving || isPastView} 
                        className="bg-primary rounded-2xl self-start h-12 px-6"
                    >
                        {saving ? (
                            <ButtonText>Saving...</ButtonText>
                        ) : (
                            <>
                                <ButtonIcon as={Plus} className="mr-2" />
                                <ButtonText>Create Cycle</ButtonText>
                            </>
                        )}
                    </Button>
                </Box>

                {loading ? (
                    <VStack className="gap-4">
                        <SkeletonCard height={80} />
                        <SkeletonCard height={80} />
                    </VStack>
                ) : academicCycles.length === 0 ? (
                    <Box className="p-10 items-center justify-center bg-ink/5 rounded-3xl border border-dashed border-border">
                        <Text className="text-ink/40 italic font-bold">No academic cycles yet.</Text>
                    </Box>
                ) : (
                    <VStack className="gap-3">
                        {academicCycles.map(c => (
                            <Box 
                                key={c.id} 
                                className={`bg-white p-5 rounded-3xl border border-border border-l-4 ${
                                    c.status === 'active' ? 'border-l-green-500' : 
                                    c.status === 'upcoming' ? 'border-l-blue-500' : 'border-l-ink/20'
                                }`}
                            >
                                <HStack className="justify-between items-center">
                                    <VStack className="gap-1">
                                        <Text className="font-extrabold text-lg text-ink">{c.name}</Text>
                                        <HStack className="items-center gap-1.5">
                                            <Calendar size={12} className="text-ink/40" />
                                            <Text className="text-xs text-ink/60">
                                                {c.start_date} — {c.end_date ?? 'ongoing'}
                                            </Text>
                                        </HStack>
                                    </VStack>
                                    <Box className={`px-3 py-1 rounded-full ${
                                        c.status === 'active' ? 'bg-green-500/10' : 'bg-blue-500/10'
                                    }`}>
                                        <Text className={`text-[10px] font-black uppercase ${
                                            c.status === 'active' ? 'text-green-600' : 'text-blue-600'
                                        }`}>
                                            {c.status}
                                        </Text>
                                    </Box>
                                </HStack>
                            </Box>
                        ))}
                    </VStack>
                )}
            </VStack>
        </ScrollView>
    );
};

export type { CyclesDashboardProps };
