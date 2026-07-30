import { v7 as uuidv7 } from 'uuid';
import { type ActiveCitizen, identityAPI } from '@repo/core/api/identity';
import { __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__ } from '@repo/core/api/supabase';
import { coreRuntime } from '@repo/core/logic/runtimeRegistry';
import { APIError } from '@repo/core/types/API';

const DEVICE_INSTALL_ID_KEY = 'gurudevi-device-install-id';
const SERVER_DEVICE_ID_KEY = 'gurudevi-server-device-id';

export interface DeviceTrustSummary {
  deviceId: string;
  installId: string;
  isTrusted: boolean;
  modelName: string | null;
  osVersion: string | null;
  platform: string | null;
  lastSeenAt: string | null;
  lastAccessedAt: string | null;
  linkedAccountId: string | null;
}

interface DeviceTrustRow {
  device_id: string;
  install_id: string;
  is_trusted: boolean;
  model_name: string | null;
  os_version: string | null;
  platform: string | null;
  last_seen_at: string | null;
  last_accessed_at: string | null;
  linked_account_id: string | null;
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
    modelName: row.model_name ?? null,
    osVersion: row.os_version ?? null,
    platform: row.platform ?? null,
    lastSeenAt: row.last_seen_at ?? null,
    lastAccessedAt: row.last_accessed_at ?? null,
    linkedAccountId: row.linked_account_id ?? null,
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

async function rpcSingle<T>(fn: string, params: Record<string, unknown>) {
  const { data, error } = await __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__.rpc(fn, params);

  if (error) {
    throw new APIError(`Failed to call ${fn}`, error.code, error);
  }

  return unwrapRpcRow<T>(data as T[] | T | null);
}

async function requireAccountId(accountId?: string) {
  const identity = await identityAPI.identifyActiveCitizen();
  const resolved = accountId ?? (identity as ActiveCitizen | null)?.id;
  if (!resolved) {
    throw new APIError('No authenticated account is available for device trust operations.');
  }

  return resolved;
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

  async isCurrentDeviceTrusted() {
    try {
      const trust = await this.getCurrentDeviceTrust();
      return trust?.isTrusted ?? true;
    } catch {
      // Phase 1 fails open when the network or backend trust lookup is unavailable.
      return true;
    }
  },

  async logAuditEvent(action: string, metadata: Record<string, unknown> = {}, accountId?: string) {
    const resolvedAccountId = await requireAccountId(accountId);
    const deviceId =
      (await getStoredServerDeviceId()) ?? (await this.ensureDeviceRegistered()).deviceId;

    const { data, error } = await __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__.rpc(
      'log_my_device_audit',
      {
        p_action: action,
        p_device_id: deviceId,
        p_account_id: resolvedAccountId,
        p_metadata: metadata,
      },
    );

    if (error) {
      throw new APIError('Failed to write device audit log.', error.code, error);
    }

    return data as string | null;
  },
};
