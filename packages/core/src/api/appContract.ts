/**
 * @file packages/core/src/api/appContract.ts
 * Unified root oRPC v2 Contract Router.
 * Composes domain procedure contracts across the polymath platform with strict Zod inference.
 */

import { minifyRouterContract } from '@orpc/contract';
import { z } from 'zod';

import { adminORPCContract } from './admin.orpc.contract';
import { agentORPCContract } from './agent.orpc.contract';
import { announcementsORPCContract } from './announcements.orpc.contract';
import { attendanceORPCContract } from './attendance.orpc.contract';
import { channelORPCContract } from './channel.orpc.contract';
import { communityORPCContract } from './community.orpc.contract';
import { educationalORPCContract } from './educational.orpc.contract';
import { eventsORPCContract } from './events.orpc.contract';
import { gradingORPCContract } from './grading.orpc.contract';
import { guardianAssessmentORPCContract } from './guardian-assessment.orpc.contract';
import { identityORPCContract } from './identity.orpc.contract';
import { inventoryContract } from './inventory.contract';
import { libraryORPCContract } from './library.orpc.contract';
import { mappingORPCContract } from './mapping.orpc.contract';
import { messagingORPCContract } from './messaging.orpc.contract';
import { onboardingORPCContract } from './onboarding.orpc.contract';
import { planBridgeORPCContract } from './planBridge.orpc.contract';
import { principalNotesORPCContract } from './principalNotes.orpc.contract';
import { privacyORPCContract } from './privacy.orpc.contract';
import { profileORPCContract } from './profile.orpc.contract';
import { rewardsORPCContract } from './rewards.orpc.contract';
import { socialORPCContract } from './social.orpc.contract';
import { syncORPCContract } from './sync.orpc.contract';
import { workspaceProvisioningORPCContract } from './workspace-provisioning.orpc.contract';

export const appContract: Record<string, Record<string, any>> = {
  admin: adminORPCContract,
  agent: agentORPCContract,
  announcements: announcementsORPCContract,
  attendance: attendanceORPCContract,
  channel: channelORPCContract,
  community: communityORPCContract,
  educational: educationalORPCContract,
  events: eventsORPCContract,
  grading: gradingORPCContract,
  guardianAssessment: guardianAssessmentORPCContract,
  identity: identityORPCContract,
  inventory: inventoryContract,
  library: libraryORPCContract,
  mapping: mappingORPCContract,
  messaging: messagingORPCContract,
  onboarding: onboardingORPCContract,
  planBridge: planBridgeORPCContract,
  principalNotes: principalNotesORPCContract,
  privacy: privacyORPCContract,
  profile: profileORPCContract,
  rewards: rewardsORPCContract,
  social: socialORPCContract,
  sync: syncORPCContract,
  workspaceProvisioning: workspaceProvisioningORPCContract,
} as const;

export type AppContract = typeof appContract;

export type InferRouteInput<TRoute> = TRoute extends { request: infer TReq }
  ? (TReq extends { body: z.ZodType } ? { body: z.infer<TReq['body']> } : {}) &
      (TReq extends { query: z.ZodType } ? { query: z.infer<TReq['query']> } : {}) &
      (TReq extends { params: z.ZodType } ? { params: z.infer<TReq['params']> } : {})
  : unknown;

export type InferRouteOutput<TRoute> = TRoute extends { responses: infer TRes }
  ? TRes extends { 200: { schema: infer S } }
    ? S extends z.ZodType
      ? z.infer<S>
      : unknown
    : TRes extends { 201: { schema: infer S } }
      ? S extends z.ZodType
        ? z.infer<S>
        : unknown
      : unknown
  : unknown;

export type InferRouteClient<TRoute> = [InferRouteInput<TRoute>] extends [never]
  ? (input?: unknown, options?: unknown) => Promise<InferRouteOutput<TRoute>>
  : keyof InferRouteInput<TRoute> extends never
    ? (input?: unknown, options?: unknown) => Promise<InferRouteOutput<TRoute>>
    : (input: InferRouteInput<TRoute>, options?: unknown) => Promise<InferRouteOutput<TRoute>>;

export type InferDomainClient<TDomain> = {
  [K in keyof TDomain]: InferRouteClient<TDomain[K]>;
};

