/**
 * DAILY CONTENT CARD
 * Renders motivation or trivia snippets for the mobile platform.
 * Standardized to Zero-Legacy: purged corrupted StyleSheet and migrated to NativeWind v4.
 */

import { dailyContentAPI } from '@repo/self/api/dailyContent';
import type { DailyContent } from '@repo/self/types/Wellbeing';
import { SkeletonCard } from '@repo/ui/components/SkeletonLoader';
import { ChevronDown, ChevronUp, Lightbulb, Sparkles, User } from '@repo/ui/icons';
import {
  Box,
  Button,
  ButtonText,
  Heading,
  HStack,
  Icon,
  Pressable,
  Text,
  VStack,
} from '@repo/ui/primitives';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Animated, { FadeIn, Layout } from 'react-native-reanimated';

interface DailyContentCardProps {
  type: 'motivation' | 'did_you_know';
}

export default function DailyContentCard({ type }: DailyContentCardProps) {
  const { t } = useTranslation();
  const [content, setContent] = useState<DailyContent | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  const isMotivation = type === 'motivation';
  const title = isMotivation
    ? t('self.dailyMotivation') || 'Daily Motivation'
    : t('self.didYouKnow') || 'Did You Know?';
  const icon = isMotivation ? Sparkles : Lightbulb;

  const accentColorClass = isMotivation ? 'text-sanctuarySaffron' : 'text-emeraldGreen';
  const borderClass = isMotivation ? 'border-l-sanctuarySaffron' : 'border-l-emeraldGreen';
  const bgClass = isMotivation ? 'bg-sanctuarySaffron/5' : 'bg-emeraldGreen/5';

  useEffect(() => {
    const loadContent = async () => {
      try {
        setLoading(true);
        setLoadError(false);
        const result = await dailyContentAPI.getTodaysContent();
        if (result) {
          setContent(type === 'motivation' ? result.motivation : result.didYouKnow);
        }
      } catch (error) {
        console.error('Failed to load daily content:', error);
        setLoadError(true);
      } finally {
        setLoading(false);
      }
    };
    loadContent();
  }, [retryKey, type]);

  if (loading) {
    return <SkeletonCard className="h-32 mb-4" />;
  }

  if (loadError) {
    return (
      <VStack className="gap-3 p-5 mb-4 rounded-3xl border border-sanctuary-error/30 bg-sanctuary-error/10">
        <Text className="text-sanctuary-text font-bold">Daily content is unavailable.</Text>
        <Button
          variant="outline"
          onPress={() => setRetryKey((key) => key + 1)}
          accessibilityLabel={`Retry loading ${title}`}
        >
          <ButtonText>Try again</ButtonText>
        </Button>
      </VStack>
    );
  }

  if (!content) {
    return null;
  }

  const needsExpansion = content.content.length > 120;

  return (
    <Animated.View layout={Layout} entering={FadeIn.duration(800)}>
      <Pressable
        onPress={() => needsExpansion && setExpanded(!expanded)}
        accessibilityRole={needsExpansion ? 'button' : undefined}
        accessibilityLabel={needsExpansion ? `${title}: ${content.content}` : title}
        accessibilityHint={
          needsExpansion ? (expanded ? 'Collapses content' : 'Expands content') : undefined
        }
        accessibilityState={needsExpansion ? { expanded } : undefined}
        className={`p-xl rounded-3xl border-l-4 border-y border-r border-white/5 shadow-sm transition-all active:scale-[0.98] ${bgClass} ${borderClass}`}
      >
        <VStack className="gap-4">
          {/* Header */}
          <HStack className="items-center justify-between">
            <HStack className="items-center gap-2">
              <Box className={`p-2 rounded-full ${bgClass.replace('/5', '/10')}`}>
                <Icon as={icon} size={14} className={accentColorClass} />
              </Box>
              <Heading
                size="xs"
                className={`${accentColorClass} uppercase tracking-[0.2em] font-black`}
              >
                {title}
              </Heading>
            </HStack>

            {needsExpansion && (
              <Icon
                as={expanded ? ChevronUp : ChevronDown}
                size={14}
                className="text-mistGray/30"
              />
            )}
          </HStack>

          {/* Content */}
          <VStack className="gap-2">
            <Text
              className="text-sacredWhite/80 text-base leading-relaxed italic font-medium"
              numberOfLines={expanded ? undefined : 3}
            >
              "{content.content}"
            </Text>

            {content.author && expanded && (
              <HStack className="items-center gap-2 mt-2 opacity-60">
                <Icon as={User} size={10} className="text-mistGray" />
                <Text className="text-mistGray text-[10px] uppercase font-black tracking-widest italic">
                  — {content.author}
                </Text>
              </HStack>
            )}
          </VStack>

          {needsExpansion && !expanded && (
            <Box className="mt-2 border-t border-white/5 pt-3">
              <Text
                className={`${accentColorClass} text-[10px] font-black uppercase tracking-widest text-center`}
              >
                {t('self.tapToReadMore') || 'Tap to Expand Bloom'}
              </Text>
            </Box>
          )}
        </VStack>
      </Pressable>
    </Animated.View>
  );
}
