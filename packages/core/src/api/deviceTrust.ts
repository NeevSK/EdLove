import { v7 as uuidv7 } from 'uuid';
import {
  DEVICE_SECURITY_MUTATIONS,
  isOfflineLikeError,
  queueDeviceSecurityIntent,
} from '@repo/core/lib/sync/deviceSecurityIntents';
import { networkManager } from '@repo/core/logic/managers/NetworkManager';
import { coreRuntime } from '@repo/core/logic/runtimeRegistry';
import { APIError } from '@repo/core/types/API';
import { assertHighway } from '@repo/core/api/highways';
import { identityAPI } from '@repo/core/api/identity';
import { supabaseClient } from '@repo/core/adapters/supabaseClient';

const DEVICE_INSTALL_ID_KEY = 'gurudevi-device-install-id';
const SERVER_DEVICE_ID_KEY = 'gurudevi-server-device-id';

export interface DeviceTrustSummary {
  deviceId: string;
  installId: string;
  isTrusted: boolean;
  trustStatus: 'new' | 'trusted' | 'stale' | 'restricted' | 'standard';
  modelName: string | null;
  osVersion: string | null;
  platform: string | null;
  lastSeenAt: string | null;
  lastAccessedAt: string | null;
  linkedAccountId: string | null;
}

export interface DeviceSecurityEvent {
  id: string;
  action: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  accountId: string | null;
  device: DeviceTrustSummary | null;
}

export type AuthEvent = DeviceSecurityEvent;

export interface DeviceSecuritySession {
  sessionId: string;
  accountId: string;
  deviceId: string | null;
  installId: string | null;
  authUserId: string | null;
  platform: string | null;
  modelName: string | null;
  osVersion: string | null;
  status: 'active' | 'revoked';
  authStrength: string;
  trustStatus: 'new' | 'trusted' | 'stale' | 'restricted' | 'standard';
  startedAt: string;
  lastSeenAt: string;
  revokedAt: string | null;
  revokeReason: string | null;
}

export interface DeviceSecurityMutationResult<T> {
  queued: boolean;
  data: T;
}

interface DeviceTrustRow {
  device_id: string;
  install_id: string;
  is_trusted: boolean;
  trust_status?: 'new' | 'trusted' | 'stale' | 'restricted' | 'standard' | null;
  model_name: string | null;
  os_version: string | null;
  platform: string | null;
  last_seen_at: string | null;
  last_accessed_at: string | null;
  linked_account_id: string | null;
}

interface DeviceSecurityEventRow {
  id: string;
  action: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
  account_id: string | null;
  device_id: string | null;
  install_id: string | null;
  is_trusted: boolean | null;
  model_name: string | null;
  os_version: string | null;
  platform: string | null;
}

interface DeviceSecuritySessionRow {
  session_id: string;
  account_id: string;
  device_id: string | null;
  install_id: string | null;
  auth_user_id: string | null;
  platform: string | null;
  model_name: string | null;
  os_version: string | null;
  status: 'active' | 'revoked';
  auth_strength: string;
  trust_status: 'new' | 'trusted' | 'stale' | 'restricted' | 'standard';
  started_at: string;
  last_seen_at: string;
  revoked_at: string | null;
  revoke_reason: string | null;
}

function normalizeDeviceTrustRow(
  row: DeviceTrustRow | null | undefined,
): DeviceTrustSummary | null {
  if (!row?.device_id || !row.install_id) {
    return null;
  }

  return {
    deviceId: row.device_id,
    installId: row.install_id,
    isTrusted: row.is_trusted !== false,
    trustStatus: row.trust_status ?? (row.is_trusted !== false ? 'trusted' : 'restricted'),
    modelName: row.model_name ?? null,
    osVersion: row.os_version ?? null,
    platform: row.platform ?? null,
    lastSeenAt: row.last_seen_at ?? null,
    lastAccessedAt: row.last_accessed_at ?? null,
    linkedAccountId: row.linked_account_id ?? null,
  };
}

