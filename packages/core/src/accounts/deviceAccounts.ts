import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Session } from '@supabase/supabase-js';
import { deviceTrustAPI } from '../api/deviceTrust';
import { identityAPI } from '../api/identity';
import { accountPin } from '../lib/accountPin';
import { getActiveAccountId, setActiveAccountId } from '../lib/accountScope';
import { supabase } from '../lib/supabase';
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
  fullName: string | null;
  avatarUrl: string | null;
  role: string | null;
  schoolId: string | null;
  isAnonymous: boolean;
  createdAt: string;
  lastUsedAt: string;
}

export interface DeviceAccountProfile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  role: string | null;
  school_id: string | null;
  is_anonymous?: boolean;
}

async function readRegistry() {
  const raw = await AsyncStorage.getItem(ACCOUNTS_REGISTRY_KEY);
  if (!raw) return [] as DeviceAccountRecord[];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as DeviceAccountRecord[]) : [];
  } catch {
    return [];
  }
}

async function writeRegistry(accounts: DeviceAccountRecord[]) {
  await AsyncStorage.setItem(ACCOUNTS_REGISTRY_KEY, JSON.stringify(accounts));
}

async function setActiveAccount(accountId: string | null) {
  setActiveAccountId(accountId);

  if (accountId) {
    await AsyncStorage.setItem(ACTIVE_ACCOUNT_KEY, accountId);
    return;
  }

  await AsyncStorage.removeItem(ACTIVE_ACCOUNT_KEY);
}

function toSessionTokens(session: Session) {
  return {
    access_token: session.access_token,
    refresh_token: session.refresh_token,
  };
}

export const deviceAccounts = {
  async initialize() {
    const storedActive = await AsyncStorage.getItem(ACTIVE_ACCOUNT_KEY);
    setActiveAccountId(storedActive);
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
    const isAnonymous =
      session.user.is_anonymous === true || !session.user.email || profile?.is_anonymous === true;
    if (isAnonymous) {
      return null;
    }

    const accountId = profile?.id ?? (await identityAPI.getMyInternalId());
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
      fullName:
        profile?.full_name ??
        (session.user.user_metadata?.full_name as string | undefined) ??
        existing?.fullName ??
        null,
      avatarUrl: profile?.avatar_url ?? existing?.avatarUrl ?? null,
      role: profile?.role ?? existing?.role ?? null,
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

    try {
      const trust = await deviceTrustAPI.syncCurrentAccountDevice(accountId);
      if (trust && !trust.isTrusted) {
        console.warn(
          'Device trust API marked this install as untrusted. Phase 1 is advisory-only, so access is not hard-blocked yet.',
        );
      }

      await deviceTrustAPI.logAuditEvent(
        'ACCOUNT_CAPTURED_ON_DEVICE',
        {
          authUserId,
          email: nextRecord.email,
        },
        accountId,
      );
    } catch (error) {
      console.warn('Failed to synchronize device trust during account capture.', error);
    }

    return nextRecord;
  },

  async switchTo(accountId: string) {
    const previousAccountId = getActiveAccountId();
    const storedSession = await getStoredSessionForAccount(accountId);
    if (!storedSession?.access_token || !storedSession?.refresh_token) {
      throw new Error('This account is no longer available on this device.');
    }

    await setActiveAccount(accountId);
    identityAPI.clearCache();
    resetScopedStores();
    await rehydrateScopedStores();

    const { error } = await supabase.auth.setSession({
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

    try {
      const trust = await deviceTrustAPI.touchCurrentDevice(accountId);
      if (trust && !trust.isTrusted) {
        console.warn(
          'Device trust API marked this install as untrusted. Phase 1 is advisory-only, so the session remains available.',
        );
      }

      await deviceTrustAPI.logAuditEvent(
        'ACCOUNT_SWITCHED_ON_DEVICE',
        {
          fromAccountId: previousAccountId,
        },
        accountId,
      );
    } catch (error) {
      console.warn('Failed to synchronize device trust during account switch.', error);
    }
  },

  async removeAccount(accountId: string) {
    try {
      await deviceTrustAPI.logAuditEvent('ACCOUNT_REMOVED_FROM_DEVICE', {}, accountId);
    } catch (error) {
      console.warn('Failed to write device audit log for account removal.', error);
    }

    const accounts = await readRegistry();
    const nextAccounts = accounts.filter((entry) => entry.accountId !== accountId);

    await removeStoredSessionForAccount(accountId);
    await accountPin.removePin(accountId);
    await writeRegistry(nextAccounts);

    if (getActiveAccountId() !== accountId) {
      return nextAccounts;
    }

    const fallback = nextAccounts[0]?.accountId ?? null;
    if (fallback) {
      await this.switchTo(fallback);
      return nextAccounts;
    }

    identityAPI.clearCache();
    await setActiveAccount(null);
    resetScopedStores();
    await rehydrateScopedStores();
    await supabase.auth.signOut({ scope: 'local' });
    return nextAccounts;
  },

  async signOutCurrentAccount() {
    const activeAccountId = getActiveAccountId();
    if (!activeAccountId) {
      await supabase.auth.signOut({ scope: 'local' });
      identityAPI.clearCache();
      resetScopedStores();
      await rehydrateScopedStores();
      return [];
    }

    return this.removeAccount(activeAccountId);
  },

  async signOutAllAccounts() {
    const accounts = await readRegistry();
    await Promise.all(
      accounts.map(async (entry) => {
        try {
          await deviceTrustAPI.logAuditEvent(
            'ACCOUNT_SIGNED_OUT_FROM_DEVICE',
            {
              scope: 'all',
            },
            entry.accountId,
          );
        } catch (error) {
          console.warn('Failed to write device audit log during global sign-out.', error);
        }
      }),
    );
    await Promise.all(
      accounts.map((entry) =>
        Promise.all([
          removeStoredSessionForAccount(entry.accountId),
          accountPin.removePin(entry.accountId),
        ]),
      ),
    );
    await writeRegistry([]);
    await AsyncStorage.removeItem(ACTIVE_ACCOUNT_KEY);
    identityAPI.clearCache();
    await setActiveAccount(null);
    resetScopedStores();
    await rehydrateScopedStores();
    await supabase.auth.signOut({ scope: 'local' });
  },
};
