import { handleAPIError, LanguageUtils } from '@repo/core/logic';
import { authAPI } from '@repo/core/auth';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image } from 'react-native';
import ScreenWrapper from '../components/ScreenWrapper';
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
} from '../gluestack';
import { useTheme } from '../hooks/useTheme';
import { useSanctuaryToast } from '../providers/ToastProvider';
import { Theme } from '../theme/Theme';
import { hapticError, hapticLight, hapticSuccess } from '../utils/haptics';

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
  const { accent } = useTheme();
  const [acceptedTerms, setAcceptedTerms] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const { showToast } = useSanctuaryToast();

  const changeLanguage = async (langCode: string) => {
    hapticLight();
    await LanguageUtils.setLanguage(langCode as 'en' | 'si' | 'ta');
  };

  const showTermsToast = () => {
    showToast({
      message:
        t('auth.acceptTermsRequired') ||
        'Please accept the Terms and Privacy Pact to continue in the sanctuary',
      type: 'error',
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
            {LANGUAGES.map((lang) => {
              const isActive = i18n.language?.startsWith(lang.code);
              return (
                <Pressable
                  key={lang.code}
                  onPress={() => changeLanguage(lang.code)}
                  accessibilityRole="button"
                  accessibilityLabel={t('accessibility.switchLanguage', { lang: lang.label })}
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
            })}
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
              <Box className="w-[156px] h-[156px] rounded-[40px] self-center bg-phase-surface justify-center items-center border border-phase-border shadow-xl">
                <Box className="absolute inset-2.5 rounded-[32px] bg-phase-accent/5" />
                <Image
                  source={LOGO}
                  style={{ width: 96, height: 96, borderRadius: 18 }}
                  accessible={true}
                  accessibilityLabel={t('accessibility.appLogo')}
                />
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
              {[
                { label: 'Self', tone: accent.action },
                { label: 'Classroom', tone: Theme.colors.gurudeviBlue },
                { label: 'Community', tone: Theme.colors.gurudeviViolet },
                { label: 'Library', tone: Theme.colors.sageGreen },
              ].map((pillar) => (
                <Box
                  key={pillar.label}
                  className="px-4 py-1.5 rounded-full border"
                  style={{ backgroundColor: `${pillar.tone}12`, borderColor: `${pillar.tone}30` }}
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
                  Enter as a guest to explore the sanctuary, or return to the account that already
                  holds your path.
                </Text>
              </VStack>

              <VStack className="gap-4">
                <HStack className="gap-3 items-center justify-center">
                  <Checkbox
                    value="terms"
                    isChecked={acceptedTerms}
                    onChange={(checked: boolean) => {
                      hapticLight();
                      setAcceptedTerms(checked);
                    }}
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
                    <Link href="https://neevsk.org/privacy" isExternal>
                      <LinkText className="text-sm">{t('welcome.privacyPactLink')}</LinkText>
                    </Link>
                  </HStack>
                </HStack>

                <VStack className="gap-3">
                  <Button
                    onPress={handleStartExploring}
                    isDisabled={isConnecting || !acceptedTerms}
                    className={`h-[64px] rounded-2xl shadow-md ${acceptedTerms ? 'bg-phase-accent' : 'bg-phase-text-secondary opacity-50'}`}
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
                    className="h-[54px] rounded-2xl border-phase-border bg-transparent"
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
}
