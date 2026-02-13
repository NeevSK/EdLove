/**
 * Environment Utilities Tests
 * Unit tests for temporal phase detection and reality detection
 */

import {
  getTemporalPhase,
  shouldUseDarkTheme,
  shouldUseDataSaver,
  computeEffectiveFidelity,
} from '../../context/utils';

describe('Environment Utilities', () => {
  describe('getTemporalPhase', () => {
    beforeEach(() => {
      // Save original Date
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should return "dawn" for 5 AM', () => {
      jest.setSystemTime(new Date('2026-02-13T05:30:00'));
      expect(getTemporalPhase()).toBe('dawn');
    });

    it('should return "dawn" for 7:59 AM', () => {
      jest.setSystemTime(new Date('2026-02-13T07:59:00'));
      expect(getTemporalPhase()).toBe('dawn');
    });

    it('should return "day" for 8 AM', () => {
      jest.setSystemTime(new Date('2026-02-13T08:00:00'));
      expect(getTemporalPhase()).toBe('day');
    });

    it('should return "day" for 11 AM', () => {
      jest.setSystemTime(new Date('2026-02-13T11:00:00'));
      expect(getTemporalPhase()).toBe('day');
    });

    it('should return "day" for 4:59 PM', () => {
      jest.setSystemTime(new Date('2026-02-13T16:59:00'));
      expect(getTemporalPhase()).toBe('day');
    });

    it('should return "evening" for 5 PM', () => {
      jest.setSystemTime(new Date('2026-02-13T17:00:00'));
      expect(getTemporalPhase()).toBe('evening');
    });

    it('should return "evening" for 6 PM', () => {
      jest.setSystemTime(new Date('2026-02-13T18:00:00'));
      expect(getTemporalPhase()).toBe('evening');
    });

    it('should return "evening" for 7:59 PM', () => {
      jest.setSystemTime(new Date('2026-02-13T19:59:00'));
      expect(getTemporalPhase()).toBe('evening');
    });

    it('should return "night" for 8 PM', () => {
      jest.setSystemTime(new Date('2026-02-13T20:00:00'));
      expect(getTemporalPhase()).toBe('night');
    });

    it('should return "night" for 10 PM', () => {
      jest.setSystemTime(new Date('2026-02-13T22:00:00'));
      expect(getTemporalPhase()).toBe('night');
    });

    it('should return "night" for midnight', () => {
      jest.setSystemTime(new Date('2026-02-13T00:00:00'));
      expect(getTemporalPhase()).toBe('night');
    });

    it('should return "night" for 3 AM', () => {
      jest.setSystemTime(new Date('2026-02-13T03:00:00'));
      expect(getTemporalPhase()).toBe('night');
    });
  });

  describe('shouldUseDarkTheme', () => {
    it('should return false for dawn', () => {
      expect(shouldUseDarkTheme('dawn')).toBe(false);
    });

    it('should return false for day', () => {
      expect(shouldUseDarkTheme('day')).toBe(false);
    });

    it('should return true for evening', () => {
      expect(shouldUseDarkTheme('evening')).toBe(true);
    });

    it('should return true for night', () => {
      expect(shouldUseDarkTheme('night')).toBe(true);
    });
  });

  describe('shouldUseDataSaver', () => {
    it('should return false for excellent network', () => {
      expect(shouldUseDataSaver('excellent')).toBe(false);
    });

    it('should return false for good network', () => {
      expect(shouldUseDataSaver('good')).toBe(false);
    });

    it('should return true for fair network', () => {
      expect(shouldUseDataSaver('fair')).toBe(true);
    });

    it('should return true for poor network', () => {
      expect(shouldUseDataSaver('poor')).toBe(true);
    });

    it('should return false for offline (offline saves no data)', () => {
      expect(shouldUseDataSaver('offline')).toBe(false);
    });
  });

  describe('computeEffectiveFidelity', () => {
    it('should return "low" when fidelity is explicitly set to low', () => {
      expect(computeEffectiveFidelity('low', 'high')).toBe('low');
      expect(computeEffectiveFidelity('low', 'medium')).toBe('low');
      expect(computeEffectiveFidelity('low', 'low')).toBe('low');
    });

    it('should return "high" when fidelity is explicitly set to high', () => {
      expect(computeEffectiveFidelity('high', 'high')).toBe('high');
      expect(computeEffectiveFidelity('high', 'medium')).toBe('high');
      expect(computeEffectiveFidelity('high', 'low')).toBe('high');
    });

    it('should return "low" for auto mode on low-end device', () => {
      expect(computeEffectiveFidelity('auto', 'low')).toBe('low');
    });

    it('should return "high" for auto mode on medium device', () => {
      expect(computeEffectiveFidelity('auto', 'medium')).toBe('high');
    });

    it('should return "high" for auto mode on high-end device', () => {
      expect(computeEffectiveFidelity('auto', 'high')).toBe('high');
    });
  });
});
