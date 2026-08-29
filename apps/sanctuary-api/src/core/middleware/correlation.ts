/**
 * Correlation ID Middleware
 * 
 * Ensures every request has a correlation ID that propagates through
 * the entire system (Hono -> oRPC -> Database -> External services).
 * 
 * The correlation ID is:
 * - Generated at the edge (if not provided)
 * - Propagated via W3C traceparent header
 * - Included in all logs, errors, and response headers
 * - Available in Sentry, PostHog, and OpenTelemetry
 */

import { createMiddleware } from 'hono/factory';

export function correlationIdMiddleware() {
  return createMiddleware(async (c, next) => {
    // Extract or generate correlation ID
    const incomingTraceParent = c.req.header('traceparent');
    const incomingTraceState = c.req.header('tracestate');
    
    // Use existing trace ID or generate new one
    const traceId = incomingTraceParent?.split('-')[1] || crypto.randomUUID().replace(/-/g, '');
    const spanId = crypto.randomUUID().replace(/-/g, '').substring(0, 16);
    
    // Build traceparent header for outgoing requests
    const traceParentHeader = `00-${traceId}-${spanId}-01`;
    
    // Set correlation ID in context for downstream use
    c.set('correlationId', traceId);
    c.set('spanId', spanId);
    c.set('traceParent', traceParentHeader);
    
    // Add to response headers for client-side correlation
    c.header('x-correlation-id', traceId);
    c.header('x-span-id', spanId);
    c.header('traceparent', traceParentHeader);
    
    if (incomingTraceState) {
      c.header('tracestate', incomingTraceState);
    }
    
    await next();
  });
}

/**
 * Hono middleware to extract correlation IDs from incoming requests
 * and make them available to oRPC context
 */
export function extractCorrelationIdMiddleware() {
  return async (c: any, next: any) => {
    const traceParent = c.req.header('traceparent');
    const traceState = c.req.header('tracestate');
    
    let correlationId: string;
    let spanId: string;
    
    if (traceParent) {
      // Parse W3C traceparent: version-trace-id-parent-id-flags
      const parts = traceParent.split('-');
      if (parts.length >= 3) {
        correlationId = parts[1];
        spanId = parts[2];
      }
    }
    
    if (!correlationId) {
      correlationId = crypto.randomUUID().replace(/-/g, '');
      spanId = crypto.randomUUID().replace(/-/g, '').substring(0, 16);
    }
    
    // Store in Hono context for middleware access
    c.set('correlationId', correlationId);
    c.set('spanId', spanId);
    
    // Build traceparent for downstream
    const traceParentHeader = `00-${correlationId}-${spanId}-01`;
    c.set('traceParent', traceParentHeader);
    c.set('traceState', traceState);
    
    // Also set in response headers
    c.header('x-correlation-id', correlationId);
    c.header('x-span-id', spanId);
    c.header('traceparent', traceParentHeader);
    if (traceState) {
      c.header('tracestate', traceState);
    }
    
    await next();
  };
}

/**
 * Get correlation ID from Hono context
 */
export function getCorrelationId(c: any): string | undefined {
  return c.get('correlationId');
}

/**
 * Get span ID from Hono context
 */
export function getSpanId(c: any): string | undefined {
  return c.get('spanId');
}

/**
 * Get traceParent for downstream propagation
 */
export function getTraceParent(c: any): string | undefined {
  return c.get('traceParent');
}

/**
 * Get traceState from Hono context
 */
export function getTraceState(c: any): string | undefined {
  return c.get('traceState');
}

/**
 * Build trace context for oRPC context
 */
export function buildTraceContext(c: any): {
  traceId: string;
  spanId: string;
  traceParent: string;
  traceState?: string;
} {
  return {
    traceId: c.get('correlationId') || '',
    spanId: c.get('spanId') || '',
    traceParent: c.get('traceParent') || '',
    traceState: c.get('traceState'),
  };
}