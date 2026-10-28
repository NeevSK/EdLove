import { Button, Host } from '@expo/ui';
import { tokens } from '@repo/ui/tokens';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, RefreshControl, Share, StyleSheet, Text, TextInput, View } from 'react-native';
import type {
  DevelopmentTelemetryEventCount,
  DevelopmentTelemetryRow,
  DevelopmentTelemetrySession,
  DevelopmentTelemetrySourceStatus,
} from '@/telemetry/developmentTelemetryDatabase';
import { analyzeDevelopmentTelemetry } from '@/telemetry/developmentTelemetryInsights';
import {
  backfillDevelopmentTelemetryJournals,
  deleteDevelopmentTelemetrySession,
  getDevelopmentTelemetryEventCounts,
  getDevelopmentTelemetrySessions,
  getDevelopmentTelemetrySources,
  getDevelopmentTelemetryStatus,
  importPerfettoTraceJson,
  importReactNativeDevToolsTrace,
  queryDevelopmentTelemetrySession,
  setDevelopmentTelemetrySource,
} from '@/telemetry/localDevelopmentTelemetry';
import { MAX_DEVTOOLS_TRACE_BYTES } from '@/telemetry/reactNativeDevToolsTrace';

const EVENT_LIMIT = 2_000;
const INSIGHT_EVENT_LIMIT = 10_000;

