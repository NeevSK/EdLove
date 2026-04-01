import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { GlassCard } from './GlassCard';
import { SanctuaryChip } from './SanctuaryChip';
import { Theme } from '../theme/Theme';
import { LucideIcon, History, Calendar, Clock, Sparkles, MessageSquare, Zap, Camera, TrendingUp } from 'lucide-react-native';
import { useManualSnapshot, useTemporalHeatmap } from '@repo/core';
import { ResonantHeatmap } from './ResonantHeatmap';
import { TouchableOpacity } from 'react-native';

export interface JourneyEvent {
    id: string;
    timestamp: string;
    type: 'mood' | 'journal' | 'growth' | 'impact' | 'system' | 'reward' | 'moment';
    title: string;
    description?: string;
    accentColor?: string;
}

interface JourneyHistoryCardProps {
    events: JourneyEvent[];
    summary?: string;
    loading?: boolean;
    scale?: 'day' | 'week' | 'month' | 'year';
}

const getEventIcon = (type: string): LucideIcon => {
    switch (type) {
        case 'mood': return Sparkles;
        case 'journal': return MessageSquare;
        case 'impact': return Zap;
        case 'growth': return Calendar;
        case 'reward': return Sparkles;
        case 'moment': return Clock;
        default: return History;
    }
};

export const JourneyHistoryCard: React.FC<JourneyHistoryCardProps> = ({ 
    events, 
    summary, 
    loading,
    scale = 'day'
}) => {
    const { takeSnapshot, isSaving } = useManualSnapshot();
    const currentYear = useMemo(() => new Date().getFullYear(), []);
    const { heatmap, isLoading: heatmapLoading } = useTemporalHeatmap(currentYear);

    if (loading) {
        return (
            <GlassCard style={styles.container}>
                <Text style={styles.loadingText}>Loading temporal history...</Text>
            </GlassCard>
        );
    }

    return (
        <GlassCard style={styles.container}>
            <View style={styles.header}>
                <View style={styles.titleRow}>
                    <History size={18} color="#F6BF8C" />
                    <Text style={styles.title}>Temporal History</Text>
                </View>
                <View style={styles.headerActions}>
                    <TouchableOpacity 
                        accessibilityRole="button" 
                        style={styles.snapshotButton}
                        onPress={() => takeSnapshot(`Snapshot: ${new Date().toLocaleDateString()}`)}
                        disabled={isSaving}
                    >
                        <Camera size={16} color={isSaving ? 'rgba(255, 255, 255, 0.2)' : '#F6BF8C'} />
                    </TouchableOpacity>
                    <SanctuaryChip 
                        label={scale.toUpperCase()} 
                        variant="tag" 
                        size="sm"
                    />
                </View>
            </View>

            {summary && <Text style={styles.summary}>{summary}</Text>}

            {scale === 'year' ? (
                <View style={styles.heatmapWrapper}>
                    <View style={styles.heatmapHeader}>
                        <TrendingUp size={14} color="#F6BF8C" />
                        <Text style={styles.heatmapTitle}>Growth Arc Intensity</Text>
                    </View>
                    <ResonantHeatmap data={heatmap} loading={heatmapLoading} />
                    <Text style={styles.heatmapSub}>Tapping a cell zooms into that temporal focus.</Text>
                </View>
            ) : (
                <View style={styles.stream}>
                    {events.length === 0 ? (
                        <Text style={styles.emptyText}>The temporal field is quiet here.</Text>
                    ) : (
                        events.map((event, index) => {
                            const Icon = getEventIcon(event.type);
                            const time = new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                            
                            return (
                                <View key={event.id} style={styles.eventItem}>
                                    <View style={styles.timeline}>
                                        <View style={[styles.dot, { backgroundColor: event.accentColor || '#F6BF8C' }]} />
                                        {index < events.length - 1 && <View style={styles.line} />}
                                    </View>
                                    <View style={styles.eventContent}>
                                        <View style={styles.eventHeader}>
                                            <View style={styles.eventTitleRow}>
                                                <Icon size={14} color={event.accentColor || '#F6BF8C'} style={{ marginRight: 6 }} />
                                                <Text style={styles.eventTitle}>{event.title}</Text>
                                            </View>
                                            <Text style={styles.eventTime}>{time}</Text>
                                        </View>
                                        {event.description && (
                                            <Text style={styles.eventDesc} numberOfLines={2}>
                                                {event.description}
                                            </Text>
                                        )}
                                    </View>
                                </View>
                            );
                        })
                    )}
                </View>
            )}
        </GlassCard>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 24,
        minHeight: 120,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    snapshotButton: {
        padding: 6,
        borderRadius: 8,
        backgroundColor: 'rgba(246, 191, 140, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(246, 191, 140, 0.2)',
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    title: {
        fontSize: 14,
        fontWeight: '800',
        color: '#F6BF8C',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    summary: {
        fontSize: 13,
        color: 'rgba(255, 255, 255, 0.6)',
        fontStyle: 'italic',
        marginBottom: 20,
    },
    stream: {
        marginTop: 8,
    },
    eventItem: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    timeline: {
        width: 20,
        alignItems: 'center',
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        zIndex: 2,
        marginTop: 6,
    },
    line: {
        width: 1,
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        position: 'absolute',
        top: 14,
        bottom: -10,
    },
    eventContent: {
        flex: 1,
        marginLeft: 12,
    },
    eventHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    eventTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    eventTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#fff',
    },
    eventTime: {
        fontSize: 11,
        color: 'rgba(255, 255, 255, 0.4)',
    },
    eventDesc: {
        fontSize: 13,
        color: 'rgba(255, 255, 255, 0.5)',
        lineHeight: 18,
    },
    loadingText: {
        color: 'rgba(255, 255, 255, 0.4)',
        textAlign: 'center',
        marginVertical: 40,
        fontStyle: 'italic',
    },
    emptyText: {
        color: 'rgba(255, 255, 255, 0.2)',
        textAlign: 'center',
        marginVertical: 20,
        fontSize: 13,
    },
    heatmapWrapper: {
        marginTop: 10,
    },
    heatmapHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 12,
    },
    heatmapTitle: {
        fontSize: 12,
        fontWeight: '700',
        color: 'rgba(255, 255, 255, 0.6)',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    heatmapSub: {
        fontSize: 11,
        color: 'rgba(255, 255, 255, 0.3)',
        marginTop: 12,
        fontStyle: 'italic',
    }
});
