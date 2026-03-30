import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Flower2 } from 'lucide-react-native';
import { Theme, useThemedColors } from '@repo/ui';
import { useTranslation } from 'react-i18next';

interface ThuthimalBadgeProps {
    gifterName?: string;
    giftedAt?: string;
    compact?: boolean; // Compact mode for smaller displays
}

/**
 * ThuthimalBadge Component
 * 
 * Displays the Thuthimal (\u0DAD\u0DD4\u0DAD\u0DD2\u0DB8\u0DBD\u0DCA) "Flower of Gratitude" badge
 * when a user's Pro subscription is gifted by someone else.
 * 
 * Design: Elegant, warm, honoring - not flashy
 */
export default function ThuthimalBadge({ gifterName = 'Anonymous', giftedAt, compact = false }: ThuthimalBadgeProps) {
    const colors = useThemedColors();
    const { t, i18n } = useTranslation();

    const displayName = gifterName || 'Anonymous';

    if (compact) {
        // Compact version for Profile screen header
        return (
            <View style={styles.compactContainer}>
                <Flower2 size={16} color={Theme.colors.sanctuarySaffron} />
                <Text style={styles.compactText}>
                    {t('thuthimalBadge.sinhala')}
                </Text>
            </View>
        );
    }

    // Full version for Self screen
    return (
        <View style={[styles.container, {
            backgroundColor: colors.secondary,
            borderColor: colors.border,
            shadowColor: colors.glow,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.5,
            shadowRadius: 15,
            elevation: 5,
            borderLeftColor: Theme.colors.sanctuarySaffron,
        }]}>
            {/* Icon and Title Row */}
            <View style={styles.header}>
                <Flower2 size={24} color={Theme.colors.sanctuarySaffron} />
                <Text style={styles.title}>{t('thuthimalBadge.title')}</Text
                ><Text style={styles.sinhala}>{t('thuthimalBadge.sinhala')}</Text
            ></View>

            {/* Message */}
            <View style={styles.messageContainer}>
                <Text style={styles.messageLabel}>{t('thuthimalBadge.giftedBy')}</Text
                ><Text style={styles.gifterName}>{displayName}</Text
            ></View>

            {/* Meaning */}
            <Text style={styles.meaning}>
                {t('thuthimalBadge.meaning')}
            </Text>

            {/* Date if provided */}
            {giftedAt && (
                <Text style={styles.date}>
                    {t('thuthimalBadge.giftedOn', { date: new Date(giftedAt).toLocaleDateString(i18n.language, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    }) })}
                </Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    // Full version styles
    container: {
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        borderLeftWidth: 4,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
        color: Theme.colors.inkTruth,
        marginLeft: 8,
        marginRight: 8,
        fontFamily: 'System',
    },
    sinhala: {
        fontSize: 18,
        fontWeight: '500',
        color: Theme.colors.sanctuarySaffron,
        fontFamily: 'System',
    },
    messageContainer: {
        backgroundColor: 'rgba(230, 126, 34, 0.1)', // Soft saffron tint
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
    },
    messageLabel: {
        fontSize: 13,
        color: Theme.colors.mistGray,
        marginBottom: 4,
        fontFamily: 'System',
    },
    gifterName: {
        fontSize: 18,
        fontWeight: '600',
        color: Theme.colors.sanctuarySaffron,
        fontFamily: 'System',
    },
    meaning: {
        fontSize: 13,
        fontStyle: 'italic',
        color: Theme.colors.mistGray,
        lineHeight: 18,
        marginBottom: 8,
        fontFamily: 'System',
    },
    date: {
        fontSize: 12,
        color: Theme.colors.starlightGray,
        textAlign: 'right',
        fontFamily: 'System',
    },

    // Compact version styles
    compactContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(224, 122, 95, 0.15)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(224, 122, 95, 0.3)',
    },
    compactText: {
        fontSize: 13,
        fontWeight: '600',
        color: Theme.colors.sanctuarySaffron,
        marginLeft: 6,
        fontFamily: 'System',
    },
});
