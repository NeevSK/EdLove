import React, { useEffect, useState, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { dailyContentAPI } from '../api/dailyContent';
import type { DailyContent } from '../types';
import { useThemedColors } from '@repo/ui';
import { Theme } from '@repo/ui';
import { Text, Pressable, SkeletonCard } from '@repo/ui';

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
    const emoji = isMotivation ? '✨' : '💡';

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
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 12,
        },
        emoji: {
            fontSize: 24,
            marginRight: 8,
        },
        titleText: {
            fontSize: 16,
            fontWeight: '600',
            color: colors.text,
        },
        contentText: {
            fontSize: 15,
            lineHeight: 24,
            color: colors.textSecondary,
            marginBottom: 8,
        },
        authorText: {
            fontSize: 13,
            fontStyle: 'italic',
            color: colors.textTertiary,
            marginTop: 4,
        },
        tapToExpand: {
            fontSize: 12,
            color: colors.action,
            marginTop: 8,
            textAlign: 'center',
        },
    }), [colors]);

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
        return <SkeletonCard height={120} />;
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
        <Pressable
            onPress={() => needsExpansion && setExpanded(!expanded)}
            sx={{
                ...styles.card,
                ...(isMotivation ? styles.motivationCard : styles.didYouKnowCard),
            }}
        >
            <View style={styles.header}>
                <Text style={styles.emoji}>{emoji}</Text>
                <Text style={styles.titleText}>{title}</Text>
            </View>

            <Text style={styles.contentText}>{displayContent}</Text>

            {content.author && expanded && (
                <Text style={styles.authorText}>— {content.author}</Text>
            )}

            {needsExpansion && !expanded && (
                <Text style={styles.tapToExpand}>{t('self.tapToReadMore')}</Text>
            )}
        </Pressable>
    );
}
