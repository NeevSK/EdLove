import type { SupabaseClient } from '@supabase/supabase-js';
import type { AuditLogEntry, IAuditRepository } from '@repo/core/logic/domains/audit/ports';

export const createSupabaseAuditRepository = (supabase: SupabaseClient): IAuditRepository => ({
  async log(entry: AuditLogEntry): Promise<void> {
    const { error } = await supabase.from('audit_logs').insert(entry);
    if (error) {
      console.warn('Failed to record audit event', error);
    }
  },

  async getLogs(params: {
    entityType: string;
    entityId?: string;
    actions?: string[];
    limit?: number;
  }): Promise<any[]> {
    let query = supabase
      .from('audit_logs')
      .select('action, entity_id, created_at, metadata')
      .eq('entity_type', params.entityType);

    if (params.entityId) {
      query = query.eq('entity_id', params.entityId);
    }

    if (params.actions && params.actions.length > 0) {
      query = query.in('action', params.actions);
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .limit(params.limit ?? 50);

    if (error) {
      console.warn('Failed to fetch audit logs', error);
      return [];
    }

    return data ?? [];
  },
});
