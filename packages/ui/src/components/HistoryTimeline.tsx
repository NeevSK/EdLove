import { type AuditLogEntry, historyAPI } from '@repo/core/logic';
import { ScrollView, Text, View } from '@repo/ui/primitives';
import { tokens } from '@repo/ui/tokens';
import { FlashList } from '@shopify/flash-list';
import type React from 'react';
import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { BrandPulse } from './BrandPulse';

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
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load history');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [tableName, recordId]);

  if (loading) return <BrandPulse size={24} tintColor={tokens.colors.inkSubtle} />;
  if (error) return <Text style={styles.error}>{error}</Text>;
  if (history.length === 0)
    return <Text style={styles.empty}>No history found for this item.</Text>;

  return (
    <View style={styles.container}>
      <FlashList
        data={history}
        keyExtractor={(entry) => entry.id}
        renderItem={({ item: entry }) => (
          <View style={styles.entry}>
            <View style={styles.line} />
            <View style={styles.dot} />
            <View style={styles.content}>
              <Text style={styles.action}>
                {entry.action} by {entry.author?.full_name || 'System'}
              </Text>
              <Text style={styles.date}>{new Date(entry.changed_at).toLocaleString()}</Text>
              {entry.action === 'UPDATE' && <Text style={styles.changes}>Content changed</Text>}
            </View>
          </View>
        )}
      />
    </View>
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
    backgroundColor: tokens.colors.border,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: tokens.colors.inkSubtle,
    marginTop: 6,
    marginRight: 16,
  },
  content: {
    flex: 1,
  },
  action: {
    fontSize: 14,
    fontWeight: '600',
    color: tokens.colors.ink,
  },
  date: {
    fontSize: 12,
    color: tokens.colors.textMuted,
    marginTop: 2,
  },
  changes: {
    fontSize: 13,
    color: tokens.colors.textMuted,
    marginTop: 4,
    fontStyle: 'italic',
  },
  error: {
    color: tokens.colors.error,
    padding: 16,
  },
  empty: {
    color: tokens.colors.textMuted,
    padding: 16,
    fontStyle: 'italic',
  },
});
