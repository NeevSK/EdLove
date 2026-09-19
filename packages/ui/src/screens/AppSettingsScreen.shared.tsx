import { accountPin, cryptoManager, storage, useStore } from '@repo/core/logic';
import { useActiveSubTabsStore } from '@repo/core/store/useActiveSubTabsStore';
import AccountPinModal from '@repo/ui/components/AccountPinModal';
import DeviceSecurityCenter from '@repo/ui/components/DeviceSecurityCenter';
import { useResponsiveGrid } from '@repo/ui/components/layout';
import { NotificationSettingsPanel } from '@repo/ui/components/NotificationSettingsPanel';
import { Box } from '@repo/ui/components/ui/box';
import { Button, ButtonText } from '@repo/ui/components/ui/button';
import { HStack } from '@repo/ui/components/ui/hstack';
import { Pressable } from '@repo/ui/components/ui/pressable';
import { ScrollView } from '@repo/ui/components/ui/scroll-view';
import { Switch } from '@repo/ui/components/ui/switch';
import { Heading, Text } from '@repo/ui/components/ui/text';
import { VStack } from '@repo/ui/components/ui/vstack';
import { useEnvironment, useFeedbackOptional, useSensoryPreferences } from '@repo/ui/context';
import { useTheme } from '@repo/ui/hooks/useTheme';
import {
  Check,
  ChevronRight,
  Eye,
  EyeOff,
  Globe,
  Info,
  Layers,
  Lock,
  Shield,
  Smartphone,
  Sparkles,
  Zap,
} from '@repo/ui/icons';
import { useSanctuaryToast } from '@repo/ui/providers/ToastProvider';
import { GURUDEVI_SUPPORT_EMAIL } from '@repo/ui/utils';
import { hapticLight, hapticSuccess } from '@repo/ui/utils/haptics';
import * as LocalAuthentication from 'expo-local-authentication';
import { useRouter } from 'expo-router';
import * as ScreenCapture from 'expo-screen-capture';
import type React from 'react';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking, Platform, TextInput } from 'react-native';

interface SettingsNavigation {
  navigate: (route: string, params?: Record<string, unknown>) => void;
}

interface SettingsOptionProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onPress: () => void;
  value?: string;
  isActive?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

const SettingsOption = memo(function SettingsOption({
  icon,
  title,
  description,
  onPress,
  value,
  isActive,
  accessibilityLabel,
  accessibilityHint,
}: SettingsOptionProps) {
  const handlePress = useCallback(() => {
    hapticLight();
    onPress();
  }, [onPress]);

  return (
    <Pressable
      onPress={handlePress}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityHint={accessibilityHint || description}
      className={`bg-phase-surface border border-phase-border p-4 mb-2 rounded-[20px] min-h-[72px] active:opacity-80 transition-all ${isActive ? 'border-phase-primary' : ''}`}
    >
      <HStack className="gap-4 items-center">
        <Box
          className={`w-10 h-10 rounded-[12px] items-center justify-center ${isActive ? 'bg-phase-primary' : 'bg-phase-surface'}`}
        >
          {icon}
        </Box>
        <VStack className="flex-1 gap-1">
          <Text className="text-base font-semibold text-phase-primary">{title}</Text>
          <Text className="text-sm text-phase-secondary leading-relaxed">{description}</Text>
        </VStack>
        <HStack className="gap-2 items-center">
          {value && <Text className="text-sm text-phase-secondary mr-1">{value}</Text>}
          <Box className="text-phase-muted">
            <ChevronRight size={20} />
          </Box>
        </HStack>
      </HStack>
    </Pressable>
  );
});

SettingsOption.displayName = 'SettingsOption';

/**
 * Selection Modal Component
 * Accessible modal for choosing options
 */
interface SelectionModalProps {
  title: string;
  options: Array<{
    id: string;
    label: string;
    description: string;
    icon: React.ReactNode;
    isSelected: boolean;
  }>;
  onSelect: (id: any) => void;
  onClose: () => void;
}

const SelectionOption = memo(function SelectionOption({
  option,
  onSelect,
}: {
  option: SelectionModalProps['options'][0];
  onSelect: (id: any) => void;
}) {
  const handlePress = useCallback(() => {
    hapticLight();
    onSelect(option.id);
  }, [option.id, onSelect]);

  return (
    <Pressable
      onPress={handlePress}
      className={`p-4 rounded-2xl border min-h-[72px] transition-all flex-row items-center gap-4 ${option.isSelected ? 'bg-phase-surface/50 border-phase-primary border-2' : 'bg-phase-surface border-phase-border'}`}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={option.label}
      accessibilityHint={option.description}
      accessibilityState={{ selected: option.isSelected }}
    >
      <Box className="w-10 h-10 items-center justify-center">{option.icon}</Box>
      <VStack className="flex-1 gap-1">
        <Text className="text-base font-semibold text-phase-primary">{option.label}</Text>
        <Text className="text-sm text-phase-secondary leading-relaxed">{option.description}</Text>
      </VStack>
      {option.isSelected && (
        <Box className="text-phase-primary">
          <Check size={24} />
        </Box>
      )}
    </Pressable>
  );
});

SelectionOption.displayName = 'SelectionOption';

const SelectionModal = memo(function SelectionModal({
  title,
  options,
  onSelect,
  onClose,
}: SelectionModalProps) {
  return (
    <Box className="absolute inset-0 bg-black/50 justify-end z-50">
      <Pressable className="flex-1" onPress={onClose} accessible={false} />
      <Box className="bg-phase-world rounded-t-[32px] p-6 pb-12 shadow-2xl">
        <Text className="text-xl font-bold text-phase-primary mb-4">{title}</Text>
        <VStack className="gap-2">
          {options.map((option) => (
            <SelectionOption key={option.id} option={option} onSelect={onSelect} />
          ))}
        </VStack>
        <Button onPress={onClose} className="mt-4 bg-phase-surface h-14 rounded-2xl">
          <ButtonText className="text-phase-primary font-bold">Close</ButtonText>
        </Button>
      </Box>
    </Box>
  );
});

