import { BrandPulse } from '@repo/ui';
import { UniversalModal } from '@repo/ui/components/UniversalModal';
import { useTheme } from '@repo/ui/hooks/useTheme';
import { Check, Info, ShieldAlert, Sparkles, X } from '@repo/ui/icons';
import { Box, Button, ButtonText, Center, Heading, HStack, Icon, Pressable, ScrollView, Text, VStack } from '@repo/ui/primitives';
import { hapticLight } from '@repo/ui/utils/haptics';
import React from 'react';
import { Platform } from 'react-native';
import { useRewardedAdHub } from '../hooks/useRewardedAdHub';

export interface NegentropyHubModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NegentropyHubModal({ isOpen, onClose }: NegentropyHubModalProps) {
  const { accent, text, glass, isDark } = useTheme();
  const { energyBalance, isWatching, cooldownSeconds, showAd } = useRewardedAdHub();

  const balance = energyBalance?.balance ?? 0;
  const remaining = energyBalance?.dailyQuotaRemaining ?? 10;
  const maxQuota = energyBalance?.dailyQuotaMax ?? 10;
  const progressPercent = Math.min(100, Math.round(((maxQuota - remaining) / maxQuota) * 100));

  const handleWatch = async () => {
    hapticLight();
    await showAd();
  };

  const actionColor = accent?.action || '#F6BF8C';
  const rewardColor = accent?.reward || '#FDD925';

  return (
    <UniversalModal isOpen={isOpen} onClose={onClose}>
      <Box
        className="rounded-3xl overflow-hidden max-w-[95vw] w-[540px] p-6 border shadow-2xl"
        style={{
          backgroundColor: isDark ? 'rgba(23, 28, 39, 0.98)' : '#FDFAF3',
          borderColor: glass?.surface?.border || 'rgba(42, 35, 24, 0.18)',
        }}
      >
        {/* Header */}
        <HStack className="items-center justify-between mb-4">
          <HStack className="items-center" space="sm">
            <Box
              className="w-10 h-10 rounded-2xl items-center justify-center"
              style={{ backgroundColor: `${actionColor}20` }}
            >
              <Icon as={Sparkles} size="md" color={actionColor} />
            </Box>
            <VStack>
              <Heading className="text-lg font-bold" style={{ color: text?.primary || '#2A2318' }}>
                Energy Reservoir
              </Heading>
              <Text className="text-xs" style={{ color: text?.muted || '#72695E' }}>
                Voluntary Attention & Negentropy
              </Text>
            </VStack>
          </HStack>
          <Pressable
            onPress={() => {
              hapticLight();
              onClose();
            }}
            className="p-2 rounded-full"
            style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' }}
          >
            <Icon as={X} size="sm" color={text?.muted || '#72695E'} />
          </Pressable>
        </HStack>

        <ScrollView className="max-h-[60vh]" showsVerticalScrollIndicator={false}>
          {/* Balance & Daily Quota Card */}
          <Box
            className="rounded-2xl p-5 mb-4 border"
            style={{
              backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#FAF7ED',
              borderColor: glass?.surface?.border || 'rgba(42, 35, 24, 0.12)',
            }}
          >
            <HStack className="justify-between items-center mb-3">
              <VStack>
                <Text className="text-xs font-semibold uppercase tracking-wider" style={{ color: text?.muted || '#72695E' }}>
                  Current Energy Balance
                </Text>
                <HStack className="items-baseline" space="xs">
                  <Heading className="text-3xl font-extrabold" style={{ color: actionColor }}>
                    {balance}
                  </Heading>
                  <Text className="text-sm font-bold" style={{ color: actionColor }}>
                    Joules
                  </Text>
                </HStack>
              </VStack>
              <Box
                className="px-3 py-1.5 rounded-xl border"
                style={{
                  backgroundColor: `${actionColor}15`,
                  borderColor: `${actionColor}40`,
                }}
              >
                <Text className="text-xs font-bold" style={{ color: actionColor }}>
                  {remaining} of {maxQuota} Capsules Left
                </Text>
              </Box>
            </HStack>

            {/* Quota Progress Bar */}
            <Box className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' }}>
              <Box
                className="h-full rounded-full"
                style={{
                  width: `${progressPercent}%`,
                  backgroundColor: actionColor,
                }}
              />
            </Box>
          </Box>

          {/* Value Exchange Philosophy */}
          <VStack space="sm" className="mb-5 px-1">
            <HStack space="sm" className="items-start">
              <Icon as={Info} size="sm" color={actionColor} style={{ marginTop: 2 }} />
              <Text className="text-xs leading-relaxed flex-1" style={{ color: text?.secondary || '#544A3D' }}>
                By viewing a 15–30s sponsor capsule, you generate real-world compute funds to fight infrastructure entropy. In return, you receive Sanctuary Energy to fuel deep AI queries and unlocked perks.
              </Text>
            </HStack>
          </VStack>

          {/* Action CTA Button */}
          <Center className="my-2">
            {isWatching ? (
              <VStack className="items-center py-4" space="sm">
                <BrandPulse size={36} tintColor={actionColor} />
                <Text className="text-sm font-semibold" style={{ color: text?.primary || '#2A2318' }}>
                  Absorbing Negentropy Capsule...
                </Text>
              </VStack>
            ) : cooldownSeconds > 0 ? (
              <Box
                className="w-full py-3.5 rounded-2xl items-center justify-center border"
                style={{
                  backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#FAF7ED',
                  borderColor: glass?.surface?.border || 'rgba(42, 35, 24, 0.12)',
                }}
              >
                <Text className="text-sm font-bold" style={{ color: text?.muted || '#72695E' }}>
                  Capsule Cooling Down ({cooldownSeconds}s)
                </Text>
              </Box>
            ) : remaining <= 0 ? (
              <Box
                className="w-full py-3.5 rounded-2xl items-center justify-center border"
                style={{
                  backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#FAF7ED',
                  borderColor: glass?.surface?.border || 'rgba(42, 35, 24, 0.12)',
                }}
              >
                <Text className="text-sm font-bold" style={{ color: text?.muted || '#72695E' }}>
                  Daily Harvest Limit Reached (Recharges Midnight)
                </Text>
              </Box>
            ) : (
              <Button
                onPress={handleWatch}
                className="w-full py-3.5 rounded-2xl items-center justify-center shadow-lg"
                style={{ backgroundColor: actionColor }}
              >
                <HStack space="xs" className="items-center justify-center">
                  <Icon as={Sparkles} size="sm" color="#FFFFFF" />
                  <ButtonText className="text-base font-bold text-white">
                    Contribute Attention (+10 Energy)
                  </ButtonText>
                </HStack>
              </Button>
            )}
          </Center>
        </ScrollView>
      </Box>
    </UniversalModal>
  );
}

export default NegentropyHubModal;