function normalizeDeviceSecurityEventRow(
  row: DeviceSecurityEventRow | null | undefined,
): DeviceSecurityEvent | null {
  if (!row?.id || !row.action || !row.created_at) {
    return null;
  }

  return {
    id: row.id,
    action: row.action,
    metadata: row.metadata ?? {},
    createdAt: row.created_at,
    accountId: row.account_id ?? null,
    device:
      row.device_id && row.install_id
        ? {
            deviceId: row.device_id,
            installId: row.install_id,
            isTrusted: row.is_trusted !== false,
            trustStatus: row.is_trusted !== false ? 'trusted' : 'restricted',
            modelName: row.model_name ?? null,
            osVersion: row.os_version ?? null,
            platform: row.platform ?? null,
            lastSeenAt: null,
            lastAccessedAt: null,
            linkedAccountId: row.account_id ?? null,
          }
        : null,
  };
}

function normalizeDeviceSecuritySessionRow(
  row: DeviceSecuritySessionRow | null | undefined,
): DeviceSecuritySession | null {
  if (!row?.session_id || !row.account_id || !row.started_at || !row.last_seen_at) {
    return null;
  }

  return {
    sessionId: row.session_id,
    accountId: row.account_id,
    deviceId: row.device_id ?? null,
    installId: row.install_id ?? null,
    authUserId: row.auth_user_id ?? null,
    platform: row.platform ?? null,
    modelName: row.model_name ?? null,
    osVersion: row.os_version ?? null,
    status: row.status,
    authStrength: row.auth_strength,
    trustStatus: row.trust_status,
    startedAt: row.started_at,
    lastSeenAt: row.last_seen_at,
    revokedAt: row.revoked_at ?? null,
    revokeReason: row.revoke_reason ?? null,
  };
}

function getDeviceMetadata() {
  return coreRuntime.device.getMetadata();
}

async function getOrCreateInstallId() {
  const existing = await coreRuntime.storage.getItem(DEVICE_INSTALL_ID_KEY);
  if (existing) return existing;

  const next = uuidv7();
  await coreRuntime.storage.setItem(DEVICE_INSTALL_ID_KEY, next);
  return next;
}

async function getStoredServerDeviceId() {
  return coreRuntime.storage.getItem(SERVER_DEVICE_ID_KEY);
}

async function setStoredServerDeviceId(deviceId: string) {
  await coreRuntime.storage.setItem(SERVER_DEVICE_ID_KEY, deviceId);
}

function unwrapRpcRow<T>(data: T[] | T | null): T | null {
  if (Array.isArray(data)) {
    return data[0] ?? null;
  }

  return data ?? null;
}

function unwrapRpcRows<T>(data: T[] | T | null) {
  if (Array.isArray(data)) {
    return data;
  }

  return data ? [data] : [];
}

async function rpcSingle<T>(fn: string, params: Record<string, unknown>) {
  const { data, error } = await supabaseClient.rpc(fn, params);

  if (error) {
    throw new APIError(`Failed to call ${fn}`, error.code, error);
  }

  return unwrapRpcRow<T>(data as T[] | T | null);
}

async function rpcList<T>(fn: string, params: Record<string, unknown> = {}) {
  const { data, error } = await supabaseClient.rpc(fn, params);

  if (error) {
    throw new APIError(`Failed to call ${fn}`, error.code, error);
  }

  return unwrapRpcRows<T>(data as T[] | T | null);
}

async function runQueuedDeviceSecurityMutation<T>(
  mutationName: keyof typeof DEVICE_SECURITY_MUTATIONS,
  variables: Record<string, unknown>,
  online: () => Promise<T>,
  queuedFallback: () => T,
): Promise<DeviceSecurityMutationResult<T>> {
  const isConnected = await networkManager.isConnected();
  if (!isConnected) {
    await queueDeviceSecurityIntent(DEVICE_SECURITY_MUTATIONS[mutationName], variables);
    return {
      queued: true,
      data: queuedFallback(),
    };
  }

  try {
    return {
      queued: false,
      data: await online(),
    };
  } catch (error) {
    if (!isOfflineLikeError(error)) {
      throw error;
    }

    await queueDeviceSecurityIntent(DEVICE_SECURITY_MUTATIONS[mutationName], variables);
    return {
      queued: true,
      data: queuedFallback(),
    };
  }
}

