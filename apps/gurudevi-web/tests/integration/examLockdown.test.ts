import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useExamLockdown, type ExamViolation } from '@/lib/sanctuary/useExamLockdown';

describe('Unit/Integration: In-Browser Exam Lockdown & Classroom Sentinel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with zero violations in active exam mode', () => {
    const { result } = renderHook(() => useExamLockdown({ enabled: true }));
    expect(result.current.isLockedDown).toBe(true);
    expect(result.current.warningCount).toBe(0);
    expect(result.current.violations).toHaveLength(0);
  });

  it('records a blur violation when student alt-tabs or clicks outside the window', () => {
    const onViolation = vi.fn();
    const { result } = renderHook(() => useExamLockdown({ enabled: true, onViolation }));

    act(() => {
      window.dispatchEvent(new Event('blur'));
    });

    expect(result.current.warningCount).toBe(1);
    expect(result.current.violations[0]?.type).toBe('blur');
    expect(onViolation).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'blur' }),
    );
  });

  it('records a visibility violation when tab is minimized or hidden', () => {
    const { result } = renderHook(() => useExamLockdown({ enabled: true }));

    // Mock document.hidden
    Object.defineProperty(document, 'hidden', {
      configurable: true,
      get: () => true,
    });

    act(() => {
      document.dispatchEvent(new Event('visibilitychange'));
    });

    expect(result.current.warningCount).toBe(1);
    expect(result.current.violations[0]?.type).toBe('visibility_hidden');
  });

  it('quarantines clipboard events (copy, cut, paste) and logs attempts', () => {
    const { result } = renderHook(() => useExamLockdown({ enabled: true }));

    const copyEvent = new Event('copy', { cancelable: true });
    const pasteEvent = new Event('paste', { cancelable: true });

    act(() => {
      document.dispatchEvent(copyEvent);
      document.dispatchEvent(pasteEvent);
    });

    expect(copyEvent.defaultPrevented).toBe(true);
    expect(pasteEvent.defaultPrevented).toBe(true);
    expect(result.current.warningCount).toBe(2);
    expect(result.current.violations[0]?.type).toBe('clipboard_attempt');
    expect(result.current.violations[1]?.type).toBe('clipboard_attempt');
  });

  it('triggers onWarningThresholdReached when maximum warnings are exceeded', () => {
    const onThreshold = vi.fn();
    const { result } = renderHook(() =>
      useExamLockdown({ enabled: true, maxWarnings: 3, onWarningThresholdReached: onThreshold }),
    );

    act(() => {
      window.dispatchEvent(new Event('blur'));
      window.dispatchEvent(new Event('blur'));
      window.dispatchEvent(new Event('blur'));
    });

    expect(result.current.warningCount).toBe(3);
    expect(onThreshold).toHaveBeenCalledTimes(1);
    expect(onThreshold).toHaveBeenCalledWith(expect.arrayContaining([
      expect.objectContaining({ type: 'blur' }),
    ]));
  });

  it('resets violations on demand', () => {
    const { result } = renderHook(() => useExamLockdown({ enabled: true }));

    act(() => {
      window.dispatchEvent(new Event('blur'));
    });
    expect(result.current.warningCount).toBe(1);

    act(() => {
      result.current.resetViolations();
    });
    expect(result.current.warningCount).toBe(0);
  });
});
