export { resolveWorkspaceAppearanceColor } from '@repo/core/logic/workspace/appearance';
export {
  areasOfSurfaces,
  createDefaultWorkspaceLayout,
  getMaxPinnedForWorkspace,
  groupResolvedWorkspaceSurfacesByZone,
  MAX_PINNED_WORKSPACE_SURFACES,
  nextAreaOf,
  normalizeWorkspaceLayout,
  resolveWorkspaceSurfaceLayout,
  setWorkspaceFloorSettings,
  setWorkspaceSurfaceHidden,
  setWorkspaceSurfaceOrder,
  setWorkspaceSurfacePinned,
  setWorkspaceSurfaceZone,
} from '@repo/core/logic/workspace/canvas';
export {
  buildWorkspaceLayoutStorageKey,
  choosePreferredWorkspaceLayout,
  resolveWorkspaceLayoutTarget,
  toWorkspaceLayoutRecord,
  toWorkspaceLayoutUpsert,
  WORKSPACE_COMPACT_BREAKPOINT,
} from '@repo/core/logic/workspace/layoutSync';
export {
  type ProvisionalWorkspaceCommand,
  queueCommercialWorkspace,
  queueGuardianWorkspace,
  reconcileProvisionalWorkspaces,
  useProvisionalWorkspaceQueue,
} from '@repo/core/logic/workspace/provisionalWorkspace';
export {
  createWorkspaceRendererConfig,
  resolveWorkspaceRendererPlatform,
} from '@repo/core/logic/workspace/renderer';
export {
  type WorkspaceRoomName,
  workspaceRoomNameOf,
} from '@repo/core/logic/workspace/roomName';
export { resolveWorkspaceSwitcherTargets } from '@repo/core/logic/workspace/workspaceSwitcher';
