import { IAuditRepository, AuditLogEntry } from '../domains/audit/ports';

/**
 * AuditManager
 * 
 * Orchestrates platform-wide audit logging and retrieval.
 */
export class AuditManager {
  constructor(private repo: IAuditRepository) {}

  /**
   * Records a new audit entry.
   */
  async log(entry: AuditLogEntry): Promise<void> {
    return this.repo.log(entry);
  }

  /**
   * Retrieves audit logs for a specific entity type.
   */
  async getLogs(params: {
    entityType: string;
    entityId?: string;
    actions?: string[];
    limit?: number;
  }): Promise<any[]> {
    return this.repo.getLogs(params);
  }
}
