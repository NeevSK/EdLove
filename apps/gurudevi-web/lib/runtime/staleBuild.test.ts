import { afterEach, describe, expect, it, vi } from 'vitest';
import { isStaleBuildError, reloadForNewBuild } from './staleBuild';

const reload = vi.fn();

afterEach(() => {
  sessionStorage.clear();
  reload.mockReset();
  vi.unstubAllGlobals();
});

function stubReload() {
  vi.stubGlobal('location', { ...window.location, reload });
}

describe('stale build recovery (G1 / jsdom)', () => {
  it('recognises the errors browsers give for a missing code file', () => {
    expect(
      isStaleBuildError(new TypeError('Failed to fetch dynamically imported module: /assets/x.js')),
    ).toBe(true);
    expect(isStaleBuildError(new TypeError('Importing a module script failed.'))).toBe(true);
    expect(isStaleBuildError(new Error('Cannot read properties of undefined'))).toBe(false);
    expect(isStaleBuildError('Failed to fetch dynamically imported module')).toBe(false);
  });

  it('reloads once, then lets the error show while the minute lasts', () => {
    stubReload();
    expect(reloadForNewBuild(1_000)).toBe(true);
    expect(reloadForNewBuild(30_000)).toBe(false);
    expect(reload).toHaveBeenCalledOnce();
    expect(reloadForNewBuild(62_000)).toBe(true);
    expect(reload).toHaveBeenCalledTimes(2);
  });
});
