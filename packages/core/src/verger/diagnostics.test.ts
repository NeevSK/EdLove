import type { VergerSnapshot } from '@repo/verger-core';
import { describe, expect, it } from 'vitest';
import { diagnoseVerger } from './gurudeviDiagnostics';

const healthySnapshot: VergerSnapshot = {
  version: 1,
  levels: {},
  proposedLevels: {},
  envelope: {},
  frameState: 'quiet',
  thermal: 'nominal',
  thermalProjected: 'nominal',
  memory: 'normal',
  storage: 'ample',
  battery: 'nominal',
  networkLimit: 'ample',
  capacityClass: 'high',
  effectiveFidelity: 'high',
  optionalConcurrency: 2,
  gains: {},
  ineffective: [],
  dataBudget: 'ample',
};

describe('VergerSystemDiagnosis (MSI System Diagnosis synthesis)', () => {
  it('diagnoses a calm running system as healthy with nominal recommendations', () => {
    const diagnosis = diagnoseVerger(healthySnapshot, { rung: 0, scenario: 'auto' });
    expect(diagnosis.health).toBe('healthy');
    expect(diagnosis.running).toBe(true);
    expect(diagnosis.recoveryRung).toBe(0);
    expect(diagnosis.scenario).toBe('auto');
    expect(diagnosis.strainedAccounts).toEqual([]);
    expect(diagnosis.sensors.thermal).toBe('reporting');
    expect(diagnosis.sensors.storage).toBe('reporting');
    expect(diagnosis.recommendations[0]).toContain('subsystems nominal');
  });

  it('marks health as critical and highlights fail-safe floors when rung is 4', () => {
    const diagnosis = diagnoseVerger(null, { rung: 4 });
    expect(diagnosis.health).toBe('critical');
    expect(diagnosis.running).toBe(false);
    expect(diagnosis.recoveryRung).toBe(4);
    expect(diagnosis.recommendations[0]).toContain('kill switch');
  });

  it('detects thermal and memory strain and generates targeted recommendations', () => {
    const strainedSnapshot: VergerSnapshot = {
      ...healthySnapshot,
      thermal: 'hot',
      memory: 'low',
    };
    const diagnosis = diagnoseVerger(strainedSnapshot, { rung: 0, scenario: 'auto' });
    expect(diagnosis.health).toBe('critical');
    expect(diagnosis.strainedAccounts).toContain('thermal');
    expect(diagnosis.strainedAccounts).toContain('memory');
    expect(diagnosis.recommendations.some((r) => r.includes('Thermal headroom'))).toBe(true);
    expect(diagnosis.recommendations.some((r) => r.includes('Memory pressure'))).toBe(true);
  });

  it('detects deaf sensors when reported as unknown', () => {
    const deafSnapshot: VergerSnapshot = {
      ...healthySnapshot,
      thermal: 'unknown',
      storage: 'unknown',
    };
    const diagnosis = diagnoseVerger(deafSnapshot);
    expect(diagnosis.sensors.thermal).toBe('deaf');
    expect(diagnosis.sensors.storage).toBe('deaf');
    expect(diagnosis.recommendations.some((r) => r.includes('Thermal sensor deaf'))).toBe(true);
  });

  it('surfaces active scenario intent in recommendations', () => {
    const examDiagnosis = diagnoseVerger(healthySnapshot, { scenario: 'exam' });
    expect(examDiagnosis.health).toBe('warning');
    expect(examDiagnosis.scenario).toBe('exam');
    expect(examDiagnosis.recommendations.some((r) => r.includes('Classroom Exam'))).toBe(true);

    const powerCutDiagnosis = diagnoseVerger(healthySnapshot, { scenario: 'power-cut' });
    expect(powerCutDiagnosis.scenario).toBe('power-cut');
    expect(powerCutDiagnosis.recommendations.some((r) => r.includes('Power-Cut'))).toBe(true);
  });
});

