import React, { useEffect, useState, useMemo } from 'react';
import { View, StyleSheet, PressableStateCallbackType } from 'react-native';
import { useTranslation } from 'react-i18next';
import { dailyContentAPI } from '../api/dailyContent';
import { DailyContent } from '../types';
import { useThemedColors } from '@repo/ui';
import { Theme } from '@repo/ui';
import { Box, VStack, HStack, Text, Heading, Pressable } from '@repo/ui';
import { SkeletonCard } from '@repo/ui';

interface DailyContentCardProps {
    type: 'motivation' | 'did_you_know';
}

export default function DailyContentCard({ type }: DailyContentCardProps) {
    const { t } = useTranslation();
    const colors = useThemedColors();
    const [content, setContent] = useState<DailyContent | null>(null);
    const [expanded, setExpanded] = useState(false);
    const [loading, setLoading] = useState(true);

    const isMotivation = type === 'motivation';
    const title = isMotivation ? t('self.dailyMotivation') : t('self.didYouKnow');
    const emoji = isMotivation ? '\u2728' : '\uD83D\uDCA1';

    const styles = useMemo(() => StyleSheet.create({
        card: {
            padding: 16,
            borderRadius: Theme.corners.comfortable,
            marginBottom: 12,
            ...Theme.shadows.sm,
        },
        motivationCard: {
            backgroundColor: colors.secondary,
            borderLeftWidth: 4,
            borderLeftColor: colors.action,
        },
        didYouKnowCard: {
            backgroundColor: colors.tertiary,
            borderLeftWidth: 4,
            borderLeftColor: colors.success,
        },
        loadingCard: {
            backgroundColor: colors.secondary,
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 100,
        },
        cardPressed: {
            opacity: 0.8,
            transform: [{ scale: 0.98 }],
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 12,
        },
        emoji: {
            fontSize: 24,
            marginRight: 8,
        },
        title: {
            fontSize: 16,
            fontWeight: '600',
            color: colors.text,
            fontFamily: 'System',
        },
        content: {
            fontSize: 15,
            lineHeight: 24,
            color: colors.textSecondary,
            marginBottom: 8,
            fontFamily: 'System',
        },
        author: {
            fontSize: 13,
            fontStyle: 'italic',
            color: colors.textTertiary,
            marginTop: 4,
            fontFamily: 'System',
        },
        tapToExpand: {
            fontSize: 12,
            color: colors.action,
            marginTop: 8,
            textAlign: 'center',
            fontFamily: 'System',
        },
        loadingText: {
            fontSize: 14,
            color: colors.textTertiary,
            fontFamily: 'System',
        },
    }), [colors]);

    useEffect(() => {
        loadContent();
    }, [type]);

    const loadContent = async () => {
        try {
            setLoading(true);
            const result = await dailyContentAPI.getTodaysContent();
            setContent(type === 'motivation' ? result.motivation : result.didYouKnow);
        } catch (error) {
            console.error('Failed to load daily content:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <SkeletonCard height={120} />
        );
    }

    if (!content) {
        return null;
    }

    // Truncate content if not expanded
    const displayContent = expanded || content.content.length <= 120
        ? content.content
        : `${content.content.substring(0, 120)}...`;

    const needsExpansion = content.content.length > 120;

    return (
        <Pressable>
            onPress={() => needsExpansion && setExpanded(!expanded)}
            style={({ pressed }: PressableStateCallbackType) => [
                styles.card,
                isMotivation ? styles.motivationCard : styles.didYouKnowCard,
                pressed && styles.cardPressed,
            ]}
        
            <View style={styles.header}>
                <Text style={styles.emoji}>{emoji}</Text
                ><Text style={styles.title}>{title}</Text
            ></View>

            <Text style={styles.content}>{displayContent}</Text

            {content.author && (
                <Text style={styles.author}>\u2014 {content.author}</Text
            >)}

            {needsExpansion && !expanded && (
                <Text style={styles.tapToExpand}>{t('self.tapToReadMore')}</Text
            >)}
        </Pressable>
    );
}
