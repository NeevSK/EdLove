import { type CoordinationGap, TimetableScheduler } from '@repo/ai/api/agents';
import { supabaseClient as supabase } from '@repo/core/adapters/supabaseClient';
import { authAPI, identityAPI, moonPhaseAPI, SOVEREIGN_API_URL } from '@repo/core/api/client';
import { cryptoManager, runAttendanceAudit, usePermissions, useStore } from '@repo/core';
import type { MultimodalContent } from '@tanstack/ai-client';
import { useChat, xhrHttpStream } from '@tanstack/ai-react';
import { useCallback, useEffect, useState } from 'react';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  gap?: CoordinationGap;
}

type SupabaseClient = typeof supabase;

interface ClassroomRow {
  id: string;
  name: string;
}

/**
 * Best-effort operational gap detection: unrecorded attendance today and
 * overdue assignments with ungraded submissions.
 */
async function detectAttendanceGaps(
  _db: SupabaseClient,
  classrooms: ClassroomRow[],
  today: string,
): Promise<CoordinationGap[]> {
  try {
    return await runAttendanceAudit(classrooms, today);
  } catch (err) {
    console.warn('[useAIAgent] detectAttendanceGaps error:', err);
    return [];
  }
}

async function countUngradedSubmissions(
  db: SupabaseClient,
  assignmentIds: string[],
): Promise<Map<string, number>> {
  const { data: ungradedSubmissions } = await db
    .from('submissions')
    .select('assignment_id')
    .in('assignment_id', assignmentIds)
    .is('grade', null);

  const counts = new Map<string, number>();
  for (const s of (ungradedSubmissions ?? []) as any[]) {
    const assignmentId = s.assignment_id as string;
    counts.set(assignmentId, (counts.get(assignmentId) ?? 0) + 1);
  }
  return counts;
}

async function detectGradingGaps(
  db: SupabaseClient,
  classrooms: ClassroomRow[],
  today: string,
): Promise<CoordinationGap[]> {
  const gaps: CoordinationGap[] = [];
  const classroomIds = classrooms.map((c) => c.id);
  const { data: overdue } = await db
    .from('assignments')
    .select('id, title, classroom_id, classrooms(name)')
    .in('classroom_id', classroomIds)
    .lte('due_date', today)
    .limit(5);

  if (!overdue?.length) return gaps;

  const overdueAssignments = overdue as any[];
  const ungradedCounts = await countUngradedSubmissions(
    db,
    overdueAssignments.map((a) => a.id),
  );

  for (const a of overdueAssignments) {
    const count = ungradedCounts.get(a.id as string) ?? 0;
    if (count > 0) {
      gaps.push({
        id: `grading-${a.id}`,
        type: 'resource',
        title: `${count} ungraded: ${a.title}`,
        description: `${count} submission${count > 1 ? 's' : ''} awaiting grades in ${(a.classrooms as any)?.name ?? 'your classroom'}.`,
        priority: count > 5 ? 'high' : 'medium',
        suggestedAction: 'Open gradebook',
        context: {
          assignmentId: a.id,
          classroomId: a.classroom_id,
          ungradedCount: count,
        },
      });
    }
  }

  return gaps;
}

async function detectCoordinationGaps(
  db: SupabaseClient,
  classrooms: ClassroomRow[],
  today: string,
): Promise<CoordinationGap[]> {
  const [attendance, grading] = await Promise.all([
    detectAttendanceGaps(db, classrooms, today),
    detectGradingGaps(db, classrooms, today),
  ]);
  return [...attendance, ...grading];
}

/**
 * useAIAgent hook (Workflow Assistant powered by TanStack AI)
 * Manages the conversational state, billing modes, and proactive interventions.
 */
