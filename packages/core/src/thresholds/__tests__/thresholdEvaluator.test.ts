// packages/core/src/thresholds/__tests__/thresholdEvaluator.test.ts
// G1 Deterministic Verification Suite for Universal Threshold Engine

import { describe, expect, it } from 'vitest';
import {
  calculateHysteresisRecoveryCost,
  calculateMatthewDivergence,
  evaluateCascade,
  evaluateThreshold,
} from '../thresholdEvaluator';
import type { ThresholdCascade, ThresholdDefinition } from '../types';

describe('Threshold Mathematical Engine', () => {
  describe('calculateMatthewDivergence', () => {
    it('returns initial gap when time periods is 0', () => {
      expect(calculateMatthewDivergence(10, 0.25, 0)).toBe(10);
    });

    it('returns initial gap when lambda is 0 or negative', () => {
      expect(calculateMatthewDivergence(10, 0, 4)).toBe(10);
      expect(calculateMatthewDivergence(10, -0.1, 4)).toBe(10);
    });

    it('compounds gap exponentially over time periods', () => {
      const initialGap = 10;
      const lambda = 0.5;
      const t = 2; // e^(0.5 * 2) = e^1 ≈ 2.71828
      const result = calculateMatthewDivergence(initialGap, lambda, t);
      expect(result).toBeCloseTo(10 * Math.E, 2);
    });
  });

  describe('calculateHysteresisRecoveryCost', () => {
    it('applies base multiplier when periods past breach is 0', () => {
      const preventionCost = 1000;
      const hysteresisMultiplier = 5;
      const cost = calculateHysteresisRecoveryCost(preventionCost, hysteresisMultiplier, 0);
      expect(cost).toBe(5000);
    });

    it('escalates recovery cost non-linearly as time past breach increases', () => {
      const preventionCost = 1000;
      const hysteresisMultiplier = 5;
      const immediateBreach = calculateHysteresisRecoveryCost(
        preventionCost,
        hysteresisMultiplier,
        0,
      );
      const delayedBreach = calculateHysteresisRecoveryCost(
        preventionCost,
        hysteresisMultiplier,
        4,
      );
      // At t=4, 4^1.5 = 8; 1 + 0.15 * 8 = 2.2; cost = 1000 * 5 * 2.2 = 11,000
      expect(delayedBreach).toBeGreaterThan(immediateBreach);
      expect(delayedBreach).toBeCloseTo(11000, 0);
    });
  });

  describe('evaluateThreshold', () => {
    const classroomDensityThreshold: ThresholdDefinition = {
      id: 'T_CLASSROOM_DENSITY',
      name: 'Classroom Room Density',
      domain: 'education',
      stratum: 'real',
      cynefin: 'complex',
      criticalValue: 35,
      toleranceBand: { min: 20, max: 30 },
      direction: 'above_breach',
      transitionType: 'bifurcation',
      matthewGrowthRate: 0.3,
      hysteresisMultiplier: 8,
      consequenceDescription:
        'Teacher relational contact drops below viable threshold; lecture crowd control mandatory.',
      convivialIntervention: 'Cap room at 28; introduce co-teaching or split sessions.',
    };

    it('reports safe when within tolerance band', () => {
      const result = evaluateThreshold(classroomDensityThreshold, 25);
      expect(result.isBreached).toBe(false);
      expect(result.status).toBe('safe');
      expect(result.safetyMarginPct).toBeGreaterThan(0);
    });

    it('reports warning when outside optimal tolerance but below critical value', () => {
      const result = evaluateThreshold(classroomDensityThreshold, 33);
      expect(result.isBreached).toBe(false);
      expect(result.status).toBe('warning');
    });

    it('reports breached when crossing critical value', () => {
      const result = evaluateThreshold(classroomDensityThreshold, 38);
      expect(result.isBreached).toBe(true);
      expect(result.status).toBe('breached');
      expect(result.safetyMarginPct).toBeLessThan(0);
      expect(result.estimatedRecoveryCostMultiplier).toBe(8);
    });

    it('reports catastrophic when more than 20% past critical value', () => {
      // 35 * 1.2 = 42; 48 is > 20% past breach
      const result = evaluateThreshold(classroomDensityThreshold, 48);
      expect(result.isBreached).toBe(true);
      expect(result.status).toBe('catastrophic');
    });

    it('correctly evaluates below_breach thresholds like caloric midday meal', () => {
      const caloricFloor: ThresholdDefinition = {
        id: 'T_CALORIC_FLOOR',
        name: 'School Midday Meal Caloric Floor',
        domain: 'nutrition',
        stratum: 'real',
        cynefin: 'clear',
        criticalValue: 400,
        toleranceBand: { min: 450, max: 700 },
        direction: 'below_breach',
        transitionType: 'phase_change',
        hysteresisMultiplier: 12,
        consequenceDescription:
          'Glucose supply to prefrontal cortex collapses; working memory down 40%.',
        convivialIntervention: 'Deliver hot cooked midday meal with boiled egg.',
      };

      const safeMeal = evaluateThreshold(caloricFloor, 500);
      expect(safeMeal.isBreached).toBe(false);
      expect(safeMeal.status).toBe('safe');

      const starvedMeal = evaluateThreshold(caloricFloor, 250);
      expect(starvedMeal.isBreached).toBe(true);
      expect(starvedMeal.status).toBe('catastrophic');
    });
  });

  describe('evaluateCascade', () => {
    const testCascade: ThresholdCascade = {
      id: 'CASCADE_LIFE_CHANCES',
      name: 'Life Chances Developmental Cascade',
      domain: 'education',
      gateways: [
        {
          order: 1,
          stage: 'grade_4',
          threshold: {
            id: 'T_GRADE_4_READING',
            name: 'Grade 4 Reading Automaticity',
            domain: 'cognitive',
            stratum: 'real',
            cynefin: 'complex',
            criticalValue: 60,
            toleranceBand: { min: 65, max: 100 },
            direction: 'below_breach',
            transitionType: 'matthew_divergence',
            consequenceDescription: 'Cannot read to learn; academic disengagement.',
            convivialIntervention: 'Story reading circles.',
          },
          pathDependencyLockInRisk: 'Severe Matthew divergence locking out secondary STEM.',
        },
        {
          order: 2,
          stage: 'grade_5',
          threshold: {
            id: 'T_GRADE_5_SORTING',
            name: 'Grade 5 Scholarship Cutoff',
            domain: 'institutional',
            stratum: 'empirical',
            cynefin: 'complicated',
            criticalValue: 150,
            toleranceBand: { min: 150, max: 200 },
            direction: 'below_breach',
            transitionType: 'bifurcation',
            consequenceDescription: 'Sorted into under-resourced Type 2/3 rural school.',
            convivialIntervention: 'Provide regional resource hub.',
          },
          pathDependencyLockInRisk: 'No A/L science teachers in school.',
        },
      ],
    };

    it('returns low risk when no thresholds are breached', () => {
      const summary = evaluateCascade(testCascade, {
        T_GRADE_4_READING: 75,
        T_GRADE_5_SORTING: 165,
      });
      expect(summary.breachedCount).toBe(0);
      expect(summary.pathDependencyRiskLevel).toBe('low');
    });

    it('returns severe risk when early gateway is breached', () => {
      const summary = evaluateCascade(testCascade, {
        T_GRADE_4_READING: 45, // Breached at Grade 4!
        T_GRADE_5_SORTING: 155,
      });
      expect(summary.breachedCount).toBe(1);
      expect(summary.pathDependencyRiskLevel).toBe('severe');
    });

    it('returns terminal lock-in when multiple cascade thresholds are breached', () => {
      const summary = evaluateCascade(testCascade, {
        T_GRADE_4_READING: 40,
        T_GRADE_5_SORTING: 120,
      });
      expect(summary.breachedCount).toBe(2);
      expect(summary.pathDependencyRiskLevel).toBe('terminal_lock_in');
    });
  });
});
