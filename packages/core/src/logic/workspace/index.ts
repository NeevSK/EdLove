export {
  createDefaultWorkspaceLayout,
  groupResolvedWorkspaceSurfacesByZone,
  normalizeWorkspaceLayout,
  resolveWorkspaceSurfaceLayout,
  setWorkspaceSurfaceHidden,
  setWorkspaceSurfaceOrder,
  setWorkspaceSurfacePinned,
  setWorkspaceSurfaceZone,
  MAX_PINNED_WORKSPACE_SURFACES,
  WORKSPACE_CANVAS_ZONES,
  getMaxPinnedForWorkspace,
} from '@repo/core/logic/workspace/canvas';
export {
  buildWorkspaceLayoutStorageKey,
  choosePreferredWorkspaceLayout,
  resolveWorkspaceLayoutTarget,
  toWorkspaceLayoutRecord,
  toWorkspaceLayoutUpsert,
} from '@repo/core/logic/workspace/layoutSync';
export {
  createWorkspaceRendererConfig,
  resolveWorkspaceRendererPlatform,
} from '@repo/core/logic/workspace/renderer';
export { resolveWorkspaceSwitcherTargets } from '@repo/core/logic/workspace/workspaceSwitcher';
