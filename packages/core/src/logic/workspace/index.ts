export { resolveWorkspaceAppearanceColor } from '@repo/core/logic/workspace/appearance';
export {
  createDefaultWorkspaceLayout,
  getMaxPinnedForWorkspace,
  groupResolvedWorkspaceSurfacesByZone,
  MAX_PINNED_WORKSPACE_SURFACES,
  normalizeWorkspaceLayout,
  resolveWorkspaceSurfaceLayout,
  setWorkspaceSurfaceHidden,
  setWorkspaceSurfaceOrder,
  setWorkspaceSurfacePinned,
  setWorkspaceSurfaceZone,
  WORKSPACE_CANVAS_ZONES,
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
export { resolveWorkspaceSwitcherTargets } from '@repo/core/logic/workspace/workspaceSwitcher';
