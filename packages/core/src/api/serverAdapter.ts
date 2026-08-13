import { createRoute } from '@hono/zod-openapi';
import type { SovereignRoute } from '@repo/core/api/contracts';

/** Converts a framework-neutral route contract into a Hono OpenAPI route. */
export function adaptToHono(route: SovereignRoute) {
  return createRoute({
    method: route.method,
    path: route.path,
    request: {
      body: route.request?.body
        ? { content: { 'application/json': { schema: route.request.body } } }
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
