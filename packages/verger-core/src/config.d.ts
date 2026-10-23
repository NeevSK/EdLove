import type { GovernorConfig } from './types';
/**
 * Defaults. Frame thresholds and back-off follow @rbayuokt/expo-adaptive-glass (MIT), whose
 * author notes they are not yet benchmarked; thermal thresholds follow the Android ADPF thermal
 * guide (headroom > 0.85 watch, > 0.95 reduce, > 1.0 reduce immediately). Every value here is
 * provisional until A52 and 2–3 GB release-build captures calibrate it.
 */
export declare const DEFAULT_GOVERNOR_CONFIG: GovernorConfig;
//# sourceMappingURL=config.d.ts.map