async function requireAccountId(accountId?: string) {
  if (accountId) return accountId;
  assertHighway('identity_bootstrap', 'direct-api');
  const identity = await identityAPI.identifyActiveCitizen();
  if (!identity) {
    throw new APIError('No authenticated account is available for device trust operations.');
  }

  return identity.id;
}

export const deviceTrustAPI = {
  async getInstallId() {
    return getOrCreateInstallId();
  },

  async getServerDeviceId() {
    return getStoredServerDeviceId();
  },

  async ensureDeviceRegistered() {
    const installId = await getOrCreateInstallId();
    const { modelName, osVersion, platform } = getDeviceMetadata();

    const row = await rpcSingle<DeviceTrustRow>('register_my_device', {
      p_install_id: installId,
      p_model_name: modelName,
      p_os_version: osVersion,
      p_platform: platform,
    });

    const normalized = normalizeDeviceTrustRow(row);
    if (!normalized) {
      throw new APIError('Device registration did not return a valid device record.');
    }

    await setStoredServerDeviceId(normalized.deviceId);
    return normalized;
  },

  async linkCurrentAccountToDevice(accountId?: string) {
    const resolvedAccountId = await requireAccountId(accountId);
    const device = await this.ensureDeviceRegistered();

    await rpcSingle('link_my_device_account', {
      p_device_id: device.deviceId,
      p_account_id: resolvedAccountId,
    });

    return device;
  },

  async touchCurrentDevice(accountId?: string) {
    const resolvedAccountId = await requireAccountId(accountId);
    const deviceId =
      (await getStoredServerDeviceId()) ?? (await this.ensureDeviceRegistered()).deviceId;

    const row = await rpcSingle<DeviceTrustRow>('touch_my_device_account', {
      p_device_id: deviceId,
      p_account_id: resolvedAccountId,
    });

    const normalized = normalizeDeviceTrustRow(row);
    if (!normalized) {
      throw new APIError('Device touch did not return a valid trust summary.');
    }

    return normalized;
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
    const deviceId =
      (await getStoredServerDeviceId()) ?? (await this.ensureDeviceRegistered()).deviceId;
    const installId = await getOrCreateInstallId();
    const { modelName, osVersion, platform } = getDeviceMetadata();

    const row = await rpcSingle<DeviceSecuritySessionRow>('upsert_my_security_session', {
      p_device_id: deviceId,
      p_install_id: installId,
      p_auth_user_id: options?.authUserId ?? null,
      p_platform: platform,
      p_model_name: modelName,
      p_os_version: osVersion,
      p_auth_strength: options?.authStrength ?? 'session',
    });

    const normalized = normalizeDeviceSecuritySessionRow(row);
    if (!normalized) {
      throw new APIError('Security session upsert did not return a valid session.');
    }

    return normalized;
  },

  async getCurrentDeviceTrust() {
    const deviceId = await getStoredServerDeviceId();
    const installId = await getOrCreateInstallId();

    const row = await rpcSingle<DeviceTrustRow>('get_my_device_trust', {
      p_device_id: deviceId,
      p_install_id: deviceId ? null : installId,
    });

    const normalized = normalizeDeviceTrustRow(row);
    if (normalized?.deviceId) {
      await setStoredServerDeviceId(normalized.deviceId);
    }

    return normalized;
  },

  async listMyDevices() {
    const rows = await rpcList<DeviceTrustRow>('list_my_devices');
    return rows
      .map((row) => normalizeDeviceTrustRow(row))
      .filter((row): row is DeviceTrustSummary => !!row);
  },

  async listMySecurityAuditEvents(limit = 50) {
    const rows = await rpcList<DeviceSecurityEventRow>('list_my_security_audit_events', {
      p_limit: limit,
    });

    return rows
      .map((row) => normalizeDeviceSecurityEventRow(row))
      .filter((row): row is DeviceSecurityEvent => !!row);
  },

  async listMyAuthEvents(limit = 50) {
    const rows = await rpcList<DeviceSecurityEventRow>('list_my_auth_events', {
      p_limit: limit,
    });

    return rows
      .map((row) => normalizeDeviceSecurityEventRow(row))
      .filter((row): row is AuthEvent => !!row);
  },

  async listMySecuritySessions(limit = 20) {
    const rows = await rpcList<DeviceSecuritySessionRow>('list_my_security_sessions', {
      p_limit: limit,
    });

    return rows
      .map((row) => normalizeDeviceSecuritySessionRow(row))
      .filter((row): row is DeviceSecuritySession => !!row);
  },

  async performUnlinkMyDeviceIntent(input: {
    deviceId: string;
    revokeSessions?: boolean;
    idempotencyKey?: string | null;
  }) {
    const resolvedAccountId = await requireAccountId();
    const revokeSessions = input.revokeSessions ?? true;
    const { data, error } = await supabaseClient.rpc(
      'unlink_my_device',
      {
        p_device_id: input.deviceId,
        p_revoke_sessions: revokeSessions,
      },
    );

    if (error) {
      throw new APIError('Failed to unlink device.', error.code, error);
    }

    await this.logAuditEvent(
      'DEVICE_UNLINKED_FROM_ACCOUNT',
      {
        revokedSessions: revokeSessions,
        idempotency_key: input.idempotencyKey ?? null,
      },
      resolvedAccountId,
    );

    return data as string | null;
  },

  async unlinkMyDevice(deviceId: string, revokeSessions = true) {
    return runQueuedDeviceSecurityMutation(
      'unlinkDevice',
      {
        deviceId,
        revokeSessions,
      },
      () => this.performUnlinkMyDeviceIntent({ deviceId, revokeSessions }),
      () => deviceId,
    );
  },

  async performRevokeMySecuritySessionIntent(input: {
    sessionId: string;
    reason?: string;
    idempotencyKey?: string | null;
  }) {
    const reason = input.reason ?? 'manual';
    const row = await rpcSingle<DeviceSecuritySessionRow>('revoke_my_security_session', {
      p_session_id: input.sessionId,
      p_reason: reason,
    });

    const normalized = normalizeDeviceSecuritySessionRow(row);
    if (!normalized) {
      throw new APIError('Security session revoke did not return a valid session.');
    }

    await this.logAuditEvent('SECURITY_SESSION_REVOKED', {
      sessionId: input.sessionId,
      reason,
      idempotency_key: input.idempotencyKey ?? null,
    });

    return normalized;
  },

  async revokeMySecuritySession(sessionId: string, reason = 'manual') {
    return runQueuedDeviceSecurityMutation(
      'revokeSession',
      {
        sessionId,
        reason,
      },
      () => this.performRevokeMySecuritySessionIntent({ sessionId, reason }),
      () => null,
    );
  },

  async performRevokeMyOtherSecuritySessionsIntent(input: {
    keepSessionId?: string | null;
    reason?: string;
    idempotencyKey?: string | null;
  }) {
    const reason = input.reason ?? 'manual';
    const { data, error } = await supabaseClient.rpc(
      'revoke_my_other_security_sessions',
      {
        p_keep_session_id: input.keepSessionId ?? null,
        p_reason: reason,
      },
    );

    if (error) {
      throw new APIError('Failed to revoke other security sessions.', error.code, error);
    }

    await this.logAuditEvent('OTHER_SECURITY_SESSIONS_REVOKED', {
      keepSessionId: input.keepSessionId ?? null,
      reason,
      revokedCount: Number(data ?? 0),
      idempotency_key: input.idempotencyKey ?? null,
    });

    return Number(data ?? 0);
  },

  async revokeMyOtherSecuritySessions(keepSessionId?: string | null, reason = 'manual') {
    return runQueuedDeviceSecurityMutation(
      'revokeOtherSessions',
      {
        keepSessionId: keepSessionId ?? null,
        reason,
      },
      () => this.performRevokeMyOtherSecuritySessionsIntent({ keepSessionId, reason }),
      () => 0,
    );
  },

  async performRevokeMyInstallSecuritySessionsIntent(input: {
    installId: string;
    reason?: string;
    idempotencyKey?: string | null;
  }) {
    const reason = input.reason ?? 'signed_out_locally';
    const { data, error } = await supabaseClient.rpc(
      'revoke_my_install_security_sessions',
      {
        p_install_id: input.installId,
        p_reason: reason,
      },
    );

    if (error) {
      throw new APIError('Failed to revoke current install security sessions.', error.code, error);
    }

    await this.logAuditEvent('CURRENT_INSTALL_SECURITY_SESSIONS_REVOKED', {
      installId: input.installId,
      reason,
      revokedCount: Number(data ?? 0),
      idempotency_key: input.idempotencyKey ?? null,
    });

    return Number(data ?? 0);
  },

  async revokeMyInstallSecuritySessions(installId: string, reason = 'signed_out_locally') {
    return runQueuedDeviceSecurityMutation(
      'revokeCurrentInstallSessions',
      {
        installId,
        reason,
      },
      () => this.performRevokeMyInstallSecuritySessionsIntent({ installId, reason }),
      () => 0,
    );
  },

  async isCurrentDeviceTrusted() {
    try {
      const trust = await this.getCurrentDeviceTrust();
      return trust?.isTrusted ?? true;
    } catch {
      // Phase 1 fails open when the network or backend trust lookup is unavailable.
      return true;
    }
  },

  async performLogAuditEventIntent(input: {
    action: string;
    metadata?: Record<string, unknown>;
    accountId?: string;
    deviceId?: string | null;
    idempotencyKey?: string | null;
  }) {
    const resolvedAccountId = await requireAccountId(input.accountId);
    const deviceId =
      input.deviceId ??
      (await getStoredServerDeviceId()) ??
      (await this.ensureDeviceRegistered()).deviceId;
    const nextMetadata = {
      ...(input.metadata ?? {}),
      idempotency_key:
        input.idempotencyKey ?? (input.metadata?.idempotency_key as string | null) ?? null,
    };

    const { data, error } = await supabaseClient.rpc(
      'log_my_device_audit',
      {
        p_action: input.action,
        p_device_id: deviceId,
        p_account_id: resolvedAccountId,
        p_metadata: nextMetadata,
      },
    );

    if (error) {
      throw new APIError('Failed to write device audit log.', error.code, error);
    }

    return data as string | null;
  },

  async logAuditEvent(action: string, metadata: Record<string, unknown> = {}, accountId?: string) {
    const resolvedAccountId = await requireAccountId(accountId);
    const deviceId =
      (await getStoredServerDeviceId()) ?? (await this.ensureDeviceRegistered()).deviceId;
    const variables = {
      action,
      metadata,
      accountId: resolvedAccountId,
      deviceId,
    };

    const isConnected = await networkManager.isConnected();
    if (!isConnected) {
      await queueDeviceSecurityIntent(DEVICE_SECURITY_MUTATIONS.auditEvent, variables);
      return null;
    }

    try {
      return await this.performLogAuditEventIntent(variables);
    } catch (error) {
      if (!isOfflineLikeError(error)) {
        throw error;
      }

      await queueDeviceSecurityIntent(DEVICE_SECURITY_MUTATIONS.auditEvent, variables);
      return null;
    }
  },

  async getSecuritySummary() {
    const [devices, events, authEvents, sessions, currentDevice] = await Promise.all([
      this.listMyDevices(),
      this.listMySecurityAuditEvents(),
      this.listMyAuthEvents(),
      this.listMySecuritySessions(),
      this.getCurrentDeviceTrust(),
    ]);
    return { devices, events, authEvents, sessions, currentDevice };
  },

  async trustDevice(deviceId: string) {
    await rpcSingle('trust_my_device', { p_device_id: deviceId });
  },

  async revokeAllSessions() {
    return this.revokeMyOtherSecuritySessions(null);
  },

  async revokeSession(sessionId: string, reason = 'manual') {
    return this.revokeMySecuritySession(sessionId, reason);
  },

  async unlinkDevice(deviceId: string, revokeSessions = true) {
    return this.unlinkMyDevice(deviceId, revokeSessions);
  },
};
