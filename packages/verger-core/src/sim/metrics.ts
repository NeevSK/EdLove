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
  /** Changes of the published heat level per minute: threshold chatter. */
  readonly thermalFlipsPerMinute: number;
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
): ControlMetrics {
  const visible = ticks.filter((t) => t.visible);
  const janky = visible.filter((t) => t.costMs > t.targetMs * 1.25);
  const mean = (xs: readonly SimTick[], f: (t: SimTick) => number) =>
    xs.length === 0 ? 0 : xs.reduce((sum, t) => sum + f(t), 0) / xs.length;
  const minutes = ticks.length === 0 ? 1 : (ticks[ticks.length - 1]?.at ?? 0) / 60_000;

  let flaps = 0;
  for (const lever of levers) {
    let lastDelta = 0;
    let lastAt = Number.NEGATIVE_INFINITY;
    for (let i = 1; i < ticks.length; i += 1) {
      const now = ticks[i];
      const before = ticks[i - 1];
      if (!now || !before) continue;
      const delta = (now.levels[lever.id] ?? 0) - (before.levels[lever.id] ?? 0);
      if (delta === 0) continue;
      if (lastDelta !== 0 && Math.sign(delta) !== Math.sign(lastDelta) && now.at - lastAt < flapWindowMs)
        flaps += 1;
      lastDelta = delta;
      lastAt = now.at;
    }
  }
  let thermalFlips = 0;
  for (let i = 1; i < ticks.length; i += 1)
    if (ticks[i]?.thermal !== ticks[i - 1]?.thermal) thermalFlips += 1;

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
    thermalFlipsPerMinute: thermalFlips / minutes,
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
