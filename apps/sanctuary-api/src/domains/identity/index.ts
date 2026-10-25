import { agentRouter } from '../../core/handlers/agent';
import { eventsRouter } from '../../core/handlers/events';
import { historyRouter } from '../../core/handlers/history';
import { identityRouter } from '../../core/handlers/identity';
import { longitudinalRouter } from '../../core/handlers/longitudinal';
import { onboardingRouter } from '../../core/handlers/onboarding';
import { permissionSnapshotRouter } from '../../core/handlers/permissionSnapshot';
import { planBridgeRouter } from '../../core/handlers/planBridge';
import { privacyRouter } from '../../core/handlers/privacy';
import { profileRouter } from '../../core/handlers/profile';
import { syncRouter } from '../../core/handlers/sync';
import { trackingRouter } from '../../core/handlers/tracking';
import { o } from '../../core/orpc';

/**
 * Identity & Governance Bounded Context (Sanctuary Spine, Bonds & Policy)
 * 
 * Grounded in @repo/core, @repo/profile, @repo/policies, @repo/database:
 * Canonical UUIDv8 account identity, active capacity bonds, Cedar policy snapshots,
 * and PowerSync offline-first replication.
 */
export const identityDomainRouter = o.router({
  // Direct procedures from identityRouter (account claim, credentials, tokens)
  ...identityRouter,

  // Explicit sub-capabilities within the Identity Bounded Context
  account: identityRouter,
  identity: identityRouter,
  profile: profileRouter,
  onboarding: onboardingRouter,
  authorization: permissionSnapshotRouter,
  permissionSnapshot: permissionSnapshotRouter,
  sync: syncRouter,
  privacy: privacyRouter,
  tracking: trackingRouter,
  events: eventsRouter,
  history: historyRouter,
  longitudinal: longitudinalRouter,
  agent: agentRouter,
  planBridge: planBridgeRouter,
});

export {
  identityRouter,
  profileRouter,
  onboardingRouter,
  permissionSnapshotRouter,
  syncRouter,
  privacyRouter,
  trackingRouter,
  eventsRouter,
  historyRouter,
  longitudinalRouter,
  agentRouter,
  planBridgeRouter,
};
