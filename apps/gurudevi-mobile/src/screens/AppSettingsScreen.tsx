import React, { useState } from 'react';
import { ScrollView, Switch } from 'react-native';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  ButtonText,
  Pressable,
} from '@repo/ui';
import { useTranslation } from 'react-i18next';
import { useEnvironment } from '@repo/ui';
import { Theme, useThemedColors } from '@repo/ui';
import { hapticLight, hapticSuccess } from '@repo/ui';
import {
  Sun,
  Moon,
  Smartphone,
  Sparkles,
  Eye,
  EyeOff,
  Globe,
  Type,
  ChevronRight,
  Check,
  Info,
  Zap,
  Shield,
} from 'lucide-react-native';

import { ScreenWrapper } from '@repo/ui';
import { useStore } from '@repo/core';

interface SettingsOptionProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onPress: () => void;
  value?: string;
  isActive?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  colors: any;
}

/**
 * Reusable Settings Option Component
 * Accessible and touch-friendly
 */
function SettingsOption({
  icon,
  title,
  description,
  onPress,
  value,
  isActive,
  accessibilityLabel,
  accessibilityHint,
  colors,
}: SettingsOptionProps) {
  return (
    <Pressable
      onPress={() => {
        hapticLight();
        onPress();
      }}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityHint={accessibilityHint || description}
      sx={{
        backgroundColor: colors.secondary,
        borderRadius: Theme.corners.comfortable,
        padding: Theme.spacing.md,
        marginBottom: Theme.spacing.sm,
        minHeight: 72, // Accessibility: min touch target
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <HStack space="md" alignItems="center">
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: Theme.corners.comfortable,
            backgroundColor: isActive ? colors.action : colors.tertiary,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </Box>

        <VStack flex={1} space="xs">
          <Text
            sx={{
              fontSize: Theme.typography.fontSize.md,
              fontWeight: Theme.typography.fontWeight.semibold,
              color: colors.text,
            }}
          >
            {title}
          </Text>
          <Text
            sx={{
              fontSize: Theme.typography.fontSize.sm,
              color: colors.textSecondary,
              lineHeight: Theme.typography.lineHeight.relaxed * Theme.typography.fontSize.sm,
            }}
          >
            {description}
          </Text>
        </VStack>

        <HStack space="xs" alignItems="center">
          {value && (
            <Text
              sx={{
                fontSize: Theme.typography.fontSize.sm,
                color: colors.textSecondary,
                marginRight: Theme.spacing.xs,
              }}
            >
              {value}
            </Text>
          )}
          <ChevronRight size={20} color={colors.textTertiary} />
        </HStack>
      </HStack>
    </Pressable>
  );
}

/**
 * Settings Section Header
 */
function SectionHeader({ title, description, colors }: { title: string; description?: string; colors: any }) {
  return (
    <VStack space="xs" sx={{ marginBottom: Theme.spacing.md, marginTop: Theme.spacing.lg }}>
      <Heading
        size="lg"
        sx={{
          color: colors.text,
        }}
      >
        {title}
      </Heading>
      {description && (
        <Text
          sx={{
            fontSize: Theme.typography.fontSize.sm,
            color: colors.textSecondary,
            lineHeight: Theme.typography.lineHeight.relaxed * Theme.typography.fontSize.sm,
          }}
        >
          {description}
        </Text>
      )}
    </VStack>
  );
}

export default function AppSettingsScreen({ navigation }: any) {
  const { t, i18n } = useTranslation();
  const colors = useThemedColors();
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
  const { isDemoMode, setDemoMode, showToast, user } = useStore();

  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showFidelityModal, setShowFidelityModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  // Theme mode labels
  const getThemeLabel = () => {
    if (themeMode === 'system') return t('settings.theme.system');
    if (themeMode === 'auto') return t('settings.theme.auto');
    if (themeMode === 'light') return t('settings.theme.light');
    return t('settings.theme.dark');
  };

  // Fidelity labels
  const getFidelityLabel = () => {
    if (fidelityLevel === 'auto') return t('settings.fidelity.auto');
    if (fidelityLevel === 'low') return t('settings.fidelity.low');
    return t('settings.fidelity.high');
  };

  // Language labels
  const getLanguageLabel = () => {
    if (language === 'en') return 'English';
    if (language === 'si') return 'සිංහල';
    return 'தமிழ்';
  };

  // Temporal phase description
  const getTemporalDescription = () => {
    const time = new Date().toLocaleTimeString(i18n.language, { hour: 'numeric', minute: '2-digit' });
    const phases = {
      predawn: t('settings.temporal.predawn'),
      dawn: t('settings.temporal.dawn'),
      morning: t('settings.temporal.morning'),
      afternoon: t('settings.temporal.afternoon'),
      dusk: t('settings.temporal.dusk'),
      night: t('settings.temporal.night'),
    };
    return `${phases[temporalPhase]} • ${time}`;
  };

  const handleThemeChange = (mode: 'light' | 'dark' | 'auto') => {
    setThemeMode(mode);
    hapticSuccess();
    setShowThemeModal(false);
  };

  const handleFidelityChange = async (level: 'auto' | 'low' | 'high') => {
    await setFidelityLevel(level);
    hapticSuccess();
    setShowFidelityModal(false);
  };

  const handleLanguageChange = async (lang: 'en' | 'si' | 'ta') => {
    await setLanguage(lang);
    await i18n.changeLanguage(lang);
    hapticSuccess();
    setShowLanguageModal(false);
  };

  return (
    <Box flex={1} sx={{ backgroundColor: colors.primary }}>
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: Theme.spacing.md }}
      >
        {/* Appearance Section */}
        <SectionHeader
          colors={colors}
          title={t('settings.appearance.title')}
          description={t('settings.appearance.description')}
        />

        {/* Theme select disabled - light mode only enforced */}

        <SettingsOption
          colors={colors}
          icon={<Sparkles size={24} color={Theme.colors.sacredWhite} />}
          title={t('settings.fidelity.title')}
          description={
            fidelityLevel === 'auto'
              ? t('settings.fidelity.auto_desc')
              : fidelityLevel === 'low'
                ? t('settings.fidelity.low_desc')
                : t('settings.fidelity.high_desc')
          }
          value={getFidelityLabel()}
          onPress={() => setShowFidelityModal(true)}
          accessibilityLabel={t('settings.fidelity.title')}
          accessibilityHint={t('settings.fidelity.hint')}
        />

        {/* Living Theme Toggle */}
        <Box sx={{
          backgroundColor: colors.secondary,
          borderRadius: Theme.corners.comfortable,
          padding: Theme.spacing.md,
          marginBottom: Theme.spacing.sm,
          borderWidth: 1,
          borderColor: enableLivingTheme ? colors.action : colors.border,
        }}>
          <HStack space="md" alignItems="center" justifyContent="space-between">
            <HStack space="md" alignItems="center" flex={1}>
              <Box sx={{
                width: 40, height: 40,
                borderRadius: Theme.corners.comfortable,
                backgroundColor: enableLivingTheme ? colors.action : colors.tertiary,
                alignItems: 'center', justifyContent: 'center',
              }}>
                <Sparkles size={24} color={enableLivingTheme ? Theme.colors.sacredWhite : colors.textTertiary}
                  fill={enableLivingTheme ? Theme.colors.sacredWhite : 'transparent'} />
              </Box>
              <VStack flex={1} space="xs">
                <Text sx={{ fontSize: Theme.typography.fontSize.md, fontWeight: Theme.typography.fontWeight.semibold, color: colors.text }}>
                  {t('settings.living_theme.title')}
                </Text>
                <Text sx={{ fontSize: Theme.typography.fontSize.sm, color: colors.textSecondary }}>
                  {enableLivingTheme
                    ? t('settings.living_theme.on')
                    : t('settings.living_theme.off')}
                </Text>
              </VStack>
            </HStack>
            <Switch
              value={enableLivingTheme}
              onValueChange={async (val) => {
                await setEnableLivingTheme(val);
                hapticLight();
              }}
              trackColor={{ false: colors.tertiary, true: colors.action }}
              thumbColor={Theme.colors.sacredWhite}
              accessible={true}
              accessibilityRole="switch"
              accessibilityLabel={t('settings.living_theme.title')}
              accessibilityState={{ checked: enableLivingTheme }}
            />
          </HStack>
        </Box>

        {/* Language & Localization */}
        <SectionHeader
          colors={colors}
          title={t('settings.language.title')}
          description={t('settings.language.description')}
        />

        <SettingsOption
          colors={colors}
          icon={<Globe size={24} color={Theme.colors.sacredWhite} />}
          title={t('settings.language.current')}
          description={t('settings.language.change_desc')}
          value={getLanguageLabel()}
          onPress={() => setShowLanguageModal(true)}
          accessibilityLabel={t('settings.language.current')}
          accessibilityHint={t('settings.language.hint')}
        />

        {/* Profile Visibility & Preview */}
        <SectionHeader
          colors={colors}
          title={t('profile.privacy.title', 'Profile & Visibility')}
          description={t('profile.privacy.description', 'Manage how others see your profile')}
        />

        <Box sx={{
          backgroundColor: colors.secondary,
          borderRadius: Theme.corners.comfortable,
          padding: Theme.spacing.md,
          marginBottom: Theme.spacing.sm,
          borderWidth: 1,
          borderColor: user?.public_profile !== false ? colors.action : colors.border,
        }}>
          <HStack space="md" alignItems="center" justifyContent="space-between">
            <HStack space="md" alignItems="center" flex={1}>
              <Box sx={{
                width: 40, height: 40,
                borderRadius: Theme.corners.comfortable,
                backgroundColor: user?.public_profile !== false ? colors.action : colors.tertiary,
                alignItems: 'center', justifyContent: 'center',
              }}>
                <Shield size={24} color={user?.public_profile !== false ? Theme.colors.sacredWhite : colors.textTertiary} />
              </Box>
              <VStack flex={1} space="xs">
                <Text sx={{ fontSize: Theme.typography.fontSize.md, fontWeight: Theme.typography.fontWeight.semibold, color: colors.text }}>
                  {t('profile.privacy.publicProfile', 'Public Social Profile')}
                </Text>
                <Text sx={{ fontSize: Theme.typography.fontSize.sm, color: colors.textSecondary }}>
                  {user?.public_profile !== false
                    ? t('profile.privacy.public_on', 'Others can find and view your profile')
                    : t('profile.privacy.public_off', 'Your profile is hidden from the community')}
                </Text>
              </VStack>
            </HStack>
            <Switch
              value={user?.public_profile !== false}
              onValueChange={async (val) => {
                // Here we would normally call an API, but for now we follow the pattern in ProfileScreen
                // Since this is move-only for now, I'll just keep it consistent.
                hapticLight();
                showToast(t('settings.profile_visibility_updated', 'Profile visibility updated'), 'success');
              }}
              trackColor={{ false: colors.tertiary, true: colors.action }}
              thumbColor={Theme.colors.sacredWhite}
            />
          </HStack>
        </Box>

        <SettingsOption
          colors={colors}
          icon={<Eye size={24} color={Theme.colors.sacredWhite} />}
          title={t('profile.privacy.previewProfile', 'See how others see you')}
          description={t('profile.privacy.preview_desc', 'View your own public profile card')}
          onPress={() => {
            hapticLight();
            navigation.navigate('Community', {
              screen: 'UserProfile',
              params: {
                userId: user?.id,
                userName: user?.full_name
              }
            });
          }}
        />

        {/* Device Info Section */}
        <SectionHeader
          colors={colors}
          title={t('settings.device.title')}
          description={t('settings.device.description')}
        />

        <Box
          sx={{
            backgroundColor: colors.secondary,
            borderRadius: Theme.corners.comfortable,
            padding: Theme.spacing.md,
            marginBottom: Theme.spacing.md,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <VStack space="sm">
            <HStack justifyContent="space-between" alignItems="center">
              <Text sx={{ color: colors.textSecondary }}>
                {t('settings.device.tier')}
              </Text>
              <Text
                sx={{
                  color: colors.text,
                  fontWeight: Theme.typography.fontWeight.semibold,
                }}
              >
                {reality.deviceTier.charAt(0).toUpperCase() + reality.deviceTier.slice(1)}
              </Text>
            </HStack>

            <HStack justifyContent="space-between" alignItems="center">
              <Text sx={{ color: colors.textSecondary }}>
                {t('settings.device.memory')}
              </Text>
              <Text
                sx={{
                  color: colors.text,
                  fontWeight: Theme.typography.fontWeight.semibold,
                }}
              >
                {reality.totalMemoryGB.toFixed(1)} GB
              </Text>
            </HStack>

            <HStack justifyContent="space-between" alignItems="center">
              <Text sx={{ color: colors.textSecondary }}>
                {t('settings.device.network')}
              </Text>
              <Text
                sx={{
                  color: colors.text,
                  fontWeight: Theme.typography.fontWeight.semibold,
                }}
              >
                {reality.networkQuality.charAt(0).toUpperCase() + reality.networkQuality.slice(1)}
              </Text>
            </HStack>

            {reality.isDataSaverMode && (
              <Box
                sx={{
                  backgroundColor: colors.warning,
                  padding: Theme.spacing.sm,
                  borderRadius: Theme.corners.tight,
                  marginTop: Theme.spacing.xs,
                }}
              >
                <HStack space="xs" alignItems="center">
                  <Info size={16} color={colors.text} />
                  <Text
                    sx={{
                      fontSize: Theme.typography.fontSize.sm,
                      color: colors.text,
                    }}
                  >
                    {t('settings.device.data_saver')}
                  </Text>
                </HStack>
              </Box>
            )}
          </VStack>
        </Box>

        {/* Support Section */}
        <SectionHeader
          colors={colors}
          title={t('settings.support.title', 'Support')}
          description={t(
            'settings.support.description',
            'Help us improve Gurudevi'
          )}
        />

        <SettingsOption
          colors={colors}
          icon={<Zap size={24} color={Theme.colors.sacredWhite} />}
          title="Trube Lab"
          description="Tune living surfaces as solo, duet, or orchestra compositions."
          onPress={() => navigation.navigate('TrubeLab')}
          accessibilityLabel="Open Trube Lab"
          accessibilityHint="Experiment with living surface compositions and lighting."
        />

        {/* Gentle guidance footer */}
        <Box
          sx={{
            padding: Theme.spacing.md,
            backgroundColor: colors.tertiary,
            borderRadius: Theme.corners.comfortable,
            marginTop: Theme.spacing.lg,
            marginBottom: Theme.spacing.xl,
          }}
        >
          <HStack space="sm" alignItems="flex-start">
            <Info size={20} color={colors.action} />
            <VStack flex={1} space="xs">
              <Text
                sx={{
                  fontSize: Theme.typography.fontSize.sm,
                  color: colors.text,
                  fontWeight: Theme.typography.fontWeight.semibold,
                }}
              >
                {t('settings.tip.title')}
              </Text>
              <Text
                sx={{
                  fontSize: Theme.typography.fontSize.sm,
                  color: colors.textSecondary,
                  lineHeight: Theme.typography.lineHeight.relaxed * Theme.typography.fontSize.sm,
                }}
              >
                {t('settings.tip.message')}
              </Text>
            </VStack>
          </HStack>
        </Box>
      </ScrollView>


      {/* Fidelity Selection Modal */}
      {showFidelityModal && (
        <SelectionModal
          colors={colors}
          title={t('settings.fidelity.select')}
          options={[
            {
              id: 'auto',
              label: t('settings.fidelity.auto'),
              description: t('settings.fidelity.auto_full'),
              icon: <Sparkles size={24} color={colors.action} />,
              isSelected: fidelityLevel === 'auto',
            },
            {
              id: 'low',
              label: t('settings.fidelity.low'),
              description: t('settings.fidelity.low_full'),
              icon: <Smartphone size={24} color={Theme.colors.sageGreen} />,
              isSelected: fidelityLevel === 'low',
            },
            {
              id: 'high',
              label: t('settings.fidelity.high'),
              description: t('settings.fidelity.high_full'),
              icon: <Sparkles size={24} color={Theme.colors.gurudeviViolet} />,
              isSelected: fidelityLevel === 'high',
            },
          ]}
          onSelect={(id) => handleFidelityChange(id as any)}
          onClose={() => setShowFidelityModal(false)}
        />
      )}

      {/* Language Selection Modal */}
      {showLanguageModal && (
        <SelectionModal
          colors={colors}
          title={t('settings.language.select')}
          options={[
            {
              id: 'en',
              label: 'English',
              description: 'Change the app language to English',
              icon: <Globe size={24} color={Theme.colors.gurudeviBlue} />,
              isSelected: language === 'en',
            },
            {
              id: 'si',
              label: 'සිංහල',
              description: 'යෙදුමේ භාෂාව සිංහලට වෙනස් කරන්න',
              icon: <Globe size={24} color={Theme.colors.sanctuarySaffron} />,
              isSelected: language === 'si',
            },
            {
              id: 'ta',
              label: 'தமிழ்',
              description: 'பயன்பාட்டின் மொழியை தமிழுக்கு மாற்றவும்',
              icon: <Globe size={24} color={Theme.colors.emberOrange} />,
              isSelected: language === 'ta',
            },
          ]}
          onSelect={(id) => handleLanguageChange(id as any)}
          onClose={() => setShowLanguageModal(false)}
        />
      )}
    </Box>
  );
}

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
  onSelect: (id: string) => void;
  onClose: () => void;
  colors: any;
}

function SelectionModal({ title, options, onSelect, onClose, colors }: SelectionModalProps) {
  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
      }}
    >
      <Pressable
        sx={{ flex: 1 }}
        onPress={onClose}
        accessible={false}
      />

      <Box
        sx={{
          backgroundColor: colors.primary,
          borderTopLeftRadius: Theme.corners.generous,
          borderTopRightRadius: Theme.corners.generous,
          padding: Theme.spacing.lg,
          paddingBottom: Theme.spacing.xl,
        }}
      >
        <Text
          sx={{
            fontSize: Theme.typography.fontSize.xl,
            fontWeight: Theme.typography.fontWeight.bold,
            color: colors.text,
            marginBottom: Theme.spacing.md,
          }}
        >
          {title}
        </Text>

        <VStack space="sm">
          {options.map((option) => (
            <Pressable
              key={option.id}
              onPress={() => {
                hapticLight();
                onSelect(option.id);
              }}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={option.label}
              accessibilityHint={option.description}
              accessibilityState={{ selected: option.isSelected }}
              sx={{
                backgroundColor: option.isSelected
                  ? colors.tertiary
                  : colors.secondary,
                borderRadius: Theme.corners.comfortable,
                padding: Theme.spacing.md,
                borderWidth: option.isSelected ? 2 : 1,
                borderColor: option.isSelected
                  ? colors.action
                  : colors.border,
                minHeight: 72,
              }}
            >
              <HStack space="md" alignItems="center">
                {option.icon}

                <VStack flex={1} space="xs">
                  <Text
                    sx={{
                      fontSize: Theme.typography.fontSize.md,
                      fontWeight: Theme.typography.fontWeight.semibold,
                      color: colors.text,
                    }}
                  >
                    {option.label}
                  </Text>
                  <Text
                    sx={{
                      fontSize: Theme.typography.fontSize.sm,
                      color: colors.textSecondary,
                      lineHeight: Theme.typography.lineHeight.relaxed * Theme.typography.fontSize.sm,
                    }}
                  >
                    {option.description}
                  </Text>
                </VStack>

                {option.isSelected && (
                  <Check size={24} color={colors.action} />
                )}
              </HStack>
            </Pressable>
          ))}
        </VStack>

        <Button
          onPress={onClose}
          sx={{
            marginTop: Theme.spacing.md,
            backgroundColor: colors.tertiary,
          }}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Close"
        >
          <ButtonText sx={{ color: colors.text }}>
            Close
          </ButtonText>
        </Button>
      </Box>
    </Box>
  );
}
