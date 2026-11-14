import { afterEach, describe, expect, it, vi } from 'vitest';

const disk = vi.hoisted(() => ({ text: null as string | null, unreadable: false }));

vi.mock('expo-application', () => ({ getAndroidId: () => null }));
vi.mock('expo-file-system', () => ({
  Paths: { document: 'document://' },
  File: class {
    get exists() {
      return disk.text !== null;
    }
    textSync() {
      if (disk.unreadable) throw new Error('io');
      return disk.text ?? '';
    }
    create() {
      disk.text = '';
    }
    writeSync(content: string) {
      disk.text = content;
    }
    delete() {
      disk.text = null;
    }
  },
}));

import { readVergerLevel, writeDeviceLevelSwitch } from '@/runtime/runtimeMode';

describe('the verger level on the phone / substituted file system', () => {
  afterEach(() => {
    disk.text = null;
    disk.unreadable = false;
    globalThis.__GURUDEVI_VERGER_LEVEL__ = undefined;
    vi.unstubAllGlobals();
  });

  it('follows the build without a switch: development is exhaustive, release normal', () => {
    vi.stubGlobal('__DEV__', true);
    expect(readVergerLevel()).toMatchObject({ level: 'exhaustive', source: 'build' });
    vi.stubGlobal('__DEV__', false);
    expect(readVergerLevel()).toMatchObject({ level: 'normal', source: 'build' });
  });

  it('a release phone switched to exhaustive is exhaustive from its next launch; null removes it', () => {
    vi.stubGlobal('__DEV__', false);
    writeDeviceLevelSwitch('exhaustive');
    expect(readVergerLevel()).toMatchObject({ level: 'exhaustive', source: 'device' });
    writeDeviceLevelSwitch(null);
    expect(readVergerLevel()).toMatchObject({ level: 'normal', source: 'build' });
  });

  it('remote config wins over the phone; an unreadable switch is no switch', () => {
    vi.stubGlobal('__DEV__', false);
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    writeDeviceLevelSwitch('exhaustive');
    globalThis.__GURUDEVI_VERGER_LEVEL__ = 'normal';
    expect(readVergerLevel()).toMatchObject({ level: 'normal', source: 'remote' });
    globalThis.__GURUDEVI_VERGER_LEVEL__ = undefined;
    disk.unreadable = true;
    expect(readVergerLevel()).toMatchObject({ level: 'normal', source: 'build' });
  });
});
