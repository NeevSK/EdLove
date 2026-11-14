import { Context } from 'effect';

/**
 * The signed permission snapshot for one person and bond, as stored on the device.
 *
 * The adapter checks the record before anything above it sees it: the person and bond match, the
 * policy version is current, the signature verifies, and it hasn't expired. State only receives
 * a verdict and, when valid, the permission map.
 */
export type PermissionSnapshotRead =
  | { readonly kind: 'missing' }
  | { readonly kind: 'rejected'; readonly reason: string }
  | {
      readonly kind: 'valid';
      /** subject -> action -> allowed. Values that aren't booleans mean no decision. */
      readonly permissions: Readonly<Record<string, Readonly<Record<string, unknown>>>>;
      readonly expiresAt: number;
      readonly scopeId: string | null;
    };

export interface IPermissionSnapshotPort {
  read(userId: string, scopeId: string | null): Promise<PermissionSnapshotRead>;
}

export class PermissionSnapshotPort extends Context.Service<
  PermissionSnapshotPort,
  IPermissionSnapshotPort
>()('app/PermissionSnapshotPort') {}
