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
} from '@/logic/workspace/canvas';
export {
  buildWorkspaceLayoutStorageKey,
  choosePreferredWorkspaceLayout,
  resolveWorkspaceLayoutTarget,
  toWorkspaceLayoutRecord,
  toWorkspaceLayoutUpsert,
} from '@/logic/workspace/layoutSync';
export {
  createWorkspaceRendererConfig,
  resolveWorkspaceRendererPlatform,
} from '@/logic/workspace/renderer';
export { resolveWorkspaceSwitcherTargets } from '@/logic/workspace/workspaceSwitcher';
