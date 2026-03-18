import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { MessageSquare, Heart, Star } from 'lucide-react-native';
import { Theme } from '@repo/ui';


interface TimelineEventProps {
    type: 'mood' | 'journal' | 'growth' | 'path';
    title: string;
    content?: string;
    timestamp: string;
    intensity: number;
    isLast?: boolean;
}

/**
 * TimelineEvent
 * 
 * A high-fidelity card representing a single node in the user's journey.
 */
export const TimelineEvent: React.FC<TimelineEventProps> = ({ 
    type, title, content, timestamp, intensity, isLast 
}) => {
    const Icon = type === 'mood' ? Heart : type === 'journal' ? MessageSquare : Star;
    const color = type === 'mood' ? '#FF6B6B' : type === 'journal' ? '#4D96FF' : '#F6BF8C';

    return (
        <View style={styles.container}>
            {/* The Connecting Path */}
            <View style={styles.pathContainer}>
                <View style={[styles.node, { backgroundColor: color, opacity: intensity }]} />
                {!isLast && <View style={[styles.line, { backgroundColor: color, opacity: 0.2 }]} />}
            </View>

            {/* The Event Card */}
            <View style={styles.content}>
                <View style={styles.header}>
                    <Icon size={14} color={color} />
                    <Text style={styles.time}>{new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                </View>
                <Text style={styles.title}>{title}</Text>
                {content && <Text style={styles.body} numberOfLines={2}>{content}</Text>}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        minHeight: 80,
    },
    pathContainer: {
        width: 40,
        alignItems: 'center',
    },
    node: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginTop: 6,
        zIndex: 2,
    },
    line: {
        width: 2,
        flex: 1,
        zIndex: 1,
    },
    content: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 16,
        padding: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    time: {
        fontSize: 10,
        color: 'rgba(255, 255, 255, 0.4)',
        fontWeight: '700',
    },
    title: {
        fontSize: 14,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 4,
    },
    body: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.6)',
        lineHeight: 18,
    }
});
