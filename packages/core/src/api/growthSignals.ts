import { growth } from '@repo/core/logic/managers/factory';
import type { GrowthSignalType } from '@repo/core/api/growthSignals.generated';

export const growthSignalsAPI = {
  /**
   * Emit a growth signal for a user.
   */
  async emitSignal(input: {
    user_id: string;
    event_type: GrowthSignalType;
    event_metadata?: Record<string, unknown>;
  }): Promise<void> {
    return growth.emitSignal(input);
  },

  /**
   * Fire-and-forget convenience wrapper around `emitSignal`.
   */
  emitSilent(input: {
    user_id: string;
    event_type: GrowthSignalType;
    event_metadata?: Record<string, unknown>;
  }): void {
    void this.emitSignal(input).catch(() => {});
  },
};
