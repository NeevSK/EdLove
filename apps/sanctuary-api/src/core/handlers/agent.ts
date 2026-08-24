import { ORPCError } from '@orpc/server';
import { agentORPCContract } from '@repo/core/api/agent.orpc.contract';
import { implement, type ORPCContext } from '../orpc';
import { doubleGateMiddleware } from '../orpcMiddleware';

const impl = implement(agentORPCContract).$context<ORPCContext>();

function getEnv(key: string): string | undefined {
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key];
  }
  return undefined;
}

export const agentRouter = impl.router({
  getSystemStatus: impl.getSystemStatus.use(doubleGateMiddleware).handler(async ({ context }) => {
    if (context.user.id === 'anonymous') {
      throw new ORPCError('FORBIDDEN', { message: `unauthenticated:${context.requestId}` });
    }

    return {
      request_id: context.requestId,
      api: {
        status: 'ok',
        time_utc: new Date().toISOString(),
        version: getEnv('APP_VERSION') ?? null,
      },
      principal: {
        user_id: context.user.id,
        capacity: context.capacity ?? null,
        school_id: context.schoolId || null,
        active_bond_id: context.activeBondId ?? null,
        active_entity_id: context.activeEntityId ?? null,
        active_entity_type: context.activeEntityType ?? null,
      },
      authorization: {
        evaluator: getEnv('SANCTUARY_AUTHZ_EVALUATOR') === 'rust' ? 'rust' : 'wasm',
        subject: 'User',
        action: 'read',
      },
    };
  }),
});
