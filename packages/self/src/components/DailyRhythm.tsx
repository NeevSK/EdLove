import React, { useState, useEffect } from 'react';
import {
    Box,
    VStack,
    HStack,
    Text,
    Heading,
    ScrollView,
    Pressable,
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
    Icon,
    useToast,
    Toast,
    ToastTitle,
    PositiveInvitation,
    ErrorBoundary,
    SkeletonCard
} from '@repo/ui';
import { useTranslation } from 'react-i18next';
import { Maximize2, Plus, Clock, Trash, ChevronDown, Cloud } from 'lucide-react-native';
import { useTimetable } from '../hooks/useTimetable';
import { Period } from '../types';
import { useFeatureAccess } from '@repo/core';

const DAYS = [
    { id: 1, label: 'M' },
    { id: 2, label: 'T' },
    { id: 3, label: 'W' },
    { id: 4, label: 'T' },
    { id: 5, label: 'F' },
];

function DailyRhythmContent() {
    const { t } = useTranslation();
    const { isGuest } = useFeatureAccess();
    const [activeDay, setActiveDay] = useState(() => {
        const d = new Date().getDay();
        return (d === 0 || d === 6) ? 1 : d;
    });

    const { periods, loading, addPeriod, updatePeriod, deletePeriod } = useTimetable(activeDay);

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
                    <Toast nativeID={id} action="error" variant="solid" className="bg-red-600">
                        <ToastTitle className="text-white">{t('self.missingFields') || 'Please fill required fields'}</ToastTitle>
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
                    <Toast nativeID={id} action="success" variant="solid" className="bg-green-600">
                        <ToastTitle className="text-white">{t('self.timetableUpdated') || 'Timetable Updated'}</ToastTitle>
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
        <VStack className="gap-md flex-1">
            {/* Guest Mode Banner */}
            {isGuest && (
                <Box className="p-md bg-ink rounded-comfortable border-l-4 border-sanctuarySaffron">
                    <HStack className="gap-sm items-center">
                        <Cloud size={20} className="text-sanctuarySaffron" />
                        <Text className="text-sm text-sacredWhite flex-1">
                            {t('self.guestMode') || 'Guest Mode - Data saved locally'}
                        </Text>
                    </HStack>
                </Box>
            )}

            {/* Header & Day Picker */}
            <HStack className="gap-sm justify-between items-center">
                <HStack className="gap-xs">
                    {DAYS.map((day) => (
                        <Pressable
                            key={day.id}
                            onPress={() => setActiveDay(day.id)}
                            className={`w-10 h-10 rounded-full items-center justify-center border ${
                                activeDay === day.id 
                                ? 'bg-sanctuarySaffron border-sanctuarySaffron' 
                                : 'bg-white/5 border-transparent'
                            }`}
                        >
                            <Text className={`font-bold ${
                                activeDay === day.id ? 'text-black' : 'text-mistGray'
                            }`}>
                                {day.label}
                            </Text>
                        </Pressable>
                    ))}
                </HStack>
                <HStack className="gap-sm">
                    <Button
                        onPress={() => { 
                            setEditingPeriod({ type: 'subject', period_number: (periods?.length || 0) + 1 });
                            setShowEditor(true);
                        }}
                        variant="link"
                        className="p-0"
                    >
                        <Plus size={20} className="text-sanctuarySaffron" />
                    </Button>
                    <Button
                        onPress={() => setShowFullWeek(true)}
                        variant="link"
                        className="p-0"
                    >
                        <Maximize2 size={20} className="text-sanctuarySaffron" />
                    </Button>
                </HStack>
            </HStack>

            {/* List */}
            {loading && (!periods || periods.length === 0) ? (
                <VStack className="gap-md flex-1">
                    <SkeletonCard className="h-20" />
                    <SkeletonCard className="h-20" />
                    <SkeletonCard className="h-20" />
                </VStack>
            ) : (!periods || periods.length === 0) ? (
                <PositiveInvitation
                    icon={Clock}
                    title={t('self.noClasses') || "No classes scheduled"}
                    description={t('self.addLesson') || "Tap + to add your first lesson."}
                />
            ) : (
                <ScrollView showsVerticalScrollIndicator={false}>
                    <VStack className="gap-md">
                        {periods.map((period) => {
                            const active = isPeriodActive(period.start_time || '', period.end_time || '');
                            const endHour = (period.end_time || '00:00').split(':')[0];
                            const passed = !active && currentTime.getHours() > parseInt(endHour || '0', 10);

                            return (
                                <Pressable
                                    key={period.id}
                                    onLongPress={() => {
                                        setEditingPeriod(period);
                                        setShowEditor(true);
                                    }}
                                >
                                    <Box
                                        className={`p-md rounded-comfortable border transition-all ${
                                            active 
                                            ? 'bg-ink border-sanctuarySaffron shadow-lg' 
                                            : period.type === 'interval' 
                                                ? 'bg-sageGreen/10 border-sageGreen/20' 
                                                : 'bg-obsidian border-transparent'
                                        } ${passed ? 'opacity-60' : 'opacity-100'}`}
                                    >
                                        <HStack className="gap-md items-center">
                                            <VStack className="items-center w-14">
                                                <Text className="text-xs text-mistGray">
                                                    {period.start_time?.slice(0, 5)}
                                                </Text>
                                                <Box className="w-[1px] h-2.5 bg-dimGray my-0.5" />
                                                <Text className="text-xs text-mistGray">
                                                    {period.end_time?.slice(0, 5)}
                                                </Text>
                                            </VStack>

                                            <VStack className="flex-1">
                                                <HStack className="justify-between items-center">
                                                    <Heading 
                                                        className={`text-base font-bold ${active ? 'text-sanctuarySaffron' : 'text-sacredWhite'}`}
                                                    >
                                                        {period.subject || period.activity}
                                                    </Heading>
                                                    {active && (
                                                        <Box className="bg-sanctuarySaffron rounded-full px-2 py-0.5">
                                                            <Text className="text-[10px] text-black font-bold uppercase">
                                                                {t('common.now') || 'NOW'}
                                                            </Text>
                                                        </Box>
                                                    )}
                                                </HStack>
                                                <HStack className="gap-1 items-center">
                                                    <Text className="text-xs text-mistGray font-medium">
                                                        {period.class_name}
                                                    </Text>
                                                    {period.type === 'relief' && (
                                                        <Text className="text-xs text-emberRed italic ml-1">
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
                <ModalContent className="bg-obsidian border border-white/10 rounded-generous">
                    <ModalHeader className="border-b border-white/5 pb-2">
                        <Heading className="text-xl font-bold text-sanctuarySaffron">
                            {editingPeriod?.id ? (t('self.editPeriod') || 'Edit Period') : (t('self.newPeriod') || 'New Period')}
                        </Heading>
                        <ModalCloseButton>
                            <Icon as={CloseIcon} className="text-mistGray" />
                        </ModalCloseButton>
                    </ModalHeader>
                    <ModalBody className="pt-4">
                        <VStack className="gap-lg pb-6">
                            <Input variant="outline" className="border-white/10 bg-white/5 rounded-tight">
                                <InputField
                                    placeholder={t('self.subjectPlaceholder') || 'Subject Name'}
                                    value={editingPeriod?.subject || ''}
                                    onChangeText={(val: string) => setEditingPeriod(prev => ({ ...prev, subject: val }))}
                                    className="text-sacredWhite placeholder:text-dimGray"
                                />
                            </Input>
                            <Input variant="outline" className="border-white/10 bg-white/5 rounded-tight">
                                <InputField
                                    placeholder={t('self.classPlaceholder') || 'Class/Room'}
                                    value={editingPeriod?.class_name || ''}
                                    onChangeText={(val: string) => setEditingPeriod(prev => ({ ...prev, class_name: val }))}
                                    className="text-sacredWhite placeholder:text-dimGray"
                                />
                            </Input>

                            <HStack className="gap-md">
                                <Input variant="outline" className="flex-1 border-white/10 bg-white/5 rounded-tight">
                                    <InputField
                                        placeholder={t('self.startPlaceholder') || 'Start (HH:MM)'}
                                        value={editingPeriod?.start_time || ''}
                                        onChangeText={(val: string) => setEditingPeriod(prev => ({ ...prev, start_time: val }))}
                                        className="text-sacredWhite placeholder:text-dimGray"
                                    />
                                </Input>
                                <Input variant="outline" className="flex-1 border-white/10 bg-white/5 rounded-tight">
                                    <InputField
                                        placeholder={t('self.endPlaceholder') || 'End (HH:MM)'}
                                        value={editingPeriod?.end_time || ''}
                                        onChangeText={(val: string) => setEditingPeriod(prev => ({ ...prev, end_time: val }))}
                                        className="text-sacredWhite placeholder:text-dimGray"
                                    />
                                </Input>
                            </HStack>

                            <Select
                                selectedValue={editingPeriod?.type}
                                onValueChange={(val: string) => setEditingPeriod(prev => ({ ...prev, type: val as any }))}
                            >
                                <SelectTrigger variant="outline" className="border-white/10 bg-white/5 rounded-tight h-12 px-3">
                                    <SelectInput 
                                        placeholder={t('self.type') || 'Type'} 
                                        className="text-sacredWhite" 
                                    />
                                    <SelectIcon as={() => <ChevronDown size={16} className="text-mistGray" />} className="ml-2" />
                                </SelectTrigger>
                                <SelectPortal>
                                    <SelectBackdrop />
                                    <SelectContent className="bg-obsidian border-white/10">
                                        <SelectItem label={t('self.subject') || 'Subject'} value="subject" className="text-sacredWhite" />
                                        <SelectItem label={t('self.relief') || 'Relief'} value="relief" className="text-sacredWhite" />
                                        <SelectItem label={t('self.interval') || 'Break/Interval'} value="interval" className="text-sacredWhite" />
                                    </SelectContent>
                                </SelectPortal>
                            </Select>

                            <HStack className="gap-md mt-4">
                                {editingPeriod?.id && (
                                    <Button
                                        variant="outline"
                                        action="negative"
                                        className="flex-1 border-emberRed rounded-comfortable"
                                        onPress={() => { 
                                            if (editingPeriod.id) {
                                                deletePeriod(editingPeriod.id);
                                                setShowEditor(false);
                                            }
                                        }}
                                    >
                                        <HStack className="gap-2 items-center">
                                            <Trash size={18} className="text-emberRed" />
                                            <ButtonText className="text-emberRed font-bold">
                                                {t('common.delete') || 'Delete'}
                                            </ButtonText>
                                        </HStack>
                                    </Button>
                                )}
                                <Button
                                    action="primary"
                                    className="flex-[2] bg-sanctuarySaffron rounded-comfortable"
                                    onPress={handleSave}
                                >
                                    <ButtonText className="text-black font-bold">
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
