import { accountTransition } from '@repo/core/accounts/accountTransition';
import { authAPI } from '@repo/core/api/auth';
import { deviceTrustAPI } from '@repo/core/api/deviceTrust';
import { assertHighway } from '@repo/core/api/highways';
import { identityAPI } from '@repo/core/api/identity';
import { accountPin } from '@repo/core/lib/accountPin';
import { getActiveAccountId, setActiveAccountId } from '@repo/core/lib/accountScope';
import { useExperienceState } from '@repo/core/lib/experienceState';
import { storage } from '@repo/core/lib/storage';
import {
  clearLegacySupabaseSession,
  getStoredSessionForAccount,
  removeStoredSessionForAccount,
  setStoredSessionForAccount,
} from '@repo/core/lib/supabaseAuthStorage';
import { openReplayAdmission } from '@repo/core/lib/sync/replayAdmission';
import {
  type AccountLifecycleAvailableCapability,
  type AccountLifecycleCommand,
  completeAccountLifecycleCommand,
} from '@repo/core/logic/accountLifecycle';
import { getSessionIdentityMode } from '@repo/core/logic/auth/identityState';
import type { AuthSession } from '@repo/core/logic/ports/auth.port';
import { rehydrateScopedStores, resetScopedStores } from '@repo/core/store/resetScopedStores';
import { APIError } from '@repo/core/types/API';
import { Effect, Queue } from 'effect';

const ACCOUNTS_REGISTRY_KEY = 'gurudevi-device-accounts';
const ACTIVE_ACCOUNT_KEY = 'gurudevi-active-account-id';

export interface DeviceAccountRecord {
  accountId: string;
  authUserId: string;
  email: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  capacity: string | null;
  schoolId: string | null;
  isAnonymous: boolean;
  createdAt: string;
  lastUsedAt: string;
}

export interface DeviceAccountProfile {
  id: string;
  email: string | null;
  display_name: string | null;
  avatar_url: string | null;
  capacity: string | null;
  school_id: string | null;
  is_anonymous?: boolean;
}

async function readRegistry() {
  const raw = storage.getString(ACCOUNTS_REGISTRY_KEY);
  if (!raw) return [] as DeviceAccountRecord[];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as DeviceAccountRecord[]) : [];
  } catch {
    return [];
  }
}

async function writeRegistry(accounts: DeviceAccountRecord[]) {
  storage.set(ACCOUNTS_REGISTRY_KEY, JSON.stringify(accounts));
}

async function setActiveAccount(accountId: string | null) {
  if (accountId) {
    storage.set(ACTIVE_ACCOUNT_KEY, accountId);
  } else {
    storage.delete(ACTIVE_ACCOUNT_KEY);
  }
  setActiveAccountId(accountId);
}

async function assertCurrentCaptureSession(expected: AuthSession): Promise<void> {
  const current = await authAPI.getAuthSession();
  if (current?.access_token !== expected.access_token || current?.user.id !== expected.user.id)
    throw new APIError('The device account capture session changed.', 'AUTH_SESSION_CHANGED');
}

class DeviceAccountError {
  readonly _tag = 'DeviceAccountError';
  constructor(readonly message: string) {}
}

function normalizeDeviceAccountError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error));
}

function toSessionTokens(session: AuthSession) {
  return {
    access_token: session.access_token,
    refresh_token: session.refresh_token,
  };
}

function completeLocalAccountLifecycle<C extends AccountLifecycleCommand>(
  command: C,
  effects: Parameters<typeof completeAccountLifecycleCommand<C>>[2],
) {
  const capability: AccountLifecycleAvailableCapability<C> = {
    command: command.kind,
    availability: 'supported',
  };

  return completeAccountLifecycleCommand(capability, command, effects);
}

/**
 * Lazy singleton for the serial audit queue.
 *
 * v4 note: Effect.runSync at module evaluation time is explicitly warned against
 * in v4's owned-runtime model. Using a lazy initializer defers execution until
 * deviceAccounts.initialize() is called by the app shell — safe in all runtimes.
 */
let _auditQueue: Queue.Queue<() => Promise<unknown>> | null = null;

function getAuditQueue(): Queue.Queue<() => Promise<unknown>> {
  if (!_auditQueue) {
    _auditQueue = Effect.runSync(Queue.unbounded<() => Promise<unknown>>());
    Effect.runFork(
      Queue.take(_auditQueue).pipe(
        Effect.flatMap((task) =>
          Effect.tryPromise({ try: task, catch: normalizeDeviceAccountError }).pipe(
            Effect.catch((e: unknown) =>
              Effect.sync(() => console.warn('[deviceAccounts] Audit op failed', e)),
            ),
          ),
        ),
        Effect.forever,
      ),
    );
  }
  return _auditQueue;
}

