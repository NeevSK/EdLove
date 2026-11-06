import { useEffect } from 'react';
import { create } from 'zustand';

/**
 * The 5 bounded Sanctuary surfaces that can publish contextual state to the AI Companion.
 */
export type AIContextDomain = 'self' | 'workspace' | 'library' | 'community' | 'profile';

/**
 * 4-Tier Sensitivity Classification for AI Context Ingestion:
 * - `always_safe`: Ambient platform state (tab, role, circadian phase).
 * - `configurable_default_on`: Helpful operational & growth signals (e.g. Self goals/reminders, active classroom, selected library book). Toggleable at runtime.
 * - `explicit_attach_only`: Only included when the user explicitly taps "Ask AI about this item" (`explicitlyAttached: true`).
 * - `sacred_never_ingest`: Hard code veto on both client and server (e.g. Fire Journal, Voice Journal, Safeguarding). Cannot be overridden even by config.
 */
export type ContextSensitivityTier =
  | 'always_safe'
  | 'configurable_default_on'
  | 'explicit_attach_only'
  | 'sacred_never_ingest';

export type AIContextSlotId =
  // Self domain slots
  | 'self.goals_and_reminders'
  | 'self.study_rhythm'
  | 'self.mindful_pulse'
  | 'self.active_spaces'
  | 'self.orientation_seeds'
  | 'self.tomorrow_prep_draft'
  | 'self.thought_reframe_card'
  | 'self.fire_journal'
  | 'self.voice_journal'
  // Workspace domain slots
  | 'workspace.active_classroom'
  | 'workspace.coordination_gaps'
  | 'workspace.timetable_summary'
  | 'workspace.lesson_unit'
  // Library domain slots
  | 'library.active_resource'
  | 'library.search_filter'
  | 'library.curriculum_standard'
  // Community domain slots
  | 'community.active_mode'
  | 'community.active_circle'
  | 'community.post_draft'
  // Admin / Auth sacred slots (hard blocked)
  | 'admin.safeguarding_cases'
  | 'auth.raw_credentials';

export interface AIContextSlotPolicy {
  slotId: AIContextSlotId;
  domain: AIContextDomain;
  label: string;
  tier: ContextSensitivityTier;
  enabled: boolean;
}

export const SACRED_NEVER_INGEST_SLOTS = new Set<AIContextSlotId>([
  'self.fire_journal',
  'self.voice_journal',
  'admin.safeguarding_cases',
  'auth.raw_credentials',
]);

