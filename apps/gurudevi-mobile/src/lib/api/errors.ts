/**
 * API Error Handling
 * 
 * Centralized error handling for all API operations
 */

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
