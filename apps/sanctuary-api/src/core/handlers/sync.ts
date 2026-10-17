import { ORPCError } from '@orpc/server';
import { applyPowerSyncBatch, syncContract } from '@repo/core/api/server';
import { hashWorkspaceLayoutPatchGroup } from '@repo/core/logic/workspace/layoutPatch';
import { implement, type ORPCContext } from '../orpc';
import { doubleGateMiddleware } from '../orpcMiddleware';

const impl = implement(syncContract).$context<ORPCContext>();

export const syncRouter = impl.router({
  getMutationReceipt: impl.getMutationReceipt
    .use(doubleGateMiddleware)
    .handler(async ({ input, context }) => {
      if (context.user.id === 'anonymous') {
        throw new ORPCError('FORBIDDEN', { message: 'Authentication required' });
      }
      if (!context.db) {
        throw new ORPCError('INTERNAL_SERVER_ERROR', {
          message: 'Database context not initialized',
        });
      }

      const rows = await context.db.$queryRaw<Array<{ status: string; error: string | null }>>`
      select status, error
      from public.platform_worker_events
      where event_name like 'sync/%'
        and entity_id = ${input.params.mutationId}
        and payload->>'actorId' = ${context.user.id}
      order by updated_at desc
      limit 1
    `;
      const receipt = rows[0];
      if (!receipt) {
        return { mutationId: input.params.mutationId, status: 'pending' as const };
      }
      return {
        mutationId: input.params.mutationId,
        status: receipt.status === 'completed' ? ('completed' as const) : ('failed' as const),
        error: receipt.error,
      };
    }),
  uploadBatch: impl.uploadBatch.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    if (context.user.id === 'anonymous') {
      throw new ORPCError('FORBIDDEN', { message: 'Authentication required' });
    }
    if (!context.db) {
      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: 'Database context not initialized',
      });
    }

    const profile = await context.db.user.findUnique({
      where: { id: context.user.id },
      select: { citizenship: true, is_anonymous: true },
    });
    if (profile?.is_anonymous === true || profile?.citizenship === 'THIRD_CLASS') {
      throw new ORPCError('FORBIDDEN', {
        message: 'Local-only identities cannot synchronize account data.',
      });
    }

    return applyPowerSyncBatch(
      context.db,
      input.body.crud,
      input.body.idempotencyKey,
      context.user.id,
    );
  }),
  patchWorkspaceLayout: impl.patchWorkspaceLayout
    .use(doubleGateMiddleware)
    .handler(async ({ input, context }) => {
      if (context.user.id === 'anonymous') {
        throw new ORPCError('FORBIDDEN', { message: 'Authentication required' });
      }
      if (!context.db) {
        throw new ORPCError('INTERNAL_SERVER_ERROR', {
          message: 'Database context not initialized',
        });
      }

      const patch = input.body;
      if (patch.userId !== context.user.id) {
        throw new ORPCError('FORBIDDEN', {
          message: 'You can only update your own workspace layout.',
        });
      }

      // Check existing receipt for idempotency
      const existingReceipts = await context.db.$queryRaw<
        Array<{
          operation_id: string;
          status: string;
          result: { serverRevision?: number } | null;
          error_message: string | null;
        }>
      >`
        SELECT operation_id, status, result, error_message
        FROM public.operation_receipts
        WHERE account_id = ${context.user.id}::uuid
          AND capability = 'workspace_layout_patch'
          AND idempotency_key = ${patch.idempotencyKey}::uuid
        LIMIT 1
      `;

      const existingReceipt = existingReceipts[0];
      if (existingReceipt) {
        if (existingReceipt.status === 'committed') {
          return {
            status: 'completed' as const,
            operationId: patch.operationId,
            serverRevision: Number(existingReceipt.result?.serverRevision ?? patch.baseRevision),
          };
        }
      }

      // Fetch current authoritative layout row
      const currentRows = await context.db.$queryRaw<
        Array<{
          user_id: string;
          workspace_id: string;
          order_json: string[];
          hidden_json: string[];
          pinned_json: string[];
          zone_by_surface_jsonb: Record<string, string | number>;
          is_default: boolean;
          surface_metadata_jsonb: Record<string, any>;
          revision: number;
          updated_at: string;
        }>
      >`
        SELECT user_id, workspace_id, order_json, hidden_json, pinned_json,
               zone_by_surface_jsonb, is_default, surface_metadata_jsonb,
               revision, updated_at
        FROM public.user_workspace_layouts
        WHERE user_id = ${context.user.id}::uuid
          AND workspace_id = ${patch.workspaceId}
        LIMIT 1
      `;

      const currentRow = currentRows[0];
      const serverRevision = Number(currentRow?.revision ?? 0);

      // 1. Revision ahead check: Client base revision is strictly ahead of server
      if (patch.baseRevision > serverRevision) {
        return {
          status: 'conflict' as const,
          conflictReason: 'PATCH_REVISION_AHEAD',
          conflictFetchReference: {
            workspaceId: patch.workspaceId,
            layoutTarget: patch.layoutTarget,
          },
        };
      }

      // 2. Assess group conflict: Check if changed groups' base hashes match current row
      const currentAppearance = currentRow?.surface_metadata_jsonb?.__workspaceAppearance ?? {
        preset: 'default',
        motion: 'off',
        wallpaper: null,
      };

      const conflictingGroups: Array<'arrangement' | 'appearance' | 'groups'> = [];

      if (patch.changes.appearance) {
        const currentAppearanceHash = await hashWorkspaceLayoutPatchGroup(currentAppearance);
        if (currentAppearanceHash !== patch.changes.appearance.baseHash) {
          conflictingGroups.push('appearance');
        }
      }

      if (patch.changes.arrangement) {
        const currentArrangement = {
          order: currentRow?.order_json ?? [],
          hidden: currentRow?.hidden_json ?? [],
          pinned: currentRow?.pinned_json ?? [],
          zoneBySurface: currentRow?.zone_by_surface_jsonb ?? {},
        };
        const currentArrangementHash = await hashWorkspaceLayoutPatchGroup(currentArrangement);
        if (currentArrangementHash !== patch.changes.arrangement.baseHash) {
          conflictingGroups.push('arrangement');
        }
      }

      if (patch.changes.groups) {
        const currentGroups = (currentRow?.surface_metadata_jsonb?.groupOrder as string[]) ?? [];
        const currentGroupsHash = await hashWorkspaceLayoutPatchGroup(currentGroups);
        if (currentGroupsHash !== patch.changes.groups.baseHash) {
          conflictingGroups.push('groups');
        }
      }

      if (conflictingGroups.length > 0) {
        return {
          status: 'conflict' as const,
          conflictReason: 'PATCH_GROUP_CONFLICT',
          conflictingGroups,
          conflictFetchReference: {
            workspaceId: patch.workspaceId,
            layoutTarget: patch.layoutTarget,
          },
        };
      }

      // 3. Wallpaper ownership validation if appearance changed with a wallpaper
      if (patch.changes.appearance?.value.wallpaper) {
        const wallpaper = patch.changes.appearance.value.wallpaper;
        const ownerPrefix = `gurudevi/${context.user.id}/wallpapers/`;
        if (!wallpaper.publicId.startsWith(ownerPrefix)) {
          throw new ORPCError('FORBIDDEN', {
            message: 'Wallpaper asset is not owned by this account.',
          });
        }

        const assets = await context.db.$queryRaw<
          Array<{ public_id: string; deletion_state?: string }>
        >`
          SELECT public_id, secure_url, width, height, deletion_state
          FROM public.user_wallpaper_assets
          WHERE user_id = ${context.user.id}::uuid
            AND public_id = ${wallpaper.publicId}
          LIMIT 1
        `;

        if (!assets[0] || assets[0].deletion_state === 'deleted') {
          throw new ORPCError('FORBIDDEN', {
            message: 'Referenced wallpaper asset is not registered or active.',
          });
        }
      }

      // 4. Construct updated surface metadata and apply changes
      const updatedMetadata = { ...(currentRow?.surface_metadata_jsonb ?? {}) };
      if (patch.changes.appearance) {
        const appVal = patch.changes.appearance.value;
        const nextAppearance: Record<string, any> = {
          preset: appVal.preset,
          motion: appVal.motion,
        };
        if (appVal.wallpaper) {
          nextAppearance.wallpaper = appVal.wallpaper;
        }
        updatedMetadata.__workspaceAppearance = nextAppearance;
      }

      const nextOrder = patch.changes.arrangement
        ? patch.changes.arrangement.value.order
        : (currentRow?.order_json ?? []);
      const nextHidden = patch.changes.arrangement
        ? patch.changes.arrangement.value.hidden
        : (currentRow?.hidden_json ?? []);
      const nextPinned = patch.changes.arrangement
        ? patch.changes.arrangement.value.pinned
        : (currentRow?.pinned_json ?? []);
      const nextZones = patch.changes.arrangement
        ? patch.changes.arrangement.value.zoneBySurface
        : (currentRow?.zone_by_surface_jsonb ?? {});

      const nextRevisionRows = await context.db.$queryRaw<Array<{ revision: number }>>`
        UPDATE public.user_workspace_layouts
        SET order_json = ${JSON.stringify(nextOrder)}::jsonb,
            hidden_json = ${JSON.stringify(nextHidden)}::jsonb,
            pinned_json = ${JSON.stringify(nextPinned)}::jsonb,
            zone_by_surface_jsonb = ${JSON.stringify(nextZones)}::jsonb,
            surface_metadata_jsonb = ${JSON.stringify(updatedMetadata)}::jsonb,
            revision = revision + 1,
            updated_at = NOW()
        WHERE user_id = ${context.user.id}::uuid
          AND workspace_id = ${patch.workspaceId}
        RETURNING revision
      `;

      const newRevision = Number(nextRevisionRows[0]?.revision ?? serverRevision + 1);

      return {
        status: 'completed' as const,
        operationId: patch.operationId,
        serverRevision: newRevision,
      };
    }),
});

