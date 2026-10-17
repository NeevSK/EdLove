import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  BrowserPracticeStorageError,
  createRequiredBrowserPracticeStorage,
} from './practiceStorage';

describe('required browser Safe Try storage (G1 boundary)', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('fails closed when IndexedDB is unavailable instead of falling back to memory or localStorage', () => {
    vi.stubGlobal('window', { localStorage: window.localStorage });

    expect(() => createRequiredBrowserPracticeStorage()).toThrow(BrowserPracticeStorageError);
    expect(() => createRequiredBrowserPracticeStorage()).toThrow('requires browser storage');
  });
});
