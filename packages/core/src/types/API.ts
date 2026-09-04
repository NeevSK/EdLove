import { SovereignError } from '@repo/core/types/Errors';

export class APIError extends SovereignError {
  public readonly code: string;
  public readonly reportedToTelemetry: boolean;

  constructor(message: string, code = 'API_ERROR', details?: unknown, reportedToTelemetry = false) {
    const normalizedCode = code;
    super({
      title: message,
      code: normalizedCode,
      devDetails: details,
      status: 400,
    });
    this.code = normalizedCode;
    this.reportedToTelemetry = reportedToTelemetry;
    this.name = 'APIError';
  }
}

// Any API-specific request/response envelopes can stay here,
// but domain entities (Classroom, Student, InventoryItem, etc.) MUST come from ../types

export interface PaginationParams {
  limit?: number;
  offset?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  totalCount: number;
  hasMore: boolean;
}
