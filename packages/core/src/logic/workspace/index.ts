export {
  WORKSPACE_CANVAS_ZONES,
  createDefaultWorkspaceLayout,
  groupResolvedWorkspaceSurfacesByZone,
  normalizeWorkspaceLayout,
  resolveWorkspaceSurfaceLayout,
  setWorkspaceSurfaceHidden,
  setWorkspaceSurfaceOrder,
  setWorkspaceSurfacePinned,
  setWorkspaceSurfaceZone,
} from './canvas';
export {
  buildWorkspaceLayoutStorageKey,
  choosePreferredWorkspaceLayout,
  resolveWorkspaceLayoutTarget,
  toWorkspaceLayoutRecord,
  toWorkspaceLayoutUpsert,
} from './layoutSync';
export {
  createWorkspaceRendererConfig,
  resolveWorkspaceRendererPlatform,
} from './renderer';
export { resolveWorkspaceSwitcherTargets } from './workspaceSwitcher';