function queueAuditOp(fn: () => Promise<unknown>) {
  Effect.runFork(Queue.offer(getAuditQueue(), fn));
}

function queueAccountSignOutAudit(accountId: string): void {
  queueAuditOp(() =>
    deviceTrustAPI.logAuditEvent('ACCOUNT_SIGNED_OUT_FROM_DEVICE', { scope: 'all' }, accountId),
  );
}

const deviceAccountOperations = {
  async initialize() {
    const storedActive = storage.getString(ACTIVE_ACCOUNT_KEY);
    setActiveAccountId(storedActive || null);
    await useExperienceState.persist.rehydrate();
    return storedActive;
  },

  async list() {
    const accounts = await readRegistry();
    return accounts.sort((a, b) => b.lastUsedAt.localeCompare(a.lastUsedAt));
  },

  async getActiveAccountId() {
    return getActiveAccountId();
  },

  async retainRefreshedSession(session: AuthSession | null): Promise<string | null> {
    if (!session || getSessionIdentityMode(session) !== 'authenticated') return null;
    await assertCurrentCaptureSession(session);
    const accountId = getActiveAccountId();
    const accounts = await readRegistry();
    const account = accounts.find(
      (entry) =>
        entry.accountId === accountId && entry.authUserId === session.user.id && !entry.isAnonymous,
    );
    if (!account) return null;
    await assertCurrentCaptureSession(session);
    await setStoredSessionForAccount(account.accountId, toSessionTokens(session));
    await assertCurrentCaptureSession(session);
    return account.accountId;
  },

  async captureCurrentAccount(session: AuthSession | null, profile?: DeviceAccountProfile | null) {
    if (!session?.user) return null;

    const authUserId = session.user.id;
    const identityMode = getSessionIdentityMode(session);
    const isAnonymous = identityMode === 'anonymous' || profile?.is_anonymous === true;
    if (isAnonymous || identityMode === 'sandbox') {
      return null;
    }

    assertHighway('identity_bootstrap', 'direct-api');
    await assertCurrentCaptureSession(session);
    const identity = await identityAPI.identifyActiveCitizen();
    if (!identity || (profile && profile.id !== identity.id))
      throw new APIError(
        'The device account does not match its canonical identity.',
        'AUTH_ACCOUNT_MISMATCH',
      );
    await assertCurrentCaptureSession(session);
    const accountId = identity.id;

    await setStoredSessionForAccount(accountId, toSessionTokens(session));
    await assertCurrentCaptureSession(session);
    await clearLegacySupabaseSession();

    const now = new Date().toISOString();
    const accounts = await readRegistry();
    await assertCurrentCaptureSession(session);
    const existing = accounts.find((entry) => entry.accountId === accountId);

    const nextRecord: DeviceAccountRecord = {
      accountId,
      authUserId,
      email: profile?.email ?? session.user.email ?? existing?.email ?? null,
      displayName:
        profile?.display_name ??
        (session.user.user_metadata?.display_name as string | undefined) ??
        existing?.displayName ??
        null,
      avatarUrl: profile?.avatar_url ?? existing?.avatarUrl ?? null,
      capacity: profile?.capacity ?? existing?.capacity ?? null,
      schoolId: profile?.school_id ?? existing?.schoolId ?? null,
      isAnonymous: false,
      createdAt: existing?.createdAt ?? now,
      lastUsedAt: now,
    };

    const nextAccounts = accounts
      .filter((entry) => entry.accountId !== accountId)
      .concat(nextRecord);

    await writeRegistry(nextAccounts);
    await assertCurrentCaptureSession(session);
    await setActiveAccount(accountId);

    void Promise.resolve(deviceTrustAPI.syncCurrentAccountDevice(accountId)).then((trust) => {
      if (trust && !trust.isTrusted) {
        console.warn('[deviceAccounts] Device trust API marked this install as untrusted');
      }
    });

    queueAuditOp(() =>
      deviceTrustAPI.logAuditEvent(
        'ACCOUNT_CAPTURED_ON_DEVICE',
        { authUserId, email: nextRecord.email },
        accountId,
      ),
    );
    queueAuditOp(() =>
      deviceTrustAPI.upsertCurrentSecuritySession({
        accountId,
        authUserId,
        authStrength: 'session',
      }),
    );

    return nextRecord;
  },

  async switchTo(accountId: string) {
    const previousAccountId = getActiveAccountId();
    const storedSession = await getStoredSessionForAccount(accountId);
    if (!storedSession?.access_token || !storedSession?.refresh_token) {
      throw new DeviceAccountError('This account is no longer available on this device.');
    }

    await accountTransition.transition({
      outgoingPrincipalId: previousAccountId,
      incomingPrincipalId: accountId,
      disposition: 'preserve-and-quarantine',
      clearReplicatedData: false,
    });

    try {
      await setActiveAccount(accountId);
      resetScopedStores();
      await rehydrateScopedStores();
      await authAPI.setSession(storedSession.access_token, storedSession.refresh_token);
      const [accounts, session] = await Promise.all([readRegistry(), authAPI.getAuthSession()]);
      const target = accounts.find((entry) => entry.accountId === accountId);
      if (
        getActiveAccountId() === accountId &&
        target?.authUserId &&
        session?.user.id === target.authUserId
      ) {
        openReplayAdmission(accountId);
      }
    } catch (error) {
      // Treat account switching as a transaction. If the cached session is no
      // longer usable offline, restore the previous active account and leave
      // both account-scoped local databases untouched.
      await setActiveAccount(previousAccountId);
      resetScopedStores();
      await rehydrateScopedStores();
      if (previousAccountId) {
        const [accounts, session] = await Promise.all([readRegistry(), authAPI.getAuthSession()]);
        const previous = accounts.find((entry) => entry.accountId === previousAccountId);
        if (
          getActiveAccountId() === previousAccountId &&
          previous?.authUserId &&
          session?.user.id === previous.authUserId
        ) {
          openReplayAdmission(previousAccountId);
        }
      }
      throw error;
    }

    const accounts = await readRegistry();
    await writeRegistry(
      accounts.map((entry) =>
        entry.accountId === accountId ? { ...entry, lastUsedAt: new Date().toISOString() } : entry,
      ),
    );

    void Promise.resolve(deviceTrustAPI.touchCurrentDevice(accountId)).then((trust) => {
      if (trust && !trust.isTrusted) {
        console.warn('[deviceAccounts] Device trust API marked this install as untrusted');
      }
    });

    queueAuditOp(() =>
      deviceTrustAPI.logAuditEvent(
        'ACCOUNT_SWITCHED_ON_DEVICE',
        { fromAccountId: previousAccountId },
        accountId,
      ),
    );
    queueAuditOp(() =>
      deviceTrustAPI.upsertCurrentSecuritySession({
        accountId,
        authUserId: null,
        authStrength: 'switch',
      }),
    );
  },

  async removeAccount(accountId: string) {
    const isActiveAccount = getActiveAccountId() === accountId;
    if (isActiveAccount) {
      void deviceTrustAPI.getInstallId().then((installId) => {
        if (installId) {
          queueAuditOp(() =>
            Promise.all([
              deviceTrustAPI.logAuditEvent('ACCOUNT_REMOVED_FROM_DEVICE', { installId }, accountId),
              deviceTrustAPI.revokeMyInstallSecuritySessions(installId, 'removed_from_device'),
            ]),
          );
        }
      });
    }

    const accounts = await readRegistry();
    const nextAccounts = accounts.filter((entry) => entry.accountId !== accountId);
    const fallback = nextAccounts[0]?.accountId ?? null;

    if (isActiveAccount) {
      await accountTransition.transition({
        outgoingPrincipalId: accountId,
        incomingPrincipalId: fallback,
        disposition: 'discard',
        clearReplicatedData: true,
      });
    }

    await Promise.all([removeStoredSessionForAccount(accountId), accountPin.removePin(accountId)]);
    await writeRegistry(nextAccounts);

    if (!isActiveAccount) {
      return completeLocalAccountLifecycle({ kind: 'remove-remembered-account', accountId }, [
        { kind: 'remove-remembered-account', accountId },
      ]);
    }

    if (fallback) {
      await setActiveAccount(null);
      await this.switchTo(fallback);
      return completeLocalAccountLifecycle({ kind: 'remove-remembered-account', accountId }, [
        { kind: 'remove-remembered-account', accountId },
      ]);
    }

    await setActiveAccount(null);
    resetScopedStores();
    await rehydrateScopedStores();
    await authAPI.signOut({ scope: 'local' });
    return completeLocalAccountLifecycle({ kind: 'remove-remembered-account', accountId }, [
      { kind: 'remove-remembered-account', accountId },
    ]);
  },

  async signOutCurrentAccount() {
    const activeAccountId = getActiveAccountId();
    if (!activeAccountId) {
      await authAPI.signOut({ scope: 'local' });
      resetScopedStores();
      await rehydrateScopedStores();
      return completeLocalAccountLifecycle({ kind: 'sign-out-current-device' }, [
        { kind: 'clear-current-session' },
      ]);
    }

    const installId = await deviceTrustAPI.getInstallId();
    if (installId) {
      try {
        await deviceTrustAPI.revokeMyInstallSecuritySessions(installId, 'signed_out_locally');
      } catch (error) {
        console.warn('[deviceAccounts] Current security-session revocation failed', error);
      }
      queueAuditOp(() =>
        deviceTrustAPI.logAuditEvent(
          'ACCOUNT_SIGNED_OUT_FROM_DEVICE',
          { scope: 'current', installId },
          activeAccountId,
        ),
      );
    }

    await this.removeAccount(activeAccountId);
    return completeLocalAccountLifecycle({ kind: 'sign-out-current-device' }, [
      { kind: 'clear-current-session' },
    ]);
  },

  async signOutAllAccounts() {
    const [accounts, installId] = await Promise.all([
      readRegistry(),
      deviceTrustAPI.getInstallId(),
    ]);
    const activeAccountId = getActiveAccountId();
    for (const entry of accounts) {
      await accountTransition.transition({
        outgoingPrincipalId: entry.accountId,
        incomingPrincipalId: null,
        disposition: 'discard',
        clearReplicatedData: entry.accountId === activeAccountId,
      });
    }
    for (const entry of accounts) {
      queueAccountSignOutAudit(entry.accountId);
    }
    if (installId) {
      queueAuditOp(() =>
        deviceTrustAPI.revokeMyInstallSecuritySessions(installId, 'signed_out_all_locally'),
      );
    }
    await Promise.all(
      accounts.map((entry) =>
        Promise.all([
          removeStoredSessionForAccount(entry.accountId),
          accountPin.removePin(entry.accountId),
        ]),
      ),
    );
    await writeRegistry([]);
    storage.delete(ACTIVE_ACCOUNT_KEY);
    await setActiveAccount(null);
    resetScopedStores();
    await rehydrateScopedStores();
    await authAPI.signOut({ scope: 'local' });
    return completeLocalAccountLifecycle({ kind: 'sign-out-all-local-accounts' }, [
      { kind: 'clear-all-remembered-accounts' },
    ]);
  },
};

