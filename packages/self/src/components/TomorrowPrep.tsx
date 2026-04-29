import { useNavigation } from '@react-navigation/native';
import { useSafeMutation } from '@repo/core/hooks';
import { supabase } from '@repo/core/api';;

import PositiveInvitation from '@repo/ui/components/PositiveInvitation';
import { Box, Button, Input } from '@repo/ui/primitives';
import { ButtonText, Checkbox, CheckboxIcon, CheckboxIndicator, HStack, Heading, Icon, InputField, Text, VStack } from '@repo/ui/primitives';
import { SkeletonCard } from '@repo/ui/components/SkeletonLoader';
import { Pressable } from '@repo/ui/primitives';
import { hapticLight, hapticSuccess } from '@repo/ui/utils/haptics';

import { Calendar, Check, Plus, Trash2 } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTomorrowPrep } from '../hooks/useTomorrowPrep';
import type { DailyPrepItem } from '../types';

interface TomorrowPrepProps {
  userId?: string;
}

const getTomorrowDate = (): string => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0] ?? '';
};

export default function TomorrowPrep({ userId }: TomorrowPrepProps) {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();

  // Resilient Data Hook
  const { prepItems: items, refreshData, isLoading } = useTomorrowPrep(userId);

  const [showForm, setShowForm] = useState(false);
  const [itemText, setItemText] = useState('');

  // Recomputes at midnight so the date stays correct if the component stays
  // mounted overnight.
  const [tomorrowDate, setTomorrowDate] = useState<string>(getTomorrowDate());
  useEffect(() => {
    const now = new Date();
    const msUntilMidnight =
      new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime() - now.getTime();
    const timer = setTimeout(() => setTomorrowDate(getTomorrowDate()), msUntilMidnight);
    return () => clearTimeout(timer);
  }, []);

  const { mutate: saveItem, isLoading: isSaving } = useSafeMutation(
    async (text: string) => {
      const { error } = await supabase.from('daily_prep_items').insert({
        user_id: userId,
        item_text: text,
        prep_date: tomorrowDate,
      });
      if (error) throw error;
    },
    {
      onSuccess: () => {
        hapticSuccess();
        setItemText('');
        setShowForm(false);
        refreshData();
      },
    },
  );

  const handleSave = async () => {
    if (!userId || !itemText.trim() || items.length >= 3) return;
    hapticLight();
    await saveItem(itemText.trim());
  };

  const handleToggle = async (item: DailyPrepItem) => {
    hapticLight();
    await supabase
      .from('daily_prep_items')
      .update({ is_completed: !item.is_completed })
      .eq('id', item.id);

    refreshData();
  };

  const handleDelete = async (id: string) => {
    hapticLight();
    await supabase.from('daily_prep_items').delete().eq('id', id);

    refreshData();
  };

  if (isLoading && userId) {
    return (
      <VStack className="flex-1 p-lg gap-lg">
        <SkeletonCard height={48} />
        <SkeletonCard height={48} />
        <SkeletonCard height={48} />
      </VStack>
    );
  }

  if (!userId) {
    return (
      <PositiveInvitation type="guest" onAction={() => navigation.navigate('Auth' as never)} />
    );
  }

  return (
    <VStack className="flex-1 gap-lg">
      <VStack className="gap-1">
        <HStack className="items-center gap-2">
          <Icon as={Calendar} className="text-sanctuarySaffron" size={24} />
          <Heading className="text-sacredWhite" size="lg">
            {t('self.tomorrowPrep') || "Tomorrow's Prep"}
          </Heading>
        </HStack>
        <Text className="text-mistGray text-sm">
          {t('self.tomorrowPrepDesc') || 'Three gentle things for tomorrow'}
        </Text>
      </VStack>

      {items.length < 3 && !showForm && (
        <Button
          size="md"
          onPress={() => {
            hapticLight();
            setShowForm(true);
          }}
          className="bg-sanctuarySaffron rounded-comfortable"
        >
          <Icon as={Plus} className="text-sacredWhite" size={20} />
          <ButtonText className="ml-2 text-sacredWhite">
            {t('self.addPrepItem') || 'Add Item'}
          </ButtonText>
        </Button>
      )}

      {items.length >= 3 && (
        <Box className="p-3 bg-ink rounded-comfortable">
          <Text className="text-dimGray text-sm text-center">
            {t('self.maxItems') || 'Maximum 3 items reached'}
          </Text>
        </Box>
      )}

      {showForm ? (
        <VStack className="gap-4">
          <Box>
            <Input className="bg-ink border-transparent border">
              <InputField
                placeholder={t('self.prepItem') || 'What needs to be done?'}
                value={itemText}
                onChangeText={setItemText}
                className="text-sacredWhite"
                placeholderTextColor="#6A6358"
              />
            </Input>
          </Box>

          <HStack className="justify-end gap-4">
            <Button
              size="md"
              variant="outline"
              onPress={() => {
                hapticLight();
                setShowForm(false);
                setItemText('');
              }}
              className="border-ink rounded-comfortable"
            >
              <ButtonText className="text-mistGray">{t('common.cancel') || 'Cancel'}</ButtonText>
            </Button>
            <Button
              size="md"
              onPress={handleSave}
              isDisabled={!itemText.trim() || isSaving}
              className="bg-sanctuarySaffron rounded-comfortable"
            >
              <ButtonText className="text-white">{t('common.save') || 'Save'}</ButtonText>
            </Button>
          </HStack>
        </VStack>
      ) : (
        <VStack className="gap-4">
          {items.map((item) => (
            <HStack
              key={item.id}
              className={`items-center p-3 bg-ink rounded-comfortable gap-4 ${item.is_completed ? 'opacity-60' : 'opacity-100'}`}
            >
              <Checkbox
                value={item.id}
                isChecked={item.is_completed}
                onChange={() => handleToggle(item)}
                aria-label={item.item_text}
              >
                <CheckboxIndicator
                  className={`border-sanctuarySaffron ${item.is_completed ? 'bg-sanctuarySaffron' : 'bg-transparent'}`}
                >
                  <CheckboxIcon as={Check} className="text-sacredWhite" />
                </CheckboxIndicator>
              </Checkbox>

              <Text
                className={`flex-1 text-sacredWhite text-md ${item.is_completed ? 'line-through' : ''}`}
              >
                {item.item_text}
              </Text>

              <Pressable
                onPress={() => handleDelete(item.id)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Icon as={Trash2} className="text-dimGray" size={18} />
              </Pressable>
            </HStack>
          ))}

          {items.length === 0 && (
            <PositiveInvitation
              icon={Calendar}
              title={t('self.threeGentleThings') || 'Start your prep'}
            />
          )}
        </VStack>
      )}
    </VStack>
  );
}
