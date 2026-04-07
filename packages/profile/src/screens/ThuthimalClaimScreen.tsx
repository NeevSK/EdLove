/**
 * ThuthimalClaimScreen — Flower of Gratitude gift claim experience
 *
 * Navigated to from QRHandlerScreen when a thuthimal_gift QR is scanned.
 * Philosophy: Non-transactional, dignified, honors teaching as sacred work.
 */

import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Spinner,
  Theme,
  useThemedColors,
  ScreenWrapper,
  hapticSuccess,
  hapticError
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
  const colors = useThemedColors();
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
        <Box sx={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <VStack sx={{ alignItems: 'center', gap: Theme.spacing.lg }}>
            <Spinner size="large" color={Theme.colors.sanctuarySaffron} />
            <Text sx={{ color: Theme.colors.starlightGray, textAlign: 'center' }}>
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
        <Box sx={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: Theme.spacing.xl }}>
          <Animated.View entering={FadeInDown.duration(500)}>
            <VStack sx={{ alignItems: 'center', gap: Theme.spacing.lg }}>
              <Text sx={{ fontSize: 56, textAlign: 'center' }}>🌸</Text>
              <Heading
                sx={{ textAlign: 'center', fontSize: Theme.typography.fontSize['2xl'] }}
                color={Theme.colors.starlightGray as any}
              >
                {t('thuthimalClaim.alreadyBloomedTitle')}
              </Heading>
              <Text sx={{ color: Theme.colors.mistGray, textAlign: 'center', lineHeight: 22 }}>
                {t('thuthimalClaim.alreadyBloomedDesc')}
              </Text>
              <TouchableOpacity 
                accessibilityRole="button"
                onPress={() => navigation.goBack()}
                style={[styles.button, { backgroundColor: Theme.colors.ink }]}
              >
                <Text sx={{ color: Theme.colors.sacredWhite, fontWeight: '600' }}>
                  {t('thuthimalClaim.goBack')}
                </Text>
              </TouchableOpacity>
            </VStack>
          </Animated.View>
        </Box>
      </ScreenWrapper>
    );
  }

  if (claimState === 'error') {
    return (
      <ScreenWrapper>
        <Box sx={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: Theme.spacing.xl }}>
          <VStack sx={{ alignItems: 'center', gap: Theme.spacing.lg }}>
            <Text sx={{ fontSize: 48 }}>⚠️</Text>
            <Heading
              sx={{ textAlign: 'center' }}
              color={Theme.colors.emberRed as any}
            >
              {t('thuthimalClaim.errorTitle')}
            </Heading>
            <Text sx={{ color: Theme.colors.starlightGray, textAlign: 'center' }}>
              {t('thuthimalClaim.errorDesc')}
            </Text>
            <TouchableOpacity 
              accessibilityRole="button"
              onPress={() => navigation.goBack()}
              style={[styles.button, { backgroundColor: Theme.colors.ink }]}
            >
              <Text sx={{ color: Theme.colors.sacredWhite, fontWeight: '600' }}>
                {t('thuthimalClaim.goBack')}
              </Text>
            </TouchableOpacity>
          </VStack>
        </Box>
      </ScreenWrapper>
    );
  }

  // SUCCESS STATE — warm, sacred, non-transactional
  return (
    <ScreenWrapper>
      <Box
        sx={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          padding: Theme.spacing.xl,
          backgroundColor: Theme.colors.obsidian,
        }}
      >
        {/* Flower */}
        <Animated.View style={[styles.flowerContainer, flowerStyle]}>
          <Text style={styles.flowerEmoji}>🌸</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400).duration(600)}>
          <VStack sx={{ alignItems: 'center', gap: Theme.spacing.lg, marginTop: Theme.spacing.xl }}>
            {/* Sinhala title */}
            <Text sx={{ color: Theme.colors.sanctuarySaffron, fontSize: 28, letterSpacing: 2, textAlign: 'center' }}>
              {t('thuthimalClaim.flowerTitle')}
            </Text>
            <Heading
              sx={{
                textAlign: 'center',
                fontSize: Theme.typography.fontSize['2xl'],
                fontWeight: '700',
              }}
              color={Theme.colors.sacredWhite as any}
            >
              {t('thuthimalClaim.giftHeading')}
            </Heading>

            {/* Gift message */}
            <Box
              sx={{
                backgroundColor: `${Theme.colors.sanctuarySaffron}18`,
                borderRadius: Theme.corners.generous,
                borderWidth: 1,
                borderColor: `${Theme.colors.sanctuarySaffron}40`,
                padding: Theme.spacing.lg,
                width: '100%',
              }}
            >
              <Text
                sx={{
                  color: Theme.colors.starlightGray,
                  textAlign: 'center',
                  lineHeight: 24,
                  fontSize: 16,
                }}
              >
                {t('thuthimalClaim.giftFrom')}
              </Text>
              <Text
                sx={{
                  color: Theme.colors.sacredWhite,
                  textAlign: 'center',
                  fontWeight: '700',
                  fontSize: 22,
                  marginTop: Theme.spacing.sm,
                }}
              >
                {gifterName}
              </Text>
              <Text
                sx={{
                  color: Theme.colors.mistGray,
                  textAlign: 'center',
                  fontSize: 13,
                  marginTop: Theme.spacing.sm,
                }}
              >
                {t('thuthimalClaim.giftRecognition')}
              </Text>
            </Box>

            {/* Pro status confirmation */}
            <HStack
              sx={{
                backgroundColor: `${Theme.colors.sageGreen}20`,
                borderRadius: Theme.corners.comfortable,
                borderWidth: 1,
                borderColor: `${Theme.colors.sageGreen}40`,
                paddingHorizontal: Theme.spacing.lg,
                paddingVertical: Theme.spacing.md,
                alignItems: 'center',
                gap: Theme.spacing.sm,
              }}
            >
              <Text sx={{ fontSize: 20 }}>✨</Text>
              <Text sx={{ color: Theme.colors.sageGreen, fontWeight: '600' }}>
                {t('thuthimalClaim.proActive')}
              </Text>
            </HStack>

            {/* Continue button */}
            <TouchableOpacity 
              accessibilityRole="button"
              onPress={handleContinue}
              style={[
                styles.button,
                {
                  backgroundColor: Theme.colors.sanctuarySaffron,
                  width: '100%',
                  marginTop: Theme.spacing.md,
                },
              ]}
            >
              <Text sx={{ color: Theme.colors.obsidian, fontWeight: '700', fontSize: 16, textAlign: 'center' }}>
                {t('thuthimalClaim.enterSanctuary')}
              </Text>
            </TouchableOpacity>
          </VStack>
        </Animated.View>
      </Box>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  flowerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  flowerEmoji: {
    fontSize: 80,
    textAlign: 'center',
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: Theme.corners.comfortable,
    alignItems: 'center',
  },
});
