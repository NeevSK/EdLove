import React, { useState, useEffect } from 'react';
import {
    Box,
    VStack,
    HStack,
    Text,
    Heading,
    ScrollView,
    Pressable,
    Center,
    Button,
    ButtonText,
    Modal,
    ModalBackdrop,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    CloseIcon,
    Input,
    InputField,
    Select,
    SelectTrigger,
    SelectInput,
    SelectIcon,
    SelectPortal,
    SelectBackdrop,
    SelectContent,
    SelectItem,
    Spinner,
    useToast,
    Toast,
    ToastTitle,
    Icon
} from '@repo/ui';
import { useTranslation } from 'react-i18next';
import { Maximize2, Plus, Edit2, Clock, Trash, ChevronDown, Cloud } from 'lucide-react-native';
import { Theme } from '@repo/ui';
import { useTimetable } from '../hooks/useTimetable';
import { Period } from '../types';
import { EmptyState, ErrorBoundary } from '@repo/ui';
import { useFeatureAccess } from '@repo/core';
import { useThemedColors } from '@repo/ui';
import { SkeletonCard, SkeletonTextLine } from '@repo/ui';
import { PositiveInvitation } from '@repo/ui';

const DAYS = [
    { id: 1, label: 'M' },
    { id: 2, label: 'T' },
    { id: 3, label: 'W' },
    { id: 4, label: 'T' },
    { id: 5, label: 'F' },
];

