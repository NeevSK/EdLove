import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { historyAPI, AuditLogEntry } from '@repo/core';

interface HistoryTimelineProps {
    tableName: string;
    recordId: string;
}

export const HistoryTimeline: React.FC<HistoryTimelineProps> = ({ tableName, recordId }) => {
    const [history, setHistory] = useState<AuditLogEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                setLoading(true);
                const data = await historyAPI.getForRecord(tableName, recordId);
                setHistory(data);
            } catch (err: any) {
                setError(err.message || 'Failed to load history');
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [tableName, recordId]);

    if (loading) return <ActivityIndicator size="small" color="#666" />;
    if (error) return <Text style={styles.error}>{error}</Text>;
    if (history.length === 0) return <Text style={styles.empty}>No history found for this item.</Text>;

    return (
        <ScrollView style={styles.container}
            {history.map((entry, index) => (
                <View key={entry.id} style={styles.entry}
                    <View style={styles.line} /
                    <View style={styles.dot} /
                    <View style={styles.content}
                        <Text style={styles.action}
                            {entry.action} by {entry.author?.full_name || 'System'}
                        </Text
                        <Text style={styles.date}
                            {new Date(entry.changed_at).toLocaleString()}
                        </Text
                        {entry.action === 'UPDATE' && (
                            <Text style={styles.changes}
                                Content changed
                            </Text
                        )}
                    </View
                </View
            ))}
        </ScrollView
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    entry: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    line: {
        position: 'absolute',
        left: 3,
        top: 20,
        bottom: -20,
        width: 1,
        backgroundColor: '#DDD',
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#666',
        marginTop: 6,
        marginRight: 16,
    },
    content: {
        flex: 1,
    },
    action: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    date: {
        fontSize: 12,
        color: '#999',
        marginTop: 2,
    },
    changes: {
        fontSize: 13,
        color: '#666',
        marginTop: 4,
        fontStyle: 'italic',
    },
    error: {
        color: '#FF3B30',
        padding: 16,
    },
    empty: {
        color: '#666',
        padding: 16,
        fontStyle: 'italic',
    },
});
