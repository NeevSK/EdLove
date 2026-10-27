import type { VergerActivation } from '../activation';
import type { VergerPolicy } from '../policy';
import type { LeverSpec } from '../types';
import { type ClosedLoopOptions, runClosedLoop, type SimSession, type SimTick } from './closedLoop';
import type { LeverEffect, PhoneModel } from './plant';

/**
 * A closed-loop run judged as a control engineer would (P2), on the plant's truth, not on what
 * verger believed: how much jank got through, what quality it cost, whether the controller
 * oscillated, how fast it settled after a disturbance, and how hot the phone got.
 */
export interface ControlMetrics {
  /** Share of visible steps with frames over 1.25 times their budget. */
  readonly jankShare: number;
  /** Mean quality given up (0 full, 1 every lever at its cheapest) over visible steps. */
  readonly qualityGivenUp: number;
  /** Mean quality given up over the janky steps: effort spent where it did not prevent jank. */
  readonly qualityWhileJanking: number;
  /** A lever moving against its previous move within `flapWindowMs`, per minute: oscillation. */
  readonly flapsPerMinute: number;
  /**
   * Sustained reversals within `slowWindowMs` (5 minutes): a lever reversing a reversal (down, up,
   * down again) on the scale of the phone's thermal time constant, the signature of a thermal limit
   * cycle (lower under heat, cool, lift, heat again). One lowering given back is not counted.
   */
  readonly slowReversalsPerMinute: number;
  /** Changes of the published heat level per minute, the first reading aside: threshold chatter. */
  readonly thermalFlipsPerMinute: number;
  /**
   * Of those, changes the plant does not explain: the true temperature moved less than
   * `chatterDeltaC` since the previous change. Heat following a real load is not chatter; a
   * level flipping on sensor noise or quantisation is.
   */
  readonly thermalChatterPerMinute: number;
  readonly peakTemperatureC: number;
  /** Time at or above the phone's throttling onset plus 2 °C (moderate throttling). */
  readonly hotMs: number;
  /**
   * After each disturbance ends, how long until quality given up is back within 0.02 of what it
   * was before the disturbance began; the worst over the session. Infinity if it never was. A
   * disturbance that runs to the end of the session is not measured.
   */
  readonly settlingMs: number;
}

