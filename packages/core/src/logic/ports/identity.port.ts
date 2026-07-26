import type { Identity } from '@/api/identity.generated';
import type { Bond, Capacity, Perspective } from '@/types/Identity';
import type { User } from '@/types/User';

/**
 * IIdentityPort: The Sovereign Identity Interface.
 * Decouples the application logic from the underlying Auth provider (Supabase, DID, etc.).
 * [LOUD-FAILURE] Renamed from getMyInternalId to identifyActiveCitizen.
 * [LOUD-FAILURE] Updated return type to include context (Bonds/Perspectives).
 */
export interface IIdentityPort {
  /**
   * Resolves the full sovereign identity for the current authenticated user.
   * Includes active bond and available perspectives.
   */
  identifyActiveCitizen(): Promise<Identity | null>;

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
   * Profiles: Completes the user profile.
   */
  completeProfile(userId: string, data: any): Promise<void>;

  /**
   * Onboarding: Marks the onboarding journey as officially completed.
   */
  completeOnboarding(userId: string): Promise<void>;
}
