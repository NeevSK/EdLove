import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface WarmMirrorCardProps {
    text: string | null;
}

/**
 * WarmMirrorCard
 * 
 * Renders the "Your Week as a Story" narrative reflection.
 */
export function WarmMirrorCard({ text }: WarmMirrorCardProps) {
    if (!text) return null;

    return (
        <View style={styles.container}>
            <Text style={styles.tag}>🌸 YOUR WEEK AS A STORY</Text>
            <Text style={styles.narrative}>
                {text}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 28,
        backgroundColor: 'rgba(139, 92, 246, 0.1)', // lotus-soft
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(139, 92, 246, 0.2)',
    },
    tag: {
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 2,
        color: '#8B5CF6',
        marginBottom: 12,
    },
    narrative: {
        fontSize: 14,
        lineHeight: 24,
        color: 'rgba(255,255,255,0.9)',
        fontStyle: 'italic',
    }
});
