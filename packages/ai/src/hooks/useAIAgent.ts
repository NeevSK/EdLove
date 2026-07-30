import { authAPI, identityAPI, moonPhaseAPI, supabase } from '@repo/core/api';
import { cryptoManager, usePermissions, useStore } from '@repo/core/logic';
import { fetchServerSentEvents, useChat } from '@tanstack/ai-react';
import type { MultimodalContent } from '@tanstack/ai-client';
import { useCallback, useEffect, useState } from 'react';
import { type CoordinationGap, TimetableScheduler } from '@repo/ai/api/agents';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  gap?: CoordinationGap;
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
      } catch (err) {
        console.warn('Failed to load AI secure store config:', err);
      }
    }
    loadConfig();
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

  const apiBaseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

  // TanStack AI useChat hook integration
  const connection = fetchServerSentEvents(
    `${apiBaseUrl}/api/ai/chat`,
    () => ({
      headers: authToken
        ? {
            Authorization: `Bearer ${authToken}`,
          }
        : undefined,
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
        },
      },
    })
  );

  const { messages: rawMessages, sendMessage, clear, status, error } = useChat({
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

    const gaps: CoordinationGap[] = [];

    try {
      const today = new Date().toISOString().split('T')[0];
      const { data: classrooms } = await supabase
        .from('classrooms')
        .select('id, name')
        .eq('teacher_id', myId)
        .limit(5);

      if (classrooms?.length) {
        const { data: markedToday } = await supabase
          .from('attendance')
          .select('classroom_id')
          .in(
            'classroom_id',
            classrooms.map((c: any) => c.id),
          )
          .eq('date', today);

        const markedIds = new Set((markedToday ?? []).map((r: any) => r.classroom_id));
        classrooms
          .filter((c: any) => !markedIds.has(c.id))
          .forEach((c: any) => {
            gaps.push({
              id: `attendance-${c.id}`,
              type: 'relief',
              title: `Attendance pending: ${c.name}`,
              description: `Today's attendance for ${c.name} has not been recorded yet.`,
              priority: 'high',
              suggestedAction: 'Mark attendance now',
              context: { classroomId: c.id, classroomName: c.name },
            });
          });

        const { data: overdue } = await supabase
          .from('assignments')
          .select('id, title, classroom_id, classrooms(name)')
          .in(
            'classroom_id',
            classrooms.map((c: any) => c.id),
          )
          .lte('due_date', today)
          .limit(5);

        if (overdue?.length) {
          const overdueAssignments = overdue as any[];
          const overdueIds = overdueAssignments.map((a: any) => a.id);

          const { data: ungradedSubmissions } = await supabase
            .from('submissions')
            .select('assignment_id')
            .in('assignment_id', overdueIds)
            .is('grade', null);

          const ungradedCounts = new Map<string, number>();
          for (const s of (ungradedSubmissions ?? []) as any[]) {
            const assignmentId = s.assignment_id as string;
            ungradedCounts.set(assignmentId, (ungradedCounts.get(assignmentId) ?? 0) + 1);
          }

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
        }
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
    error,
  };
}