export const DEFAULT_AI_CONTEXT_POLICY: Record<AIContextSlotId, AIContextSlotPolicy> = {
  // Self — Configurable 'today' & growth signals (ON by default)
  'self.goals_and_reminders': {
    slotId: 'self.goals_and_reminders',
    domain: 'self',
    label: 'Personal Goals & Reminders',
    tier: 'configurable_default_on',
    enabled: true,
  },
  'self.study_rhythm': {
    slotId: 'self.study_rhythm',
    domain: 'self',
    label: 'Daily & Study Rhythm',
    tier: 'configurable_default_on',
    enabled: true,
  },
  'self.mindful_pulse': {
    slotId: 'self.mindful_pulse',
    domain: 'self',
    label: 'Mindful Minutes & Recovery Signal',
    tier: 'configurable_default_on',
    enabled: true,
  },
  'self.active_spaces': {
    slotId: 'self.active_spaces',
    domain: 'self',
    label: 'Pinned Today Spaces',
    tier: 'configurable_default_on',
    enabled: true,
  },
  'self.orientation_seeds': {
    slotId: 'self.orientation_seeds',
    domain: 'self',
    label: 'Learning Orientation Seeds',
    tier: 'configurable_default_on',
    enabled: true,
  },
  // Self — Explicit attach only (OFF unless user explicitly attaches)
  'self.tomorrow_prep_draft': {
    slotId: 'self.tomorrow_prep_draft',
    domain: 'self',
    label: 'Tomorrow Prep Note',
    tier: 'explicit_attach_only',
    enabled: true,
  },
  'self.thought_reframe_card': {
    slotId: 'self.thought_reframe_card',
    domain: 'self',
    label: 'Thought Reframe Card',
    tier: 'explicit_attach_only',
    enabled: true,
  },
  // Self — Sacred private reflection (NEVER ingested)
  'self.fire_journal': {
    slotId: 'self.fire_journal',
    domain: 'self',
    label: 'Fire Journal (Private Release)',
    tier: 'sacred_never_ingest',
    enabled: false,
  },
  'self.voice_journal': {
    slotId: 'self.voice_journal',
    domain: 'self',
    label: 'Voice Journal (Private Audio)',
    tier: 'sacred_never_ingest',
    enabled: false,
  },
  // Workspace
  'workspace.active_classroom': {
    slotId: 'workspace.active_classroom',
    domain: 'workspace',
    label: 'Active Classroom & Roster Summary',
    tier: 'configurable_default_on',
    enabled: true,
  },
  'workspace.coordination_gaps': {
    slotId: 'workspace.coordination_gaps',
    domain: 'workspace',
    label: 'Attendance & Grading Gaps',
    tier: 'configurable_default_on',
    enabled: true,
  },
  'workspace.timetable_summary': {
    slotId: 'workspace.timetable_summary',
    domain: 'workspace',
    label: 'Timetable Schedule Summary',
    tier: 'configurable_default_on',
    enabled: true,
  },
  'workspace.lesson_unit': {
    slotId: 'workspace.lesson_unit',
    domain: 'workspace',
    label: 'Active Lesson Unit',
    tier: 'configurable_default_on',
    enabled: true,
  },
  // Library
  'library.active_resource': {
    slotId: 'library.active_resource',
    domain: 'library',
    label: 'Selected Book / Resource Metadata',
    tier: 'configurable_default_on',
    enabled: true,
  },
  'library.search_filter': {
    slotId: 'library.search_filter',
    domain: 'library',
    label: 'Active Library Shelf & Search Query',
    tier: 'configurable_default_on',
    enabled: true,
  },
  'library.curriculum_standard': {
    slotId: 'library.curriculum_standard',
    domain: 'library',
    label: 'Curriculum Standard Alignment',
    tier: 'configurable_default_on',
    enabled: true,
  },
  // Community
  'community.active_mode': {
    slotId: 'community.active_mode',
    domain: 'community',
    label: 'Active Community Surface',
    tier: 'configurable_default_on',
    enabled: true,
  },
  'community.active_circle': {
    slotId: 'community.active_circle',
    domain: 'community',
    label: 'Active Circle / Group Topic',
    tier: 'configurable_default_on',
    enabled: true,
  },
  'community.post_draft': {
    slotId: 'community.post_draft',
    domain: 'community',
    label: 'Community Post Draft',
    tier: 'explicit_attach_only',
    enabled: true,
  },
  // Admin / Auth Sacred Vetoes
  'admin.safeguarding_cases': {
    slotId: 'admin.safeguarding_cases',
    domain: 'workspace',
    label: 'Safeguarding & Child Protection',
    tier: 'sacred_never_ingest',
    enabled: false,
  },
  'auth.raw_credentials': {
    slotId: 'auth.raw_credentials',
    domain: 'profile',
    label: 'Raw Credentials & Keys',
    tier: 'sacred_never_ingest',
    enabled: false,
  },
};

export interface AIContextSlice {
  slotId: AIContextSlotId;
  summary: string;
  data?: Record<string, unknown>;
  explicitlyAttached?: boolean;
}

export interface SanitizedAIContextEnvelope {
  domain: AIContextDomain;
  summaryBadge: string;
  slices: Array<{
    slotId: AIContextSlotId;
    label: string;
    summary: string;
    data?: Record<string, unknown>;
  }>;
  updatedAt: number;
}

const MAX_ENVELOPE_CHARS = 2_000;

/**
 * Pure policy filter & sanitizer that strips Tier 3 sacred slots, checks Tier 2 explicit
 * attachment, respects runtime slot toggles, and caps total serialized size.
 */
