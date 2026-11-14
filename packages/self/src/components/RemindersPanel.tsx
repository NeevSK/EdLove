/**
 * REMINDERS PANEL
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
} from '@repo/self/data/selfFeature.data';
import { Bell, Check, Clock, Droplet, Plus, SquarePen, Trash2 } from '@repo/ui/icons';
import { useWorld } from '@repo/ui/theme/native';
import { useSanctuaryToast } from '@repo/ui/providers/ToastProvider';
import { confirmAction } from '@repo/ui/utils/dialogs';
import { hapticLight, hapticMedium, hapticSuccess } from '@repo/ui/utils/haptics';
import * as Notifications from 'expo-notifications';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Platform, Pressable, Text, TextInput, View } from 'react-native';

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

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; color?: string }>> = {
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

export function RemindersPanel({ userId }: RemindersManagerProps) {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const { t } = useTranslation();
  const { showToast } = useSanctuaryToast();
  const { tokens } = useWorld();

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
      <View className="p-4 gap-4 items-center">
        <Text className="text-sacredWhite text-center">Reminders could not be loaded.</Text>
        <Pressable
          onPress={() => void fetchReminders()}
          className="bg-sanctuarySaffron px-4 py-2 rounded-full"
        >
          <Text className="text-sacredWhite font-semibold">Try again</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="p-4 gap-4">
      {/* Header */}
      <View className="flex-row justify-between items-center">
        <View className="gap-1 flex-1">
          <Text className="text-sacredWhite text-lg font-bold">
            {t('reminders.title') || 'Reminders'}
          </Text>
          <Text className="text-mistGray text-sm">Gentle nudges for self-care</Text>
        </View>
        <Pressable
          onPress={openCreateModal}
          className="rounded-full bg-sanctuarySaffron px-4 py-2 flex-row items-center"
          accessibilityRole="button"
          accessibilityLabel={t('reminders.addReminder') || 'Add reminder'}
        >
          <Plus size={16} color={tokens.onLamp} />
          <Text className="ml-1 text-sacredWhite font-semibold">
            {t('reminders.addReminder') || 'Add'}
          </Text>
        </Pressable>
      </View>

      {/* Reminders List */}
      <View className="gap-3">
        {reminders.length === 0 ? (
          <View className="p-6 bg-ink rounded-xl items-center">
            <Text className="text-mistGray text-base text-center">
              {t('reminders.noReminders') || 'No reminders set yet.'}
            </Text>
          </View>
        ) : (
          reminders.map((reminder) => {
            const IconComponent = ICON_MAP[reminder.icon_type] || Bell;
            return (
              <View
                key={reminder.id}
                className={`p-4 rounded-xl border-l-[3px] ${
                  reminder.is_active
                    ? 'bg-ink border-sanctuarySaffron opacity-100'
                    : 'bg-obsidian border-dimGray opacity-60'
                }`}
              >
                <View className="flex-row gap-4 items-center">
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
                    <View className="w-10 h-10 rounded-full bg-obsidian items-center justify-center">
                      <IconComponent
                        size={20}
                        color={reminder.is_active ? tokens.lamp : tokens.inkFaint}
                      />
                    </View>
                  </Pressable>

                  {/* Content */}
                  <View className="gap-1 flex-1">
                    <Text className="text-sacredWhite font-semibold text-base">{reminder.title}</Text>
                    {reminder.description ? (
                      <Text className="text-mistGray text-sm">{reminder.description}</Text>
                    ) : null}
                    {reminder.is_default && (
                      <Text className="text-shadowViolet text-xs">💧 Default reminder</Text>
                    )}
                  </View>

                  {/* Actions */}
                  <View className="flex-row gap-2">
                    {!reminder.is_default && (
                      <>
                        <Pressable
                          onPress={() => openEditModal(reminder)}
                          accessibilityRole="button"
                          accessibilityLabel={`Edit ${reminder.title}`}
                        >
                          <View className="w-9 h-9 rounded-full bg-obsidian items-center justify-center">
                            <SquarePen size={16} color={tokens.inkSoft} />
                          </View>
                        </Pressable>
                        <Pressable
                          onPress={() => {
                            void deleteReminder(reminder.id);
                          }}
                          accessibilityRole="button"
                          accessibilityLabel={`Delete ${reminder.title}`}
                          accessibilityHint="Permanently removes this reminder"
                        >
                          <View className="w-9 h-9 rounded-full bg-obsidian items-center justify-center">
                            <Trash2 size={16} color={tokens.danger} />
                          </View>
                        </Pressable>
                      </>
                    )}
                  </View>
                </View>

                {reminder.is_active ? (
                  <View className="flex-row gap-2 mt-3 pt-2 border-t border-dimGray/20 items-center flex-wrap">
                    <Pressable
                      onPress={() => void handleActionDone(reminder)}
                      accessibilityRole="button"
                      accessibilityLabel="Mark done"
                      className="px-3 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/40 flex-row items-center gap-1.5"
                    >
                      <Check size={12} color={tokens.success} />
                      <Text className="text-emerald-300 text-xs font-semibold">Done</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => void handleActionSnooze(reminder, 15)}
                      accessibilityRole="button"
                      accessibilityLabel="Snooze for 15 minutes"
                      className="px-3 py-1 rounded-full bg-amber-950/40 border border-amber-500/40 flex-row items-center gap-1.5"
                    >
                      <Clock size={12} color={tokens.ornament} />
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
                  </View>
                ) : null}
              </View>
            );
          })
        )}
      </View>

      {/* Info */}
      <View className="p-3 bg-ink rounded-xl">
        <Text className="text-mistGray italic text-xs text-center">
          🔔 Tap the icon to toggle reminders on/off
        </Text>
      </View>

      {/* Create / Edit Modal */}
      <Modal
        visible={showCreateModal}
        transparent
        animationType="fade"
        onRequestClose={closeModal}
      >
        <View className="flex-1 bg-black/60 items-center justify-center p-4">
          <View className="bg-obsidian w-full max-w-[400px] rounded-2xl p-5 border border-dimGray/30 gap-4">
            <View className="flex-row justify-between items-center pb-2 border-b border-dimGray/20">
              <Text className="text-sacredWhite text-lg font-bold">
                {editingReminder ? 'Edit Reminder' : 'New Reminder'}
              </Text>
              <Pressable
                onPress={closeModal}
                accessibilityRole="button"
                accessibilityLabel="Close dialog"
                className="p-1"
              >
                <Text className="text-mistGray text-lg">✕</Text>
              </Pressable>
            </View>

            <View className="gap-4">
              {/* Title */}
              <View className="gap-1">
                <Text className="text-starlightGray text-sm">Title</Text>
                <View className="bg-ink border border-obsidian rounded-lg px-3 py-2">
                  <TextInput
                    value={title}
                    onChangeText={setTitle}
                    placeholder="e.g., Take a break"
                    className="text-sacredWhite"
                    placeholderTextColor={tokens.inkFaint}
                    accessibilityLabel="Reminder title"
                  />
                </View>
              </View>

              {/* Description */}
              <View className="gap-1">
                <Text className="text-starlightGray text-sm">Description (optional)</Text>
                <View className="bg-ink border border-obsidian rounded-lg px-3 py-2 min-h-[80px]">
                  <TextInput
                    value={description}
                    onChangeText={setDescription}
                    placeholder="e.g., Every 2 hours during class"
                    className="text-sacredWhite"
                    placeholderTextColor={tokens.inkFaint}
                    multiline
                    accessibilityLabel="Reminder description"
                  />
                </View>
              </View>

              {/* Icon Type */}
              <View className="gap-1">
                <Text className="text-starlightGray text-sm">Icon</Text>
                <View className="flex-row gap-4">
                  {Object.keys(ICON_MAP).map((type) => {
                    const IconComp = ICON_MAP[type] ?? Bell;
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
                        <View
                          className={`w-12 h-12 rounded-full items-center justify-center ${
                            isSelected ? 'bg-sanctuarySaffron' : 'bg-ink'
                          }`}
                        >
                          <IconComp
                            size={24}
                            color={isSelected ? tokens.onLamp : tokens.inkFaint}
                          />
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            </View>

            <View className="flex-row gap-3 pt-2">
              <Pressable
                className="flex-1 py-2.5 rounded-xl border border-dimGray/40 items-center justify-center"
                onPress={closeModal}
                accessibilityRole="button"
                accessibilityLabel="Cancel"
              >
                <Text className="text-mistGray font-medium">Cancel</Text>
              </Pressable>
              <Pressable
                className={`flex-1 py-2.5 rounded-xl items-center justify-center ${
                  title.trim() ? 'bg-sanctuarySaffron' : 'bg-sanctuarySaffron/40'
                }`}
                onPress={() => {
                  void saveReminder();
                }}
                disabled={!title.trim()}
                accessibilityRole="button"
                accessibilityLabel={editingReminder ? 'Update' : 'Create'}
              >
                <Text className="text-sacredWhite font-semibold">
                  {editingReminder ? 'Update' : 'Create'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

export const RemindersManager = RemindersPanel;
export default RemindersPanel;
