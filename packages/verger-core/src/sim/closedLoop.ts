import type { VergerActivation } from '../activation';
import type { VergerPolicy } from '../policy';
import { qualityCost } from '../quality';
import type { FrameState, LeverSpec, ThermalLevel, VergerEvent, VergerSnapshot } from '../types';
import { batteryTemperatureOf, type LeverEffect, type PhoneModel, type PlantState, stepPlant } from './plant';

/** One stretch of a scripted session: what the screen asks and what the user does. */
export interface SessionSegment {
  readonly durationMs: number;
  /** Frame cost at full quality on the reference phone, cool, in ms. */
  readonly baseCostMs: number;
  /** Work levers cannot reduce (a sync, a decode burst), ms per frame. */
  readonly extraCostMs?: number;
  readonly touching?: boolean;
  readonly scrolling?: boolean;
  /** False: the app is in the background for this stretch. */
  readonly visible?: boolean;
  /** Marks a disturbance, so settling after it can be measured. */
  readonly disturbance?: boolean;
}

export interface SimSession {
  readonly name: string;
  readonly segments: readonly SessionSegment[];
}

const min = 60_000;

/**
 * Reference sessions. Costs are on the reference (high) phone at full quality: 6 ms is a calm
 * list, 12 ms a rich animated screen; the low phone is 2.2 times slower.
 */
export const SIM_SESSIONS = {
  classroom: {
    name: 'classroom: lists, detail, reading, a sync',
    segments: [
      { durationMs: 2 * min, baseCostMs: 6, touching: true, scrolling: true },
      { durationMs: 1 * min, baseCostMs: 9, touching: true },
      { durationMs: 3 * min, baseCostMs: 5 },
      { durationMs: 1 * min, baseCostMs: 6, extraCostMs: 4, touching: true, disturbance: true },
      { durationMs: 3 * min, baseCostMs: 6, touching: true, scrolling: true },
    ],
  },
  heatSoak: {
    name: 'heat soak: a rich screen in use for 12 minutes, then reading',
    segments: [
      { durationMs: 12 * min, baseCostMs: 12, touching: true, disturbance: true },
      // Reading still taps now and then: the screen stays awake, so recovery is measurable.
      { durationMs: 8 * min, baseCostMs: 5, touching: true },
    ],
  },
  boundary: {
    name: 'boundary: a load that holds the phone near its first heat threshold',
    segments: [{ durationMs: 20 * min, baseCostMs: 8, touching: true }],
  },
  burst: {
    name: 'burst: a calm screen with a heavy decode burst every two minutes',
    segments: Array.from({ length: 5 }, () => [
      { durationMs: 1.5 * min, baseCostMs: 5, touching: true },
      { durationMs: 0.5 * min, baseCostMs: 5, extraCostMs: 10, touching: true, disturbance: true },
    ]).flat(),
  },
} as const satisfies Record<string, SimSession>;

/** One 500 ms step of a closed-loop run: the plant's truth and what verger published. */
export interface SimTick {
  readonly at: number;
  readonly segment: number;
  readonly costMs: number;
  readonly targetMs: number;
  readonly temperatureC: number;
  readonly visible: boolean;
  readonly disturbance: boolean;
  readonly levels: Readonly<Record<string, number>>;
  readonly qualityCost: number;
  readonly frameState: FrameState;
  readonly thermal: ThermalLevel;
}

export interface ClosedLoopOptions {
  readonly phone: PhoneModel;
  readonly session: SimSession;
  readonly policy: VergerPolicy;
  readonly levers: readonly LeverSpec[];
  readonly activation: VergerActivation;
  readonly effects?: Readonly<Record<string, LeverEffect>>;
  /** Seeds the frame-cost noise; the same seed gives the same run. */
  readonly seed?: number;
  readonly stepMs?: number;
}

/** mulberry32: a small seeded generator, so a run is reproducible. */
function seeded(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Runs `policy` against `phone` through `session`, closing the loop: each step the plant answers
 * the levels verger last published, and verger hears what its sensors would report. Deterministic
 * for a seed.
 */
export function runClosedLoop(options: ClosedLoopOptions): { readonly ticks: SimTick[]; readonly final: VergerSnapshot } {
  const { phone, session, policy, levers } = options;
  const stepMs = options.stepMs ?? 500;
  const random = seeded(options.seed ?? 1);
  const effects = options.effects ?? {};
  let state = policy.create({
    at: 0,
    levers,
    capacity: phone.capacity,
    memorySensing: true,
    activation: options.activation,
  });
  let snapshot = policy.snapshot(state);
  let plant: PlantState = { temperatureC: phone.thermal.ambientC + 2 };
  let visible = true;
  const ticks: SimTick[] = [];
  const reduce = (event: VergerEvent) => {
    state = policy.reduce(state, event);
  };

  let at = 0;
  for (const [index, segment] of session.segments.entries()) {
    const end = at + segment.durationMs;
    const segmentVisible = segment.visible ?? true;
    for (; at < end; at += stepMs) {
      const now = at + stepMs;
      if (segmentVisible !== visible) {
        visible = segmentVisible;
        reduce({ type: 'app-state', at: now - stepMs + 1, state: visible ? 'active' : 'background' });
      }
      if (segment.touching && now % 1000 === 0) reduce({ type: 'interaction', at: now - 2 });
      if (segment.scrolling && now % 1000 === 0) reduce({ type: 'scroll', at: now - 1, active: true });
      const noise = 0.92 + random() * 0.16;
      const jitter = random() * 2 - 1;
      const step = stepPlant(
        phone,
        plant,
        { baseCostMs: segment.baseCostMs, extraCostMs: segment.extraCostMs ?? 0, visible },
        snapshot,
        levers,
        effects,
        stepMs,
        noise,
        jitter,
      );
      plant = step.state;
      if (visible) {
        const over = Math.max(0, step.costMs - step.targetMs);
        reduce({
          type: 'frame-window',
          at: now,
          window: {
            startMs: now - stepMs,
            endMs: now,
            frames: Math.max(1, Math.round(stepMs / Math.max(step.targetMs, step.costMs))),
            averageMs: step.costMs,
            targetMs: step.targetMs,
            worstMs: step.costMs * 1.8,
            droppedRatio: step.costMs > 0 ? Math.min(1, over / step.costMs) : 0,
          },
        });
      }
      if (now % 10_000 === 0) {
        if (phone.thermal.reportsStatus)
          reduce({ type: 'thermal', at: now, status: step.status, headroom: step.headroom });
        reduce({
          type: 'memory-state',
          at: now,
          availableMb: step.availableMb,
          thresholdMb: phone.memory.thresholdMb,
          lowMemory: step.availableMb < phone.memory.thresholdMb,
        });
      }
      // The battery: the fallback witness of heat where the OS reports no status.
      if (now % 30_000 === 0)
        reduce({
          type: 'battery',
          at: now,
          levelPercent: 80,
          pluggedIn: false,
          temperatureC: batteryTemperatureOf(phone, plant.temperatureC, jitter),
        });
      reduce({ type: 'tick', at: now });
      snapshot = policy.snapshot(state);
      ticks.push({
        at: now,
        segment: index,
        costMs: step.costMs,
        targetMs: step.targetMs,
        temperatureC: plant.temperatureC,
        visible,
        disturbance: segment.disturbance ?? false,
        levels: snapshot.levels,
        qualityCost: qualityCost(snapshot.levels, levers),
        frameState: snapshot.frameState,
        thermal: snapshot.thermal,
      });
    }
  }
  return { ticks, final: snapshot };
}
