/**
 * DAILY RHYTHM COMPONENT
 * Personalized timetable and routine management.
 * Standardized to Zero-Legacy: purged corrupted imports and migrated to Sanctuary V3 architecture.
 */

import { useIsGuest } from '@repo/core/hooks';
import { useTimetable } from '@repo/self/hooks/useTimetable';
import type { Period } from '@repo/self/types';
import ErrorBoundary from '@repo/ui/components/ErrorBoundary';
import PositiveInvitation from '@repo/ui/components/PositiveInvitation';
import { SkeletonCard } from '@repo/ui/components/SkeletonLoader';
import {
  Book,
  ChevronDown,
  CircleAlert,
  Clock,
  Cloud,
  Coffee,
  Plus,
  Trash,
  X,
} from '@repo/ui/icons';
import {
  Box,
  Heading,
  HStack,
  Icon,
  Input,
  InputField,
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  Pressable,
  ScrollView,
  Select,
  SelectBackdrop,
  SelectContent,
  SelectIcon,
  SelectInput,
  SelectItem,
  SelectPortal,
  SelectTrigger,
  Text,
  Toast,
  ToastTitle,
  VStack,
} from '@repo/ui/primitives';
import { useToast } from '@repo/ui/providers';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Animated, { FadeInDown, FadeInRight, Layout } from 'react-native-reanimated';

const DAYS = [
  { id: 1, label: 'M' },
  { id: 2, label: 'T' },
  { id: 3, label: 'W' },
  { id: 4, label: 'T' },
  { id: 5, label: 'F' },
];

