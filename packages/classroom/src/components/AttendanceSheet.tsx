/**
 * AttendanceSheet Component
 * 
 * Fast, swipe-based attendance marking interface
 * - Swipe Right: Present (Green Check)
 * - Swipe Left: Absent (Red X)
 * - Long Press: Late (Yellow Clock)
 * - Default: All students marked as Present
 */

import React, { useEffect } from 'react';
import {
    Box,
    VStack,
    HStack,
    Text,
    Heading,
    FlatList,
    Pressable,
    Input,
    InputField,
    hapticLight,
} from '@repo/ui';
import { useTranslation } from 'react-i18next';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import { Check, X, Clock, Search } from 'lucide-react-native';
import { useAttendance } from '../hooks/useAttendance';

// Types
import { AttendanceStatus, StudentAttendance } from '@repo/core';

interface AttendanceSheetProps {
    classroomId: string;
    date?: string;
    initialStudents?: StudentAttendance[];
    onAttendanceChange?: (attendance: StudentAttendance[]) => void;
}

// Status configuration
const STATUS_CONFIG = {
    present: {
        color: '#8BBF7A', // sageGreen
        icon: Check,
        label: 'attendance.status.present',
    },
    absent: {
        color: '#FF6347', // emberRed
        icon: X,
        label: 'attendance.status.absent',
    },
    late: {
        color: '#FFB84D', // amberGlow
        icon: Clock,
        label: 'attendance.status.late',
    },
};

