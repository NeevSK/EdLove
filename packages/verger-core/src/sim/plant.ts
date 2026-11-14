import type { CapacityFacts, LeverSpec, LeverTarget, ThermalStatus, VergerSnapshot } from '../types';

/**
 * A phone, as a plant for closed-loop simulation (P1, control review). A model, not a phone:
 * every parameter is named so phase F can replace it with a fit to recordings. Evidence from the
 * simulator is G2 (model-based closed loop): it can show a controller unstable on this model and
 * a fix removing that instability; it cannot show a real phone has the same dynamics.
 */
export interface PhoneModel {
  readonly name: string;
  readonly capacity: CapacityFacts;
  /** Frame cost relative to the reference phone at full quality, cool (2 = twice as slow). */
  readonly slowness: number;
  /** The panel's native refresh rate; a cap lowers it to `capHz`. */
  readonly panelHz: number;
  readonly thermal: {
    readonly ambientC: number;
    /** First-order time constant of the phone's temperature. */
    readonly tauMs: number;
    /** Steady-state rise above ambient at full load (utilisation 1). */
    readonly risePerLoadC: number;
    /** Throttling starts here: frame cost grows by `throttlePerC` per degree above it. */
    readonly throttleFromC: number;
    readonly throttlePerC: number;
    /** Whether the OS reports thermal status (API 29) and ADPF headroom (API 30). */
    readonly reportsStatus: boolean;
    readonly reportsHeadroom: boolean;
    /**
     * Sensor noise: headroom jitters (ADPF forecasts are noisy), the battery reads a few degrees
     * below the chip, in tenths of a degree, with its own jitter. A noise-free model would hide
     * exactly the threshold chatter a controller must survive.
     */
    readonly headroomJitter: number;
    readonly batteryOffsetC: number;
    readonly batteryJitterC: number;
  };
  readonly memory: {
    readonly totalMb: number;
    /** What the app and the rest of the phone use with every memory lever at full quality. */
    readonly usedMb: number;
    readonly thresholdMb: number;
  };
}

const GIB = 1024 ** 3;

const capacity = (gb: number, sdkInt: number, rates: number[], effects: boolean): CapacityFacts => ({
  totalMemoryBytes: gb * GIB * 0.92,
  isLowRamDevice: gb <= 2,
  memoryClassMb: gb <= 3 ? 192 : 256,
  sdkInt,
  cpuCores: 8,
  refreshRateHz: Math.max(...rates),
  supportsRenderEffect: effects,
  supportsRuntimeShader: effects && sdkInt >= 33,
  refreshRatesHz: rates,
  supportsCpuHints: sdkInt >= 31,
  buildFingerprint: null,
});

/**
 * Three reference phones. Thermal constants are within the range phones show (a minute or two to
 * approach steady state; throttling from the low 40s °C); none is measured. Phase F fits them.
 */
export const SIM_PHONES = {
  low: {
    name: 'low: 3 GB, Android 9, slow, no thermal status',
    capacity: capacity(3, 28, [60], false),
    slowness: 2.2,
    panelHz: 60,
    thermal: {
      ambientC: 30,
      tauMs: 90_000,
      risePerLoadC: 16,
      throttleFromC: 40,
      throttlePerC: 0.06,
      reportsStatus: false,
      reportsHeadroom: false,
      headroomJitter: 0,
      batteryOffsetC: 2,
      batteryJitterC: 0.4,
    },
    memory: { totalMb: 2800, usedMb: 2350, thresholdMb: 220 },
  },
  mid: {
    name: 'mid: 6 GB, Android 13',
    capacity: capacity(6, 33, [60, 90], true),
    slowness: 1.3,
    panelHz: 90,
    thermal: {
      ambientC: 30,
      tauMs: 120_000,
      risePerLoadC: 14,
      throttleFromC: 41,
      throttlePerC: 0.05,
      reportsStatus: true,
      reportsHeadroom: true,
      headroomJitter: 0.03,
      batteryOffsetC: 2,
      batteryJitterC: 0.4,
    },
    memory: { totalMb: 5600, usedMb: 4300, thresholdMb: 300 },
  },
  high: {
    name: 'high: 8 GB, Android 14, 120 Hz',
    capacity: capacity(8, 34, [60, 120], true),
    slowness: 1,
    panelHz: 120,
    thermal: {
      ambientC: 30,
      tauMs: 150_000,
      risePerLoadC: 13,
      throttleFromC: 42,
      throttlePerC: 0.05,
      reportsStatus: true,
      reportsHeadroom: true,
      headroomJitter: 0.03,
      batteryOffsetC: 2,
      batteryJitterC: 0.4,
    },
    memory: { totalMb: 7400, usedMb: 5200, thresholdMb: 350 },
  },
} as const satisfies Record<string, PhoneModel>;

/** What one step of a lever does to the plant: a frame-cost factor and memory freed. */
export interface LeverEffect {
  readonly costFactorPerStep: number;
  readonly memoryMbPerStep: number;
}

/**
 * Default effects by what a lever targets, when a session does not name its own. The refresh cap
 * and forced reduced motion act through the snapshot's hardware outputs, not through levels.
 */
export function defaultEffect(lever: LeverSpec): LeverEffect {
  const factor: Record<LeverTarget, number> = {
    gpu: 0.86,
    cpu: 0.9,
    memory: 0.97,
    energy: 0.96,
    network: 1,
  };
  return {
    costFactorPerStep: lever.actuator ? 1 : factor[lever.target],
    memoryMbPerStep: lever.target === 'memory' ? 60 : 0,
  };
}