function DailyRhythmContent() {
    const { t } = useTranslation();
    const colors = useThemedColors();
    const { isGuest } = useFeatureAccess();
    const [activeDay, setActiveDay] = useState(() => {
        const d = new Date().getDay();
        return (d === 0 || d === 6) ? 1 : d;
    });

    const { periods, loading, error, addPeriod, updatePeriod, deletePeriod } = useTimetable(activeDay);

    const [showFullWeek, setShowFullWeek] = useState(false);
    const [showEditor, setShowEditor] = useState(false);
    const [editingPeriod, setEditingPeriod] = useState<Partial<Period> | null>(null);
    const [currentTime, setCurrentTime] = useState(new Date());
    const toast = useToast();

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    const handleSave = async () => {
        if (!editingPeriod?.subject || !editingPeriod?.start_time || !editingPeriod?.end_time) {
            toast.show({
                placement: "top",
                render: ({ id }: { id: string }) => (
                    <Toast nativeID={id} action="error" variant="solid">
                        <ToastTitle>{t('self.missingFields') || 'Please fill required fields'}</ToastTitle>
                    </Toast>
                )
            });
            return;
        }

        try {
            if (editingPeriod.id) {
                await updatePeriod(editingPeriod.id, editingPeriod);
            } else {
                await addPeriod({
                    day_of_week: activeDay,
                    period_number: (periods?.length || 0) + 1,
                    subject: editingPeriod.subject!,
                    class_name: editingPeriod.class_name || '',
                    type: editingPeriod.type || 'subject',
                    start_time: editingPeriod.start_time!,
                    end_time: editingPeriod.end_time!
                });
            }
            setShowEditor(false);
            setEditingPeriod(null);
            toast.show({
                placement: "top",
                render: ({ id }: { id: string }) => (
                    <Toast nativeID={id} action="success" variant="solid">
                        <ToastTitle>{t('self.timetableUpdated') || 'Timetable Updated'}</ToastTitle>
                    </Toast>
                )
            });
        } catch (err) {
            console.error('[DailyRhythm] Save error:', err);
        }
    };

    const isPeriodActive = (start: string, end: string) => {
        if (!start || !end) return false;
        const startParts = start.split(':');
        const endParts = end.split(':');

        const startH = Number(startParts[0]) || 0;
        const startM = Number(startParts[1]) || 0;
        const endH = Number(endParts[0]) || 0;
        const endM = Number(endParts[1]) || 0;
        
        const nowH = currentTime.getHours();
        const nowM = currentTime.getMinutes();
        
        const nowTotal = nowH * 60 + nowM;
        const startTotal = startH * 60 + startM;
        const endTotal = endH * 60 + endM;
        
        return nowTotal >= startTotal && nowTotal < endTotal;
    };

    return (
        <VStack sx={{ gap: Theme.spacing.md, flex: 1 }}>
            {/* Guest Mode Banner */}
            {isGuest && (
                <Box
                    sx={{
                        padding: Theme.spacing.md,
                        backgroundColor: colors?.secondary || Theme.colors.ink,
                        borderRadius: Theme.corners.comfortable,
                        borderLeftWidth: 4,
                        borderLeftColor: Theme.colors.sanctuarySaffron
                    }}
                >
                    <HStack sx={{ gap: Theme.spacing.sm, alignItems: 'center' }}>
                        <Cloud size={20} color={Theme.colors.sanctuarySaffron} />
                        <Text sx={{ fontSize: 14, color: colors?.text || '#fff', flex: 1 }}>
                            {t('self.guestMode') || 'Guest Mode - Data saved locally'}
                        </Text>
                    </HStack>
                </Box>
            )}

            {/* Header & Day Picker */}
            <HStack sx={{ gap: Theme.spacing.sm, justifyContent: 'space-between', alignItems: 'center' }}>
                <HStack sx={{ gap: Theme.spacing.xs }}>
                    {DAYS.map((day) => (
                        <Pressable
                            key={day.id}
                            onPress={() => setActiveDay(day.id)}
                            sx={{
                                width: 40,
                                height: 40,
                                borderRadius: 20,
                                backgroundColor: activeDay === day.id ? Theme.colors.sanctuarySaffron : (colors?.primary || '#333'),
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderWidth: 1,
                                borderColor: activeDay === day.id ? Theme.colors.sanctuarySaffron : 'transparent',
                            }}
                        >
                            <Text sx={{ 
                                fontWeight: activeDay === day.id ? '700' : '400', 
                                color: activeDay === day.id ? Theme.colors.sacredWhite : (colors?.textSecondary || '#aaa') 
                            }}>
                                {day.label}
                            </Text>
                        </Pressable>
                    ))}
                </HStack>
                <HStack sx={{ gap: Theme.spacing.sm }}>
                    <Button
                        onPress={() => {
                            setEditingPeriod({ type: 'subject', period_number: (periods?.length || 0) + 1 });
                            setShowEditor(true);
                        }}
                        variant="link"
                        sx={{ padding: 0 }}
                    >
                        <Plus size={20} color={Theme.colors.sanctuarySaffron} />
                    </Button>
                    <Button
                        onPress={() => setShowFullWeek(true)}
                        variant="link"
                        sx={{ padding: 0 }}
                    >
                        <Maximize2 size={20} color={Theme.colors.sanctuarySaffron} />
                    </Button>
                </HStack>
            </HStack>

            {/* List */}
            {loading && (!periods || periods.length === 0) ? (
                <VStack sx={{ gap: Theme.spacing.md, flex: 1 }}>
                    <SkeletonCard height={80} />
                    <SkeletonCard height={80} />
                    <SkeletonCard height={80} />
                </VStack>
            ) : (!periods || periods.length === 0) ? (
                <PositiveInvitation
                    icon={Clock}
                    title={t('self.noClasses') || "No classes scheduled"}
                    description={t('self.addLesson') || "Tap + to add your first lesson."}
                />
            ) : (
                <ScrollView showsVerticalScrollIndicator={false}>
                    <VStack sx={{ gap: Theme.spacing.md }}>
                        {periods.map((period) => {
                            const active = isPeriodActive(period.start_time || '', period.end_time || '');
                            const endHour = (period.end_time || '00:00').split(':')[0];
                            const passed = !active && currentTime.getHours() > parseInt(endHour || '0', 10);

                            let bgColor: string = (colors?.primary || Theme.colors.obsidian) as string;
                            let borderColor: string = 'transparent';
                            if (active) {
                                bgColor = (colors?.primary || Theme.colors.ink) as string;
                                borderColor = Theme.colors.sanctuarySaffron as string;
                            } else if (period.type === 'interval') {
                                bgColor = 'rgba(76, 175, 80, 0.1)';
                            }

                            return (
                                <Pressable
                                    key={period.id}
                                    onLongPress={() => {
                                        setEditingPeriod(period);
                                        setShowEditor(true);
                                    }}
                                >
                                    <Box
                                        sx={{
                                            padding: Theme.spacing.md,
                                            backgroundColor: bgColor,
                                            borderRadius: Theme.corners.comfortable,
                                            borderWidth: 1,
                                            borderColor: borderColor,
                                            opacity: passed ? 0.6 : 1,
                                        }}
                                    >
                                        <HStack sx={{ gap: Theme.spacing.md, alignItems: 'center' }}>
                                            <VStack sx={{ alignItems: 'center', width: 60 }}>
                                                <Text sx={{ fontSize: 12, color: Theme.colors.mistGray }}>
                                                    {period.start_time?.slice(0, 5)}
                                                </Text>
                                                <Box sx={{ width: 1, height: 10, backgroundColor: Theme.colors.dimGray, marginVertical: 2 }} />
                                                <Text sx={{ fontSize: 12, color: Theme.colors.mistGray }}>
                                                    {period.end_time?.slice(0, 5)}
                                                </Text>
                                            </VStack>

                                            <VStack sx={{ flex: 1 }}>
                                                <HStack sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <Heading 
                                                        size="sm" 
                                                        sx={{ color: active ? Theme.colors.sanctuarySaffron : Theme.colors.sacredWhite }}
                                                    >
                                                        {period.subject || period.activity}
                                                    </Heading>
                                                    {active && (
                                                        <Box sx={{ backgroundColor: Theme.colors.sanctuarySaffron, borderRadius: 12, paddingHorizontal: 8, paddingVertical: 2 }}>
                                                            <Text sx={{ fontSize: 10, color: Theme.colors.obsidian, fontWeight: '700' }}>
                                                                {t('common.now') || 'NOW'}
                                                            </Text>
                                                        </Box>
                                                    )}
                                                </HStack>
                                                <HStack sx={{ gap: 4, alignItems: 'center' }}>
                                                    <Text sx={{ fontSize: 12, color: Theme.colors.mistGray }}>
                                                        {period.class_name}
                                                    </Text>
                                                    {period.type === 'relief' && (
                                                        <Text sx={{ fontSize: 12, color: Theme.colors.emberRed, fontStyle: 'italic' }}>
                                                            ({t('self.relief') || 'Relief'})
                                                        </Text>
                                                    )}
                                                </HStack>
                                            </VStack>
                                        </HStack>
                                    </Box>
                                </Pressable>
                            );
                        })}
                    </VStack>
                </ScrollView>
            )}

            {/* Editor Modal */}
            <Modal isOpen={showEditor} onClose={() => setShowEditor(false)}>
                <ModalBackdrop />
                <ModalContent sx={{ backgroundColor: (colors?.primary || Theme.colors.obsidian) as string }}>
                    <ModalHeader>
                        <Heading size="lg" sx={{ color: Theme.colors.sanctuarySaffron }}>
                            {editingPeriod?.id ? (t('self.editPeriod') || 'Edit Period') : (t('self.newPeriod') || 'New Period')}
                        </Heading>
                        <ModalCloseButton>
                            <Icon as={CloseIcon} sx={{ color: Theme.colors.mistGray }} />
                        </ModalCloseButton>
                    </ModalHeader>
                    <ModalBody>
                        <VStack sx={{ gap: Theme.spacing.lg, paddingBottom: 24 }}>
                            <Input variant="outline">
                                <InputField
                                    placeholder={t('self.subjectPlaceholder') || 'Subject Name'}
                                    value={editingPeriod?.subject || ''}
                                    onChangeText={(val: string) => setEditingPeriod(prev => ({ ...prev, subject: val }))}
                                    sx={{ color: Theme.colors.sacredWhite }}
                                    placeholderTextColor={Theme.colors.dimGray}
                                />
                            </Input>
                            <Input variant="outline">
                                <InputField
                                    placeholder={t('self.classPlaceholder') || 'Class/Room'}
                                    value={editingPeriod?.class_name || ''}
                                    onChangeText={(val: string) => setEditingPeriod(prev => ({ ...prev, class_name: val }))}
                                    sx={{ color: Theme.colors.sacredWhite }}
                                    placeholderTextColor={Theme.colors.dimGray}
                                />
                            </Input>

                            <HStack sx={{ gap: Theme.spacing.md }}>
                                <Input variant="outline" sx={{ flex: 1 }}>
                                    <InputField
                                        placeholder={t('self.startPlaceholder') || 'Start (HH:MM)'}
                                        value={editingPeriod?.start_time || ''}
                                        onChangeText={(val: string) => setEditingPeriod(prev => ({ ...prev, start_time: val }))}
                                        sx={{ color: Theme.colors.sacredWhite }}
                                        placeholderTextColor={Theme.colors.dimGray}
                                    />
                                </Input>
                                <Input variant="outline" sx={{ flex: 1 }}>
                                    <InputField
                                        placeholder={t('self.endPlaceholder') || 'End (HH:MM)'}
                                        value={editingPeriod?.end_time || ''}
                                        onChangeText={(val: string) => setEditingPeriod(prev => ({ ...prev, end_time: val }))}
                                        sx={{ color: Theme.colors.sacredWhite }}
                                        placeholderTextColor={Theme.colors.dimGray}
                                    />
                                </Input>
                            </HStack>

                            <Select
                                selectedValue={editingPeriod?.type}
                                onValueChange={(val: string) => setEditingPeriod(prev => ({ ...prev, type: val as any }))}
                            >
                                <SelectTrigger variant="outline" size="md">
                                    <SelectInput 
                                        placeholder={t('self.type') || 'Type'} 
                                        sx={{ color: Theme.colors.sacredWhite }} 
                                    />
                                    <SelectIcon as={() => <ChevronDown size={16} color={Theme.colors.mistGray} />} sx={{ marginRight: 12 }} />
                                </SelectTrigger>
                                <SelectPortal>
                                    <SelectBackdrop />
                                    <SelectContent>
                                        <SelectItem label={t('self.subject') || 'Subject'} value="subject" />
                                        <SelectItem label={t('self.relief') || 'Relief'} value="relief" />
                                        <SelectItem label={t('self.interval') || 'Break/Interval'} value="interval" />
                                    </SelectContent>
                                </SelectPortal>
                            </Select>

                            <HStack sx={{ gap: Theme.spacing.md, marginTop: 16 }}>
                                {editingPeriod?.id && (
                                    <Button
                                        variant="outline"
                                        action="negative"
                                        sx={{ flex: 1, borderColor: Theme.colors.emberRed }}
                                        onPress={() => {
                                            if (editingPeriod.id) {
                                                deletePeriod(editingPeriod.id);
                                                setShowEditor(false);
                                            }
                                        }}
                                    >
                                        <HStack sx={{ gap: 8, alignItems: 'center' }}>
                                            <Trash size={18} color={Theme.colors.emberRed} />
                                            <ButtonText sx={{ color: Theme.colors.emberRed }}>
                                                {t('common.delete') || 'Delete'}
                                            </ButtonText>
                                        </HStack>
                                    </Button>
                                )}
                                <Button
                                    action="primary"
                                    sx={{ flex: 2, backgroundColor: Theme.colors.sanctuarySaffron }}
                                    onPress={handleSave}
                                >
                                    <ButtonText sx={{ color: Theme.colors.obsidian, fontWeight: '700' }}>
                                        {t('common.save') || 'Save'}
                                    </ButtonText>
                                </Button>
                            </HStack>
                        </VStack>
                    </ModalBody>
                </ModalContent>
            </Modal>
        </VStack>
    );
}

export default function DailyRhythm() {
    return (
        <ErrorBoundary name="Daily Rhythm">
            <DailyRhythmContent />
        </ErrorBoundary>
    );
}