SelectionModal.displayName = 'SelectionModal';

/**
 * Settings Section Header
 */
function SectionHeader({ title, description }: { title: string; description?: string }) {
  return (
    <VStack className="gap-1 mb-4 mt-6 px-1">
      <Heading size="lg" className="text-phase-primary font-bold">
        {title}
      </Heading>
      {description && (
        <Text className="text-sm text-phase-secondary leading-relaxed">{description}</Text>
      )}
    </VStack>
  );
}

SectionHeader.displayName = 'SectionHeader';

const AppSettingsScreen = memo(function AppSettingsScreen({
  navigation,
}: {
  navigation?: SettingsNavigation;
}) {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { accent, scene, text: themeText } = useTheme();
  const { gutter, maxWidth } = useResponsiveGrid();

  const {
    themeMode,
    setThemeMode,
    temporalPhase,
    fidelityLevel,
    setFidelityLevel,
    language,
    setLanguage,
    isVeilActive,
    toggleVeil,
    reality,
    enableLivingTheme,
    setEnableLivingTheme,
    visualCapabilities,
  } = useEnvironment();
  const { preferences: sensoryPreferences, setPreference } = useSensoryPreferences();
  const { emit: emitFeedback } = useFeedbackOptional();
  const _isDemoMode = useStore((state) => state.isDemoMode);
  const _setDemoMode = useStore((state) => state.setDemoMode);
  const user = useStore((state) => state.user);
  const { showToast } = useSanctuaryToast();

  const [_showThemeModal, setShowThemeModal] = useState(false);
  const [showFidelityModal, setShowFidelityModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showHeaderModal, setShowHeaderModal] = useState(false);

  const navPreferences = useActiveSubTabsStore((s) => s.preferences);
  const updateNavPreferences = useActiveSubTabsStore((s) => s.updatePreferences);

  // Biometrics & Screen Capture States
  const [requireBiometrics, setRequireBiometrics] = useState(() => {
    return Platform.OS !== 'web' ? storage.getBoolean('require_biometrics') : false;
  });
  const [preventScreenCapture, setPreventScreenCapture] = useState(() => {
    return Platform.OS !== 'web' ? storage.getBoolean('prevent_screen_capture') : false;
  });
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'web') {
      void LocalAuthentication.hasHardwareAsync().then((hasHardware: boolean) => {
        void LocalAuthentication.isEnrolledAsync().then((isEnrolled: boolean) => {
          setIsBiometricSupported(hasHardware && isEnrolled);
        });
      });
    }
  }, []);

  const handleBiometricsToggle = useCallback(
    async (val: boolean) => {
      if (Platform.OS === 'web') return;
      hapticLight();
      if (val) {
        try {
          const auth = await LocalAuthentication.authenticateAsync({
            promptMessage: t(
              'settings.security.confirm_biometrics',
              'Confirm biometrics to enable lock',
            ),
          });
          if (auth.success) {
            storage.set('require_biometrics', true);
            setRequireBiometrics(true);
            showToast({
              message: t('settings.security.biometrics_enabled', 'Biometric lock enabled'),
              type: 'success',
            });
          }
        } catch (err) {
          showToast({
            message: t('settings.security.biometrics_failed', 'Biometric confirmation failed'),
            type: 'error',
          });
        }
      } else {
        storage.set('require_biometrics', false);
        setRequireBiometrics(false);
        showToast({
          message: t('settings.security.biometrics_disabled', 'Biometric lock disabled'),
          type: 'success',
        });
      }
    },
    [showToast, t],
  );

  const handleScreenCaptureToggle = useCallback(
    async (val: boolean) => {
      if (Platform.OS === 'web') return;
      hapticLight();
      try {
        if (val) {
          await ScreenCapture.preventScreenCaptureAsync();
          storage.set('prevent_screen_capture', true);
          setPreventScreenCapture(true);
          showToast({
            message: t(
              'settings.security.screencapture_prevented',
              'Screen capture protection active',
            ),
            type: 'success',
          });
        } else {
          await ScreenCapture.allowScreenCaptureAsync();
          storage.set('prevent_screen_capture', false);
          setPreventScreenCapture(false);
          showToast({
            message: t(
              'settings.security.screencapture_allowed',
              'Screen capture protection disabled',
            ),
            type: 'success',
          });
        }
      } catch (err) {
        showToast({
          message: t(
            'settings.security.screencapture_failed',
            'Failed to update screen capture status',
          ),
          type: 'error',
        });
      }
    },
    [showToast, t],
  );

  const [hasPin, setHasPin] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinModalMode, setPinModalMode] = useState<'create' | 'update' | 'remove'>('create');

  useEffect(() => {
    const checkPin = async () => {
      if (user?.id) {
        const pinExists = await accountPin.hasPin(user.id);
        setHasPin(pinExists);
      }
    };
    checkPin();
  }, [user?.id]);

  const handlePinSubmit = useCallback(
    async (values: any) => {
      if (!user?.id) return;
      try {
        if (pinModalMode === 'create') {
          await accountPin.setPin(user.id, values.pin);
          setHasPin(true);
          showToast({
            message: t('settings.security.pin_created', 'PIN set successfully'),
            type: 'success',
          });
        } else if (pinModalMode === 'remove') {
          const correct = await accountPin.verifyPin(user.id, values.pin);
          if (correct) {
            await accountPin.removePin(user.id);
            setHasPin(false);
            showToast({
              message: t('settings.security.pin_removed', 'PIN removed successfully'),
              type: 'success',
            });
          } else {
            showToast({
              message: t('settings.security.pin_incorrect', 'Incorrect PIN'),
              type: 'error',
            });
            return;
          }
        } else if (pinModalMode === 'update') {
          const correct = await accountPin.verifyPin(user.id, values.currentPin);
          if (correct) {
            await accountPin.setPin(user.id, values.nextPin);
            showToast({
              message: t('settings.security.pin_updated', 'PIN changed successfully'),
              type: 'success',
            });
          } else {
            showToast({
              message: t('settings.security.pin_incorrect', 'Incorrect current PIN'),
              type: 'error',
            });
            return;
          }
        }
        setShowPinModal(false);
      } catch (err: any) {
        showToast({
          message: err.message || 'Operation failed',
          type: 'error',
        });
      }
    },
    [pinModalMode, user?.id, showToast, t],
  );

  // AI Assistant States
  const [aiBillingMode, setAiBillingMode] = useState<'baseline' | 'byok' | 'purchased'>('baseline');
  const [aiByokKey, setAiByokKey] = useState<string>('');
  const [showAiKey, setShowAiKey] = useState<boolean>(false);

  useEffect(() => {
    const loadAiSettings = async () => {
      try {
        const savedMode = await cryptoManager.getItemAsync('ai_billing_mode');
        if (savedMode === 'baseline' || savedMode === 'byok' || savedMode === 'purchased') {
          setAiBillingMode(savedMode);
        }
        const savedKey = await cryptoManager.getItemAsync('ai_byok_key');
        if (savedKey) {
          setAiByokKey(savedKey);
        }
      } catch (err) {
        console.warn('Failed to load AI secure store config:', err);
      }
    };
    loadAiSettings();
  }, []);

  const handleAiBillingModeChange = useCallback(
    async (mode: 'baseline' | 'byok' | 'purchased') => {
      setAiBillingMode(mode);
      try {
        await cryptoManager.setItemAsync('ai_billing_mode', mode);
        hapticSuccess();
        showToast({
          message: t('settings.ai.billing_mode_updated', 'AI billing mode updated'),
          type: 'success',
        });
      } catch (err) {
        showToast({
          message: t('settings.ai.billing_mode_failed', 'Failed to update billing mode'),
          type: 'error',
        });
      }
    },
    [showToast, t],
  );

  const handleAiByokKeyChange = useCallback(
    async (key: string) => {
      setAiByokKey(key);
      try {
        await cryptoManager.setItemAsync('ai_byok_key', key);
        hapticSuccess();
        showToast({
          message: t('settings.ai.key_updated', 'API Key saved securely'),
          type: 'success',
        });
      } catch (err) {
        showToast({
          message: t('settings.ai.key_failed', 'Failed to save API Key'),
          type: 'error',
        });
      }
    },
    [showToast, t],
  );

  // Theme mode labels
  const _themeLabel = useMemo(() => {
    if (themeMode === 'system') return t('settings.theme.system');
    if (themeMode === 'auto') return t('settings.theme.auto');
    if (themeMode === 'light') return t('settings.theme.light');
    return t('settings.theme.dark');
  }, [themeMode, t]);

  // Fidelity labels
  const fidelityLabel = useMemo(() => {
    if (fidelityLevel === 'auto') return t('settings.fidelity.auto');
    if (fidelityLevel === 'low') return t('settings.fidelity.low');
    return t('settings.fidelity.high');
  }, [fidelityLevel, t]);

  // Language labels
  const languageLabel = useMemo(() => {
    if (language === 'en') return 'English';
    if (language === 'si') return 'සිංහල';
    return 'தமிழ்';
  }, [language]);

  // Temporal phase description
  const _temporalDescription = useMemo(() => {
    const time = new Date().toLocaleTimeString(i18n.language, {
      hour: 'numeric',
      minute: '2-digit',
    });
    const phases = {
      predawn: t('settings.temporal.predawn'),
      dawn: t('settings.temporal.dawn'),
      morning: t('settings.temporal.morning'),
      afternoon: t('settings.temporal.afternoon'),
      dusk: t('settings.temporal.dusk'),
      night: t('settings.temporal.night'),
    };
    return `${phases[temporalPhase as keyof typeof phases]} • ${time}`;
  }, [temporalPhase, i18n.language, t]);

  const _handleThemeChange = useCallback(
    (mode: 'light' | 'dark' | 'auto') => {
      setThemeMode(mode);
      hapticSuccess();
      setShowThemeModal(false);
    },
    [setThemeMode],
  );

  const handleFidelityChange = useCallback(
    async (level: 'auto' | 'low' | 'high') => {
      await setFidelityLevel(level);
      emitFeedback('success');
      setShowFidelityModal(false);
    },
    [emitFeedback, setFidelityLevel],
  );

  const handleLanguageChange = useCallback(
    async (lang: 'en' | 'si' | 'ta') => {
      await setLanguage(lang);
      await i18n.changeLanguage(lang);
      hapticSuccess();
      setShowLanguageModal(false);
    },
    [setLanguage, i18n],
  );

  const handleOpenFidelity = useCallback(() => setShowFidelityModal(true), []);
  const handleCloseFidelity = useCallback(() => setShowFidelityModal(false), []);

  const handleOpenLanguage = useCallback(() => setShowLanguageModal(true), []);
  const handleCloseLanguage = useCallback(() => setShowLanguageModal(false), []);

  const handleLivingThemeToggle = useCallback(
    async (val: boolean) => {
      await setEnableLivingTheme(val);
      hapticLight();
    },
    [setEnableLivingTheme],
  );

  const handleSensoryToggle = useCallback(
    async (key: 'hapticsEnabled' | 'soundEnabled' | 'quietMode', value: boolean) => {
      await setPreference(key, value);
      emitFeedback('selection');
    },
    [emitFeedback, setPreference],
  );

  const handleProfileVisibilityToggle = useCallback(
    async (_val: boolean) => {
      hapticLight();
      showToast({
        message: t('settings.profile_visibility_updated', 'Profile visibility updated'),
        type: 'success',
      });
    },
    [showToast, t],
  );

  const handlePreviewProfile = useCallback(() => {
    hapticLight();
    if (navigation && typeof navigation.navigate === 'function') {
      try {
        navigation.navigate('Community', {
          screen: 'UserProfile',
          params: { userId: user?.id, userName: user?.display_name },
        });
        return;
      } catch (err) {
        console.warn('[handlePreviewProfile] navigation error:', err);
      }
    }
    router.push('/community');
  }, [navigation, router, user]);

  const handleTrubeLab = useCallback(() => {
    if (navigation && typeof navigation.navigate === 'function') {
      try {
        navigation.navigate('TrubeLab');
        return;
      } catch (err) {
        console.warn('[handleTrubeLab] navigation error:', err);
      }
    }
    router.push('/trube-lab');
  }, [navigation, router]);

  const handleIconLab = useCallback(() => {
    if (navigation && typeof navigation.navigate === 'function') {
      try {
        navigation.navigate('icon-lab');
        return;
      } catch (err) {
        console.warn('[handleIconLab] navigation error:', err);
      }
    }
    router.push('/icon-lab');
  }, [navigation, router]);

  const headerStyleOptions = useMemo(
    () => [
      {
        id: 'adaptive',
        label: 'Adaptive Smart (Recommended)',
        description: 'Full Global Header on overview hub, focused task bar with back button in sub-tasks.',
        icon: <Sparkles size={20} color={accent.action} />,
        isSelected: navPreferences.headerStyle === 'adaptive',
      },
      {
        id: 'compact_domain',
        label: 'Compact Domain Bar',
        description: 'High-density domain header with active perspective switcher on all screens.',
        icon: <Layers size={20} color={accent.action} />,
        isSelected: navPreferences.headerStyle === 'compact_domain',
      },
      {
        id: 'classic_global',
        label: 'Full Global Header Always',
        description: 'Spacious sanctuary header with prominent title and avatar greeting everywhere.',
        icon: <Layers size={20} color={accent.action} />,
        isSelected: navPreferences.headerStyle === 'classic_global',
      },
      {
        id: 'minimal_tabs_only',
        label: 'Active Sub-Tabs Only',
        description: 'Maximum content area, displaying only running multitasking tabs.',
        icon: <Smartphone size={20} color={accent.action} />,
        isSelected: navPreferences.headerStyle === 'minimal_tabs_only',
      },
    ],
    [accent.action, navPreferences.headerStyle],
  );

  const handleContactSupport = useCallback(async () => {
    hapticLight();
    const bodyText = `Hi Support Team,\n\n[Write your message here]\n\n---\nDevice info:\nOS: ${Platform.OS}\nFidelity: ${fidelityLevel}\nLanguage: ${language}\n`;
    try {
      const url = `mailto:${GURUDEVI_SUPPORT_EMAIL}?subject=${encodeURIComponent(
        'Gurudevi App Feedback / Support Request',
      )}&body=${encodeURIComponent(bodyText)}`;

      if (await Linking.canOpenURL(url)) {
        await Linking.openURL(url);
      } else {
        showToast({
          message: t('settings.support.email_not_available', 'Email client not available'),
          type: 'error',
        });
      }
    } catch (err) {
      console.warn('[AppSettingsScreen] Contact support error:', err);
      showToast({
        message: t('settings.support.composer_failed', 'Failed to open email composer'),
        type: 'error',
      });
    }
  }, [fidelityLevel, language, showToast, t]);

  const fidelityDescription = useMemo(
    () =>
      fidelityLevel === 'auto'
        ? t('settings.fidelity.auto_desc')
        : fidelityLevel === 'low'
          ? t('settings.fidelity.low_desc')
          : t('settings.fidelity.high_desc'),
    [fidelityLevel, t],
  );

  const profileVisibilityTitle = useMemo(
    () => t('profile.privacy.publicProfile', 'Public Social Profile'),
    [t],
  );
  const profileVisibilityDesc = useMemo(
    () =>
      user?.public_profile !== false
        ? t('profile.privacy.public_on', 'Others can find and view your profile')
        : t('profile.privacy.public_off', 'Your profile is hidden from the community'),
    [user?.public_profile, t],
  );

  const fidelityOptions = useMemo(
    () => [
      {
        id: 'auto',
        label: t('settings.fidelity.auto'),
        description: t('settings.fidelity.auto_full'),
        icon: (
          <Box className="text-phase-primary">
            <Sparkles size={24} />
          </Box>
        ),
        isSelected: fidelityLevel === 'auto',
      },
      {
        id: 'low',
        label: t('settings.fidelity.low'),
        description: t('settings.fidelity.low_full'),
        icon: (
          <Box className="text-phase-secondary">
            <Smartphone size={24} />
          </Box>
        ),
        isSelected: fidelityLevel === 'low',
      },
      {
        id: 'high',
        label: t('settings.fidelity.high'),
        description: t('settings.fidelity.high_full'),
        icon: (
          <Box className="text-phase-secondary">
            <Sparkles size={24} />
          </Box>
        ),
        isSelected: fidelityLevel === 'high',
      },
    ],
    [fidelityLevel, t],
  );

  const languageOptions = useMemo(
    () => [
      {
        id: 'en',
        label: 'English',
        description: 'Change the app language to English',
        icon: (
          <Box className="text-blue-500">
            <Globe size={24} />
          </Box>
        ),
        isSelected: language === 'en',
      },
      {
        id: 'si',
        label: 'සිංහල',
        description: 'යෙදුමේ භාෂාව සිංහලට වෙනස් කරන්න',
        icon: (
          <Box className="text-amber-500">
            <Globe size={24} />
          </Box>
        ),
        isSelected: language === 'si',
      },
      {
        id: 'ta',
        label: 'தமிழ்',
        description: 'පයன்பාට්‍ටින් මොළියෛ තමිළුක්කු මාට්‍රවුම්',
        icon: (
          <Box className="text-orange-500">
            <Globe size={24} />
          </Box>
        ),
        isSelected: language === 'ta',
      },
    ],
    [language],
  );

  const trackColor = useMemo(() => ({ false: '#4B5563', true: accent.action }), [accent.action]);

  return (
    <Box className="flex-1 bg-phase-world">
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: gutter,
          paddingVertical: gutter,
          width: '100%',
          maxWidth: typeof maxWidth === 'number' ? maxWidth + gutter * 2 : undefined,
          alignSelf: 'center',
        }}
      >
        {/* Appearance Section */}
        <SectionHeader
          title={t('settings.appearance.title')}
          description={t('settings.appearance.description')}
        />

        <SettingsOption
          icon={
            <Box className="text-phase-secondary">
              <Sparkles size={24} />
            </Box>
          }
          title={t('settings.fidelity.title')}
          description={fidelityDescription}
          value={fidelityLabel}
          onPress={handleOpenFidelity}
          accessibilityLabel={t('settings.fidelity.title')}
          accessibilityHint={t('settings.fidelity.hint')}
        />

        {/* Living Theme Toggle */}
        <Box
          className={`bg-phase-surface border border-phase-border p-4 mb-2 rounded-[20px] ${enableLivingTheme ? 'border-phase-primary' : ''}`}
        >
          <HStack className="gap-4 items-center justify-between">
            <HStack className="gap-4 items-center flex-1">
              <Box
                className={`w-10 h-10 rounded-[12px] items-center justify-center ${enableLivingTheme ? 'bg-phase-primary' : 'bg-phase-surface'}`}
              >
                <Box className={enableLivingTheme ? 'text-phase-world' : 'text-phase-muted'}>
                  <Sparkles size={24} fill={enableLivingTheme ? 'currentColor' : 'transparent'} />
                </Box>
              </Box>
              <VStack className="flex-1 gap-1">
                <Text className="text-base font-semibold text-phase-primary">
                  {t('settings.living_theme.title')}
                </Text>
                <Text className="text-sm text-phase-secondary">
                  {enableLivingTheme
                    ? t('settings.living_theme.on')
                    : t('settings.living_theme.off')}
                </Text>
              </VStack>
            </HStack>
            <Switch
              value={enableLivingTheme}
              onValueChange={handleLivingThemeToggle}
              trackColor={trackColor}
              thumbColor="#FFFFFF"
              accessible={true}
              accessibilityRole="switch"
              accessibilityLabel={t('settings.living_theme.title')}
              accessibilityState={{ checked: enableLivingTheme }}
            />
          </HStack>
        </Box>

        <SectionHeader
          title={t('settings.sensory.title', 'Sensory feedback')}
          description={t(
            'settings.sensory.description',
            `The app adapts motion and feedback to this device. Current profile: ${visualCapabilities.experience.motion}.`,
          )}
        />

        {[
          {
            key: 'hapticsEnabled' as const,
            title: t('settings.sensory.haptics', 'Haptic feedback'),
            description: t(
              'settings.sensory.haptics_desc',
              'Gentle tactile confirmation for meaningful actions.',
            ),
          },
          {
            key: 'soundEnabled' as const,
            title: t('settings.sensory.sound', 'Sound feedback'),
            description: t(
              'settings.sensory.sound_desc',
              'Optional short sounds for meaningful moments.',
            ),
          },
          {
            key: 'quietMode' as const,
            title: t('settings.sensory.quiet', 'Quiet mode'),
            description: t(
              'settings.sensory.quiet_desc',
              'Silences sound and reduces sensory intensity.',
            ),
          },
        ].map((option) => (
          <Box
            key={option.key}
            className={`bg-phase-surface border border-phase-border p-4 mb-2 rounded-[20px] ${sensoryPreferences[option.key] ? 'border-phase-primary' : ''}`}
          >
            <HStack className="gap-4 items-center justify-between">
              <VStack className="flex-1 gap-1">
                <Text className="text-base font-semibold text-phase-primary">{option.title}</Text>
                <Text className="text-sm text-phase-secondary">{option.description}</Text>
              </VStack>
              <Switch
                value={sensoryPreferences[option.key]}
                onValueChange={(value) => void handleSensoryToggle(option.key, value)}
                trackColor={trackColor}
                thumbColor="#FFFFFF"
                accessible={true}
                accessibilityRole="switch"
                accessibilityLabel={option.title}
                accessibilityState={{ checked: sensoryPreferences[option.key] }}
              />
            </HStack>
          </Box>
        ))}

        {/* Navigation & Multitasking */}
        <SectionHeader
          title="Navigation & Active Sub-Tabs"
          description="Customize the top header chrome, multitasking sub-tabs, and catalog behavior."
        />

        <SettingsOption
          icon={
            <Box className="text-phase-secondary">
              <Layers size={24} />
            </Box>
          }
          title="Header Layout Style"
          description={
            navPreferences.headerStyle === 'adaptive'
              ? 'Adaptive Smart (Recommended)'
              : navPreferences.headerStyle === 'compact_domain'
              ? 'Compact Domain Bar'
              : navPreferences.headerStyle === 'classic_global'
              ? 'Full Global Header Always'
              : 'Active Sub-Tabs Only'
          }
          onPress={() => setShowHeaderModal(true)}
          accessibilityLabel="Header layout style"
          accessibilityHint="Choose between compact domain bar, full global header, or sub-tabs only"
        />

        <Box className="bg-phase-surface border border-phase-border p-4 mb-2 rounded-[20px]">
          <HStack className="gap-4 items-center justify-between">
            <VStack className="flex-1 gap-1">
              <Text className="text-base font-semibold text-phase-primary">Active Sub-Tabs Strip</Text>
              <Text className="text-sm text-phase-secondary">
                Display running tasks and activities beneath the header for fluid switching.
              </Text>
            </VStack>
            <Switch
              value={navPreferences.showActiveSubTabs}
              onValueChange={(val) => {
                hapticLight();
                updateNavPreferences({ showActiveSubTabs: val });
              }}
              trackColor={trackColor}
              thumbColor="#FFFFFF"
              accessible={true}
              accessibilityRole="switch"
              accessibilityLabel="Show active sub-tabs strip"
              accessibilityState={{ checked: navPreferences.showActiveSubTabs }}
            />
          </HStack>
        </Box>

        <Box className="bg-phase-surface border border-phase-border p-4 mb-2 rounded-[20px]">
          <HStack className="gap-4 items-center justify-between">
            <VStack className="flex-1 gap-1">
              <Text className="text-base font-semibold text-phase-primary">Catalog Opens in Sub-Tab</Text>
              <Text className="text-sm text-phase-secondary">
                Selecting a feature from the bottom tab catalog automatically adds it as an active sub-tab.
              </Text>
            </VStack>
            <Switch
              value={navPreferences.catalogDefaultAction === 'open_in_subtab'}
              onValueChange={(val) => {
                hapticLight();
                updateNavPreferences({
                  catalogDefaultAction: val ? 'open_in_subtab' : 'navigate_direct',
                });
              }}
              trackColor={trackColor}
              thumbColor="#FFFFFF"
              accessible={true}
              accessibilityRole="switch"
              accessibilityLabel="Open catalog items in sub-tabs"
              accessibilityState={{ checked: navPreferences.catalogDefaultAction === 'open_in_subtab' }}
            />
          </HStack>
        </Box>

        <Box className="bg-phase-surface border border-phase-border p-4 mb-2 rounded-[20px]">
          <HStack className="gap-4 items-center justify-between">
            <VStack className="flex-1 gap-1">
              <Text className="text-base font-semibold text-phase-primary">Auto-Collapse on Scroll</Text>
              <Text className="text-sm text-phase-secondary">
                Collapse header and bottom tabs while scrolling down; flick up or reach the top to reveal.
              </Text>
            </VStack>
            <Switch
              value={navPreferences.autoHideChromeOnScroll}
              onValueChange={(val) => {
                hapticLight();
                updateNavPreferences({
                  autoHideChromeOnScroll: val,
                });
              }}
              trackColor={trackColor}
              thumbColor="#FFFFFF"
              accessible={true}
              accessibilityRole="switch"
              accessibilityLabel="Auto-collapse navigation chrome on scroll"
              accessibilityState={{ checked: navPreferences.autoHideChromeOnScroll }}
            />
          </HStack>
        </Box>

        {/* Language & Localization */}
        <SectionHeader
          title={t('settings.language.title')}
          description={t('settings.language.description')}
        />
        <SettingsOption
          icon={
            <Box className="text-phase-secondary">
              <Globe size={24} />
            </Box>
          }
          title={t('settings.language.current')}
          description={t('settings.language.change_desc')}
          value={languageLabel}
          onPress={handleOpenLanguage}
          accessibilityLabel={t('settings.language.current')}
          accessibilityHint={t('settings.language.hint')}
        />

        {/* Profile Visibility & Preview */}
        <SectionHeader
          title={t('profile.privacy.title', 'Profile & Visibility')}
          description={t('profile.privacy.description', 'Manage how others see your profile')}
        />
        <Box className="bg-phase-surface border border-phase-border p-4 mb-2 rounded-[20px]">
          <HStack className="gap-4 items-center justify-between">
            <HStack className="gap-4 items-center flex-1">
              <Box className="w-10 h-10 rounded-[12px] bg-phase-surface items-center justify-center border border-phase-border">
                <Box className="text-phase-secondary">
                  <Shield size={24} />
                </Box>
              </Box>
              <VStack className="flex-1 gap-1">
                <Text className="text-base font-semibold text-phase-primary">
                  {profileVisibilityTitle}
                </Text>
                <Text className="text-sm text-phase-secondary">{profileVisibilityDesc}</Text>
              </VStack>
            </HStack>
            <Switch
              value={user?.public_profile !== false}
              onValueChange={handleProfileVisibilityToggle}
              trackColor={trackColor}
              thumbColor="#FFFFFF"
            />
          </HStack>
        </Box>
        <SettingsOption
          icon={
            <Box className="text-phase-secondary">
              <Eye size={24} />
            </Box>
          }
          title={t('profile.privacy.previewProfile', 'See how others see you')}
          description={t('profile.privacy.preview_desc', 'View your own public profile card')}
          onPress={handlePreviewProfile}
        />

        {/* AI Assistant Configuration */}
        <SectionHeader
          title={t('settings.ai.title', 'AI Assistant')}
          description={t(
            'settings.ai.description',
            'Configure billing resolution modes and custom developer API keys.',
          )}
        />
        <Box className="bg-phase-surface border border-phase-border p-5 mb-4 rounded-[20px] gap-4">
          <Text className="text-sm font-semibold text-phase-primary">
            {t('settings.ai.select_mode', 'Billing Resolution Mode')}
          </Text>
          <HStack className="gap-2">
            {(['baseline', 'byok', 'purchased'] as const).map((mode) => (
              <Pressable
                accessibilityRole="button"
                key={mode}
                onPress={() => {
                  void handleAiBillingModeChange(mode);
                }}
                className={`flex-1 p-3 rounded-xl border items-center justify-center ${
                  aiBillingMode === mode
                    ? 'bg-phase-surface border-phase-primary'
                    : 'bg-phase-surface border-phase-border'
                }`}
              >
                <Text
                  className={`text-xs font-bold ${
                    aiBillingMode === mode ? 'text-phase-primary font-bold' : 'text-phase-secondary'
                  }`}
                >
                  {mode === 'baseline'
                    ? t('settings.ai.mode.baseline', 'Baseline')
                    : mode === 'byok'
                      ? t('settings.ai.mode.byok', 'BYOK')
                      : t('settings.ai.mode.purchased', 'Premium')}
                </Text>
              </Pressable>
            ))}
          </HStack>

          {aiBillingMode === 'byok' && (
            <VStack className="gap-2 mt-2">
              <Text className="text-sm font-semibold text-phase-primary">
                {t('settings.ai.api_key', 'Custom API Key (OpenAI, Anthropic, Gemini)')}
              </Text>
              <HStack className="items-center bg-phase-world border border-phase-border rounded-xl px-3 h-12">
                <TextInput
                  accessibilityLabel="Text input field"
                  secureTextEntry={!showAiKey}
                  placeholder={t('settings.ai.key_placeholder', 'Enter sk-... or AIzaSy...')}
                  placeholderTextColor="#9CA3AF"
                  value={aiByokKey}
                  onChangeText={(text) => {
                    void handleAiByokKeyChange(text);
                  }}
                  className="flex-1 text-phase-primary text-sm h-full"
                />
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setShowAiKey(!showAiKey)}
                >
                  <Box className="text-phase-secondary">
                    {showAiKey ? <EyeOff size={20} /> : <Eye size={20} />}
                  </Box>
                </Pressable>
              </HStack>
              <Text className="text-xs text-phase-secondary leading-relaxed">
                {t(
                  'settings.ai.byok_hint',
                  'Keys are secured locally on your device hardware enclave and decrypted inline.',
                )}
              </Text>
            </VStack>
          )}
        </Box>

        <SectionHeader
          title={t('settings.notificationPreferences', 'Notifications')}
          description={t('settings.notification_desc', 'Manage channel delivery and topic alerts')}
        />
        <NotificationSettingsPanel />

        <SectionHeader
          title={t('profile.account.actions', 'Device security')}
          description={t(
            'profile.account.shared_device_desc',
            'Review the current device, trusted installs, recent security activity, and accounts stored locally on this device.',
          )}
        />
        <DeviceSecurityCenter compact={true} />

        {Platform.OS !== 'web' && (
          <VStack className="gap-2 mb-4 mt-2">
            {isBiometricSupported && (
              <Box className="bg-phase-surface border border-phase-border p-4 rounded-[20px]">
                <HStack className="gap-4 items-center justify-between">
                  <HStack className="gap-4 items-center flex-1">
                    <Box className="w-10 h-10 rounded-[12px] bg-phase-surface items-center justify-center border border-phase-border">
                      <Box className="text-phase-secondary">
                        <Shield size={24} />
                      </Box>
                    </Box>
                    <VStack className="flex-1 gap-1">
                      <Text className="text-base font-semibold text-phase-primary">
                        Biometric Lock
                      </Text>
                      <Text className="text-sm text-phase-secondary">
                        Require biometric verification on app launch
                      </Text>
                    </VStack>
                  </HStack>
                  <Switch
                    value={requireBiometrics}
                    onValueChange={handleBiometricsToggle}
                    trackColor={trackColor}
                    thumbColor="#FFFFFF"
                  />
                </HStack>
              </Box>
            )}

            <Box className="bg-phase-surface border border-phase-border p-4 rounded-[20px]">
              <HStack className="gap-4 items-center justify-between">
                <HStack className="gap-4 items-center flex-1">
                  <Box className="w-10 h-10 rounded-[12px] bg-phase-surface items-center justify-center border border-phase-border">
                    <Box className="text-phase-secondary">
                      <EyeOff size={24} />
                    </Box>
                  </Box>
                  <VStack className="flex-1 gap-1">
                    <Text className="text-base font-semibold text-phase-primary">
                      Screen Privacy
                    </Text>
                    <Text className="text-sm text-phase-secondary">
                      Prevent screenshots and screen recording
                    </Text>
                  </VStack>
                </HStack>
                <Switch
                  value={preventScreenCapture}
                  onValueChange={handleScreenCaptureToggle}
                  trackColor={trackColor}
                  thumbColor="#FFFFFF"
                />
              </HStack>
            </Box>
            <Box className="bg-phase-surface border border-phase-border p-4 rounded-[20px]">
              <HStack className="gap-4 items-center justify-between">
                <HStack className="gap-4 items-center flex-1">
                  <Box className="w-10 h-10 rounded-[12px] bg-phase-surface items-center justify-center border border-phase-border">
                    <Box className="text-phase-secondary">
                      <Lock size={24} />
                    </Box>
                  </Box>
                  <VStack className="flex-1 gap-1">
                    <Text className="text-base font-semibold text-phase-primary">App PIN Lock</Text>
                    <Text className="text-sm text-phase-secondary">
                      {hasPin ? 'PIN is active' : 'Secure your app with a PIN'}
                    </Text>
                  </VStack>
                </HStack>
                <HStack className="gap-2">
                  {hasPin ? (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onPress={() => {
                          setPinModalMode('update');
                          setShowPinModal(true);
                        }}
                        className="h-10 rounded-xl"
                      >
                        <ButtonText className="text-xs">Change</ButtonText>
                      </Button>
                      <Button
                        size="sm"
                        action="negative"
                        onPress={() => {
                          setPinModalMode('remove');
                          setShowPinModal(true);
                        }}
                        className="h-10 rounded-xl"
                      >
                        <ButtonText className="text-xs text-white">Remove</ButtonText>
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      onPress={() => {
                        setPinModalMode('create');
                        setShowPinModal(true);
                      }}
                      className="h-10 rounded-xl"
                    >
                      <ButtonText className="text-xs">Set PIN</ButtonText>
                    </Button>
                  )}
                </HStack>
              </HStack>
            </Box>
          </VStack>
        )}

        {/* Device Info Section */}
        <SectionHeader
          title={t('settings.device.title')}
          description={t('settings.device.description')}
        />
        <Box className="bg-phase-surface border border-phase-border p-5 mb-4 rounded-[20px]">
          <VStack className="gap-4">
            <HStack className="justify-between items-center">
              <Text className="text-phase-secondary">{t('settings.device.tier')}</Text>
              <Text className="text-phase-primary font-semibold">
                {reality.deviceTier.charAt(0).toUpperCase() + reality.deviceTier.slice(1)}
              </Text>
            </HStack>
            <HStack className="justify-between items-center">
              <Text className="text-phase-secondary">{t('settings.device.memory')}</Text>
              <Text className="text-phase-primary font-semibold">
                {reality.totalMemoryGB.toFixed(1)} GB
              </Text>
            </HStack>
            <HStack className="justify-between items-center">
              <Text className="text-phase-secondary">{t('settings.device.network')}</Text>
              <Text className="text-phase-primary font-semibold">
                {reality.networkQuality.charAt(0).toUpperCase() + reality.networkQuality.slice(1)}
              </Text>
            </HStack>
            {reality.isDataSaverMode && (
              <Box className="bg-phase-world p-3 rounded-xl border border-phase-border flex-row items-center gap-2">
                <Box className="text-phase-primary">
                  <Info size={16} />
                </Box>
                <Text className="text-sm text-phase-primary">
                  {t('settings.device.data_saver')}
                </Text>
              </Box>
            )}
          </VStack>
        </Box>

        {/* Support Section */}
        <SectionHeader
          title={t('settings.support.title', 'Support')}
          description={t('settings.support.description', 'Help us improve Gurudevi')}
        />
        <SettingsOption
          icon={
            <Box className="text-phase-secondary">
              <Zap size={24} />
            </Box>
          }
          title="Trube Lab"
          description="Tune living surfaces as solo, duet, or orchestra compositions."
          onPress={handleTrubeLab}
          accessibilityLabel="Open Trube Lab"
          accessibilityHint="Experiment with living surface compositions and lighting."
        />
        {__DEV__ && (
          <SettingsOption
            icon={
              <Box className="text-phase-secondary">
                <Sparkles size={24} />
              </Box>
            }
            title="Iconography Lab"
            description="Compare Lucide, Phosphor, and native Lucide rendering."
            onPress={handleIconLab}
            accessibilityLabel="Open Iconography Lab"
            accessibilityHint="Compare icon systems across mobile and web."
          />
        )}
        <SettingsOption
          icon={
            <Box className="text-phase-secondary">
              <Sparkles size={24} />
            </Box>
          }
          title={t('settings.support.contact', 'Contact Support')}
          description={t(
            'settings.support.contact_desc',
            'Send us feedback or report an issue via email.',
          )}
          onPress={() => {
            void handleContactSupport();
          }}
          accessibilityLabel={t('settings.support.contact', 'Contact Support')}
          accessibilityHint={t('settings.support.contact_hint', 'Open the support email composer')}
        />

        {/* Gentle guidance footer */}
        <Box className="p-5 bg-phase-surface/50 border border-phase-border rounded-[24px] mt-6 mb-12">
          <HStack className="gap-4 items-start">
            <Box className="text-phase-primary">
              <Info size={20} />
            </Box>
            <VStack className="flex-1 gap-1">
              <Text className="text-sm font-bold text-phase-primary">
                {t('settings.tip.title')}
              </Text>
              <Text className="text-sm text-phase-secondary leading-relaxed">
                {t('settings.tip.message')}
              </Text>
            </VStack>
          </HStack>
        </Box>
      </ScrollView>

      {/* Fidelity Selection Modal */}
      {showFidelityModal && (
        <SelectionModal
          title={t('settings.fidelity.select')}
          options={fidelityOptions}
          onSelect={(level) => {
            void handleFidelityChange(level as any);
          }}
          onClose={handleCloseFidelity}
        />
      )}

      {/* Header Style Selection Modal */}
      {showHeaderModal && (
        <SelectionModal
          title="Select Header Layout Style"
          options={headerStyleOptions}
          onSelect={(styleId) => {
            hapticSuccess();
            updateNavPreferences({ headerStyle: styleId });
            setShowHeaderModal(false);
          }}
          onClose={() => setShowHeaderModal(false)}
        />
      )}

      {/* Language Selection Modal */}
      {showLanguageModal && (
        <SelectionModal
          title={t('settings.language.select')}
          options={languageOptions}
          onSelect={(lang) => {
            void handleLanguageChange(lang as any);
          }}
          onClose={handleCloseLanguage}
        />
      )}

      {showPinModal && (
        <AccountPinModal
          isOpen={showPinModal}
          mode={pinModalMode}
          onClose={() => setShowPinModal(false)}
          onSubmit={handlePinSubmit}
          accountLabel={user?.display_name}
        />
      )}
    </Box>
  );
});

AppSettingsScreen.displayName = 'AppSettingsScreen';

export default AppSettingsScreen;