function DailyRhythmContent() {
  const { t } = useTranslation();
  const isGuest = useIsGuest();
  const [activeDay, setActiveDay] = useState(() => {
    const d = new Date().getDay();
    return d === 0 || d === 6 ? 1 : d;
  });

  const { periods, loading, addPeriod, updatePeriod, deletePeriod } = useTimetable(activeDay);

  const [_showFullWeek, _setShowFullWeek] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState<Partial<Period> | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const toast = useToast() as any;

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const handleSave = async () => {
    if (!editingPeriod?.subject || !editingPeriod?.start_time || !editingPeriod?.end_time) {
      toast.show({
        placement: 'top',
        render: ({ id }: { id: string }) => (
          <Toast
            nativeID={id}
            className="bg-emberRed/20 border border-emberRed/30 px-4 py-3 rounded-2xl"
          >
            <HStack className="gap-2 items-center">
              <Icon as={CircleAlert} className="text-emberRed" size={16} />
              <ToastTitle className="text-sacredWhite text-sm font-bold">
                {t('self.missingFields') || 'Required fields missing'}
              </ToastTitle>
            </HStack>
          </Toast>
        ),
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
          end_time: editingPeriod.end_time!,
        });
      }
      setShowEditor(false);
      setEditingPeriod(null);
      toast.show({
        placement: 'top',
        render: ({ id }: { id: string }) => (
          <Toast
            nativeID={id}
            className="bg-emeraldGreen/20 border border-emeraldGreen/30 px-4 py-3 rounded-2xl"
          >
            <ToastTitle className="text-sacredWhite text-sm font-bold">
              {t('self.timetableUpdated') || 'Timetable Resonated'}
            </ToastTitle>
          </Toast>
        ),
      });
    } catch (err) {
      console.error('[DailyRhythm] Save error:', err);
      toast.show({
        placement: 'top',
        render: ({ id }: { id: string }) => (
          <Toast
            nativeID={id}
            className="bg-emberRed/20 border border-emberRed/30 px-4 py-3 rounded-2xl"
          >
            <ToastTitle className="text-sacredWhite text-sm font-bold">
              {t('self.timetableSaveFailed') || 'Timetable could not be saved. Please try again.'}
            </ToastTitle>
          </Toast>
        ),
      });
    }
  };

  const isPeriodActive = (start: string, end: string) => {
    if (!start || !end) return false;
    const now = currentTime.getHours() * 60 + currentTime.getMinutes();
    const [sH = 0, sM = 0] = start.split(':').map(Number);
    const [eH = 0, eM = 0] = end.split(':').map(Number);
    return now >= sH * 60 + sM && now < eH * 60 + eM;
  };

  return (
    <VStack className="gap-6 flex-1">
      {/* Guest Mode Banner */}
      {isGuest && (
        <Box className="p-4 bg-obsidian rounded-2xl border border-sanctuarySaffron/20 bg-sanctuarySaffron/5">
          <HStack className="gap-3 items-center">
            <Icon as={Cloud} size={18} className="text-sanctuarySaffron" />
            <Text className="text-xs text-sacredWhite/80 font-medium flex-1">
              {t('self.guestMode') || 'Transient Session — rhythm data is stored locally.'}
            </Text>
          </HStack>
        </Box>
      )}

      {/* Header & Day Picker */}
      <HStack className="justify-between items-center bg-white/5 p-1 rounded-full border border-white/5">
        <HStack className="gap-1 flex-1">
          {DAYS.map((day) => (
            <Pressable
              key={day.id}
              onPress={() => setActiveDay(day.id)}
              accessibilityRole="tab"
              accessibilityLabel={`Day ${day.label}`}
              accessibilityState={{ selected: activeDay === day.id }}
              className={`flex-1 h-10 rounded-full items-center justify-center transition-all ${
                activeDay === day.id
                  ? 'bg-sanctuarySaffron shadow-lg shadow-sanctuarySaffron/20'
                  : 'bg-transparent'
              }`}
            >
              <Text
                className={`text-xs font-black uppercase tracking-widest ${
                  activeDay === day.id ? 'text-obsidian' : 'text-mistGray/40'
                }`}
              >
                {day.label}
              </Text>
            </Pressable>
          ))}
        </HStack>

        <HStack className="gap-1 px-1">
          <Pressable
            onPress={() => {
              setEditingPeriod({
                type: 'subject',
                period_number: (periods?.length || 0) + 1,
              });
              setShowEditor(true);
            }}
            className="w-10 h-10 items-center justify-center rounded-full bg-sanctuarySaffron/10 border border-sanctuarySaffron/20"
            accessibilityRole="button"
            accessibilityLabel="Add timetable period"
          >
            <Icon as={Plus} size={18} className="text-sanctuarySaffron" />
          </Pressable>
        </HStack>
      </HStack>

      {/* List */}
      {loading && (!periods || periods.length === 0) ? (
        <VStack className="gap-4 flex-1">
          <SkeletonCard className="h-24 bg-white/5" />
          <SkeletonCard className="h-24 bg-white/5" />
          <SkeletonCard className="h-24 bg-white/5" />
        </VStack>
      ) : !periods || periods.length === 0 ? (
        <Box className="flex-1 mt-10">
          <Animated.View entering={FadeInDown}>
            <PositiveInvitation
              icon={Clock}
              title={t('self.noClasses') || 'Undetermined Flow'}
              description={
                t('self.addLesson') || 'Map your daily rhythm to surface moments of focus.'
              }
            />
          </Animated.View>
        </Box>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
          <VStack className="gap-4 pb-20">
            {periods.map((period, index) => {
              const active = isPeriodActive(period.start_time || '', period.end_time || '');
              const endHour = (period.end_time || '00:00').split(':')[0];
              const passed = !active && currentTime.getHours() > parseInt(endHour || '0', 10);

              return (
                <Animated.View
                  key={period.id}
                  entering={FadeInRight.delay(index * 100)}
                  layout={Layout}
                >
                  <Pressable
                    onLongPress={() => {
                      setEditingPeriod(period);
                      setShowEditor(true);
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={`Edit ${period.subject || period.activity || 'timetable period'}`}
                    accessibilityHint="Long press to edit this timetable period"
                    className={`p-5 rounded-3xl border transition-all active:scale-[0.98] ${
                      active
                        ? 'bg-sanctuarySaffron/10 border-sanctuarySaffron shadow-xl shadow-sanctuarySaffron/5'
                        : period.type === 'interval'
                          ? 'bg-emeraldGreen/5 border-emeraldGreen/10'
                          : 'bg-white/5 border-white/5'
                    } ${passed ? 'opacity-40 grayscale-[0.5]' : 'opacity-100'}`}
                  >
                    <HStack className="gap-5 items-center">
                      <VStack className="items-center w-14 gap-1">
                        <Text className="text-[10px] font-black tracking-tighter text-mistGray/40">
                          {period.start_time?.slice(0, 5)}
                        </Text>
                        <Box
                          className={`w-0.5 h-4 rounded-full ${active ? 'bg-sanctuarySaffron' : 'bg-white/10'}`}
                        />
                        <Text className="text-[10px] font-black tracking-tighter text-mistGray/80">
                          {period.end_time?.slice(0, 5)}
                        </Text>
                      </VStack>

                      <VStack className="flex-1 gap-1">
                        <HStack className="justify-between items-center">
                          <Heading
                            size="xs"
                            className={`font-black tracking-tight ${active ? 'text-sanctuarySaffron' : 'text-sacredWhite'}`}
                          >
                            {period.subject || period.activity}
                          </Heading>
                          {active && (
                            <Box className="bg-sanctuarySaffron px-2 py-0.5 rounded-md">
                              <Text className="text-[8px] text-obsidian font-black uppercase tracking-widest">
                                Active
                              </Text>
                            </Box>
                          )}
                        </HStack>
                        <HStack className="gap-2 items-center">
                          <Icon
                            as={period.type === 'interval' ? Coffee : Book}
                            size={12}
                            className="text-mistGray/30"
                          />
                          <Text className="text-xs text-mistGray/60 font-medium">
                            {period.class_name || 'Fluid Space'}
                          </Text>
                          {period.type === 'relief' && (
                            <Box className="bg-emberRed/10 px-1.5 py-0.5 rounded border border-emberRed/20">
                              <Text className="text-[8px] text-emberRed font-bold uppercase">
                                Relief
                              </Text>
                            </Box>
                          )}
                        </HStack>
                      </VStack>
                    </HStack>
                  </Pressable>
                </Animated.View>
              );
            })}
          </VStack>
        </ScrollView>
      )}

      {/* Editor Modal */}
      <Modal isOpen={showEditor} onClose={() => setShowEditor(false)}>
        <ModalBackdrop className="bg-black/80" />
        <ModalContent className="bg-shroud border border-white/10 rounded-[40px] p-6">
          <ModalHeader className="border-b border-white/5 pb-4 mb-6">
            <VStack className="gap-1 flex-1">
              <Text className="text-sanctuarySaffron text-[10px] font-black uppercase tracking-[0.3em]">
                Timetable Configuration
              </Text>
              <Heading className="text-2xl font-black text-sacredWhite tracking-tighter">
                {editingPeriod?.id ? 'Adjust Rhythm' : 'New Resonance'}
              </Heading>
            </VStack>
            <ModalCloseButton className="w-10 h-10 rounded-full bg-white/5 items-center justify-center">
              <Icon as={X} className="text-mistGray" size={20} />
            </ModalCloseButton>
          </ModalHeader>
          <ModalBody>
            <VStack className="gap-6 pb-6">
              <VStack className="gap-2">
                <Text className="text-mistGray/40 text-[10px] font-black uppercase tracking-widest px-1">
                  Identity
                </Text>
                <Input className="h-14 bg-white/5 border-white/10 rounded-2xl px-4 flex-row items-center">
                  <InputField
                    placeholder="Subject or Activity"
                    value={editingPeriod?.subject || ''}
                    onChangeText={(val: string) =>
                      setEditingPeriod((prev) => ({ ...prev, subject: val }))
                    }
                    className="text-sacredWhite text-sm font-bold flex-1"
                    placeholderTextColor="#4A4A4A"
                  />
                </Input>
              </VStack>

              <VStack className="gap-2">
                <Text className="text-mistGray/40 text-[10px] font-black uppercase tracking-widest px-1">
                  Location
                </Text>
                <Input className="h-14 bg-white/5 border-white/10 rounded-2xl px-4 flex-row items-center">
                  <InputField
                    placeholder="Physical or Digital Space"
                    value={editingPeriod?.class_name || ''}
                    onChangeText={(val: string) =>
                      setEditingPeriod((prev) => ({ ...prev, class_name: val }))
                    }
                    className="text-sacredWhite text-sm font-bold flex-1"
                    placeholderTextColor="#4A4A4A"
                  />
                </Input>
              </VStack>

              <HStack className="gap-4">
                <VStack className="flex-1 gap-2">
                  <Text className="text-mistGray/40 text-[10px] font-black uppercase tracking-widest px-1">
                    Arrival
                  </Text>
                  <Input className="h-14 bg-white/5 border-white/10 rounded-2xl px-4 flex-row items-center">
                    <InputField
                      placeholder="08:30"
                      value={editingPeriod?.start_time || ''}
                      onChangeText={(val: string) =>
                        setEditingPeriod((prev) => ({
                          ...prev,
                          start_time: val,
                        }))
                      }
                      className="text-sacredWhite text-sm font-bold flex-1"
                      placeholderTextColor="#4A4A4A"
                    />
                  </Input>
                </VStack>
                <VStack className="flex-1 gap-2">
                  <Text className="text-mistGray/40 text-[10px] font-black uppercase tracking-widest px-1">
                    Departure
                  </Text>
                  <Input className="h-14 bg-white/5 border-white/10 rounded-2xl px-4 flex-row items-center">
                    <InputField
                      placeholder="09:20"
                      value={editingPeriod?.end_time || ''}
                      onChangeText={(val: string) =>
                        setEditingPeriod((prev) => ({ ...prev, end_time: val }))
                      }
                      className="text-sacredWhite text-sm font-bold flex-1"
                      placeholderTextColor="#4A4A4A"
                    />
                  </Input>
                </VStack>
              </HStack>

              <VStack className="gap-2">
                <Text className="text-mistGray/40 text-[10px] font-black uppercase tracking-widest px-1">
                  Vibration Type
                </Text>
                <Select
                  value={editingPeriod?.type}
                  onValueChange={(val: string) =>
                    setEditingPeriod((prev) => ({ ...prev, type: val as any }))
                  }
                >
                  <SelectTrigger className="h-14 bg-white/5 border-white/10 rounded-2xl px-4 flex-row items-center justify-between">
                    <SelectInput
                      placeholder="Select Type"
                      className="text-sacredWhite text-sm font-bold"
                    />
                    <SelectIcon as={ChevronDown} className="text-mistGray/40" size={16} />
                  </SelectTrigger>
                  <SelectPortal>
                    <SelectBackdrop />
                    <SelectContent className="bg-shroud border-t border-white/10">
                      <SelectItem label="Standard Focus" value="subject" />
                      <SelectItem label="Relief/Alternative" value="relief" />
                      <SelectItem label="Internal Interval" value="interval" />
                    </SelectContent>
                  </SelectPortal>
                </Select>
              </VStack>

              <HStack className="gap-4 mt-8">
                {editingPeriod?.id && (
                  <Pressable
                    className="h-16 flex-1 rounded-2xl border border-emberRed/30 bg-emberRed/5 items-center justify-center flex-row gap-2 active:bg-emberRed/10"
                    accessibilityRole="button"
                    accessibilityLabel="Delete timetable period"
                    accessibilityHint="Removes this period from the timetable"
                    onPress={async () => {
                      if (editingPeriod.id) {
                        try {
                          await deletePeriod(editingPeriod.id);
                          setShowEditor(false);
                        } catch (err) {
                          console.error('[DailyRhythm] Delete error:', err);
                          toast.show({
                            placement: 'top',
                            render: ({ id }: { id: string }) => (
                              <Toast
                                nativeID={id}
                                className="bg-emberRed/20 border border-emberRed/30 px-4 py-3 rounded-2xl"
                              >
                                <ToastTitle className="text-sacredWhite text-sm font-bold">
                                  {t('self.timetableDeleteFailed') ||
                                    'Timetable period could not be deleted.'}
                                </ToastTitle>
                              </Toast>
                            ),
                          });
                        }
                      }
                    }}
                  >
                    <Icon as={Trash} className="text-emberRed" size={18} />
                    <Text className="text-emberRed text-sm font-black uppercase tracking-widest">
                      Dissolve
                    </Text>
                  </Pressable>
                )}
                <Pressable
                  className="h-16 flex-[2] bg-sanctuarySaffron rounded-2xl items-center justify-center shadow-lg shadow-sanctuarySaffron/20 active:scale-[0.98]"
                  onPress={handleSave}
                >
                  <Text className="text-obsidian text-sm font-black uppercase tracking-[0.2em]">
                    Resonated
                  </Text>
                </Pressable>
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
