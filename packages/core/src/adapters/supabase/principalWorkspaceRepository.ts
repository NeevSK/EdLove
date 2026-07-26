import type { SupabaseClient } from '@supabase/supabase-js';
import { selectLatestTemporalRecordsAsOf } from '@/lib/temporalEvents';
import type { PrincipalWorkspaceRepository } from '@/logic/domains/principalWorkspace/ports';
import { CapacitySchema } from '@/logic/schemas/capacity.schema';
import {
  InviteCodeSchema,
  type InviteCodeZod,
  PrincipalGovernanceEventSchema,
  type PrincipalGovernanceEventZod,
  type PrincipalInviteEventCreate,
  PrincipalInviteEventCreateSchema,
  type PrincipalObservationCreate,
  PrincipalObservationCreateSchema,
  type PrincipalObservationFollowUpCreate,
  PrincipalObservationFollowUpCreateSchema,
  PrincipalObservationSchema,
  type PrincipalObservationZod,
} from '@/logic/schemas/principal-workspace.schema';
import { getTemporalRange } from '@/logic/utils/temporalUtils';
import { APIError } from '@/types/API';

const normalizeInviteCode = (row: Record<string, unknown>): InviteCodeZod =>
  InviteCodeSchema.parse({
    code: row.code,
    school_id: row.school_id,
    capacity: CapacitySchema.parse((row.capacity ?? 'teacher') as string),
    created_by: row.created_by,
    used: Boolean(row.used ?? !row.is_active) || Number(row.uses_count ?? 0) > 0,
    created_at: row.created_at,
    expires_at: row.expires_at ?? null,
    is_active: Boolean(row.is_active ?? true),
  });

