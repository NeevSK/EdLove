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
    Icon,
    Spinner,
    useToast,
    Toast,
    ToastTitle,
} from "@gluestack-ui/themed";
import { Maximize2, Plus, Edit2, Clock, Trash, ChevronDown } from 'lucide-react-native';
import { supabase } from '../lib/supabase';

interface Period {
    id: string;
    user_id: string;
    day_of_week: number;
    period_number: number;
    subject: string;
    class_name: string;
    type: 'subject' | 'relief' | 'interval';
    start_time: string;
    end_time: string;
}

const DAYS = [
    { id: 1, label: 'M' },
    { id: 2, label: 'T' },
    { id: 3, label: 'W' },
    { id: 4, label: 'T' },
    { id: 5, label: 'F' },
];

export default function DailyRhythm() {
    const [activeDay, setActiveDay] = useState(new Date().getDay() || 1);
    if (activeDay > 5) setActiveDay(1); // Set to Monday if weekend

    const [periods, setPeriods] = useState<Period[]>([]);
    const [loading, setLoading] = useState(true);
    const [showFullWeek, setShowFullWeek] = useState(false);
    const [showEditor, setShowEditor] = useState(false);
    const [editingPeriod, setEditingPeriod] = useState<Partial<Period> | null>(null);
    const [currentTime, setCurrentTime] = useState(new Date());
    const toast = useToast();

    useEffect(() => {
        fetchPeriods();
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, [activeDay]);

    async function fetchPeriods() {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('timetable')
                .select('*')
                .eq('day_of_week', activeDay)
                .order('start_time', { ascending: true });

            if (error) throw error;
            setPeriods(data || []);
        } catch (error: any) {
            showToast(error.message, "error");
        } finally {
            setLoading(false);
        }
    }

    async function handleSavePeriod() {
        if (!editingPeriod?.subject || !editingPeriod?.start_time || !editingPeriod?.end_time) {
            showToast("Missing required fields", "error");
            return;
        }

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            const periodData = {
                ...editingPeriod,
                user_id: user.id,
                day_of_week: activeDay,
            };

            if (editingPeriod.id) {
                const { error } = await supabase
                    .from('timetable')
                    .update(periodData)
                    .eq('id', editingPeriod.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('timetable')
                    .insert([periodData]);
                if (error) throw error;
            }

            setShowEditor(false);
            setEditingPeriod(null);
            fetchPeriods();
            showToast("Timetable updated!", "success");
        } catch (error: any) {
            showToast(error.message, "error");
        }
    }

    async function handleDeletePeriod(id: string) {
        try {
            const { error } = await supabase
                .from('timetable')
                .delete()
                .eq('id', id);
            if (error) throw error;
            fetchPeriods();
            showToast("Period removed", "success");
        } catch (error: any) {
            showToast(error.message, "error");
        }
    }

    function showToast(message: string, action: "error" | "success") {
        toast.show({
            placement: "bottom",
            render: ({ id }) => (
                <Toast nativeID={id} action={action} variant="solid">
                    <ToastTitle>{message}</ToastTitle>
                </Toast>
            ),
        });
    }

    const isPeriodActive = (start: string, end: string) => {
        const [startH, startM] = start.split(':').map(Number);
        const [endH, endM] = end.split(':').map(Number);
        const startTimeDate = new Date();
        startTimeDate.setHours(startH, startM, 0);
        const endTimeDate = new Date();
        endTimeDate.setHours(endH, endM, 0);
        return currentTime >= startTimeDate && currentTime < endTimeDate;
    };

    const isPeriodPassed = (end: string) => {
        const [endH, endM] = end.split(':').map(Number);
        const endTimeDate = new Date();
        endTimeDate.setHours(endH, endM, 0);
        return currentTime >= endTimeDate;
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
                                backgroundColor: activeDay === day.id ? '#FF9933' : '$backgroundDark800',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderWidth: 1,
                                borderColor: activeDay === day.id ? '#FF9933' : 'transparent',
                            }}
                        >
                            <Text bold={activeDay === day.id} color={activeDay === day.id ? '$white' : '$textDark400'}>
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
                        <Plus size={20} color="#FF9933" />
                    </Button>
                    <Button
                        variant="link"
                        onPress={() => setShowFullWeek(true)}
                        sx={{ paddingRight: 0 }}
                    >
                        <Maximize2 size={20} color="#FF9933" />
                    </Button>
                </HStack>
            </HStack>

            {/* Timetable List */}
            {loading ? (
                <Center sx={{ flex: 1 }}>
                    <Spinner color="#FF9933" />
                </Center>
            ) : periods.length === 0 ? (
                <Center sx={{ flex: 1, padding: '$10' }}>
                    <Text color="$textDark400" textAlign="center">
                        No periods scheduled for this day. Tap [+] to add your first lesson.
                    </Text>
                </Center>
            ) : (
                <ScrollView showsVerticalScrollIndicator={false}>
                    <VStack space="md">
                        {periods.map((period) => {
                            const active = isPeriodActive(period.start_time, period.end_time);
                            const passed = isPeriodPassed(period.end_time);

                            let bgColor = '$backgroundDark800';
                            let borderColor = 'transparent';
                            if (active) {
                                bgColor = '$backgroundDark900';
                                borderColor = '#FF9933';
                            } else if (period.type === 'interval') {
                                bgColor = 'rgba(76, 175, 80, 0.1)';
                            } else if (period.type === 'relief') {
                                bgColor = 'rgba(233, 30, 99, 0.1)';
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
                                            borderRadius: '$xl',
                                            borderWidth: 1,
                                            borderColor: borderColor,
                                            opacity: passed ? 0.5 : 1,
                                            shadowColor: active ? '#FF9933' : 'transparent',
                                            shadowOffset: { width: 0, height: 0 },
                                            shadowRadius: 10,
                                            shadowOpacity: active ? 0.5 : 0,
                                            elevation: active ? 5 : 0,
                                        }}
                                    >
                                        <HStack space="md" alignItems="center">
                                            <VStack alignItems="center" sx={{ width: 60 }}>
                                                <Text size="xs" color="$textDark400">{period.start_time?.slice(0, 5)}</Text>
                                                <Box sx={{ width: 1, height: 10, backgroundColor: '$backgroundDark600', my: 2 }} />
                                                <Text size="xs" color="$textDark400">{period.end_time?.slice(0, 5)}</Text>
                                            </VStack>

                                            <VStack sx={{ flex: 1 }}>
                                                <HStack justifyContent="space-between" alignItems="center">
                                                    <Heading size="sm" color={active ? '#FF9933' : '$textDark100'}>
                                                        {period.subject}
                                                    </Heading>
                                                    {active && (
                                                        <Box px="$2" py="$0.5" sx={{ backgroundColor: '#FF9933', borderRadius: '$full' }}>
                                                            <Text size="2xs" color="$white" bold>ACTIVE NOW</Text>
                                                        </Box>
                                                    )}
                                                </HStack>
                                                <HStack space="xs" alignItems="center">
                                                    <Text size="xs" color="$textDark400">{period.class_name}</Text>
                                                    {period.type === 'relief' && (
                                                        <Text size="xs" color="#E91E63" italic>(Relief Period)</Text>
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
                <ModalContent sx={{ backgroundColor: '$backgroundDark900', padding: '$2' }}>
                    <ModalHeader>
                        <Heading size="lg" color="$orange500">
                            {editingPeriod?.id ? "Edit Period" : "New Period"}
                        </Heading>
                        <ModalCloseButton>
                            <CloseIcon sx={{ color: '$textDark400' }} />
                        </ModalCloseButton>
                    </ModalHeader>
                    <ModalBody>
                        <VStack space="lg" pb="$6">
                            <VStack space="xs">
                                <Text size="sm" color="$textDark300">Subject</Text>
                                <Input variant="outline" size="md">
                                    <InputField
                                        placeholder="e.g. Mathematics"
                                        value={editingPeriod?.subject}
                                        onChangeText={(val) => setEditingPeriod({ ...editingPeriod, subject: val })}
                                        color="$textDark100"
                                    />
                                </Input>
                            </VStack>

                            <HStack space="md">
                                <VStack space="xs" sx={{ flex: 1 }}>
                                    <Text size="sm" color="$textDark300">Class</Text>
                                    <Input variant="outline" size="md">
                                        <InputField
                                            placeholder="e.g. 10-C"
                                            value={editingPeriod?.class_name}
                                            onChangeText={(val) => setEditingPeriod({ ...editingPeriod, class_name: val })}
                                            color="$textDark100"
                                        />
                                    </Input>
                                </VStack>
                                <VStack space="xs" sx={{ flex: 1 }}>
                                    <Text size="sm" color="$textDark300">Period #</Text>
                                    <Input variant="outline" size="md">
                                        <InputField
                                            placeholder="1-8"
                                            keyboardType="numeric"
                                            value={editingPeriod?.period_number?.toString()}
                                            onChangeText={(val) => setEditingPeriod({ ...editingPeriod, period_number: parseInt(val) })}
                                            color="$textDark100"
                                        />
                                    </Input>
                                </VStack>
                            </HStack>

                            <HStack space="md">
                                <VStack space="xs" sx={{ flex: 1 }}>
                                    <Text size="sm" color="$textDark300">Start Time</Text>
                                    <Input variant="outline" size="md">
                                        <InputField
                                            placeholder="HH:MM"
                                            value={editingPeriod?.start_time}
                                            onChangeText={(val) => setEditingPeriod({ ...editingPeriod, start_time: val })}
                                            color="$textDark100"
                                        />
                                    </Input>
                                </VStack>
                                <VStack space="xs" sx={{ flex: 1 }}>
                                    <Text size="sm" color="$textDark300">End Time</Text>
                                    <Input variant="outline" size="md">
                                        <InputField
                                            placeholder="HH:MM"
                                            value={editingPeriod?.end_time}
                                            onChangeText={(val) => setEditingPeriod({ ...editingPeriod, end_time: val })}
                                            color="$textDark100"
                                        />
                                    </Input>
                                </VStack>
                            </HStack>

                            <VStack space="xs">
                                <Text size="sm" color="$textDark300">Type</Text>
                                <Select
                                    selectedValue={editingPeriod?.type}
                                    onValueChange={(val) => setEditingPeriod({ ...editingPeriod, type: val as any })}
                                >
                                    <SelectTrigger variant="outline" size="md">
                                        <SelectInput placeholder="Select Type" color="$textDark100" />
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
                            </VStack>

                            <HStack space="md" mt="$4">
                                {editingPeriod?.id && (
                                    <Button
                                        variant="outline"
                                        action="negative"
                                        sx={{ flex: 1 }}
                                        onPress={() => handleDeletePeriod(editingPeriod.id!)}
                                    >
                                        <Trash size={18} color="#E91E63" style={{ marginRight: 8 }} />
                                        <ButtonText>Delete</ButtonText>
                                    </Button>
                                )}
                                <Button
                                    action="primary"
                                    sx={{ flex: 2, backgroundColor: '#FF9933' }}
                                    onPress={handleSavePeriod}
                                >
                                    <ButtonText color="$white">Save Period</ButtonText>
                                </Button>
                            </HStack>
                        </VStack>
                    </ModalBody>
                </ModalContent>
            </Modal>

            {/* Weekly Grid (Unchanged for brevity, same as previous) */}
            <Modal isOpen={showFullWeek} onClose={() => setShowFullWeek(false)}>
                <ModalBackdrop />
                <ModalContent sx={{ backgroundColor: '$backgroundDark950', maxWidth: '90%', maxHeight: '80%' }}>
                    <ModalHeader>
                        <Heading size="lg" color="$orange500">Weekly Rhythm</Heading>
                        <ModalCloseButton>
                            <CloseIcon sx={{ color: '$textDark400' }} />
                        </ModalCloseButton>
                    </ModalHeader>
                    <ModalBody>
                        <ScrollView horizontal>
                            <VStack space="md" pb="$10">
                                <HStack space="md">
                                    <Box sx={{ width: 60 }} />
                                    {DAYS.map(d => (
                                        <Center key={d.id} sx={{ width: 100 }}>
                                            <Text bold color="$textDark100">{d.label}</Text>
                                        </Center>
                                    ))}
                                </HStack>
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(pNum => (
                                    <HStack key={pNum} space="md">
                                        <Center sx={{ width: 60 }}>
                                            <Text size="xs" color="$textDark400">P{pNum}</Text>
                                        </Center>
                                        {/* Simplified visual representantion for grid */}
                                        {DAYS.map(d => (
                                            <Box
                                                key={d.id}
                                                sx={{
                                                    width: 100,
                                                    height: 50,
                                                    backgroundColor: '$backgroundDark800',
                                                    borderRadius: '$md',
                                                    borderWidth: 1,
                                                    borderColor: '$backgroundDark700',
                                                    justifyContent: 'center',
                                                    alignItems: 'center'
                                                }}
                                            >
                                                <Text size="2xs" color="$textDark400" textAlign="center">Lesson</Text>
                                            </Box>
                                        ))}
                                    </HStack>
                                ))}
                            </VStack>
                        </ScrollView>
                    </ModalBody>
                </ModalContent>
            </Modal>
        </VStack>
    );
}
