import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getScaffoldDismissal, useScaffoldDismissal } from '../useScaffoldDismissal';
import { useUIStore } from '../../store/useUIStore';

vi.mock('react', () => ({
  useCallback: <Callback extends (...args: any[]) => any>(cb: Callback) => cb,
}));

describe('useScaffoldDismissal & getScaffoldDismissal (Scaffold & Fade)', () => {
  beforeEach(() => {
    useUIStore.getState().resetScaffoldCompletions?.();
  });

  describe('getScaffoldDismissal (imperative accessor)', () => {
    it('initializes with zero completions and not dismissed', () => {
      const res = getScaffoldDismissal('principal_first_school', 3);
      expect(res.completionCount).toBe(0);
      expect(res.isDismissed).toBe(false);
    });

    it('increments completion count and auto-dismisses after reaching threshold', () => {
      const key = 'principal_first_school';
      const res1 = getScaffoldDismissal(key, 3);
      expect(res1.isDismissed).toBe(false);

      res1.completeScaffold();
      const res2 = getScaffoldDismissal(key, 3);
      expect(res2.completionCount).toBe(1);
      expect(res2.isDismissed).toBe(false);

      res2.completeScaffold();
      const res3 = getScaffoldDismissal(key, 3);
      expect(res3.completionCount).toBe(2);
      expect(res3.isDismissed).toBe(false);

      res3.completeScaffold();
      const res4 = getScaffoldDismissal(key, 3);
      expect(res4.completionCount).toBe(3);
      expect(res4.isDismissed).toBe(true);
    });

    it('resets completions when resetScaffold is triggered', () => {
      const key = 'teacher_roster_guide';
      const res = getScaffoldDismissal(key, 2);
      res.completeScaffold();
      res.completeScaffold();

      const dismissedRes = getScaffoldDismissal(key, 2);
      expect(dismissedRes.isDismissed).toBe(true);

      dismissedRes.resetScaffold();
      const resetRes = getScaffoldDismissal(key, 2);
      expect(resetRes.completionCount).toBe(0);
      expect(resetRes.isDismissed).toBe(false);
    });
  });

  describe('useUIStore persistence contract', () => {
    it('directly updates store state on incrementScaffoldCompletion', () => {
      useUIStore.getState().incrementScaffoldCompletion?.('desk_tutorial');
      expect(useUIStore.getState().scaffoldCompletions?.['desk_tutorial']).toBe(1);

      useUIStore.getState().incrementScaffoldCompletion?.('desk_tutorial');
      expect(useUIStore.getState().scaffoldCompletions?.['desk_tutorial']).toBe(2);
    });
  });
});
