// Re-export domain types from the central types directory to avoid redefinition
export * from '../types';

export class APIError extends Error {
    constructor(
        message: string,
        public code?: string,
        public details?: any
    ) {
        super(message);
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
