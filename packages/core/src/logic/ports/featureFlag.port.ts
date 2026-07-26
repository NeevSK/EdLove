import type { UserContext } from '@/logic/schemas/user.schema';
import type { FeatureRolloutSnapshot, IFeatureRolloutPort } from '@/logic/ports/featureRollout.port';

export type { FeatureRolloutSnapshot, IFeatureRolloutPort } from '@/logic/ports/featureRollout.port';

/**
 * @deprecated Prefer IFeatureRolloutPort.
 * Kept for compatibility while the rollout layer is migrated.
 */
export interface IFeatureFlagPort extends IFeatureRolloutPort {
  getFlags(context: UserContext): Promise<Record<string, boolean | string>>;
}
