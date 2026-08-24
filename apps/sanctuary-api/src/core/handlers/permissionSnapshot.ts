import { ORPCError } from '@orpc/server';
import { permissionSnapshotContract } from '@repo/core/api/server';
import { refreshPermissionSnapshot } from '../../authorization/permissionSnapshot.service';
import { assertDatabase } from '../apiErrors';
import { implement, type ORPCContext } from '../orpc';
import { doubleGateMiddleware } from '../orpcMiddleware';

const impl = implement(permissionSnapshotContract).$context<ORPCContext>();

export const permissionSnapshotRouter = impl.router({
  refresh: impl.refresh.use(doubleGateMiddleware).handler(async ({ context }) => {
    if (context.user.id === 'anonymous') {
      throw new ORPCError('FORBIDDEN', { message: 'Authentication required' });
    }
    assertDatabase(context);
    return refreshPermissionSnapshot({
      db: context.db,
      userId: context.user.id,
      activeBondId: context.activeBondId ?? null,
      secret: process.env.SNAPSHOT_SIGNING_PRIVATE_KEY,
    });
  }),
});
