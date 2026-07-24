import type { Session } from '@supabase/supabase-js';
import { Effect, Queue } from 'effect';
import { deviceTrustAPI } from '../api/deviceTrust';
import { assertHighway } from '../api/highways';
import { identityAPI } from '../api/identity';
import { __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__ } from '../api/supabase';
import { getSessionIdentityMode } from '../logic/auth/identityState';
import { accountPin } from '../lib/accountPin';
import { getActiveAccountId, setActiveAccountId } from '../lib/accountScope';
import { storage } from '../lib/storage';
import {
  clearLegacySupabaseSession,
  getStoredSessionForAccount,
  removeStoredSessionForAccount,
  setStoredSessionForAccount,
} from '../lib/supabaseAuthStorage';
import { rehydrateScopedStores, resetScopedStores } from '../store/resetScopedStores';

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
  setActiveAccountId(accountId);

  if (accountId) {
    storage.set(ACTIVE_ACCOUNT_KEY, accountId);
    return;
  }

  storage.delete(ACTIVE_ACCOUNT_KEY);
}

class DeviceAccountError {
  readonly _tag = 'DeviceAccountError';
  constructor(readonly message: string) {}
}

function toSessionTokens(session: Session) {
  return {
    access_token: session.access_token,
    refresh_token: session.refresh_token,
  };
}

/**
 * Serial queue for fire-and-forget audit/security operations.
 * Prevents thundering herd on deviceTrustAPI when multiple account
 * actions fire audit ops concurrently.
 */
const auditQueue = Effect.runSync(Queue.unbounded<() => Promise<unknown>>());

Effect.runFork(
  Queue.take(auditQueue).pipe(
    Effect.flatMap((task) =>
      Effect.promise(task).pipe(
        Effect.catchAll((e) =>
          Effect.sync(() => console.warn('[deviceAccounts] Audit op failed', e)),
        ),
      ),
    ),
    Effect.forever,
  ),
);

function queueAuditOp(fn: () => Promise<unknown>) {
  Effect.runFork(Queue.offer(auditQueue, fn));
}

export const deviceAccounts = {
  async initialize() {
    const storedActive = storage.getString(ACTIVE_ACCOUNT_KEY);
    setActiveAccountId(storedActive || null);
    return storedActive;
  },

  async list() {
    const accounts = await readRegistry();
    return accounts.sort((a, b) => b.lastUsedAt.localeCompare(a.lastUsedAt));
  },

  async getActiveAccountId() {
    return getActiveAccountId();
  },

  async captureCurrentAccount(session: Session | null, profile?: DeviceAccountProfile | null) {
    if (!session?.user) return null;

    const authUserId = session.user.id;
    const identityMode = getSessionIdentityMode(session);
    const isAnonymous = identityMode === 'guest' || profile?.is_anonymous === true;
    if (isAnonymous || identityMode === 'sandbox') {
      return null;
    }

    assertHighway('identity_bootstrap', 'direct-api');
    const identity = profile?.id ? null : await identityAPI.identifyActiveCitizen();
    const accountId = profile?.id ?? identity?.id;

    if (!accountId) return null;

    await setStoredSessionForAccount(accountId, toSessionTokens(session));
    await clearLegacySupabaseSession();

    const now = new Date().toISOString();
    const accounts = await readRegistry();
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
    await setActiveAccount(accountId);

    deviceTrustAPI.syncCurrentAccountDevice(accountId).then((trust) => {
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

    await setActiveAccount(accountId);
    resetScopedStores();
    await rehydrateScopedStores();

    const { error } = await __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__.auth.setSession({
      access_token: storedSession.access_token,
      refresh_token: storedSession.refresh_token,
    });

    if (error) {
      throw error;
    }

    const accounts = await readRegistry();
    await writeRegistry(
      accounts.map((entry) =>
        entry.accountId === accountId ? { ...entry, lastUsedAt: new Date().toISOString() } : entry,
      ),
    );

    deviceTrustAPI.touchCurrentDevice(accountId).then((trust) => {
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
      deviceTrustAPI.getInstallId().then((installId) => {
        if (installId) {
          queueAuditOp(() =>
            Promise.all([
              deviceTrustAPI.logAuditEvent(
                'ACCOUNT_REMOVED_FROM_DEVICE',
                { installId },
                accountId,
              ),
              deviceTrustAPI.revokeMyInstallSecuritySessions(installId, 'removed_from_device'),
            ]),
          );
        }
      });
    }

    const accounts = await readRegistry();
    const nextAccounts = accounts.filter((entry) => entry.accountId !== accountId);

    await Promise.all([removeStoredSessionForAccount(accountId), accountPin.removePin(accountId)]);
    await writeRegistry(nextAccounts);

    if (!isActiveAccount) {
      return nextAccounts;
    }

    const fallback = nextAccounts[0]?.accountId ?? null;
    if (fallback) {
      await this.switchTo(fallback);
      return nextAccounts;
    }

    await setActiveAccount(null);
    resetScopedStores();
    await rehydrateScopedStores();
    await __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__.auth.signOut({ scope: 'local' });
    return nextAccounts;
  },

  async signOutCurrentAccount() {
    const activeAccountId = getActiveAccountId();
    if (!activeAccountId) {
      await __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__.auth.signOut({ scope: 'local' });
      resetScopedStores();
      await rehydrateScopedStores();
      return [];
    }

    deviceTrustAPI.getInstallId().then((installId) => {
      if (installId) {
        queueAuditOp(() =>
          Promise.all([
            deviceTrustAPI.logAuditEvent(
              'ACCOUNT_SIGNED_OUT_FROM_DEVICE',
              { scope: 'current', installId },
              activeAccountId,
            ),
            deviceTrustAPI.revokeMyInstallSecuritySessions(installId, 'signed_out_locally'),
          ]),
        );
      }
    });

    return this.removeAccount(activeAccountId);
  },

  async signOutAllAccounts() {
    const [accounts, installId] = await Promise.all([
      readRegistry(),
      deviceTrustAPI.getInstallId(),
    ]);
    const activeAccountId = getActiveAccountId();
    for (const entry of accounts) {
      if (!activeAccountId || entry.accountId !== activeAccountId) {
        continue;
      }
      queueAuditOp(() =>
        Promise.all([
          deviceTrustAPI.logAuditEvent(
            'ACCOUNT_SIGNED_OUT_FROM_DEVICE',
            { scope: 'all', installId },
            entry.accountId,
          ),
          deviceTrustAPI.revokeMyInstallSecuritySessions(installId, 'signed_out_all_locally'),
        ]),
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
    await __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__.auth.signOut({ scope: 'local' });
  },
};
