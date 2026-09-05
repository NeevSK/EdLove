import { Box, HStack, Pressable, Text } from '@repo/ui/primitives';
import { getTouchHitSlop } from '@repo/ui/utils';
import { hapticLight } from '@repo/ui/utils/haptics';
import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

export interface LanguageOption {
  readonly code: string;
  readonly label: string;
}

export const DEFAULT_SANCTUARY_LANGUAGES: readonly LanguageOption[] = [
  { code: 'en', label: 'English' },
  { code: 'si', label: 'Sinhala' },
  { code: 'ta', label: 'Tamil' },
] as const;

export interface LanguageSwitcherProps {
  currentLanguage?: string;
  languages?: readonly LanguageOption[];
  onSelectLanguage?: (code: string) => void;
  className?: string;
}

export const LanguageSwitcher = memo(
  ({
    currentLanguage,
    languages = DEFAULT_SANCTUARY_LANGUAGES,
    onSelectLanguage,
    className = '',
  }: LanguageSwitcherProps) => {
    const { t, i18n } = useTranslation();
    const activeLang = currentLanguage || i18n.language || 'en';

    const handlePress = useCallback(
      (code: string) => {
        hapticLight();
        if (onSelectLanguage) {
          onSelectLanguage(code);
        } else {
          void i18n.changeLanguage(code);
        }
      },
      [i18n, onSelectLanguage],
    );

    return (
      <HStack
        className={`bg-phase-surface/80 rounded-full p-1 border border-phase-border/40 shadow-sm backdrop-blur-md ${className}`}
      >
        {languages.map((lang) => {
          const isActive = activeLang.startsWith(lang.code);
          return (
            <Pressable
              key={lang.code}
              onPress={() => handlePress(lang.code)}
              hitSlop={getTouchHitSlop(36, 36)}
              accessibilityRole="button"
              accessibilityLabel={t('accessibility.switchLanguage', {
                lang: lang.label,
                defaultValue: `Switch language to ${lang.label}`,
              })}
              accessibilityState={{ selected: isActive }}
              className={`min-w-[38px] h-[36px] px-2.5 rounded-full justify-center items-center transition-colors ${
                isActive ? 'bg-phase-accent shadow-sm' : 'bg-transparent'
              }`}
            >
              <Text
                className={`text-sm font-semibold tracking-wide ${
                  isActive ? 'text-white' : 'text-phase-text-secondary'
                }`}
              >
                {lang.code.toUpperCase()}
              </Text>
            </Pressable>
          );
        })}
      </HStack>
    );
  },
);

LanguageSwitcher.displayName = 'LanguageSwitcher';

export default LanguageSwitcher;
