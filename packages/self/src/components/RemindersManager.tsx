/**
 * REMINDERS MANAGER
 * CRUD functionality for gentle reminders
 * Default: "Drink water intermittently while teaching"
 */

import {
  createReminder,
  fetchReminders as fetchReminderRecords,
  logReminderFeedback,
  type ReminderRecord,
  deleteReminder as removeReminderRecord,
  updateReminder,
} from '@repo/self/api/selfFeatureRepository';
import { Bell, Check, Clock, Droplet, Plus, SquarePen, Trash2 } from '@repo/ui/icons';
import {
  Box,
  Button,
  ButtonText,
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
  ModalFooter,
  ModalHeader,
  Pressable,
  Text,
  VStack,
} from '@repo/ui/primitives';
import { useSanctuaryToast } from '@repo/ui/providers/ToastProvider';
import { confirmAction } from '@repo/ui/utils/dialogs';
import { hapticLight, hapticMedium, hapticSuccess } from '@repo/ui/utils/haptics';
import * as Notifications from 'expo-notifications';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform } from 'react-native';

type Reminder = ReminderRecord;

interface RemindersManagerProps {
  userId?: string;
}

const DEFAULT_REMINDER = {
  title: 'Stay Hydrated',
  description: 'Drink water intermittently while teaching',
  icon_type: 'droplet',
  is_default: true,
};

const ICON_MAP: Record<string, any> = {
  droplet: Droplet,
  bell: Bell,
  clock: Clock,
};

async function ensureNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  try {
    const { status } = await Notifications.getPermissionsAsync();
    if (status === 'granted') return true;
    const { status: next } = await Notifications.requestPermissionsAsync();
    return next === 'granted';
  } catch {
    return false;
  }
}

async function scheduleReminderNotification(reminder: Reminder) {
  if (Platform.OS === 'web' || !reminder.is_active) return;
  if (!(await ensureNotificationPermission())) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(reminder.id).catch(() => {});
    await Notifications.scheduleNotificationAsync({
      identifier: reminder.id,
      content: {
        title: reminder.title,
        body: reminder.description || 'Gentle nudge for self-care',
        sound: false,
      },
      trigger: {
        seconds: 60 * 60 * 2,
        repeats: true,
      } as unknown as Notifications.NotificationTriggerInput,
    });
  } catch {
    // Notification schedule failed, ignore gracefully
  }
}

async function cancelReminderNotification(reminderId: string) {
  if (Platform.OS === 'web') return;
  try {
    await Notifications.cancelScheduledNotificationAsync(reminderId);
  } catch {
    // Notification cancel failed, ignore gracefully
  }
}

if (Platform.OS !== 'web') {
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    } as any);
  } catch {
    // Notification handler setup failed, ignore gracefully
  }
}