export function sanitizeContextEnvelope(
  domain: AIContextDomain,
  summaryBadge: string,
  rawSlices: AIContextSlice[],
  policyMap: Record<AIContextSlotId, AIContextSlotPolicy> = DEFAULT_AI_CONTEXT_POLICY,
): SanitizedAIContextEnvelope {
  const allowedSlices: SanitizedAIContextEnvelope['slices'] = [];
  let charCount = 0;

  for (const slice of rawSlices) {
    // Hard Invariant: Tier 3 sacred slots are unconditionally blocked
    if (SACRED_NEVER_INGEST_SLOTS.has(slice.slotId)) {
      continue;
    }

    const policy = policyMap[slice.slotId];
    if (!policy) continue;
    if (policy.tier === 'sacred_never_ingest') continue;
    if (!policy.enabled) continue;

    // Tier 2 requires explicit per-item user attachment
    if (policy.tier === 'explicit_attach_only' && !slice.explicitlyAttached) {
      continue;
    }

    const cleanSummary = String(slice.summary ?? '').trim().slice(0, 500);
    if (!cleanSummary) continue;

    if (charCount + cleanSummary.length > MAX_ENVELOPE_CHARS) {
      break;
    }
    charCount += cleanSummary.length;

    allowedSlices.push({
      slotId: slice.slotId,
      label: policy.label,
      summary: cleanSummary,
      data: slice.data,
    });
  }

  return {
    domain,
    summaryBadge: summaryBadge.trim().slice(0, 80) || `${domain} context`,
    slices: allowedSlices,
    updatedAt: Date.now(),
  };
}

interface AIContextStoreState {
  activeDomain: AIContextDomain;
  summaryBadge: string;
  rawSlices: AIContextSlice[];
  isDetachedForSession: boolean;
  policy: Record<AIContextSlotId, AIContextSlotPolicy>;
  publishDomainContext: (
    domain: AIContextDomain,
    summaryBadge: string,
    slices: AIContextSlice[],
  ) => void;
  setSlotEnabled: (slotId: AIContextSlotId, enabled: boolean) => void;
  setDetachedForSession: (detached: boolean) => void;
  getSanitizedEnvelope: () => SanitizedAIContextEnvelope | null;
}

export const useAIContextStore = create<AIContextStoreState>((set, get) => ({
  activeDomain: 'self',
  summaryBadge: 'Sanctuary',
  rawSlices: [],
  isDetachedForSession: false,
  policy: { ...DEFAULT_AI_CONTEXT_POLICY },

  publishDomainContext: (domain, summaryBadge, slices) => {
    set({
      activeDomain: domain,
      summaryBadge,
      rawSlices: slices,
      isDetachedForSession: false,
    });
  },

  setSlotEnabled: (slotId, enabled) => {
    // Hard Veto: Sacred slots can never be enabled
    if (SACRED_NEVER_INGEST_SLOTS.has(slotId)) return;
    set((state) => {
      const existing = state.policy[slotId];
      if (!existing || existing.tier === 'sacred_never_ingest') return state;
      return {
        policy: {
          ...state.policy,
          [slotId]: { ...existing, enabled },
        },
      };
    });
  },

  setDetachedForSession: (detached) => {
    set({ isDetachedForSession: detached });
  },

  getSanitizedEnvelope: () => {
    const state = get();
    if (state.isDetachedForSession) return null;
    const envelope = sanitizeContextEnvelope(
      state.activeDomain,
      state.summaryBadge,
      state.rawSlices,
      state.policy,
    );
    return envelope.slices.length > 0 ? envelope : null;
  },
}));

/**
 * Declarative hook for any Sanctuary screen (Self, Workspace, Library, Community)
 * to publish its bounded context slices into the AI Context Ingestion Engine.
 */
export function usePublishAIContext(
  domain: AIContextDomain,
  summaryBadge: string,
  slices: AIContextSlice[],
) {
  const publishDomainContext = useAIContextStore((s) => s.publishDomainContext);
  const serializedKey = JSON.stringify({
    domain,
    summaryBadge,
    slices: slices.map((s) => ({
      slotId: s.slotId,
      summary: s.summary,
      explicitlyAttached: s.explicitlyAttached,
    })),
  });

  useEffect(() => {
    publishDomainContext(domain, summaryBadge, slices);
  }, [publishDomainContext, serializedKey]);
}