export function VergerDiagnosticsScreen() {
  const [sessions, setSessions] = useState<DevelopmentTelemetrySession[]>([]);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [events, setEvents] = useState<DevelopmentTelemetryRow[]>([]);
  const [insightEvents, setInsightEvents] = useState<DevelopmentTelemetryRow[]>([]);
  const [sources, setSources] = useState<DevelopmentTelemetrySourceStatus[]>([]);
  const [eventCounts, setEventCounts] = useState<DevelopmentTelemetryEventCount[]>([]);
  const [sourceFilter, setSourceFilter] = useState('');
  const [nameFilter, setNameFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasEarlierEvents, setHasEarlierEvents] = useState(false);
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const [confirmDeleteSession, setConfirmDeleteSession] = useState<string | null>(null);
  const [sessionActionMessage, setSessionActionMessage] = useState<string | null>(null);
  const status = getDevelopmentTelemetryStatus();

  const refresh = useCallback(
    async (
      sessionOverride?: string,
      query: { readonly source?: string; readonly name?: string } = {},
    ) => {
      setLoading(true);
      try {
        const recent = await getDevelopmentTelemetrySessions();
        setSessions(recent);
        const chosen = sessionOverride ?? selectedSession ?? recent[0]?.session ?? status.session;
        setSelectedSession(chosen);
        const [rows, analysisRows, sourceRows, sourceEventCounts] = await Promise.all([
          queryDevelopmentTelemetrySession(chosen, { ...query, limit: EVENT_LIMIT }),
          queryDevelopmentTelemetrySession(chosen, { limit: INSIGHT_EVENT_LIMIT }),
          getDevelopmentTelemetrySources(chosen),
          getDevelopmentTelemetryEventCounts(chosen),
        ]);
        setEvents(rows.reverse());
        setInsightEvents(analysisRows);
        setHasEarlierEvents(rows.length === EVENT_LIMIT);
        setSources(sourceRows);
        setEventCounts(sourceEventCounts);
      } catch (error) {
        setEvents([]);
        setInsightEvents([]);
        setSources([
          {
            source: 'local-sqlite',
            state: 'failed',
            details: error instanceof Error ? error.message : 'Local database query failed.',
            updated_at_ms: performance.now(),
          },
        ]);
        setEventCounts([]);
      } finally {
        setLoading(false);
      }
    },
    [selectedSession, status.session],
  );

  const loadEarlier = useCallback(async () => {
    const oldest = events[0];
    if (!selectedSession || !oldest || !hasEarlierEvents) return;
    setLoading(true);
    try {
      const older = await queryDevelopmentTelemetrySession(selectedSession, {
        limit: EVENT_LIMIT,
        before: { atMs: oldest.at_ms, sequence: oldest.sequence },
        ...(sourceFilter.trim() ? { source: sourceFilter.trim() } : {}),
        ...(nameFilter.trim() ? { name: nameFilter.trim() } : {}),
      });
      const ordered = older.reverse();
      setEvents((current) => [...ordered, ...current]);
      setHasEarlierEvents(older.length === EVENT_LIMIT);
    } catch {
      setHasEarlierEvents(false);
    } finally {
      setLoading(false);
    }
  }, [events, hasEarlierEvents, nameFilter, selectedSession, sourceFilter]);

  useEffect(() => {
    setDevelopmentTelemetrySource(
      'rn-devtools-profile',
      'disabled',
      'Capture manually in React Native DevTools; this app cannot subscribe to the panel trace.',
    );
    void refresh();
  }, [refresh]);

  const insights = useMemo(
    () =>
      analyzeDevelopmentTelemetry(
        insightEvents,
        status.databaseError,
        sources,
        sessions.find((item) => item.session === selectedSession)?.event_count,
      ),
    [insightEvents, selectedSession, sessions, sources, status.databaseError],
  );
  const selected = sessions.find((item) => item.session === selectedSession);
  const sessionStart = selected?.first_at_ms ?? events[0]?.at_ms ?? 0;

  const shareFindings = () => {
    const report = [
      `Verger diagnostics · session ${selectedSession ?? 'unknown'}`,
      `Events queried: ${events.length} / ${selected?.event_count ?? 0}`,
      ...insights.map(
        (finding) =>
          `${finding.severity.toUpperCase()}: ${finding.title}\n${finding.evidence}\nNext: ${finding.nextStep}`,
      ),
      `Source states: ${sources.map((source) => `${source.source}=${source.state}`).join(', ') || 'none recorded'}`,
      `Persisted event totals by source: ${eventCounts.map((source) => `${source.source}=${source.event_count}`).join(', ') || 'none'}`,
    ].join('\n\n');
    void Share.share({ message: report });
  };

  const importTrace = async (traceSource: 'rn-devtools-trace' | 'perfetto-trace-json') => {
    setImportMessage(
      traceSource === 'perfetto-trace-json'
        ? 'Choose a Perfetto Chrome JSON export (.json).'
        : 'Choose a React Native DevTools performance trace (.json).',
    );
    try {
      const { getDocumentAsync } = await import('expo-document-picker');
      const result = await getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
        base64: false,
      });
      if (result.canceled) {
        setImportMessage('Trace import cancelled.');
        return;
      }
      const asset = result.assets[0];
      if (!asset) throw new Error('The document picker returned no file.');
      const { File } = await import('expo-file-system');
      const file = new File(asset.uri);
      const size = asset.size ?? file.size;
      if (size !== null && size > MAX_DEVTOOLS_TRACE_BYTES) {
        throw new Error(
          'The selected trace exceeds the 32 MiB import limit; split the capture and retry.',
        );
      }
      setImportMessage(`Reading ${asset.name}…`);
      const content = await file.text();
      const imported =
        traceSource === 'perfetto-trace-json'
          ? await importPerfettoTraceJson(asset.name, content)
          : await importReactNativeDevToolsTrace(asset.name, content);
      setImportMessage(
        `Imported ${imported.eventCount} rows from ${asset.name}. This trace has its own clock and session.`,
      );
      await refresh(imported.session);
    } catch (error) {
      setImportMessage(error instanceof Error ? error.message : 'Trace import failed.');
    }
  };

  const removeSession = async (session: string) => {
    try {
      await deleteDevelopmentTelemetrySession(session);
      setConfirmDeleteSession(null);
      setSessionActionMessage(
        'Removed that session from SQLite and deleted its local JSONL sidecars.',
      );
      const nextSession =
        sessions.find((item) => item.session !== session)?.session ?? status.session;
      await refresh(nextSession);
    } catch (error) {
      setSessionActionMessage(error instanceof Error ? error.message : 'Session removal failed.');
    }
  };

  return (
    <Host style={styles.host}>
      <FlatList
        contentInsetAdjustmentBehavior="automatic"
        data={events}
        keyExtractor={(item) => `${item.session}:${item.sequence}`}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={() => void refresh()} />}
        ListHeaderComponent={
          <View style={styles.content}>
            <Text accessibilityRole="header" selectable style={styles.title}>
              Development diagnostics
            </Text>
            <Text selectable style={styles.summary}>
              Local SQLite timeline · {status.databaseState} · {status.databaseDropped} SQLite
              drop(s)
              {status.databaseError ? ` · ${status.databaseError}` : ''}
            </Text>
            <View style={styles.actions}>
              <Button label="Refresh timeline" variant="outlined" onPress={() => void refresh()} />
              <Button
                label="Backfill local JSONL history"
                variant="outlined"
                onPress={() => {
                  void backfillDevelopmentTelemetryJournals()
                    .then((result) => {
                      setSessionActionMessage(
                        `Indexed ${result.sessions} local journal(s), ${result.events} event(s); skipped ${result.skipped}.`,
                      );
                      return refresh();
                    })
                    .catch((error: unknown) => {
                      setSessionActionMessage(
                        error instanceof Error ? error.message : 'Local journal backfill failed.',
                      );
                    });
                }}
              />
              <Button label="Share findings" variant="outlined" onPress={shareFindings} />
              <Button
                label="Import RN DevTools JSON"
                variant="outlined"
                onPress={() => void importTrace('rn-devtools-trace')}
              />
              <Button
                label="Import Perfetto JSON"
                variant="outlined"
                onPress={() => void importTrace('perfetto-trace-json')}
              />
            </View>
            {importMessage ? (
              <Text selectable style={styles.muted}>
                {importMessage} Selected trace events stay on this device; imported traces are not
                merged with live-session timestamps.
              </Text>
            ) : null}
            <Text selectable style={styles.muted}>
              Trace imports preserve event fields and may contain URLs or user values. Use test or
              sandbox data; imports remain local to this development app.
            </Text>
            <TextInput
              accessibilityLabel="Filter events by source"
              autoCapitalize="none"
              onChangeText={setSourceFilter}
              placeholder="Source, e.g. verger"
              placeholderTextColor={tokens.colors.inkSubtle}
              style={styles.filterInput}
              value={sourceFilter}
            />
            <TextInput
              accessibilityLabel="Filter events by event name"
              autoCapitalize="none"
              onChangeText={setNameFilter}
              placeholder="Event name contains…"
              placeholderTextColor={tokens.colors.inkSubtle}
              style={styles.filterInput}
              value={nameFilter}
            />
            <Button
              label="Apply event filters"
              variant="outlined"
              onPress={() =>
                void refresh(selectedSession ?? undefined, {
                  ...(sourceFilter.trim() ? { source: sourceFilter.trim() } : {}),
                  ...(nameFilter.trim() ? { name: nameFilter.trim() } : {}),
                })
              }
            />

            <Text accessibilityRole="header" selectable style={styles.sectionTitle}>
              Sessions
            </Text>
            {sessions.length === 0 ? (
              <Text selectable style={styles.muted}>
                No sessions have reached SQLite yet.
              </Text>
            ) : (
              sessions.map((item) => (
                <View key={item.session} style={styles.sessionRow}>
                  <Button
                    label={`${item.session} · ${item.event_count} events${item.session === selectedSession ? ' · selected' : ''}${item.session === status.session ? ' · recording' : ''}`}
                    variant={item.session === selectedSession ? 'filled' : 'text'}
                    onPress={() => void refresh(item.session)}
                  />
                  {item.session !== status.session ? (
                    confirmDeleteSession === item.session ? (
                      <View style={styles.sessionActions}>
                        <Text selectable style={styles.muted}>
                          Remove this session and its local JSONL files?
                        </Text>
                        <Button
                          label="Confirm remove session"
                          variant="outlined"
                          onPress={() => void removeSession(item.session)}
                        />
                        <Button
                          label="Cancel removal"
                          variant="text"
                          onPress={() => setConfirmDeleteSession(null)}
                        />
                      </View>
                    ) : (
                      <Button
                        label="Remove local session"
                        variant="text"
                        onPress={() => setConfirmDeleteSession(item.session)}
                      />
                    )
                  ) : null}
                </View>
              ))
            )}
            {sessionActionMessage ? (
              <Text selectable style={styles.muted}>
                {sessionActionMessage}
              </Text>
            ) : null}

            <Text accessibilityRole="header" selectable style={styles.sectionTitle}>
              Source coverage
            </Text>
            <Text selectable style={styles.muted}>
              Persisted totals for the full session, independent of the visible timeline page or
              filters:
              {eventCounts.length
                ? ` ${eventCounts.map((source) => `${source.source} ${source.event_count}`).join(' · ')}`
                : ' no event rows'}
            </Text>
            {selected && selected.event_count > INSIGHT_EVENT_LIMIT ? (
              <Text selectable style={styles.muted}>
                Findings inspect the latest {INSIGHT_EVENT_LIMIT.toLocaleString()} events of{' '}
                {selected.event_count.toLocaleString()} persisted events. Earlier events remain
                queryable from the timeline.
              </Text>
            ) : null}
            {sources.length === 0 ? (
              <Text selectable style={styles.muted}>
                No source manifest was saved for this session.
              </Text>
            ) : (
              sources.map((source) => (
                <View key={source.source} style={styles.sourceRow}>
                  <Text selectable style={styles.sourceName}>
                    {source.source}
                  </Text>
                  <Text selectable style={styles.sourceState}>
                    {source.state}
                  </Text>
                  {source.details ? (
                    <Text selectable style={styles.sourceDetails}>
                      {source.details}
                    </Text>
                  ) : null}
                </View>
              ))
            )}

            <Text accessibilityRole="header" selectable style={styles.sectionTitle}>
              Engineering findings
            </Text>
            {insights.map((finding, index) => (
              <View key={`${finding.title}:${index}`} style={styles.finding}>
                <Text
                  selectable
                  style={finding.severity === 'attention' ? styles.findingTitle : styles.sourceName}
                >
                  {finding.title}
                </Text>
                <Text selectable style={styles.muted}>
                  {finding.evidence}
                </Text>
                <Text selectable style={styles.nextStep}>
                  {finding.nextStep}
                </Text>
              </View>
            ))}

            <Text accessibilityRole="header" selectable style={styles.sectionTitle}>
              Flow timeline
            </Text>
            <Text selectable style={styles.muted}>
              Monotonic source timestamps are kept in milliseconds with sub-millisecond precision
              where available. Only events emitted by an available source appear here; this is not a
              1 ms polling stream.
            </Text>
          </View>
        }
        ListEmptyComponent={
          <Text selectable style={styles.empty}>
            No persisted events for this session yet.
          </Text>
        }
        renderItem={({ item }) => <TimelineEvent item={item} sessionStart={sessionStart} />}
        ListFooterComponent={
          <View style={styles.footer}>
            {hasEarlierEvents ? (
              <Button
                label="Load earlier events"
                variant="outlined"
                onPress={() => void loadEarlier()}
              />
            ) : null}
            <Text selectable style={styles.muted}>
              RN DevTools performance traces in Chrome trace-event JSON can be imported above. React
              Profiler profiles, heap snapshots and Android Studio/Perfetto traces remain tool-owned
              captures; their formats are not silently interpreted here.
            </Text>
          </View>
        }
      />
    </Host>
  );
}

