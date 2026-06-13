import type { UserContext } from '../schemas/user.schema';

export interface IFeatureFlagPort {
  getFlags(context: UserContext): Promise<Record<string, boolean | string>>;
  subscribeToFlagChanges(
    context: UserContext,
    callback: (flags: Record<string, boolean | string>) => void,
  ): () => void;
  trackExposure(flagKey: string, value: boolean | string): void;
}
