import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

type Capability = 'teacher-summary' | 'student-support';
type Mode = 'demo' | 'live';

type Run = {
  runId: string;
  status: string;
  runType?: string | null;
  summaryDraft?: string | null;
  error?: string | null;
  promotedTeacherNoteId?: string | null;
  mode?: string | null;
  scenario?: string | null;
  classroomId?: string | null;
  studentId?: string | null;
  studentName?: string | null;
  teacherId?: string | null;
  requestedBy?: string | null;
  createdAt?: string;
  updatedAt?: string;
  timeline?: Array<{ action: string; createdAt: string }>;
};

const SCENARIOS: Record<Capability, string[]> = {
  'teacher-summary': ['attendance-dip', 'steady-growth', 'wellbeing-watch'],
  'student-support': ['quiet-struggle', 'resilient-improver', 'wellbeing-watch'],
};

function createApiClient() {
  const baseUrl = (
    process.env.EXPO_PUBLIC_DURABLE_AGENT_API_URL ||
    process.env.EXPO_PUBLIC_API_URL ||
    ''
  ).replace(/\/$/, '');

  return {
    async getRuns(limit = 8): Promise<Run[]> {
      if (!baseUrl) return [];
      try {
        const response = await fetch(`${baseUrl}/api/durable-agents/runs?limit=${limit}`, {
          headers: { 'Content-Type': 'application/json' },
        });
        if (!response.ok) return [];
        const data = await response.json();
        return (data.runs ?? []) as Run[];
      } catch {
        return [];
      }
    },

    async startRun(body: {
      mode: Mode;
      demoScenario: string;
      schoolId: string;
      classroomId: string;
      teacherId: string;
      requestedBy: string;
      studentId?: string;
      studentName?: string;
      focusPrompt?: string;
      evidenceScopes: string[];
      reviewMode: 'draft_only';
    }): Promise<{ runId: string; status: string; mode: string; reviewMode: string }> {
      if (!baseUrl) throw new Error('API URL not configured');
      const capability = body.evidenceScopes.includes('assignments')
        ? 'teacher-summary'
        : 'student-support';
      const response = await fetch(`${baseUrl}/api/durable-agents/${capability}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (!response.ok || !data.runId) {
        throw new Error(data.error || 'Unable to queue run.');
      }
      return data;
    },

    async getRun(runId: string): Promise<Run | null> {
      if (!baseUrl) return null;
      try {
        const response = await fetch(`${baseUrl}/api/durable-agents/runs/${runId}`);
        if (!response.ok) return null;
        return (await response.json()) as Run;
      } catch {
        return null;
      }
    },

    async promoteRun(
      runId: string,
      actorId: string,
    ): Promise<{
      runId: string;
      teacherNoteId?: string;
      alreadyPromoted?: boolean;
      promotionMode?: string;
      status: string;
    }> {
      if (!baseUrl) throw new Error('API URL not configured');
      const response = await fetch(`${baseUrl}/api/durable-agents/runs/${runId}/promote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actorId }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Promotion failed.');
      }
      return data;
    },
  };
}

const apiClient = createApiClient();

