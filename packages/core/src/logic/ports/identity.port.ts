import { User } from '../../types/User';
import { Bond, Perspective, Capacity } from '../../types/Identity';

/**
 * IIdentityPort: The Sovereign Identity Interface.
 * Decouples the application logic from the underlying Auth provider (Supabase, DID, etc.).
 */
export interface IIdentityPort {
  /**
   * Resolves the internal platform UUID for the current authenticated user.
   */
  getMyInternalId(): Promise<string | null>;

  /**
   * Resolves the internal user ID from a provider and provider-specific user ID.
   */
  resolveInternalId(provider: string, providerUserId: string): Promise<string | null>;

  /**
   * Links an authentication identity to an existing internal user.
   */
  linkIdentity(userId: string, provider: string, providerUserId: string): Promise<void>;

  /**
   * Retrieves the full profile for a given user.
   */
  getProfile(userId: string): Promise<User>;

  /**
   * ReBAC: Retrieves all active relationships (Bonds) for the user.
   */
  getBonds(userId: string): Promise<Bond[]>;

  /**
   * Logic Check: Does the user have a specific capacity in a given context?
   */
  hasCapacity(capacity: Capacity, contextId?: string): Promise<boolean>;

  /**
   * Perspectives: Returns the current "Lens" the user is acting through.
   */
  getActivePerspective(): Promise<Perspective | null>;

  /**
   * Perspectives: Swaps the active lens (e.g., switching from Teacher to Parent).
   */
  switchPerspective(entityId: string, capacity: Capacity): Promise<void>;

  /**
   * Onboarding: Creates the inaugural Bond for a new user.
   */
  createInitialBond(orientation: Capacity, context: Record<string, any>): Promise<void>;

  /**
   * Profiles: Updates the user's profile.
   */
  updateProfile(userId: string, updates: Partial<User>): Promise<void>;

  /**
   * Relationships: Blocks another user.
   */
  blockUser(blockerId: string, blockedId: string): Promise<void>;

  /**
   * Relationships: Unblocks another user.
   */
  unblockUser(blockerId: string, blockedId: string): Promise<void>;

  /**
   * Notifications: Creates a notification for a user.
   */
  createNotification(userId: string, type: string, title: string, message: string, metadata?: any): Promise<void>;

  /**
   * Notifications: Retrieves notifications for a user.
   */
  getNotifications(userId: string): Promise<any[]>;

  /**
   * Notifications: Updates the read status of a notification.
   */
  updateNotificationStatus(notificationId: string, isRead: boolean): Promise<void>;

  /**
   * Profiles: Completes the user profile.
   */
  completeProfile(userId: string, data: any): Promise<void>;

  /**
   * Push Notifications: Registers a device push token for a user.
   */
  registerPushToken(userId: string, token: string, deviceId: string, platform: string): Promise<void>;

  /**
   * Push Notifications: Unregisters a device push token.
   */
  unregisterPushToken(userId: string, deviceId: string): Promise<void>;
}
