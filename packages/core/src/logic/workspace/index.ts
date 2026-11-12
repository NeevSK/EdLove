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
  appearanceForSync,
  followWorldGround,
  type GroundSource,
  type GroundWrite,
  groundModePatch,
  isDeviceOnlyWallpaper,
  mergeSavedGround,
  type ResolvedGround,
  resolveRoomGround,
  roomHasOwnGround,
  WORLD_GROUND_ID,
  wallpaperConfigPatch,
  wallpaperPatch,
  writeGround,
} from '@repo/core/logic/workspace/ground';
export {
  DEFAULT_TEXTURE,
  GROUND_NOTE_TEXT,
  GROUND_OPTIONS,
  type GroundAllowance,
  type GroundControls,
  type GroundNote,
  type GroundPlan,
  type GroundSurface,
  type GroundTexture,
  type GroundTint,
  groundAllowanceOf,
  groundControls,
  isGroundTexture,
  NOTHING_ALLOWED,
  planGround,
} from '@repo/core/logic/workspace/groundPlan';
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
