import { z } from 'zod';

/**
 * POA Metadata - The shared contract for policy markers.
 */
export const POAMetadataSchema = z.object({
  policy: z.object({
    action: z.enum([
      'manage',
      'create',
      'read',
      'update',
      'delete',
      'submit',
      'verify',
      'grade',
      'resolve',
      'publish',
      'override',
      'use_ai',
    ]),
    subject: z.string(),
  }),
  entitlement: z
    .object({
      tierAtLeast: z.enum(['FREE', 'PRO', 'INSTITUTIONAL']).optional(),
      modulesAllOf: z.array(z.string().min(1)).optional(),
      scope: z.enum(['individual', 'active_bond', 'active_entity', 'add_on']).optional(),
    })
    .optional(),
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
    body?: z.ZodTypeAny;
    query?: z.ZodTypeAny;
    params?: z.ZodTypeAny;
    headers?: z.ZodTypeAny;
  };
  responses: Record<
    number,
    {
      schema: z.ZodTypeAny;
      description: string;
    }
  >;
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
import { hc } from 'hono/client';

export function adaptToHono(route: SovereignRoute) {
  // ... (existing adaptToHono code)
  return createRoute({
    method: route.method,
    path: route.path,
    request: {
      body: route.request?.body
        ? {
            content: { 'application/json': { schema: route.request.body } },
          }
        : undefined,
      query: route.request?.query as any,
      params: route.request?.params as any,
      headers: route.request?.headers as any,
    },
    responses: Object.fromEntries(
      Object.entries(route.responses).map(([code, res]) => [
        code,
        {
          content: { 'application/json': { schema: res.schema } },
          description: res.description,
        },
      ]),
    ),
    metadata: route.metadata,
  });
}

let tokenResolver: (() => Promise<string | null>) | null = null;
let activeBondIdResolver: (() => Promise<string | null>) | null = null;

/**
 * registerTokenResolver
 * Registers a function to resolve the current user's session token.
 * This decouples the shared contract from direct client-side Supabase/storage imports.
 */
export function registerTokenResolver(resolver: () => Promise<string | null>) {
  tokenResolver = resolver;
}

/**
 * Registers the current active-bond resolver without coupling the shared API
 * client to Zustand, Supabase, or React Native storage.
 */
export function registerActiveBondIdResolver(resolver: () => Promise<string | null>) {
  activeBondIdResolver = resolver;
}

/**
 * createSovereignClient
 * Creates a type-safe RPC client for the Sovereign API.
 */
export function createSovereignClient<T extends import('hono').Hono<any, any, any>>(
  baseUrl: string,
): ReturnType<typeof hc<T>> {
  return hc<T>(baseUrl, {
    fetch: async (input: RequestInfo | URL, requestInit?: RequestInit) => {
      let token: string | null = null;
      if (tokenResolver) {
        try {
          token = await tokenResolver();
        } catch (err) {
          console.warn('[Sovereign Client] Failed to retrieve session token via resolver:', err);
        }
      }

      const headers = new Headers(requestInit?.headers);
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }

      if (activeBondIdResolver) {
        try {
          const activeBondId = await activeBondIdResolver();
          if (activeBondId) headers.set('X-Active-Bond-Id', activeBondId);
        } catch (err) {
          console.warn('[Sovereign Client] Failed to retrieve active bond context:', err);
        }
      }

      return fetch(input, {
        ...requestInit,
        headers,
      });
    },
  });
}

// 2026 Compile-Time RPC Type Bridging Helpers
export type { InferRequestType, InferResponseType } from 'hono/client';
