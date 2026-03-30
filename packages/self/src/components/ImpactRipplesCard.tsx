import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { ImpactRipple } from '@repo/core';

interface ImpactRipplesCardProps {
    ripples: ImpactRipple[];
}

/**
 * ImpactRipplesCard
 * 
 * Renders pending Impact Ripple notifications from the community.
 */
export function ImpactRipplesCard({ ripples }: ImpactRipplesCardProps) {
    if (!ripples.length) return null;

    return (
        <View style={styles.container}
            <Text style={styles.tag}>\uD83D\uDCA7 IMPACT RIPPLES</Text
            <View style={styles.list}
                {ripples.map(r => (
                    <View key={r.id} style={styles.rippleItem}
                        <Text style={styles.message}
                            {r.warm_message_en ?? r.ripple_type}
                        </Text
                    </View
                ))}
            </View
        </View
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 24,
        backgroundColor: 'rgba(58, 122, 154, 0.1)', // water-soft
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(58, 122, 154, 0.2)',
    },
    tag: {
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 2,
        color: '#3A7A9A',
        marginBottom: 12,
    },
    list: {
        gap: 10,
    },
    rippleItem: {
        padding: 12,
        paddingHorizontal: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 10,
    },
    message: {
        fontSize: 13,
        lineHeight: 20,
        color: 'rgba(255,255,255,0.9)',
    }
});
