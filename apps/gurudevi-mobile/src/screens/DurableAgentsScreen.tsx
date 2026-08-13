import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

type Capability = 'teacher-summary' | 'student-support';
type Mode = 'demo' | 'live';
type Run = { runId: string; status: string; runType?: string | null; summaryDraft?: string | null; error?: string | null; promotedTeacherNoteId?: string | null };

const API_BASE = (process.env.EXPO_PUBLIC_DURABLE_AGENT_API_URL || process.env.EXPO_PUBLIC_API_URL || '').replace(/\/$/, '');
const DEMO_SCENARIOS: Record<Capability, string[]> = {
  'teacher-summary': ['attendance-dip', 'steady-growth', 'wellbeing-watch'],
  'student-support': ['quiet-struggle', 'resilient-improver', 'wellbeing-watch'],
};

export default function DurableAgentsScreen() {
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
  const endpoint = useMemo(() => `${API_BASE}/api/durable-agents/${capability === 'teacher-summary' ? 'teacher-summary' : 'student-support'}`, [capability]);

  const loadRuns = useCallback(async () => {
    if (!API_BASE) return;
    try {
      const response = await fetch(`${API_BASE}/api/durable-agents/runs?limit=8`);
      if (response.ok) setRuns(((await response.json()) as { runs?: Run[] }).runs ?? []);
    } catch { /* API may be offline during local UI work. */ }
  }, []);
  useEffect(() => { void loadRuns(); }, [loadRuns]);

  const startRun = async () => {
    if (!API_BASE) { setMessage('Set EXPO_PUBLIC_DURABLE_AGENT_API_URL or EXPO_PUBLIC_API_URL first.'); return; }
    setBusy(true); setMessage('Queueing a review-first draft run…');
    const body = {
      mode, demoScenario: scenario, schoolId, classroomId, teacherId, requestedBy: teacherId, studentId, studentName,
      focusPrompt: focusPrompt || undefined,
      evidenceScopes: capability === 'teacher-summary' ? ['attendance', 'grades', 'wellbeing', 'assignments'] : ['attendance', 'grades', 'wellbeing'],
      reviewMode: 'draft_only',
    };
    try {
      const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = (await response.json()) as { runId?: string; error?: string };
      if (!response.ok || !data.runId) throw new Error(data.error || 'Unable to queue run.');
      setActiveRun({ runId: data.runId, status: 'queued' }); setMessage('Run queued. Waiting for the worker…');
      for (let attempt = 0; attempt < 20; attempt += 1) {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        const statusResponse = await fetch(`${API_BASE}/api/durable-agents/runs/${data.runId}`);
        if (!statusResponse.ok) continue;
        const run = (await statusResponse.json()) as Run; setActiveRun(run);
        if (run.status === 'completed' || run.status === 'failed') break;
      }
      await loadRuns(); setMessage('Draft run updated. Review the output before promoting anything.');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Unable to queue run.'); }
    finally { setBusy(false); }
  };

  const promoteRun = async () => {
    if (!activeRun?.runId || !API_BASE) return;
    setBusy(true);
    try {
      const response = await fetch(`${API_BASE}/api/durable-agents/runs/${activeRun.runId}/promote`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ actorId: teacherId }) });
      const data = (await response.json()) as { error?: string; teacherNoteId?: string };
      if (!response.ok) throw new Error(data.error || 'Promotion failed.');
      setMessage(`Promoted for teacher review: ${data.teacherNoteId ?? 'complete'}`); await loadRuns();
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Promotion failed.'); }
    finally { setBusy(false); }
  };

  const field = (label: string, value: string, setter: (value: string) => void) => <View key={label}><Text style={styles.label}>{label}</Text><TextInput value={value} onChangeText={setter} style={styles.input} autoCapitalize="none" /></View>;
  return <ScrollView contentContainerStyle={styles.page}>
    <View style={styles.header}><Text style={styles.eyebrow}>DURABLE AGENTS · REVIEW LANE</Text><Text style={styles.title}>Bounded help for the people doing the work.</Text><Text style={styles.body}>Generate evidence-bound drafts for human review. Nothing is published or promoted automatically.</Text></View>
    <View style={styles.section}>
      <Text style={styles.label}>Capability</Text><View style={styles.row}>{(['teacher-summary', 'student-support'] as Capability[]).map((value) => <Pressable key={value} style={[styles.choice, capability === value && styles.choiceActive]} onPress={() => { setCapability(value); setScenario(DEMO_SCENARIOS[value][0] ?? ''); }}><Text style={[styles.choiceText, capability === value && styles.choiceTextActive]}>{value === 'teacher-summary' ? 'Teacher summary' : 'Student support'}</Text></Pressable>)}</View>
      <Text style={styles.label}>Mode</Text><View style={styles.row}>{(['demo', 'live'] as Mode[]).map((value) => <Pressable key={value} style={[styles.choice, mode === value && styles.choiceActive]} onPress={() => setMode(value)}><Text style={[styles.choiceText, mode === value && styles.choiceTextActive]}>{value}</Text></Pressable>)}</View>
      <Text style={styles.label}>Scenario</Text><View style={styles.row}>{DEMO_SCENARIOS[capability].map((value) => <Pressable key={value} style={[styles.choice, scenario === value && styles.choiceActive]} onPress={() => setScenario(value)}><Text style={[styles.choiceText, scenario === value && styles.choiceTextActive]}>{value.replace(/-/g, ' ')}</Text></Pressable>)}</View>
      {field('School ID', schoolId, setSchoolId)}{field('Classroom ID', classroomId, setClassroomId)}{field('Teacher ID', teacherId, setTeacherId)}
      {capability === 'student-support' && <>{field('Student ID', studentId, setStudentId)}{field('Student name', studentName, setStudentName)}</>}
      <Text style={styles.label}>Focus prompt</Text><TextInput value={focusPrompt} onChangeText={setFocusPrompt} style={[styles.input, styles.textarea]} multiline placeholder="Optional: what should the reviewer pay attention to?" />
      <Pressable disabled={busy} onPress={() => void startRun()} style={[styles.primary, busy && styles.disabled]}>{busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryText}>Start draft run</Text>}</Pressable><Text style={styles.message}>{message}</Text>
    </View>
    {activeRun && <View style={styles.result}><Text style={styles.label}>Active run · {activeRun.status}</Text><Text selectable style={styles.mono}>{activeRun.runId}</Text>{!!activeRun.summaryDraft && <Text selectable style={styles.draft}>{activeRun.summaryDraft}</Text>}{!!activeRun.error && <Text style={styles.error}>{activeRun.error}</Text>}{activeRun.status === 'completed' && !activeRun.promotedTeacherNoteId && <Pressable disabled={busy} onPress={() => void promoteRun()} style={styles.secondary}><Text style={styles.secondaryText}>Promote for teacher review</Text></Pressable>}</View>}
    <View style={styles.section}><Text style={styles.sectionTitle}>Recent runs</Text>{runs.length === 0 ? <Text style={styles.body}>No runs loaded yet.</Text> : runs.map((run) => <Pressable key={run.runId} onPress={() => setActiveRun(run)} style={styles.run}><Text style={styles.runTitle}>{run.runType ?? 'draft run'} · {run.status}</Text><Text style={styles.mono}>{run.runId}</Text></Pressable>)}</View>
  </ScrollView>;
}

