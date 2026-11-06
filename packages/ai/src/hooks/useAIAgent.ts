import { cryptoVault } from '@repo/core/platform/drivers/cryptoVault';
import { useAuthStore } from '@repo/core/store';
import { useScopeSessionStore } from '@repo/core/store/scopeSession';
import { type CoordinationGap, TimetableScheduler } from '@repo/ai/api/agents';
import { supabaseClient as supabase } from '@repo/core/adapters/supabaseClient';
import { authAPI, identityAPI, moonPhaseAPI, SOVEREIGN_API_URL } from '@repo/core/api/client';
import {
  type AgePedagogyBand,
  type CompanionMemoryItem,
  
  resolveAgePedagogyProfile,
  runAttendanceAudit,
  sanitizeCompanionMemories,
  useAIContextStore,
  usePermissions,
} from '@repo/core';
import type { MultimodalContent } from '@tanstack/ai-client';
import { useChat, xhrHttpStream } from '@tanstack/ai-react';
import { useCallback, useEffect, useState } from 'react';

export interface MessageCitation {
  title: string;
  url: string;
  snippet: string;
  source?: string;
}

export interface MessageArtifact {
  artifactId: string;
  title: string;
  kind: 'lesson_plan' | 'rubric' | 'study_guide' | 'code' | 'document';
  language: string;
  content: string;
}

export interface MessageActionProposal {
  proposalId: string;
  title: string;
  targetDomain: string;
  summaryDraft: string;
  suggestedAction: string;
  status: 'pending_review' | 'approved' | 'rejected';
}

export interface MessageToolCall {
  id: string;
  name: string;
  arguments: string;
  state: string;
  outputSummary?: string;
}

export interface ComposerAttachment {
  id: string;
  label: string;
  kind: 'context_card' | 'note' | 'image_ref';
  content: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  gap?: CoordinationGap;
  thinkingText?: string;
  toolCalls?: MessageToolCall[];
  citations?: MessageCitation[];
  artifacts?: MessageArtifact[];
  proposals?: MessageActionProposal[];
}

export interface AiThreadSummary {
  threadId: string;
  title: string;
  messageCount: number;
  lastMessageAt: string;
  privacyMode: 'saved' | 'temporary' | 'incognito';
}

export interface AiQuotaStatus {
  tier: 'FREE' | 'PRO' | 'INSTITUTIONAL';
  dailyLimit: number;
  usedToday: number;
  remainingToday: number;
  agentUnlocked: boolean;
}

export interface DurableAgentRunSummary {
  runId: string;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'promoted';
  createdAt: string;
  updatedAt: string;
  runType: string | null;
  mode: string | null;
  classroomId: string | null;
  studentId: string | null;
  summaryDraft?: string | null;
  promotedTeacherNoteId?: string | null;
  timeline?: Array<{ action: string; createdAt: string }>;
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
  const userRole = useScopeSessionStore((state) => state.snapshot?.activeBond?.capacity ?? null);
  const user = useAuthStore(state => state.user);
  const isContextDetached = useAIContextStore((s) => s.isDetachedForSession);
  const setContextDetached = useAIContextStore((s) => s.setDetachedForSession);
  const getSanitizedEnvelope = useAIContextStore((s) => s.getSanitizedEnvelope);
  const rawContextSlices = useAIContextStore((s) => s.rawSlices);
  const activeContextDomain = useAIContextStore((s) => s.activeDomain);
  const domainEnvelope = isContextDetached ? null : getSanitizedEnvelope();

  // Billing configuration states
  const [billingMode, setBillingModeState] = useState<'baseline' | 'byok' | 'purchased'>(
    'baseline',
  );
  const [byokKey, setByokKeyState] = useState<string>('');
  const [privacyMode, setPrivacyModeState] = useState<'saved' | 'temporary' | 'incognito'>('saved');
  const [aiSdk, setAiSdkState] = useState<'tanstack' | 'vercel'>('tanstack');
  const [customBaseUrl, setCustomBaseUrlState] = useState<string>('');
  const [authToken, setAuthToken] = useState<string | null>(null);

  // Thread & History states
  const [threadId, setThreadId] = useState<string>(() => `thread-${Date.now()}`);
  const [threads, setThreads] = useState<AiThreadSummary[]>([]);
  const [hydratedMessages, setHydratedMessages] = useState<Message[]>([]);
  const [isLoadingThreads, setIsLoadingThreads] = useState(false);

  // Quota state
  const [quota, setQuota] = useState<AiQuotaStatus | null>(null);

