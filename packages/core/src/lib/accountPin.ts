import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { v4 as uuidv4 } from 'uuid';

const PIN_RECORD_VERSION = 1;
const PIN_HASH_ROUNDS = 200;
const PIN_KEY_PREFIX = 'gurudevi:account-pin';

type StoredPinRecord = {
  version: number;
  salt: string;
  hash: string;
  createdAt: string;
  updatedAt: string;
};

function getPinStorageKey(accountId: string) {
  return `${PIN_KEY_PREFIX}:${accountId}`;
}

function normalizePin(pin: string) {
  return pin.replace(/\s+/g, '').trim();
}

function assertValidPin(pin: string) {
  const normalized = normalizePin(pin);

  if (!/^\d{4,8}$/.test(normalized)) {
    throw new Error('PIN must be 4 to 8 digits.');
  }

  return normalized;
}

async function readStorage(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    return AsyncStorage.getItem(key);
  }

  return SecureStore.getItemAsync(key);
}

async function writeStorage(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    await AsyncStorage.setItem(key, value);
    return;
  }

  await SecureStore.setItemAsync(key, value);
}

async function deleteStorage(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    await AsyncStorage.removeItem(key);
    return;
  }

  await SecureStore.deleteItemAsync(key);
}

async function hashPin(pin: string, salt: string) {
  let digest = `${salt}:${pin}`;

  for (let round = 0; round < PIN_HASH_ROUNDS; round += 1) {
    digest = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, digest);
  }

  return digest;
}

async function readPinRecord(accountId: string): Promise<StoredPinRecord | null> {
  const raw = await readStorage(getPinStorageKey(accountId));
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as StoredPinRecord;

    if (
      typeof parsed?.salt !== 'string' ||
      typeof parsed?.hash !== 'string' ||
      typeof parsed?.createdAt !== 'string' ||
      typeof parsed?.updatedAt !== 'string'
    ) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export const accountPin = {
  async hasPin(accountId: string | null | undefined) {
    if (!accountId) return false;
    const record = await readPinRecord(accountId);
    return !!record?.hash;
  },

  async setPin(accountId: string, pin: string) {
    const normalizedPin = assertValidPin(pin);
    const existing = await readPinRecord(accountId);
    const salt = existing?.salt ?? uuidv4();
    const hash = await hashPin(normalizedPin, salt);
    const now = new Date().toISOString();

    const record: StoredPinRecord = {
      version: PIN_RECORD_VERSION,
      salt,
      hash,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };

    await writeStorage(getPinStorageKey(accountId), JSON.stringify(record));
  },

  async verifyPin(accountId: string, pin: string) {
    const normalizedPin = assertValidPin(pin);
    const record = await readPinRecord(accountId);
    if (!record) return false;

    const attemptedHash = await hashPin(normalizedPin, record.salt);
    return attemptedHash === record.hash;
  },

  async removePin(accountId: string | null | undefined) {
    if (!accountId) return;
    await deleteStorage(getPinStorageKey(accountId));
  },
};

export function validateAccountPin(pin: string) {
  assertValidPin(pin);
}