export type AppContractClient = {
  admin: InferDomainClient<typeof adminORPCContract>;
  agent: InferDomainClient<typeof agentORPCContract>;
  announcements: InferDomainClient<typeof announcementsORPCContract>;
  attendance: InferDomainClient<typeof attendanceORPCContract>;
  channel: InferDomainClient<typeof channelORPCContract>;
  community: InferDomainClient<typeof communityORPCContract>;
  educational: InferDomainClient<typeof educationalORPCContract>;
  events: InferDomainClient<typeof eventsORPCContract>;
  grading: InferDomainClient<typeof gradingORPCContract>;
  guardianAssessment: InferDomainClient<typeof guardianAssessmentORPCContract>;
  identity: InferDomainClient<typeof identityORPCContract>;
  library: InferDomainClient<typeof libraryORPCContract>;
  mapping: InferDomainClient<typeof mappingORPCContract>;
  messaging: InferDomainClient<typeof messagingORPCContract>;
  onboarding: InferDomainClient<typeof onboardingORPCContract>;
  planBridge: InferDomainClient<typeof planBridgeORPCContract>;
  principalNotes: InferDomainClient<typeof principalNotesORPCContract>;
  privacy: InferDomainClient<typeof privacyORPCContract>;
  profile: InferDomainClient<typeof profileORPCContract>;
  rewards: InferDomainClient<typeof rewardsORPCContract>;
  social: InferDomainClient<typeof socialORPCContract>;
  sync: InferDomainClient<typeof syncORPCContract>;
  workspaceProvisioning: InferDomainClient<typeof workspaceProvisioningORPCContract>;
} & Record<string, any>;

export type SafeRouteClient<TRouteClient> = TRouteClient extends (
  input: infer TInput,
  options?: infer TOptions,
) => Promise<infer TOutput>
  ? (
      input: TInput,
      options?: TOptions,
    ) => Promise<
      [Error | null, TOutput | undefined, Error | null, boolean] & {
        error: Error | null;
        data: TOutput | undefined;
        definedError: Error | null;
        isSuccess: boolean;
      }
    >
  : any;

export type SafeDomainClient<TDomain> = {
  [K in keyof TDomain]: SafeRouteClient<TDomain[K]>;
};

export type SafeAppContractClient = {
  admin: SafeDomainClient<InferDomainClient<typeof adminORPCContract>>;
  agent: SafeDomainClient<InferDomainClient<typeof agentORPCContract>>;
  announcements: SafeDomainClient<InferDomainClient<typeof announcementsORPCContract>>;
  attendance: SafeDomainClient<InferDomainClient<typeof attendanceORPCContract>>;
  channel: SafeDomainClient<InferDomainClient<typeof channelORPCContract>>;
  community: SafeDomainClient<InferDomainClient<typeof communityORPCContract>>;
  educational: SafeDomainClient<InferDomainClient<typeof educationalORPCContract>>;
  events: SafeDomainClient<InferDomainClient<typeof eventsORPCContract>>;
  grading: SafeDomainClient<InferDomainClient<typeof gradingORPCContract>>;
  guardianAssessment: SafeDomainClient<InferDomainClient<typeof guardianAssessmentORPCContract>>;
  identity: SafeDomainClient<InferDomainClient<typeof identityORPCContract>>;
  library: SafeDomainClient<InferDomainClient<typeof libraryORPCContract>>;
  mapping: SafeDomainClient<InferDomainClient<typeof mappingORPCContract>>;
  messaging: SafeDomainClient<InferDomainClient<typeof messagingORPCContract>>;
  onboarding: SafeDomainClient<InferDomainClient<typeof onboardingORPCContract>>;
  planBridge: SafeDomainClient<InferDomainClient<typeof planBridgeORPCContract>>;
  principalNotes: SafeDomainClient<InferDomainClient<typeof principalNotesORPCContract>>;
  privacy: SafeDomainClient<InferDomainClient<typeof privacyORPCContract>>;
  profile: SafeDomainClient<InferDomainClient<typeof profileORPCContract>>;
  rewards: SafeDomainClient<InferDomainClient<typeof rewardsORPCContract>>;
  social: SafeDomainClient<InferDomainClient<typeof socialORPCContract>>;
  sync: SafeDomainClient<InferDomainClient<typeof syncORPCContract>>;
  workspaceProvisioning: SafeDomainClient<
    InferDomainClient<typeof workspaceProvisioningORPCContract>
  >;
} & Record<string, any>;

/**
 * getMinifiedAppContract
 * Strips verbose Zod schema descriptions and validation ASTs from client contracts.
 * Critical scaling constraint: Protects low-memory Android devices (2GB RAM)
 * running the Hermes engine against bytecode bloat and GC pauses.
 */
export function getMinifiedAppContract() {
  return minifyRouterContract(appContract as any);
}
