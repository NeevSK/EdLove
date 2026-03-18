import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Sparkles, Plus } from 'lucide-react-native';
import { Theme } from '@repo/ui';

interface SpotlightEmptyProps {
    date: string;
    onAction?: () => void;
}

/**
 * SpotlightEmpty
 * 
 * An encouraging view for dates with no resonance data.
 */
export const SpotlightEmpty: React.FC<SpotlightEmptyProps> = ({ date, onAction }) => {
    return (
        <View style={styles.container}>
            <View style={styles.iconContainer}>
                <Sparkles size={40} color="rgba(246, 191, 140, 0.3)" />
            </View>
            
            <Text style={styles.title}>QUIET RESONANCE</Text>
            <Text style={styles.subtitle}>
                No whispers from the past on {new Date(date).toLocaleDateString()}.
            </Text>
            
            <Text style={styles.description}>
                Every quiet moment is a canvas. Start a new thread in your journey today.
            </Text>

            <TouchableOpacity style={styles.button} onPress={onAction}>
                <Plus size={18} color="#000" />
                <Text style={styles.buttonText}>CREATE RESONANCE</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
        minHeight: 400,
    },
    iconContainer: {
        marginBottom: 24,
        padding: 24,
        borderRadius: 40,
        backgroundColor: 'rgba(246, 191, 140, 0.05)',
    },
    title: {
        fontSize: 18,
        fontWeight: '900',
        color: '#F6BF8C',
        letterSpacing: 4,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.5)',
        textAlign: 'center',
        marginBottom: 16,
    },
    description: {
        fontSize: 13,
        color: 'rgba(255, 255, 255, 0.3)',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 32,
        fontStyle: 'italic',
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F6BF8C',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 24,
    },
    buttonText: {
        fontSize: 12,
        fontWeight: '800',
        color: '#000',
        marginLeft: 8,
        letterSpacing: 1,
    }
});
