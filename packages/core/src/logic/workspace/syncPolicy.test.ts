import { describe, expect, it, vi } from 'vitest';
import {
  isRetryableWorkspaceSyncError,
  shouldRetryWorkspaceSync,
  workspaceSyncRetryDelay,
} from './syncPolicy';

describe('workspace sync retry policy', () => {
  it('retries network failures and transient HTTP responses only', () => {
    expect(isRetryableWorkspaceSyncError(new TypeError('fetch failed'))).toBe(true);
    expect(isRetryableWorkspaceSyncError({ status: 408 })).toBe(true);
    expect(isRetryableWorkspaceSyncError({ status: 429 })).toBe(true);
    expect(isRetryableWorkspaceSyncError({ status: 503 })).toBe(true);
    expect(isRetryableWorkspaceSyncError({ status: 400 })).toBe(false);
    expect(isRetryableWorkspaceSyncError({ status: 403 })).toBe(false);
    expect(isRetryableWorkspaceSyncError(new Error('invalid layout'))).toBe(false);
  });

  it('caps retries and applies bounded full jitter', () => {
    expect(shouldRetryWorkspaceSync(0, { status: 503 })).toBe(true);
    expect(shouldRetryWorkspaceSync(2, { status: 503 })).toBe(true);
    expect(shouldRetryWorkspaceSync(3, { status: 503 })).toBe(false);
    expect(shouldRetryWorkspaceSync(0, { status: 403 })).toBe(false);

    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    expect(workspaceSyncRetryDelay(0)).toBe(500);
    expect(workspaceSyncRetryDelay(10)).toBe(15_000);
    vi.restoreAllMocks();
  });
});
