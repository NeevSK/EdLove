import { describe, expect, it } from 'vitest';
import {
  admitWorkCategory,
  performanceGovernor,
  senseGovernor,
} from '../governor';

describe('Performance Governor Unified Facade', () => {
  describe('senseGovernor', () => {
    it('generates a snapshot with defaults', () => {
      const snapshot = senseGovernor();
      expect(snapshot.deviceTier).toBe('medium');
      expect(snapshot.thermalState).toBe('nominal');
      expect(snapshot.isBatterySaver).toBe(false);
      expect(snapshot.isOnline).toBe(true);
      expect(snapshot.activePhase).toBe('settled');
    });

    it('classifies device tier from totalMemoryBytes', () => {
      const lowSnapshot = senseGovernor({ totalMemoryBytes: 2 * 1024 * 1024 * 1024 });
      expect(lowSnapshot.deviceTier).toBe('low');

      const highSnapshot = senseGovernor({ totalMemoryBytes: 8 * 1024 * 1024 * 1024 });
      expect(highSnapshot.deviceTier).toBe('high');
    });
  });

  describe('admitWorkCategory', () => {
    it('always admits user-critical operations', () => {
      const severeSnapshot = senseGovernor({
        pressure: 'severe',
        thermalState: 'critical',
        isBatterySaver: true,
        isOnline: false,
      });

      const result = admitWorkCategory('user-critical', severeSnapshot);
      expect(result.allowed).toBe(true);
      expect(result.reason).toBe('user-critical-unconditional');
    });

    it('defers background sync during boot phase or under pressure', () => {
      const bootSnapshot = senseGovernor({ activePhase: 'boot' });
      expect(admitWorkCategory('background-sync', bootSnapshot).allowed).toBe(false);
      expect(admitWorkCategory('background-sync', bootSnapshot).reason).toBe('deferred-during-boot');

      const pressureSnapshot = senseGovernor({ pressure: 'constrained' });
      expect(admitWorkCategory('background-sync', pressureSnapshot).allowed).toBe(false);
      expect(admitWorkCategory('background-sync', pressureSnapshot).reason).toBe('deferred-under-pressure');

      const normalSnapshot = senseGovernor();
      expect(admitWorkCategory('background-sync', normalSnapshot).allowed).toBe(true);
      expect(admitWorkCategory('background-sync', normalSnapshot).maxConcurrency).toBe(2);
    });

    it('defers media prefetch when not settled or under power conservation', () => {
      const batterySnapshot = senseGovernor({ isBatterySaver: true });
      expect(admitWorkCategory('media-prefetch', batterySnapshot).allowed).toBe(false);

      const normalSnapshot = senseGovernor();
      expect(admitWorkCategory('media-prefetch', normalSnapshot).allowed).toBe(true);
    });

    it('defers storage cleanup under severe pressure', () => {
      const severeSnapshot = senseGovernor({ pressure: 'severe' });
      expect(admitWorkCategory('storage-cleanup', severeSnapshot).allowed).toBe(false);

      const settledSnapshot = senseGovernor();
      expect(admitWorkCategory('storage-cleanup', settledSnapshot).allowed).toBe(true);
    });
  });

  describe('performanceGovernor facade', () => {
    it('exposes sense, admit, getVisualBudget, reclaimMemory, tuneQueryClient, and getHeapStats', () => {
      expect(typeof performanceGovernor.sense).toBe('function');
      expect(typeof performanceGovernor.admit).toBe('function');
      expect(typeof performanceGovernor.getVisualBudget).toBe('function');
      expect(typeof performanceGovernor.reclaimMemory).toBe('function');
      expect(typeof performanceGovernor.tuneQueryClient).toBe('function');
      expect(typeof performanceGovernor.getHeapStats).toBe('function');
    });
  });
});
