import React, { useState } from 'react';
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
  ScrollView,
  Theme,
  hapticLight,
  hapticSuccess,
  SkeletonCard,
  PositiveInvitation
} from '@repo/ui';
import { Sparkles, Plus } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { supabase, useSafeMutation, usePermissions } from '@repo/core';
import { useJoyJar } from '../hooks/useJoyJar';
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
  
  const { joyMoments, refreshData, isLoading } = useJoyJar(activeUserId ?? undefined);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [studentName, setStudentName] = useState('');
  const [momentDescription, setMomentDescription] = useState('');
  const [category, setCategory] = useState<'breakthrough' | 'question' | 'connection' | 'other'>('breakthrough');

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
        refreshData();
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
    { id: 'breakthrough', label: t('self.breakthrough') || 'Breakthrough', emoji: '\uD83C\uDF89' },
    { id: 'question', label: t('self.question') || 'Great Question', emoji: '\u2753' },
    { id: 'connection', label: t('self.connection') || 'Connection', emoji: '\uD83D\uDCAB' },
    { id: 'other', label: t('self.other') || 'Other', emoji: '\u2728' }
  ];

  if (isLoading && activeUserId) {
    return (
      <VStack space="lg" sx={{ flex: 1, padding: Theme.spacing.lg }}>
        <SkeletonCard height={48} />
        <SkeletonCard height={80} />
        <SkeletonCard height={80} />
      </VStack>
    );
  }

  if (!activeUserId) {
    return (
      <PositiveInvitation
        type="guest"
        onAction={() => navigation.navigate('Auth' as never)}
      />
    );
  }

  return (
    <VStack space="lg" sx={{ flex: 1 }}>
      <VStack space="xs">
        <HStack space="sm" alignItems="center">
          <Sparkles color={Theme.colors.sanctuarySaffron} size={24} />
          <Heading sx={{ color: Theme.colors.sacredWhite }} size="lg">
            {t('self.joyJar') || 'Joy Jar'}
          </Heading>
        </HStack>
        <Text sx={{ color: Theme.colors.mistGray }} size="sm">
          {t('self.joyJarDesc') || 'Capture the small sparks that keep the flame of teaching alive.'}
        </Text>
      </VStack>

      {!showForm ? (
        <VStack space="lg" sx={{ flex: 1 }}>
          <Button
            size="md"
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
          >
            <Plus color={Theme.colors.sacredWhite} size={20} />
            <ButtonText sx={{ marginLeft: 8 }}>{t('self.captureJoy') || 'Capture Joy'}</ButtonText>
          </Button>

          <ScrollView sx={{ flex: 1, maxHeight: 400 }}>
            <VStack space="md">
              {joyMoments.map((moment) => {
                const catInfo = categories.find(c => c.id === moment.category) || categories[3];
                return (
                  <Box
                    key={moment.id}
                    sx={{
                      padding: Theme.spacing.md,
                      backgroundColor: Theme.colors.ink,
                      borderRadius: Theme.corners.comfortable,
                      borderLeftWidth: 3,
                      borderLeftColor: Theme.colors.sanctuarySaffron
                    }}
                  >
                    <HStack sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <VStack space="xs" sx={{ flex: 1, marginRight: 12 }}>
                        {moment.student_name && (
                          <Text sx={{ color: Theme.colors.sanctuarySaffron, fontWeight: 'bold' }} size="sm">
                            {moment.student_name}
                          </Text>
                        )}
                        <Text sx={{ color: Theme.colors.sacredWhite }} size="md">
                          {moment.moment_description}
                        </Text>
                        <Text sx={{ color: Theme.colors.dimGray }} size="xs">
                          {new Date(moment.created_at).toLocaleDateString()}
                        </Text>
                      </VStack>
                      <Text sx={{ fontSize: 24 }}>
                        {catInfo.emoji}
                      </Text>
                    </HStack>
                  </Box>
                );
              })}

              {joyMoments.length === 0 && (
                <PositiveInvitation
                  icon={Sparkles}
                  title={t('self.startCapturing') || 'Your Joy Jar is empty'}
                />
              )}
            </VStack>
          </ScrollView>
        </VStack>
      ) : (
        <VStack space="md">
          {/* Student Name */}
          <Box>
            <Text sx={{ color: Theme.colors.mistGray, marginBottom: 8 }} size="sm">
              {t('self.studentName') || 'Student Name (Optional)'}
            </Text>
            <Input
              variant="outline"
              size="md"
              sx={{
                backgroundColor: Theme.colors.ink,
                borderWidth: 1,
                borderColor: 'transparent'
              }}
            >
              <InputField
                placeholder={t('self.exampleStudent') || 'e.g. Rahul'}
                value={studentName}
                onChangeText={setStudentName}
                sx={{ color: Theme.colors.sacredWhite }}
                placeholderTextColor={Theme.colors.dimGray}
              />
            </Input>
          </Box>

          {/* Category Selection */}
          <Box>
            <Text sx={{ color: Theme.colors.mistGray, marginBottom: 8 }} size="sm">
              {t('self.category') || 'Category'}
            </Text>
            <HStack space="sm" flexWrap="wrap">
              {categories.map((cat) => (
                <Pressable
                  key={cat.id}
                  onPress={() => {
                    hapticLight();
                    setCategory(cat.id as any);
                  }}
                >
                  <HStack
                    space="xs"
                    alignItems="center"
                    sx={{
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      backgroundColor: category === cat.id ? Theme.colors.sanctuarySaffron : Theme.colors.ink,
                      borderRadius: Theme.corners.comfortable
                    }}
                  >
                    <Text sx={{ fontSize: 16 }}>{cat.emoji}</Text>
                    <Text
                      sx={{
                        color: category === cat.id ? Theme.colors.sacredWhite : Theme.colors.mistGray,
                        marginLeft: 4
                      }}
                      size="sm"
                    >
                      {cat.label}
                    </Text>
                  </HStack>
                </Pressable>
              ))}
            </HStack>
          </Box>

          {/* Moment Description */}
          <Box>
            <Text sx={{ color: Theme.colors.mistGray, marginBottom: 8 }} size="sm">
              {t('self.momentDescription') || 'The Moment'}
            </Text>
            <Input
              variant="outline"
              size="md"
              sx={{
                backgroundColor: Theme.colors.ink,
                borderWidth: 1,
                borderColor: 'transparent',
                minHeight: 100
              }}
            >
              <InputField
                placeholder={t('self.momentDescriptionPlaceholder') || 'What happened?'}
                value={momentDescription}
                onChangeText={setMomentDescription}
                multiline
                sx={{ color: Theme.colors.sacredWhite, textAlignVertical: 'top', paddingTop: 12 }}
                placeholderTextColor={Theme.colors.dimGray}
              />
            </Input>
          </Box>

          {/* Actions */}
          <HStack space="md" sx={{ justifyContent: 'flex-end', marginTop: 8 }}>
            <Button
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
            >
              <ButtonText sx={{ color: Theme.colors.mistGray }}>
                {t('common.cancel') || 'Cancel'}
              </ButtonText>
            </Button>
            <Button
              size="md"
              onPress={handleSaveMoment}
              isDisabled={!momentDescription.trim() || isSaving}
              sx={{
                backgroundColor: Theme.colors.sanctuarySaffron,
                borderRadius: Theme.corners.comfortable
              }}
            >
              <ButtonText sx={{ color: 'white' }}>{t('common.save') || 'Save'}</ButtonText>
            </Button>
          </HStack>
        </VStack>
      )}
    </VStack>
  );
}
