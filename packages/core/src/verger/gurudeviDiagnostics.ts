import type { ResourceAccount, VergerSnapshot } from '@repo/verger-core';
import type { GurudeviScenario } from './gurudeviScenarios';

/**
 * High-level system diagnosis representation inspired by MSI Center Pro's System Diagnosis.
 * Evaluates the runtime regulator's active state, sensor responsiveness, and resource strain
 * into actionable health indicators suitable for production support and field diagnostics.
 */

export type DiagnosisHealth = 'healthy' | 'warning' | 'critical';

export interface SensorStatus {
  readonly frames: 'reporting' | 'deaf' | 'off';
  readonly thermal: 'reporting' | 'deaf' | 'off';
  readonly battery: 'reporting' | 'deaf' | 'off';
  readonly network: 'reporting' | 'deaf' | 'off';
  readonly storage: 'reporting' | 'deaf' | 'off';
}

export interface VergerSystemDiagnosis {
  readonly health: DiagnosisHealth;
  readonly recoveryRung: number;
  readonly running: boolean;
  readonly scenario: GurudeviScenario;
  readonly sensors: SensorStatus;
  readonly strainedAccounts: readonly ResourceAccount[];
  readonly recommendations: readonly string[];
  readonly timestamp: number;
}

export interface DiagnoseVergerOptions {
  readonly rung?: number;
  readonly scenario?: GurudeviScenario;
  readonly running?: boolean;
}

/**
 * Pure evaluation of Verger runtime health from a snapshot and operational context.
 */
export function diagnoseVerger(
  snapshot: VergerSnapshot | null,
  options: DiagnoseVergerOptions = {},
): VergerSystemDiagnosis {
  const rung = options.rung ?? 0;
  const running = options.running ?? (snapshot !== null);
  const scenario = options.scenario ?? 'auto';
  const recommendations: string[] = [];

  if (!snapshot || !running) {
    return {
      health: rung >= 4 ? 'critical' : 'warning',
      recoveryRung: rung,
      running: false,
      scenario,
      sensors: {
        frames: 'off',
        thermal: 'off',
        battery: 'off',
        network: 'off',
        storage: 'off',
      },
      strainedAccounts: [],
      recommendations: [
        rung >= 4
          ? 'Runtime halted on recovery rung 4 (fail-safe kill switch engaged). App operating on static floors.'
          : 'Verger regulator is idle or initializing.',
      ],
      timestamp: Date.now(),
    };
  }

  // 1. Evaluate Sensor Statuses from Snapshot Readings
  const sensors: SensorStatus = {
    frames: snapshot.frameState === 'quiet' ? 'reporting' : snapshot.frameState === 'stressed' ? 'reporting' : 'reporting',
    thermal: snapshot.thermal === 'unknown' ? 'deaf' : 'reporting',
    battery: snapshot.battery.levelPercent === null ? 'deaf' : 'reporting',
    network: snapshot.networkLimit === 'offline' ? 'reporting' : 'reporting',
    storage: snapshot.storage === 'unknown' ? 'deaf' : 'reporting',
  };

  // 2. Identify Strained Resource Accounts
  const strainedAccounts: ResourceAccount[] = [];
  if (snapshot.frameState === 'stressed') {
    strainedAccounts.push('gpu', 'cpu');
  }
  if (snapshot.thermal === 'hot' || snapshot.thermal === 'critical') {
    strainedAccounts.push('thermal');
  }
  if (snapshot.memory === 'low') {
    strainedAccounts.push('memory');
  }
  if (snapshot.battery.levelPercent !== null && snapshot.battery.levelPercent <= 20 && !snapshot.battery.pluggedIn) {
    strainedAccounts.push('energy');
  }
  if (snapshot.networkLimit === 'slow' || snapshot.networkLimit === 'unstable') {
    strainedAccounts.push('network');
  }
  if (snapshot.storage === 'low') {
    strainedAccounts.push('storage');
  }

  // 3. Synthesize Health Rating & Recommendations
  let health: DiagnosisHealth = 'healthy';
  if (rung >= 3 || snapshot.thermal === 'critical' || snapshot.memory === 'low') {
    health = 'critical';
  } else if (rung > 0 || strainedAccounts.length > 0 || scenario !== 'auto') {
    health = 'warning';
  }

  if (scenario === 'exam') {
    recommendations.push('Classroom Exam scenario active: animations, haptics and sounds are silenced.');
  } else if (scenario === 'power-cut') {
    recommendations.push('Power-Cut scenario active: 60Hz display refresh cap and flat tints engaged to preserve battery.');
  } else if (scenario === 'low-data') {
    recommendations.push('Field Low-Data scenario active: background asset prefetch halted.');
  }

  if (strainedAccounts.includes('thermal')) {
    recommendations.push('Thermal headroom is constrained; closed-loop heat pacing and frame throttling active.');
  }
  if (strainedAccounts.includes('memory')) {
    recommendations.push('Memory pressure detected; image caches trimmed and virtual draw distances reduced.');
  }
  if (sensors.thermal === 'deaf') {
    recommendations.push('Thermal sensor deaf: platform does not report hardware thermal headroom.');
  }

  if (recommendations.length === 0) {
    recommendations.push('All subsystems nominal. Closed-loop regulator operating within comfortable headroom.');
  }

  return {
    health,
    recoveryRung: rung,
    running: true,
    scenario,
    sensors,
    strainedAccounts,
    recommendations,
    timestamp: Date.now(),
  };
}

