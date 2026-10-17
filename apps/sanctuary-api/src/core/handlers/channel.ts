import crypto from 'node:crypto';
import { channelORPCContract } from '@repo/core/api/channel.orpc.contract';
import {
  ChannelConsentGrantSchema,
  ChannelDelegationSchema,
  ChannelIdentityLinkSchema,
  ChannelLinkInitiationSchema,
} from '@repo/core/logic/omnichannel/channelAuthority';
import { SovereignError } from '@repo/core/types/Errors';
import { queryDatabaseRows } from '@repo/database/client';
import { assertDatabase } from '../apiErrors';
import { implement, type ORPCContext } from '../orpc';
import { doubleGateMiddleware } from '../orpcMiddleware';

const impl = implement(channelORPCContract).$context<ORPCContext>();

type ChannelIdentityRow = {
  id: string;
  account_id: string | null;
  provider: 'whatsapp' | 'telegram';
  state: 'pending' | 'verified' | 'linked' | 'suspended' | 'revoked';
  confirmed_at: Date | string | null;
  revoked_at: Date | string | null;
};

type ChannelLinkAttemptRow = {
  id: string;
  provider: 'whatsapp' | 'telegram';
  expires_at: Date | string;
};

type ChannelConsentRow = {
  id: string;
  account_id: string;
  channel_identity_id: string;
  purpose: string;
  capabilities: string[];
  resource_scope: unknown;
  status: 'active' | 'revoked' | 'expired';
  expires_at: Date | string | null;
  revoked_at: Date | string | null;
};

type ChannelDelegationRow = {
  id: string;
  account_id: string;
  agent_key: string;
  capabilities: string[];
  resource_scope: unknown;
  status: 'active' | 'revoked' | 'expired';
  expires_at: Date | string | null;
  revoked_at: Date | string | null;
};

const LINK_ATTEMPT_TTL_MS = 10 * 60 * 1000;

function createLinkToken() {
  return crypto.randomBytes(32).toString('base64url');
}

function hashLinkToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function requireAccount(context: ORPCContext): void {
  assertDatabase(context);
  if (context.user.id === 'anonymous') throw SovereignError.authenticationRequired();
}

function mapIdentity(row: ChannelIdentityRow) {
  return ChannelIdentityLinkSchema.parse({
    id: row.id,
    accountId: row.account_id,
    provider: row.provider,
    state: row.state,
    confirmedAt: row.confirmed_at ? new Date(row.confirmed_at).toISOString() : null,
    revokedAt: row.revoked_at ? new Date(row.revoked_at).toISOString() : null,
  });
}

function isoDate(value: Date | string | null): string | null {
  return value ? new Date(value).toISOString() : null;
}

function mapConsent(row: ChannelConsentRow) {
  return ChannelConsentGrantSchema.parse({
    id: row.id,
    accountId: row.account_id,
    channelIdentityId: row.channel_identity_id,
    purpose: row.purpose,
    capabilities: row.capabilities,
    resourceScope: row.resource_scope,
    status: row.status,
    expiresAt: isoDate(row.expires_at),
    revokedAt: isoDate(row.revoked_at),
  });
}

function mapDelegation(row: ChannelDelegationRow) {
  return ChannelDelegationSchema.parse({
    id: row.id,
    accountId: row.account_id,
    agentKey: row.agent_key,
    capabilities: row.capabilities,
    resourceScope: row.resource_scope,
    status: row.status,
    expiresAt: isoDate(row.expires_at),
    revokedAt: isoDate(row.revoked_at),
  });
}

