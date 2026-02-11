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
} from "@/ui";
import { Maximize2, Plus, Edit2, Clock, Trash, ChevronDown } from 'lucide-react-native';
import { Theme } from '../../constants/Theme';
import { useTimetable, Period } from '../../hooks/useTimetable';
import EmptyState from '../shared/EmptyState';
import ErrorBoundary from '../shared/ErrorBoundary';

const DAYS = [
    { id: 1, label: 'M' },
    { id: 2, label: 'T' },
    { id: 3, label: 'W' },
    { id: 4, label: 'T' },
    { id: 5, label: 'F' },
];

function DailyRhythmContent() {
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
                render: ({ id }) => (
                    <Toast nativeID={id} action="error" variant="solid">
                        <ToastTitle>Missing required fields</ToastTitle>
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
                render: ({ id }) => (
                    <Toast nativeID={id} action="success" variant="solid">
                        <ToastTitle>Timetable updated</ToastTitle>
                    </Toast>
                )
            });
        } catch (err) {
            // Error handled in hook/toast
        }
    };

    const isPeriodActive = (start: string, end: string) => {
        const [startH, startM] = start.split(':').map(Number);
        const [endH, endM] = end.split(':').map(Number);
        const startD = new Date(); startD.setHours(startH, startM, 0);
        const endD = new Date(); endD.setHours(endH, endM, 0);
        return currentTime >= startD && currentTime < endD;
    };

    return (
        <VStack space="md" sx={{ flex: 1 }}>
            {/* Header & Day Picker */}
            <HStack space="sm" justifyContent="space-between" alignItems="center">
                <HStack space="xs">
                    {DAYS.map((day) => (
                        <Pressable
                            key={day.id}
                            onPress={() => setActiveDay(day.id)}
                            sx={{
                                width: 40,
                                height: 40,
                                borderRadius: '$full',
                                backgroundColor: activeDay === day.id ? Theme.colors.sanctuarySaffron : Theme.colors.midnightBlue,
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderWidth: 1,
                                borderColor: activeDay === day.id ? Theme.colors.sanctuarySaffron : 'transparent',
                            }}
                        >
                            <Text bold={activeDay === day.id} color={activeDay === day.id ? Theme.colors.white : Theme.colors.mistGray}>
                                {day.label}
                            </Text>
                        </Pressable>
                    ))}
                </HStack>
                <HStack space="sm">
                    <Button
                        size="sm"
                        variant="link"
                        onPress={() => {
                            setEditingPeriod({ type: 'subject', period_number: (periods.length + 1) });
                            setShowEditor(true);
                        }}
                    >
                        <Plus size={20} color={Theme.colors.sanctuarySaffron} />
                    </Button>
                    <Button
                        variant="link"
                        onPress={() => setShowFullWeek(true)}
                        sx={{ paddingRight: 0 }}
                    >
                        <Maximize2 size={20} color={Theme.colors.sanctuarySaffron} />
                    </Button>
                </HStack>
            </HStack>

            {/* List */}
            {loading && periods.length === 0 ? (
                <Center sx={{ flex: 1 }}>
                    <Spinner color={Theme.colors.sanctuarySaffron} />
                </Center>
            ) : periods.length === 0 ? (
                <EmptyState
                    icon={Clock}
                    title="No classes scheduled"
                    description="Tap the + button to add a lesson."
                    minHeight={200}
                />
            ) : (
                <ScrollView showsVerticalScrollIndicator={false}>
                    <VStack space="md">
                        {periods.map((period) => {
                            const active = isPeriodActive(period.start_time, period.end_time);
                            const passed = !active && new Date().getHours() > parseInt(period.end_time.split(':')[0]);

                            let bgColor: string = Theme.colors.midnightBlue;
                            let borderColor: string = 'transparent';
                            if (active) {
                                bgColor = Theme.colors.deepIndigo as string;
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
                                        p="$4"
                                        sx={{
                                            backgroundColor: bgColor,
                                            borderRadius: Theme.corners.comfortable,
                                            borderWidth: 1,
                                            borderColor: borderColor,
                                            opacity: passed ? 0.6 : 1,
                                            ... (active ? Theme.shadows.md : {})
                                        }}
                                    >
                                        <HStack space="md" alignItems="center">
                                            <VStack alignItems="center" sx={{ width: 60 }}>
                                                <Text size="xs" color={Theme.colors.mistGray}>{period.start_time?.slice(0, 5)}</Text>
                                                <Box sx={{ width: 1, height: 10, backgroundColor: Theme.colors.dimGray, my: 2 }} />
                                                <Text size="xs" color={Theme.colors.mistGray}>{period.end_time?.slice(0, 5)}</Text>
                                            </VStack>

                                            <VStack sx={{ flex: 1 }}>
                                                <HStack justifyContent="space-between" alignItems="center">
                                                    <Heading size="sm" color={active ? Theme.colors.sanctuarySaffron : Theme.colors.sacredWhite}>
                                                        {period.subject}
                                                    </Heading>
                                                    {active && (
                                                        <Box px="$2" py="$0.5" sx={{ backgroundColor: Theme.colors.sanctuarySaffron, borderRadius: '$full' }}>
                                                            <Text size="2xs" color={Theme.colors.white} bold>NOW</Text>
                                                        </Box>
                                                    )}
                                                </HStack>
                                                <HStack space="xs" alignItems="center">
                                                    <Text size="xs" color={Theme.colors.mistGray}>{period.class_name}</Text>
                                                    {period.type === 'relief' && (
                                                        <Text size="xs" color={Theme.colors.emberRed} italic>(Relief)</Text>
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
                <ModalContent sx={{ backgroundColor: Theme.colors.midnightBlue }}>
                    <ModalHeader>
                        <Heading size="lg" color={Theme.colors.sanctuarySaffron}>
                            {editingPeriod?.id ? "Edit Period" : "New Period"}
                        </Heading>
                        <ModalCloseButton>
                            <CloseIcon color={Theme.colors.mistGray} />
                        </ModalCloseButton>
                    </ModalHeader>
                    <ModalBody>
                        <VStack space="lg" pb="$6">
                            <Input variant="outline" size="md">
                                <InputField
                                    placeholder="Subject (e.g. Math)"
                                    value={editingPeriod?.subject}
                                    onChangeText={(val) => setEditingPeriod({ ...editingPeriod, subject: val })}
                                    color={Theme.colors.sacredWhite}
                                />
                            </Input>
                            <Input variant="outline" size="md">
                                <InputField
                                    placeholder="Class (e.g. 10-A)"
                                    value={editingPeriod?.class_name}
                                    onChangeText={(val) => setEditingPeriod({ ...editingPeriod, class_name: val })}
                                    color={Theme.colors.sacredWhite}
                                />
                            </Input>

                            <HStack space="md">
                                <Input variant="outline" size="md" style={{ flex: 1 }}>
                                    <InputField
                                        placeholder="Start (08:00)"
                                        value={editingPeriod?.start_time}
                                        onChangeText={(val) => setEditingPeriod({ ...editingPeriod, start_time: val })}
                                        color={Theme.colors.sacredWhite}
                                    />
                                </Input>
                                <Input variant="outline" size="md" style={{ flex: 1 }}>
                                    <InputField
                                        placeholder="End (08:40)"
                                        value={editingPeriod?.end_time}
                                        onChangeText={(val) => setEditingPeriod({ ...editingPeriod, end_time: val })}
                                        color={Theme.colors.sacredWhite}
                                    />
                                </Input>
                            </HStack>

                            <Select
                                selectedValue={editingPeriod?.type}
                                onValueChange={(val) => setEditingPeriod({ ...editingPeriod, type: val as any })}
                            >
                                <SelectTrigger variant="outline" size="md">
                                    <SelectInput placeholder="Type" color={Theme.colors.sacredWhite} />
                                    <SelectIcon as={ChevronDown} mr="$3" />
                                </SelectTrigger>
                                <SelectPortal>
                                    <SelectBackdrop />
                                    <SelectContent>
                                        <SelectItem label="Subject" value="subject" />
                                        <SelectItem label="Relief" value="relief" />
                                        <SelectItem label="Interval" value="interval" />
                                    </SelectContent>
                                </SelectPortal>
                            </Select>

                            <HStack space="md" mt="$4">
                                {editingPeriod?.id && (
                                    <Button
                                        variant="outline"
                                        action="negative"
                                        sx={{ flex: 1 }}
                                        onPress={() => deletePeriod(editingPeriod.id!)} // Note: Hook handles optimistic UI but here we just call it
                                    >
                                        <Trash size={18} color={Theme.colors.emberRed} />
                                        <ButtonText ml="$2" color={Theme.colors.emberRed}>Delete</ButtonText>
                                    </Button>
                                )}
                                <Button
                                    action="primary"
                                    sx={{ flex: 2, backgroundColor: Theme.colors.sanctuarySaffron }}
                                    onPress={handleSave}
                                >
                                    <ButtonText color={Theme.colors.white}>Save</ButtonText>
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
