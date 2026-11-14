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
    // Client-side event logging
    if (process.env.NODE_ENV !== 'production') {
      console.log('[growthSignalsAPI] Emitted signal:', input.event_type, input.user_id);
    }
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
