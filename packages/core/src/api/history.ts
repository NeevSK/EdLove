/**
 * History API
 * 
 * Fetches version history/audit logs for records.
 */

import { supabase } from '../lib/supabase';
import { APIError } from './types';

export interface AuditLogEntry {
    id: string;
    table_name: string;
    record_id: string;
    action: 'INSERT' | 'UPDATE' | 'DELETE';
    old_data: any;
    new_data: any;
    changed_by: string | null;
    changed_at: string;
    author?: {
        full_name: string;
    };
}

export const historyAPI = {
    /**
     * Get the history for a specific record in a table.
     */
    async getForRecord(tableName: string, recordId: string): Promise<AuditLogEntry[]> {
        const { data, error } = await supabase
            .from('audit_logs') // Assuming we create a view or use the audit schema directly
            .select(`
                *,
                author:users!changed_by (
                    full_name
                )
            `)
            .eq('table_name', tableName)
            .eq('record_id', recordId)
            .order('changed_at', { ascending: false });

        if (error) {
            throw new APIError(`Failed to fetch history for ${tableName}:${recordId}`, error.code, error);
        }

        return (data || []) as AuditLogEntry[];
    }
};
