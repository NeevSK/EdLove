/**
 * App Settings Screen
 * Provides user control over Environment Engine settings
 * 
 * UX Principles:
 * - Clear, non-technical language
 * - Gentle guidance instead of technical jargon
 * - Immediate visual feedback
 * - Accessible to all users
 */

import React, { useState } from 'react';
import { ScrollView, Switch, Alert, TouchableOpacity } from 'react-native';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  ButtonText,
  Pressable,
} from '@/ui';
import { useTranslation } from 'react-i18next';
import { useEnvironment } from '../context';
import { Theme } from '../constants/Theme';
import { hapticLight, hapticSuccess } from '../utils/haptics';
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
} from 'lucide-react-native';

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
      style={{
        backgroundColor: Theme.colors.lotusWhite,
        borderRadius: Theme.corners.comfortable,
        padding: Theme.spacing.md,
        marginBottom: Theme.spacing.sm,
        minHeight: 72, // Accessibility: min touch target
        ...Theme.shadows.sm,
      }}
    >
      <HStack space="md" alignItems="center">
        <Box
          style={{
            width: 40,
            height: 40,
            borderRadius: Theme.corners.comfortable,
            backgroundColor: isActive ? Theme.colors.sanctuarySaffron : Theme.colors.sandStone,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </Box>
        
        <VStack flex={1} space="xs">
          <Text
            style={{
              fontSize: Theme.typography.fontSize.md,
              fontWeight: Theme.typography.fontWeight.semibold,
              color: Theme.colors.charcoalTruth,
            }}
          >
            {title}
          </Text>
          <Text
            style={{
              fontSize: Theme.typography.fontSize.sm,
              color: Theme.colors.slateGray,
              lineHeight: Theme.typography.lineHeight.relaxed * Theme.typography.fontSize.sm,
            }}
          >
            {description}
          </Text>
        </VStack>
        
        <HStack space="xs" alignItems="center">
          {value && (
            <Text
              style={{
                fontSize: Theme.typography.fontSize.sm,
                color: Theme.colors.slateGray,
                marginRight: Theme.spacing.xs,
              }}
            >
              {value}
            </Text>
          )}
          <ChevronRight size={20} color={Theme.colors.stoneGray} />
        </HStack>
      </HStack>
    </Pressable>
  );
}

/**
 * Settings Section Header
 */