const styles = StyleSheet.create({
  page: { padding: 24, gap: 20, backgroundColor: '#F5EDD6', minHeight: '100%' }, header: { gap: 8, maxWidth: 760 }, eyebrow: { color: '#D4843A', fontSize: 12, fontWeight: '800', letterSpacing: 1.4 }, title: { color: '#172033', fontSize: 30, fontWeight: '800', lineHeight: 36 }, body: { color: '#67594E', fontSize: 15, lineHeight: 23 }, section: { backgroundColor: '#FFFDF8', borderColor: '#D9CCB5', borderRadius: 18, borderWidth: 1, gap: 10, maxWidth: 760, padding: 20 }, label: { color: '#67594E', fontSize: 12, fontWeight: '800', letterSpacing: 0.7, textTransform: 'uppercase' }, row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, choice: { borderColor: '#D9CCB5', borderRadius: 999, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 10 }, choiceActive: { backgroundColor: '#172033', borderColor: '#172033' }, choiceText: { color: '#67594E', fontSize: 13, fontWeight: '700' }, choiceTextActive: { color: '#FFFDF8' }, input: { backgroundColor: '#F9F3E8', borderColor: '#D9CCB5', borderRadius: 12, borderWidth: 1, color: '#172033', minHeight: 44, paddingHorizontal: 12 }, textarea: { minHeight: 90, paddingTop: 12, textAlignVertical: 'top' }, primary: { alignItems: 'center', backgroundColor: '#D4843A', borderRadius: 999, justifyContent: 'center', minHeight: 48, paddingHorizontal: 20 }, primaryText: { color: '#FFF', fontWeight: '800' }, disabled: { opacity: 0.55 }, message: { color: '#67594E', fontSize: 13, minHeight: 20 }, result: { backgroundColor: '#172033', borderRadius: 18, gap: 10, maxWidth: 760, padding: 20 }, mono: { color: '#AFA7C6', fontFamily: 'monospace', fontSize: 12 }, draft: { color: '#FFFDF8', fontSize: 15, lineHeight: 24 }, error: { color: '#F5A6A6' }, secondary: { alignItems: 'center', backgroundColor: '#FFFDF8', borderRadius: 999, justifyContent: 'center', minHeight: 44, paddingHorizontal: 16 }, secondaryText: { color: '#172033', fontWeight: '800' }, sectionTitle: { color: '#172033', fontSize: 20, fontWeight: '800' }, run: { borderBottomColor: '#D9CCB5', borderBottomWidth: 1, gap: 4, paddingVertical: 10 }, runTitle: { color: '#172033', fontWeight: '700' },
});
