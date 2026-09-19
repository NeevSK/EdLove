import { describe, expect, it } from 'vitest';
import {
  createPersistenceIdentity,
  derivePersistenceKey,
  derivePersistenceNamespace,
  requestGuestToAccountMigration,
  resolvePersistenceWriteDecision,
} from './persistenceBoundary';

const account = createPersistenceIdentity({
  experience: 'standard',
  principal: { kind: 'account', id: 'account-17' },
});

describe('persistence identity namespaces', () => {
  it('keeps account, guest, and Explore keys distinct', () => {
    const guest = createPersistenceIdentity({
      experience: 'standard',
      principal: { kind: 'guest', id: 'guest-17' },
    });
    const explore = createPersistenceIdentity({
      experience: 'explore',
      principal: { kind: 'account', id: 'account-17' },
    });

    expect(derivePersistenceNamespace(account)).toBe(
      'gurudevi:v1:persistence:standard:account:account-17',
    );
    expect(derivePersistenceNamespace(guest)).not.toBe(derivePersistenceNamespace(account));
    expect(derivePersistenceNamespace(explore)).not.toBe(derivePersistenceNamespace(account));
  });

  it('encodes dynamic segments before deriving a feature key', () => {
    const identity = createPersistenceIdentity({
      experience: 'standard',
      principal: { kind: 'guest', id: ' guest:one ' },
    });

    expect(derivePersistenceKey(identity, 'journal:entry')).toBe(
      'gurudevi:v1:persistence:standard:guest:guest%3Aone:journal%3Aentry',
    );
  });

  it('rejects an empty principal or feature-key segment', () => {
    expect(() =>
      createPersistenceIdentity({
        experience: 'standard',
        principal: { kind: 'account', id: '  ' },
      }),
    ).toThrow('Persistence account id must not be empty.');
    expect(() => derivePersistenceKey(account, '  ')).toThrow('Persistence key must not be empty.');
  });
});

describe('persistence write boundary', () => {
  it('permits production writes only for a standard account', () => {
    expect(resolvePersistenceWriteDecision(account, 'production')).toEqual({
      allowed: true,
      target: 'production',
    });
  });

  it.each([
    [
      'guest',
      createPersistenceIdentity({
        experience: 'standard',
        principal: { kind: 'guest', id: 'g-1' },
      }),
      'guest-local-only',
    ],
    [
      'Explore',
      createPersistenceIdentity({
        experience: 'explore',
        principal: { kind: 'account', id: 'a-1' },
      }),
      'explore-local-only',
    ],
    [
      'sandbox',
      createPersistenceIdentity({
        experience: 'sandbox',
        principal: { kind: 'account', id: 'a-1' },
      }),
      'sandbox-local-only',
    ],
    [
      'demo',
      createPersistenceIdentity({ experience: 'demo', principal: { kind: 'account', id: 'a-1' } }),
      'demo-local-only',
    ],
  ] as const)(
    'blocks %s production writes while retaining local writes',
    (_label, identity, reason) => {
      expect(resolvePersistenceWriteDecision(identity, 'production')).toEqual({
        allowed: false,
        target: 'production',
        reason,
      });
      expect(resolvePersistenceWriteDecision(identity, 'local')).toEqual({
        allowed: true,
        target: 'local',
      });
    },
  );
});

describe('guest-to-account migration intent', () => {
  it('creates an explicit confirmed intent without transferring any data', () => {
    const guest = createPersistenceIdentity({
      experience: 'standard',
      principal: { kind: 'guest', id: 'guest-17' },
    });

    expect(requestGuestToAccountMigration(guest, account, 'user-confirmed')).toEqual({
      authorization: 'user-confirmed',
      source: guest,
      target: account,
    });
  });

  it('rejects an implicit or invalid migration direction', () => {
    const guest = createPersistenceIdentity({
      experience: 'standard',
      principal: { kind: 'guest', id: 'guest-17' },
    });

    expect(() => requestGuestToAccountMigration(account, account, 'user-confirmed')).toThrow(
      'Guest-to-account migration must start from a guest identity.',
    );
    expect(() => requestGuestToAccountMigration(guest, guest, 'user-confirmed')).toThrow(
      'Guest-to-account migration must target an account identity.',
    );
  });
});
