import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Pressable
} from '@/ui';
import { Battery, BatteryLow, BatteryMedium, BatteryFull } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Theme } from '../../constants/Theme';
import { useThemedColors } from '../../hooks/useThemedColors';
import { supabase } from '../../lib/supabase';
import { hapticLight, hapticSuccess } from '../../utils/haptics';
import { EnergyForecast as EnergyForecastType } from '../../types/Wellbeing';
import { useSafeMutation } from '../../hooks/useSafeMutation';
import { useEnergyForecast } from '../../hooks/self/useEnergyForecast';
import SkeletonLoader, { SkeletonCard } from '../shared/SkeletonLoader';
import PositiveInvitation from '../shared/PositiveInvitation';

interface EnergyForecastProps {
  userId?: string;
}

export default function EnergyForecast({ userId }: EnergyForecastProps) {
  const { t } = useTranslation();
  const colors = useThemedColors();

  // Resilient Data Hook
  const { forecasts, refreshData, isLoading: dataLoading } = useEnergyForecast(userId);

  const [todayForecast, setTodayForecast] = useState<EnergyForecastType | null>(null);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (forecasts.length > 0) {
      const today = new Date().toISOString().split('T')[0];
      const found = forecasts.find(f => f.forecast_date === today);
      setTodayForecast(found || null);
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
    await saveEnergy(level);
  };

  const energyLevels = [
    {
      level: 1,
      label: t('self.energyDepleted'),
      icon: BatteryLow,
      color: Theme.colors.emberRed,
      emoji: '😰'
    },
    {
      level: 2,
      label: t('self.energyLow'),
      icon: BatteryLow,
      color: Theme.colors.emberOrange,
      emoji: '😔'
    },
    {
      level: 3,
      label: t('self.energyOkay'),
      icon: BatteryMedium,
      color: Theme.colors.templeGold,
      emoji: '😐'
    },
    {
      level: 4,
      label: t('self.energyGood'),
      icon: BatteryFull,
      color: Theme.colors.sageGreen,
      emoji: '😊'
    },
    {
      level: 5,
      label: t('self.energyEnergized'),
      icon: BatteryFull,
      color: Theme.colors.gurudeviBlue,
      emoji: '🌟'
    }
  ];

  const getBatteryIcon = () => {
    if (!todayForecast) return Battery;
    if (todayForecast.energy_level <= 2) return BatteryLow;
    if (todayForecast.energy_level <= 3) return BatteryMedium;
    return BatteryFull;
  };

  if (dataLoading && userId) {
    return (
      <VStack space="lg" sx={{ flex: 1, padding: Theme.spacing.lg }}>
        <SkeletonCard height={80} />
        <SkeletonCard height={80} />
        <SkeletonCard height={80} />
      </VStack>
    );
  }

  if (!userId) {
    return (
      <PositiveInvitation
        type="guest"
        onAction={() => { }} // TODO: Navigate to Auth
      />
    );
  }

  const BatteryIcon = getBatteryIcon();

  return (
    <VStack space="lg" sx={{ flex: 1 }}>
      <VStack space="xs">
        <HStack space="sm" alignItems="center">
          <BatteryIcon
            color={
              todayForecast
                ? energyLevels[todayForecast.energy_level - 1].color
                : colors.action
            }
            size={24}
          />
          <Heading color={colors.text} size="lg">
            {t('self.energyForecast')}
          </Heading>
        </HStack>
        <Text color={colors.textSecondary} size="sm">
          {t('self.energyForecastDesc')}
        </Text>
      </VStack>

      {todayForecast ? (
        <Box
          p={Theme.spacing.lg}
          sx={{
            backgroundColor: colors.secondary,
            borderRadius: Theme.corners.comfortable,
            borderWidth: 2,
            borderColor: energyLevels[todayForecast.energy_level - 1].color
          }}
        >
          <VStack space="md" alignItems="center">
            <Text fontSize="$4xl">
              {energyLevels[todayForecast.energy_level - 1].emoji}
            </Text>
            <Text
              color={energyLevels[todayForecast.energy_level - 1].color}
              size="xl"
              bold
            >
              {energyLevels[todayForecast.energy_level - 1].label}
            </Text>
            <Text color={colors.textSecondary} size="sm">
              {t('self.checkedToday')} {new Date(todayForecast.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
            <Pressable
              onPress={() => setTodayForecast(null)}
              mt="$2"
            >
              <Text color={colors.textTertiary} size="sm" underline>
                {t('self.updateForecast')}
              </Text>
            </Pressable>
          </VStack>
        </Box>
      ) : (
        <VStack space="md">
          <Text color={colors.textSecondary} size="md" textAlign="center">
            {t('self.capacityToday')}
          </Text>

          {energyLevels.map((energy) => (
            <Pressable
              key={energy.level}
              onPress={() => handleSelectEnergy(energy.level as any)}
              disabled={isLoading}
            >
              <HStack
                space="md"
                alignItems="center"
                p="$4"
                sx={{
                  backgroundColor: colors.secondary,
                  borderRadius: Theme.corners.comfortable,
                  borderWidth: 2,
                  borderColor: 'transparent',
                  ':hover': {
                    borderColor: energy.color
                  }
                }}
              >
                <Box
                  sx={{
                    width: 50,
                    height: 50,
                    borderRadius: Theme.corners.full,
                    backgroundColor: energy.color + '20',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Text fontSize="$2xl">{energy.emoji}</Text>
                </Box>

                <VStack space="xs" sx={{ flex: 1 }}>
                  <Text
                    color={colors.text}
                    size="md"
                    bold
                  >
                    {energy.label}
                  </Text>
                  <HStack space="xs">
                    {[...Array(energy.level)].map((_, i) => (
                      <Box
                        key={i}
                        sx={{
                          width: 30,
                          height: 6,
                          borderRadius: 3,
                          backgroundColor: energy.color
                        }}
                      />
                    ))}
                    {[...Array(5 - energy.level)].map((_, i) => (
                      <Box
                        key={i}
                        sx={{
                          width: 30,
                          height: 6,
                          borderRadius: 3,
                          backgroundColor: colors.border
                        }}
                      />
                    ))}
                  </HStack>
                </VStack>

                <energy.icon color={energy.color} size={24} />
              </HStack>
            </Pressable>
          ))}
        </VStack>
      )}

      {todayForecast && (
        <Box
          p="$3"
          sx={{
            backgroundColor: colors.tertiary,
            borderRadius: Theme.corners.comfortable
          }}
        >
          <Text color={colors.textSecondary} size="sm" textAlign="center">
            💭 {t('self.energyReminder')}
          </Text>
        </Box>
      )}
    </VStack>
  );
}
