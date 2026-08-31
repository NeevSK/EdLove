/**
 * AttendanceSheet Component
 *
 * Fast, swipe-based attendance marking interface
 */

import type { AttendanceStatus, StudentAttendance } from '@repo/core/logic';
import { SanctuaryFlashList } from '@repo/ui/components/SanctuaryFlashList';
import { Check, Clock, Search, X } from '@repo/ui/icons';
import {
  Box,
  Heading,
  HStack,
  Icon,
  Input,
  InputField,
  Pressable,
  Text,
  VStack,
} from '@repo/ui/primitives';
import { hapticLight } from '@repo/ui/utils/haptics';

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import { useAttendance } from '@repo/classroom/hooks/useAttendance';

// Status configuration with semantic mappings
const STATUS_CONFIG = {
  present: {
    colorClass: 'bg-sageGreen',
    textClass: 'text-sageGreen',
    borderClass: 'border-sageGreen',
    icon: Check,
    label: 'attendance.status.present',
  },
  absent: {
    colorClass: 'bg-emberRed',
    textClass: 'text-emberRed',
    borderClass: 'border-emberRed',
    icon: X,
    label: 'attendance.status.absent',
  },
  late: {
    colorClass: 'bg-amberGlow',
    textClass: 'text-amberGlow',
    borderClass: 'border-amberGlow',
    icon: Clock,
    label: 'attendance.status.late',
  },
};

