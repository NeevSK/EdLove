import { IntentKey, Vow } from '../types/Protocol';
import { UserContext } from '../permissions/schemas/user.schema';
import { AppAbility, Actions } from '../permissions/abilities/student';
import { CapabilityKey, PolicyDecision, CapabilityResource } from '../types/Policy';
import { PlatformAccessContext } from '../types/Tenancy';

export type CapabilityEvaluator = (
  context: PlatformAccessContext,
  resource?: CapabilityResource
) => PolicyDecision;

/**
 * ProtocolRegistry: The "Upstream Hub" for Intent fulfillment.
 * Holons register Vows here to satisfy platform architectural intents.
 */
class ProtocolRegistry {
  private vows: Map<IntentKey, Vow[]> = new Map();
  private evaluators: Map<CapabilityKey, CapabilityEvaluator> = new Map();

  /**
   * Register a capability evaluator (formerly CapabilityRegistry).
   */
  registerCapability(capability: CapabilityKey, evaluator: CapabilityEvaluator) {
    this.evaluators.set(capability, evaluator);
  }

  /**
   * Register a Vow to fulfill a specific Intent.
   */
  register(vow: Vow) {
    const existing = this.vows.get(vow.intent) || [];
    // Ensure uniqueness by providerId per intent
    const filtered = existing.filter(v => v.providerId !== vow.providerId);
    this.vows.set(vow.intent, [...filtered, vow]);
  }

  /**
   * Resolve the best Vow for a given Intent based on authorization and priority.
   */
  resolve<P>(
    intent: IntentKey,
    context: UserContext,
    resource?: CapabilityResource,
    ability?: AppAbility
  ): Vow<P> | null {
    const options = this.vows.get(intent) || [];
    
    // 1. Filter by authorization
    const authorized = options.filter(v => {
      try {
        const decision = v.authorize(context, resource);
        
        // If we have a reactive CASL ability, we prioritize its decision
        if (ability && decision.capability) {
          const action = (decision.action || 'read') as Actions;
          return ability.can(action, decision.capability as any);
        }
        
        return decision.allowed;
      } catch (err) {
        console.error(`Error authorizing Vow ${v.providerId} for Intent ${intent}:`, err);
        return false;
      }
    });

    if (authorized.length === 0) return null;

    // 2. Sort by priority (descending)
    return authorized.sort((a, b) => (b.priority || 0) - (a.priority || 0))[0];
  }

  /**
   * Resolve an atomic capability (formerly CapabilityRegistry).
   */
  resolveCapability(
    capability: CapabilityKey,
    context: PlatformAccessContext,
    resource?: CapabilityResource
  ): PolicyDecision | null {
    const evaluator = this.evaluators.get(capability);
    if (!evaluator) return null;
    return evaluator(context, resource);
  }

  /**
   * Get all registered capability keys.
   */
  getCapabilityKeys(): CapabilityKey[] {
    return Array.from(this.evaluators.keys());
  }

  /**
   * Get all registered Intents.
   */
  getRegisteredIntents(): IntentKey[] {
    return Array.from(this.vows.keys());
  }
}

export const protocolRegistry = new ProtocolRegistry();
