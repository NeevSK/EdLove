import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  QUICK_ACCESS_BUS_NAME,
  recordQuickAccessUse,
  useQuickAccessPreferences,
} from './quickAccessPreferences';
import { WORKBENCH_BUS_NAME, WORKBENCH_CHANGED_EVENT } from './useDomainWorkbench';

describe('Cross-tab synchronization buses', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('defines the broadcast channel names for workbench and quick access', () => {
    expect(WORKBENCH_BUS_NAME).toBe('gurudevi_workbench_bus');
    expect(QUICK_ACCESS_BUS_NAME).toBe('gurudevi_quick_access_bus');
  });

  it('records quick access and dispatches local and storage events', () => {
    const listener = vi.fn();
    window.addEventListener('gurudevi:quick-access-preferences-changed', listener);

    recordQuickAccessUse('workspace', 'sanctuary', 'attendance');

    expect(listener).toHaveBeenCalled();
    const stored = localStorage.getItem('gurudevi:quick-access:v1:workspace:sanctuary');
    expect(stored).toBeTruthy();
    const parsed = JSON.parse(stored!);
    expect(parsed.usage.attendance.count).toBe(1);

    window.removeEventListener('gurudevi:quick-access-preferences-changed', listener);
  });
});
