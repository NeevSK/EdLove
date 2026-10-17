import {
  ChannelConsentGrantSchema,
  ChannelDelegationSchema,
  ChannelIdentityLinkSchema,
  ChannelLinkInitiationSchema,
  ChannelResourceScopeSchema,
  ExternalChannelProviderSchema,
} from '@repo/core/logic/omnichannel/channelAuthority';
import { z } from 'zod';

const authority = (action: 'read' | 'update') => ({ policy: { action, subject: 'User' } }) as const;

const futureExpiry = z.iso
  .datetime()
  .nullable()
  .refine(
    (value) => value === null || new Date(value).getTime() > Date.now(),
    'Expiry must be in the future.',
  );

const channelConsentInput = z.strictObject({
  purpose: z.string().min(1).max(120),
  capabilities: z.array(z.string().min(1).max(160)).min(1).max(64),
  resourceScope: ChannelResourceScopeSchema,
  expiresAt: futureExpiry,
});

const channelDelegationInput = z.strictObject({
  agentKey: z.string().min(1).max(160),
  capabilities: z.array(z.string().min(1).max(160)).min(1).max(64),
  resourceScope: ChannelResourceScopeSchema,
  expiresAt: futureExpiry,
});

export const channelORPCContract = {
  beginLink: {
    method: 'post',
    path: '/channels/:provider/link-attempts',
    request: { params: z.strictObject({ provider: ExternalChannelProviderSchema }) },
    responses: {
      200: {
        schema: ChannelLinkInitiationSchema,
        description: 'Single-use link ceremony returned once to the authenticated account',
      },
    },
    metadata: authority('update'),
  },
  listMyIdentities: {
    method: 'get',
    path: '/channels/identities',
    request: {},
    responses: {
      200: { schema: z.array(ChannelIdentityLinkSchema), description: 'Linked channel identities' },
    },
    metadata: authority('read'),
  },
  revokeIdentity: {
    method: 'post',
    path: '/channels/identities/:id/revoke',
    request: { params: z.strictObject({ id: z.uuid() }) },
    responses: {
      200: { schema: ChannelIdentityLinkSchema, description: 'Revoked channel identity' },
    },
    metadata: authority('update'),
  },
  grantConsent: {
    method: 'post',
    path: '/channels/identities/:id/consents',
    request: { params: z.strictObject({ id: z.uuid() }), body: channelConsentInput },
    responses: { 200: { schema: ChannelConsentGrantSchema } },
    metadata: authority('update'),
  },
  listMyConsents: {
    method: 'get',
    path: '/channels/consents',
    request: {},
    responses: { 200: { schema: z.array(ChannelConsentGrantSchema) } },
    metadata: authority('read'),
  },
  revokeConsent: {
    method: 'post',
    path: '/channels/consents/:id/revoke',
    request: { params: z.strictObject({ id: z.uuid() }) },
    responses: { 200: { schema: ChannelConsentGrantSchema } },
    metadata: authority('update'),
  },
  grantDelegation: {
    method: 'post',
    path: '/channels/delegations',
    request: { body: channelDelegationInput },
    responses: { 200: { schema: ChannelDelegationSchema } },
    metadata: authority('update'),
  },
  listMyDelegations: {
    method: 'get',
    path: '/channels/delegations',
    request: {},
    responses: { 200: { schema: z.array(ChannelDelegationSchema) } },
    metadata: authority('read'),
  },
  revokeDelegation: {
    method: 'post',
    path: '/channels/delegations/:id/revoke',
    request: { params: z.strictObject({ id: z.uuid() }) },
    responses: { 200: { schema: ChannelDelegationSchema } },
    metadata: authority('update'),
  },
} as const;
