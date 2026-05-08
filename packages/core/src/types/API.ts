import { SovereignError } from './Errors';

export class APIError extends SovereignError {
  constructor(
    message: string,
    public code: string = 'API_ERROR',
    public details?: any,
  ) {
    super({
      title: message,
      code,
      devDetails: details,
      status: 400,
    });
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
