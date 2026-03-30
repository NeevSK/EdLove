import React from 'react';
import { View, StyleSheet, ScrollView, Text, ActivityIndicator } from 'react-native';
import { useJourneyData } from '../hooks/useJourneyData';
import { TimelineEvent } from './TimelineEvent';
import { GenesisNode } from './GenesisNode';

import { useTemporalStore } from '@repo/core';
import { Theme } from '@repo/ui';


/**
 * ResonanceTimeline
 * 
 * The visual manifestation of the Journey Path.
 * Can be used as a standalone view or filtered within a feature.
 */
export const ResonanceTimeline: React.FC = () => {
    const { journey, loading } = useJourneyData();
    const { viewScale, viewDate } = useTemporalStore();

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator color={Theme.colors.resonance.present} />
                <Text style={styles.loadingText}>Synthesizing Journey Path...</Text
            ></View>
        );
    }

    if (journey.length === 0) {
        return (
            <View style={styles.center}>
                <Text style={styles.emptyText}>No resonance data found for this period.</Text
            ></View>
        );
    }

    return (
        <ScrollView >
            style={styles.container} 
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
        
            <View style={styles.header}>
                <Text style={styles.dateLabel}>{viewDate}</Text
                ><Text style={styles.scaleLabel}>{viewScale.toUpperCase()} JOURNEY</Text
            ></View>

            {journey.map((event, index: number) => (
                event.type === 'path' ? (
                    <GenesisNode key={event.id} timestamp={event.timestamp} />
                ) : (
                    <TimelineEvent>
                        key={event.id}
                        type={event.type as any}
                        title={event.title}
                        content={event.content}
                        timestamp={event.timestamp}
                        intensity={event.intensity}
                        isLast={index === journey.length - 1}
                    /
                )
            ))}

        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    contentContainer: {
        paddingVertical: 24,
        paddingHorizontal: 16,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 200,
    },
    loadingText: {
        marginTop: 12,
        color: 'rgba(255, 255, 255, 0.4)',
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 1,
    },
    emptyText: {
        color: 'rgba(255, 255, 255, 0.3)',
        fontSize: 14,
        fontStyle: 'italic',
    },
    header: {
        marginBottom: 32,
        alignItems: 'center',
    },
    dateLabel: {
        fontSize: 24,
        fontWeight: '800',
        color: '#fff',
        marginBottom: 4,
    },
    scaleLabel: {
        fontSize: 10,
        fontWeight: '700',
        color: '#F6BF8C',
        letterSpacing: 2,
    }
});
