import { authAPI } from '@repo/core/auth';
import { LanguageUtils } from '@repo/core/logic';
import { Mascot, type MascotArtworkSource } from '@repo/ui/components/Mascot';
import { PressableScale } from '@repo/ui/components/PressableScale';
import ScreenWrapper from '@repo/ui/components/ScreenWrapper';
import { SkiaGlowAura } from '@repo/ui/components/SkiaGlowAura';
import { useTheme } from '@repo/ui/hooks/useTheme';
import {
  Box,
  Button,
  ButtonText,
  Checkbox,
  CheckboxIcon,
  CheckboxIndicator,
  CheckIcon,
  Heading,
  HStack,
  Link,
  LinkText,
  Pressable,
  Spinner,
  Text,
  VStack,
} from '@repo/ui/primitives';
import { useSanctuaryToast } from '@repo/ui/providers/ToastProvider';
import { getGuestEntryErrorMessage } from '@repo/ui/screens/welcomeFlow';
import { Theme } from '@repo/ui/theme/Theme';
import { EXTERNAL_URLS } from '@repo/ui/utils';
import { hapticError, hapticLight, hapticSuccess } from '@repo/ui/utils/haptics';
import { memo, useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'si', label: 'Sinhala' },
  { code: 'ta', label: 'Tamil' },
] as const;

interface LanguagePillProps {
  lang: (typeof LANGUAGES)[number];
  isActive: boolean;
  onPress: (code: string) => void;
  t: (key: string, options?: Record<string, unknown>) => string;
}

const LanguagePill = memo(({ lang, isActive, onPress, t }: LanguagePillProps) => {
  const handlePress = useCallback(() => onPress(lang.code), [lang.code, onPress]);

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={t('accessibility.switchLanguage', {
        lang: lang.label,
      })}
      accessibilityHint={
        t('accessibility.switchLanguageHint') || 'Changes the application language'
      }
      accessibilityState={{ selected: isActive }}
      className={`px-2.5 py-1.5 rounded-2xl ${isActive ? 'bg-phase-accent' : 'bg-transparent'}`}
    >
      <Text
        className={`text-[10px] font-bold ${isActive ? 'text-white' : 'text-phase-text-secondary'}`}
      >
        {lang.code.toUpperCase()}
      </Text>
    </Pressable>
  );
});

interface WelcomeScreenProps {
  onLogin?: () => void;
  onGuest?: () => void;
  exploreArtwork?: MascotArtworkSource;
}

