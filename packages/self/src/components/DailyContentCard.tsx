/**
 * DAILY CONTENT CARD
 * Renders motivation or trivia snippets for the mobile platform.
 * Standardized to Zero-Legacy: purged corrupted StyleSheet and migrated to NativeWind v4.
 */

import React, { useEffect, useState, useMemo } from 'react';
import { 
    Box, 
    Text, 
    VStack, 
    HStack, 
    Pressable, 
    Heading, 
    Icon,
    SkeletonCard 
} from '@repo/ui';
import { Sparkles, Lightbulb, User, ChevronDown, ChevronUp } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { dailyContentAPI } from '../api/dailyContent';
import type { DailyContent } from '../types/Wellbeing';
import Animated, { FadeIn, Layout } from 'react-native-reanimated';

interface DailyContentCardProps {
    type: 'motivation' | 'did_you_know';
}

export default function DailyContentCard({ type }: DailyContentCardProps) {
    const { t } = useTranslation();
    const [content, setContent] = useState<DailyContent | null>(null);
    const [expanded, setExpanded] = useState(false);
    const [loading, setLoading] = useState(true);

    const isMotivation = type === 'motivation';
    const title = isMotivation ? t('self.dailyMotivation') || 'Daily Motivation' : t('self.didYouKnow') || 'Did You Know?';
    const icon = isMotivation ? Sparkles : Lightbulb;
    
    const accentColorClass = isMotivation ? 'text-sanctuarySaffron' : 'text-emeraldGreen';
    const borderClass = isMotivation ? 'border-l-sanctuarySaffron' : 'border-l-emeraldGreen';
    const bgClass = isMotivation ? 'bg-sanctuarySaffron/5' : 'bg-emeraldGreen/5';

    useEffect(() => {
        const loadContent = async () => {
            try {
                setLoading(true);
                const result = await dailyContentAPI.getTodaysContent();
                if (result) {
                    setContent(type === 'motivation' ? result.motivation : result.didYouKnow);
                }
            } catch (error) {
                console.error('Failed to load daily content:', error);
            } finally {
                setLoading(false);
            }
        };
        loadContent();
    }, [type]);

    if (loading) {
        return <SkeletonCard className="h-32 mb-4" />;
    }

    if (!content) {
        return null;
    }

    const needsExpansion = content.content.length > 120;

    return (
        <Animated.View layout={Layout} entering={FadeIn.duration(800)}>
            <Pressable
                onPress={() => needsExpansion && setExpanded(!expanded)}
                className={`p-xl rounded-3xl border-l-4 border-y border-r border-white/5 shadow-sm transition-all active:scale-[0.98] ${bgClass} ${borderClass}`}
            >
                <VStack className="gap-4">
                    {/* Header */}
                    <HStack className="items-center justify-between">
                        <HStack className="items-center gap-2">
                            <Box className={`p-2 rounded-full ${bgClass.replace('/5', '/10')}`}>
                                <Icon as={icon} size={14} className={accentColorClass} />
                            </Box>
                            <Heading size="xs" className={`${accentColorClass} uppercase tracking-[0.2em] font-black`}>
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
                            <Text className={`${accentColorClass} text-[10px] font-black uppercase tracking-widest text-center`}>
                                {t('self.tapToReadMore') || 'Tap to Expand Bloom'}
                            </Text>
                        </Box>
                    )}
                </VStack>
            </Pressable>
        </Animated.View>
    );
}
