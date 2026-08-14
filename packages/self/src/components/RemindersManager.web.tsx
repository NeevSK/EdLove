/**
 * REMINDERS MANAGER (Web)
 * Manages user sychronized reminders with Sanctuary V3 aesthetics.
 * Standardized to Zero-Legacy: purged raw HTML styles and integrated @repo/ui primitives.
 */

import {
  createReminder,
  deleteReminder,
  fetchReminders,
  type ReminderRecord,
  updateReminder,
} from '@repo/self/api/selfFeatureRepository';
import { BrandPulse } from '@repo/ui/components/BrandPulse';
import { Bell, Droplets, Plus, Trash2, X } from '@repo/ui/icons';
import {
  Box,
  Button,
  ButtonText,
  Heading,
  HStack,
  Icon,
  Input,
  InputField,
  Pressable,
  Text,
  VStack,
} from '@repo/ui/primitives';
import { useCallback, useEffect, useState } from 'react';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';

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

export default function RemindersManager({ userId }: RemindersManagerProps) {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const createDefault = useCallback(async () => {
    if (!userId) return;
    const data = await createReminder(userId, {
      ...DEFAULT_REMINDER,
      is_active: true,
      icon_type: DEFAULT_REMINDER.icon_type,
    });
    if (data) setReminders([data]);
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }
    fetchReminders(userId)
      .then((data) => {
        if (data.length === 0) {
          void createDefault();
        } else {
          setReminders(data);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [userId, createDefault]);

  const handleAdd = async () => {
    if (!title.trim() || !userId) return;
    setSaving(true);
    try {
      const data = await createReminder(userId, {
        title: title.trim(),
        description: description.trim() || undefined,
        icon_type: 'bell',
        is_default: false,
        is_active: true,
      });
      setReminders((p) => [...p, data]);
      setTitle('');
      setDescription('');
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (r: Reminder) => {
    setToggling(r.id);
    const nextActive = !r.is_active;
    setReminders((p) => p.map((x) => (x.id === r.id ? { ...x, is_active: nextActive } : x)));
    await updateReminder(r.id, { is_active: nextActive });
    setToggling(null);
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    setReminders((p) => p.filter((x) => x.id !== id));
    await deleteReminder(id);
    setDeleting(null);
  };

  return (
    <VStack className="gap-6 w-full">
      <HStack className="items-center justify-between">
        <HStack className="items-center gap-2">
          <Box className="w-8 h-8 rounded-full bg-sanctuarySaffron/10 items-center justify-center">
            <Icon as={Bell} size={14} className="text-sanctuarySaffron" />
          </Box>
          <Heading
            size="xs"
            className="text-sacredWhite font-black tracking-tight uppercase tracking-[0.2em]"
          >
            Gentle Reminders
          </Heading>
        </HStack>
        <Pressable
          onPress={() => setShowForm((v) => !v)}
          className={`px-4 py-2 rounded-xl transition-all active:scale-95 ${showForm ? 'bg-shroud border border-white/10' : 'bg-sanctuarySaffron'}`}
        >
          <HStack className="items-center gap-2">
            <Icon
              as={showForm ? X : Plus}
              size={14}
              className={showForm ? 'text-mistGray' : 'text-obsidian'}
            />
            <Text
              className={`text-[11px] font-black uppercase tracking-widest ${showForm ? 'text-mistGray' : 'text-obsidian'}`}
            >
              {showForm ? 'Cease' : 'Add New'}
            </Text>
          </HStack>
        </Pressable>
      </HStack>

      {showForm && (
        <Animated.View entering={FadeInDown} layout={Layout}>
          <VStack className="gap-4 p-6 bg-shroud border border-white/10 rounded-[24px] shadow-xl">
            <VStack className="gap-1.5">
              <Text className="text-[10px] uppercase font-black tracking-widest text-mistGray/50 pl-1">
                Intention
              </Text>
              <Input className="bg-white/5 border-white/10 rounded-xl h-12">
                <InputField
                  value={title}
                  onChangeText={setTitle}
                  placeholder="e.g., Hydration Ritual"
                  className="text-sacredWhite text-sm"
                  placeholderTextColor="#6A635844"
                />
              </Input>
            </VStack>

            <VStack className="gap-1.5">
              <Text className="text-[10px] uppercase font-black tracking-widest text-mistGray/50 pl-1">
                Nuance
              </Text>
              <Input className="bg-white/5 border-white/10 rounded-xl h-12">
                <InputField
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Brief details..."
                  className="text-sacredWhite text-sm"
                  placeholderTextColor="#6A635844"
                />
              </Input>
            </VStack>

            <Button
              onPress={() => {
                void handleAdd();
              }}
              disabled={saving || !title.trim()}
              className="bg-sanctuarySaffron shadow-lg shadow-sanctuarySaffron/20 h-12 rounded-xl"
            >
              <HStack className="items-center gap-2">
                {saving ? (
                  <BrandPulse size={18} tintColor="#544A3D" accessibilityLabel="Saving reminder" />
                ) : (
                  <Icon as={Plus} size={16} className="text-obsidian" />
                )}
                <ButtonText className="text-obsidian font-black uppercase tracking-widest text-[11px]">
                  {saving ? 'Engraving...' : 'Establish Reminder'}
                </ButtonText>
              </HStack>
            </Button>
          </VStack>
        </Animated.View>
      )}

      {isLoading ? (
        <VStack className="gap-3">
          {[1, 2].map((i) => (
            <Box key={i} className="h-20 bg-white/5 rounded-2xl animate-pulse" />
          ))}
        </VStack>
      ) : (
        <VStack className="gap-3">
          {reminders.map((r, idx) => (
            <Animated.View key={r.id} entering={FadeInDown.delay(idx * 50)} layout={Layout}>
              <HStack
                className={`items-center gap-4 p-4 bg-white/5 border border-white/5 rounded-[20px] transition-all opacity-100 ${!r.is_active ? 'opacity-40 grayscale' : ''}`}
              >
                <Box
                  className={`w-10 h-10 rounded-full items-center justify-center ${r.is_active ? 'bg-sanctuarySaffron/10' : 'bg-white/5'}`}
                >
                  <Icon
                    as={r.icon_type === 'droplet' ? Droplets : Bell}
                    size={18}
                    className={
                      r.is_active
                        ? r.icon_type === 'droplet'
                          ? 'text-skyBlue'
                          : 'text-sanctuarySaffron'
                        : 'text-mistGray/40'
                    }
                  />
                </Box>

                <VStack className="flex-1">
                  <Text
                    className={`text-sm font-bold tracking-tight ${r.is_active ? 'text-sacredWhite' : 'text-mistGray'}`}
                  >
                    {r.title}
                  </Text>
                  {r.description && (
                    <Text className="text-[11px] text-mistGray/60 leading-tight">
                      {r.description}
                    </Text>
                  )}
                </VStack>

                <HStack className="items-center gap-3">
                  <Pressable
                    onPress={() => {
                      void handleToggle(r);
                    }}
                    disabled={toggling === r.id}
                    className={`w-10 h-6 rounded-full items-center justify-center px-1 transition-all ${r.is_active ? 'bg-emeraldGreen/20 overflow-hidden' : 'bg-white/10 opacity-30'}`}
                  >
                    <Box
                      className={`w-4 h-4 rounded-full transition-all ${r.is_active ? 'bg-emeraldGreen translate-x-2' : 'bg-mistGray -translate-x-2'}`}
                    />
                  </Pressable>

                  {!r.is_default && (
                    <Pressable
                      onPress={() => {
                        void handleDelete(r.id);
                      }}
                      disabled={deleting === r.id}
                      className="p-2 hover:bg-emberRed/10 rounded-lg active:scale-90"
                    >
                      <Icon
                        as={Trash2}
                        size={14}
                        className="text-mistGray/30 hover:text-emberRed"
                      />
                    </Pressable>
                  )}
                </HStack>
              </HStack>
            </Animated.View>
          ))}
          {reminders.length === 0 && (
            <Box className="py-12 items-center opacity-30">
              <Icon as={Bell} size={32} className="text-mistGray mb-4" />
              <Text className="text-xs font-bold italic text-mistGray">
                No active intentions found.
              </Text>
            </Box>
          )}
        </VStack>
      )}
    </VStack>
  );
}