const WelcomeScreen = memo(({ onLogin, onGuest, exploreArtwork }: WelcomeScreenProps) => {
  const { t, i18n } = useTranslation();
  const { accent, animationsEnabled, blurEnabled } = useTheme();
  const [acceptedTerms, setAcceptedTerms] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const guestEntryInFlightRef = useRef(false);
  const { showToast } = useSanctuaryToast();

  const changeLanguage = useCallback((langCode: string) => {
    hapticLight();
    void LanguageUtils.setLanguage(langCode as 'en' | 'si' | 'ta');
  }, []);

  const showTermsToast = useCallback(() => {
    showToast({
      message:
        t('auth.acceptTermsRequired') ||
        'Please accept the Terms of Use and Privacy Policy to continue in the sanctuary',
      type: 'error',
    });
  }, [showToast, t]);

  const handleStartExploring = useCallback(async () => {
    if (isConnecting || guestEntryInFlightRef.current) return;
    if (!acceptedTerms) {
      hapticError();
      showTermsToast();
      return;
    }

    hapticSuccess();
    guestEntryInFlightRef.current = true;
    setIsConnecting(true);
    try {
      await authAPI.signInAnonymously();
      if (onGuest) onGuest();
    } catch (error) {
      console.error('Guest login failed:', error);
      showToast({
        message: getGuestEntryErrorMessage(
          error,
          t('auth.guestLoginFailed') ||
            'We could not open the sanctuary doors for you right now. Please try again.',
        ),
        type: 'error',
      });
    } finally {
      guestEntryInFlightRef.current = false;
      setIsConnecting(false);
    }
  }, [acceptedTerms, onGuest, showTermsToast, showToast, t]);

  const handleStartExploringPress = useCallback(() => {
    void handleStartExploring();
  }, [handleStartExploring]);

  const handleLogin = useCallback(() => {
    if (!acceptedTerms) {
      hapticError();
      showTermsToast();
      return;
    }
    hapticLight();
    // Identity Phase: Navigate to Auth screen
    if (onLogin) onLogin();
  }, [acceptedTerms, onLogin, showTermsToast]);

  const handleTermsChange = useCallback((checked: boolean) => {
    hapticLight();
    setAcceptedTerms(checked);
  }, []);

  interface Pillar {
    label: string;
    tone: string;
  }

  const pillars = useMemo<Pillar[]>(
    () => [
      { label: 'Self', tone: accent.action },
      { label: 'Workspace', tone: Theme.colors.gurudeviBlue },
      { label: 'Community', tone: Theme.colors.gurudeviViolet },
      { label: 'Library', tone: Theme.colors.sageGreen },
    ],
    [accent.action],
  );

  return (
    <ScreenWrapper scroll>
      <Box className="flex-1 bg-phase-surface px-6 pt-10 pb-12 overflow-hidden">
        {/* Background decorative blobs */}
        <Box
          className="absolute -top-14 -left-9 w-[220px] h-[220px] rounded-full"
          style={{ backgroundColor: `${accent.action}14` }}
        />
        <Box
          className="absolute right-[-44px] top-32 w-[180px] h-[180px] rounded-full"
          style={{ backgroundColor: `${Theme.colors.gurudeviBlue}16` }}
        />
        <Box
          className="absolute left-7 bottom-[92px] w-[140px] h-[140px] rounded-full"
          style={{ backgroundColor: `${Theme.colors.gurudeviViolet}10` }}
        />

        <Box className="items-end mb-6">
          <HStack className="bg-phase-surface rounded-[20px] p-1 border border-phase-border space-x-0.5">
            {LANGUAGES.map((lang) => (
              <LanguagePill
                key={lang.code}
                lang={lang}
                isActive={i18n.language?.startsWith(lang.code)}
                onPress={changeLanguage}
                t={t}
              />
            ))}
          </HStack>
        </Box>

        <VStack className="w-full max-w-[460px] self-center flex-1 gap-8">
          <VStack className="gap-6 pt-4">
            <Box className="self-start px-4 py-1.5 rounded-full bg-phase-accent/10 border border-phase-accent/30">
              <Text className="text-[10px] font-bold text-phase-accent tracking-[0.6px]">
                SANCTUARY FOR TEACHERS
              </Text>
            </Box>

            <VStack className="gap-4">
              <Box className="w-[156px] h-[156px] self-center justify-center items-center relative">
                {animationsEnabled && blurEnabled ? (
                  <SkiaGlowAura
                    active
                    blurRadius={20}
                    color={`${accent.action}B3`}
                    secondaryColor={`${accent.reward}1A`}
                    size={156}
                  >
                    <Box className="w-[156px] h-[156px] rounded-[40px] bg-phase-surface justify-center items-center border border-phase-border shadow-xl relative">
                      <Box className="absolute inset-2.5 rounded-[32px] bg-phase-accent/5" />
                      <Mascot artwork={exploreArtwork} mode="glowing" podVariant="halo" size={156} state="guiding" />
                    </Box>
                  </SkiaGlowAura>
                ) : (
                  <Box className="w-[156px] h-[156px] rounded-[40px] bg-phase-surface justify-center items-center border border-phase-border shadow-xl relative">
                    <Box className="absolute inset-2.5 rounded-[32px] bg-phase-accent/5" />
                    <Mascot artwork={exploreArtwork} mode="glowing" podVariant="halo" size={156} state="guiding" />
                  </Box>
                )}
              </Box>

              <VStack className="gap-2 items-center">
                <Heading className="text-phase-text-primary text-4xl text-center font-bold tracking-[-1.8px]">
                  Gurudevi
                </Heading>
                <Text className="text-phase-text-secondary text-lg text-center max-w-[320px] leading-relaxed">
                  {t('welcome.subtitle')}
                </Text>
              </VStack>
            </VStack>

            <HStack className="justify-center gap-2 flex-wrap">
              {pillars.map((pillar) => (
                <Box
                  key={pillar.label}
                  className="px-4 py-1.5 rounded-full border"
                  style={{
                    backgroundColor: `${pillar.tone}12`,
                    borderColor: `${pillar.tone}30`,
                  }}
                >
                  <Text className="text-[10px] font-bold" style={{ color: pillar.tone }}>
                    {pillar.label}
                  </Text>
                </Box>
              ))}
            </HStack>
          </VStack>

          <Box className="bg-phase-surface rounded-[28px] border border-phase-border p-6 shadow-lg">
            <VStack className="gap-6">
              <VStack className="gap-1.5 ">
                <Text className="text-[10px] text-phase-text-secondary font-bold tracking-widest uppercase">
                  BEGIN QUIETLY
                </Text>
                <Text className="text-phase-text-secondary text-sm leading-relaxed">
                  Enter as an anonymous explorer to explore the sanctuary, or return to the account
                  that already holds your path.
                </Text>
              </VStack>

              <VStack className="gap-6">
                <HStack className="gap-3 items-center justify-center">
                  <Checkbox
                    value="terms"
                    isChecked={acceptedTerms}
                    onChange={handleTermsChange}
                    aria-label="Accept Terms"
                  >
                    <CheckboxIndicator>
                      <CheckboxIcon as={CheckIcon} />
                    </CheckboxIndicator>
                  </Checkbox>
                  <HStack className="gap-1 flex-shrink">
                    <Text className="text-sm text-phase-text-secondary">
                      {t('welcome.acceptTerms')}
                    </Text>
                    <Link href={EXTERNAL_URLS.privacy} isExternal>
                      <LinkText className="text-sm">Privacy Policy</LinkText>
                    </Link>
                    <Text className="text-sm text-phase-text-secondary">and</Text>
                    <Link href={EXTERNAL_URLS.terms} isExternal>
                      <LinkText className="text-sm">Terms of Use</LinkText>
                    </Link>
                  </HStack>
                </HStack>

                <VStack className="gap-3">
                  <Button
                    onPress={handleStartExploringPress}
                    isDisabled={isConnecting || !acceptedTerms}
                    className={`h-[64px] rounded-2xl shadow-md w-full ${acceptedTerms ? 'bg-phase-accent' : 'bg-phase-text-secondary opacity-50'}`}
                  >
                    {isConnecting ? (
                      <Spinner color="white" />
                    ) : (
                      <ButtonText className="text-white font-bold text-lg">
                        {t('welcome.exploreAsGuest')}
                      </ButtonText>
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    onPress={handleLogin}
                    isDisabled={!acceptedTerms}
                    className="h-[54px] rounded-2xl border-phase-border bg-transparent w-full"
                  >
                    <ButtonText className="text-phase-text-secondary font-medium">
                      {t('welcome.login')}
                    </ButtonText>
                  </Button>
                </VStack>
              </VStack>

              <Text className="text-phase-text-secondary text-[10px] text-center opacity-60">
                {t('welcome.footer')}
              </Text>
            </VStack>
          </Box>
        </VStack>
      </Box>
    </ScreenWrapper>
  );
});

LanguagePill.displayName = 'LanguagePill';
WelcomeScreen.displayName = 'WelcomeScreen';

export default WelcomeScreen;