export default function RemindersManager({ userId }: RemindersManagerProps) {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const { t } = useTranslation();
  const { showToast } = useSanctuaryToast();

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [iconType, setIconType] = useState('bell');

  const createDefaultReminder = useCallback(async () => {
    if (!userId) return;

    try {
      const data = await createReminder(userId, {
        ...DEFAULT_REMINDER,
        is_active: true,
      });
      setReminders([data]);
      void scheduleReminderNotification(data);
    } catch (error) {
      console.error('Error creating default reminder:', error);
    }
  }, [userId]);

  const fetchReminders = useCallback(async () => {
    try {
      if (!userId) return;
      const data = await fetchReminderRecords(userId);
      setLoadError(false);
      setReminders(data || []);
      for (const r of data || []) if (r.is_active) void scheduleReminderNotification(r);

      if (!data || data.length === 0) {
        await createDefaultReminder();
      }
    } catch (error) {
      console.error('Error fetching reminders:', error);
      setLoadError(true);
    } finally {
      setIsLoading(false);
    }
  }, [userId, createDefaultReminder]);

  useEffect(() => {
    if (userId) {
      void fetchReminders();
    }
  }, [userId, fetchReminders]);

  const openCreateModal = () => {
    setEditingReminder(null);
    setTitle('');
    setDescription('');
    setIconType('bell');
    setShowCreateModal(true);
    hapticLight();
  };

  const openEditModal = (reminder: Reminder) => {
    setEditingReminder(reminder);
    setTitle(reminder.title);
    setDescription(reminder.description || '');
    setIconType(reminder.icon_type);
    setShowCreateModal(true);
    hapticLight();
  };

  const closeModal = () => {
    setShowCreateModal(false);
    setEditingReminder(null);
    setTitle('');
    setDescription('');
    setIconType('bell');
  };

  const saveReminder = async () => {
    if (!userId || !title.trim()) return;

    hapticMedium();

    try {
      if (editingReminder) {
        await updateReminder(editingReminder.id, {
          title: title.trim(),
          description: description.trim(),
          icon_type: iconType,
        });
        await fetchReminders();
        closeModal();
      } else {
        await createReminder(userId, {
          title: title.trim(),
          description: description.trim(),
          icon_type: iconType,
          is_default: false,
          is_active: true,
        });
        await fetchReminders();
        closeModal();
      }
    } catch (error) {
      console.error('Error saving reminder:', error);
      showToast({ message: 'Reminder could not be saved. Please try again.', type: 'error' });
    }
  };

  const toggleReminder = async (reminder: Reminder) => {
    hapticLight();

    const nextActive = !reminder.is_active;
    try {
      await updateReminder(reminder.id, { is_active: nextActive });
      setReminders(
        reminders.map((r) => (r.id === reminder.id ? { ...r, is_active: nextActive } : r)),
      );
      if (nextActive) void scheduleReminderNotification({ ...reminder, is_active: true });
      else void cancelReminderNotification(reminder.id);
    } catch (error) {
      console.error('Error toggling reminder:', error);
      showToast({ message: 'Reminder status could not be updated.', type: 'error' });
    }
  };

  const deleteReminder = async (reminderId: string) => {
    const confirmed = await confirmAction(
      'Delete reminder?',
      'This will permanently remove the reminder.',
    );
    if (!confirmed) return;

    hapticMedium();

    try {
      await removeReminderRecord(reminderId);
      setReminders(reminders.filter((r) => r.id !== reminderId));
      void cancelReminderNotification(reminderId);
    } catch (error) {
      console.error('Error deleting reminder:', error);
      showToast({ message: 'Reminder could not be deleted. Please try again.', type: 'error' });
    }
  };

  const handleActionDone = async (reminder: Reminder) => {
    if (!userId) return;
    hapticSuccess();
    try {
      await logReminderFeedback(userId, {
        reminder_id: reminder.id,
        user_id: userId,
        action: 'done',
        category: reminder.category,
      });
      showToast({
        message:
          reminder.category === 'breathe'
            ? '✓ Mindful breath recorded! +3m in Somatic Pulse'
            : reminder.category === 'water'
              ? '💧 Hydration logged!'
              : `✓ ${reminder.title} completed!`,
        type: 'success',
      });
    } catch {
      showToast({ message: 'Care record saved locally.', type: 'info' });
    }
  };

  const handleActionSnooze = async (reminder: Reminder, minutes = 15) => {
    if (!userId) return;
    hapticLight();
    try {
      await logReminderFeedback(userId, {
        reminder_id: reminder.id,
        user_id: userId,
        action: 'snoozed',
        category: reminder.category,
        snooze_minutes: minutes,
      });
      showToast({ message: `⏳ Snoozed for ${minutes}m. Focus gently.`, type: 'info' });
      if (Platform.OS !== 'web') {
        void Notifications.scheduleNotificationAsync({
          identifier: `${reminder.id}-snooze`,
          content: {
            title: `[Snoozed] ${reminder.title}`,
            body: reminder.description || 'Gentle nudge for self-care',
            sound: false,
          },
          trigger: {
            seconds: minutes * 60,
          } as unknown as Notifications.NotificationTriggerInput,
        });
      }
    } catch {
      showToast({ message: `Snoozed for ${minutes}m.`, type: 'info' });
    }
  };

  const handleActionSkip = async (reminder: Reminder) => {
    if (!userId) return;
    hapticLight();
    try {
      await logReminderFeedback(userId, {
        reminder_id: reminder.id,
        user_id: userId,
        action: 'skipped',
        category: reminder.category,
      });
      showToast({ message: '🌿 Passed for now. Rest is part of the work.', type: 'info' });
    } catch {
      showToast({ message: 'Acknowledged.', type: 'info' });
    }
  };

  if (isLoading) {
    return null;
  }

  if (loadError) {
    return (
      <VStack className="p-lg gap-md items-center">
        <Text className="text-sacredWhite text-center">Reminders could not be loaded.</Text>
        <Button onPress={() => void fetchReminders()} className="bg-sanctuarySaffron">
          <ButtonText className="text-sacredWhite">Try again</ButtonText>
        </Button>
      </VStack>
    );
  }

  return (
    <VStack className="p-lg gap-lg">
      {/* Header */}
      <HStack className="justify-between items-center">
        <VStack className="gap-1 flex-1">
          <Heading className="text-sacredWhite" size="lg">
            {t('reminders.title') || 'Reminders'}
          </Heading>
          <Text className="text-mistGray text-sm">Gentle nudges for self-care</Text>
        </VStack>
        <Button
          size="sm"
          onPress={openCreateModal}
          className="rounded-full bg-sanctuarySaffron px-4"
        >
          <Icon as={Plus} className="text-sacredWhite" size={16} />
          <ButtonText className="ml-1 text-sacredWhite">
            {t('reminders.addReminder') || 'Add'}
          </ButtonText>
        </Button>
      </HStack>

      {/* Reminders List */}
      <VStack className="gap-md">
        {reminders.length === 0 ? (
          <Box className="p-xl bg-ink rounded-comfortable items-center">
            <Text className="text-mistGray text-md text-center">
              {t('reminders.noReminders') || 'No reminders set yet.'}
            </Text>
          </Box>
        ) : (
          reminders.map((reminder) => {
            const IconComponent = ICON_MAP[reminder.icon_type] || Bell;
            return (
              <Box
                key={reminder.id}
                className={`p-md rounded-comfortable border-l-[3px] ${
                  reminder.is_active
                    ? 'bg-ink border-sanctuarySaffron opacity-100'
                    : 'bg-obsidian border-dimGray opacity-60'
                }`}
              >
                <HStack className="gap-4 items-center">
                  {/* Icon */}
                  <Pressable
                    onPress={() => {
                      void toggleReminder(reminder);
                    }}
                    accessibilityRole="switch"
                    accessibilityLabel={`${reminder.title} reminder`}
                    accessibilityHint="Toggles this reminder on or off"
                    accessibilityState={{ checked: reminder.is_active }}
                  >
                    <Box className="w-10 h-10 rounded-full bg-obsidian items-center justify-center">
                      <Icon
                        as={IconComponent}
                        className={reminder.is_active ? 'text-sanctuarySaffron' : 'text-dimGray'}
                        size={20}
                      />
                    </Box>
                  </Pressable>

                  {/* Content */}
                  <VStack className="gap-1 flex-1">
                    <Text className="text-sacredWhite font-semibold text-md">{reminder.title}</Text>
                    {reminder.description ? (
                      <Text className="text-mistGray text-sm">{reminder.description}</Text>
                    ) : null}
                    {reminder.is_default && (
                      <Text className="text-shadowViolet text-xs">💧 Default reminder</Text>
                    )}
                  </VStack>

                  {/* Actions */}
                  <HStack className="gap-2">
                    {!reminder.is_default && (
                      <>
                        <Pressable
                          onPress={() => openEditModal(reminder)}
                          accessibilityRole="button"
                          accessibilityLabel={`Edit ${reminder.title}`}
                        >
                          <Box className="w-9 h-9 rounded-full bg-obsidian items-center justify-center">
                            <Icon as={SquarePen} className="text-mistGray" size={16} />
                          </Box>
                        </Pressable>
                        <Pressable
                          onPress={() => {
                            void deleteReminder(reminder.id);
                          }}
                          accessibilityRole="button"
                          accessibilityLabel={`Delete ${reminder.title}`}
                          accessibilityHint="Permanently removes this reminder"
                        >
                          <Box className="w-9 h-9 rounded-full bg-obsidian items-center justify-center">
                            <Icon as={Trash2} className="text-emberRed" size={16} />
                          </Box>
                        </Pressable>
                      </>
                    )}
                  </HStack>
                </HStack>

                {reminder.is_active ? (
                  <HStack className="gap-2 mt-3 pt-2 border-t border-dimGray/20 items-center flex-wrap">
                    <Pressable
                      onPress={() => void handleActionDone(reminder)}
                      accessibilityRole="button"
                      accessibilityLabel="Mark done"
                      className="px-3 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/40 flex-row items-center gap-1.5"
                    >
                      <Icon as={Check} size={12} className="text-emerald-400" />
                      <Text className="text-emerald-300 text-xs font-semibold">Done</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => void handleActionSnooze(reminder, 15)}
                      accessibilityRole="button"
                      accessibilityLabel="Snooze for 15 minutes"
                      className="px-3 py-1 rounded-full bg-amber-950/40 border border-amber-500/40 flex-row items-center gap-1.5"
                    >
                      <Icon as={Clock} size={12} className="text-amber-400" />
                      <Text className="text-amber-300 text-xs font-semibold">Snooze 15m</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => void handleActionSkip(reminder)}
                      accessibilityRole="button"
                      accessibilityLabel="Pass for now"
                      className="px-3 py-1 rounded-full bg-obsidian border border-dimGray/30 flex-row items-center"
                    >
                      <Text className="text-mistGray text-xs font-medium">Pass</Text>
                    </Pressable>
                  </HStack>
                ) : null}
              </Box>
            );
          })
        )}
      </VStack>

      {/* Info */}
      <Box className="p-md bg-ink rounded-comfortable">
        <Text className="text-mistGray italic text-xs text-center">
          🔔 Tap the icon to toggle reminders on/off
        </Text>
      </Box>

      {/* Create/SquarePen Modal */}
      <Modal isOpen={showCreateModal} onClose={closeModal}>
        <ModalBackdrop />
        <ModalContent className="bg-obsidian max-w-[400px]">
          <ModalHeader>
            <Heading className="text-sacredWhite" size="lg">
              {editingReminder ? 'SquarePen Reminder' : 'New Reminder'}
            </Heading>
            <ModalCloseButton />
          </ModalHeader>
          <ModalBody>
            <VStack className="gap-4">
              {/* Title */}
              <VStack className="gap-1">
                <Text className="text-starlightGray text-sm">Title</Text>
                <Input className="bg-ink border-obsidian">
                  <InputField
                    value={title}
                    onChangeText={setTitle}
                    placeholder="e.g., Take a break"
                    className="text-sacredWhite"
                    placeholderTextColor="#6A6358"
                    accessibilityLabel="Reminder title"
                  />
                </Input>
              </VStack>

              {/* Description */}
              <VStack className="gap-1">
                <Text className="text-starlightGray text-sm">Description (optional)</Text>
                <Input className="bg-ink border-obsidian min-h-[80px]">
                  <InputField
                    value={description}
                    onChangeText={setDescription}
                    placeholder="e.g., Every 2 hours during class"
                    className="text-sacredWhite"
                    placeholderTextColor="#6A6358"
                    multiline
                    accessibilityLabel="Reminder description"
                  />
                </Input>
              </VStack>

              {/* Icon Type */}
              <VStack className="gap-1">
                <Text className="text-starlightGray text-sm">Icon</Text>
                <HStack className="gap-4">
                  {Object.keys(ICON_MAP).map((type) => {
                    const IconComp = ICON_MAP[type];
                    const isSelected = iconType === type;
                    return (
                      <Pressable
                        key={type}
                        onPress={() => {
                          setIconType(type);
                          hapticLight();
                        }}
                        accessibilityRole="radio"
                        accessibilityLabel={`${type} reminder icon`}
                        accessibilityState={{ selected: isSelected }}
                      >
                        <Box
                          className={`w-12 h-12 rounded-full items-center justify-center ${
                            isSelected ? 'bg-sanctuarySaffron' : 'bg-ink'
                          }`}
                        >
                          <Icon
                            as={IconComp}
                            className={isSelected ? 'text-white' : 'text-mistGray'}
                            size={24}
                          />
                        </Box>
                      </Pressable>
                    );
                  })}
                </HStack>
              </VStack>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <HStack className="gap-4 w-full">
              <Button className="flex-1 border-dimGray" variant="outline" onPress={closeModal}>
                <ButtonText className="text-mistGray">Cancel</ButtonText>
              </Button>
              <Button
                className="flex-1 bg-sanctuarySaffron"
                onPress={() => {
                  void saveReminder();
                }}
                isDisabled={!title.trim()}
              >
                <ButtonText className="text-white">
                  {editingReminder ? 'Update' : 'Create'}
                </ButtonText>
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
}
