// One-time runtime for the historical SovereignContract style (packages/core/src/api/contracts.ts),
// extended with `cedarAction` in metadata. Not edited per operation.
import { z } from 'zod';

export interface SovereignRoute {
  path: string;
  method: 'post';
  operationId: string;
  request: { body: z.ZodTypeAny; headers?: z.ZodTypeAny };
  responses: Record<number, { schema: z.ZodTypeAny; description: string }>;
  errors: readonly ErrorCode[];
  metadata: { cedarAction: string; policy: { action: string; subject: string } };
}
export type SovereignContract = Record<string, SovereignRoute>;

const STATUS = { BAD_REQUEST: 400, FORBIDDEN: 403, NOT_FOUND: 404, CONFLICT: 409 } as const;
export type ErrorCode = keyof typeof STATUS;
export class ApiError extends Error {
  constructor(readonly code: ErrorCode, message = code) { super(message); }
}

type Input<R extends SovereignRoute> = {
  body: z.infer<R['request']['body']>;
  headers: R['request']['headers'] extends z.ZodTypeAny ? z.infer<R['request']['headers']> : undefined;
};
type Output<R extends SovereignRoute> = z.input<R['responses'][200]['schema']>;
export type Handlers<C extends SovereignContract> = { [K in keyof C]: (input: Input<C[K]>) => Output<C[K]> | Promise<Output<C[K]>> };

const json = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

export function createHandler<C extends SovereignContract>(contract: C, handlers: Handlers<C>) {
  const routes = new Map(Object.entries(contract).map(([name, route]) => [`${route.method.toUpperCase()} ${route.path}`, { name, route }]));
  return async (request: Request): Promise<Response> => {
    const found = routes.get(`${request.method} ${new URL(request.url).pathname}`);
    if (!found) return json(404, { code: 'NOT_FOUND' });
    const { name, route } = found;
    let raw: unknown;
    try { raw = await request.json(); } catch { return json(400, { code: 'BAD_REQUEST', message: 'Invalid JSON' }); }
    const body = route.request.body.safeParse(raw);
    if (!body.success) return json(400, { code: 'BAD_REQUEST', issues: body.error.issues });
    let headers: unknown;
    if (route.request.headers) {
      const parsed = route.request.headers.safeParse(Object.fromEntries(request.headers));
      if (!parsed.success) return json(400, { code: 'BAD_REQUEST', issues: parsed.error.issues });
      headers = parsed.data;
    }
    try {
      const result = await (handlers[name] as (i: unknown) => unknown)({ body: body.data, headers });
      const out = route.responses[200]!.schema.safeParse(result);
      if (!out.success) return json(500, { code: 'INTERNAL_SERVER_ERROR' });
      return json(200, out.data);
    } catch (error) {
      if (error instanceof ApiError && route.errors.includes(error.code)) return json(STATUS[error.code], { code: error.code, message: error.message });
      return json(500, { code: 'INTERNAL_SERVER_ERROR' });
    }
  };
}
export const cedarActionOfContract = (contract: SovereignContract, operationId: string) =>
  Object.values(contract).find((r) => r.operationId === operationId)?.metadata.cedarAction;
