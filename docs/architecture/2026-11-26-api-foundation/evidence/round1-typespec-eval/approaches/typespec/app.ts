// One-time server shell: plain HTTP JSON (OpenAPI handler) over the generated contract.
import { OpenAPIHandler } from '@orpc/openapi/fetch';
import { findOperationMeta } from '../../shared/meta';
import { contract } from './gen/orpc.gen';
import { router } from './router';

const handler = new OpenAPIHandler(router);
export async function handle(request: Request): Promise<Response> {
  const { response } = await handler.handle(request, { context: {} });
  return response ?? new Response(JSON.stringify({ code: 'NOT_FOUND' }), { status: 404 });
}
export const cedarActionOf = (operationId: string) => findOperationMeta(contract, operationId)?.cedarAction as string | undefined;