export default function AttendanceSheet({
    classroomId,
    date = new Date().toISOString().split('T')[0],
    initialStudents = [],
    onAttendanceChange,
}: AttendanceSheetProps) {
    const { t } = useTranslation();
    const {
        students,
        setStudents,
        searchQuery,
        setSearchQuery,
        updateStudentStatus,
        filteredStudents,
        stats
    } = useAttendance(initialStudents);

    useEffect(() => {
        if (initialStudents.length === 0 && students.length === 0) {
            // Fallback mock fetch
            const mockStudents: StudentAttendance[] = [
                { id: '1', student_id: 's1', full_name: 'Anura Kumara', roll_number: '1', status: 'present' },
                { id: '2', student_id: 's2', full_name: 'Sithum Silva', roll_number: '2', status: 'present' },
                { id: '3', student_id: 's3', full_name: 'Nimal Perera', roll_number: '3', status: 'present' },
            ];
            setStudents(mockStudents);
        }
    }, [initialStudents, students.length, setStudents]);

    // Notify parent on change
    useEffect(() => {
        if (onAttendanceChange) {
            onAttendanceChange(students);
        }
    }, [students, onAttendanceChange]);

    const handleUpdateStatus = (id: string, status: AttendanceStatus) => {
        hapticLight();
        updateStudentStatus(id, status);
    };

    // Render swipeable student row
    const renderStudentRow = ({ item }: { item: StudentAttendance }) => {
        const studentStatus = item.status as keyof typeof STATUS_CONFIG;
        const StatusIcon = STATUS_CONFIG[studentStatus].icon;

        return (
            <Swipeable
                renderRightActions={() => (
                    <Box
                        className="justify-center items-center w-20 rounded-xl my-1"
                        style={{
                            backgroundColor: STATUS_CONFIG.present.color,
                        }}
                    >
                        <Check color="white" size={24} />
                    </Box>
                )}
                renderLeftActions={() => (
                    <Box
                        className="justify-center items-center w-20 rounded-xl my-1"
                        style={{
                            backgroundColor: STATUS_CONFIG.absent.color,
                        }}
                    >
                        <X color="white" size={24} />
                    </Box>
                )}
                onSwipeableRightOpen={() => handleUpdateStatus(item.id, 'present')}
                onSwipeableLeftOpen={() => handleUpdateStatus(item.id, 'absent')}
            >
                <Pressable
                    onPress={() => {}}
                    onLongPress={() => handleUpdateStatus(item.id, 'late')}
                    delayLongPress={500}
                >
                    <Box
                        className="bg-background-50 rounded-xl p-4 my-1"
                        style={{
                            borderLeftWidth: 4,
                            borderLeftColor: (STATUS_CONFIG as any)[item.status as keyof typeof STATUS_CONFIG].color,
                        }}
                    >
                        <HStack className="items-center justify-between gap-3">
                            <HStack className="items-center flex-1 gap-3">
                                {item.roll_number && (
                                    <Box
                                        className="w-10 h-10 rounded-full bg-background-100 justify-center items-center"
                                    >
                                        <Text className="text-typography-500 font-bold">
                                            {item.roll_number}
                                        </Text>
                                    </Box>
                                )}
                                <VStack className="flex-1">
                                    <Text className="text-typography-900 text-base font-bold">
                                        {item.full_name}
                                    </Text>
                                    <Text className="text-typography-500 text-xs">
                                        {t('attendance.sheet.swipeHint')}
                                    </Text>
                                </VStack>
                            </HStack>
                            <Box
                                className="w-10 h-10 rounded-full justify-center items-center"
                                style={{
                                    backgroundColor: (STATUS_CONFIG as any)[studentStatus].color,
                                }}
                            >
                                <StatusIcon color="white" size={20} />
                            </Box>
                        </HStack>
                    </Box>
                </Pressable>
            </Swipeable>
        );
    };

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <Box className="flex-1 bg-background-50">
                <VStack className="flex-1 p-4 gap-3">
                    {/* Header with stats */}
                    <Box>
                        <Heading className="text-typography-900 text-lg mb-1">
                            {t('attendance.sheet.title')}
                        </Heading>
                        <Text className="text-typography-500 text-sm mb-4">
                            {date}
                        </Text>

                        {/* Stats Row */}
                        <HStack className="gap-2 mb-4">
                            <Box
                                className="flex-1 bg-background-50 p-2 rounded-xl border-l-[3px]"
                                style={{
                                    borderLeftColor: STATUS_CONFIG.present.color,
                                }}
                            >
                                <Text className="text-typography-500 text-xs">
                                    {t('attendance.stats.present')}
                                </Text>
                                <Text className="text-typography-900 text-lg font-bold">
                                    {stats.present}
                                </Text>
                            </Box>
                            <Box
                                className="flex-1 bg-background-50 p-2 rounded-xl border-l-[3px]"
                                style={{
                                    borderLeftColor: STATUS_CONFIG.absent.color,
                                }}
                            >
                                <Text className="text-typography-500 text-xs">
                                    {t('attendance.stats.absent')}
                                </Text>
                                <Text className="text-typography-900 text-lg font-bold">
                                    {stats.absent}
                                </Text>
                            </Box>
                            <Box
                                className="flex-1 bg-background-50 p-2 rounded-xl border-l-[3px]"
                                style={{
                                    borderLeftColor: STATUS_CONFIG.late.color,
                                }}
                            >
                                <Text className="text-typography-500 text-xs">
                                    {t('attendance.stats.late')}
                                </Text>
                                <Text className="text-typography-900 text-lg font-bold">
                                    {stats.late}
                                </Text>
                            </Box>
                        </HStack>
                    </Box>

                    {/* Search Bar */}
                    <Box>
                        <Input
                            className="bg-background-50 border-transparent rounded-xl h-12 flex-row items-center"
                        >
                            <Box className="pl-2">
                                <Search className="text-typography-500" size={20} />
                            </Box>
                            <InputField
                                placeholder={t('common.searchPlaceholder') || 'Search students...'}
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                className="flex-1 text-typography-900"
                                placeholderTextColor="#968E80"
                            />
                        </Input>
                    </Box>

                    {/* Student List */}
                    <Box className="flex-1">
                        {filteredStudents.length === 0 ? (
                            <Box className="flex-1 justify-center items-center">
                                <Text className="text-typography-500">
                                    {searchQuery ? t('common.noResults') || 'No students found' : t('attendance.sheet.noStudents') || 'No students in this class'}
                                </Text>
                            </Box>
                        ) : (
                            <FlatList
                                data={filteredStudents}
                                renderItem={renderStudentRow}
                                keyExtractor={(item: any) => item.id}
                                showsVerticalScrollIndicator={false}
                            />
                        )}
                    </Box>

                    {/* Legend */}
                    <Box
                        className="bg-background-100 p-4 rounded-xl"
                    >
                        <Text className="text-typography-500 text-xs mb-1">
                            {t('common.quickActions') || 'Quick Actions:'}
                        </Text>
                        <VStack className="gap-2">
                            <HStack className="items-center gap-2">
                                <Text className="text-typography-900 text-xs">→</Text>
                                <Text className="text-typography-500 text-xs">
                                    {t('attendance.sheet.swipeHintRight') || 'Swipe Right = Present'}
                                </Text>
                            </HStack>
                            <HStack className="items-center gap-2">
                                <Text className="text-typography-900 text-xs">←</Text>
                                <Text className="text-typography-500 text-xs">
                                    {t('attendance.sheet.swipeHintLeft') || 'Swipe Left = Absent'}
                                </Text>
                            </HStack>
                            <HStack className="items-center gap-2">
                                <Text className="text-typography-900 text-xs">⏱</Text>
                                <Text className="text-typography-500 text-xs">
                                    {t('attendance.sheet.swipeHintLong') || 'Long Press = Late'}
                                </Text>
                            </HStack>
                        </VStack>
                    </Box>
                </VStack>
            </Box>
        </GestureHandlerRootView>
    );
}
