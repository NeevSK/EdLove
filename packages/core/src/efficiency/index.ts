/**
 * What survives of the old efficiency module: the Hermes memory shield. Verger owns every other
 * runtime decision (`@repo/core/verger`).
 */
export {
  getHermesHeapStats,
  reclaimHermesMemory,
  tuneQueryClientForLowMemory,
  setupHermesMemoryShield,
  type HermesHeapStats,
  type MemoryReclamationOptions,
  type MemoryReclamationResult,
} from './hermesDeviceShield';
