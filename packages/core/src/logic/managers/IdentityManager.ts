import { IIdentityPort } from '../ports/identity.port';
import { Bond, Perspective, Capacity } from '../../types/Identity';
import { User } from '../../types/User';

/**
 * IdentityManager: The Sovereign Orchestrator.
 * This is the "Brain" of the Hexagonal IAM.
 * It coordinates one or more Adapters to fulfill the Identity Port.
 */
export class IdentityManager implements IIdentityPort {
  constructor(private adapter: IIdentityPort) {}

  async getMyInternalId(): Promise<string | null> {
    return this.adapter.getMyInternalId();
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
}