export function controlMetrics(
  ticks: readonly SimTick[],
  phone: PhoneModel,
  levers: readonly LeverSpec[],
  flapWindowMs = 30_000,
  chatterDeltaC = 0.5,
  slowWindowMs = 300_000,
): ControlMetrics {
  const visible = ticks.filter((t) => t.visible);
  const janky = visible.filter((t) => t.costMs > t.targetMs * 1.25);
  const mean = (xs: readonly SimTick[], f: (t: SimTick) => number) =>
    xs.length === 0 ? 0 : xs.reduce((sum, t) => sum + f(t), 0) / xs.length;
  const minutes = ticks.length === 0 ? 1 : (ticks[ticks.length - 1]?.at ?? 0) / 60_000;

  /**
   * Moves of a lever against its previous move within `windowMs`. With `sustained`, only a
   * reversal of a reversal counts (down, up, down again): the shape of an oscillation, where a
   * single lower-then-give-back is ordinary disturbance rejection.
   */
  const reversals = (windowMs: number, sustained: boolean) => {
    let count = 0;
    for (const lever of levers) {
      let lastDelta = 0;
      let lastAt = Number.NEGATIVE_INFINITY;
      let lastWasReversal = false;
      for (let i = 1; i < ticks.length; i += 1) {
        const now = ticks[i];
        const before = ticks[i - 1];
        if (!now || !before) continue;
        const delta = (now.levels[lever.id] ?? 0) - (before.levels[lever.id] ?? 0);
        if (delta === 0) continue;
        const reversal = lastDelta !== 0 && Math.sign(delta) !== Math.sign(lastDelta) && now.at - lastAt < windowMs;
        if (reversal && (!sustained || lastWasReversal)) count += 1;
        lastWasReversal = reversal;
        lastDelta = delta;
        lastAt = now.at;
      }
    }
    return count;
  };
  const flaps = reversals(flapWindowMs, false);
  const slowReversals = reversals(slowWindowMs, true);
  let thermalFlips = 0;
  let thermalChatter = 0;
  let lastChangeC: number | null = null;
  // Leaving unknown is the first reading (or a sensor heard again), not chatter.
  for (let i = 1; i < ticks.length; i += 1) {
    const was = ticks[i - 1]?.thermal;
    const now = ticks[i];
    if (!now || now.thermal === was) continue;
    if (was !== 'unknown') {
      thermalFlips += 1;
      if (lastChangeC !== null && Math.abs(now.temperatureC - lastChangeC) < chatterDeltaC) thermalChatter += 1;
    }
    lastChangeC = now.temperatureC;
  }

  const step = ticks.length > 1 ? (ticks[1]?.at ?? 0) - (ticks[0]?.at ?? 0) : 0;
  const hotFrom = phone.thermal.throttleFromC + 2;
  const hotMs = ticks.filter((t) => t.temperatureC >= hotFrom).length * step;

  let settlingMs = 0;
  for (let i = 0; i < ticks.length; i += 1) {
    const tick = ticks[i];
    if (!tick?.disturbance || ticks[i - 1]?.disturbance) continue;
    // A disturbance that opens the session is measured against its first reading (the floors).
    const before = (ticks[i - 1] ?? tick).qualityCost;
    let end = i;
    while (ticks[end]?.disturbance) end += 1;
    if (end >= ticks.length) continue;
    const endAt = ticks[end - 1]?.at ?? tick.at;
    let settled = Number.POSITIVE_INFINITY;
    for (let j = end; j < ticks.length; j += 1) {
      const t = ticks[j];
      if (t && t.qualityCost <= before + 0.02) {
        settled = t.at - endAt;
        break;
      }
    }
    settlingMs = Math.max(settlingMs, settled);
  }

  return {
    jankShare: visible.length === 0 ? 0 : janky.length / visible.length,
    qualityGivenUp: mean(visible, (t) => t.qualityCost),
    qualityWhileJanking: mean(janky, (t) => t.qualityCost),
    flapsPerMinute: flaps / minutes,
    slowReversalsPerMinute: slowReversals / minutes,
    thermalFlipsPerMinute: thermalFlips / minutes,
    thermalChatterPerMinute: thermalChatter / minutes,
    peakTemperatureC: Math.max(...ticks.map((t) => t.temperatureC)),
    hotMs,
    settlingMs,
  };
}

/** A policy as the closed loop runs it: its rules and what it may do. */
export interface SimArm {
  readonly policy: VergerPolicy;
  readonly activation: VergerActivation;
}

/**
 * Loop 3's comparison with effects (P2): each arm runs closed loop on the same phone, session and
 * seed, so a lowered lever really makes the next frames cheaper. Unlike `comparePolicies`
 * (open loop), this judges what a policy does to the phone, on the model.
 */
export function compareClosedLoop(options: {
  readonly phone: PhoneModel;
  readonly session: SimSession;
  readonly levers: readonly LeverSpec[];
  readonly arms: Readonly<Record<string, SimArm>>;
  readonly effects?: Readonly<Record<string, LeverEffect>>;
  readonly seed?: number;
}): Record<string, ControlMetrics> {
  const out: Record<string, ControlMetrics> = {};
  for (const [name, arm] of Object.entries(options.arms)) {
    const run: ClosedLoopOptions = {
      phone: options.phone,
      session: options.session,
      levers: options.levers,
      policy: arm.policy,
      activation: arm.activation,
      effects: options.effects,
      seed: options.seed,
    };
    out[name] = controlMetrics(runClosedLoop(run).ticks, options.phone, options.levers);
  }
  return out;
}
