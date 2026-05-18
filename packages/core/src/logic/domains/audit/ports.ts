export interface AuditLogEntry {
  action: string;
  entity_id: string;
  target_id?: string;
  entity_type: string;
  executor_id: string;
  metadata?: Record<string, unknown>;
}

export interface IAuditRepository {
  log(entry: AuditLogEntry): Promise<void>;
  getLogs(params: {
    entityType: string;
    entityId?: string;
    actions?: string[];
    limit?: number;
  }): Promise<any[]>;
}
