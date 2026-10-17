// packages/core/src/thresholds/thresholdEvaluator.ts
// Pure Mathematical Evaluator for Stratified Thresholds, Matthew Divergence & Hysteresis

import type {
  CascadeGateway,
  ThresholdCascade,
  ThresholdDefinition,
  ThresholdEvaluationResult,
} from './types';

/**
 * Computes projected Matthew Effect divergence gap over time:
 * gap(t) = initialGap * exp(lambda * t)
 */
export function calculateMatthewDivergence(
  initialGap: number,
  growthRateLambda: number,
  timePeriods: number,
): number {
  if (timePeriods <= 0 || growthRateLambda <= 0) return initialGap;
  return initialGap * Math.exp(growthRateLambda * timePeriods);
}

/**
 * Computes asymmetric hysteresis recovery cost:
 * As time past breach grows, recovery cost escalates non-linearly:
 * C(t) = C_prevention * multiplier * (1 + 0.15 * periodsPastBreach^1.5)
 */
export function calculateHysteresisRecoveryCost(
  preventionCost: number,
  hysteresisMultiplier: number,
  periodsPastBreach: number = 0,
): number {
  const baseMultiplier = Math.max(1, hysteresisMultiplier);
  if (periodsPastBreach <= 0) return preventionCost * baseMultiplier;
  const escalation = 1 + 0.15 * Math.pow(periodsPastBreach, 1.5);
  return preventionCost * baseMultiplier * escalation;
}

/**
 * Evaluates a single numeric metric against a ThresholdDefinition
 */
export function evaluateThreshold(
  threshold: ThresholdDefinition,
  currentValue: number,
): ThresholdEvaluationResult {
  const {
    criticalValue,
    direction,
    toleranceBand,
    matthewGrowthRate = 0.25,
    hysteresisMultiplier = 5,
  } = threshold;

  const isAbove = direction === 'above_breach';
  const isBreached = isAbove ? currentValue >= criticalValue : currentValue <= criticalValue;

  // Calculate safety margin percentage relative to critical value
  // Positive = safe buffer; Negative = past breach
  const delta = isAbove ? criticalValue - currentValue : currentValue - criticalValue;
  const safetyMarginPct = criticalValue !== 0 ? (delta / criticalValue) * 100 : delta * 100;

  // Determine status band
  let status: 'safe' | 'warning' | 'breached' | 'catastrophic';
  if (isBreached) {
    // If past breach by more than 20%, it is catastrophic
    const breachSeverity = isAbove
      ? (currentValue - criticalValue) / criticalValue
      : (criticalValue - currentValue) / criticalValue;
    status = breachSeverity > 0.2 ? 'catastrophic' : 'breached';
  } else {
    // Check if within tolerance warning band
    const inTolerance = currentValue >= toleranceBand.min && currentValue <= toleranceBand.max;
    status = inTolerance ? 'safe' : 'warning';
  }

  return {
    thresholdId: threshold.id,
    thresholdName: threshold.name,
    currentValue,
    criticalValue,
    isBreached,
    safetyMarginPct: Number(safetyMarginPct.toFixed(2)),
    status,
    calculateMatthewGap: (initialGap: number, timePeriods: number) =>
      calculateMatthewDivergence(initialGap, matthewGrowthRate, timePeriods),
    estimatedRecoveryCostMultiplier: isBreached ? hysteresisMultiplier : 1.0,
    convivialRecommendation: threshold.convivialIntervention,
  };
}

export interface CascadeEvaluationSummary<TStage = string> {
  cascadeId: string;
  cascadeName: string;
  domain: string;
  totalGateways: number;
  breachedCount: number;
  criticalBreaches: Array<{
    gateway: CascadeGateway<TStage>;
    result: ThresholdEvaluationResult;
  }>;
  pathDependencyRiskLevel: 'low' | 'moderate' | 'severe' | 'terminal_lock_in';
}

/**
 * Evaluates an entire interdependent cascade of threshold gateways
 */
export function evaluateCascade<TStage = string>(
  cascade: ThresholdCascade<TStage>,
  valuesByThresholdId: Record<string, number>,
): CascadeEvaluationSummary<TStage> {
  const criticalBreaches: Array<{
    gateway: CascadeGateway<TStage>;
    result: ThresholdEvaluationResult;
  }> = [];

  let breachedCount = 0;

  for (const gateway of cascade.gateways) {
    const val = valuesByThresholdId[gateway.threshold.id];
    if (val !== undefined) {
      const res = evaluateThreshold(gateway.threshold, val);
      if (res.isBreached) {
        breachedCount++;
        criticalBreaches.push({ gateway, result: res });
      }
    }
  }

  // Determine path dependency risk level based on early cascade breach
  let pathDependencyRiskLevel: 'low' | 'moderate' | 'severe' | 'terminal_lock_in' = 'low';
  if (breachedCount === 0) {
    pathDependencyRiskLevel = 'low';
  } else if (breachedCount === 1) {
    // If the earliest gateway (order 1 or 2) is breached, risk is severe because early gates compound!
    const earliestBreachedOrder = Math.min(...criticalBreaches.map((b) => b.gateway.order));
    pathDependencyRiskLevel = earliestBreachedOrder <= 2 ? 'severe' : 'moderate';
  } else {
    pathDependencyRiskLevel = 'terminal_lock_in';
  }

  return {
    cascadeId: cascade.id,
    cascadeName: cascade.name,
    domain: cascade.domain,
    totalGateways: cascade.gateways.length,
    breachedCount,
    criticalBreaches,
    pathDependencyRiskLevel,
  };
}
