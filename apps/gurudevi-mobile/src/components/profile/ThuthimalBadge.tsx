import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Flower2 } from 'lucide-react-native';
import { Theme } from '@repo/ui';

interface ThuthimalBadgeProps {
    gifterName?: string;
    giftedAt?: string;
    compact?: boolean; // Compact mode for smaller displays
}

/**
 * ThuthimalBadge Component
 * 
 * Displays the Thuthimal (තුතිමල්) "Flower of Gratitude" badge
 * when a user's Pro subscription is gifted by someone else.
 * 
 * Design: Elegant, warm, honoring - not flashy
 */
export default function ThuthimalBadge({ gifterName = 'Anonymous', giftedAt, compact = false }: ThuthimalBadgeProps) {
    const displayName = gifterName || 'Anonymous';

    if (compact) {
        // Compact version for Profile screen header
        return (
            <View style={styles.compactContainer}>
                <Flower2 size={16} color={Theme.colors.sanctuarySaffron} />
                <Text style={styles.compactText}>
                    තුතිමල්
                </Text>
            </View>
        );
    }

    // Full version for Self screen
    return (
        <View style={styles.container}>
            {/* Icon and Title Row */}
            <View style={styles.header}>
                <Flower2 size={24} color={Theme.colors.sanctuarySaffron} />
                <Text style={styles.title}>Thuthimal</Text>
                <Text style={styles.sinhala}>තුතිමල්</Text>
            </View>

            {/* Message */}
            <View style={styles.messageContainer}>
                <Text style={styles.messageLabel}>Your Pro subscription is a gift of gratitude from:</Text>
                <Text style={styles.gifterName}>{displayName}</Text>
            </View>

            {/* Meaning */}
            <Text style={styles.meaning}>
                තුතිමල් (Thuthimal) means "Flower of Gratitude" — honoring the sacred work of teaching
            </Text>

            {/* Date if provided */}
            {giftedAt && (
                <Text style={styles.date}>
                    Gifted on {new Date(giftedAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                    })}
                </Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    // Full version styles
    container: {
        backgroundColor: Theme.colors.lotusWhite, // Warm cream, same as motivation cards
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        borderLeftWidth: 4,
        borderLeftColor: Theme.colors.sanctuarySaffron,
        shadowColor: Theme.colors.shadowDark,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
        color: Theme.colors.charcoalTruth,
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
        color: Theme.colors.pearlGray,
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
