import { ORPCError } from '@orpc/server';
import { createPolicyDbForUser } from '@repo/database/client';
import { assertDatabase } from './apiErrors';
import type { ORPCContext } from './orpc';

/**
 * Runtime ZenStack policy enforcement, rolled out per router.
 *
 * `context.db` is the raw client (no @@allow checks). Handlers that have moved to
 * policy enforcement call `getPolicyDb(context)` instead; every query they make is then
 * filtered and checked against the zmodel @@allow rules for the signed-in user, on top
 * of the Cedar check in doubleGateMiddleware. Raw SQL is rejected on this client.
 *
 * Enforced today: the attendance router, and in the educational router the classroom
 * roster procedures (list/enroll/add shadow/update/remove) and classroom update/delete.
 * Everything else still uses the raw client. Tests: src/__tests__/policy-pg.
 *
 * `auth()` in the zmodel is the User row; the fields the policies read (active bonds and
 * the caller's guardian links) are loaded once per request.
 */
const cache = new WeakMap<object, Promise<any>>();

export function getPolicyDb(context: ORPCContext): Promise<any> {
  assertDatabase(context);
  if (!context.user?.id || context.user.id === 'anonymous') {
    throw new ORPCError('FORBIDDEN', { message: 'Authentication is required.' });
  }
  let pending = cache.get(context);
  if (!pending) {
    pending = createPolicyDbForUser(context.db as any, context.user.id);
    cache.set(context, pending);
  }
  return pending;
}
