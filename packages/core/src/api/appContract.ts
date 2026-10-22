/**
 * @file packages/core/src/api/appContract.ts
 * Unified root oRPC v2 Contract Router.
 * Composes domain procedure contracts across the polymath platform with strict Zod inference.
 */

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
} as const;

export type AppContract = typeof appContract;

export type InferRouteInput<TRoute> = TRoute extends { request: infer TReq }
  ? (TReq extends { body: z.ZodTypeAny } ? { body: z.infer<TReq['body']> } : {}) &
      (TReq extends { query: z.ZodTypeAny } ? { query: z.infer<TReq['query']> } : {}) &
      (TReq extends { params: z.ZodTypeAny } ? { params: z.infer<TReq['params']> } : {})
  : unknown;

export type InferRouteOutput<TRoute> = TRoute extends { responses: infer TRes }
  ? TRes extends { 200: { schema: infer S } }
    ? S extends z.ZodTypeAny
      ? z.infer<S>
      : unknown
    : TRes extends { 201: { schema: infer S } }
      ? S extends z.ZodTypeAny
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
} & Record<string, any>;