function SectionHeader({ title, description }: { title: string; description?: string }) {
  return (
    <VStack space="xs" style={{ marginBottom: Theme.spacing.md, marginTop: Theme.spacing.lg }}>
      <Text
        style={{
          fontSize: Theme.typography.fontSize.lg,
          fontWeight: Theme.typography.fontWeight.bold,
          color: Theme.colors.charcoalTruth,
        }}
      >
        {title}
      </Text>
      {description && (
        <Text
          style={{
            fontSize: Theme.typography.fontSize.sm,
            color: Theme.colors.slateGray,
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

  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showFidelityModal, setShowFidelityModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  // Theme mode labels
  const getThemeLabel = () => {
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
      dawn: t('settings.temporal.dawn', 'Gentle awakening (5-8 AM)'),
      day: t('settings.temporal.day', 'Active work (8 AM-5 PM)'),
      evening: t('settings.temporal.evening', 'Winding down (5-8 PM)'),
      night: t('settings.temporal.night', 'Restful (8 PM-5 AM)'),
    };
    return `${phases[temporalPhase]} • ${time}`;
  };

  const handleThemeChange = (mode: 'light' | 'dark' | 'auto') => {
    setThemeMode(mode);
    hapticSuccess();
    setShowThemeModal(false);
  };

  const handleFidelityChange = (level: 'auto' | 'low' | 'high') => {
    setFidelityLevel(level);
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
    <Box flex={1} backgroundColor={Theme.colors.creamSilence}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: Theme.spacing.md }}
      >
        {/* Appearance Section */}
        <SectionHeader
          title={t('settings.appearance.title', 'Appearance')}
          description={t(
            'settings.appearance.description',
            'Personalize how Gurudevi looks and feels'
          )}
        />

        <SettingsOption
          icon={themeMode === 'dark' ? <Moon size={24} color={Theme.colors.white} /> : <Sun size={24} color={Theme.colors.white} />}
          title={t('settings.theme.title', 'Theme')}
          description={getTemporalDescription()}
          value={getThemeLabel()}
          onPress={() => setShowThemeModal(true)}
          accessibilityLabel={t('settings.theme.title', 'Theme')}
          accessibilityHint={t('settings.theme.hint', 'Choose between light, dark, or automatic theme based on time of day')}
        />

        <SettingsOption
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
          title={t('settings.language.title', 'Language')}
          description={t(
            'settings.language.description',
            'Choose your preferred language'
          )}
        />

        <SettingsOption
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
          title={t('settings.privacy.title', 'Privacy')}
          description={t(
            'settings.privacy.description',
            'Control how your information is displayed'
          )}
        />

        <Box
          style={{
            backgroundColor: Theme.colors.lotusWhite,
            borderRadius: Theme.corners.comfortable,
            padding: Theme.spacing.md,
            marginBottom: Theme.spacing.sm,
            ...Theme.shadows.sm,
          }}
        >
          <HStack space="md" alignItems="center" justifyContent="space-between">
            <HStack space="md" alignItems="center" flex={1}>
              <Box
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: Theme.corners.comfortable,
                  backgroundColor: isVeilActive ? Theme.colors.sanctuarySaffron : Theme.colors.sandStone,
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
                  style={{
                    fontSize: Theme.typography.fontSize.md,
                    fontWeight: Theme.typography.fontWeight.semibold,
                    color: Theme.colors.charcoalTruth,
                  }}
                >
                  {t('settings.veil.title', 'Privacy Veil')}
                </Text>
                <Text
                  style={{
                    fontSize: Theme.typography.fontSize.sm,
                    color: Theme.colors.slateGray,
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
              onValueChange={toggleVeil}
              trackColor={{
                false: Theme.colors.sandStone,
                true: Theme.colors.sanctuarySaffron,
              }}
              thumbColor={Theme.colors.white}
              accessible={true}
              accessibilityRole="switch"
              accessibilityLabel={t('settings.veil.title', 'Privacy Veil')}
              accessibilityState={{ checked: isVeilActive }}
            />
          </HStack>
        </Box>

        {/* Device Info Section */}
        <SectionHeader
          title={t('settings.device.title', 'Device Information')}
          description={t(
            'settings.device.description',
            'How Gurudevi adapts to your device'
          )}
        />

        <Box
          style={{
            backgroundColor: Theme.colors.lotusWhite,
            borderRadius: Theme.corners.comfortable,
            padding: Theme.spacing.md,
            marginBottom: Theme.spacing.md,
            ...Theme.shadows.sm,
          }}
        >
          <VStack space="sm">
            <HStack justifyContent="space-between" alignItems="center">
              <Text style={{ color: Theme.colors.slateGray }}>
                {t('settings.device.tier', 'Device Tier')}
              </Text>
              <Text
                style={{
                  color: Theme.colors.charcoalTruth,
                  fontWeight: Theme.typography.fontWeight.semibold,
                }}
              >
                {reality.deviceTier.charAt(0).toUpperCase() + reality.deviceTier.slice(1)}
              </Text>
            </HStack>
            
            <HStack justifyContent="space-between" alignItems="center">
              <Text style={{ color: Theme.colors.slateGray }}>
                {t('settings.device.memory', 'Available Memory')}
              </Text>
              <Text
                style={{
                  color: Theme.colors.charcoalTruth,
                  fontWeight: Theme.typography.fontWeight.semibold,
                }}
              >
                {reality.totalMemoryGB.toFixed(1)} GB
              </Text>
            </HStack>
            
            <HStack justifyContent="space-between" alignItems="center">
              <Text style={{ color: Theme.colors.slateGray }}>
                {t('settings.device.network', 'Network Quality')}
              </Text>
              <Text
                style={{
                  color: Theme.colors.charcoalTruth,
                  fontWeight: Theme.typography.fontWeight.semibold,
                }}
              >
                {reality.networkQuality.charAt(0).toUpperCase() + reality.networkQuality.slice(1)}
              </Text>
            </HStack>
            
            {reality.isDataSaverMode && (
              <Box
                style={{
                  backgroundColor: Theme.colors.amberGlow,
                  padding: Theme.spacing.sm,
                  borderRadius: Theme.corners.tight,
                  marginTop: Theme.spacing.xs,
                }}
              >
                <HStack space="xs" alignItems="center">
                  <Info size={16} color={Theme.colors.charcoalTruth} />
                  <Text
                    style={{
                      fontSize: Theme.typography.fontSize.sm,
                      color: Theme.colors.charcoalTruth,
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
          style={{
            padding: Theme.spacing.md,
            backgroundColor: Theme.colors.lavenderMist,
            borderRadius: Theme.corners.comfortable,
            marginTop: Theme.spacing.lg,
            marginBottom: Theme.spacing.xl,
          }}
        >
          <HStack space="sm" alignItems="flex-start">
            <Info size={20} color={Theme.colors.gurudeviViolet} />
            <VStack flex={1} space="xs">
              <Text
                style={{
                  fontSize: Theme.typography.fontSize.sm,
                  color: Theme.colors.charcoalTruth,
                  fontWeight: Theme.typography.fontWeight.semibold,
                }}
              >
                {t('settings.tip.title', 'Tip')}
              </Text>
              <Text
                style={{
                  fontSize: Theme.typography.fontSize.sm,
                  color: Theme.colors.slateGray,
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
          title={t('settings.theme.select', 'Choose Theme')}
          options={[
            {
              id: 'auto',
              label: t('settings.theme.auto', 'Auto (Time-based)'),
              description: t('settings.theme.auto_full', 'Automatically adjusts between light and dark based on time of day'),
              icon: <Smartphone size={24} color={Theme.colors.sanctuarySaffron} />,
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
          title={t('settings.fidelity.select', 'Visual Quality')}
          options={[
            {
              id: 'auto',
              label: t('settings.fidelity.auto', 'Auto (Smart)'),
              description: t('settings.fidelity.auto_full', 'Automatically adjusts based on your device capabilities'),
              icon: <Sparkles size={24} color={Theme.colors.sanctuarySaffron} />,
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
              description: 'பயன்பாட்டின் மொழியை தமிழுக்கு மாற்றவும்',
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
}

function SelectionModal({ title, options, onSelect, onClose }: SelectionModalProps) {
  return (
    <Box
      style={{
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
        style={{ flex: 1 }}
        onPress={onClose}
        accessible={false}
      />
      
      <Box
        style={{
          backgroundColor: Theme.colors.white,
          borderTopLeftRadius: Theme.corners.generous,
          borderTopRightRadius: Theme.corners.generous,
          padding: Theme.spacing.lg,
          paddingBottom: Theme.spacing.xl,
        }}
      >
        <Text
          style={{
            fontSize: Theme.typography.fontSize.xl,
            fontWeight: Theme.typography.fontWeight.bold,
            color: Theme.colors.charcoalTruth,
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
              style={{
                backgroundColor: option.isSelected
                  ? Theme.colors.lavenderMist
                  : Theme.colors.lotusWhite,
                borderRadius: Theme.corners.comfortable,
                padding: Theme.spacing.md,
                borderWidth: option.isSelected ? 2 : 1,
                borderColor: option.isSelected
                  ? Theme.colors.sanctuarySaffron
                  : Theme.colors.sandStone,
                minHeight: 72,
              }}
            >
              <HStack space="md" alignItems="center">
                {option.icon}
                
                <VStack flex={1} space="xs">
                  <Text
                    style={{
                      fontSize: Theme.typography.fontSize.md,
                      fontWeight: Theme.typography.fontWeight.semibold,
                      color: Theme.colors.charcoalTruth,
                    }}
                  >
                    {option.label}
                  </Text>
                  <Text
                    style={{
                      fontSize: Theme.typography.fontSize.sm,
                      color: Theme.colors.slateGray,
                      lineHeight: Theme.typography.lineHeight.relaxed * Theme.typography.fontSize.sm,
                    }}
                  >
                    {option.description}
                  </Text>
                </VStack>
                
                {option.isSelected && (
                  <Check size={24} color={Theme.colors.sanctuarySaffron} />
                )}
              </HStack>
            </Pressable>
          ))}
        </VStack>
        
        <Button
          onPress={onClose}
          style={{
            marginTop: Theme.spacing.md,
            backgroundColor: Theme.colors.sandStone,
          }}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Close"
        >
          <ButtonText style={{ color: Theme.colors.charcoalTruth }}>
            Close
          </ButtonText>
        </Button>
      </Box>
    </Box>
  );
}
