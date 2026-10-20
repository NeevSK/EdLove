import { beforeEach, describe, expect, it } from 'vitest';
import {
  clearDeviceAccounts,
  getDeviceAccounts,
  isKioskMode,
  maskEmail,
  removeDeviceAccount,
  saveDeviceAccount,
  setAccountPin,
  setKioskMode,
  verifyAccountPin,
} from '@/lib/sanctuary/deviceAccountRegistry';

describe('Unit/Integration: Web Device Account Registry & Kiosk Isolation', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  describe('maskEmail', () => {
    it('masks standard student emails correctly', () => {
      expect(maskEmail('kasun@colombo.edu.lk')).toBe('k***n@colombo.edu.lk');
      expect(maskEmail('an@colombo.edu.lk')).toBe('a***@colombo.edu.lk');
      expect(maskEmail('scholar@gurudevi.app')).toBe('s*****r@gurudevi.app');
    });

    it('returns raw string if not an email', () => {
      expect(maskEmail('not-an-email')).toBe('not-an-email');
    });
  });

  describe('Kiosk Mode', () => {
    it('defaults to false when unset', () => {
      expect(isKioskMode()).toBe(false);
    });

    it('enables and disables kiosk mode across storage boundaries', () => {
      setKioskMode(true);
      expect(isKioskMode()).toBe(true);

      setKioskMode(false);
      expect(isKioskMode()).toBe(false);
    });
  });

  describe('Device Account Persistence & Capping', () => {
    it('saves and retrieves accounts without storing tokens or passwords', () => {
      saveDeviceAccount({
        accountId: 'acc-001',
        authUserId: 'usr-001',
        displayName: 'Kasun Perera',
        avatarUrl: null,
        maskedEmail: 'k***n@colombo.edu.lk',
        schoolId: 'sch-colombo-central',
        capacity: 'student',
        hasPin: false,
      });

      const accounts = getDeviceAccounts();
      expect(accounts).toHaveLength(1);
      expect(accounts[0]?.displayName).toBe('Kasun Perera');
      expect(accounts[0]?.maskedEmail).toBe('k***n@colombo.edu.lk');
      // Verify no sensitive tokens exist on the record
      const record = accounts[0] as unknown as Record<string, unknown>;
      expect(record.password).toBeUndefined();
      expect(record.access_token).toBeUndefined();
    });

    it('caps device account registry at 8 accounts to prevent lab storage bloat', () => {
      for (let i = 1; i <= 10; i++) {
        saveDeviceAccount({
          accountId: `acc-${i}`,
          authUserId: `usr-${i}`,
          displayName: `Student ${i}`,
          avatarUrl: null,
          maskedEmail: `s***${i}@school.lk`,
          schoolId: 'sch-01',
          capacity: 'student',
          hasPin: false,
        });
      }

      const accounts = getDeviceAccounts();
      expect(accounts).toHaveLength(8);
      // Most recently active should be at the front
      expect(accounts[0]?.accountId).toBe('acc-10');
    });

    it('removes an account and its associated PIN data', async () => {
      saveDeviceAccount({
        accountId: 'acc-del',
        authUserId: 'usr-del',
        displayName: 'To Remove',
        avatarUrl: null,
        maskedEmail: 't***e@school.lk',
        schoolId: null,
        capacity: 'guest',
        hasPin: true,
      });

      await setAccountPin('acc-del', '1234');
      expect(getDeviceAccounts()).toHaveLength(1);

      removeDeviceAccount('acc-del');
      expect(getDeviceAccounts()).toHaveLength(0);
      expect(await verifyAccountPin('acc-del', '1234')).toBe(false);
    });

    it('clears all device accounts upon total lab wipe', () => {
      saveDeviceAccount({
        accountId: 'acc-1',
        authUserId: 'usr-1',
        displayName: 'S1',
        avatarUrl: null,
        maskedEmail: 's1@a.lk',
        schoolId: null,
        capacity: 'student',
        hasPin: false,
      });
      saveDeviceAccount({
        accountId: 'acc-2',
        authUserId: 'usr-2',
        displayName: 'S2',
        avatarUrl: null,
        maskedEmail: 's2@a.lk',
        schoolId: null,
        capacity: 'student',
        hasPin: false,
      });

      expect(getDeviceAccounts()).toHaveLength(2);
      clearDeviceAccounts();
      expect(getDeviceAccounts()).toHaveLength(0);
    });
  });

  describe('Cryptographic PIN Verification', () => {
    it('sets and successfully verifies a 4-digit PIN', async () => {
      saveDeviceAccount({
        accountId: 'acc-pin-test',
        authUserId: 'usr-pin-test',
        displayName: 'Protected Scholar',
        avatarUrl: null,
        maskedEmail: 'p***r@school.lk',
        schoolId: null,
        capacity: 'student',
        hasPin: false,
      });

      await setAccountPin('acc-pin-test', '5829');

      // Check hasPin is updated
      const accounts = getDeviceAccounts();
      expect(accounts[0]?.hasPin).toBe(true);

      // Verify correct PIN passes
      const valid = await verifyAccountPin('acc-pin-test', '5829');
      expect(valid).toBe(true);

      // Verify incorrect PIN fails
      const invalid = await verifyAccountPin('acc-pin-test', '0000');
      expect(invalid).toBe(false);
    });

    it('rejects invalid PIN formats (under 4 digits or non-numeric)', async () => {
      await expect(setAccountPin('acc-pin-test', '12')).rejects.toThrow('PIN must be 4 to 8 digits.');
      await expect(setAccountPin('acc-pin-test', 'abcd')).rejects.toThrow('PIN must be 4 to 8 digits.');
    });
  });
});
