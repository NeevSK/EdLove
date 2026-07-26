import type { Identity } from '@/api/identity.generated';
import type { Bond, Capacity, Perspective } from '@/types/Identity';
import type { User } from '@/types/User';
import type { IIdentityPort } from '@/logic/ports/identity.port';
import type { ISessionPort } from '@/logic/ports/session.port';

/**
 * IdentityManager: The Sovereign Orchestrator.
 * This is the "Brain" of the Hexagonal IAM.
 * It coordinates one or more Adapters to fulfill the Identity Port.
 */
export class IdentityManager implements IIdentityPort, ISessionPort {
  constructor(private adapter: IIdentityPort) {}

  /**
   * [LOUD-FAILURE] Renamed from getMyInternalId
   */
  async identifyActiveCitizen(): Promise<Identity | null> {
    return this.adapter.identifyActiveCitizen();
  }

  /**
   * Legacy session port support - redirects to identifyActiveCitizen
   */
  async getUserId(): Promise<string | null> {
    const identity = await this.identifyActiveCitizen();
    return identity?.id ?? null;
  }

  async resolveInternalId(provider: string, providerUserId: string): Promise<string | null> {
    return this.adapter.resolveInternalId(provider, providerUserId);
  }

  async linkIdentity(userId: string, provider: string, providerUserId: string): Promise<void> {
    return this.adapter.linkIdentity(userId, provider, providerUserId);
  }

  async getProfile(userId: string): Promise<User> {
    return this.adapter.getProfile(userId);
  }

  async getBonds(userId: string): Promise<Bond[]> {
    return this.adapter.getBonds(userId);
  }

  async hasCapacity(capacity: Capacity, contextId?: string): Promise<boolean> {
    return this.adapter.hasCapacity(capacity, contextId);
  }

  async getActivePerspective(): Promise<Perspective | null> {
    return this.adapter.getActivePerspective();
  }

  async switchPerspective(entityId: string, capacity: Capacity): Promise<void> {
    return this.adapter.switchPerspective(entityId, capacity);
  }

  async createInitialBond(orientation: Capacity, context: Record<string, any>): Promise<void> {
    return this.adapter.createInitialBond(orientation, context);
  }

  async completeProfile(userId: string, data: any): Promise<void> {
    return this.adapter.completeProfile(userId, data);
  }

  async updateProfile(userId: string, updates: Partial<User>): Promise<void> {
    return this.adapter.updateProfile(userId, updates);
  }

  async blockUser(blockerId: string, blockedId: string): Promise<void> {
    return this.adapter.blockUser(blockerId, blockedId);
  }

  async unblockUser(blockerId: string, blockedId: string): Promise<void> {
    return this.adapter.unblockUser(blockerId, blockedId);
  }

  async completeOnboarding(userId: string): Promise<void> {
    return this.adapter.completeOnboarding(userId);
  }
}