export default function AttendanceSheet({
  date = new Date().toISOString().split('T')[0],
  initialStudents = [],
  onAttendanceChange,
}: AttendanceSheetProps) {
  const { t } = useTranslation();
  const {
    students,
    searchQuery,
    setSearchQuery,
    updateStudentStatus,
    filteredStudents,
    stats,
  } = useAttendance(initialStudents);

  // Notify parent on change
  useEffect(() => {
    if (onAttendanceChange) {
      onAttendanceChange(students);
    }
  }, [students, onAttendanceChange]);

  const handleUpdateStatus = (id: string, status: AttendanceStatus) => {
    hapticLight();
    const student = students.find((s) => s.id === id);
    if (!student) return;

    updateStudentStatus(id, status);
  };

  // Render swipeable student row
  const renderStudentRow = ({ item }: { item: StudentAttendance }) => {
    const studentStatus = (item.status || 'present') as keyof typeof STATUS_CONFIG;
    const config = STATUS_CONFIG[studentStatus];

    return (
      <Swipeable
        renderRightActions={() => (
          <Box
            className={`justify-center items-center w-20 rounded-comfortable my-1.5 ml-2 ${STATUS_CONFIG.present.colorClass}`}
          >
            <Icon as={Check} className="text-sacredWhite" size={24} />
          </Box>
        )}
        renderLeftActions={() => (
          <Box
            className={`justify-center items-center w-20 rounded-comfortable my-1.5 mr-2 ${STATUS_CONFIG.absent.colorClass}`}
          >
            <Icon as={X} className="text-sacredWhite" size={24} />
          </Box>
        )}
        onSwipeableOpen={(direction) => {
          if (direction === 'right') {
            handleUpdateStatus(item.id, 'present');
          } else {
            handleUpdateStatus(item.id, 'absent');
          }
        }}
      >
        <Pressable
          onLongPress={() => handleUpdateStatus(item.id, 'late')}
          delayLongPress={500}
          accessibilityRole="button"
          accessibilityLabel={`Mark ${item.full_name} late`}
          accessibilityHint="Swipe right for present, swipe left for absent, or hold to mark late."
        >
          <Box
            className={`bg-phase-surface rounded-comfortable p-4 my-1.5 border-l-4 ${config.borderClass} border border-phase-canvas/30`}
          >
            <HStack className="items-center justify-between gap-3">
              <HStack className="items-center flex-1 gap-4">
                {item.roll_number && (
                  <Box className="w-10 h-10 rounded-full bg-phase-canvas justify-center items-center">
                    <Text className="text-phaseText-secondary font-bold text-sm">
                      {item.roll_number}
                    </Text>
                  </Box>
                )}
                <VStack className="flex-1">
                  <Text className="text-phaseText-primary text-base font-bold">
                    {item.full_name}
                  </Text>
                  <Text className="text-phaseText-secondary text-xs">
                    {t('attendance.sheet.swipeHint') || 'Swipe to mark status'}
                  </Text>
                </VStack>
              </HStack>
              <Box
                className={`w-10 h-10 rounded-full justify-center items-center ${config.colorClass}`}
              >
                <Icon as={config.icon} className="text-sacredWhite" size={20} />
              </Box>
            </HStack>
          </Box>
        </Pressable>
      </Swipeable>
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Box className="flex-1 bg-phase-world">
        <VStack className="flex-1 p-4 gap-6">
          {/* Header with stats */}
          <Box>
            <Heading className="text-phaseText-primary text-xl mb-1 mt-2">
              {t('attendance.sheet.title') || 'Attendance Register'}
            </Heading>
            <HStack className="items-center justify-between mb-6">
              <Text className="text-phaseText-secondary text-sm">{date}</Text>

            </HStack>

            {/* Stats Row */}
            <HStack className="gap-3">
              <Box className="flex-1 bg-phase-surface p-3 rounded-comfortable border-l-[3px] border-l-sageGreen border border-phase-canvas/50">
                <Text className="text-phaseText-secondary text-[10px] uppercase font-bold tracking-wider mb-1">
                  {t('attendance.stats.present') || 'Present'}
                </Text>
                <Text className="text-phaseText-primary text-2xl font-bold">{stats.present}</Text>
              </Box>
              <Box className="flex-1 bg-phase-surface p-3 rounded-comfortable border-l-[3px] border-l-emberRed border border-phase-canvas/50">
                <Text className="text-phaseText-secondary text-[10px] uppercase font-bold tracking-wider mb-1">
                  {t('attendance.stats.absent') || 'Absent'}
                </Text>
                <Text className="text-phaseText-primary text-2xl font-bold">{stats.absent}</Text>
              </Box>
              <Box className="flex-1 bg-phase-surface p-3 rounded-comfortable border-l-[3px] border-l-amberGlow border border-phase-canvas/50">
                <Text className="text-phaseText-secondary text-[10px] uppercase font-bold tracking-wider mb-1">
                  {t('attendance.stats.late') || 'Late'}
                </Text>
                <Text className="text-phaseText-primary text-2xl font-bold">{stats.late}</Text>
              </Box>
            </HStack>
          </Box>

          {/* Search Bar */}
          <Box>
            <Input className="bg-phase-surface border-phase-canvas/50 rounded-comfortable h-14 flex-row items-center px-4">
              <Icon as={Search} className="text-phaseText-secondary mr-2" size={20} />
              <InputField
                placeholder={t('common.searchPlaceholder') || 'Search students...'}
                value={searchQuery}
                onChangeText={setSearchQuery}
                className="flex-1 text-phaseText-primary text-base"
              />
            </Input>
          </Box>

          {/* Student List */}
          <Box className="flex-1">
            {filteredStudents.length === 0 ? (
              <Box className="flex-1 justify-center items-center py-20 bg-phase-surface/50 rounded-generous border border-dashed border-phase-canvas">
                <Text className="text-phaseText-secondary text-center px-10">
                  {searchQuery
                    ? t('common.noResults') || 'No students match your search.'
                    : t('attendance.sheet.noStudents') || 'No students currently enrolled.'}
                </Text>
              </Box>
            ) : (
              <SanctuaryFlashList
                data={filteredStudents}
                renderItem={renderStudentRow}
                keyExtractor={(item: StudentAttendance) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}
              />
            )}
          </Box>

          {/* Legend */}
          <Box className="bg-phase-surface p-4 rounded-generous border border-phase-canvas">
            <Text className="text-phaseText-secondary text-[10px] uppercase font-black tracking-wider mb-3">
              {t('common.quickActions') || 'Interaction Protocol'}
            </Text>
            <VStack className="gap-3">
              <HStack className="items-center gap-4">
                <Box className="w-6 h-6 rounded-full bg-sageGreen/10 items-center justify-center">
                  <Icon as={Check} size={12} className="text-sageGreen" />
                </Box>
                <Text className="text-phaseText-secondary text-xs font-medium">
                  {t('attendance.sheet.swipeHintRight') || 'Swipe Right to mark as Present'}
                </Text>
              </HStack>
              <HStack className="items-center gap-4">
                <Box className="w-6 h-6 rounded-full bg-emberRed/10 items-center justify-center">
                  <Icon as={X} size={12} className="text-emberRed" />
                </Box>
                <Text className="text-phaseText-secondary text-xs font-medium">
                  {t('attendance.sheet.swipeHintLeft') || 'Swipe Left to mark as Absent'}
                </Text>
              </HStack>
              <HStack className="items-center gap-4">
                <Box className="w-6 h-6 rounded-full bg-amberGlow/10 items-center justify-center">
                  <Icon as={Clock} size={12} className="text-amberGlow" />
                </Box>
                <Text className="text-phaseText-secondary text-xs font-medium">
                  {t('attendance.sheet.swipeHintLong') || 'Long Press to mark as Late'}
                </Text>
              </HStack>
            </VStack>
          </Box>
        </VStack>
      </Box>
    </GestureHandlerRootView>
  );
}

interface AttendanceSheetProps {
  classroomId: string;
  date?: string;
  initialStudents?: StudentAttendance[];
  onAttendanceChange?: (attendance: StudentAttendance[]) => void;
}
