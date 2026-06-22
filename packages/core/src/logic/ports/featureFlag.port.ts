import type { UserContext } from '../schemas/user.schema';
import type { FeatureRolloutSnapshot, IFeatureRolloutPort } from './featureRollout.port';

export type { FeatureRolloutSnapshot, IFeatureRolloutPort } from './featureRollout.port';

/**
 * @deprecated Prefer IFeatureRolloutPort.
 * Kept for compatibility while the rollout layer is migrated.
 */
export interface IFeatureFlagPort extends IFeatureRolloutPort {
  getFlags(context: UserContext): Promise<Record<string, boolean | string>>;
}