function TimelineEvent({
  item,
  sessionStart,
}: {
  readonly item: DevelopmentTelemetryRow;
  readonly sessionStart: number;
}) {
  const relativeMs = item.at_ms - sessionStart;
  const detail =
    item.attributes_json.length > 520
      ? `${item.attributes_json.slice(0, 520)}…`
      : item.attributes_json;
  return (
    <View style={styles.eventRow}>
      <View style={styles.eventRail} />
      <View style={styles.eventBody}>
        <Text selectable style={styles.eventTitle}>
          +{relativeMs.toFixed(3)} ms · {item.source} / {item.name}
        </Text>
        <Text selectable style={styles.eventMeta}>
          source time {item.at_ms.toFixed(3)} ms · wall {new Date(item.wall_time_ms).toISOString()}{' '}
          · #{item.sequence}
        </Text>
        <Text selectable style={styles.eventDetail}>
          {detail}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  host: { flex: 1, backgroundColor: tokens.colors.background },
  content: { gap: 10, padding: 16 },
  title: { color: tokens.colors.ink, fontSize: 22, fontWeight: '700' },
  summary: { color: tokens.colors.inkSubtle, fontSize: 13 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  sessionRow: {
    borderColor: tokens.colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 4,
    paddingBottom: 8,
  },
  sessionActions: { alignItems: 'flex-start', gap: 4, paddingHorizontal: 12, paddingVertical: 6 },
  filterInput: {
    borderColor: tokens.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    color: tokens.colors.ink,
    fontSize: 14,
    minHeight: 42,
    paddingHorizontal: 10,
  },
  sectionTitle: { color: tokens.colors.ink, fontSize: 16, fontWeight: '700', marginTop: 12 },
  muted: { color: tokens.colors.inkSubtle, fontSize: 13, lineHeight: 19 },
  sourceRow: {
    borderColor: tokens.colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 2,
    paddingVertical: 8,
  },
  sourceName: { color: tokens.colors.ink, fontSize: 14, fontWeight: '600' },
  sourceState: { color: tokens.colors.primary, fontSize: 12, fontWeight: '700' },
  sourceDetails: { color: tokens.colors.inkSubtle, fontSize: 12 },
  finding: {
    backgroundColor: tokens.colors.surface,
    borderColor: tokens.colors.border,
    borderRadius: 10,
    borderWidth: 1,
    gap: 6,
    padding: 12,
  },
  findingTitle: { color: tokens.colors.error, fontSize: 14, fontWeight: '700' },
  nextStep: { color: tokens.colors.ink, fontSize: 13, lineHeight: 19 },
  empty: { color: tokens.colors.inkSubtle, paddingHorizontal: 16, paddingVertical: 8 },
  eventRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingBottom: 12 },
  eventRail: { backgroundColor: tokens.colors.primary, borderRadius: 3, width: 3 },
  eventBody: {
    backgroundColor: tokens.colors.surface,
    borderColor: tokens.colors.border,
    borderRadius: 10,
    borderWidth: 1,
    flex: 1,
    gap: 4,
    padding: 10,
  },
  eventTitle: {
    color: tokens.colors.ink,
    fontSize: 13,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  eventMeta: { color: tokens.colors.inkSubtle, fontSize: 11, fontVariant: ['tabular-nums'] },
  eventDetail: { color: tokens.colors.inkSubtle, fontFamily: 'monospace', fontSize: 11 },
  footer: { padding: 16 },
});
