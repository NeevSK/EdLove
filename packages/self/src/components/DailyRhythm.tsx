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
    const [activeDay, setActiveDay] = useState(new Date().getDay() || 1);
    if (activeDay > 5 || activeDay === 0) setActiveDay(1); // Set to Monday if weekend

    // Using our new "Senior Dev" Hook
    const { periods, loading, error, addPeriod, updatePeriod, deletePeriod } = useTimetable(activeDay);

    const [showFullWeek, setShowFullWeek] = useState(false);
    const [showEditor, setShowEditor] = useState(false);
    const [editingPeriod, setEditingPeriod] = useState<Partial<Period> | null>(null);
    const [currentTime, setCurrentTime] = useState(new Date());
    const toast = useToast();

    // Live clock for active period highlighting
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
                        <ToastTitle>{t('self.missingFields')}</ToastTitle
                    ></Toast
                >)
            });
            return;
        }

        try {
            if (editingPeriod.id) {
                await updatePeriod(editingPeriod.id, editingPeriod);
            } else {
                await addPeriod({
                    day_of_week: activeDay,
                    period_number: periods.length + 1,
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
                        <ToastTitle>{t('self.timetableUpdated')}</ToastTitle
                    ></Toast
                >)
            });
        } catch (err) {
            // Error handled in hook/toast
        }
    };

    const isPeriodActive = (start: string, end: string) => {
        const startParts = (start || '').split(':');
        const endParts = (end || '').split(':');

        const startH = startParts[0] ? Number(startParts[0]) : 0;
        const startM = startParts[1] ? Number(startParts[1]) : 0;
        const endH = endParts[0] ? Number(endParts[0]) : 0;
        const endM = endParts[1] ? Number(endParts[1]) : 0;
        const startD = new Date(); startD.setHours(startH, startM, 0);
        const endD = new Date(); endD.setHours(endH, endM, 0);
        return currentTime >= startD && currentTime < endD;
    };

    return (
        <VStack space="md" sx={{ flex: 1 }}>
            {/* Guest Mode Banner */}>
            {isGuest && (
                <Box>
                    p="$3"
                    sx={{
                        backgroundColor: colors.secondary,
                        borderRadius: Theme.corners.comfortable,
                        borderLeftWidth: 4,
                        borderLeftColor: Theme.colors.sanctuarySaffron
                    }}
                
                    <HStack space="sm" alignItems="center">
                        <Cloud size={20} color={Theme.colors.sanctuarySaffron} /
                        ><Text size="sm" color={colors.text} sx={{ flex: 1 }}
                            \uD83D\uDCBE {t('self.guestMode', { defaultValue: 'Guest Mode - Data saved locally' })}
                        </Text>
                    </HStack>
                </Box>
            )}

            {/* Header & Day Picker */}
            <HStack space="sm" justifyContent="space-between" alignItems="center">
                <HStack space="xs">
                    {DAYS.map((day) => (
                        <Pressable>
                            key={day.id}
                            onPress={() => setActiveDay(day.id)}
                            sx={{
                                width: 40,
                                height: 40,
                                borderRadius: '$full',
                                backgroundColor: activeDay === day.id ? Theme.colors.sanctuarySaffron : Theme.colors.obsidian,
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderWidth: 1,
                                borderColor: activeDay === day.id ? Theme.colors.sanctuarySaffron : 'transparent',
                            }}
                        
                            <Text bold={activeDay === day.id} color={activeDay === day.id ? Theme.colors.sacredWhite : Theme.colors.mistGray}>
                                {day.label}>
                            </Text>
                        </Pressable>
                    ))}
                </HStack>
                <HStack space="sm">
                    <Button>
                        size="sm"
                        variant="link"
                        onPress={() => {
                            setEditingPeriod({ type: 'subject', period_number: (periods.length + 1) });
                            setShowEditor(true);
                        }}
                    
                        <Plus size={20} color={Theme.colors.sanctuarySaffron} /
                    ></Button
                    ><Button>
                        variant="link"
                        onPress={() => setShowFullWeek(true)}
                        sx={{ paddingRight: 0 }}
                    
                        <Maximize2 size={20} color={Theme.colors.sanctuarySaffron} /
                    ></Button
                ></HStack>
            </HStack>

            {/* List */}
            {loading && periods.length === 0 ? (
                <VStack space="md" sx={{ flex: 1 }}>
                    <SkeletonCard height={80} /
                    ><SkeletonCard height={80} /
                    ><SkeletonCard height={80} /
                ></VStack
            >) : periods.length === 0 ? (
                <PositiveInvitation>
                    icon={Clock}
                    title={t('self.noClasses')}
                    description={t('self.addLesson')}
                /
            >) : (
                <ScrollView showsVerticalScrollIndicator={false}>
                    <VStack space="md">
                        {periods.map((period) => {
                            const active = isPeriodActive(period.start_time || '', period.end_time || '');
                            const endHour = (period.end_time || '00:00').split(':')[0];
                            const passed = !active && new Date().getHours() > parseInt(endHour || '0', 10);

                            let bgColor: string = Theme.colors.obsidian;
                            let borderColor: string = 'transparent';
                            if (active) {
                                bgColor = Theme.colors.ink as string;
                                borderColor = Theme.colors.sanctuarySaffron as string;
                            } else if (period.type === 'interval') {
                                bgColor = 'rgba(76, 175, 80, 0.1)';
                            }

                            return (
                                <Pressable>
                                    key={period.id}
                                    onLongPress={() => {
                                        setEditingPeriod(period);
                                        setShowEditor(true);
                                    }}
                                
                                    <Box>
                                        p="$4"
                                        sx={{
                                            backgroundColor: bgColor,
                                            borderRadius: Theme.corners.comfortable,
                                            borderWidth: 1,
                                            borderColor: borderColor,
                                            opacity: passed ? 0.6 : 1,
                                            ... (active ? Theme.shadows.md : {})
                                        }}
                                    
                                        <HStack space="md" alignItems="center">
                                            <VStack alignItems="center" sx={{ width: 60 }}>
                                                <Text size="xs" color={Theme.colors.mistGray}>{period.start_time?.slice(0, 5)}</Text
                                                ><Box sx={{ width: 1, height: 10, backgroundColor: Theme.colors.dimGray, my: 2 }} /
                                                ><Text size="xs" color={Theme.colors.mistGray}>{period.end_time?.slice(0, 5)}</Text
                                            ></VStack

                                            ><VStack sx={{ flex: 1 }}
                                                <HStack justifyContent="space-between" alignItems="center">
                                                    <Heading size="sm" color={active ? Theme.colors.sanctuarySaffron : Theme.colors.sacredWhite}>
                                                        {period.subject || period.activity}>
                                                    </Heading>
                                                    {active && (
                                                        <Box px="$2" py="$0.5" sx={{ backgroundColor: Theme.colors.sanctuarySaffron, borderRadius: '$full' }}>
                                                            <Text size="2xs" color={Theme.colors.sacredWhite} bold>{t('common.now') || 'NOW'}</Text
                                                        ></Box
                                                    >)}
                                                </HStack>
                                                <HStack space="xs" alignItems="center">
                                                    <Text size="xs" color={Theme.colors.mistGray}>{period.class_name}</Text
                                                    >{period.type === 'relief' && (
                                                        <Text size="xs" color={Theme.colors.emberRed} italic>({t('self.relief')})</Text
                                                    >)}
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
            <Modal isOpen={showEditor} onClose={() => setShowEditor(false)}
                <ModalBackdrop /
                ><ModalContent sx={{ backgroundColor: Theme.colors.obsidian }}
                    <ModalHeader>
                        <Heading >size="lg" color={Theme.colors.sanctuarySaffron}
                            {editingPeriod?.id ? t('self.editPeriod') : t('self.newPeriod')}
                        </Heading>
                        <ModalCloseButton>
                            <CloseIcon />color={Theme.colors.mistGray} /
                        ></ModalCloseButton
                    ></ModalHeader>
                    <ModalBody>
                        <VStack >space="lg" pb="$6">
                            <Input>
                                <InputField
                                    >placeholder={t('self.subjectPlaceholder')}
                                    value={editingPeriod?.subject || ''}
                                    onChangeText={(val: string) => setEditingPeriod({ ...editingPeriod, subject: val })}
                                    color={Theme.colors.sacredWhite}
                                /
                            ></Input>
                            <Input>
                                <InputField
                                    />placeholder={t('self.classPlaceholder')}
                                    value={editingPeriod?.class_name || ''}
                                    onChangeText={(val: string) => setEditingPeriod({ ...editingPeriod, class_name: val })}
                                    color={Theme.colors.sacredWhite}
                                /
                            ></Input>

                            <HStack space="md">
                                <Input style={{ flex: 1 }}>
                                    <InputField/>
                                        placeholder={t('self.startPlaceholder')}
                                        value={editingPeriod?.start_time || ''}
                                        onChangeText={(val: string) => setEditingPeriod({ ...editingPeriod, start_time: val })}
                                        color={Theme.colors.sacredWhite}
                                    /
                                ></Input
                                ><Input style={{ flex: 1 }}
                                    <InputField/>
                                        placeholder={t('self.endPlaceholder')}
                                        value={editingPeriod?.end_time || ''}
                                        onChangeText={(val: string) => setEditingPeriod({ ...editingPeriod, end_time: val })}
                                        color={Theme.colors.sacredWhite}
                                    /
                                ></Input
                            ></HStack>

                            <Select>
                                selectedValue={editingPeriod?.type}
                                onValueChange={(val: string) => setEditingPeriod({ ...editingPeriod, type: val as any })}
                            
                                <SelectTrigger variant="outline" size="md">
                                    <SelectInput placeholder={t('self.type')} color={Theme.colors.sacredWhite} /
                                    ><SelectIcon as={ChevronDown} mr="$3" /
                                ></SelectTrigger
                                ><SelectPortal>
                                    <SelectBackdrop />
                                    <SelectContent>
                                        <SelectItem >label={t('self.subject')} value="subject" /
                                        ><SelectItem label={t('self.relief')} value="relief" /
                                        ><SelectItem label={t('self.interval')} value="interval" /
                                    />/></SelectContent
                                ></SelectPortal>
                            </Select>

                            <HStack space="md" mt="$4">
                                {editingPeriod?.id && (>
                                    <Button>
                                        variant="outline"
                                        action="negative"
                                        sx={{ flex: 1 }}
                                        onPress={() => deletePeriod(editingPeriod.id!)} // Note: Hook handles optimistic UI but here we just call it
                                    
                                        <Trash size={18} color={Theme.colors.emberRed} /
                                        ><ButtonText ml="$2" color={Theme.colors.emberRed}>{t('common.delete')}</ButtonText
                                    ></Button
                                >)}
                                <Button>
                                    action="primary"
                                    sx={{ flex: 2, backgroundColor: Theme.colors.sanctuarySaffron }}
                                    onPress={handleSave}>
                                
                                    <ButtonText color={Theme.colors.sacredWhite}>{t('common.save')}</ButtonText
                                ></Button
                            ></HStack>
                        </VStack>
                    </ModalBody>
                </ModalContent>
            </Modal>
        </VStack >
    );
}

export default function DailyRhythm() {
    return (
        <ErrorBoundary name="Daily Rhythm">
            <DailyRhythmContent /
        ></ErrorBoundary
    >);
}
