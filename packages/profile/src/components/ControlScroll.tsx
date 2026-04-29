import type { ThemeMode } from '@repo/ui/context';
import { Box } from '@repo/ui/primitives';
import { Divider, HStack, Heading, Icon, Text, VStack } from '@repo/ui/primitives';
import { Pressable, useTheme } from '@repo/ui/primitives';
import { hapticLight, hapticSuccess } from '@repo/ui/utils/haptics';

import {
  Check,
  ChevronRight,
  Database,
  Globe,
  Moon,
  Smartphone,
  Sun,
  X,
  Zap,
} from 'lucide-react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from 'react-native';

interface ControlScrollProps {
  currentLanguage: string;
  onLanguageChange: (lang: 'si' | 'ta' | 'en') => void;
}

/**
 * CONTROL SCROLL
 * Sanctuary V3 standard for app-wide settings like Language and Theme.
 */
export default function ControlScroll({ currentLanguage, onLanguageChange }: ControlScrollProps) {
  const { t } = useTranslation();
  const { themeMode, setThemeMode } = useTheme();
  const [showThemeModal, setShowThemeModal] = useState(false);

  const getThemeLabel = (mode: ThemeMode) => {
    switch (mode) {
      case 'system':
        return 'System Default';
      case 'light':
        return 'Light Mode';
      case 'dark':
        return 'Dark Mode';
      case 'auto':
        return 'Auto (Time-based)';
      default:
        return 'System Default';
    }
  };

  const renderThemeOption = (mode: ThemeMode, Icon: any, label: string, description: string) => {
    const isActive = themeMode === mode;

    return (
      <Pressable
        onPress={() => {
          if (!isActive) {
            hapticSuccess();
            setThemeMode(mode);
            setShowThemeModal(false);
          }
        }}
      >
        <Box
          className={`p-4 rounded-2xl border mb-2 ${isActive ? 'bg-phase-interactive/10 border-phase-interactive' : 'bg-phase-surface border-transparent'}`}
        >
          <HStack className="justify-between items-center">
            <HStack space="md" className="items-center">
              <Box
                className={`w-9 h-9 rounded-xl items-center justify-center ${isActive ? 'bg-phase-interactive/20' : 'bg-phase-canvas/5'}`}
              >
                <Icon as={Icon} size={20} color={isActive ? '#E67E22' : '#9DA1A3'} />
              </Box>
              <VStack>
                <Text
                  className={`text-sm ${isActive ? 'text-[#E67E22] font-bold' : 'text-phase-text-primary font-medium'}`}
                >
                  {label}
                </Text>
                <Text className="text-phase-text-tertiary text-[10px]">{description}</Text>
              </VStack>
            </HStack>
            {isActive && <Icon as={Check} size={20} color="#E67E22" />}
          </HStack>
        </Box>
      </Pressable>
    );
  };

  const renderLanguageItem = (lang: 'si' | 'ta' | 'en', label: string) => {
    const isActive = currentLanguage === lang;
    return (
      <Pressable
        onPress={() => {
          if (!isActive) {
            hapticSuccess();
            onLanguageChange(lang);
          }
        }}
      >
        <Box
          className={`py-3 px-4 rounded-xl ${isActive ? 'bg-phase-interactive/10' : 'bg-transparent'}`}
        >
          <HStack className="justify-between items-center">
            <Text
              className={`text-sm ${isActive ? 'text-[#E67E22] font-bold' : 'text-phase-text-primary font-medium'}`}
            >
              {label}
            </Text>
            {isActive && <Icon as={Check} size={18} color="#E67E22" />}
          </HStack>
        </Box>
      </Pressable>
    );
  };

  return (
    <VStack space="2xl" className="pb-24">
      {/* Language Section */}
      <VStack space="sm">
        <Text className="text-phase-text-tertiary ml-4 uppercase font-bold text-[10px] tracking-widest">
          {t('profile.language') || 'LANGUAGE'}
        </Text>

        <Box className="bg-phase-canvas rounded-3xl overflow-hidden border border-phase-surface">
          <HStack className="p-4 items-center" space="md">
            <Box className="w-9 h-9 rounded-xl bg-phase-interactive/10 items-center justify-center">
              <Icon as={Globe} size={20} color="#E67E22" />
            </Box>
            <VStack>
              <Text className="text-phase-text-primary font-bold">
                {t('profile.appLanguage') || 'App Language'}
              </Text>
              <Text className="text-phase-text-tertiary text-xs">
                {t('profile.chooseLanguage') || 'Choose your preferred language'}
              </Text>
            </VStack>
          </HStack>

          <Divider className="bg-phase-surface" />
          <VStack className="p-1.5">
            {renderLanguageItem('si', '\u0DC3\u0DD2\u0D82\u0DC4\u0DBD')}
            {renderLanguageItem('ta', '\u0BA4\u0BAE\u0BBF\u0BB4\u0BCD')}
            {renderLanguageItem('en', 'English')}
          </VStack>
        </Box>
      </VStack>

      {/* App Settings Section */}
      <VStack space="sm">
        <Text className="text-phase-text-tertiary ml-4 uppercase font-bold text-[10px] tracking-widest">
          {t('profile.settings') || 'SETTINGS'}
        </Text>

        <Box className="bg-phase-canvas rounded-3xl overflow-hidden border border-phase-surface">
          {/* Theme Selector */}
          <Pressable
            onPress={() => {
              hapticLight();
              setShowThemeModal(true);
            }}
          >
            <HStack className="p-4 justify-between items-center">
              <HStack space="md" className="items-center">
                <Box className="w-9 h-9 rounded-xl bg-purple-500/10 items-center justify-center">
                  <Icon as={Moon} size={20} color="#9B59B6" />
                </Box>
                <VStack>
                  <Text className="text-phase-text-primary">Theme</Text>
                  <Text className="text-phase-text-tertiary text-xs">
                    {getThemeLabel(themeMode)}
                  </Text>
                </VStack>
              </HStack>
              <Icon as={ChevronRight} size={20} color="#9DA1A3" />
            </HStack>
          </Pressable>

          <Divider className="bg-phase-surface ml-14" />

          {/* Data Saver (Placeholder) */}
          <Pressable onPress={hapticLight}>
            <HStack className="p-4 justify-between items-center">
              <HStack space="md" className="items-center">
                <Box className="w-9 h-9 rounded-xl bg-green-500/10 items-center justify-center">
                  <Icon as={Database} size={20} color="#2ECC71" />
                </Box>
                <VStack>
                  <Text className="text-phase-text-primary">Data Saver</Text>
                  <Text className="text-phase-text-tertiary text-xs">Reduce usage</Text>
                </VStack>
              </HStack>
              <Box className="bg-phase-surface px-2 py-0.5 rounded-md">
                <Text className="text-phase-text-tertiary font-bold text-[8px]">SOON</Text>
              </Box>
            </HStack>
          </Pressable>
        </Box>
      </VStack>

      {/* Theme Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showThemeModal}
        onRequestClose={() => setShowThemeModal(false)}
      >
        <Box className="flex-1 justify-end bg-black/60">
          <Box className="bg-phase-canvas rounded-t-generous p-8 pb-12 border-t border-phase-surface">
            <HStack className="justify-between items-center mb-8">
              <Heading className="text-phase-text-primary text-xl">
                {t('profile.chooseTheme') || 'Choose Theme'}
              </Heading>
              <Pressable onPress={() => setShowThemeModal(false)} className="p-1">
                <Icon as={X} color="#9DA1A3" size={24} />
              </Pressable>
            </HStack>

            <VStack space="md">
              {renderThemeOption('system', Smartphone, 'System Default', 'Follow device settings')}
              {renderThemeOption('light', Sun, 'Light Mode', 'Always use light colors')}
              {renderThemeOption('dark', Moon, 'Dark Mode', 'Always use dark colors')}
              {renderThemeOption('auto', Zap, 'Auto (Time-based)', 'Changes based on time of day')}
            </VStack>

            <Text className="text-phase-text-tertiary text-xs mt-6 text-center italic">
              Auto mode adjusts theme based on time of day (evening: 8 PM - 6 AM)
            </Text>
          </Box>
        </Box>
      </Modal>
    </VStack>
  );
}