let deviceAccountMutation: Promise<void> = Promise.resolve();

function mutateDeviceAccounts<T>(operation: () => Promise<T>): Promise<T> {
  const result = deviceAccountMutation.then(operation, operation);
  deviceAccountMutation = result.then(
    () => undefined,
    () => undefined,
  );
  return result;
}

export const deviceAccounts = {
  initialize: () => mutateDeviceAccounts(() => deviceAccountOperations.initialize()),
  list: () => mutateDeviceAccounts(() => deviceAccountOperations.list()),
  getActiveAccountId: () =>
    mutateDeviceAccounts(() => deviceAccountOperations.getActiveAccountId()),
  retainRefreshedSession: (session: AuthSession | null) =>
    mutateDeviceAccounts(() => deviceAccountOperations.retainRefreshedSession(session)),
  captureCurrentAccount: (session: AuthSession | null, profile?: DeviceAccountProfile | null) =>
    mutateDeviceAccounts(() => deviceAccountOperations.captureCurrentAccount(session, profile)),
  switchTo: (accountId: string) =>
    mutateDeviceAccounts(() => deviceAccountOperations.switchTo(accountId)),
  removeAccount: (accountId: string) =>
    mutateDeviceAccounts(() => deviceAccountOperations.removeAccount(accountId)),
  signOutCurrentAccount: () =>
    mutateDeviceAccounts(() => deviceAccountOperations.signOutCurrentAccount()),
  signOutAllAccounts: () =>
    mutateDeviceAccounts(() => deviceAccountOperations.signOutAllAccounts()),
};

/** Synchronous binding lookup avoids waiting behind an in-progress account transition. */
export function getRememberedAccountAuthSubject(accountId: string): string | null {
  const raw = storage.getString(ACCOUNTS_REGISTRY_KEY);
  if (!raw) return null;

  try {
    const accounts: unknown = JSON.parse(raw);
    if (!Array.isArray(accounts)) return null;
    const account = accounts.find(
      (entry): entry is DeviceAccountRecord =>
        typeof entry === 'object' &&
        entry !== null &&
        'accountId' in entry &&
        entry.accountId === accountId &&
        'authUserId' in entry &&
        typeof entry.authUserId === 'string',
    );
    return account?.authUserId ?? null;
  } catch {
    return null;
  }
}
