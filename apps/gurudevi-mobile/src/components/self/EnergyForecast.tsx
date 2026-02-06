import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Pressable
} from '@gluestack-ui/themed';
import { Battery, BatteryLow, BatteryMedium, BatteryFull } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Theme } from '../../constants/Theme';
import { supabase } from '../../lib/supabase';
import { hapticLight, hapticSuccess } from '../../utils/haptics';
import { EnergyForecast as EnergyForecastType } from '../../types/Wellbeing';

interface EnergyForecastProps {
  userId?: string;
}

export default function EnergyForecast({ userId }: EnergyForecastProps) {
  const { t } = useTranslation();
  const [todayForecast, setTodayForecast] = useState<EnergyForecastType | null>(null);
  const [loading, setLoading] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (userId) {
      loadTodayForecast();
    }
  }, [userId]);

  const loadTodayForecast = async () => {
    if (!userId) return;
    
    const { data, error } = await supabase
      .from('energy_forecasts')
      .select('*')
      .eq('user_id', userId)
      .eq('forecast_date', today)
      .single();

    if (data) {
      setTodayForecast(data);
    }
  };

  const handleSelectEnergy = async (level: 1 | 2 | 3 | 4 | 5) => {
    if (!userId) return;
    
    setLoading(true);
    hapticLight();

    const { error } = await supabase
      .from('energy_forecasts')
      .upsert({
        user_id: userId,
        energy_level: level,
        forecast_date: today
      }, {
        onConflict: 'user_id,forecast_date'
      });

    if (!error) {
      hapticSuccess();
      await loadTodayForecast();
    }
    
    setLoading(false);
  };

  const energyLevels = [
    {
      level: 1,
      label: t('self.energyDepleted'),
      icon: BatteryLow,
      color: '#FF6B6B',
      emoji: '😰'
    },
    {
      level: 2,
      label: t('self.energyLow'),
      icon: BatteryLow,
      color: '#FFA07A',
      emoji: '😔'
    },
    {
      level: 3,
      label: t('self.energyOkay'),
      icon: BatteryMedium,
      color: '#FFD93D',
      emoji: '😐'
    },
    {
      level: 4,
      label: t('self.energyGood'),
      icon: BatteryFull,
      color: '#6BCB77',
      emoji: '😊'
    },
    {
      level: 5,
      label: t('self.energyEnergized'),
      icon: BatteryFull,
      color: '#4D96FF',
      emoji: '🌟'
    }
  ];

  const getBatteryIcon = () => {
    if (!todayForecast) return Battery;
    if (todayForecast.energy_level <= 2) return BatteryLow;
    if (todayForecast.energy_level <= 3) return BatteryMedium;
    return BatteryFull;
  };

  const BatteryIcon = getBatteryIcon();

  return (
    <VStack space="lg" sx={{ flex: 1 }}>
      <VStack space="xs">
        <HStack space="sm" alignItems="center">
          <BatteryIcon
            color={
              todayForecast
                ? energyLevels[todayForecast.energy_level - 1].color
                : Theme.colors.sanctuarySaffron
            }
            size={24}
          />
          <Heading color={Theme.colors.sacredWhite} size="lg">
            {t('self.energyForecast')}
          </Heading>
        </HStack>
        <Text color={Theme.colors.mistGray} size="sm">
          {t('self.energyForecastDesc')}
        </Text>
      </VStack>

      {todayForecast ? (
        <Box
          p={Theme.spacing.lg}
          sx={{
            backgroundColor: Theme.colors.deepIndigo,
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
            <Text color={Theme.colors.mistGray} size="sm">
              Checked today at {new Date(todayForecast.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
            <Pressable
              onPress={() => setTodayForecast(null)}
              mt="$2"
            >
              <Text color={Theme.colors.dimGray} size="sm" underline>
                Update forecast
              </Text>
            </Pressable>
          </VStack>
        </Box>
      ) : (
        <VStack space="md">
          <Text color={Theme.colors.mistGray} size="md" textAlign="center">
            How's your capacity today?
          </Text>
          
          {energyLevels.map((energy) => (
            <Pressable
              key={energy.level}
              onPress={() => handleSelectEnergy(energy.level as any)}
              isDisabled={loading}
            >
              <HStack
                space="md"
                alignItems="center"
                p="$4"
                sx={{
                  backgroundColor: Theme.colors.deepIndigo,
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
                    color={Theme.colors.sacredWhite}
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
                          backgroundColor: Theme.colors.dimGray
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
            backgroundColor: Theme.colors.deepIndigo,
            borderRadius: Theme.corners.comfortable
          }}
        >
          <Text color={Theme.colors.mistGray} size="sm" textAlign="center">
            💭 Remember: Your energy naturally fluctuates. This helps you plan accordingly.
          </Text>
        </Box>
      )}
    </VStack>
  );
}
