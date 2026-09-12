import { authAPI } from '@repo/core/auth';
import { LanguageUtils } from '@repo/core/logic';
import {
  LanguageSwitcher,
  SanctuaryDoorwayActions,
  type SanctuaryRealmItem,
  SanctuaryRealmSelector,
} from '@repo/ui/components';
import { Mascot, type MascotArtworkSource } from '@repo/ui/components/Mascot';
import ScreenWrapper from '@repo/ui/components/ScreenWrapper';
import { SkiaGlowAura } from '@repo/ui/components/SkiaGlowAura';
import { useAccessibility } from '@repo/ui/hooks/useAccessibility';
import { useTheme } from '@repo/ui/hooks/useTheme';
import { Box, Heading, HStack, Link, LinkText, Text, VStack } from '@repo/ui/primitives';
import { useSanctuaryToast } from '@repo/ui/providers/ToastProvider';
import { getGuestEntryErrorMessage } from '@repo/ui/screens/welcomeFlow';
import { Theme } from '@repo/ui/theme/Theme';
import { EXTERNAL_URLS, getTouchHitSlop } from '@repo/ui/utils';
import { hapticLight, hapticSuccess } from '@repo/ui/utils/haptics';
import { memo, useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

export interface SanctuaryWelcomeScreenProps {
  onLogin?: () => void;
  onGuest?: () => void;
  exploreArtwork?: MascotArtworkSource;
}

export const SanctuaryWelcomeScreen = memo(
  ({ onLogin, onGuest, exploreArtwork }: SanctuaryWelcomeScreenProps) => {
    const { t, i18n } = useTranslation();
    const { accent, animationsEnabled, blurEnabled, scene } = useTheme();
    const { isReduceMotionEnabled } = useAccessibility();
    const { showToast } = useSanctuaryToast();

    const [isConnecting, setIsConnecting] = useState(false);
    const [selectedRealm, setSelectedRealm] = useState<string>('self');
    const guestEntryInFlightRef = useRef(false);

    const changeLanguage = useCallback((langCode: string) => {
      void LanguageUtils.setLanguage(langCode as 'en' | 'si' | 'ta');
    }, []);

    const handleStartExploring = useCallback(async () => {
      if (isConnecting || guestEntryInFlightRef.current) return;

      hapticSuccess();
      guestEntryInFlightRef.current = true;
      setIsConnecting(true);

      try {
        await authAPI.signInAnonymously();
        if (onGuest) onGuest();
      } catch (error) {
        console.error('[SanctuaryWelcomeScreen] Guest login failed:', error);
        showToast({
          message: getGuestEntryErrorMessage(
            error,
            t('auth.guestLoginFailed') ||
              'We could not open the sanctuary doors for you right now. Please try again.',
            t('common.offlineMessage') ||
              'You appear to be offline. Please check your connection to enter as a guest.',
          ),
          type: 'error',
        });
      } finally {
        guestEntryInFlightRef.current = false;
        setIsConnecting(false);
      }
    }, [isConnecting, onGuest, showToast, t]);

    const handleLoginPress = useCallback(() => {
      hapticLight();
      if (onLogin) onLogin();
    }, [onLogin]);

    const realms = useMemo<readonly SanctuaryRealmItem[]>(
      () => [
        {
          id: 'self',
          label: 'Self',
          title: 'Inner Clarity & Reflection',
          desc: 'Mindful journaling, mood tracking, and personal breathing spaces.',
          tone: accent.action,
        },
        {
          id: 'workspace',
          label: 'Workspace',
          title: 'Classroom & Schedule Calm',
          desc: 'Effortless timetable tracking, relief periods, and curriculum rhythm.',
          tone: Theme.colors.gurudeviBlue,
        },
        {
          id: 'community',
          label: 'Community',
          title: 'Educator Connection',
          desc: 'Shared wisdom, collaborative notes, and peer encouragement.',
          tone: Theme.colors.gurudeviViolet,
        },
      ],
      [accent.action],
    );

    const shouldAnimate = animationsEnabled && blurEnabled && !isReduceMotionEnabled;

    return (
      <ScreenWrapper fullWidth scroll backgroundColor={scene.surface.bg}>
        <Box className="flex-1 min-h-full w-full bg-phase-surface relative overflow-hidden justify-between items-center px-6 pt-6 pb-12">
          {/* Full-bleed ambient organic background lighting */}
          <Box
            className="absolute -top-24 -left-20 w-[420px] h-[420px] rounded-full pointer-events-none opacity-20"
            style={{ backgroundColor: accent.action }}
          />
          <Box
            className="absolute top-80 -right-24 w-[360px] h-[360px] rounded-full pointer-events-none opacity-15"
            style={{ backgroundColor: Theme.colors.gurudeviBlue }}
          />

          <VStack className="gap-8 w-full max-w-[480px] self-center z-10">
            {/* Header: Brand pill + Modular accessible LanguageSwitcher */}
            <HStack className="justify-between items-center w-full pt-2">
              <Box className="px-3.5 py-1.5 rounded-full bg-phase-accent/10 border border-phase-accent/25">
                <Text className="text-xs font-bold text-phase-accent tracking-[2px] uppercase">
                  SANCTUARY
                </Text>
              </Box>

              <LanguageSwitcher
                currentLanguage={i18n.language || 'en'}
                onSelectLanguage={changeLanguage}
              />
            </HStack>

            {/* Living Mascot Hero with breathing halo */}
            <VStack className="items-center gap-6 pt-4">
              <Box className="w-[180px] h-[180px] justify-center items-center relative">
                {shouldAnimate ? (
                  <SkiaGlowAura
                    active
                    blurRadius={28}
                    color={`${accent.action}80`}
                    secondaryColor={`${accent.reward}25`}
                    size={180}
                  >
                    <Mascot
                      artwork={exploreArtwork}
                      mode="glowing"
                      podVariant="halo"
                      size={170}
                      state="guiding"
                    />
                  </SkiaGlowAura>
                ) : (
                  <Mascot
                    artwork={exploreArtwork}
                    mode="glowing"
                    podVariant="halo"
                    size={170}
                    state="guiding"
                  />
                )}
              </Box>

              <VStack className="gap-2.5 items-center">
                <Heading className="text-phase-text-primary text-3xl text-center font-bold tracking-[-0.5px]">
                  {t('welcome.message') || 'Welcome to Gurudevi'}
                </Heading>
                <Text className="text-phase-text-secondary text-sm text-center max-w-[340px] leading-relaxed">
                  {t('welcome.subtitle') || 'Education born from love, built with love.'}
                </Text>
              </VStack>
            </VStack>

            {/* Modular Realm Discovery Component */}
            <SanctuaryRealmSelector
              realms={realms}
              selectedRealmId={selectedRealm}
              onSelectRealm={setSelectedRealm}
            />

            {/* Modular Doorway Action Buttons (1-Tap Guest Entry & Returning Account Doorway) */}
            <SanctuaryDoorwayActions
              isConnecting={isConnecting}
              onExploreGuest={handleStartExploring}
              onSignIn={handleLoginPress}
            />

            {/* Seamless Legal & Security Footnote (Zero-Friction In-App Links) */}
            <VStack className="gap-2 items-center pt-2">
              <HStack className="items-center justify-center flex-wrap gap-1">
                <Text className="text-sm text-phase-text-secondary">
                  By entering, you accept our
                </Text>
                <Link
                  href={EXTERNAL_URLS.terms}
                  isExternal
                  hitSlop={getTouchHitSlop(40, 24)}
                  accessibilityRole="link"
                  accessibilityLabel="Terms of Use"
                >
                  <LinkText className="text-sm font-semibold text-phase-accent underline">
                    Terms of Use
                  </LinkText>
                </Link>
                <Text className="text-sm text-phase-text-secondary">&</Text>
                <Link
                  href={EXTERNAL_URLS.privacy}
                  isExternal
                  hitSlop={getTouchHitSlop(40, 24)}
                  accessibilityRole="link"
                  accessibilityLabel="Privacy Policy"
                >
                  <LinkText className="text-sm font-semibold text-phase-accent underline">
                    Privacy Policy
                  </LinkText>
                </Link>
              </HStack>

              <Text className="text-sm text-phase-text-secondary/70 text-center">
                Encrypted • Offline-First • Designed for Educators
              </Text>
            </VStack>
          </VStack>
        </Box>
      </ScreenWrapper>
    );
  },
);

SanctuaryWelcomeScreen.displayName = 'SanctuaryWelcomeScreen';

export default SanctuaryWelcomeScreen;