export const channelRouter = impl.router({
  beginLink: impl.beginLink.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    requireAccount(context);
    const linkToken = createLinkToken();
    const expiresAt = new Date(Date.now() + LINK_ATTEMPT_TTL_MS);
    const rows = await queryDatabaseRows<ChannelLinkAttemptRow>(
      `insert into public.channel_link_attempts
        (id, account_id, provider, nonce_hash, purpose, state, expires_at)
       values ($1::uuid, $2::uuid, $3, $4, 'account_link', 'pending', $5::timestamptz)
       returning id, provider, expires_at`,
      [
        crypto.randomUUID(),
        context.user.id,
        input.params.provider,
        hashLinkToken(linkToken),
        expiresAt,
      ],
    );
    const attempt = rows[0];
    if (!attempt) throw SovereignError.unavailable('CHANNEL_LINK_CEREMONY_UNAVAILABLE');
    return ChannelLinkInitiationSchema.parse({
      id: attempt.id,
      provider: attempt.provider,
      linkToken,
      expiresAt: new Date(attempt.expires_at).toISOString(),
    });
  }),

  listMyIdentities: impl.listMyIdentities.use(doubleGateMiddleware).handler(async ({ context }) => {
    requireAccount(context);
    const rows = await queryDatabaseRows<ChannelIdentityRow>(
      `select id, account_id, provider, state, confirmed_at, revoked_at
       from public.channel_identities where account_id = $1::uuid order by created_at desc`,
      [context.user.id],
    );
    return rows.map(mapIdentity);
  }),

  revokeIdentity: impl.revokeIdentity
    .use(doubleGateMiddleware)
    .handler(async ({ input, context }) => {
      requireAccount(context);
      const rows = await queryDatabaseRows<ChannelIdentityRow>(
        `update public.channel_identities set state = 'revoked', revoked_at = now()
       where id = $1::uuid and account_id = $2::uuid and revoked_at is null
       returning id, account_id, provider, state, confirmed_at, revoked_at`,
        [input.params.id, context.user.id],
      );
      if (!rows[0]) throw SovereignError.notFound('Channel identity');
      return mapIdentity(rows[0]);
    }),

  grantConsent: impl.grantConsent.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    requireAccount(context);
    const rows = await queryDatabaseRows<ChannelConsentRow>(
      `insert into public.channel_consent_grants
        (id, account_id, channel_identity_id, purpose, capabilities, resource_scope, status, expires_at)
       select $1::uuid, identity.account_id, identity.id, $3, $4::text[], $5::jsonb, 'active', $6::timestamptz
         from public.channel_identities as identity
        where identity.id = $2::uuid
          and identity.account_id = $7::uuid
          and identity.state = 'linked'
          and identity.revoked_at is null
       returning id, account_id, channel_identity_id, purpose, capabilities, resource_scope,
                 status, expires_at, revoked_at`,
      [
        crypto.randomUUID(),
        input.params.id,
        input.body.purpose,
        input.body.capabilities,
        JSON.stringify(input.body.resourceScope),
        input.body.expiresAt,
        context.user.id,
      ],
    );
    if (!rows[0]) throw SovereignError.notFound('Linked channel identity');
    return mapConsent(rows[0]);
  }),

  listMyConsents: impl.listMyConsents.use(doubleGateMiddleware).handler(async ({ context }) => {
    requireAccount(context);
    const rows = await queryDatabaseRows<ChannelConsentRow>(
      `select id, account_id, channel_identity_id, purpose, capabilities, resource_scope,
              status, expires_at, revoked_at
         from public.channel_consent_grants
        where account_id = $1::uuid
        order by created_at desc`,
      [context.user.id],
    );
    return rows.map(mapConsent);
  }),

  revokeConsent: impl.revokeConsent
    .use(doubleGateMiddleware)
    .handler(async ({ input, context }) => {
      requireAccount(context);
      const rows = await queryDatabaseRows<ChannelConsentRow>(
        `update public.channel_consent_grants
          set status = 'revoked', revoked_at = now()
        where id = $1::uuid and account_id = $2::uuid and revoked_at is null
       returning id, account_id, channel_identity_id, purpose, capabilities, resource_scope,
                 status, expires_at, revoked_at`,
        [input.params.id, context.user.id],
      );
      if (!rows[0]) throw SovereignError.notFound('Channel consent grant');
      return mapConsent(rows[0]);
    }),

  grantDelegation: impl.grantDelegation
    .use(doubleGateMiddleware)
    .handler(async ({ input, context }) => {
      requireAccount(context);
      const rows = await queryDatabaseRows<ChannelDelegationRow>(
        `insert into public.channel_delegations
        (id, account_id, agent_key, capabilities, resource_scope, status, expires_at)
       values ($1::uuid, $2::uuid, $3, $4::text[], $5::jsonb, 'active', $6::timestamptz)
       returning id, account_id, agent_key, capabilities, resource_scope, status, expires_at, revoked_at`,
        [
          crypto.randomUUID(),
          context.user.id,
          input.body.agentKey,
          input.body.capabilities,
          JSON.stringify(input.body.resourceScope),
          input.body.expiresAt,
        ],
      );
      if (!rows[0]) throw SovereignError.unavailable('CHANNEL_DELEGATION_UNAVAILABLE');
      return mapDelegation(rows[0]);
    }),

  listMyDelegations: impl.listMyDelegations
    .use(doubleGateMiddleware)
    .handler(async ({ context }) => {
      requireAccount(context);
      const rows = await queryDatabaseRows<ChannelDelegationRow>(
        `select id, account_id, agent_key, capabilities, resource_scope, status, expires_at, revoked_at
         from public.channel_delegations
        where account_id = $1::uuid
        order by created_at desc`,
        [context.user.id],
      );
      return rows.map(mapDelegation);
    }),

  revokeDelegation: impl.revokeDelegation
    .use(doubleGateMiddleware)
    .handler(async ({ input, context }) => {
      requireAccount(context);
      const rows = await queryDatabaseRows<ChannelDelegationRow>(
        `update public.channel_delegations
            set status = 'revoked', revoked_at = now()
          where id = $1::uuid and account_id = $2::uuid and revoked_at is null
         returning id, account_id, agent_key, capabilities, resource_scope, status, expires_at, revoked_at`,
        [input.params.id, context.user.id],
      );
      if (!rows[0]) throw SovereignError.notFound('Channel delegation');
      return mapDelegation(rows[0]);
    }),
});
