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
} from '@repo/core/logic/workspace/layoutSync';
export {
  createWorkspaceRendererConfig,
  resolveWorkspaceRendererPlatform,
} from '@repo/core/logic/workspace/renderer';
export { resolveWorkspaceSwitcherTargets } from '@repo/core/logic/workspace/workspaceSwitcher';