/** The plant's state between steps. */
export interface PlantState {
  readonly temperatureC: number;
}

/** What the screen asks of the phone during one step. */
export interface Demand {
  /** Frame cost at full quality on the reference phone, cool, in ms. */
  readonly baseCostMs: number;
  /** Extra CPU work (a sync, a decode burst) in ms per frame, not reducible by levers. */
  readonly extraCostMs: number;
  readonly visible: boolean;
  /** Air around the phone, if not the phone's usual ambient: a hot classroom, sun, a charger. */
  readonly ambientC?: number;
}

/** One step's truth: what the phone did, and what its sensors would say. */
export interface PlantStep {
  readonly state: PlantState;
  readonly targetMs: number;
  readonly costMs: number;
  readonly utilisation: number;
  readonly availableMb: number;
  readonly status: ThermalStatus | null;
  readonly headroom: number | null;
}

export function throttleOf(phone: PhoneModel, temperatureC: number): number {
  return 1 + Math.max(0, temperatureC - phone.thermal.throttleFromC) * phone.thermal.throttlePerC;
}

/**
 * Thermal status, consistent with headroom as the ADPF thermal guide relates them: headroom 0.85
 * "could be LIGHT", 0.95 "MODERATE or higher", 1.0 SEVERE. (An earlier model put LIGHT at
 * 1 °C below throttling, a headroom near 0.65, so status and headroom disagreed.) Critical is
 * 3 °C past severe, an assumption.
 */
export function statusOf(phone: PhoneModel, temperatureC: number): ThermalStatus | null {
  if (!phone.thermal.reportsStatus) return null;
  const { ambientC, throttleFromC } = phone.thermal;
  const at = (headroom: number) => ambientC + headroom * (throttleFromC + 5 - ambientC);
  if (temperatureC >= at(1) + 3) return 'critical';
  if (temperatureC >= at(1)) return 'severe';
  if (temperatureC >= at(0.95)) return 'moderate';
  if (temperatureC >= at(0.85)) return 'light';
  return 'none';
}

/**
 * ADPF headroom: 0 cool, 1 at the onset of severe throttling (linear, an assumption), plus
 * jitter (`jitter` in [-1, 1] from the session's generator).
 */
export function headroomOf(phone: PhoneModel, temperatureC: number, jitter = 0): number | null {
  if (!phone.thermal.reportsHeadroom) return null;
  const span = phone.thermal.throttleFromC + 5 - phone.thermal.ambientC;
  const exact = (temperatureC - phone.thermal.ambientC) / span;
  return Math.max(0.01, exact + jitter * phone.thermal.headroomJitter);
}

/** The battery's reading: below the chip, in tenths of a degree, with jitter in [-1, 1]. */
export function batteryTemperatureOf(phone: PhoneModel, temperatureC: number, jitter = 0): number {
  const reading = temperatureC - phone.thermal.batteryOffsetC + jitter * phone.thermal.batteryJitterC;
  return Math.round(reading * 10) / 10;
}

/**
 * Advances the plant by `dtMs` under the levels the policy published. `noise` is a factor near 1
 * from the session's seeded generator.
 */
export function stepPlant(
  phone: PhoneModel,
  state: PlantState,
  demand: Demand,
  snapshot: Pick<VergerSnapshot, 'levels' | 'refreshCapHz' | 'globalReducedMotion'>,
  levers: readonly LeverSpec[],
  effects: Readonly<Record<string, LeverEffect>>,
  dtMs: number,
  noise: number,
  sensorJitter = 0,
): PlantStep {
  const hz = snapshot.refreshCapHz !== null ? Math.min(phone.panelHz, snapshot.refreshCapHz) : phone.panelHz;
  const targetMs = 1000 / hz;
  let factor = snapshot.globalReducedMotion ? 0.85 : 1;
  let freedMb = 0;
  for (const lever of levers) {
    const level = snapshot.levels[lever.id] ?? 0;
    if (level === 0) continue;
    const effect = effects[lever.id] ?? defaultEffect(lever);
    factor *= effect.costFactorPerStep ** level;
    freedMb += effect.memoryMbPerStep * level;
  }
  const throttle = throttleOf(phone, state.temperatureC);
  const costMs = demand.visible
    ? (demand.baseCostMs * factor + demand.extraCostMs) * phone.slowness * throttle * noise
    : 0;
  // Utilisation of the frame budget, capped: a phone past its budget runs flat out, no hotter.
  // A capped refresh rate draws fewer frames, so the same cost per frame is less work per second.
  const utilisation = demand.visible ? Math.min(1.2, (costMs / targetMs) * (hz / phone.panelHz)) : 0.05;
  const steady = (demand.ambientC ?? phone.thermal.ambientC) + phone.thermal.risePerLoadC * utilisation;
  const alpha = 1 - Math.exp(-dtMs / phone.thermal.tauMs);
  const temperatureC = state.temperatureC + (steady - state.temperatureC) * alpha;
  const availableMb = phone.memory.totalMb - phone.memory.usedMb + freedMb;
  return {
    state: { temperatureC },
    targetMs,
    costMs,
    utilisation,
    availableMb,
    status: statusOf(phone, temperatureC),
    headroom: headroomOf(phone, temperatureC, sensorJitter),
  };
}
