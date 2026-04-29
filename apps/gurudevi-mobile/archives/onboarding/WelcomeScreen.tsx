import { handleAPIError } from '@repo/core';
import { authAPI } from '@repo/core/api';

import {
  Box,
  Button,
  ButtonText,
  Center,
  Checkbox,
  CheckboxIcon,
  CheckboxIndicator,
  CheckIcon,
  Heading,
  HStack,
  Link,
  LinkText,
  ScreenWrapper,
  Text,
  Toast,
  ToastTitle,
  useThemedColors,
  useToast,
  VStack,
} from '@repo/ui';
import { Pressable } from '@repo/ui/primitives';
import { Theme } from '@repo/ui/theme';
import { hapticError, hapticLight, hapticSuccess } from '@repo/ui/utils/haptics';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dimensions, Image } from 'react-native';
import { LanguageUtils } from '../utils/LanguageUtils';

const { width } = Dimensions.get('window');
const LOGO = require('../../assets/icon.png');

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'si', label: 'Sinhala' },
  { code: 'ta', label: 'Tamil' },
];

interface WelcomeScreenProps {
  onLogin?: () => void;
  onGuest?: () => void;
}

export default function WelcomeScreen({ onLogin, onGuest }: WelcomeScreenProps) {
  const { t, i18n } = useTranslation();
  const colors = useThemedColors();
  const [acceptedTerms, setAcceptedTerms] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const toast = useToast();

  const changeLanguage = async (langCode: string) => {
    hapticLight();
    await LanguageUtils.setLanguage(langCode as 'en' | 'si' | 'ta');
  };

  const showTermsToast = () => {
    toast.show({
      placement: 'top',
      render: ({ id }) => (
        <Toast nativeID={id} variant="accent" action="info">
          <VStack space="xs">
            <ToastTitle>
              {t('auth.acceptTermsRequired') ||
                'Please accept the Terms and Privacy Pact to continue in the sanctuary'}
            </ToastTitle>
          </VStack>
        </Toast>
      ),
    });
  };

  const handleStartExploring = async () => {
    if (!acceptedTerms) {
      hapticError();
      showTermsToast();
      return;
    }

    hapticSuccess();
    setIsConnecting(true);
    try {
      await authAPI.signInAnonymously();
      if (onGuest) onGuest();
    } catch (error) {
      handleAPIError(error);
      setIsConnecting(false);
    }
  };

  const handleLogin = () => {
    if (!acceptedTerms) {
      hapticError();
      showTermsToast();
      return;
    }
    hapticLight();
    // Identity Phase: Navigate to Auth screen
    if (onLogin) onLogin();
  };

  return (
    <ScreenWrapper scroll>
      {/* Language Selector */}
      <Box
        sx={{ position: 'absolute', top: Theme.spacing.xl, right: Theme.spacing.lg, zIndex: 10 }}
      >
        <HStack
          space="xs"
          sx={{
            backgroundColor: colors.secondary,
            borderRadius: 20,
            padding: 4,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          {LANGUAGES.map((lang) => (
            <Pressable
              key={lang.code}
              onPress={() => changeLanguage(lang.code)}
              accessibilityRole="button"
              accessibilityLabel={t('accessibility.switchLanguage', { lang: lang.label })}
              accessibilityState={{ selected: i18n.language?.startsWith(lang.code) }}
              sx={{
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 16,
                backgroundColor: i18n.language?.startsWith(lang.code)
                  ? colors.action
                  : 'transparent',
              }}
            >
              <Text
                size="xs"
                color={
                  i18n.language?.startsWith(lang.code)
                    ? Theme.colors.sacredWhite
                    : colors.textSecondary
                }
                bold={i18n.language?.startsWith(lang.code)}
              >
                {lang.code.toUpperCase()}
              </Text>
            </Pressable>
          ))}
        </HStack>
      </Box>

      <Center sx={{ flex: 1, paddingVertical: Theme.spacing.xl, paddingHorizontal: 24 }}>
        <VStack space="2xl" alignItems="center" sx={{ width: '100%', maxWidth: 400 }}>
          {/* Hero Section */}
          <VStack space="lg" alignItems="center">
            <Box
              sx={{
                width: 140,
                height: 140,
                borderRadius: 70,
                backgroundColor: colors.secondary,
                justifyContent: 'center',
                alignItems: 'center',
                shadowColor: colors.shadow,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
                elevation: 8,
                mb: '$2',
              }}
            >
              <Image
                source={LOGO}
                style={{ width: 90, height: 90, borderRadius: 12 }}
                accessible={true}
                accessibilityLabel={t('accessibility.appLogo')}
              />
            </Box>
            <VStack space="xs" alignItems="center">
              <Heading
                color={colors.action}
                size="4xl"
                textAlign="center"
                sx={{ letterSpacing: -1.5, fontWeight: '$bold' }}
              >
                Gurudevi
              </Heading>
              <Text
                color={colors.textSecondary}
                size="lg"
                textAlign="center"
                sx={{ maxWidth: 280, lineHeight: '$lg' }}
              >
                {t('welcome.subtitle')}
              </Text>
            </VStack>
          </VStack>

          {/* Actions Area */}
          <VStack space="xl" sx={{ width: '100%', mt: '$4' }}>
            <VStack space="lg">
              <HStack space="md" alignItems="center" justifyContent="center" sx={{ px: '$4' }}>
                <Checkbox
                  size="md"
                  value="terms"
                  isChecked={acceptedTerms}
                  onChange={(checked) => {
                    hapticLight();
                    setAcceptedTerms(checked);
                  }}
                  aria-label="Accept Terms"
                >
                  <CheckboxIndicator
                    sx={{
                      borderColor: colors.action,
                      backgroundColor: 'transparent',
                      borderRadius: '$sm',
                      borderWidth: 2,
                      ':checked': {
                        backgroundColor: 'transparent',
                        borderColor: colors.action,
                      },
                      ':active': {
                        backgroundColor: 'transparent',
                      },
                      ':hover': {
                        backgroundColor: 'transparent',
                      },
                    }}
                  >
                    <CheckboxIcon as={CheckIcon} color={colors.action} sx={{ boxSize: '$4' }} />
                  </CheckboxIndicator>
                </Checkbox>
                <HStack space="xs" flexShrink={1}>
                  <Text size="sm" color={colors.textTertiary}>
                    {t('welcome.acceptTerms')}
                  </Text>
                  <Link href="https://neevsk.org/privacy">
                    <LinkText
                      size="sm"
                      color={colors.action}
                      sx={{ textDecorationLine: 'none', fontWeight: '$medium' }}
                    >
                      {t('welcome.privacyPactLink')}
                    </LinkText>
                  </Link>
                </HStack>
              </HStack>

              <Button
                size="xl"
                variant="solid"
                onPress={handleStartExploring}
                isDisabled={isConnecting || !acceptedTerms}
                sx={{
                  backgroundColor: acceptedTerms ? colors.action : colors.textTertiary,
                  borderRadius: Theme.corners.comfortable,
                  height: 64,
                  elevation: 2,
                  width: '100%',
                  ':active': {
                    opacity: 0.8,
                  },
                }}
              >
                <ButtonText color={Theme.colors.white} fontWeight="$bold" size="lg">
                  {isConnecting ? t('welcome.openingSanctuary') : t('welcome.exploreAsGuest')}
                </ButtonText>
              </Button>
            </VStack>

            <Button
              size="lg"
              variant="outline"
              onPress={handleLogin}
              sx={{
                borderColor: colors.textTertiary,
                borderRadius: Theme.corners.comfortable,
                height: 52,
                borderWidth: 1,
                width: '100%',
              }}
            >
              <ButtonText color={colors.textSecondary} fontWeight="$medium">
                {t('welcome.login')}
              </ButtonText>
            </Button>
          </VStack>

          {/* Footer */}
          <Text color={colors.textTertiary} size="xs" textAlign="center" mt="$2">
            {t('welcome.footer')}
          </Text>
        </VStack>
      </Center>
    </ScreenWrapper>
  );
}
