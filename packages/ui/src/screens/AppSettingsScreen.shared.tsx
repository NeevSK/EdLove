import { accountPin, cryptoManager, storage, useStore } from '@repo/core/logic';
import { authAPI } from '@repo/core/api/auth';
import { useActiveSubTabsStore } from '@repo/core/store/useActiveSubTabsStore';
import AccountPinModal from '@repo/ui/components/AccountPinModal';
import DeviceSecurityCenter from '@repo/ui/components/DeviceSecurityCenter';
import { useResponsiveGrid } from '@repo/ui/components/layout';
import { NotificationSettingsPanel } from '@repo/ui/components/NotificationSettingsPanel';
import { useEnvironment, useFeedbackOptional, useSensoryPreferences } from '@repo/ui/context';
import {
  Button,
  Chip,
  Chips,
  Row,
  Section,
  Switch,
  TextField,
  useWorld,
  Text as WText,
  WorldPicker,
} from '@repo/ui/world/native';
import { useSanctuaryToast } from '@repo/ui/providers/ToastProvider';
import { GURUDEVI_SUPPORT_EMAIL } from '@repo/ui/utils';
import { hapticLight, hapticSuccess } from '@repo/ui/utils/haptics';
import * as LocalAuthentication from 'expo-local-authentication';
import { useRouter } from 'expo-router';
import * as ScreenCapture from 'expo-screen-capture';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking, Platform, ScrollView, View } from 'react-native';

interface SettingsNavigation {
  navigate: (route: string, params?: Record<string, unknown>) => void;
}

