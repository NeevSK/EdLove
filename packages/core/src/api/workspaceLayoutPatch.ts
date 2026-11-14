import { orpcClient } from '@repo/core/api/orpcClient';
import {
  type WorkspaceLayoutPatch,
  WorkspaceLayoutPatchSchema,
} from '@repo/core/logic/workspace/layoutPatch';

/** Resolves only on a matching durable server receipt; conflicts remain actionable. */
export async function submitWorkspaceLayoutPatch(input: WorkspaceLayoutPatch) {
  const patch = WorkspaceLayoutPatchSchema.parse(input);
  const result = await orpcClient.sync.patchWorkspaceLayout({ body: patch });
  if (result.status === 'conflict') {
    throw Object.assign(new Error(result.conflictReason), { status: 409, remoteState: result });
  }
  if (result.operationId !== patch.operationId || result.serverRevision < patch.baseRevision) {
    throw new Error('Workspace layout receipt does not match the pending operation.');
  }
  return result;
}
