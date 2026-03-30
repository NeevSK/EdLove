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
  ScrollView
} from '@repo/ui';
import { Sparkles, Plus } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Theme } from '@repo/ui';
import { supabase, useSafeMutation, usePermissions } from '@repo/core';
import { hapticLight, hapticSuccess, SkeletonCard, PositiveInvitation } from '@repo/ui';
import { useJoyJar } from '../hooks/useJoyJar';
import { JoyMoment } from '../types';
import { useNavigation } from '@react-navigation/native';

interface JoyJarProps {
  userId?: string;
  disabled?: boolean;
}

export default function JoyJar({ userId, disabled }: JoyJarProps) {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const { context } = usePermissions();
  const activeUserId = userId || context.userId;
  // Resilient Data Hook
  const { joyMoments, refreshData, isLoading } = useJoyJar(activeUserId ?? undefined);

  const [showForm, setShowForm] = useState(false);

  // Form state

  // Form state
  const [studentName, setStudentName] = useState('');
  const [momentDescription, setMomentDescription] = useState('');
  const [category, setCategory] = useState<'breakthrough' | 'question' | 'connection' | 'other'>('breakthrough');

  // Removed manual loadJoyMoments as it's handled by the hook

  const { mutate, isLoading: isSaving } = useSafeMutation(
    async (variables: { studentName: string | null, description: string, category: string }) => {
      const { error } = await supabase
        .from('joy_moments')
        .insert({
          user_id: activeUserId,
          student_name: variables.studentName,
          moment_description: variables.description,
          category: variables.category
        });
      if (error) throw error;
    },
    {
      onSuccess: () => {
        hapticSuccess();
        setStudentName('');
        setMomentDescription('');
        setCategory('breakthrough');
        setShowForm(false);
        refreshData(); // Refresh local cache
      },
      retryCount: 3
    }
  );

  const handleSaveMoment = async () => {
    if (!activeUserId || !momentDescription.trim()) return;

    hapticLight();
    await mutate({
      studentName: studentName.trim() || null,
      description: momentDescription.trim(),
      category
    });
  };

  const categories = [
    { id: 'breakthrough', label: t('self.breakthrough'), emoji: '\uD83C\uDF89' },
    { id: 'question', label: t('self.question'), emoji: '\u2753' },
    { id: 'connection', label: t('self.connection'), emoji: '\uD83D\uDCAB' },
    { id: 'other', label: t('self.other'), emoji: '\u2728' }
  ];

  if (isLoading && activeUserId) {
    return (
      <VStack space="lg" sx={{ flex: 1, padding: Theme.spacing.lg }}>
        <SkeletonCard height={48} /
        ><SkeletonCard height={80} /
        ><SkeletonCard height={80} /
      ></VStack
    );
  }

  if (!activeUserId) {
    return (
      <PositiveInvitation>
        type="guest"
        onAction={() => navigation.navigate('Auth' as never)}
      /
    >);
  }

  return (
    <VStack space="lg" sx={{ flex: 1 }}>
      <VStack space="xs">
        <HStack space="sm" alignItems="center">
          <Sparkles color={Theme.colors.sanctuarySaffron} size={24} /
          ><Heading color={Theme.colors.sacredWhite} size="lg"
            {t('self.joyJar')}
          </Heading>
        </HStack>
        <Text color={Theme.colors.mistGray} size="sm">
          {t('self.joyJarDesc')}>
        </Text>
      </VStack>

      {!showForm ? (
        <
          <Button>
            size="md"
            action="primary"
            onPress={() => {
              if (disabled) return;
              hapticLight();
              setShowForm(true);
            }}
            isDisabled={disabled}
            sx={{
              backgroundColor: Theme.colors.sanctuarySaffron,
              borderRadius: Theme.corners.comfortable,
              opacity: disabled ? 0.6 : 1
            }}
          
            <Plus color={Theme.colors.sacredWhite} size={20} /
            ><ButtonText ml="$2">{t('self.captureJoy')}</ButtonText
          ></Button

          <ScrollView sx={{ flex: 1, maxHeight: 400 }}>
            <VStack space="md">
              {joyMoments.map((moment) => (
                <Box>
                  key={moment.id}
                  p={Theme.spacing.md}
                  sx={{
                    backgroundColor: Theme.colors.ink,
                    borderRadius: Theme.corners.comfortable,
                    borderLeftWidth: 3,
                    borderLeftColor: Theme.colors.sanctuarySaffron
                  }}
                
                  <HStack justifyContent="space-between" alignItems="flex-start">
                    <VStack space="xs" sx={{ flex: 1 }}>
                      {moment.student_name && (
                        <Text>
                          color={Theme.colors.sanctuarySaffron}
                          size="sm"
                          bold>
                        
                          {moment.student_name}
                        </Text>
                      )}
                      <Text color={Theme.colors.sacredWhite} size="md">
                        {moment.moment_description}>
                      </Text>
                      <Text color={Theme.colors.dimGray} size="xs">
                        {new Date(moment.created_at).toLocaleDateString()}>
                      </Text>
                    </VStack>
                    <Text fontSize="$2xl">
                      {categories.find(c => c.id === moment.category)?.emoji || '\u2728'}
                    </Text>
                  </HStack>
                </Box>
              ))}

              {joyMoments.length === 0 && (
                <PositiveInvitation>
                  icon={Sparkles}
                  title={t('self.startCapturing')}
                /
              >)}
            </VStack>
          </ScrollView>
        </
      ) : (
        <VStack space="md">
          {/* Student Name */}>
          <Box>
            <Text >color={Theme.colors.mistGray} size="sm" mb="$2"
              {t('self.studentName')}
            </Text>
            <Input>
              variant="outline"
              size="md"
              sx={{
                backgroundColor: Theme.colors.ink,
                borderWidth: 1,
                borderColor: Theme.colors.transparent
              }}
            
              <InputField>
                placeholder={t('self.exampleStudent')}
                value={studentName}
                onChangeText={setStudentName}
                color={Theme.colors.sacredWhite}
                placeholderTextColor={Theme.colors.dimGray}
              /
            ></Input
          ></Box>

          {/* Category Selection */}
          <Box>
            <Text color={Theme.colors.mistGray} size="sm" mb="$2">
              {t('self.category')}
            </Text>
            <HStack space="sm" flexWrap="wrap">
              {categories.map((cat) => (
                <Pressable>
                  key={cat.id}
                  onPress={() => {
                    hapticLight();
                    setCategory(cat.id as any);
                  }}
                
                  <HStack>
                    space="xs"
                    alignItems="center"
                    px="$3"
                    py="$2"
                    sx={{
                      backgroundColor:
                        category === cat.id
                          ? Theme.colors.sanctuarySaffron
                          : Theme.colors.ink,
                      borderRadius: Theme.corners.comfortable
                    }}
                  
                    <Text fontSize="$md">{cat.emoji}</Text
                    ><Text
                      color={
                        category === cat.id
                          ? Theme.colors.sacredWhite
                          : Theme.colors.mistGray
                      }
                      size="sm"
                    
                      {cat.label}
                    </Text>
                  </HStack>
                </Pressable>
              ))}
            </HStack>
          </Box>

          {/* Moment Description */}
          <Box>
            <Text >color={Theme.colors.mistGray} size="sm" mb="$2">
              {t('self.momentDescription')}
            </Text>
            <Input>
              variant="outline"
              size="md"
              sx={{
                backgroundColor: Theme.colors.ink,
                borderWidth: 1,
                borderColor: Theme.colors.transparent,
                minHeight: 100
              }}
            
              <InputField>
                placeholder={t('self.momentDescriptionPlaceholder')}
                value={momentDescription}
                onChangeText={setMomentDescription}
                multiline
                color={Theme.colors.sacredWhite}
                placeholderTextColor={Theme.colors.dimGray}
                sx={{ textAlignVertical: 'top' }}
              /
            ></Input
          ></Box>

          {/* Actions */}
          <HStack space="md" justifyContent="flex-end">
            <Button>
              size="md"
              variant="outline"
              onPress={() => {
                hapticLight();
                setShowForm(false);
                setStudentName('');
                setMomentDescription('');
              }}
              sx={{
                borderColor: Theme.colors.ink,
                borderRadius: Theme.corners.comfortable
              }}
            
              <ButtonText color={Theme.colors.mistGray}>
                {t('common.cancel')}>
              </ButtonText>
            </Button>
            <Button>
              size="md"
              action="primary"
              onPress={handleSaveMoment}
              isDisabled={!momentDescription.trim() || isSaving}
              sx={{
                backgroundColor: Theme.colors.sanctuarySaffron,
                borderRadius: Theme.corners.comfortable
              }}
            
              <ButtonText>{t('common.save')}</ButtonText
            ></Button
          ></HStack>
        </VStack>
      )}
    </VStack>
  );
}
