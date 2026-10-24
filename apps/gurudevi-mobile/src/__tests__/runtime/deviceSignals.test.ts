import { describe, expect, it, vi } from 'vitest';

vi.mock('@react-native-community/netinfo', () => ({
  default: {},
  NetInfoStateType: { unknown: 'unknown', none: 'none', cellular: 'cellular' },
}));
vi.mock('expo-battery', () => ({
  BatteryState: { UNKNOWN: 0, UNPLUGGED: 1, CHARGING: 2, FULL: 3, NOT_CHARGING: 4 },
}));

const { batteryEventOf, networkEventOf } = await import('@/runtime/deviceSignals');
const { NetInfoStateType } = await import('@react-native-community/netinfo');

describe('device readings as verger events', () => {
  it('maps NetInfo: offline is known only when NetInfo says disconnected', () => {
    expect(
      networkEventOf(
        { type: NetInfoStateType.none, isConnected: false, isInternetReachable: false, details: null },
        5,
      ),
    ).toMatchObject({ type: 'network', at: 5, transport: 'none', validated: false });
    expect(
      networkEventOf(
        { type: NetInfoStateType.unknown, isConnected: null, isInternetReachable: null, details: null },
        5,
      ),
    ).toMatchObject({ transport: null, validated: null, metered: null });
  });

  it('carries cellular cost as metered, and never invents bandwidth or Data Saver', () => {
    const event = networkEventOf(
      {
        type: NetInfoStateType.cellular,
        isConnected: true,
        isInternetReachable: true,
        details: {
          isConnectionExpensive: true,
          cellularGeneration: '4g',
          carrier: null,
        },
      },
      1,
    );
    expect(event).toMatchObject({
      transport: 'cellular',
      validated: true,
      metered: true,
      downKbps: null,
      dataSaver: null,
    });
  });

  it('maps expo-battery: -1 is unknown; only UNPLUGGED is on battery', () => {
    expect(batteryEventOf(0.42, 1, 0)).toMatchObject({ levelPercent: 42, pluggedIn: false });
    expect(batteryEventOf(-1, 0, 0)).toMatchObject({ levelPercent: null, pluggedIn: null });
    expect(batteryEventOf(1, 3, 0)).toMatchObject({ pluggedIn: true });
    // Plugged in but not charging (a full or limited battery) is still plugged in.
    expect(batteryEventOf(0.8, 4, 0)).toMatchObject({ pluggedIn: true });
  });
});
