import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Rocket } from 'lucide-react-native';
import { Theme } from '@repo/ui';

/**
 * GenesisNode
 * 
 * A specialized marker that signals the beginning of a user's journey.
 */
export const GenesisNode: React.FC<{ timestamp: string }> = ({ timestamp }) => {
    return (
        <View style={styles.container}>
            <View style={styles.pathContainer}>
                <View style={styles.node}>
                    <Rocket size={16} color="#F6BF8C" />
                </View>
                <View style={styles.line} />
            </View>

            <View style={styles.content}>
                <Text style={styles.title}>JOURNEY STARTS HERE</Text
                <Text style={styles.subtitle}>
                    {new Date(timestamp).toLocaleDateString(undefined, { 
                        month: 'long', 
                        day: 'numeric', 
                        year: 'numeric' 
                    })}
                </Text>
                <Text style={styles.body}>
                    The first pulse of your temporal resonance. Every step from here builds your story.
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        minHeight: 120,
    },
    pathContainer: {
        width: 40,
        alignItems: 'center',
    },
    node: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(246, 191, 140, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#F6BF8C',
        zIndex: 2,
    },
    line: {
        width: 2,
        flex: 1,
        backgroundColor: 'rgba(246, 191, 140, 0.2)',
        zIndex: 1,
    },
    content: {
        flex: 1,
        paddingTop: 4,
        paddingLeft: 12,
    },
    title: {
        fontSize: 16,
        fontWeight: '900',
        color: '#F6BF8C',
        letterSpacing: 2,
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 12,
        fontWeight: '600',
        color: 'rgba(255, 255, 255, 0.4)',
        marginBottom: 8,
    },
    body: {
        fontSize: 13,
        color: 'rgba(255, 255, 255, 0.6)',
        lineHeight: 20,
        fontStyle: 'italic',
    }
});
