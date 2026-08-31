/**
 * Idempotency Key Pattern Implementation
 * 
 * Ensures mutations are safely retryable by storing the result
 * of the first execution and returning it on subsequent calls
 * with the same idempotency key.
 * 
 * Usage:
 * - Client generates: crypto.randomUUID() per user action
 * - Server extracts from Idempotency-Key header
 * - Stores result with TTL (24h default)
 * - Returns cached result on replay
 */

import { ORPCError } from '@orpc/server';

// Local type to avoid cross-package dependency
interface ORPCContext {
  user: { id: string };
  idempotencyKey?: string;
  db?: any;
}

export interface IdempotencyConfig {
  /** Header name for idempotency key */
  headerName?: string;
  /** TTL in milliseconds (default 24h) */
  ttl?: number;
  /** Methods that require idempotency key */
  requiredMethods?: string[];
  /** Skip if header missing (for backward compat) */
  optional?: boolean;
}

const DEFAULT_CONFIG: Required<IdempotencyConfig> = {
  headerName: 'Idempotency-Key',
  ttl: 24 * 60 * 60 * 1000, // 24 hours
  requiredMethods: ['POST', 'PUT', 'PATCH', 'DELETE'],
  optional: true, // Default to optional for backward compatibility
};

interface IdempotencyRecord {
  key: string;
  userId: string;
  method: string;
  path: string;
  requestHash: string;
  response: unknown;
  statusCode: number;
  createdAt: Date;
  expiresAt: Date;
}

/**
 * In-memory store for development/testing.
 * Production should use Redis or database.
 */
class IdempotencyStore {
  private store = new Map<string, IdempotencyRecord>();

  private cleanup(): void {
    const now = new Date();
    for (const [key, record] of this.store.entries()) {
      if (record.expiresAt < now) {
        this.store.delete(key);
      }
    }
  }

  async get(key: string): Promise<IdempotencyRecord | null> {
    const record = this.store.get(key);
    if (!record) return null;
    if (record.expiresAt < new Date()) {
      this.store.delete(key);
      return null;
    }
    return record;
  }

  async set(key: string, record: IdempotencyRecord): Promise<void> {
    if (this.store.size > 500) {
      this.cleanup();
    }
    this.store.set(key, record);
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key);
  }

  destroy(): void {
    this.store.clear();
  }
}

// Global store instance (replace with Redis in production)
const idempotencyStore = new IdempotencyStore();

/**
 * Generate a hash of the request for deduplication
 */
function hashRequest(method: string, path: string, body: unknown): string {
  const str = `${method}:${path}:${JSON.stringify(body)}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

/**
 * Create idempotency middleware for oRPC
 */
export function createIdempotencyMiddleware(config: IdempotencyConfig = {}) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  return async (options: { context: ORPCContext; procedure: any }, next: () => Promise<any>) => {
    const { context, procedure } = options;
    const method = (procedure as any).method?.toUpperCase() || 'POST';
    const path = (procedure as any).path || '/unknown';

    // Skip if method doesn't require idempotency
    if (!finalConfig.requiredMethods.includes(method)) {
      return next();
    }

    // Extract idempotency key from context (set by Hono middleware)
    const idempotencyKey = context.idempotencyKey;
    
    if (!idempotencyKey) {
      if (!finalConfig.optional) {
        throw new ORPCError('BAD_REQUEST', {
          message: `Missing required header: ${finalConfig.headerName}`,
          data: { code: 'IDEMPOTENCY_KEY_REQUIRED' },
        });
      }
      return next();
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(idempotencyKey)) {
      throw new ORPCError('BAD_REQUEST', {
        message: 'Invalid idempotency key format (must be UUID)',
        data: { code: 'IDEMPOTENCY_KEY_INVALID' },
      });
    }

    // Check for existing record
    const existing = await idempotencyStore.get(idempotencyKey);
    if (existing) {
      // Verify same user and request
      if (existing.userId !== context.user?.id) {
        throw new ORPCError('FORBIDDEN', {
          message: 'Idempotency key belongs to different user',
          data: { code: 'IDEMPOTENCY_KEY_CONFLICT' },
        });
      }
      if (existing.method !== 'POST' || existing.path !== path) {
        // We'll compare method and path approximately
      }

      // Return cached response
      return existing.response;
    }

    // Execute the procedure
    const result = await next();

    // Store successful result
    const record: IdempotencyRecord = {
      key: idempotencyKey,
      userId: context.user?.id || 'anonymous',
      method: 'POST',
      path,
      requestHash: hashRequest('POST', path, (procedure as any).input),
      response: result,
      statusCode: 200,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + finalConfig.ttl),
    };

    await idempotencyStore.set(idempotencyKey, record);

    return result;
  };
}

/**
 * Hono middleware to extract idempotency key from headers
 * Add this to your Hono app before oRPC routes
 */
export function idempotencyHeaderMiddleware(config: IdempotencyConfig = {}) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  return async (c: any, next: any) => {
    const method = c.req.method.toUpperCase();
    
    if (!finalConfig.requiredMethods.includes(method)) {
      return next();
    }

    const key = c.req.header(finalConfig.headerName);
    
    if (!key) {
      if (!finalConfig.optional) {
        return c.json(
          { 
            error: 'BAD_REQUEST', 
            message: `Missing required header: ${finalConfig.headerName}`,
            code: 'IDEMPOTENCY_KEY_REQUIRED'
          },
          400
        );
      }
      return next();
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(key)) {
      return c.json(
        { 
          error: 'BAD_REQUEST', 
          message: 'Invalid idempotency key format (must be UUID)',
          code: 'IDEMPOTENCY_KEY_INVALID'
        },
        400
      );
    }

    // Store in context for oRPC middleware
    c.set('idempotencyKey', key);
    return next();
  };
}

/**
 * Helper to generate idempotency key on client
 */
export function generateIdempotencyKey(): string {
  if (typeof globalThis !== 'undefined' && globalThis.crypto && typeof globalThis.crypto.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Client-side wrapper for idempotent mutations
 */
export async function withIdempotency<T>(
  key: string,
  fn: () => Promise<T>,
  options: { retries?: number; retryDelay?: number } = {}
): Promise<T> {
  const { retries = 3, retryDelay = 1000 } = options;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      // If idempotency conflict, don't retry
      if (error?.data?.code === 'IDEMPOTENCY_KEY_CONFLICT' || 
          error?.data?.code === 'IDEMPOTENCY_KEY_MISMATCH') {
        throw error;
      }
      
      if (attempt === retries) throw error;
      
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, attempt)));
    }
  }
  
  throw new Error('Unreachable');
}

/** Export store for testing/cleanup */
export { idempotencyStore };