import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { dailyContentAPI, DailyContent } from '../../lib/api/dailyContent';
import { themeColors } from '../../utils/themeColors';

interface DailyContentCardProps {
    type: 'motivation' | 'did_you_know';
}

export default function DailyContentCard({ type }: DailyContentCardProps) {
    const [content, setContent] = useState<DailyContent | null>(null);
    const [expanded, setExpanded] = useState(false);
    const [loading, setLoading] = useState(true);

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
            <View style={[styles.card, styles.loadingCard]}>
                <Text style={styles.loadingText}>Loading...</Text>
            </View>
        );
    }

    if (!content) {
        return null;
    }

    const isMotivation = type === 'motivation';
    const title = isMotivation ? '✨ Daily Motivation' : '💡 Did You Know?';
    const emoji = isMotivation ? '✨' : '💡';

    // Truncate content if not expanded
    const displayContent = expanded || content.content.length <= 120
        ? content.content
        : `${content.content.substring(0, 120)}...`;

    const needsExpansion = content.content.length > 120;

    return (
        <Pressable
            onPress={() => needsExpansion && setExpanded(!expanded)}
            style={({ pressed }) => [
                styles.card,
                isMotivation ? styles.motivationCard : styles.didYouKnowCard,
                pressed && styles.cardPressed,
            ]}
        >
            <View style={styles.header}>
                <Text style={styles.emoji}>{emoji}</Text>
                <Text style={styles.title}>{title}</Text>
            </View>
            
            <Text style={styles.content}>{displayContent}</Text>
            
            {content.author && (
                <Text style={styles.author}>— {content.author}</Text>
            )}
            
            {needsExpansion && !expanded && (
                <Text style={styles.tapToExpand}>Tap to read more</Text>
            )}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    card: {
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    motivationCard: {
        backgroundColor: '#FFF9F0', // Warm cream
        borderLeftWidth: 4,
        borderLeftColor: themeColors.primary, // Ember orange
    },
    didYouKnowCard: {
        backgroundColor: '#F0F7F4', // Soft sage
        borderLeftWidth: 4,
        borderLeftColor: themeColors.secondary, // Sage green
    },
    loadingCard: {
        backgroundColor: '#F5F5F5',
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
        color: '#2C3E50',
        fontFamily: 'System',
    },
    content: {
        fontSize: 15,
        lineHeight: 24,
        color: '#34495E',
        marginBottom: 8,
        fontFamily: 'System',
    },
    author: {
        fontSize: 13,
        fontStyle: 'italic',
        color: '#7F8C8D',
        marginTop: 4,
        fontFamily: 'System',
    },
    tapToExpand: {
        fontSize: 12,
        color: themeColors.primary,
        marginTop: 8,
        textAlign: 'center',
        fontFamily: 'System',
    },
    loadingText: {
        fontSize: 14,
        color: '#95A5A6',
        fontFamily: 'System',
    },
});
