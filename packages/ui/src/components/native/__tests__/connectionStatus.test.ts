import { describe, expect, it } from 'vitest';
import { connectionStatusOf } from '../Shell/connectionStatus';

describe('connectionStatusOf', () => {
  it('says nothing online with nothing waiting, or when the network is unknown', () => {
    expect(connectionStatusOf({ network: 'online', queued: 0, syncing: false })).toBeUndefined();
    expect(connectionStatusOf({ network: 'unknown', queued: 3, syncing: false })).toBeUndefined();
  });
  it('promises work is kept when offline', () => {
    expect(connectionStatusOf({ network: 'offline', queued: 0, syncing: false })).toMatchObject({
      tone: 'offline',
      short: 'Offline',
      label: 'Offline. What you do is kept on this phone',
    });
    expect(connectionStatusOf({ network: 'offline', queued: 1, syncing: false })?.label).toBe(
      "Offline. 1 change kept, sent when you're back",
    );
  });
  it('shows sending only while there is something to send', () => {
    expect(connectionStatusOf({ network: 'online', queued: 2, syncing: true })?.label).toBe(
      'Sending 2 changes',
    );
    expect(connectionStatusOf({ network: 'online', queued: 0, syncing: true })).toBeUndefined();
  });
  it('puts changes that could not be sent first', () => {
    expect(
      connectionStatusOf({ network: 'offline', queued: 4, syncing: false, failed: 2 }),
    ).toMatchObject({ tone: 'attention', short: 'Not sent' });
  });
});
