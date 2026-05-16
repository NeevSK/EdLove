/**
 * ISessionPort: The Sovereign Session Interface.
 * Provides a lightweight way to access the current user's identity without
 * pulling in the full Identity/Profile domain logic.
 */
export interface ISessionPort {
  /**
   * Returns the internal ID of the currently logged-in user.
   * Returns null if no user is authenticated.
   */
  getUserId(): Promise<string | null>;
}
