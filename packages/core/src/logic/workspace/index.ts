export {
  createDefaultWorkspaceLayout,
  groupResolvedWorkspaceSurfacesByZone,
  normalizeWorkspaceLayout,
  resolveWorkspaceSurfaceLayout,
  setWorkspaceSurfaceHidden,
  setWorkspaceSurfaceOrder,
  setWorkspaceSurfacePinned,
  setWorkspaceSurfaceZone,
  WORKSPACE_CANVAS_ZONES,
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
