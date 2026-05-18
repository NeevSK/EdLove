import { useStore } from '@repo/core/logic';
import {
  Check,
  ChevronRight,
  Eye,
  Globe,
  Info,
  Shield,
  Smartphone,
  Sparkles,
  Zap,
} from 'lucide-react-native';
import type React from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import DeviceSecurityCenter from '../components/DeviceSecurityCenter';
import { Box } from '../components/ui/box';
import { Button, ButtonText } from '../components/ui/button';
import { HStack } from '../components/ui/hstack';
import { Pressable } from '../components/ui/pressable';
import { ScrollView } from '../components/ui/scroll-view';
import { Switch } from '../components/ui/switch';
import { Heading, Text } from '../components/ui/text';
import { VStack } from '../components/ui/vstack';
import { NotificationSettingsPanel } from '../components/NotificationSettingsPanel';
import { useEnvironment } from '../context';
import { useTheme } from '../hooks/useTheme';
import { useSanctuaryToast } from '../providers/ToastProvider';
import { hapticLight, hapticSuccess } from '../utils/haptics';
import { useCallback, memo, useMemo } from 'react';

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

const AppSettingsScreen = memo(function AppSettingsScreen({ navigation }: any) {
  const { t, i18n } = useTranslation();
  const { accent, scene, text: themeText } = useTheme();

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
  } = useEnvironment();
  const _isDemoMode = useStore((state) => state.isDemoMode);
  const _setDemoMode = useStore((state) => state.setDemoMode);
  const user = useStore((state) => state.user);
  const { showToast } = useSanctuaryToast();

  const [_showThemeModal, setShowThemeModal] = useState(false);
  const [showFidelityModal, setShowFidelityModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  // Theme mode labels
  const themeLabel = useMemo(() => {
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
  const temporalDescription = useMemo(() => {
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

  const _handleThemeChange = useCallback((mode: 'light' | 'dark' | 'auto') => {
    setThemeMode(mode);
    hapticSuccess();
    setShowThemeModal(false);
  }, [setThemeMode]);

  const handleFidelityChange = useCallback(async (level: 'auto' | 'low' | 'high') => {
    await setFidelityLevel(level);
    hapticSuccess();
    setShowFidelityModal(false);
  }, [setFidelityLevel]);

  const handleLanguageChange = useCallback(async (lang: 'en' | 'si' | 'ta') => {
    await setLanguage(lang);
    await i18n.changeLanguage(lang);
    hapticSuccess();
    setShowLanguageModal(false);
  }, [setLanguage, i18n]);

  const handleOpenFidelity = useCallback(() => setShowFidelityModal(true), []);
  const handleCloseFidelity = useCallback(() => setShowFidelityModal(false), []);
  
  const handleOpenLanguage = useCallback(() => setShowLanguageModal(true), []);
  const handleCloseLanguage = useCallback(() => setShowLanguageModal(false), []);

  const handleLivingThemeToggle = useCallback(async (val: boolean) => {
    await setEnableLivingTheme(val);
    hapticLight();
  }, [setEnableLivingTheme]);

  const handleProfileVisibilityToggle = useCallback(async (_val: boolean) => {
    hapticLight();
    showToast({
      message: t('settings.profile_visibility_updated', 'Profile visibility updated'),
      type: 'success',
    });
  }, [showToast, t]);

  const handlePreviewProfile = useCallback(() => {
    hapticLight();
    navigation.navigate('Community', {
      screen: 'UserProfile',
      params: {
        userId: user?.id,
        userName: user?.display_name,
      },
    });
  }, [navigation, user]);

  const handleTrubeLab = useCallback(() => navigation.navigate('TrubeLab'), [navigation]);

  const fidelityDescription = useMemo(() => (
    fidelityLevel === 'auto'
      ? t('settings.fidelity.auto_desc')
      : fidelityLevel === 'low'
        ? t('settings.fidelity.low_desc')
        : t('settings.fidelity.high_desc')
  ), [fidelityLevel, t]);

  const profileVisibilityTitle = useMemo(() => t('profile.privacy.publicProfile', 'Public Social Profile'), [t]);
  const profileVisibilityDesc = useMemo(() => (
    user?.public_profile !== false
      ? t('profile.privacy.public_on', 'Others can find and view your profile')
      : t('profile.privacy.public_off', 'Your profile is hidden from the community')
  ), [user?.public_profile, t]);

  const fidelityOptions = useMemo(() => [
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
  ], [fidelityLevel, t]);

  const languageOptions = useMemo(() => [
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
  ], [language]);

  const trackColor = useMemo(() => ({ false: '#4B5563', true: accent.action }), [accent.action]);

  return (
    <Box className="flex-1 bg-phase-world">
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16 }}
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
                <Text className="text-sm text-phase-secondary">
                  {profileVisibilityDesc}
                </Text>
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
          onSelect={handleFidelityChange}
          onClose={handleCloseFidelity}
        />
      )}

      {/* Language Selection Modal */}
      {showLanguageModal && (
        <SelectionModal
          title={t('settings.language.select')}
          options={languageOptions}
          onSelect={handleLanguageChange}
          onClose={handleCloseLanguage}
        />
      )}
    </Box>
  );
});

AppSettingsScreen.displayName = 'AppSettingsScreen';

export default AppSettingsScreen;

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
