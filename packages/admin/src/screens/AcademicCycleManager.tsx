import React, { useEffect, useState } from 'react';
import { 
    Icon, 
    VStack,
    HStack,
    Box,
    Text,
    Pressable,
    GlobalHeader,
    Input,
    InputField,
    Button,
    ButtonText,
    hapticLight,
    hapticSuccess,
    ScrollView,
    SkeletonCard 
} from '@repo/ui';
import {
    Calendar,
    Plus,
    Trash2,
    CheckCircle2,
    Circle,
    Clock
} from 'lucide-react-native';
import { api, type AcademicCycle } from '@repo/core';
import { useTranslation } from 'react-i18next';
import { Alert, TouchableOpacity } from 'react-native';

interface AcademicCycleManagerProps {
    schoolId: string;
    onBack: () => void;
}

export default function AcademicCycleManager({ schoolId, onBack }: AcademicCycleManagerProps) {
    const { t } = useTranslation();
    const [cycles, setCycles] = useState<AcademicCycle[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);

    // Form State
    const [name, setName] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [isCurrent, setIsCurrent] = useState(false);
    const [saving, setSaving] = useState(false);

    const fetchCycles = async () => {
        try {
            const data = await api.academicCycles.getAll(schoolId);
            setCycles(data);
        } catch (error) {
            console.error('Failed to fetch cycles:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCycles();
    }, [schoolId]);

    const handleCreate = async () => {
        if (!name || !startDate || !endDate) {
            Alert.alert('Missing Info', 'Please fill in all fields');
            return;
        }

        setSaving(true);
        try {
            await api.academicCycles.create({
                school_id: schoolId,
                name,
                start_date: startDate,
                end_date: endDate,
                is_current: isCurrent
            });
            hapticSuccess();
            setName('');
            setStartDate('');
            setEndDate('');
            setIsCurrent(false);
            setShowAddForm(false);
            fetchCycles();
        } catch (error) {
            Alert.alert('Error', 'Failed to create academic cycle');
        } finally {
            setSaving(false);
        }
    };

    const handleSetCurrent = async (cycleId: string) => {
        try {
            await api.academicCycles.update(cycleId, schoolId, { is_current: true });
            hapticLight();
            fetchCycles();
        } catch (error) {
            Alert.alert('Error', 'Failed to update cycle');
        }
    };

    const handleDelete = (cycleId: string) => {
        Alert.alert(
            'Delete Cycle',
            'Are you sure you want to delete this academic cycle?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await api.academicCycles.delete(cycleId);
                            hapticLight();
                            fetchCycles();
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete cycle');
                        }
                    }
                }
            ]
        );
    };

    if (loading) {
        return (
            <Box className="flex-1 bg-silk">
                <GlobalHeader title="Academic Cycles" onBack={onBack} />
                <VStack className="p-6 gap-4">
                    <SkeletonCard height={100} />
                    <SkeletonCard height={100} />
                    <SkeletonCard height={100} />
                </VStack>
            </Box>
        );
    }

    return (
        <Box className="flex-1 bg-silk">
            <GlobalHeader
                title={t('principal.cycles.title') || 'Academic Cycles'}
                onBack={onBack}
                rightAction={
                    <Pressable onPress={() => setShowAddForm(!showAddForm)}>
                        <Icon as={Plus} size={24} className="text-primary" />
                    </Pressable>
                }
            />

            <ScrollView contentContainerStyle={{ padding: 24 }}>
                <VStack className="gap-8">
                    <Box>
                        <Text className="text-ink/60 text-[13px] mb-1">
                            {t('principal.cycles.description') || 'Define your terms and semesters to synchronize syllabus progress and attendance reports.'}
                        </Text>
                    </Box>

                    {showAddForm && (
                        <Box className="bg-white p-6 rounded-[24px] border border-border shadow-sm">
                            <VStack className="gap-4">
                                <Text className="text-sm font-black text-ink uppercase tracking-widest">New Cycle</Text>

                                <VStack className="gap-1">
                                    <Text className="text-xs font-bold text-ink/40 uppercase tracking-wider">Name (e.g. Term 1 2026)</Text>
                                    <Input variant="underlined" className="border-border">
                                        <InputField 
                                            value={name} 
                                            onChangeText={setName} 
                                            placeholder="Cycle Name" 
                                            className="text-ink font-bold"
                                        />
                                    </Input>
                                </VStack>

                                <HStack className="gap-4">
                                    <VStack className="flex-1 gap-1">
                                        <Text className="text-xs font-bold text-ink/40 uppercase tracking-wider">Start Date</Text>
                                        <Input variant="underlined" className="border-border">
                                            <InputField 
                                                value={startDate} 
                                                onChangeText={setStartDate} 
                                                placeholder="YYYY-MM-DD" 
                                                className="text-ink font-bold"
                                            />
                                        </Input>
                                    </VStack>
                                    <VStack className="flex-1 gap-1">
                                        <Text className="text-xs font-bold text-ink/40 uppercase tracking-wider">End Date</Text>
                                        <Input variant="underlined" className="border-border">
                                            <InputField 
                                                value={endDate} 
                                                onChangeText={setEndDate} 
                                                placeholder="YYYY-MM-DD" 
                                                className="text-ink font-bold"
                                            />
                                        </Input>
                                    </VStack>
                                </HStack>

                                <HStack className="gap-3 items-center">
                                    <Pressable onPress={() => setIsCurrent(!isCurrent)}>
                                        <HStack className="gap-2 items-center">
                                            {isCurrent ? <Icon as={CheckCircle2} size={18} className="text-green-500" /> : <Icon as={Circle} size={18} className="text-ink/40" />}
                                            <Text className="text-[13px] font-bold text-ink">Set as Current Cycle</Text>
                                        </HStack>
                                    </Pressable>
                                </HStack>

                                <Button
                                    onPress={handleCreate}
                                    disabled={saving}
                                    className="bg-primary rounded-full h-12 shadow-sm mt-2"
                                >
                                    <ButtonText className="text-white font-black uppercase tracking-widest">{saving ? 'Saving...' : 'Create Cycle'}</ButtonText>
                                </Button>
                            </VStack>
                        </Box>
                    )}

                    <VStack className="gap-4">
                        {cycles.length === 0 ? (
                            <Box className="items-center p-12">
                                <Icon as={Calendar} size={48} className="text-ink/20" strokeWidth={1} />
                                <Text className="mt-4 text-ink/40 font-bold">No cycles defined yet.</Text>
                            </Box>
                        ) : (
                            cycles.map((cycle) => (
                                <Box
                                    key={cycle.id}
                                    className={`bg-white p-5 rounded-[24px] border border-border shadow-sm ${cycle.is_current ? 'border-green-500/30' : ''}`}
                                >
                                    <HStack className="justify-between items-start">
                                        <VStack className="gap-1 flex-1">
                                            <HStack className="gap-2 items-center">
                                                <Text className="text-lg font-black text-ink">{cycle.name}</Text>
                                                {cycle.is_current && (
                                                    <Box className="bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                                                        <Text className="text-[10px] font-black text-green-600 uppercase">CURRENT</Text>
                                                    </Box>
                                                )}
                                            </HStack>
                                            <HStack className="gap-2 items-center">
                                                <Icon as={Clock} size={12} className="text-ink/40" />
                                                <Text className="text-xs font-bold text-ink/40">
                                                    {cycle.start_date} to {cycle.end_date}
                                                </Text>
                                            </HStack>
                                        </VStack>

                                        <HStack className="gap-4">
                                            {!cycle.is_current && (
                                                <TouchableOpacity onPress={() => handleSetCurrent(cycle.id)}>
                                                    <Icon as={CheckCircle2} size={20} className="text-ink/20" />
                                                </TouchableOpacity>
                                            )}
                                            <TouchableOpacity onPress={() => handleDelete(cycle.id)}>
                                                <Icon as={Trash2} size={20} className="text-red-500" />
                                            </TouchableOpacity>
                                        </HStack>
                                    </HStack>
                                </Box>
                            ))
                        )}
                    </VStack>
                </VStack>
            </ScrollView>
        </Box>
    );
}
