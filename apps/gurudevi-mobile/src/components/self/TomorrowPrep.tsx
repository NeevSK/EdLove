import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Input,
  InputField,
  Button,
  ButtonText,
  Pressable,
  Checkbox,
  CheckboxIndicator,
  CheckboxIcon,
  CheckIcon
} from '@/ui';
import { Calendar, Plus, Trash2 } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Theme } from '../../constants/Theme';
import { supabase } from '../../lib/supabase';
import { hapticLight, hapticSuccess } from '../../utils/haptics';
import { DailyPrepItem } from '../../types/Wellbeing';

interface TomorrowPrepProps {
  userId?: string;
}

export default function TomorrowPrep({ userId }: TomorrowPrepProps) {
  const { t } = useTranslation();
  const [items, setItems] = useState<DailyPrepItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [itemText, setItemText] = useState('');
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowDate = tomorrow.toISOString().split('T')[0];

  useEffect(() => {
    if (userId) {
      loadItems();
    }
  }, [userId]);

  const loadItems = async () => {
    if (!userId) return;
    
    const { data, error } = await supabase
      .from('daily_prep_items')
      .select('*')
      .eq('user_id', userId)
      .eq('prep_date', tomorrowDate)
      .order('created_at', { ascending: true });

    if (data) {
      setItems(data);
    }
  };

  const handleSave = async () => {
    if (!userId || !itemText.trim() || items.length >= 3) return;
    
    setLoading(true);
    hapticLight();

    const { error } = await supabase
      .from('daily_prep_items')
      .insert({
        user_id: userId,
        item_text: itemText.trim(),
        prep_date: tomorrowDate
      });

    if (!error) {
      hapticSuccess();
      setItemText('');
      setShowForm(false);
      await loadItems();
    }
    
    setLoading(false);
  };

  const handleToggle = async (item: DailyPrepItem) => {
    hapticLight();
    await supabase
      .from('daily_prep_items')
      .update({ is_completed: !item.is_completed })
      .eq('id', item.id);
    
    await loadItems();
  };

  const handleDelete = async (id: string) => {
    hapticLight();
    await supabase
      .from('daily_prep_items')
      .delete()
      .eq('id', id);
    
    await loadItems();
  };

  return (
    <VStack space="lg" sx={{ flex: 1 }}>
      <VStack space="xs">
        <HStack space="sm" alignItems="center">
          <Calendar color={Theme.colors.sanctuarySaffron} size={24} />
          <Heading color={Theme.colors.sacredWhite} size="lg">
            {t('self.tomorrowPrep')}
          </Heading>
        </HStack>
        <Text color={Theme.colors.mistGray} size="sm">
          {t('self.tomorrowPrepDesc')}
        </Text>
      </VStack>

      {items.length < 3 && !showForm && (
        <Button
          size="md"
          action="primary"
          onPress={() => {
            hapticLight();
            setShowForm(true);
          }}
          sx={{
            backgroundColor: Theme.colors.sanctuarySaffron,
            borderRadius: Theme.corners.comfortable
          }}
        >
          <Plus color={Theme.colors.white} size={20} />
          <ButtonText ml="$2">{t('self.addPrepItem')}</ButtonText>
        </Button>
      )}

      {items.length >= 3 && (
        <Box
          p="$3"
          sx={{
            backgroundColor: Theme.colors.deepIndigo,
            borderRadius: Theme.corners.comfortable
          }}
        >
          <Text color={Theme.colors.dimGray} size="sm" textAlign="center">
            {t('self.maxItems')} ✓
          </Text>
        </Box>
      )}

      {showForm ? (
        <VStack space="md">
          <Box>
            <Input
              variant="outline"
              size="md"
              sx={{
                backgroundColor: Theme.colors.deepIndigo,
                borderWidth: 1,
                borderColor: Theme.colors.transparent
              }}
            >
              <InputField
                placeholder={t('self.prepItem')}
                value={itemText}
                onChangeText={setItemText}
                color={Theme.colors.sacredWhite}
                placeholderTextColor={Theme.colors.dimGray}
              />
            </Input>
          </Box>

          <HStack space="md" justifyContent="flex-end">
            <Button
              size="md"
              variant="outline"
              onPress={() => {
                hapticLight();
                setShowForm(false);
                setItemText('');
              }}
              sx={{
                borderColor: Theme.colors.deepIndigo,
                borderRadius: Theme.corners.comfortable
              }}
            >
              <ButtonText color={Theme.colors.mistGray}>
                {t('common.cancel')}
              </ButtonText>
            </Button>
            <Button
              size="md"
              action="primary"
              onPress={handleSave}
              isDisabled={!itemText.trim() || loading}
              sx={{
                backgroundColor: Theme.colors.sanctuarySaffron,
                borderRadius: Theme.corners.comfortable
              }}
            >
              <ButtonText>{t('common.save')}</ButtonText>
            </Button>
          </HStack>
        </VStack>
      ) : (
        <VStack space="md">
          {items.map((item) => (
            <HStack
              key={item.id}
              space="md"
              alignItems="center"
              p="$3"
              sx={{
                backgroundColor: Theme.colors.deepIndigo,
                borderRadius: Theme.corners.comfortable,
                opacity: item.is_completed ? 0.6 : 1
              }}
            >
              <Checkbox
                value={item.id}
                isChecked={item.is_completed}
                onChange={() => handleToggle(item)}
                aria-label={item.item_text}
              >
                <CheckboxIndicator
                  sx={{
                    borderColor: Theme.colors.sanctuarySaffron,
                    backgroundColor: item.is_completed
                      ? Theme.colors.sanctuarySaffron
                      : 'transparent'
                  }}
                >
                  <CheckboxIcon as={CheckIcon} color={Theme.colors.white} />
                </CheckboxIndicator>
              </Checkbox>
              
              <Text
                color={Theme.colors.sacredWhite}
                size="md"
                sx={{
                  flex: 1,
                  textDecorationLine: item.is_completed ? 'line-through' : 'none'
                }}
              >
                {item.item_text}
              </Text>

              <Pressable
                onPress={() => handleDelete(item.id)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Trash2
                  color={Theme.colors.dimGray}
                  size={18}
                />
              </Pressable>
            </HStack>
          ))}
          
          {items.length === 0 && (
            <Box p={Theme.spacing.xl}>
              <Text
                color={Theme.colors.dimGray}
                size="md"
                textAlign="center"
              >
                {t('self.threeGentleThings')}
              </Text>
            </Box>
          )}
        </VStack>
      )}
    </VStack>
  );
}
