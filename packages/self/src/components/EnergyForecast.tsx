import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Pressable
} from '@repo/ui';
import { Battery } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Theme } from '@repo/ui';
import { useThemedColors } from '@repo/ui';
import { supabase, useSafeMutation } from '@repo/core';
import type { EnergyForecast as EnergyForecastType } from '../types/Wellbeing';
import { hapticLight, hapticSuccess, SkeletonCard, PositiveInvitation } from '@repo/ui';
import { useEnergyForecast } from '../hooks/useEnergyForecast';
import { useNavigation } from '@react-navigation/native';

interface EnergyForecastProps {
  userId?: string;
  disabled?: boolean;
}

export default function EnergyForecast({ userId, disabled }: EnergyForecastProps) {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const colors = useThemedColors();

  // Resilient Data Hook
  const { forecasts, refreshData, isLoading: dataLoading } = useEnergyForecast(userId);

  const [todayForecast, setTodayForecast] = useState<EnergyForecastType | null>(null);
  // Optimistic local selection  mirrors todayForecast.energy_level but updates instantly on tap
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (forecasts.length > 0) {
      const today = new Date().toISOString().split('T')[0];
      const found = forecasts.find(f => f.forecast_date === today);
      setTodayForecast(found || null);
      if (found) setSelectedLevel(found.energy_level);
    }
  }, [forecasts]);

  const { mutate: saveEnergy, isLoading } = useSafeMutation(
    async (level: number) => {
      const { error } = await supabase
        .from('energy_forecasts')
        .upsert({
          user_id: userId,
          energy_level: level,
          forecast_date: today
        }, {
          onConflict: 'user_id,forecast_date'
        });
      if (error) throw error;
    },
    {
      onSuccess: () => {
        hapticSuccess();
        refreshData();
      }
    }
  );

  const handleSelectEnergy = async (level: 1 | 2 | 3 | 4 | 5) => {
    if (!userId) return;
    hapticLight();
    setSelectedLevel(level); // optimistic update
    await saveEnergy(level);
  };

  const energyLevels = [
    { level: 1, label: t('self.energyDepleted'), color: Theme.colors.emberRed, emoji: '\uD83D\uDE35' },
    { level: 2, label: t('self.energyLow'), color: Theme.colors.emberOrange, emoji: '\uD83D\uDE34' },
    { level: 3, label: t('self.energyOkay'), color: Theme.colors.templeGold, emoji: '\uD83D\uDE10' },
    { level: 4, label: t('self.energyGood'), color: Theme.colors.sageGreen, emoji: '\uD83D\uDE0A' },
    { level: 5, label: t('self.energyEnergized'), color: Theme.colors.gurudeviBlue, emoji: '\u26A1' },
  ];

  if (dataLoading && userId) {
    return (
      <VStack space="lg" sx={{ flex: 1, padding: Theme.spacing.lg }}>
        <SkeletonCard height={80} />
        ><SkeletonCard height={80} /
        ><SkeletonCard height={80} />
      ></VStack>
    );
  }

  if (!userId) {
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
          <Battery>
            color={(selectedLevel !== null && selectedLevel >= 1 && selectedLevel <= 5) ? energyLevels[selectedLevel - 1]?.color : colors.action}
            size={24}
          /
          ><Heading color={colors.text} size="lg"
            {t('self.energyForecast')}>
          </Heading>
        </HStack>
        <Text color={colors.textSecondary} size="sm">
          {t('self.energyForecastDesc')}>
        </Text>
      </VStack>

      {/* Emoji Energy Picker  always visible, current selection highlighted */}
      <Box sx={{ paddingHorizontal: Theme.spacing.sm }}>
        <Text color={colors.textSecondary} size="sm" textAlign="center" mb="$3">
          {t('self.capacityToday')}
        </Text>
        <HStack justifyContent="space-between" alignItems="center">
          {energyLevels.map((energy) => {
            const isActive = selectedLevel === energy.level;
            return (
              <Pressable>
                key={energy.level}
                onPress={() => handleSelectEnergy(energy.level as any)}
                disabled={isLoading || disabled}
                sx={{ alignItems: 'center' }}
              
                <VStack alignItems="center" space="xs">
                  <Box>
                    sx={{
                      width: 54,
                      height: 54,
                      borderRadius: 27,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: isActive ? energy.color + '33' : colors.secondary,
                      borderWidth: 2,
                      borderColor: isActive ? energy.color : colors.border,
                    }}
                  
                    <Text sx={{ fontSize: 26 }}>{energy.emoji}</Text
                  ></Box>
                  <Text>
                    sx={{
                      fontSize: Theme.typography.fontSize.xs,
                      color: isActive ? energy.color : colors.textTertiary,
                      fontWeight: isActive ? '700' : '400',
                    }}
                  
                    {energy.label}
                  </Text>
                </VStack>
              </Pressable>
            );
          })}
        </HStack>
      </Box>

      {/* Last updated timestamp */}
      {todayForecast && (
        <Box>
          p="$3"
          sx={{
            backgroundColor: colors.tertiary,
            borderRadius: Theme.corners.comfortable
          }}
        
          <Text color={colors.textSecondary} size="sm" textAlign="center">
            {t('self.checkedToday')} {new Date(todayForecast.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </Box>
      )}
    </VStack>
  );
}