export const createSupabasePrincipalWorkspaceRepository = (
  supabase: SupabaseClient,
): PrincipalWorkspaceRepository => {
  async function recordGovernanceEvent({
    schoolId,
    principalId,
    entityType,
    entityId,
    eventType,
    snapshot,
    occurredAt,
    effectiveFrom,
    effectiveTo,
    recordedBy,
  }: {
    schoolId: string;
    principalId: string;
    entityType: 'principal_observation' | 'school_invite';
    entityId: string;
    eventType: 'create' | 'read' | 'use' | 'expire' | 'revoke' | 'follow_up' | 'approve';
    snapshot: Record<string, unknown>;
    occurredAt?: string;
    effectiveFrom?: string | null;
    effectiveTo?: string | null;
    recordedBy?: string | null;
  }) {
    const { error } = await supabase.from('principal_governance_events').insert({
      school_id: schoolId,
      principal_id: principalId,
      entity_type: entityType,
      entity_id: entityId,
      event_type: eventType,
      snapshot,
      occurred_at: occurredAt ?? new Date().toISOString(),
      effective_from: effectiveFrom ?? occurredAt ?? new Date().toISOString(),
      effective_to: effectiveTo ?? null,
      recorded_by: recordedBy ?? null,
    });

    if (error) {
      console.warn('Failed to record principal governance event', error);
    }
  }

  return {
    async listInviteCodes(schoolId) {
      const { data, error } = await supabase
        .from('invite_codes')
        .select(
          'code, school_id, capacity, created_by, used, is_active, uses_count, created_at, expires_at',
        )
        .eq('school_id', schoolId)
        .order('created_at', { ascending: false });

      if (error) throw new APIError('Failed to fetch invite codes', error.code, error);
      return (data ?? []).map((row) => normalizeInviteCode(row as Record<string, unknown>));
    },

    async generateInviteCode(schoolId, capacity, createdBy) {
      const code = `GURU-${Math.random().toString(36).substring(2, 8).toUpperCase().padEnd(6, '0')}-${capacity === 'teacher' ? 'TEACH' : 'ADMIN'}`;
      const payload = {
        school_id: schoolId,
        code,
        capacity,
        created_by: createdBy,
        used: false,
        is_active: true,
      };

      const { data, error } = await supabase
        .from('invite_codes')
        .insert(payload)
        .select(
          'code, school_id, capacity, created_by, used, is_active, uses_count, created_at, expires_at',
        )
        .single();

      if (error) throw new APIError('Failed to generate invite code', error.code, error);
      const normalized = normalizeInviteCode(data as Record<string, unknown>);

      await recordGovernanceEvent({
        schoolId,
        principalId: createdBy,
        entityType: 'school_invite',
        entityId: normalized.code,
        eventType: 'create',
        snapshot: normalized as unknown as Record<string, unknown>,
        occurredAt: normalized.created_at,
        effectiveFrom: normalized.created_at,
        effectiveTo: normalized.expires_at ?? null,
        recordedBy: createdBy,
      });

      return normalized;
    },

    async listObservationsByDate(principalId, viewDate, limit) {
      const range = getTemporalRange(viewDate, 'day');
      const { data, error } = await supabase
        .from('principal_observations')
        .select('*')
        .eq('principal_id', principalId)
        .lte('created_at', range.end)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw new APIError('Failed to fetch principal observations', error.code, error);
      return (data ?? []).map((row) =>
        PrincipalObservationSchema.parse(row),
      ) as PrincipalObservationZod[];
    },

    async listRecentObservations(principalId, limit) {
      const { data, error } = await supabase
        .from('principal_observations')
        .select('*')
        .eq('principal_id', principalId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error)
        throw new APIError('Failed to fetch recent principal observations', error.code, error);
      return (data ?? []).map((row) =>
        PrincipalObservationSchema.parse(row),
      ) as PrincipalObservationZod[];
    },

    async createObservation(input) {
      const payload = PrincipalObservationCreateSchema.parse(input) as PrincipalObservationCreate;
      const { data, error } = await supabase
        .from('principal_observations')
        .insert({
          school_id: payload.schoolId,
          principal_id: payload.principalId,
          type: payload.type,
          content: payload.content,
        })
        .select('*')
        .single();

      if (error) throw new APIError('Failed to create principal observation', error.code, error);
      const parsed = PrincipalObservationSchema.parse(data) as PrincipalObservationZod;

      await recordGovernanceEvent({
        schoolId: parsed.school_id,
        principalId: parsed.principal_id,
        entityType: 'principal_observation',
        entityId: parsed.id,
        eventType: 'create',
        snapshot: parsed as unknown as Record<string, unknown>,
        occurredAt: parsed.created_at,
        effectiveFrom: parsed.created_at,
        recordedBy: parsed.principal_id,
      });

      return parsed;
    },

    async recordInviteEvent(input) {
      const payload = PrincipalInviteEventCreateSchema.parse(input) as PrincipalInviteEventCreate;
      const occurredAt = payload.occurredAt ?? new Date().toISOString();

      const { data, error } = await supabase
        .from('principal_governance_events')
        .insert({
          school_id: payload.schoolId,
          principal_id: payload.principalId,
          entity_type: 'school_invite',
          entity_id: payload.inviteCode,
          event_type: payload.eventType,
          snapshot: {
            invite_code: payload.inviteCode,
            event_type: payload.eventType,
            ...(payload.snapshot ?? {}),
          },
          occurred_at: occurredAt,
          effective_from: occurredAt,
          effective_to: payload.effectiveTo ?? null,
          recorded_by: payload.principalId,
        })
        .select('*')
        .single();

      if (error) throw new APIError('Failed to record principal invite event', error.code, error);
      return PrincipalGovernanceEventSchema.parse(data) as PrincipalGovernanceEventZod;
    },

    async recordObservationFollowUp(input) {
      const payload = PrincipalObservationFollowUpCreateSchema.parse(
        input,
      ) as PrincipalObservationFollowUpCreate;
      const occurredAt = payload.occurredAt ?? new Date().toISOString();

      const { data, error } = await supabase
        .from('principal_governance_events')
        .insert({
          school_id: payload.schoolId,
          principal_id: payload.principalId,
          entity_type: 'principal_observation',
          entity_id: payload.observationId,
          event_type: 'follow_up',
          snapshot: {
            observation_id: payload.observationId,
            content: payload.content,
            status: payload.status,
          },
          occurred_at: occurredAt,
          effective_from: occurredAt,
          recorded_by: payload.principalId,
        })
        .select('*')
        .single();

      if (error)
        throw new APIError('Failed to record principal observation follow-up', error.code, error);
      return PrincipalGovernanceEventSchema.parse(data) as PrincipalGovernanceEventZod;
    },

    async getGovernanceTimeline(principalId, viewDate, limit) {
      const range = getTemporalRange(viewDate, 'day');
      const { data, error } = await supabase
        .from('principal_governance_events')
        .select('*')
        .eq('principal_id', principalId)
        .lte('occurred_at', range.end)
        .order('occurred_at', { ascending: false })
        .order('recorded_at', { ascending: false })
        .limit(limit);

      if (error)
        throw new APIError('Failed to fetch principal governance timeline', error.code, error);
      return (data ?? []).map((row) =>
        PrincipalGovernanceEventSchema.parse(row),
      ) as PrincipalGovernanceEventZod[];
    },

    async getGovernanceSnapshotAsOf(principalId, viewDate, limit) {
      const range = getTemporalRange(viewDate, 'day');
      const { data, error } = await supabase
        .from('principal_governance_events')
        .select('*')
        .eq('principal_id', principalId)
        .lte('occurred_at', range.end)
        .order('occurred_at', { ascending: false })
        .order('recorded_at', { ascending: false })
        .limit(limit);

      if (error)
        throw new APIError('Failed to fetch principal governance snapshot', error.code, error);
      const events = (data ?? []).map((row) =>
        PrincipalGovernanceEventSchema.parse(row),
      ) as PrincipalGovernanceEventZod[];
      return selectLatestTemporalRecordsAsOf(events, viewDate, {
        getEntityKey: (event) => `${event.entity_type}:${event.entity_id}`,
        getEffectiveTo: (event) => event.effective_to,
      }) as PrincipalGovernanceEventZod[];
    },
  };
};