  // Durable Agent states
  const [agentRuns, setAgentRuns] = useState<DurableAgentRunSummary[]>([]);
  const [activeAgentRun, setActiveAgentRun] = useState<DurableAgentRunSummary | null>(null);
  const [isDispatchingAgent, setIsDispatchingAgent] = useState(false);

  // 4-Sphere Companion Lens, Memory & World Grounding states
  const [ageBand, setAgeBandState] = useState<AgePedagogyBand | undefined>(undefined);
  const [enableWorldSearch, setEnableWorldSearchState] = useState<boolean>(false);
  const [reasoningEffort, setReasoningEffortState] = useState<'auto' | 'deep'>('auto');
  const [executionMode, setExecutionModeState] = useState<'chat' | 'agent'>('chat');
  const [pendingAttachments, setPendingAttachments] = useState<ComposerAttachment[]>([]);
  const [companionMemories, setCompanionMemoriesState] = useState<CompanionMemoryItem[]>([]);
  const activePedagogyProfile = resolveAgePedagogyProfile(userRole ?? 'teacher', ageBand);

  // Load configuration from local secure storage on mount
  useEffect(() => {
    async function loadConfig() {
      try {
        const storedMode = await cryptoVault.getItemAsync('ai_billing_mode');
        if (storedMode === 'baseline' || storedMode === 'byok' || storedMode === 'purchased') {
          setBillingModeState(storedMode);
        }
        const storedKey = await cryptoVault.getItemAsync('ai_byok_key');
        if (storedKey) {
          setByokKeyState(storedKey);
        }
        const storedPrivacy = await cryptoVault.getItemAsync('ai_privacy_mode');
        if (
          storedPrivacy === 'saved' ||
          storedPrivacy === 'temporary' ||
          storedPrivacy === 'incognito'
        ) {
          setPrivacyModeState(storedPrivacy);
        }
        const storedSdk = await cryptoVault.getItemAsync('ai_sdk');
        if (storedSdk === 'tanstack' || storedSdk === 'vercel') {
          setAiSdkState(storedSdk);
        }
        const storedBaseUrl = await cryptoVault.getItemAsync('ai_custom_base_url');
        if (storedBaseUrl) {
          setCustomBaseUrlState(storedBaseUrl);
        }
        const storedAgeBand = await cryptoVault.getItemAsync('ai_age_pedagogy_band');
        if (
          storedAgeBand === 'early_years_6_9' ||
          storedAgeBand === 'middle_years_10_13' ||
          storedAgeBand === 'adolescent_14_18' ||
          storedAgeBand === 'adult_educator' ||
          storedAgeBand === 'adult_leader' ||
          storedAgeBand === 'adult_guardian'
        ) {
          setAgeBandState(storedAgeBand);
        }
        const storedWorldSearch = await cryptoVault.getItemAsync('ai_enable_world_search');
        if (storedWorldSearch === 'true') {
          setEnableWorldSearchState(true);
        }
        const storedMemories = await cryptoVault.getItemAsync('ai_companion_memories');
        if (storedMemories) {
          const parsed = JSON.parse(storedMemories) as CompanionMemoryItem[];
          setCompanionMemoriesState(sanitizeCompanionMemories(parsed));
        }
      } catch (err) {
        console.warn('Failed to load AI secure store config:', err);
      }
    }
    // Self-contained try/catch; intentionally not awaited by the effect.
    void loadConfig();
  }, []);

  const setAgeBand = useCallback(async (band: AgePedagogyBand | undefined) => {
    setAgeBandState(band);
    try {
      await cryptoVault.setItemAsync('ai_age_pedagogy_band', band ?? '');
    } catch (err) {
      console.warn('Failed to persist age pedagogy band:', err);
    }
  }, []);

  const setEnableWorldSearch = useCallback(async (enabled: boolean) => {
    setEnableWorldSearchState(enabled);
    try {
      await cryptoVault.setItemAsync('ai_enable_world_search', enabled ? 'true' : 'false');
    } catch (err) {
      console.warn('Failed to persist world search toggle:', err);
    }
  }, []);

  const addCompanionMemory = useCallback(
    async (fact: string, category: CompanionMemoryItem['category'] = 'context') => {
      const next = sanitizeCompanionMemories([
        {
          id: `mem-${Date.now()}`,
          category,
          fact,
          updatedAt: new Date().toISOString(),
        },
        ...companionMemories,
      ]);
      setCompanionMemoriesState(next);
      try {
        await cryptoVault.setItemAsync('ai_companion_memories', JSON.stringify(next));
      } catch (err) {
        console.warn('Failed to persist companion memories:', err);
      }
    },
    [companionMemories],
  );

