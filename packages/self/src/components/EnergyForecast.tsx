/**
 * ENERGY FORECAST
 * morning check-in: "What is your capacity today?"
 * Visualizes internal batteries.
 */

import { useRouter } from 'expo-router';
import { useSafeMutation } from '@repo/core/hooks';
import { usePermissions } from '@repo/core/logic';

import PositiveInvitation from '@repo/ui/components/PositiveInvitation';
import { SkeletonCard } from '@repo/ui/components/SkeletonLoader';
import { Box, Heading, HStack, Icon, Pressable, Text, VStack } from '@repo/ui/primitives';
import { hapticLight, hapticSuccess } from '@repo/ui/utils/haptics';

import { Battery, BatteryLow, BatteryMedium, Zap } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { useEnergyForecast } from '../hooks/useEnergyForecast';

interface EnergyForecastProps {
  userId?: string;
  disabled?: boolean;
}

export default function EnergyForecast({
  userId,
  disabled: componentDisabled,
}: EnergyForecastProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const { context } = usePermissions();
  const activeUserId = userId || context.userId;

  const {
    forecasts,
    refreshData,
    isLoading: dataLoading,
    saveForecast,
  } = useEnergyForecast(activeUserId ?? undefined);
  const [selectedLevel, setSelectedLevel] = useState<1 | 2 | 3 | 4 | 5 | null>(null);

  const today = new Date().toISOString().split('T')[0];
  const currentForecast = useMemo(
    () => forecasts.find((f) => f.forecast_date === today) ?? forecasts[0],
    [forecasts, today],
  );
  const displayLevel =
    selectedLevel ?? (currentForecast?.energy_level as 1 | 2 | 3 | 4 | 5 | undefined) ?? null;
  const lastUpdatedAt = currentForecast?.created_at ?? null;

  const { mutate: saveEnergy, isLoading: isSaving } = useSafeMutation(
    async (level: 1 | 2 | 3 | 4 | 5) => {
      await saveForecast({
        forecastDate: today ?? '',
        energyLevel: level,
      });
    },
    {
      onSuccess: () => {
        hapticSuccess();
        void refreshData();
      },
    },
  );

  const handleSelectEnergy = async (level: 1 | 2 | 3 | 4 | 5) => {
    if (!activeUserId || componentDisabled) return;
    hapticLight();
    setSelectedLevel(level); // optimistic update
    await saveEnergy(level);
  };

  const energyLevels = [
    {
      level: 1,
      label: t('self.energyDepleted') || 'Depleted',
      color: 'text-emberRed',
      bg: 'bg-emberRed/10',
      border: 'border-emberRed/20',
      emoji: '😵',
      icon: BatteryLow,
    },
    {
      level: 2,
      label: t('self.energyLow') || 'Low',
      color: 'text-amberGlow',
      bg: 'bg-amberGlow/10',
      border: 'border-amberGlow/20',
      emoji: '😴',
      icon: BatteryLow,
    },
    {
      level: 3,
      label: t('self.energyOkay') || 'Steady',
      color: 'text-mistGray',
      bg: 'bg-mistGray/10',
      border: 'border-mistGray/20',
      emoji: '😐',
      icon: BatteryMedium,
    },
    {
      level: 4,
      label: t('self.energyGood') || 'Good',
      color: 'text-emeraldGreen',
      bg: 'bg-emeraldGreen/10',
      border: 'border-emeraldGreen/20',
      emoji: '😊',
      icon: Battery,
    },
    {
      level: 5,
      label: t('self.energyEnergized') || 'Full',
      color: 'text-sanctuarySaffron',
      bg: 'bg-sanctuarySaffron/10',
      border: 'border-sanctuarySaffron/20',
      emoji: '⚡',
      icon: Zap,
    },
  ];

  if (dataLoading && activeUserId) {
    return (
      <VStack className="p-lg gap-lg">
        <SkeletonCard height={80} />
        <HStack className="justify-between px-md">
          {[1, 2, 3, 4, 5].map((i) => (
            <SkeletonCard key={i} height={60} className="w-14" />
          ))}
        </HStack>
      </VStack>
    );
  }

  if (!activeUserId) {
    return (
      <PositiveInvitation type="anonymous" onAction={() => router.push('/auth')} />
    );
  }

  const currentEnergy = displayLevel ? energyLevels[displayLevel - 1] : null;

  return (
    <VStack className="gap-lg p-lg">
      {/* Header */}
      <VStack className="gap-1">
        <HStack className="items-center gap-2">
          <Icon
            as={currentEnergy?.icon || Battery}
            className={currentEnergy?.color || 'text-sanctuarySaffron'}
            size={24}
          />
          <Heading className="text-sacredWhite" size="lg">
            {t('self.energyForecast') || 'Energy Forecast'}
          </Heading>
        </HStack>
        <Text className="text-mistGray text-sm">
          {t('self.energyForecastDesc') || 'Visualise your internal batteries and capacity.'}
        </Text>
      </VStack>

      {/* Picker Area */}
      <Box className="bg-obsidian p-lg rounded-comfortable border border-white/5 shadow-sm">
        <Text className="text-mistGray text-xs text-center mb-6 uppercase tracking-widest font-bold">
          {t('self.capacityToday') || 'Current Capacity'}
        </Text>

        <HStack className="justify-between items-center">
          {energyLevels.map((energy) => {
            const isActive = selectedLevel === energy.level;
            return (
              <Pressable
                key={energy.level}
                onPress={() => handleSelectEnergy(energy.level as 1 | 2 | 3 | 4 | 5)}
                disabled={isSaving || componentDisabled}
                accessibilityRole="button"
                className="items-center gap-2"
              >
                <Box
                  className={`w-14 h-14 rounded-full items-center justify-center transition-all duration-300 border-2 ${
                    isActive
                      ? `${energy.bg} ${energy.border} scale-115`
                      : 'bg-white/5 border-white/10'
                  }`}
                >
                  <Text className="text-2xl">{energy.emoji}</Text>
                </Box>
                <Text
                  className={`text-[10px] uppercase font-bold tracking-wider ${
                    isActive ? energy.color : 'text-dimGray'
                  }`}
                >
                  {energy.label}
                </Text>
              </Pressable>
            );
          })}
        </HStack>
      </Box>

      {/* Status Feedback */}
      {displayLevel && (
        <Animated.View entering={FadeInUp.duration(400)}>
          <Box
            className={`p-md rounded-comfortable border ${currentEnergy?.bg} ${currentEnergy?.border} items-center`}
          >
            <HStack className="items-center gap-2">
              <Icon as={currentEnergy?.icon || Zap} className={currentEnergy?.color} size={14} />
              <Text className={`text-sm font-bold ${currentEnergy?.color}`}>
                {currentEnergy?.label} Resonance
              </Text>
            </HStack>
          </Box>
        </Animated.View>
      )}

      {/* Last updated timestamp */}
      {lastUpdatedAt && (
        <Animated.View entering={FadeIn}>
          <Box className="bg-white/5 p-sm rounded-full border border-white/5">
            <Text className="text-dimGray text-[10px] text-center italic">
              {t('self.checkedToday') || 'Resonance updated today at'}{' '}
              {new Date(lastUpdatedAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </Box>
        </Animated.View>
      )}

      {/* Guidance */}
      <Box className="p-md bg-white/5 rounded-comfortable border border-white/5 mt-2">
        <Text className="text-mistGray text-[11px] text-center italic">
          GuruDevi: &ldquo;Honour your energy. It is the fuel for your purpose.&rdquo;
        </Text>
      </Box>
    </VStack>
  );
}
