import { z } from 'zod';

/**
 * POA Metadata - The shared contract for authority markers.
 */
export const POAMetadataSchema = z.object({
  authority: z.object({
    action: z.enum(['manage', 'create', 'read', 'update', 'delete', 'submit', 'verify', 'grade', 'resolve', 'publish', 'override']),
    subject: z.string(),
  }),
});

export type POAMetadata = z.infer<typeof POAMetadataSchema>;

/**
 * SovereignRoute Definition (The Port)
 * This is FRAMEWORK AGNOSTIC. No Hono, no ts-rest, no Fastify.
 * Just pure Zod and metadata.
 */
export interface SovereignRoute {
  path: string;
  method: 'get' | 'post' | 'put' | 'delete' | 'patch';
  summary?: string;
  request?: {
    body?: z.ZodType<any>;
    query?: z.ZodType<any>;
    params?: z.ZodType<any>;
    headers?: z.ZodType<any>;
  };
  responses: Record<number, {
    schema: z.ZodType<any>;
    description: string;
  }>;
  metadata: POAMetadata;
}

/**
 * SovereignContract
 * A collection of routes for a specific domain.
 */
export type SovereignContract = Record<string, SovereignRoute>;

/**
 * Hono Adapter (The Implementation Detail)
 * This is the ONLY place that should know about @hono/zod-openapi.
 */
import { createRoute } from '@hono/zod-openapi';

export function adaptToHono(route: SovereignRoute) {
  return createRoute({
    method: route.method,
    path: route.path,
    request: {
      body: route.request?.body ? {
        content: { 'application/json': { schema: route.request.body } }
      } : undefined,
      query: route.request?.query,
      params: route.request?.params,
      headers: route.request?.headers,
    },
    responses: Object.fromEntries(
      Object.entries(route.responses).map(([code, res]) => [
        code,
        {
          content: { 'application/json': { schema: res.schema } },
          description: res.description,
        }
      ])
    ),
    metadata: route.metadata,
  });
}