  const removeCompanionMemory = useCallback(
    async (memoryId: string) => {
      const next = companionMemories.filter((m) => m.id !== memoryId);
      setCompanionMemoriesState(next);
      try {
        await cryptoVault.setItemAsync('ai_companion_memories', JSON.stringify(next));
      } catch (err) {
        console.warn('Failed to persist companion memories:', err);
      }
    },
    [companionMemories],
  );

  const setCustomBaseUrl = useCallback(async (url: string) => {
    const trimmed = url.trim();
    setCustomBaseUrlState(trimmed);
    try {
      await cryptoVault.setItemAsync('ai_custom_base_url', trimmed);
    } catch (err) {
      console.warn('Failed to persist custom base url:', err);
    }
  }, []);

  const setAiSdk = useCallback(async (sdk: 'tanstack' | 'vercel') => {
    setAiSdkState(sdk);
    try {
      await cryptoVault.setItemAsync('ai_sdk', sdk);
    } catch (err) {
      console.warn('Failed to persist AI SDK preference:', err);
    }
  }, []);

  const setBillingMode = useCallback(async (mode: 'baseline' | 'byok' | 'purchased') => {
    setBillingModeState(mode);
    try {
      await cryptoVault.setItemAsync('ai_billing_mode', mode);
    } catch (err) {
      console.warn('Failed to persist billing mode:', err);
    }
  }, []);

  const setByokKey = useCallback(async (key: string) => {
    setByokKeyState(key);
    try {
      await cryptoVault.setItemAsync('ai_byok_key', key);
    } catch (err) {
      console.warn('Failed to persist byok key:', err);
    }
  }, []);

