export { observeEfficiencyDecision } from './observability';
export {
  CRITICAL_FREE_DISK_BYTES,
  type EfficiencyAction,
  type EfficiencyContext,
  type EfficiencyDecision,
  type EfficiencyOperation,
  evaluateEfficiency,
  LOW_BATTERY_LEVEL,
} from './policy';
export {
  classifyMemoryTier,
  MEMORY_TIER_THRESHOLDS,
  memoryBytesToGB,
  type NormalizedNetworkConditions,
  normalizeNetworkConditions,
  type RuntimeDeviceTier,
  type RuntimeNetworkQuality,
  type RuntimeNetworkSnapshot,
  type RuntimeNetworkType,
} from './runtimeConditions';
export {
  type RuntimeVisualBudget,
  type RuntimeVisualSignals,
  resolveRuntimeVisualBudget,
} from './visualBudget';
export {
  buildResponsiveWallpaperUrl,
  resolveWallpaperPresentation,
  type WallpaperPresentation,
} from './wallpaper';
