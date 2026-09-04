import type { WorkspaceLayoutRepository } from '@repo/core/logic/domains/workspaceLayout/ports';
import {
  type WorkspaceLayoutDelete,
  WorkspaceLayoutDeleteSchema,
  type WorkspaceLayoutRecord,
  WorkspaceLayoutRecordSchema,
  type WorkspaceLayoutTarget,
  type WorkspaceLayoutUpsert,
  WorkspaceLayoutUpsertSchema,
} from '@repo/core/logic/schemas/workspace-layout.schema';
import { APIError } from '@repo/core/types/API';
import type { SupabaseClient } from '@supabase/supabase-js';

const normalizeWorkspaceLayoutRow = (row: Record<string, unknown>): WorkspaceLayoutRecord =>
  WorkspaceLayoutRecordSchema.parse({
    id: row.id,
    user_id: row.user_id,
    workspace_id: row.workspace_id,
    layout_target: row.layout_target ?? 'shared',
    order: row.order_json ?? [],
    hidden: row.hidden_json ?? [],
    pinned: row.pinned_json ?? [],
    zone_by_surface: row.zone_by_surface_jsonb ?? {},
    layout_version: row.layout_version ?? 1,
    created_at: row.created_at,
    updated_at: row.updated_at,
  });

export const createSupabaseWorkspaceLayoutRepository = (
  supabase: SupabaseClient,
): WorkspaceLayoutRepository => ({
  async getLayout(userId, workspaceId, layoutTarget: WorkspaceLayoutTarget) {
    const { data, error } = await supabase
      .from('user_workspace_layouts')
      .select('*')
      .eq('user_id', userId)
      .eq('workspace_id', workspaceId)
      .eq('layout_target', layoutTarget)
      .maybeSingle();

    if (error) throw new APIError('Failed to fetch workspace layout', error.code, error);
    if (!data) return null;

    return normalizeWorkspaceLayoutRow(data as Record<string, unknown>);
  },

  async upsertLayout(input) {
    const payload = WorkspaceLayoutUpsertSchema.parse(input) as WorkspaceLayoutUpsert;
    const { data, error } = await supabase
      .from('user_workspace_layouts')
      .upsert(
        {
          user_id: payload.userId,
          workspace_id: payload.workspaceId,
          layout_target: payload.layoutTarget,
          order_json: payload.order,
          hidden_json: payload.hidden,
          pinned_json: payload.pinned,
          zone_by_surface_jsonb: payload.zoneBySurface,
          layout_version: payload.layoutVersion,
          updated_at: payload.updatedAt,
        },
        { onConflict: 'user_id,workspace_id,layout_target' },
      )
      .select('*')
      .single();

    if (error) throw new APIError('Failed to save workspace layout', error.code, error);
    return normalizeWorkspaceLayoutRow(data as Record<string, unknown>);
  },

  async deleteLayout(input) {
    const payload = WorkspaceLayoutDeleteSchema.parse(input) as WorkspaceLayoutDelete;
    const { error } = await supabase
      .from('user_workspace_layouts')
      .delete()
      .eq('user_id', payload.userId)
      .eq('workspace_id', payload.workspaceId)
      .eq('layout_target', payload.layoutTarget);

    if (error) throw new APIError('Failed to delete workspace layout', error.code, error);
    return { success: true as const };
  },
});
