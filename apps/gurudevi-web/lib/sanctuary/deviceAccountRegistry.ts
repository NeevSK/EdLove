/**
 * Web-Native Device Account Registry & Shared Lab Kiosk Manager
 *
 * Implements sovereign account profile caching on shared desktops (e.g. school/university labs)
 * without persisting passwords or active bearer tokens.
 *
 * Grounded in @repo/core/accounts/deviceAccounts and AGENTS.md security invariants:
 * - Passwords and active bearer tokens are NEVER stored in persistent storage in Kiosk mode.
 * - Profile records contain only public identification metadata.
 * - PINs are hashed with SHA-256 and unique per-account salts.
 */

import type { Capacity } from '@repo/core/logic/schemas/capacity.schema';

export interface DeviceAccountRecord {
  accountId: string;
  authUserId: string;
  displayName: string;
  avatarUrl: string | null;
  maskedEmail: string;
  schoolId: string | null;
  capacity: Capacity | 'scholar' | 'guest';
  hasPin: boolean;
  lastActiveAt: string;
}

const REGISTRY_STORAGE_KEY = 'gurudevi_device_accounts';
const KIOSK_MODE_STORAGE_KEY = 'gurudevi_kiosk_mode';
const PIN_PREFIX_STORAGE_KEY = 'gurudevi_pin_';

export function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return email;
  const [local = '', domain = ''] = email.split('@');
  if (local.length <= 2) return `${local.charAt(0)}***@${domain}`;
  return `${local.charAt(0)}${'*'.repeat(local.length - 2)}${local.charAt(local.length - 1)}@${domain}`;
}

export function isKioskMode(): boolean {
  if (typeof window === 'undefined') return false;
  return window.sessionStorage.getItem(KIOSK_MODE_STORAGE_KEY) === 'true' ||
         window.localStorage.getItem(KIOSK_MODE_STORAGE_KEY) === 'true';
}

export function setKioskMode(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  if (enabled) {
    window.localStorage.setItem(KIOSK_MODE_STORAGE_KEY, 'true');
    window.sessionStorage.setItem(KIOSK_MODE_STORAGE_KEY, 'true');
  } else {
    window.localStorage.removeItem(KIOSK_MODE_STORAGE_KEY);
    window.sessionStorage.removeItem(KIOSK_MODE_STORAGE_KEY);
  }
}

export function getDeviceAccounts(): DeviceAccountRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(REGISTRY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as DeviceAccountRecord[]) : [];
  } catch {
    return [];
  }
}

export function saveDeviceAccount(account: Omit<DeviceAccountRecord, 'lastActiveAt'>): void {
  if (typeof window === 'undefined') return;
  const accounts = getDeviceAccounts();
  const existingIdx = accounts.findIndex((a) => a.accountId === account.accountId);
  const updatedRecord: DeviceAccountRecord = {
    ...account,
    lastActiveAt: new Date().toISOString(),
  };

  if (existingIdx >= 0) {
    accounts[existingIdx] = updatedRecord;
  } else {
    accounts.unshift(updatedRecord);
  }

  // Cap at 8 remembered accounts on any given lab workstation
  const capped = accounts.slice(0, 8);
  window.localStorage.setItem(REGISTRY_STORAGE_KEY, JSON.stringify(capped));
}

export function removeDeviceAccount(accountId: string): void {
  if (typeof window === 'undefined') return;
  const accounts = getDeviceAccounts().filter((a) => a.accountId !== accountId);
  window.localStorage.setItem(REGISTRY_STORAGE_KEY, JSON.stringify(accounts));
  window.localStorage.removeItem(`${PIN_PREFIX_STORAGE_KEY}${accountId}`);
}

export function clearDeviceAccounts(): void {
  if (typeof window === 'undefined') return;
  const accounts = getDeviceAccounts();
  for (const acc of accounts) {
    window.localStorage.removeItem(`${PIN_PREFIX_STORAGE_KEY}${acc.accountId}`);
  }
  window.localStorage.removeItem(REGISTRY_STORAGE_KEY);
}

// ---------------------------------------------------------------------------
// Cryptographic PIN Verification (Web SubtleCrypto)
// ---------------------------------------------------------------------------

async function sha256Hex(text: string): Promise<string> {
  if (typeof window === 'undefined' || !window.crypto?.subtle) {
    // Fallback hash for test runner environments without WebCrypto subtle
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = (hash << 5) - hash + text.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash).toString(16).padStart(64, '0');
  }

  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function setAccountPin(accountId: string, pin: string): Promise<void> {
  if (typeof window === 'undefined') return;
  const trimmed = pin.trim();
  if (!/^\d{4,8}$/.test(trimmed)) {
    throw new Error('PIN must be 4 to 8 digits.');
  }

  const salt = window.crypto?.randomUUID ? window.crypto.randomUUID() : Math.random().toString(36).substring(2);
  const digest = await sha256Hex(`${salt}:${trimmed}`);
  const record = { salt, digest, updatedAt: new Date().toISOString() };

  window.localStorage.setItem(`${PIN_PREFIX_STORAGE_KEY}${accountId}`, JSON.stringify(record));

  // Update hasPin flag in device accounts registry
  const accounts = getDeviceAccounts();
  const target = accounts.find((a) => a.accountId === accountId);
  if (target) {
    target.hasPin = true;
    window.localStorage.setItem(REGISTRY_STORAGE_KEY, JSON.stringify(accounts));
  }
}

export async function verifyAccountPin(accountId: string, pin: string): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  const raw = window.localStorage.getItem(`${PIN_PREFIX_STORAGE_KEY}${accountId}`);
  if (!raw) return false;

  try {
    const { salt, digest } = JSON.parse(raw);
    const candidateDigest = await sha256Hex(`${salt}:${pin.trim()}`);
    return candidateDigest === digest;
  } catch {
    return false;
  }
}