export function useAIAgent() {
  const { can } = usePermissions();
  const userRole = useStore((state) => state.activeBond?.capacity ?? null);
  const user = useStore((state) => state.user);

  // Billing configuration states
  const [billingMode, setBillingModeState] = useState<'baseline' | 'byok' | 'purchased'>(
    'baseline',
  );
  const [byokKey, setByokKeyState] = useState<string>('');
  const [privacyMode, setPrivacyModeState] = useState<'saved' | 'temporary' | 'incognito'>('saved');
  const [aiSdk, setAiSdkState] = useState<'tanstack' | 'vercel'>('tanstack');
  const [authToken, setAuthToken] = useState<string | null>(null);

  // Load configuration from local secure storage on mount
  useEffect(() => {
    async function loadConfig() {
      try {
        const storedMode = await cryptoManager.getItemAsync('ai_billing_mode');
        if (storedMode === 'baseline' || storedMode === 'byok' || storedMode === 'purchased') {
          setBillingModeState(storedMode);
        }
        const storedKey = await cryptoManager.getItemAsync('ai_byok_key');
        if (storedKey) {
          setByokKeyState(storedKey);
        }
        const storedPrivacy = await cryptoManager.getItemAsync('ai_privacy_mode');
        if (
          storedPrivacy === 'saved' ||
          storedPrivacy === 'temporary' ||
          storedPrivacy === 'incognito'
        ) {
          setPrivacyModeState(storedPrivacy);
        }
        const storedSdk = await cryptoManager.getItemAsync('ai_sdk');
        if (storedSdk === 'tanstack' || storedSdk === 'vercel') {
          setAiSdkState(storedSdk);
        }
      } catch (err) {
        console.warn('Failed to load AI secure store config:', err);
      }
    }
    // Self-contained try/catch; intentionally not awaited by the effect.
    void loadConfig();
  }, []);

  const setAiSdk = useCallback(async (sdk: 'tanstack' | 'vercel') => {
    setAiSdkState(sdk);
    try {
      await cryptoManager.setItemAsync('ai_sdk', sdk);
    } catch (err) {
      console.warn('Failed to persist AI SDK preference:', err);
    }
  }, []);

  const setBillingMode = useCallback(async (mode: 'baseline' | 'byok' | 'purchased') => {
    setBillingModeState(mode);
    try {
      await cryptoManager.setItemAsync('ai_billing_mode', mode);
    } catch (err) {
      console.warn('Failed to persist billing mode:', err);
    }
  }, []);

  const setByokKey = useCallback(async (key: string) => {
    setByokKeyState(key);
    try {
      await cryptoManager.setItemAsync('ai_byok_key', key);
    } catch (err) {
      console.warn('Failed to persist byok key:', err);
    }
  }, []);

  const setPrivacyMode = useCallback(async (mode: 'saved' | 'temporary' | 'incognito') => {
    setPrivacyModeState(mode);
    try {
      await cryptoManager.setItemAsync('ai_privacy_mode', mode);
    } catch (err) {
      console.warn('Failed to persist privacy mode:', err);
    }
  }, []);

  const [activeGaps, setActiveGaps] = useState<CoordinationGap[]>([]);
  const [lastTimetableDraft, setLastTimetableDraft] = useState<any>(null);
  const [isRefreshingGaps, setIsRefreshingGaps] = useState(false);

  // Fetch token asynchronously for the streaming headers
  useEffect(() => {
    authAPI
      .getAuthSession()
      .then((session) => {
        setAuthToken(session?.access_token ?? null);
      })
      .catch(() => null);
  }, []);

  // Fetch moon phase context
  let moonPhase: string | undefined;
  try {
    const moonData = moonPhaseAPI.getCurrentMoonPhase();
    moonPhase = moonData.name;
  } catch {
    /* non-fatal */
  }

  // Public API origin when configured, otherwise localhost for local development.
  const apiBaseUrl = SOVEREIGN_API_URL;

  // TanStack AI useChat hook integration (XHR-based NDJSON streaming)
  const connection = xhrHttpStream(`${apiBaseUrl}/api/ai/chat`, () => ({
    headers: {
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      'x-ai-sdk': aiSdk,
    },
    body: {
      context: {
        role: userRole ?? 'teacher',
        schoolName: user?.school_id ? 'Gurudevi School' : undefined, // fallback or resolved school name
        activeGaps: activeGaps.map((g) => ({
          type: g.type,
          title: g.title,
          priority: g.priority,
          suggestedAction: g.suggestedAction,
        })),
        orientationSeeds: user?.orientation_seeds ?? null,
        moonPhase,
        billingMode,
        byokKey: byokKey || undefined,
        privacyMode,
        aiSdk,
      },
    },
  }));

  const {
    messages: rawMessages,
    sendMessage,
    clear,
    status,
    error,
  } = useChat({
    connection,
  });

  const [input, setInput] = useState('');

  const handleSubmit = useCallback(() => {
    if (!input.trim()) return;
    const content = input.trim();
    setInput('');
    void sendMessage(content);
  }, [input, sendMessage]);

  const mappedMessages: Message[] = (rawMessages || [])
    .filter((msg) => msg.role !== 'system')
    .map((msg) => {
      const content = msg.parts
        .map((part) => {
          if (part.type === 'text') {
            return part.content;
          }
          return '';
        })
        .join('');

      return {
        id: msg.id,
        role: msg.role === 'user' ? 'user' : 'assistant',
        content,
        timestamp: msg.createdAt ? new Date(msg.createdAt).getTime() : Date.now(),
      };
    });

  /**
   * Workflow Assistant: Structural Repair
   * Triggers the TimetableScheduler to heal annual structural gaps.
   */
  const generateTimetable = useCallback(async (schoolId: string) => {
    const draft = await TimetableScheduler.generateDraft(schoolId, {
      maxDailyPeriods: 7,
      mandatorySubjects: ['Math', 'Science', 'Sinhala', 'English'],
      teacherPreferences: true,
    });

    setLastTimetableDraft(draft);
    return draft;
  }, []);

  /**
   * Checks for real operational gaps from Supabase
   */
  const refreshStatus = useCallback(async () => {
    setIsRefreshingGaps(true);
    const citizen = await identityAPI.identifyActiveCitizen().catch(() => null);
    const myId = citizen?.id || null;
    if (!myId) {
      setActiveGaps([]);
      setIsRefreshingGaps(false);
      return [];
    }

    let gaps: CoordinationGap[] = [];
    try {
      // noUncheckedIndexedAccess: index [0] is statically optional.
      const today = new Date().toISOString().split('T')[0] ?? '';
      const { data: classrooms } = await supabase
        .from('classrooms')
        .select('id, name')
        .eq('teacher_id', myId)
        .limit(5);

      if (classrooms?.length) {
        gaps = await detectCoordinationGaps(supabase, classrooms, today);
      }
    } catch {
      // Non-fatal AI context enrichment is best-effort
    }

    setActiveGaps(gaps);
    setIsRefreshingGaps(false);
    return gaps;
  }, []);

  return {
    messages: mappedMessages,
    input,
    setInput,
    handleSubmit,
    sendMessage,
    clearHistory: clear,
    isThinking: status === 'streaming' || status === 'submitted',
    activeGaps,
    lastTimetableDraft,
    refreshStatus,
    generateTimetable,
    billingMode,
    setBillingMode,
    byokKey,
    setByokKey,
    privacyMode,
    setPrivacyMode,
    aiSdk,
    setAiSdk,
    error,
    // Workspace-aware quick actions for teacher workflow
    quickActions: {
      // Mark attendance for a classroom
      markAttendance: async (classroomId: string) => {
        const response = await fetch(`${SOVEREIGN_API_URL}/api/ai/action`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
          body: JSON.stringify({ action: 'mark_attendance', classroomId }),
        });
        return response.json();
      },
      // Create assignment for a classroom
      createAssignment: async (classroomId: string, title: string, dueDate: string) => {
        const response = await fetch(`${SOVEREIGN_API_URL}/api/ai/action`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
          body: JSON.stringify({ action: 'create_assignment', classroomId, title, dueDate }),
        });
        return response.json();
      },
      // Generate gradebook summary
      generateGradebookSummary: async (classroomId: string) => {
        const response = await fetch(`${SOVEREIGN_API_URL}/api/ai/action`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
          body: JSON.stringify({ action: 'gradebook_summary', classroomId }),
        });
        return response.json();
      },
      // Get attendance summary for principal/founder
      getAttendanceSummary: async (schoolId: string) => {
        const response = await fetch(`${SOVEREIGN_API_URL}/api/ai/action`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
          body: JSON.stringify({ action: 'attendance_summary', schoolId }),
        });
        return response.json();
      },
    },
  };
}
