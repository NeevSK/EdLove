import { beforeEach, describe, expect, it, vi } from 'vitest';

const fixture = vi.hoisted(() => ({ records: new Map<string, string>(), fail: false }));
vi.mock('@repo/core/lib/storage', () => ({
  storage: {
    getStringAsync: async (key: string) => {
      if (fixture.fail) throw new Error('unavailable');
      return fixture.records.get(key);
    },
    setAsync: async (key: string, value: string) => {
      fixture.records.set(key, value);
    },
    deleteAsync: async (key: string) => {
      fixture.records.delete(key);
    },
  },
}));

import { setActiveAccountId } from './accountScope';
import { useExperienceState } from './experienceState';
import { withScopedStateWritesPaused } from './scopedStateStorage';

beforeEach(() => {
  fixture.records.clear();
  fixture.fail = false;
  setActiveAccountId('account-a');
  withScopedStateWritesPaused(() =>
    useExperienceState.setState({
      isExplorerMode: true,
      isDemoMode: false,
      isBridging: false,
      demoLogs: [],
    }),
  );
});
describe('experience workflow ownership', () => {
  it('restores account explorer choice without restoring demo bridge permission or write intents', async () => {
    fixture.records.set(
      'gurudevi:account-a:gurudevi-experience-state',
      JSON.stringify({
        state: {
          isExplorerMode: false,
          isBridging: true,
          isDemoMode: true,
          demoLogs: [{ module: 'evil' }],
        },
        version: 1,
      }),
    );
    await useExperienceState.persist.rehydrate();
    expect(useExperienceState.getState()).toMatchObject({
      isExplorerMode: false,
      isBridging: false,
      isDemoMode: false,
      demoLogs: [],
    });
    useExperienceState
      .getState()
      .addDemoLog({ module: 'self', method: 'create', payload: { text: 'draft' } });
    useExperienceState.getState().setBridging(true);
    expect(useExperienceState.getState().demoLogs[0]).toMatchObject({
      module: 'self',
      method: 'create',
      payload: { text: 'draft' },
    });
    const saved = JSON.parse(fixture.records.get('gurudevi:account-a:gurudevi-experience-state')!);
    expect(saved.state).toEqual({ isExplorerMode: false });
  });
  it('does not overwrite preferences with startup defaults after hydration fails', async () => {
    fixture.fail = true;
    await useExperienceState.persist.rehydrate();
    useExperienceState.getState().setDemoMode(false);
    expect(fixture.records.size).toBe(0);
  });
});