const AppSettingsScreen = memo(function AppSettingsScreen({
  navigation,
}: {
  navigation?: SettingsNavigation;
}) {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const world = useWorld();
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
    worldId,
    setWorld,
  } = useEnvironment();
  const { preferences: sensoryPreferences, setPreference } = useSensoryPreferences();
  const { emit: emitFeedback } = useFeedbackOptional();
  const _isDemoMode = useStore((state) => state.isDemoMode);
  const _setDemoMode = useStore((state) => state.setDemoMode);
  const user = useStore((state) => state.user);
  const { showToast } = useSanctuaryToast();

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
    },
    [setThemeMode],
  );

  const handleFidelityChange = useCallback(
    async (level: 'auto' | 'low' | 'high') => {
      await setFidelityLevel(level);
      emitFeedback('success');
    },
    [emitFeedback, setFidelityLevel],
  );

  const handleLanguageChange = useCallback(
    async (lang: 'en' | 'si' | 'ta') => {
      await setLanguage(lang);
      await i18n.changeLanguage(lang);
      hapticSuccess();
    },
    [setLanguage, i18n],
  );

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

  const handleDevClearAllCache = useCallback(async () => {
    try {
      storage.clearAll();
      try {
        await authAPI.signOut();
      } catch (e) {
        console.warn('Sign out during dev cache wipe:', e);
      }
      showToast({
        message: 'Developer: Cleared all local storage, sessions, MMKV, and app cache.',
        type: 'success',
      });
      router.replace('/welcome');
    } catch (err: unknown) {
      console.warn('[handleDevClearAllCache] error:', err);
      showToast({
        message: 'Failed to clear local cache.',
        type: 'error',
      });
    }
  }, [router, showToast]);

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

  const headerChoices = useMemo(
    () =>
      [
        {
          id: 'adaptive',
          label: t('settings.nav.header.adaptive', 'Adaptive'),
          note: t(
            'settings.nav.header.adaptive_note',
            'The full header on overview pages, a focused bar with a back button inside tasks.',
          ),
        },
        {
          id: 'compact_domain',
          label: t('settings.nav.header.compact', 'Compact'),
          note: t(
            'settings.nav.header.compact_note',
            'A slim bar with the perspective switcher on every screen.',
          ),
        },
        {
          id: 'classic_global',
          label: t('settings.nav.header.full', 'Full'),
          note: t(
            'settings.nav.header.full_note',
            'A spacious header with the title and greeting everywhere.',
          ),
        },
        {
          id: 'minimal_tabs_only',
          label: t('settings.nav.header.minimal', 'Tabs only'),
          note: t(
            'settings.nav.header.minimal_note',
            'The most room for content. Only the running tasks are shown.',
          ),
        },
      ] as const,
    [t],
  );
  const headerNote =
    headerChoices.find((c) => c.id === navPreferences.headerStyle)?.note ?? headerChoices[0].note;

  const lightChoices = [
    { id: 'light', label: t('settings.light.day', 'Day') },
    { id: 'dark', label: t('settings.light.night', 'Night') },
    { id: 'system', label: t('settings.light.device', 'Device') },
    { id: 'auto', label: t('settings.light.hour', 'With the hour') },
  ] as const;

  const fidelityChoices = [
    { id: 'auto', label: t('settings.motion.auto', 'Fit this phone') },
    { id: 'low', label: t('settings.motion.low', 'Saver') },
    { id: 'high', label: t('settings.motion.high', 'Full') },
  ] as const;

  const languageChoices = [
    { id: 'en', label: 'English' },
    { id: 'si', label: 'සිංහල' },
    { id: 'ta', label: 'தமிழ்' },
  ] as const;

  const aiChoices = [
    { id: 'baseline', label: t('settings.ai.mode.baseline', 'Baseline') },
    { id: 'byok', label: t('settings.ai.mode.byok', 'Own key') },
    { id: 'purchased', label: t('settings.ai.mode.purchased', 'Premium') },
  ] as const;

  const capitalise = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: world.tokens.ground }}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingTop: 8,
        paddingBottom: 48,
        width: '100%',
        maxWidth: typeof maxWidth === 'number' ? maxWidth + gutter * 2 : undefined,
        alignSelf: 'center',
      }}
    >
      <WText kind="display" style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 18 }}>
        {t('settings.voice', 'Make this place your own')}
      </WText>

      <Section
        title={t('settings.world.title', 'World')}
        voice={t('settings.world.voice', 'The paper, ink and light Gurudevi is made of.')}
      >
        <WorldPicker
          value={worldId}
          onChange={(id) => void setWorld(id)}
          label={t('settings.world.title', 'World')}
        />
        <Row
          label={t('settings.living_theme.title')}
          note={enableLivingTheme ? t('settings.living_theme.on') : t('settings.living_theme.off')}
          accessory={
            <Switch
              value={enableLivingTheme}
              onValueChange={handleLivingThemeToggle}
              label={t('settings.living_theme.title')}
            />
          }
        />
      </Section>

      <Section title={t('settings.light.title', 'Light')}>
        <Row label={t('settings.light.choose', 'Day or night')} />
        <Chips single label={t('settings.light.title', 'Light')} style={{ paddingBottom: 10 }}>
          {lightChoices.map((c) => (
            <Chip
              key={c.id}
              kind="radio"
              label={c.label}
              selected={themeMode === c.id}
              onPress={() => {
                void setThemeMode(c.id);
                hapticSuccess();
              }}
            />
          ))}
        </Chips>
        <Row label={t('settings.motion.title', 'Motion and detail')} note={fidelityDescription} />
        <Chips
          single
          label={t('settings.motion.title', 'Motion and detail')}
          style={{ paddingBottom: 10 }}
        >
          {fidelityChoices.map((c) => (
            <Chip
              key={c.id}
              kind="radio"
              label={c.label}
              selected={fidelityLevel === c.id}
              onPress={() => void handleFidelityChange(c.id)}
            />
          ))}
        </Chips>
      </Section>

      <Section title={t('settings.sensory.title', 'Feel and sound')}>
        {(
          [
            {
              key: 'hapticsEnabled',
              title: t('settings.sensory.haptics', 'Haptic feedback'),
              note: t(
                'settings.sensory.haptics_desc',
                'Gentle tactile confirmation for meaningful actions.',
              ),
            },
            {
              key: 'soundEnabled',
              title: t('settings.sensory.sound', 'Sound feedback'),
              note: t(
                'settings.sensory.sound_desc',
                'Optional short sounds for meaningful moments.',
              ),
            },
            {
              key: 'quietMode',
              title: t('settings.sensory.quiet', 'Quiet mode'),
              note: t(
                'settings.sensory.quiet_desc',
                'Silences sound and reduces sensory intensity.',
              ),
            },
          ] as const
        ).map((option) => (
          <Row
            key={option.key}
            label={option.title}
            note={option.note}
            accessory={
              <Switch
                value={sensoryPreferences[option.key]}
                onValueChange={(value) => void handleSensoryToggle(option.key, value)}
                label={option.title}
              />
            }
          />
        ))}
        <Row
          label={t('settings.sensory.profile', 'Motion on this phone')}
          detail={capitalise(visualCapabilities.experience.motion)}
        />
      </Section>

      <Section title={t('settings.nav.title', 'Navigation')}>
        <Row label={t('settings.nav.header.title', 'Header')} note={headerNote} />
        <Chips
          single
          label={t('settings.nav.header.title', 'Header')}
          style={{ paddingBottom: 10 }}
        >
          {headerChoices.map((c) => (
            <Chip
              key={c.id}
              kind="radio"
              label={c.label}
              selected={navPreferences.headerStyle === c.id}
              onPress={() => {
                hapticSuccess();
                updateNavPreferences({ headerStyle: c.id });
              }}
            />
          ))}
        </Chips>
        <Row
          label={t('settings.nav.subtabs', 'Running tasks strip')}
          note={t(
            'settings.nav.subtabs_note',
            'Shows what you have open beneath the header, so you can move between them.',
          )}
          accessory={
            <Switch
              value={navPreferences.showActiveSubTabs}
              onValueChange={(val) => updateNavPreferences({ showActiveSubTabs: val })}
              label={t('settings.nav.subtabs', 'Running tasks strip')}
            />
          }
        />
        <Row
          label={t('settings.nav.catalog', 'Open from the catalogue as a task')}
          note={t(
            'settings.nav.catalog_note',
            'Choosing something from the tab catalogue adds it to your running tasks.',
          )}
          accessory={
            <Switch
              value={navPreferences.catalogDefaultAction === 'open_in_subtab'}
              onValueChange={(val) =>
                updateNavPreferences({
                  catalogDefaultAction: val ? 'open_in_subtab' : 'navigate_direct',
                })
              }
              label={t('settings.nav.catalog', 'Open from the catalogue as a task')}
            />
          }
        />
        <Row
          label={t('settings.nav.collapse', 'Tuck away while scrolling')}
          note={t(
            'settings.nav.collapse_note',
            'The header and tabs step aside as you read, and return when you scroll up.',
          )}
          accessory={
            <Switch
              value={navPreferences.autoHideChromeOnScroll}
              onValueChange={(val) => updateNavPreferences({ autoHideChromeOnScroll: val })}
              label={t('settings.nav.collapse', 'Tuck away while scrolling')}
            />
          }
        />
      </Section>

      <Section title={t('settings.language.title')}>
        <Row label={t('settings.language.current')} note={t('settings.language.change_desc')} />
        <Chips single label={t('settings.language.title')} style={{ paddingBottom: 10 }}>
          {languageChoices.map((c) => (
            <Chip
              key={c.id}
              kind="radio"
              lang={c.id}
              label={c.label}
              selected={language === c.id}
              onPress={() => void handleLanguageChange(c.id)}
            />
          ))}
        </Chips>
      </Section>

      <Section title={t('profile.privacy.title', 'Profile & Visibility')}>
        <Row
          label={profileVisibilityTitle}
          note={profileVisibilityDesc}
          accessory={
            <Switch
              value={user?.public_profile !== false}
              onValueChange={handleProfileVisibilityToggle}
              label={profileVisibilityTitle}
            />
          }
        />
        <Row
          label={t('profile.privacy.previewProfile', 'See how others see you')}
          note={t('profile.privacy.preview_desc', 'View your own public profile card')}
          onPress={handlePreviewProfile}
        />
      </Section>

      <Section title={t('settings.ai.title', 'AI Assistant')}>
        <Row
          label={t('settings.ai.select_mode', 'How it is paid for')}
          note={t(
            'settings.ai.description',
            'Configure billing resolution modes and custom developer API keys.',
          )}
        />
        <Chips
          single
          label={t('settings.ai.select_mode', 'How it is paid for')}
          style={{ paddingBottom: 10 }}
        >
          {aiChoices.map((c) => (
            <Chip
              key={c.id}
              kind="radio"
              label={c.label}
              selected={aiBillingMode === c.id}
              onPress={() => void handleAiBillingModeChange(c.id)}
            />
          ))}
        </Chips>
        {aiBillingMode === 'byok' ? (
          <View style={{ gap: 6, paddingBottom: 12 }}>
            <TextField
              label={t('settings.ai.api_key', 'Your API key')}
              hint={t(
                'settings.ai.byok_hint',
                'Keys are secured locally on your device hardware enclave and decrypted inline.',
              )}
              secureTextEntry={!showAiKey}
              autoCapitalize="none"
              autoCorrect={false}
              placeholder={t('settings.ai.key_placeholder', 'sk-… or AIza…')}
              value={aiByokKey}
              onChangeText={(text) => void handleAiByokKeyChange(text)}
            />
            <Button
              variant="quiet"
              size="sm"
              label={
                showAiKey
                  ? t('settings.ai.hide_key', 'Hide key')
                  : t('settings.ai.show_key', 'Show key')
              }
              onPress={() => setShowAiKey(!showAiKey)}
            />
          </View>
        ) : null}
      </Section>

      <Section title={t('settings.notificationPreferences', 'Notifications')}>
        <WText kind="caption" style={{ paddingVertical: 6 }}>
          {t('settings.notification_desc', 'Manage channel delivery and topic alerts')}
        </WText>
        <NotificationSettingsPanel />
      </Section>

      <Section title={t('profile.account.actions', 'Device security')}>
        <WText kind="caption" style={{ paddingVertical: 6 }}>
          {t(
            'profile.account.shared_device_desc',
            'Review the current device, trusted installs, recent security activity, and accounts stored locally on this device.',
          )}
        </WText>
        <DeviceSecurityCenter compact={true} />
        {Platform.OS !== 'web' && isBiometricSupported ? (
          <Row
            label={t('settings.security.biometrics', 'Biometric lock')}
            note={t(
              'settings.security.biometrics_note',
              'Ask for your fingerprint or face when the app opens.',
            )}
            accessory={
              <Switch
                value={!!requireBiometrics}
                onValueChange={(val) => void handleBiometricsToggle(val)}
                label={t('settings.security.biometrics', 'Biometric lock')}
              />
            }
          />
        ) : null}
        {Platform.OS !== 'web' ? (
          <Row
            label={t('settings.security.screen', 'Screen privacy')}
            note={t('settings.security.screen_note', 'Prevent screenshots and screen recording.')}
            accessory={
              <Switch
                value={!!preventScreenCapture}
                onValueChange={(val) => void handleScreenCaptureToggle(val)}
                label={t('settings.security.screen', 'Screen privacy')}
              />
            }
          />
        ) : null}
        {Platform.OS !== 'web' ? (
          <View style={{ paddingVertical: 10, gap: 10 }}>
            <Row
              label={t('settings.security.pin', 'App PIN')}
              detail={
                hasPin
                  ? t('settings.security.pin_on', 'On')
                  : t('settings.security.pin_off', 'Not set')
              }
              chevron={false}
            />
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 18, alignItems: 'center' }}>
              {hasPin ? (
                <>
                  <Button
                    variant="secondary"
                    size="sm"
                    label={t('settings.security.pin_change', 'Change PIN')}
                    onPress={() => {
                      setPinModalMode('update');
                      setShowPinModal(true);
                    }}
                  />
                  <Button
                    variant="danger"
                    size="sm"
                    label={t('settings.security.pin_remove', 'Remove PIN')}
                    onPress={() => {
                      setPinModalMode('remove');
                      setShowPinModal(true);
                    }}
                  />
                </>
              ) : (
                <Button
                  variant="secondary"
                  size="sm"
                  label={t('settings.security.pin_set', 'Set a PIN')}
                  onPress={() => {
                    setPinModalMode('create');
                    setShowPinModal(true);
                  }}
                />
              )}
            </View>
          </View>
        ) : null}
      </Section>

      <Section title={t('settings.device.title')}>
        <Row label={t('settings.device.tier')} detail={capitalise(reality.deviceTier)} />
        <Row
          label={t('settings.device.memory')}
          detail={`${reality.totalMemoryGB.toFixed(1)} GB`}
        />
        <Row label={t('settings.device.network')} detail={capitalise(reality.networkQuality)} />
        {reality.isDataSaverMode ? (
          <Row
            label={t('settings.device.data_saver')}
            signal
            signalLabel={t('settings.device.data_saver')}
          />
        ) : null}
      </Section>

      <Section title={t('settings.support.title', 'Support')} last>
        <Row
          label="Trube Lab"
          note={t(
            'settings.support.trube_note',
            'Tune living surfaces as solo, duet, or orchestra compositions.',
          )}
          onPress={handleTrubeLab}
        />
        {__DEV__ ? (
          <Row
            label="Iconography Lab"
            note="Compare Lucide, Phosphor, and native Lucide rendering."
            onPress={handleIconLab}
          />
        ) : null}
        <Row
          label={t('settings.support.contact', 'Contact Support')}
          note={t(
            'settings.support.contact_desc',
            'Send us feedback or report an issue via email.',
          )}
          onPress={() => void handleContactSupport()}
          accessibilityHint={t('settings.support.contact_hint', 'Open the support email composer')}
        />
        {__DEV__ ? (
          <View style={{ paddingVertical: 12 }}>
            <Button
              variant="danger"
              size="sm"
              label="Developer: reset all local data"
              accessibilityHint="Wipe all local storage and reset to a fresh install."
              onPress={() => void handleDevClearAllCache()}
            />
          </View>
        ) : null}
      </Section>

      <View style={{ paddingHorizontal: 20, paddingTop: 22, gap: 4 }}>
        <WText kind="label">{t('settings.tip.title')}</WText>
        <WText kind="caption">{t('settings.tip.message')}</WText>
      </View>

      {showPinModal && (
        <AccountPinModal
          isOpen={showPinModal}
          mode={pinModalMode}
          onClose={() => setShowPinModal(false)}
          onSubmit={handlePinSubmit}
          accountLabel={user?.display_name}
        />
      )}
    </ScrollView>
  );
});

AppSettingsScreen.displayName = 'AppSettingsScreen';

export default AppSettingsScreen;
