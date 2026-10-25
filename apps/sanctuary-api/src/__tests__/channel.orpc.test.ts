import './setup';
import { beforeEach, describe, expect, it } from 'vitest';
import { createTestORPCClient } from './orpc-client';
import {
  getMockLastDatabaseQueryArgs,
  setMockActiveBond,
  setMockQueryRowsQueue,
  setMockZenStackDbAvailable,
} from './setup';

const accountId = '123e4567-e89b-8101-8000-426614174000';
const identityId = '123e4567-e89b-12d3-a456-426614174001';
const headers = { Authorization: `Bearer ${accountId}` };
const row = {
  id: identityId,
  account_id: accountId,
  provider: 'whatsapp',
  state: 'linked',
  confirmed_at: new Date('2026-10-15T00:00:00.000Z'),
  revoked_at: null,
};
const consentRow = {
  id: '123e4567-e89b-8101-8000-426614174002',
  account_id: accountId,
  channel_identity_id: identityId,
  purpose: 'operational_updates',
  capabilities: ['channel.delivery'],
  resource_scope: { schoolId: '123e4567-e89b-12d3-a456-426614174003' },
  status: 'active',
  expires_at: null,
  revoked_at: null,
};
const delegationRow = {
  id: '123e4567-e89b-12d3-a456-426614174004',
  account_id: accountId,
  agent_key: 'sanctuary-assistant',
  capabilities: ['attendance.draft'],
  resource_scope: {},
  status: 'active',
  expires_at: null,
  revoked_at: null,
};

describe('channel identity lifecycle (authentication/database substituted)', () => {
  beforeEach(() => {
    setMockZenStackDbAvailable(true);
    setMockQueryRowsQueue([]);
    setMockActiveBond({
      id: 'bond-channel',
      user_id: accountId,
      entity_id: 'school-123',
      entity_type: 'SCHOOL',
      capacity: 'teacher',
      status: 'active',
    });
  });

  it('lists only identities selected by the authenticated account predicate', async () => {
    setMockQueryRowsQueue([[row]]);

    await expect(createTestORPCClient(headers).channel.listMyIdentities()).resolves.toEqual([
      {
        id: identityId,
        accountId,
        provider: 'whatsapp',
        state: 'linked',
        confirmedAt: '2026-10-15T00:00:00.000Z',
        revokedAt: null,
      },
    ]);
    expect(getMockLastDatabaseQueryArgs()).toEqual([expect.any(String), [accountId]]);
    expect(getMockLastDatabaseQueryArgs()?.[0]).toContain('where account_id = $1::uuid');
  });

  it('stores only a hash for a short-lived account-link ceremony', async () => {
    setMockQueryRowsQueue([
      [
        {
          id: identityId,
          provider: 'telegram',
          expires_at: new Date('2026-10-15T00:10:00.000Z'),
        },
      ],
    ]);

    const result = await createTestORPCClient(headers).channel.beginLink({
      params: { provider: 'telegram' },
    });

    expect(result).toMatchObject({ id: identityId, provider: 'telegram' });
    expect(result.linkToken).toMatch(/^[A-Za-z0-9_-]{32,128}$/);
    expect(getMockLastDatabaseQueryArgs()).toEqual([
      expect.any(String),
      [expect.any(String), accountId, 'telegram', expect.any(String), expect.any(Date)],
    ]);
    const parameters = getMockLastDatabaseQueryArgs()?.[1];
    expect(parameters?.[3]).toMatch(/^[a-f0-9]{64}$/);
    expect(parameters?.[3]).not.toBe(result.linkToken);
  });

  it('revokes only the caller-owned active identity', async () => {
    setMockQueryRowsQueue([[{ ...row, state: 'revoked', revoked_at: row.confirmed_at }]]);

    await expect(
      createTestORPCClient(headers).channel.revokeIdentity({ params: { id: identityId } }),
    ).resolves.toMatchObject({ id: identityId, state: 'revoked' });
    expect(getMockLastDatabaseQueryArgs()).toEqual([expect.any(String), [identityId, accountId]]);
    expect(getMockLastDatabaseQueryArgs()?.[0]).toContain('account_id = $2::uuid');
  });

  it('grants scoped consent only through the caller-owned linked identity predicate', async () => {
    setMockQueryRowsQueue([[consentRow]]);

    await expect(
      createTestORPCClient(headers).channel.grantConsent({
        params: { id: identityId },
        body: {
          purpose: consentRow.purpose,
          capabilities: consentRow.capabilities,
          resourceScope: consentRow.resource_scope,
          expiresAt: null,
        },
      }),
    ).resolves.toMatchObject({ id: consentRow.id, resourceScope: consentRow.resource_scope });
    expect(getMockLastDatabaseQueryArgs()?.[0]).toContain("identity.state = 'linked'");
    expect(getMockLastDatabaseQueryArgs()?.[1]).toEqual(
      expect.arrayContaining([identityId, accountId]),
    );
  });

  it('does not grant consent when the identity is not owned and linked by the caller', async () => {
    setMockQueryRowsQueue([[]]);

    await expect(
      createTestORPCClient(headers).channel.grantConsent({
        params: { id: identityId },
        body: {
          purpose: consentRow.purpose,
          capabilities: consentRow.capabilities,
          resourceScope: {},
          expiresAt: null,
        },
      }),
    ).rejects.toMatchObject({ status: 404 });
  });

  it('rejects already-expired authority before a database query', async () => {
    await expect(
      createTestORPCClient(headers).channel.grantDelegation({
        body: {
          agentKey: delegationRow.agent_key,
          capabilities: delegationRow.capabilities,
          resourceScope: delegationRow.resource_scope,
          expiresAt: '2026-10-14T00:00:00.000Z',
        },
      }),
    ).rejects.toMatchObject({ status: 400 });
    expect(getMockLastDatabaseQueryArgs()).toBeNull();
  });

  it('grants and revokes a caller-owned delegation without accepting a provider identity', async () => {
    setMockQueryRowsQueue([[delegationRow]]);
    await expect(
      createTestORPCClient(headers).channel.grantDelegation({
        body: {
          agentKey: delegationRow.agent_key,
          capabilities: delegationRow.capabilities,
          resourceScope: delegationRow.resource_scope,
          expiresAt: null,
        },
      }),
    ).resolves.toMatchObject({ id: delegationRow.id, agentKey: delegationRow.agent_key });
    expect(getMockLastDatabaseQueryArgs()?.[1]).toEqual(
      expect.arrayContaining([accountId, delegationRow.agent_key]),
    );

    setMockQueryRowsQueue([
      [{ ...delegationRow, status: 'revoked', revoked_at: row.confirmed_at }],
    ]);
    await expect(
      createTestORPCClient(headers).channel.revokeDelegation({ params: { id: delegationRow.id } }),
    ).resolves.toMatchObject({ id: delegationRow.id, status: 'revoked' });
    expect(getMockLastDatabaseQueryArgs()?.[0]).toContain('account_id = $2::uuid');
  });

  it('rejects anonymous channel lifecycle requests before a database query', async () => {
    await expect(createTestORPCClient().channel.listMyIdentities()).rejects.toMatchObject({
      status: 403,
    });
    expect(getMockLastDatabaseQueryArgs()).toBeNull();
  });
});
