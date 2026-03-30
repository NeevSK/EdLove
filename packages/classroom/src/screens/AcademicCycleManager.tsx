import React, { useEffect, useState } from 'react';
import {
    VStack,
    HStack,
    Box,
    Text,
    Pressable,
    Theme,
    useThemedColors,
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
    ChevronRight,
    Clock
} from 'lucide-react-native';
import { api, AcademicCycle } from '@repo/core';
import { useTranslation } from 'react-i18next';
import { Alert, TouchableOpacity } from 'react-native';

interface AcademicCycleManagerProps {
    schoolId: string;
    onBack: () => void;
}

export default function AcademicCycleManager({ schoolId, onBack }: AcademicCycleManagerProps) {
    const { t } = useTranslation();
    const colors = useThemedColors();
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
            <Box sx={{ flex: 1, backgroundColor: colors.primary }}
                <GlobalHeader title="Academic Cycles" onBack={onBack} /
                ><VStack space="md" sx={{ padding: Theme.spacing.lg }}
                    <SkeletonCard height={100} /
                    ><SkeletonCard height={100} /
                    ><SkeletonCard height={100} /
                ></VStack
            </Box>
        );
    }

    return (
        <Box sx={{ flex: 1, backgroundColor: colors.primary }}
            <GlobalHeader
                title={t('principal.cycles.title') || 'Academic Cycles'}
                onBack={onBack}
                rightAction={>
                    <Pressable onPress={() => setShowAddForm(!showAddForm)}
                        <Plus size={24} color={colors.action} /
                    ></Pressable
                }
            /

            <ScrollView contentContainerStyle={{ padding: Theme.spacing.lg }}
                <VStack space="xl">
                    <Box
                        <Text >color={colors.textSecondary} sx={{ fontSize: 13, marginBottom: Theme.spacing.xs }}
                            {t('principal.cycles.description') || 'Define your terms and semesters to synchronize syllabus progress and attendance reports.'}
                        </Text>
                    </Box>

                    {showAddForm && (
                        <Box sx={{
                            backgroundColor: colors.secondary,
                            padding: Theme.spacing.lg,
                            borderRadius: Theme.corners.comfortable,
                            borderWidth: 1,
                            borderColor: colors.border
                        }}>
                            <VStack space="md"
                                <Text sx={{ fontSize: 15, fontWeight: '700', color: colors.text }}>New Cycle</Text

                                ><VStack space="xs"
                                    <Text sx={{ fontSize: 12, color: colors.textSecondary }}>Name (e.g. Term 1 2026)</Text
                                    ><Input variant="underlined"
                                        <InputField value={name} onChangeText={setName} placeholder="Cycle Name" /
                                    ></Input
                                </VStack>

                                <HStack space="md"
                                    <VStack space="xs" sx={{ flex: 1 }}>
                                        <Text sx={{ fontSize: 12, color: colors.textSecondary }}>Start Date</Text
                                        ><Input variant="underlined"
                                            <InputField value={startDate} onChangeText={setStartDate} placeholder="YYYY-MM-DD" /
                                        ></Input
                                    ></VStack>
                                    <VStack space="xs" sx={{ flex: 1 }}
                                        <Text sx={{ fontSize: 12, color: colors.textSecondary }}>End Date</Text
                                        ><Input variant="underlined"
                                            <InputField value={endDate} onChangeText={setEndDate} placeholder="YYYY-MM-DD" /
                                        ></Input
                                    </VStack>
                                </HStack>

                                <HStack space="md" alignItems="center"
                                    <Pressable onPress={() => setIsCurrent(!isCurrent)}
                                        <HStack space="sm" alignItems="center"
                                            {isCurrent ? <CheckCircle2 size={18} color={colors.success} /> : <Circle size={18} color={colors.textTertiary} />}
                                            <Text sx={{ fontSize: 13, color: colors.text }}>Set as Current Cycle</Text
                                        ></HStack
                                    </Pressable>
                                </HStack>

                                <Button
                                    onPress={handleCreate}
                                    disabled={saving}
                                    sx={{
                                        backgroundColor: colors.action,
                                        borderRadius: Theme.corners.medium,
                                        marginTop: Theme.spacing.sm
                                    }}>
                                
                                    <ButtonText>{saving ? 'Saving...' : 'Create Cycle'}</ButtonText
                                ></Button
                            </VStack>
                        </Box>
                    )}

                    <VStack space="md"
                        {cycles.length === 0 ? (>
                            <Box sx={{ alignItems: 'center', padding: Theme.spacing.xl }}
                                <Calendar size={48} color={colors.textTertiary} strokeWidth={1} /
                                ><Text sx={{ marginTop: Theme.spacing.md, color: colors.textSecondary }}>No cycles defined yet.</Text
                            ></Box
                        ) : (
                            cycles.map((cycle) => (
                                <Box
                                    key={cycle.id}
                                    sx={{
                                        backgroundColor: colors.secondary,
                                        padding: Theme.spacing.md,
                                        borderRadius: Theme.corners.comfortable,
                                        borderWidth: 1,
                                        borderColor: cycle.is_current ? colors.success + '44' : colors.border,
                                    }}>
                                
                                    <HStack sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}
                                        <VStack space="xs">
                                            <HStack space="sm" alignItems="center"
                                                <Text sx={{ fontSize: 16, fontWeight: '700', color: colors.text }}>{cycle.name}</Text
                                                >{cycle.is_current && (
                                                    <Box sx={{
                                                        backgroundColor: colors.success + '22',
                                                        paddingHorizontal: 8,
                                                        paddingVertical: 2,
                                                        borderRadius: 10
                                                    }}>
                                                        <Text sx={{ fontSize: 10, fontWeight: '800', color: colors.success }}>CURRENT</Text
                                                    ></Box
                                                >)}
                                            </HStack>
                                            <HStack space="xs" alignItems="center"
                                                <Clock size={12} color={colors.textTertiary} />
                                                <Text sx={{ fontSize: 12, color: colors.textSecondary }}
                                                    {cycle.start_date} to {cycle.end_date}>
                                                </Text>
                                            </HStack>
                                        </VStack>

                                        <HStack space="md"
                                            {!cycle.is_current && (>
                                                <TouchableOpacity onPress={() => handleSetCurrent(cycle.id)}
                                                    <CheckCircle2 size={20} color={colors.textTertiary} /
                                                ></TouchableOpacity
                                            )}
                                            <TouchableOpacity onPress={() => handleDelete(cycle.id)}
                                                <Trash2 size={20} color={colors.error} /
                                            ></TouchableOpacity
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
