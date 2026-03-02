import { useState, useCallback } from 'react';
import { useStore } from '../store/useStore';
import { supabase } from '../lib/supabase';
import { TimetableScheduler, CoordinationGap } from '../api/agents';

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
            content: 'Welcome to the Sanctuary. I am monitoring the school flow. How can I assist you today?',
            timestamp: Date.now(),
        },
    ]);
    const [isThinking, setIsThinking] = useState(false);
    const [activeGaps, setActiveGaps] = useState<CoordinationGap[]>([]);
    const [lastTimetableDraft, setLastTimetableDraft] = useState<any>(null);
    const userRole = useStore((state) => state.userRole);

    /**
     * Workflow Assistant: Structural Repair
     * Triggers the TimetableScheduler to heal annual structural gaps.
     */
    const generateTimetable = useCallback(async (schoolId: string) => {
        setIsThinking(true);
        // Simulate processing time for "Agentic Deliberation"
        await new Promise(resolve => setTimeout(resolve, 2000));

        const draft = TimetableScheduler.generateDraft(schoolId, {
            maxDailyPeriods: 7,
            mandatorySubjects: ['Math', 'Science', 'Sinhala', 'English'],
            teacherPreferences: true
        });

        setLastTimetableDraft(draft);
        setIsThinking(false);
        return draft;
    }, []);

    /**
     * Checks for real operational gaps from Supabase:
     * - Attendance not yet marked today
     * - Overdue assignments with ungraded submissions
     * Falls back to empty array on any error — non-fatal.
     */
    const refreshStatus = useCallback(async () => {
        const { data: { user } } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));
        if (!user) {
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
                .eq('teacher_id', user.id)
                .limit(5);

            if (classrooms?.length) {
                const { data: markedToday } = await supabase
                    .from('attendance')
                    .select('classroom_id')
                    .in('classroom_id', classrooms.map((c: any) => c.id))
                    .eq('date', today);

                const markedIds = new Set((markedToday ?? []).map((r: any) => r.classroom_id));
                classrooms.filter((c: any) => !markedIds.has(c.id)).forEach((c: any) => {
                    gaps.push({
                        id: `attendance-${c.id}`,
                        type: 'relief',
                        title: `Attendance pending: ${c.name}`,
                        description: `Today\'s attendance for ${c.name} has not been recorded yet.`,
                        priority: 'high',
                        suggestedAction: 'Mark attendance now',
                        context: { classroomId: c.id, classroomName: c.name },
                    });
                });

                // 2. Assignments overdue with ungraded submissions
                const { data: overdue } = await supabase
                    .from('assignments')
                    .select('id, title, classroom_id, classrooms(name)')
                    .in('classroom_id', classrooms.map((c: any) => c.id))
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
                        ungradedCounts.set(
                            assignmentId,
                            (ungradedCounts.get(assignmentId) ?? 0) + 1
                        );
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
                                context: { assignmentId: a.id, classroomId: a.classroom_id, ungradedCount: count },
                            });
                        }
                    }
                }
            }
        } catch {
            // Non-fatal — AI context enrichment is best-effort
        }

        setActiveGaps(gaps);
        return gaps;
    }, []);

    const sendMessage = useCallback(async (content: string) => {
        if (!content.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content,
            timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setIsThinking(true);

        // Simulate AI Response Delay
        setTimeout(() => {
            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: generateResponse(content, userRole),
                timestamp: Date.now(),
            };
            setMessages((prev) => [...prev, assistantMessage]);
            setIsThinking(false);
        }, 1500);
    }, [userRole]);

    const clearHistory = useCallback(() => {
        setMessages([]);
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
 * Socratic Response Generator (Mock for Alpha)
 * In production, this will call the actual LLM endpoint.
 */
function generateResponse(input: string, role: string | null): string {
    const reflections = [
        "That is an interesting perspective. Why do you feel that is the core of the issue?",
        "I hear you. If we look at this through the lens of growth, what becomes possible?",
        "The path of a teacher is often complex. How can we simplify this for your students?",
        "Reflection is the first step toward transformation. What else do you see in this situation?",
        "That sounds significant. How does this align with your deeper values?"
    ];

    // Simple keyword matching for a more "aware" feel
    const lowerInput = input.toLowerCase();
    if (lowerInput.includes('lesson') || lowerInput.includes('class')) {
        return "Lessons are more than just delivery; they are shared experiences. How was the energy in the room?";
    }
    if (lowerInput.includes('tired') || lowerInput.includes('stress')) {
        return "Rest is not a luxury; it is a vital part of the cycle. How can you find a moment of stillness today?";
    }
    if (lowerInput.includes('student')) {
        return "Each student is a world unto themselves. What did one of them teach you today?";
    }

    return reflections[Math.floor(Math.random() * reflections.length)] || '';
}
