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
  } = useEnvironment();
  const { isDemoMode, setDemoMode } = useStore();

  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showFidelityModal, setShowFidelityModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  // Theme mode labels
  const getThemeLabel = () => {
    if (themeMode === 'system') return t('settings.theme.system', 'System Default');
    if (themeMode === 'auto') return t('settings.theme.auto', 'Auto (Time-based)');
    if (themeMode === 'light') return t('settings.theme.light', 'Light');
    return t('settings.theme.dark', 'Dark');
  };

  // Fidelity labels
  const getFidelityLabel = () => {
    if (fidelityLevel === 'auto') return t('settings.fidelity.auto', 'Auto (Smart)');
    if (fidelityLevel === 'low') return t('settings.fidelity.low', 'Battery Saver');
    return t('settings.fidelity.high', 'Best Quality');
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
      predawn:   t('settings.temporal.predawn',   'Deep quiet (12-6 AM)'),
      dawn:      t('settings.temporal.dawn',      'Gentle awakening (6-9 AM)'),
      morning:   t('settings.temporal.morning',   'Active start (9 AM-12 PM)'),
      afternoon: t('settings.temporal.afternoon', 'Full energy (12-5 PM)'),
      dusk:      t('settings.temporal.dusk',      'Winding down (5-8 PM)'),
      night:     t('settings.temporal.night',     'Restful (8 PM-12 AM)'),
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
          title={t('settings.appearance.title', 'Appearance')}
          description={t(
            'settings.appearance.description',
            'Personalize how Gurudevi looks and feels'
          )}
        />

        <SettingsOption
          colors={colors}
          icon={themeMode === 'dark' ? <Moon size={24} color={Theme.colors.white} /> : <Sun size={24} color={Theme.colors.white} />}
          title={t('settings.theme.title', 'Theme')}
          description={getTemporalDescription()}
          value={getThemeLabel()}
          onPress={() => setShowThemeModal(true)}
          accessibilityLabel={t('settings.theme.title', 'Theme')}
          accessibilityHint={t('settings.theme.hint', 'Choose between light, dark, or automatic theme based on time of day')}
        />

        <SettingsOption
          colors={colors}
          icon={<Sparkles size={24} color={Theme.colors.white} />}
          title={t('settings.fidelity.title', 'Visual Quality')}
          description={
            fidelityLevel === 'auto'
              ? t('settings.fidelity.auto_desc', 'Adapts to your device automatically')
              : fidelityLevel === 'low'
                ? t('settings.fidelity.low_desc', 'Saves battery, works on all devices')
                : t('settings.fidelity.high_desc', 'Beautiful effects, needs good device')
          }
          value={getFidelityLabel()}
          onPress={() => setShowFidelityModal(true)}
          accessibilityLabel={t('settings.fidelity.title', 'Visual Quality')}
          accessibilityHint={t('settings.fidelity.hint', 'Control visual effects and animations quality')}
        />

        {/* Language & Localization */}
        <SectionHeader
          colors={colors}
          title={t('settings.language.title', 'Language')}
          description={t(
            'settings.language.description',
            'Choose your preferred language'
          )}
        />

        <SettingsOption
          colors={colors}
          icon={<Globe size={24} color={Theme.colors.white} />}
          title={t('settings.language.current', 'App Language')}
          description={t('settings.language.change_desc', 'Switch between English, Sinhala, and Tamil')}
          value={getLanguageLabel()}
          onPress={() => setShowLanguageModal(true)}
          accessibilityLabel={t('settings.language.current', 'App Language')}
          accessibilityHint={t('settings.language.hint', 'Change the language of the entire app')}
        />

        {/* Privacy Section */}
        <SectionHeader
          colors={colors}
          title={t('settings.privacy.title', 'Privacy')}
          description={t(
            'settings.privacy.description',
            'Control how your information is displayed'
          )}
        />

        <Box
          sx={{
            backgroundColor: colors.secondary,
            borderRadius: Theme.corners.comfortable,
            padding: Theme.spacing.md,
            marginBottom: Theme.spacing.sm,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <HStack space="md" alignItems="center" justifyContent="space-between">
            <HStack space="md" alignItems="center" flex={1}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: Theme.corners.comfortable,
                  backgroundColor: isVeilActive ? colors.action : colors.tertiary,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {isVeilActive ? (
                  <EyeOff size={24} color={Theme.colors.white} />
                ) : (
                  <Eye size={24} color={Theme.colors.white} />
                )}
              </Box>

              <VStack flex={1} space="xs">
                <Text
                  sx={{
                    fontSize: Theme.typography.fontSize.md,
                    fontWeight: Theme.typography.fontWeight.semibold,
                    color: colors.text,
                  }}
                >
                  {t('settings.veil.title', 'Privacy Veil')}
                </Text>
                <Text
                  sx={{
                    fontSize: Theme.typography.fontSize.sm,
                    color: colors.textSecondary,
                    lineHeight: Theme.typography.lineHeight.relaxed * Theme.typography.fontSize.sm,
                  }}
                >
                  {t(
                    'settings.veil.description',
                    isVeilActive
                      ? 'Sensitive information is hidden'
                      : 'Quick-hide personal details when needed'
                  )}
                </Text>
              </VStack>
            </HStack>

            <Switch
              value={isVeilActive}
              onValueChange={async () => {
                await toggleVeil();
                hapticLight();
              }}
              trackColor={{
                false: colors.tertiary,
                true: colors.action,
              }}
              thumbColor={Theme.colors.white}
              accessible={true}
              accessibilityRole="switch"
              accessibilityLabel={t('settings.veil.title', 'Privacy Veil')}
              accessibilityState={{ checked: isVeilActive }}
            />
          </HStack>
        </Box>

        {/* Explorer Section (Demo Mode) */}
        <SectionHeader
          colors={colors}
          title={t('settings.explorer.title', 'Explorer Mode')}
          description={t(
            'settings.explorer.description',
            'Full potential simulation with visionary sample data'
          )}
        />

        <Box
          sx={{
            backgroundColor: colors.secondary,
            borderRadius: Theme.corners.comfortable,
            padding: Theme.spacing.md,
            marginBottom: Theme.spacing.sm,
            borderWidth: 1,
            borderColor: isDemoMode ? Theme.colors.sanctuarySaffron : colors.border,
            shadowColor: isDemoMode ? Theme.colors.sanctuarySaffron : 'transparent',
            shadowOpacity: isDemoMode ? 0.3 : 0,
            shadowRadius: 10,
          }}
        >
          <HStack space="md" alignItems="center" justifyContent="space-between">
            <HStack space="md" alignItems="center" flex={1}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: Theme.corners.comfortable,
                  backgroundColor: isDemoMode ? Theme.colors.sanctuarySaffron : colors.tertiary,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Zap size={24} color={isDemoMode ? Theme.colors.white : colors.textTertiary} fill={isDemoMode ? Theme.colors.white : 'transparent'} />
              </Box>

              <VStack flex={1} space="xs">
                <Text
                  sx={{
                    fontSize: Theme.typography.fontSize.md,
                    fontWeight: Theme.typography.fontWeight.semibold,
                    color: colors.text,
                  }}
                >
                  {t('settings.explorer.toggle', 'Visionary Sandbox')}
                </Text>
                <Text
                  sx={{
                    fontSize: Theme.typography.fontSize.sm,
                    color: colors.textSecondary,
                    lineHeight: Theme.typography.lineHeight.relaxed * Theme.typography.fontSize.sm,
                  }}
                >
                  {t(
                    'settings.explorer.status',
                    isDemoMode
                      ? 'Sandbox is ACTIVE'
                      : 'Show full-potential proofs'
                  )}
                </Text>
              </VStack>
            </HStack>

            <Switch
              value={isDemoMode}
              onValueChange={(val) => {
                setDemoMode(val);
                hapticSuccess();
              }}
              trackColor={{
                false: colors.tertiary,
                true: Theme.colors.sanctuarySaffron,
              }}
              thumbColor={Theme.colors.white}
              accessible={true}
              accessibilityRole="switch"
              accessibilityLabel={t('settings.explorer.title', 'Explorer Mode')}
              accessibilityState={{ checked: isDemoMode }}
            />
          </HStack>
        </Box>

        {/* Device Info Section */}
        <SectionHeader
          colors={colors}
          title={t('settings.device.title', 'Device Information')}
          description={t(
            'settings.device.description',
            'How Gurudevi adapts to your device'
          )}
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
                {t('settings.device.tier', 'Device Tier')}
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
                {t('settings.device.memory', 'Available Memory')}
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
                {t('settings.device.network', 'Network Quality')}
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
                    {t(
                      'settings.device.data_saver',
                      'Data Saver mode is active due to poor connection'
                    )}
                  </Text>
                </HStack>
              </Box>
            )}
          </VStack>
        </Box>

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
                {t('settings.tip.title', 'Tip')}
              </Text>
              <Text
                sx={{
                  fontSize: Theme.typography.fontSize.sm,
                  color: colors.textSecondary,
                  lineHeight: Theme.typography.lineHeight.relaxed * Theme.typography.fontSize.sm,
                }}
              >
                {t(
                  'settings.tip.message',
                  'These settings help Gurudevi work best for you. Auto mode is recommended for most users.'
                )}
              </Text>
            </VStack>
          </HStack>
        </Box>
      </ScrollView>

      {/* Theme Selection Modal */}
      {showThemeModal && (
        <SelectionModal
          colors={colors}
          title={t('settings.theme.select', 'Choose Theme')}
          options={[
            {
              id: 'system',
              label: t('settings.theme.system', 'System Default'),
              description: t('settings.theme.system_full', 'Follows your device theme settings'),
              icon: <Smartphone size={24} color={colors.action} />,
              isSelected: themeMode === 'system',
            },
            {
              id: 'auto',
              label: t('settings.theme.auto', 'Auto (Time-based)'),
              description: t('settings.theme.auto_full', 'Automatically adjusts between light and dark based on time of day'),
              icon: <Sparkles size={24} color={Theme.colors.gurudeviViolet} />,
              isSelected: themeMode === 'auto',
            },
            {
              id: 'light',
              label: t('settings.theme.light', 'Light'),
              description: t('settings.theme.light_full', 'Bright and clear for daytime use'),
              icon: <Sun size={24} color={Theme.colors.dawnGold} />,
              isSelected: themeMode === 'light',
            },
            {
              id: 'dark',
              label: t('settings.theme.dark', 'Dark'),
              description: t('settings.theme.dark_full', 'Easy on the eyes in low light'),
              icon: <Moon size={24} color={Theme.colors.twilightPurple} />,
              isSelected: themeMode === 'dark',
            },
          ]}
          onSelect={(id) => handleThemeChange(id as any)}
          onClose={() => setShowThemeModal(false)}
        />
      )}

      {/* Fidelity Selection Modal */}
      {showFidelityModal && (
        <SelectionModal
          colors={colors}
          title={t('settings.fidelity.select', 'Visual Quality')}
          options={[
            {
              id: 'auto',
              label: t('settings.fidelity.auto', 'Auto (Smart)'),
              description: t('settings.fidelity.auto_full', 'Automatically adjusts based on your device capabilities'),
              icon: <Sparkles size={24} color={colors.action} />,
              isSelected: fidelityLevel === 'auto',
            },
            {
              id: 'low',
              label: t('settings.fidelity.low', 'Battery Saver'),
              description: t('settings.fidelity.low_full', 'Simplified visuals, works smoothly on all devices'),
              icon: <Smartphone size={24} color={Theme.colors.sageGreen} />,
              isSelected: fidelityLevel === 'low',
            },
            {
              id: 'high',
              label: t('settings.fidelity.high', 'Best Quality'),
              description: t('settings.fidelity.high_full', 'Beautiful effects and animations (requires capable device)'),
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
          title={t('settings.language.select', 'Choose Language')}
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
          onSelect={onClose}
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
