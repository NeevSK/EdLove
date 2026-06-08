import { authAPI, identityAPI, moonPhaseAPI, supabase } from '@repo/core/api';
import { usePermissions, useStore } from '@repo/core/logic';

import { useCallback, useState } from 'react';
import { type CoordinationGap, TimetableScheduler } from '../api/agents';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  gap?: CoordinationGap; // Link to a specific school gap if any
}

/**
 * useAIAgent hook (Workflow Assistant)
 * Manages the conversational state and proactive interventions.
 */
export function useAIAgent() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content:
        'Welcome to the Sanctuary. I am monitoring the school flow. How can I assist you today?',
      timestamp: Date.now(),
    },
  ]);
  const [isThinking, setIsThinking] = useState(false);
  const [activeGaps, setActiveGaps] = useState<CoordinationGap[]>([]);
  const [lastTimetableDraft, setLastTimetableDraft] = useState<any>(null);
  const { can } = usePermissions();
  const userRole = useStore((state) => state.activeBond?.capacity ?? null);
  const user = useStore((state) => state.user);

  /**
   * Workflow Assistant: Structural Repair
   * Triggers the TimetableScheduler to heal annual structural gaps.
   */
  const generateTimetable = useCallback(async (schoolId: string) => {
    setIsThinking(true);
    const draft = await TimetableScheduler.generateDraft(schoolId, {
      maxDailyPeriods: 7,
      mandatorySubjects: ['Math', 'Science', 'Sinhala', 'English'],
      teacherPreferences: true,
    });

    setLastTimetableDraft(draft);
    setIsThinking(false);
    return draft;
  }, []);

  /**
   * Checks for real operational gaps from Supabase:
   * - Attendance not yet marked today
   * - Overdue assignments with ungraded submissions
   * Falls back to empty array on any error  non-fatal.
   */
  const refreshStatus = useCallback(async () => {
    const citizen = await identityAPI.identifyActiveCitizen().catch(() => null);
    const myId = citizen?.id || null;
    if (!myId) {
      setActiveGaps([]);
      return [];
    }

    const gaps: CoordinationGap[] = [];

    try {
      // 1. Classrooms with no attendance today
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

        // 2. Assignments overdue with ungraded submissions
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

          // Fetch all ungraded submissions for overdue assignments in a single query
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
      // Non-fatal  AI context enrichment is best-effort
    }

    setActiveGaps(gaps);
    return gaps;
  }, []);

  /**
   * Send a message to the real AI assistant edge function.
   * Falls back to local Socratic generator if the edge function is unreachable.
   */
  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) return;

      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsThinking(true);

      // Build context for the edge function
      const conversationHistory = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      // Get moon phase for context (best-effort, non-blocking)
      let moonPhase: string | undefined;
      try {
        const moonData = moonPhaseAPI.getCurrentMoonPhase();
        moonPhase = moonData.name;
      } catch {
        /* non-fatal */
      }

      // Fetch school name if available (best-effort)
      let schoolName: string | undefined;
      if (user?.school_id) {
        try {
          const { data } = await supabase
            .from('schools')
            .select('name')
            .eq('id', user.school_id)
            .maybeSingle();
          schoolName = data?.name;
        } catch {
          /* non-fatal */
        }
      }

      try {
        // getSession() here is correct: we only need the JWT access_token to call
        // the edge function  NOT session.user.id for any DB query.
        const session = await authAPI.getAuthSession();
        const token = session?.access_token;

        if (!token) {
          throw new Error('No auth token');
        }

        const response = await supabase.functions.invoke('ai-assistant', {
          body: {
            message: content,
            history: conversationHistory,
            context: {
              role: userRole ?? 'teacher',
              schoolName,
              activeGaps,
              orientationSeeds: user?.orientation_seeds ?? null,
              moonPhase,
            },
          },
        });

        const reply = response.data?.reply as string | undefined;

        if (reply) {
          setMessages((prev) => [
            ...prev,
            {
              id: (Date.now() + 1).toString(),
              role: 'assistant',
              content: reply,
              timestamp: Date.now(),
            },
          ]);
          return;
        }
        throw new Error('Empty reply from edge function');
      } catch (err) {
        console.warn('[useAIAgent] edge function error, falling back to local:', err);
        // Local fallback  still Socratic, just not LLM-powered
        const fallback = generateLocalFallback(content, userRole, can);
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: fallback,
            timestamp: Date.now(),
          },
        ]);
      } finally {
        setIsThinking(false);
      }
    },
    [messages, userRole, user, activeGaps, can],
  );

  const clearHistory = useCallback(() => {
    setMessages([
      {
        id: '1',
        role: 'assistant',
        content:
          'Welcome to the Sanctuary. I am monitoring the school flow. How can I assist you today?',
        timestamp: Date.now(),
      },
    ]);
  }, []);

  return {
    messages,
    isThinking,
    activeGaps,
    lastTimetableDraft,
    sendMessage,
    refreshStatus,
    generateTimetable,
    clearHistory,
  };
}

/**
 * Local Socratic fallback  used when the edge function is unreachable.
 * Keeps the AI feeling present even without network.
 */
function generateLocalFallback(input: string, _role: string | null, can: any): string {
  const lowerInput = input.toLowerCase();
  if (lowerInput.includes('lesson') || lowerInput.includes('class')) {
    return 'Lessons are more than delivery  they are shared experiences. How was the energy in the room?';
  }
  if (lowerInput.includes('tired') || lowerInput.includes('stress')) {
    return 'Rest is not a luxury; it is a vital part of the cycle. How can you find a moment of stillness today?';
  }
  if (lowerInput.includes('student')) {
    return 'Each student is a world unto themselves. What did one of them teach you today?';
  }
  if (can('read', 'PrincipalPulse')) {
    return 'Leading a school means holding many realities at once. Which one needs your attention most right now?';
  }
  const reflections = [
    'That is something worth sitting with. What feels most true about it to you?',
    'If we look at this through the lens of growth, what becomes possible?',
    'Reflection is the first step toward transformation. What else do you see in this situation?',
    'That sounds significant. How does this align with your deeper values?',
  ];
  return reflections[Math.floor(Math.random() * reflections.length)] ?? reflections[0]!;
}