  const setPrivacyMode = useCallback(async (mode: 'saved' | 'temporary' | 'incognito') => {
    setPrivacyModeState(mode);
    try {
      await cryptoVault.setItemAsync('ai_privacy_mode', mode);
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

  // Public API origin when configured, or optional Local BYOS Loopback bridge.
  const apiBaseUrl = customBaseUrl || SOVEREIGN_API_URL;

  // TanStack AI useChat hook integration (XHR-based NDJSON streaming)
  const connection = xhrHttpStream(`${apiBaseUrl}/api/ai/chat`, () => ({
    headers: {
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      'x-ai-sdk': aiSdk,
    },
    body: {
      threadId,
      context: {
        role: userRole ?? 'teacher',
        ageBand,
        enableWorldSearch,
        executionMode,
        reasoningEffort,
        companionMemories: privacyMode === 'incognito' ? [] : companionMemories,
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
        domainEnvelope: domainEnvelope ?? undefined,
      },
    },
  }));

  const {
    messages: rawMessages,
    sendMessage,
    stop,
    reload,
    clear,
    status,
    error,
  } = useChat({
    connection,
  });

  const [input, setInput] = useState('');

  const attachContextSnippet = useCallback(
    (label: string, content: string, kind: ComposerAttachment['kind'] = 'context_card') => {
      setPendingAttachments((prev) => [
        ...prev,
        { id: `att-${Date.now()}-${prev.length}`, label, kind, content },
      ]);
    },
    [],
  );

  const removeAttachment = useCallback((attachmentId: string) => {
    setPendingAttachments((prev) => prev.filter((a) => a.id !== attachmentId));
  }, []);

  const handleSubmit = useCallback(() => {
    if (!input.trim() && pendingAttachments.length === 0) return;
    const attachmentPrefix =
      pendingAttachments.length > 0
        ? pendingAttachments
            .map((a) => `[Attached ${a.label}]: ${a.content}`)
            .join('\n') + '\n\n'
        : '';
    const content = `${attachmentPrefix}${input.trim()}`.trim();
    setInput('');
    setPendingAttachments([]);
    void sendMessage(content);
  }, [input, pendingAttachments, sendMessage]);

  const editAndResendMessage = useCallback(
    (newContent: string) => {
      const trimmed = newContent.trim();
      if (!trimmed) return;
      void sendMessage(trimmed);
    },
    [sendMessage],
  );

  const streamMessages: Message[] = (rawMessages || [])
    .filter((msg) => msg.role !== 'system')
    .map((msg) => {
      const textParts: string[] = [];
      const thinkingParts: string[] = [];
      const toolCalls: MessageToolCall[] = [];
      const citations: MessageCitation[] = [];
      const artifacts: MessageArtifact[] = [];
      const proposals: MessageActionProposal[] = [];
      const resultByCallId = new Map<string, string>();

      for (const part of msg.parts) {
        if (part.type === 'tool-result') {
          const rawContent =
            typeof part.content === 'string' ? part.content : JSON.stringify(part.content ?? {});
          resultByCallId.set(part.toolCallId, rawContent);
          try {
            const parsed = JSON.parse(rawContent) as Record<string, any>;
            if (Array.isArray(parsed.citations)) {
              for (const c of parsed.citations) {
                if (c?.title && c?.url) {
                  citations.push({
                    title: String(c.title),
                    url: String(c.url),
                    snippet: String(c.snippet ?? ''),
                    source: c.source ? String(c.source) : undefined,
                  });
                }
              }
            }
            if (parsed.artifactId && parsed.title && parsed.content) {
              artifacts.push({
                artifactId: String(parsed.artifactId),
                title: String(parsed.title),
                kind: parsed.kind ?? 'document',
                language: String(parsed.language ?? 'markdown'),
                content: String(parsed.content),
              });
            }
            if (parsed.proposalId && parsed.title && parsed.summaryDraft) {
              proposals.push({
                proposalId: String(parsed.proposalId),
                title: String(parsed.title),
                targetDomain: String(parsed.targetDomain ?? 'workspace'),
                summaryDraft: String(parsed.summaryDraft),
                suggestedAction: String(parsed.suggestedAction ?? 'Approve & Promote'),
                status: 'pending_review',
              });
            }
          } catch {
            // Non-JSON tool result text
          }
        }
      }

      for (const part of msg.parts) {
        if (part.type === 'text') {
          textParts.push(part.content);
        } else if (part.type === 'thinking') {
          if (part.content) thinkingParts.push(part.content);
        } else if (part.type === 'tool-call') {
          const resultSummary =
            resultByCallId.get(part.id) ??
            (part.output ? JSON.stringify(part.output) : undefined);
          toolCalls.push({
            id: part.id,
            name: part.name,
            arguments: part.arguments ?? '',
            state: part.state ?? 'complete',
            outputSummary: resultSummary ? resultSummary.slice(0, 280) : undefined,
          });
        }
      }

      return {
        id: msg.id,
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: textParts.join(''),
        timestamp: msg.createdAt ? new Date(msg.createdAt).getTime() : Date.now(),
        thinkingText: thinkingParts.length > 0 ? thinkingParts.join('\n') : undefined,
        toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
        citations: citations.length > 0 ? citations : undefined,
        artifacts: artifacts.length > 0 ? artifacts : undefined,
        proposals: proposals.length > 0 ? proposals : undefined,
      };
    });

  const mappedMessages: Message[] = [...hydratedMessages, ...streamMessages];

  /**
   * Thread History & Rewind API
   */
  const loadThreads = useCallback(async () => {
    if (!authToken) return [];
    setIsLoadingThreads(true);
    try {
      const res = await fetch(`${SOVEREIGN_API_URL}/api/ai/threads`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (!res.ok) return [];
      const data = (await res.json()) as { threads?: AiThreadSummary[] };
      const list = data.threads ?? [];
      setThreads(list);
      return list;
    } catch {
      return [];
    } finally {
      setIsLoadingThreads(false);
    }
  }, [authToken]);

  const selectThread = useCallback(
    async (selectedId: string) => {
      setThreadId(selectedId);
      clear();
      if (!authToken) return;
      try {
        const res = await fetch(
          `${SOVEREIGN_API_URL}/api/ai/threads/${encodeURIComponent(selectedId)}`,
          {
            headers: { Authorization: `Bearer ${authToken}` },
          },
        );
        if (!res.ok) return;
        const data = (await res.json()) as {
          messages?: Array<{
            id: string;
            role: 'user' | 'assistant';
            content: string;
            createdAt: string;
          }>;
        };
        const loaded: Message[] = (data.messages ?? []).map((m) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          timestamp: new Date(m.createdAt).getTime(),
        }));
        setHydratedMessages(loaded);
      } catch {
        /* non-fatal */
      }
    },
    [authToken, clear],
  );

  const deleteThread = useCallback(
    async (targetThreadId: string) => {
      if (!authToken) return;
      try {
        await fetch(`${SOVEREIGN_API_URL}/api/ai/threads/${encodeURIComponent(targetThreadId)}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${authToken}` },
        });
        setThreads((prev) => prev.filter((t) => t.threadId !== targetThreadId));
        if (threadId === targetThreadId) {
          setThreadId(`thread-${Date.now()}`);
          setHydratedMessages([]);
          clear();
        }
      } catch {
        /* non-fatal */
      }
    },
    [authToken, threadId, clear],
  );

