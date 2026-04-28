import { cryptoManager } from '../logic/managers/CryptoManager';
import { getActiveAccountId, scopeStorageKey } from './accountScope';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;

function getProjectRef() {
  if (!supabaseUrl) return 'default';

  try {
    const hostname = new URL(supabaseUrl).hostname;
    return hostname.split('.')[0] || 'default';
  } catch {
    return 'default';
  }
}

const AUTH_TOKEN_STORAGE_KEY = `sb-${getProjectRef()}-auth-token`;

async function readStorage(key: string): Promise<string | null> {
  return cryptoManager.getItemAsync(key);
}

async function writeStorage(key: string, value: string): Promise<void> {
  await cryptoManager.setItemAsync(key, value);
}

async function deleteStorage(key: string): Promise<void> {
  await cryptoManager.deleteItemAsync(key);
}

function getScopedAuthStorageKey(accountId: string | null, key: string) {
  return scopeStorageKey(`auth:${key}`, accountId);
}

function normalizeStoredSession(parsed: unknown) {
  if (!parsed || typeof parsed !== 'object') return null;

  const direct = parsed as { access_token?: string; refresh_token?: string };
  if (direct.access_token && direct.refresh_token) {
    return direct;
  }

  const nested = parsed as { currentSession?: { access_token?: string; refresh_token?: string } };
  if (nested.currentSession?.access_token && nested.currentSession?.refresh_token) {
    return nested.currentSession;
  }

  return null;
}

export const supabaseAuthStorage = {
  async getItem(key: string) {
    const scopedKey = getScopedAuthStorageKey(getActiveAccountId(), key);
    const scopedValue = await readStorage(scopedKey);
    if (scopedValue != null) {
      return scopedValue;
    }

    return readStorage(key);
  },

  async setItem(key: string, value: string) {
    const scopedKey = getScopedAuthStorageKey(getActiveAccountId(), key);
    await writeStorage(scopedKey, value);
  },

  async removeItem(key: string) {
    const scopedKey = getScopedAuthStorageKey(getActiveAccountId(), key);
    await deleteStorage(scopedKey);
    await deleteStorage(key);
  },
};

export async function getStoredSessionForAccount(accountId: string | null) {
  const raw = await readStorage(getScopedAuthStorageKey(accountId, AUTH_TOKEN_STORAGE_KEY));
  if (!raw) return null;

  try {
    return normalizeStoredSession(JSON.parse(raw));
  } catch {
    return null;
  }
}

export async function setStoredSessionForAccount(
  accountId: string | null,
  session: { access_token: string; refresh_token: string },
) {
  await writeStorage(
    getScopedAuthStorageKey(accountId, AUTH_TOKEN_STORAGE_KEY),
    JSON.stringify(session),
  );
}

export async function removeStoredSessionForAccount(accountId: string | null) {
  await deleteStorage(getScopedAuthStorageKey(accountId, AUTH_TOKEN_STORAGE_KEY));
}

export async function clearLegacySupabaseSession() {
  await deleteStorage(AUTH_TOKEN_STORAGE_KEY);
}