export default function DurableAgentsScreenWeb() {
  const [capability, setCapability] = useState<Capability>('teacher-summary');
  const [mode, setMode] = useState<Mode>('demo');
  const [scenario, setScenario] = useState('attendance-dip');
  const [schoolId, setSchoolId] = useState('11111111-1111-1111-1111-111111111111');
  const [classroomId, setClassroomId] = useState('22222222-2222-2222-2222-222222222222');
  const [teacherId, setTeacherId] = useState('33333333-3333-3333-3333-333333333333');
  const [studentId, setStudentId] = useState('55555555-5555-5555-5555-555555555555');
  const [studentName, setStudentName] = useState('Nethmi Perera');
  const [focusPrompt, setFocusPrompt] = useState('');
  const [activeRun, setActiveRun] = useState<Run | null>(null);
  const [runs, setRuns] = useState<Run[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const loadRuns = useCallback(async () => {
    try {
      const loadedRuns = await apiClient.getRuns(8);
      setRuns(loadedRuns);
    } catch {
      // The empty state remains useful when the worker is not running locally.
    }
  }, []);

  useEffect(() => {
    void loadRuns();
  }, [loadRuns]);

  const startRun = async () => {
    const baseUrl = (
      process.env.EXPO_PUBLIC_DURABLE_AGENT_API_URL ||
      process.env.EXPO_PUBLIC_API_URL ||
      ''
    ).replace(/\/$/, '');
    if (!baseUrl) {
      setMessage('The review worker is not configured for this environment yet.');
      return;
    }
    setBusy(true);
    setMessage('Queueing a review-first draft run…');
    const body = {
      mode,
      demoScenario: scenario,
      schoolId,
      classroomId,
      teacherId,
      requestedBy: teacherId,
      studentId,
      studentName,
      focusPrompt: focusPrompt || undefined,
      evidenceScopes:
        capability === 'teacher-summary'
          ? ['attendance', 'grades', 'wellbeing', 'assignments']
          : ['attendance', 'grades', 'wellbeing'],
      reviewMode: 'draft_only' as const,
    };
    try {
      const data = await apiClient.startRun(body);
      setActiveRun({ runId: data.runId, status: 'queued' });
      for (let attempt = 0; attempt < 20; attempt += 1) {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        const run = await apiClient.getRun(data.runId);
        if (run) {
          setActiveRun(run);
        }
        if (run?.status === 'completed' || run?.status === 'failed') break;
      }
      await loadRuns();
      setMessage('Draft updated. Review the output before promoting anything.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to queue run.');
    } finally {
      setBusy(false);
    }
  };

  const promoteRun = async () => {
    if (!activeRun?.runId) return;
    setBusy(true);
    try {
      const data = await apiClient.promoteRun(activeRun.runId, teacherId);
      setMessage(`Promoted for teacher review: ${data.teacherNoteId ?? 'complete'}`);
      await loadRuns();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Promotion failed.');
    } finally {
      setBusy(false);
    }
  };

  const field = (label: string, value: string, setter: (next: string) => void) => (
    <View style={styles.field} key={label}>
      <Text style={styles.label}>{label}</Text>
      <TextInput value={value} onChangeText={setter} style={styles.input} autoCapitalize="none" />
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <View style={styles.intro}>
        <Text style={styles.eyebrow}>AGENT LAB · REVIEW-FIRST</Text>
        <Text style={styles.title}>Bounded help for the people doing the work.</Text>
        <Text style={styles.lede}>
          Generate evidence-bound drafts for human review. Nothing is published or promoted
          automatically.
        </Text>
      </View>

      <View style={styles.grid}>
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Start a draft</Text>
          <Text style={styles.panelNote}>
            Choose a bounded capability, then provide the smallest useful context.
          </Text>
          <Text style={styles.label}>Capability</Text>
          <View style={styles.choiceRow}>
            {(['teacher-summary', 'student-support'] as Capability[]).map((value) => (
              <Choice
                key={value}
                active={capability === value}
                label={value === 'teacher-summary' ? 'Teacher summary' : 'Student support'}
                onPress={() => {
                  setCapability(value);
                  setScenario(SCENARIOS[value][0] ?? '');
                }}
              />
            ))}
          </View>
          <Text style={styles.label}>Mode</Text>
          <View style={styles.choiceRow}>
            {(['demo', 'live'] as Mode[]).map((value) => (
              <Choice
                key={value}
                active={mode === value}
                label={value}
                onPress={() => setMode(value)}
              />
            ))}
          </View>
          <Text style={styles.label}>Scenario</Text>
          <View style={styles.choiceRow}>
            {SCENARIOS[capability].map((value) => (
              <Choice
                key={value}
                active={scenario === value}
                label={value.replace(/-/g, ' ')}
                onPress={() => setScenario(value)}
              />
            ))}
          </View>
          {field('School ID', schoolId, setSchoolId)}
          {field('Classroom ID', classroomId, setClassroomId)}
          {field('Teacher ID', teacherId, setTeacherId)}
          {capability === 'student-support' && (
            <>
              {field('Student ID', studentId, setStudentId)}
              {field('Student name', studentName, setStudentName)}
            </>
          )}
          <Text style={styles.label}>Focus prompt</Text>
          <TextInput
            value={focusPrompt}
            onChangeText={setFocusPrompt}
            style={[styles.input, styles.textarea]}
            multiline
            placeholder="Optional: what should the reviewer pay attention to?"
          />
          <Pressable
            disabled={busy}
            onPress={() => void startRun()}
            style={[styles.primary, busy && styles.disabled]}
          >
            {busy ? (
              <ActivityIndicator color="#fffdf8" />
            ) : (
              <Text style={styles.primaryText}>Start draft run</Text>
            )}
          </Pressable>
          <Text accessibilityLiveRegion="polite" style={styles.message}>
            {message}
          </Text>
        </View>

        <View style={styles.side}>
          <View style={styles.ruleBlock}>
            <Text style={styles.sideTitle}>Governor rules</Text>
            {[
              'Allowlisted evidence only',
              'Draft-only by default',
              'Auditable and pollable runs',
              'Explicit human promotion',
            ].map((rule) => (
              <Text key={rule} style={styles.rule}>
                — {rule}
              </Text>
            ))}
          </View>
          <View style={styles.ruleBlock}>
            <Text style={styles.sideTitle}>Recent runs</Text>
            {runs.length === 0 ? (
              <Text style={styles.sideText}>No runs loaded yet.</Text>
            ) : (
              runs.map((run) => (
                <Pressable key={run.runId} onPress={() => setActiveRun(run)} style={styles.run}>
                  <Text style={styles.runTitle}>{run.runType ?? 'draft run'}</Text>
                  <Text style={styles.runStatus}>{run.status}</Text>
                </Pressable>
              ))
            )}
          </View>
        </View>
      </View>

      <View style={styles.output}>
        <View style={styles.outputHeader}>
          <Text style={styles.panelTitle}>Run output</Text>
          <Text style={styles.status}>{activeRun?.status ?? 'Idle'}</Text>
        </View>
        {activeRun?.summaryDraft ? (
          <Text selectable style={styles.draft}>
            {activeRun.summaryDraft}
          </Text>
        ) : (
          <Text style={styles.empty}>
            Start a run to see the review draft and its evidence boundary.
          </Text>
        )}
        {activeRun?.error && <Text style={styles.error}>{activeRun.error}</Text>}
        {activeRun?.status === 'completed' && !activeRun.promotedTeacherNoteId && (
          <Pressable disabled={busy} onPress={() => void promoteRun()} style={styles.secondary}>
            <Text style={styles.secondaryText}>Promote for teacher review</Text>
          </Pressable>
        )}
      </View>
    </ScrollView>
  );
}

function Choice({
  active,
  label,
  onPress,
}: {
  active: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.choice, active && styles.choiceActive]}>
      <Text style={[styles.choiceText, active && styles.choiceTextActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  page: { minHeight: '100%', padding: 48, gap: 32, backgroundColor: '#f7f2e8' },
  intro: { width: '100%', maxWidth: 860, alignSelf: 'center', gap: 14 },
  eyebrow: { color: '#c86f3d', fontSize: 12, fontWeight: '800', letterSpacing: 2 },
  title: { color: '#1d2933', fontSize: 54, fontWeight: '700', lineHeight: 58, maxWidth: 760 },
  lede: { color: '#685e55', fontSize: 17, lineHeight: 28, maxWidth: 620 },
  grid: {
    width: '100%',
    maxWidth: 1180,
    alignSelf: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 24,
  },
  panel: {
    flex: 1,
    minWidth: 420,
    gap: 14,
    padding: 28,
    backgroundColor: '#fffdf8',
    borderColor: '#d8cdbd',
    borderWidth: 1,
    borderRadius: 18,
  },
  side: { width: 300, minWidth: 280, gap: 24 },
  panelTitle: { color: '#1d2933', fontSize: 26, fontWeight: '700' },
  panelNote: { color: '#685e55', lineHeight: 22, marginBottom: 8 },
  label: {
    color: '#685e55',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 8,
  },
  choiceRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  choice: {
    paddingHorizontal: 13,
    paddingVertical: 10,
    borderRadius: 999,
    borderColor: '#d8cdbd',
    borderWidth: 1,
  },
  choiceActive: { backgroundColor: '#1d2933', borderColor: '#1d2933' },
  choiceText: { color: '#685e55', fontSize: 13, fontWeight: '700' },
  choiceTextActive: { color: '#fffdf8' },
  field: { gap: 5 },
  input: {
    minHeight: 44,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderColor: '#d8cdbd',
    borderWidth: 1,
    backgroundColor: '#fbf6ee',
    color: '#1d2933',
  },
  textarea: { minHeight: 88, paddingTop: 12, textAlignVertical: 'top' },
  primary: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    borderRadius: 999,
    backgroundColor: '#c86f3d',
    marginTop: 10,
  },
  primaryText: { color: '#fffdf8', fontWeight: '800' },
  disabled: { opacity: 0.55 },
  message: { minHeight: 22, color: '#685e55', fontSize: 13 },
  ruleBlock: {
    padding: 24,
    gap: 12,
    borderTopWidth: 2,
    borderTopColor: '#c86f3d',
    backgroundColor: '#1d2933',
  },
  sideTitle: { color: '#fffdf8', fontSize: 20, fontWeight: '700' },
  rule: { color: '#d8d0c6', lineHeight: 22 },
  sideText: { color: '#d8d0c6', lineHeight: 22 },
  run: { paddingVertical: 10, borderTopWidth: 1, borderTopColor: 'rgba(255,253,248,0.16)', gap: 3 },
  runTitle: { color: '#fffdf8', fontWeight: '700' },
  runStatus: { color: '#e5b57f', fontSize: 12 },
  output: {
    width: '100%',
    maxWidth: 1180,
    alignSelf: 'center',
    gap: 16,
    padding: 28,
    backgroundColor: '#e8dfd2',
  },
  outputHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  status: { color: '#685e55', fontSize: 12, fontWeight: '800', textTransform: 'uppercase' },
  empty: { color: '#685e55', lineHeight: 24 },
  draft: { color: '#1d2933', fontSize: 15, lineHeight: 25 },
  error: { color: '#a23b36' },
  secondary: {
    alignSelf: 'flex-start',
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    borderRadius: 999,
    backgroundColor: '#1d2933',
  },
  secondaryText: { color: '#fffdf8', fontWeight: '800' },
});
