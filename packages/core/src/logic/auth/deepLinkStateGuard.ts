/**
 * DeepLinkStateGuard
 * Sovereign, testable CSRF State & Nonce manager for external auth callbacks.
 */

export interface DeepLinkStateSession {
  state: string;
  createdAt: number;
  nonce?: string;
}

export class DeepLinkStateGuard {
  private static activeStates = new Map<string, DeepLinkStateSession>();
  private static readonly STATE_TTL_MS = 15 * 60 * 1000; // 15 minutes

  /**
   * Generate and store a cryptographically random state token for an outbound auth request.
   */
  static generateState(nonce?: string): string {
    this.purgeStale();
    // Fallback-safe random state generation
    const randomBytes = new Uint8Array(16);
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      crypto.getRandomValues(randomBytes);
    } else {
      for (let i = 0; i < randomBytes.length; i++) {
        randomBytes[i] = Math.floor(Math.random() * 256);
      }
    }
    const state = Array.from(randomBytes, (b) => b.toString(16).padStart(2, '0')).join('');

    this.activeStates.set(state, {
      state,
      createdAt: Date.now(),
      nonce,
    });
    return state;
  }

  /**
   * Verify and consume an incoming callback state. Returns true only once per valid state.
   */
  static verifyAndConsumeState(state: string | undefined): boolean {
    if (!state) return false;
    this.purgeStale();

    const session = this.activeStates.get(state);
    if (!session) return false;

    if (Date.now() - session.createdAt > this.STATE_TTL_MS) {
      this.activeStates.delete(state);
      return false;
    }

    this.activeStates.delete(state);
    return true;
  }

  /**
   * Purge expired states to prevent memory leaks.
   */
  private static purgeStale(): void {
    const now = Date.now();
    for (const [state, session] of this.activeStates.entries()) {
      if (now - session.createdAt > this.STATE_TTL_MS) {
        this.activeStates.delete(state);
      }
    }
  }

  /**
   * Clear all active states (primarily for testing isolation).
   */
  static resetForTesting(): void {
    this.activeStates.clear();
  }
}
