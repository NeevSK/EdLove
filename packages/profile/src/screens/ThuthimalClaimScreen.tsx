/**
 * ThuthimalClaimScreen — Flower of Gratitude gift claim experience
 *
 * Navigated to from QRHandlerScreen when a thuthimal_gift QR is scanned.
 * Philosophy: Non-transactional, dignified, honors teaching as sacred work.
 */

import React, { useEffect, useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Spinner,
  ScreenWrapper,
  hapticSuccess,
  hapticError,
  Button,
  ButtonText,
  AnimatedView,
} from '@repo/ui';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { thuthimalAPI, identityAPI } from '@repo/core';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withSequence,
  withTiming,
  FadeInDown,
} from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';

type ClaimRouteParams = {
  ThuthimalClaim: {
    gift_token: string;
    gifter_name: string;
  };
};

type ClaimState = 'loading' | 'success' | 'already_claimed' | 'error';

export default function ThuthimalClaimScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<ClaimRouteParams, 'ThuthimalClaim'>>();
  const { t } = useTranslation();
  const [claimState, setClaimState] = useState<ClaimState>('loading');
  const [gifterName, setGifterName] = useState(route.params?.gifter_name ?? 'Someone special');

  // Flower bloom animation
  const flowerScale = useSharedValue(0);
  const flowerOpacity = useSharedValue(0);

  const flowerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: flowerScale.value }],
    opacity: flowerOpacity.value,
  }));

  useEffect(() => {
    void claimGift();
  }, []);

  const claimGift = async () => {
    const { gift_token } = route.params;
    try {
      const myId = await identityAPI.getMyInternalId();
      if (!myId) {
        navigation.navigate('Auth');
        return;
      }

      const result = await thuthimalAPI.claimGift({
        gift_token,
        recipient_id: myId,
      });

      if (result.success) {
        setGifterName(result.gifter_name ?? gifterName);
        setClaimState('success');
        hapticSuccess();
        // Bloom animation
        flowerScale.value = withDelay(
          200,
          withSequence(
            withSpring(1.3, { damping: 8, stiffness: 100 }),
            withSpring(1.0, { damping: 12, stiffness: 120 }),
          ),
        );
        flowerOpacity.value = withTiming(1, { duration: 400 });
      } else if (result.error === 'already_claimed_or_invalid') {
        setClaimState('already_claimed');
        hapticError();
      } else {
        setClaimState('error');
        hapticError();
      }
    } catch (err) {
      console.error('ThuthimalClaimScreen error:', err);
      setClaimState('error');
      hapticError();
    }
  };

  const handleContinue = () => {
    navigation.navigate('Main', { screen: 'Profile' });
  };

  if (claimState === 'loading') {
    return (
      <ScreenWrapper>
        <Box className="flex-1 items-center justify-center">
          <VStack className="items-center" space="lg">
            <Spinner size="large" color="#E67E22" />
            <Text className="text-phase-text-secondary text-center">
              {t('thuthimalClaim.loading')}
            </Text>
          </VStack>
        </Box>
      </ScreenWrapper>
    );
  }

  if (claimState === 'already_claimed') {
    return (
      <ScreenWrapper>
        <Box className="flex-1 items-center justify-center p-8">
          <AnimatedView entering={FadeInDown.duration(500)}>
            <VStack className="items-center" space="lg">
              <Text className="text-[56px] text-center">🌸</Text>
              <Heading className="text-center text-2xl text-phase-text-primary">
                {t('thuthimalClaim.alreadyBloomedTitle')}
              </Heading>
              <Text className="text-phase-text-secondary text-center leading-6">
                {t('thuthimalClaim.alreadyBloomedDesc')}
              </Text>
              <Button
                size="lg"
                variant="outline"
                onPress={() => navigation.goBack()}
                className="mt-4 border-phase-surface rounded-2xl"
              >
                <ButtonText className="text-phase-text-primary">
                  {t('thuthimalClaim.goBack')}
                </ButtonText>
              </Button>
            </VStack>
          </AnimatedView>
        </Box>
      </ScreenWrapper>
    );
  }

  if (claimState === 'error') {
    return (
      <ScreenWrapper>
        <Box className="flex-1 items-center justify-center p-8">
          <VStack className="items-center" space="lg">
            <Text className="text-5xl">⚠️</Text>
            <Heading className="text-center text-phase-error">
              {t('thuthimalClaim.errorTitle')}
            </Heading>
            <Text className="text-phase-text-secondary text-center">
              {t('thuthimalClaim.errorDesc')}
            </Text>
            <Button
              size="lg"
              variant="outline"
              onPress={() => navigation.goBack()}
              className="mt-4 border-phase-surface rounded-2xl"
            >
              <ButtonText className="text-phase-text-primary">
                {t('thuthimalClaim.goBack')}
              </ButtonText>
            </Button>
          </VStack>
        </Box>
      </ScreenWrapper>
    );
  }

  // SUCCESS STATE — warm, sacred, non-transactional
  return (
    <ScreenWrapper>
      <Box className="flex-1 items-center justify-center p-8 bg-black">
        {/* Flower */}
        <AnimatedView style={[flowerStyle]} className="items-center justify-center">
          <Text className="text-[80px] text-center">🌸</Text>
        </AnimatedView>

        <AnimatedView entering={FadeInDown.delay(400).duration(600)} className="w-full">
          <VStack className="items-center mt-8" space="lg">
            {/* Sinhala title */}
            <Text className="text-phase-interactive text-2xl tracking-[2px] text-center">
              {t('thuthimalClaim.flowerTitle')}
            </Text>
            <Heading className="text-center text-3xl font-bold text-white">
              {t('thuthimalClaim.giftHeading')}
            </Heading>

            {/* Gift message */}
            <Box className="bg-phase-interactive/10 rounded-[32px] border border-phase-interactive/20 p-8 w-full">
              <Text className="text-phase-text-secondary text-center leading-6 text-lg">
                {t('thuthimalClaim.giftFrom')}
              </Text>
              <Text className="text-white text-center font-bold text-2xl mt-2">
                {gifterName}
              </Text>
              <Text className="text-phase-text-tertiary text-center text-sm mt-2">
                {t('thuthimalClaim.giftRecognition')}
              </Text>
            </Box>

            {/* Pro status confirmation */}
            <HStack className="bg-emerald-500/10 rounded-2xl border border-emerald-500/20 px-6 py-4 items-center" space="sm">
              <Text className="text-xl">✨</Text>
              <Text className="text-emerald-500 font-semibold">
                {t('thuthimalClaim.proActive')}
              </Text>
            </HStack>

            {/* Continue button */}
            <Button
                size="lg"
                onPress={handleContinue}
                className="w-full mt-6 bg-phase-interactive rounded-2xl"
            >
                <ButtonText className="text-white font-bold text-lg">
                    {t('thuthimalClaim.enterSanctuary')}
                </ButtonText>
            </Button>
          </VStack>
        </AnimatedView>
      </Box>
    </ScreenWrapper>
  );
}
