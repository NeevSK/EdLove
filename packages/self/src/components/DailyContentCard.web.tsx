/**
 * DAILY CONTENT CARD (Web)
 * Renders motivation or trivia snippets for the web platform.
 * Standardized to Zero-Legacy: purged raw HTML/inline styles and fixed syntax corruption in style objects.
 */

import React, { useState, useEffect } from 'react';
import { 
    Box, 
    Text, 
    VStack, 
    HStack, 
    Pressable, 
    Icon,
    Spinner 
} from '@repo/ui';
import { Sparkles, Lightbulb, User } from 'lucide-react-native';
import { dailyContentAPI } from '../api/dailyContent';
import type { DailyContent } from '../types/Wellbeing';
import Animated, { FadeIn, Layout } from 'react-native-reanimated';

interface DailyContentCardProps {
    type: 'motivation' | 'did_you_know';
}

export default function DailyContentCard({ type }: DailyContentCardProps) {
    const [content, setContent] = useState<DailyContent | null>(null);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(false);

    const isMotivation = type === 'motivation';
    const title = isMotivation ? 'Daily Motivation' : 'Did You Know?';
    const icon = isMotivation ? Sparkles : Lightbulb;
    const accentColorClass = isMotivation ? 'text-sanctuarySaffron' : 'text-emeraldGreen';
    const borderClass = isMotivation ? 'border-l-sanctuarySaffron' : 'border-l-emeraldGreen';

    useEffect(() => {
        dailyContentAPI.getTodaysContent()
            .then(c => {
                setContent(isMotivation ? c?.motivation : c?.didYouKnow);
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [type, isMotivation]);

    if (loading) {
        return (
            <Box className="h-[72px] bg-white/5 rounded-2xl items-center justify-center border border-white/5">
                <Spinner size="small" className="text-mistGray/30" />
            </Box>
        );
    }

    if (!content) return null;

    return (
        <Animated.View layout={Layout} entering={FadeIn.duration(800)}>
            <Pressable
                onPress={() => setExpanded(v => !v)}
                className={`p-xl bg-white/5 rounded-2xl border-l-4 border-y border-r border-white/5 transition-all active:scale-[0.99] ${borderClass}`}
            >
                <VStack className="gap-3">
                    <HStack className="items-center gap-2">
                        <Icon as={icon} size={14} className={accentColorClass} />
                        <Text className={`text-[10px] font-black uppercase tracking-[0.2em] ${accentColorClass}`}>
                            {title}
                        </Text>
                    </HStack>

                    <Text 
                        className="text-sacredWhite/80 text-sm leading-relaxed italic font-medium"
                        numberOfLines={expanded ? undefined : 2}
                    >
                        "{content.content}"
                    </Text>

                    {content.author && expanded && (
                        <Animated.View entering={FadeIn.duration(400)}>
                            <HStack className="items-center gap-2 mt-2 opacity-50">
                                <Icon as={User} size={10} className="text-mistGray" />
                                <Text className="text-mistGray text-[10px] font-bold italic">
                                    — {content.author}
                                </Text>
                            </HStack>
                        </Animated.View>
                    )}

                    {!expanded && (
                        <Box className="mt-1">
                            <Text className="text-mistGray/20 text-[8px] uppercase font-black tracking-widest">
                                Tap to expand
                            </Text>
                        </Box>
                    )}
                </VStack>
            </Pressable>
        </Animated.View>
    );
}
