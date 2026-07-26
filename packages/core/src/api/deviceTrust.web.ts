import { APIError } from '@/types/API';
import { identityAPI } from '@/api/identity';

const DEVICE_INSTALL_ID_KEY = 'gurudevi-web-device-install-id';

function getStorage() {
  return globalThis.localStorage ?? null;
}

function getScopedKey(accountId: string | null | undefined, suffix: string) {
  return `${accountId ?? 'anonymous'}:${suffix}`;
}

function safeRead(key: string): string | null {
  const storage = getStorage();
  if (!storage) return null;

  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
}

function safeWrite(key: string, value: string): void {
  const storage = getStorage();
  if (!storage) return;

  try {
    storage.setItem(key, value);
  } catch {
    // Best effort only on web. Browser storage can be unavailable in privacy modes.
  }
}

function safeRemove(key: string): void {
  const storage = getStorage();
  if (!storage) return;

  try {
    storage.removeItem(key);
  } catch {
    // Best effort only.
  }
}

function randomId() {
  return globalThis.crypto?.randomUUID?.() ?? `web_${Math.random().toString(36).slice(2, 10)}`;
}

async function getAccountId(accountId?: string) {
  if (accountId) return accountId;
  const identity = await identityAPI.identifyActiveCitizen();
  if (!identity) {
    throw new APIError('No authenticated account is available for device trust operations.');
  }

  return identity.id;
}

export const deviceTrustAPI = {
  async getInstallId() {
    const existing = safeRead(DEVICE_INSTALL_ID_KEY);
    if (existing) return existing;

    const next = randomId();
    safeWrite(DEVICE_INSTALL_ID_KEY, next);
    return next;
  },

  async getServerDeviceId() {
    return safeRead('gurudevi-web-server-device-id');
  },

  async ensureDeviceRegistered() {
    const installId = await this.getInstallId();
    const summary = {
      deviceId: `web-device:${installId}`,
      installId,
      isTrusted: true,
      trustStatus: 'standard' as const,
      modelName: globalThis.navigator?.userAgent ?? 'web',
      osVersion: globalThis.navigator?.platform ?? null,
      platform: 'web',
      lastSeenAt: new Date().toISOString(),
      lastAccessedAt: new Date().toISOString(),
      linkedAccountId: null,
    };

    safeWrite('gurudevi-web-server-device-id', summary.deviceId);
    return summary;
  },

  async linkCurrentAccountToDevice(accountId?: string) {
    const resolvedAccountId = await getAccountId(accountId);
    const device = await this.ensureDeviceRegistered();
    safeWrite(getScopedKey(resolvedAccountId, 'device-id'), device.deviceId);
    safeWrite(getScopedKey(resolvedAccountId, 'install-id'), device.installId);
    return device;
  },

  async touchCurrentDevice(accountId?: string) {
    const resolvedAccountId = await getAccountId(accountId);
    const deviceId = safeRead(getScopedKey(resolvedAccountId, 'device-id'));
    const installId =
      safeRead(getScopedKey(resolvedAccountId, 'install-id')) ?? (await this.getInstallId());

    return {
      deviceId: deviceId ?? `web-device:${installId}`,
      installId,
      isTrusted: true,
      trustStatus: 'standard' as const,
      modelName: globalThis.navigator?.userAgent ?? 'web',
      osVersion: globalThis.navigator?.platform ?? null,
      platform: 'web',
      lastSeenAt: new Date().toISOString(),
      lastAccessedAt: new Date().toISOString(),
      linkedAccountId: resolvedAccountId,
    };
  },

  async syncCurrentAccountDevice(accountId?: string) {
    await this.linkCurrentAccountToDevice(accountId);
    return this.touchCurrentDevice(accountId);
  },

  async upsertCurrentSecuritySession(options?: {
    accountId?: string;
    authUserId?: string | null;
    authStrength?: string;
  }) {
    const accountId = await getAccountId(options?.accountId);
    const installId = await this.getInstallId();
    const sessionId = safeRead(getScopedKey(accountId, 'security-session')) ?? randomId();
    const payload = {
      sessionId,
      accountId,
      deviceId: `web-device:${installId}`,
      installId,
      authUserId: options?.authUserId ?? null,
      platform: 'web',
      modelName: globalThis.navigator?.userAgent ?? 'web',
      osVersion: globalThis.navigator?.platform ?? null,
      status: 'active' as const,
      authStrength: options?.authStrength ?? 'browser-session',
      trustStatus: 'standard' as const,
      startedAt: new Date().toISOString(),
      lastSeenAt: new Date().toISOString(),
      revokedAt: null,
      revokeReason: null,
    };

    safeWrite(getScopedKey(accountId, 'security-session'), sessionId);
    return payload;
  },

  async getCurrentDeviceTrust() {
    return this.ensureDeviceRegistered();
  },

  async isCurrentDeviceTrusted() {
    return true;
  },

  async getSecuritySummary() {
    const identity = await identityAPI.identifyActiveCitizen();
    if (!identity) {
      return {
        devices: [],
        events: [],
        authEvents: [],
        sessions: [],
        currentDevice: null,
      };
    }

    const currentDevice = await this.touchCurrentDevice(identity.id);
    return {
      devices: [currentDevice],
      events: [],
      authEvents: [],
      sessions: [],
      currentDevice,
    };
  },

  async revokeSession(sessionId: string) {
    safeRemove(`gurudevi-web-session:${sessionId}`);
  },

  async unlinkDevice(deviceId: string) {
    safeRemove(`gurudevi-web-device:${deviceId}`);
  },

  async revokeAllSessions() {
    // Web sessions are browser-scoped and cleared on sign-out / storage reset.
  },

  async trustDevice(_deviceId: string) {
    // Browser trust is derived from the authenticated session plus origin-bound storage.
  },

  async logAuditEvent(action: string, metadata: Record<string, unknown>, accountId?: string) {
    return {
      id: randomId(),
      action,
      metadata,
      createdAt: new Date().toISOString(),
      accountId: accountId ?? null,
      device: await this.ensureDeviceRegistered(),
    };
  },

  async performLogAuditEventIntent(vars: Record<string, unknown>) {
    return this.logAuditEvent('LOG_AUDIT_EVENT', vars);
  },

  async performUnlinkMyDeviceIntent(vars: Record<string, unknown>) {
    return this.unlinkDevice(String(vars.deviceId ?? ''));
  },

  async performRevokeMySecuritySessionIntent(vars: Record<string, unknown>) {
    return this.revokeSession(String(vars.sessionId ?? ''));
  },

  async performRevokeMyOtherSecuritySessionsIntent(_vars: Record<string, unknown>) {
    return this.revokeAllSessions();
  },

  async performRevokeMyInstallSecuritySessionsIntent(_vars: Record<string, unknown>) {
    return this.revokeAllSessions();
  },
};