  const startNewThread = useCallback(() => {
    setThreadId(`thread-${Date.now()}`);
    setHydratedMessages([]);
    clear();
  }, [clear]);

  /**
   * Quota & Entitlements API
   */
  const refreshQuota = useCallback(async () => {
    if (!authToken) return null;
    try {
      const res = await fetch(`${SOVEREIGN_API_URL}/api/ai/quota`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (!res.ok) return null;
      const data = (await res.json()) as AiQuotaStatus;
      setQuota(data);
      return data;
    } catch {
      return null;
    }
  }, [authToken]);

  /**
   * Durable Agent Mission & Proposal Review API
   */
  const loadAgentRuns = useCallback(async () => {
    if (!authToken) return [];
    try {
      const res = await fetch(`${SOVEREIGN_API_URL}/api/durable-agents/runs?limit=8`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (!res.ok) return [];
      const data = (await res.json()) as { runs?: DurableAgentRunSummary[] };
      const list = data.runs ?? [];
      setAgentRuns(list);
      if (list[0]) {
        const detailRes = await fetch(
          `${SOVEREIGN_API_URL}/api/durable-agents/runs/${encodeURIComponent(list[0].runId)}`,
          {
            headers: { Authorization: `Bearer ${authToken}` },
          },
        );
        if (detailRes.ok) {
          const detail = (await detailRes.json()) as DurableAgentRunSummary;
          setActiveAgentRun(detail);
        }
      }
      return list;
    } catch {
      return [];
    }
  }, [authToken]);

  const dispatchAgentMission = useCallback(
    async (params: {
      classroomId: string;
      focusPrompt?: string;
      capability?: 'teacher-summary' | 'student-support';
      studentId?: string;
    }) => {
      if (!authToken) return null;
      setIsDispatchingAgent(true);
      try {
        const capability = params.capability ?? 'teacher-summary';
        const res = await fetch(`${SOVEREIGN_API_URL}/api/durable-agents/${capability}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            classroomId: params.classroomId,
            studentId: params.studentId,
            mode: 'demo',
            reviewMode: 'teacher_review_required',
            evidenceScopes: ['attendance', 'assignments', 'curriculum'],
            focusPrompt: params.focusPrompt,
          }),
        });
        if (!res.ok) return null;
        const result = (await res.json()) as { runId: string; status: string };
        await loadAgentRuns();
        return result;
      } catch {
        return null;
      } finally {
        setIsDispatchingAgent(false);
      }
    },
    [authToken, loadAgentRuns],
  );

  const promoteAgentRun = useCallback(
    async (runId: string) => {
      if (!authToken) return null;
      try {
        const res = await fetch(
          `${SOVEREIGN_API_URL}/api/durable-agents/runs/${encodeURIComponent(runId)}/promote`,
          {
            method: 'POST',
            headers: { Authorization: `Bearer ${authToken}` },
          },
        );
        if (!res.ok) return null;
        const data = await res.json();
        await loadAgentRuns();
        return data;
      } catch {
        return null;
      }
    },
    [authToken, loadAgentRuns],
  );

  // Hydrate quota, threads, and recent agent runs when authToken becomes available
  useEffect(() => {
    if (authToken) {
      void refreshQuota();
      void loadThreads();
      void loadAgentRuns();
    }
  }, [authToken, refreshQuota, loadThreads, loadAgentRuns]);

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
    clearHistory: startNewThread,
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
    customBaseUrl,
    setCustomBaseUrl,
    threadId,
    threads,
    isLoadingThreads,
    loadThreads,
    selectThread,
    deleteThread,
    startNewThread,
    quota,
    refreshQuota,
    agentRuns,
    activeAgentRun,
    isDispatchingAgent,
    loadAgentRuns,
    dispatchAgentMission,
    promoteAgentRun,
    domainEnvelope,
    activeContextDomain,
    rawContextSlicesCount: rawContextSlices.length,
    isContextDetached,
    setContextDetached,
    ageBand,
    setAgeBand,
    activePedagogyProfile,
    enableWorldSearch,
    setEnableWorldSearch,
    companionMemories,
    addCompanionMemory,
    removeCompanionMemory,
    stopGeneration: stop,
    regenerateLastResponse: reload,
    editAndResendMessage,
    reasoningEffort,
    setReasoningEffort: setReasoningEffortState,
    executionMode,
    setExecutionMode: setExecutionModeState,
    pendingAttachments,
    attachContextSnippet,
    removeAttachment,
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