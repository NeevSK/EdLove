import { describe, expect, it } from 'vitest';
import { experienceOf } from './experience';
import { GURUDEVI_LEVERS } from './gurudeviLevers';
import {
  activationPatchForScenario,
  GURUDEVI_SCENARIOS,
  isGurudeviScenario,
  SCENARIO_METADATA,
} from './gurudeviScenarios';
import { resolveVergerLaunch, type VergerLaunchInputs } from './launch';

const baseLaunch: VergerLaunchInputs = {
  override: undefined,
  buildMode: undefined,
  buildPreset: 'lab',
  remotePatch: undefined,
  dev: true,
  levers: GURUDEVI_LEVERS,
};

const mockSnapshot = {
  levels: {
    'ambient-motion': 0,
    transitions: 0,
    blur: 0,
    particles: 0,
    prefetch: 0,
    'image-cache': 0,
    'image-decode': 0,
    'loading-shimmer': 0,
    'list-window': 0,
  },
  capacityClass: 'high' as const,
};

describe('Gurudevi operational scenarios (MSI User Scenario synthesis)', () => {
  it('covers all intended operational scenarios with valid metadata', () => {
    expect(GURUDEVI_SCENARIOS).toEqual(['auto', 'exam', 'power-cut', 'low-data']);
    for (const id of GURUDEVI_SCENARIOS) {
      expect(isGurudeviScenario(id)).toBe(true);
      expect(SCENARIO_METADATA[id].id).toBe(id);
      expect(SCENARIO_METADATA[id].title.length).toBeGreaterThan(0);
      expect(SCENARIO_METADATA[id].description.length).toBeGreaterThan(0);
    }
    expect(isGurudeviScenario('unknown-scenario')).toBe(false);
    expect(isGurudeviScenario(null)).toBe(false);
    expect(isGurudeviScenario(123)).toBe(false);
  });

  describe('activation patches per scenario', () => {
    it('auto has an empty patch preserving normal closed loop', () => {
      expect(activationPatchForScenario('auto')).toEqual({});
    });

    it('exam guards deferrable admission', () => {
      expect(activationPatchForScenario('exam')).toEqual({ admission: 'shadow' });
    });

    it('power-cut engages hardware refresh caps and guards admission', () => {
      expect(activationPatchForScenario('power-cut')).toEqual({
        hardware: true,
        admission: 'shadow',
      });
    });

    it('low-data guards deferrable admission', () => {
      expect(activationPatchForScenario('low-data')).toEqual({ admission: 'shadow' });
    });
  });

  describe('resolveVergerLaunch with scenarios', () => {
    it('defaults to auto when no scenario is provided', () => {
      const launch = resolveVergerLaunch(baseLaunch);
      expect(launch.scenario).toBe('auto');
      expect(launch.source).toBe('lab');
    });

    it('applies exam scenario to activation and records in source', () => {
      const launch = resolveVergerLaunch({ ...baseLaunch, scenario: 'exam' });
      expect(launch.scenario).toBe('exam');
      expect(launch.source).toContain('scenario:exam');
      expect(launch.activation?.admission).toBe('shadow');
    });

    it('applies power-cut scenario with hardware caps enabled', () => {
      const launch = resolveVergerLaunch({ ...baseLaunch, scenario: 'power-cut' });
      expect(launch.scenario).toBe('power-cut');
      expect(launch.source).toContain('scenario:power-cut');
      expect(launch.activation?.hardware).toBe(true);
      expect(launch.activation?.admission).toBe('shadow');
    });

    it('gracefully falls back to auto on unknown scenario string', () => {
      const launch = resolveVergerLaunch({ ...baseLaunch, scenario: 'not-a-scenario' });
      expect(launch.scenario).toBe('auto');
      expect(launch.source).toBe('lab');
    });
  });

  describe('experienceOf with scenarios', () => {
    const baseSettings = { fidelity: 'high' as const };

    it('auto leaves high fidelity experience untouched at level 0', () => {
      const exp = experienceOf(mockSnapshot, { ...baseSettings, scenario: 'auto' });
      expect(exp.allowRichAnimation).toBe(true);
      expect(exp.allowBlur).toBe(true);
      expect(exp.allowShimmer).toBe(true);
      expect(exp.shouldPrefetchAssets).toBe(true);
      expect(exp.maxCelebrationParticles).toBe(200);
      expect(exp.experience.sound).toBe('essential');
      expect(exp.experience.haptics).toBe('refined');
    });

    it('exam scenario stills ambient motion, silences sound/haptics, and halts prefetch', () => {
      const exp = experienceOf(mockSnapshot, { ...baseSettings, scenario: 'exam' });
      expect(exp.allowRichAnimation).toBe(false);
      expect(exp.allowAmbientEffects).toBe(false);
      expect(exp.allowShimmer).toBe(false);
      expect(exp.shouldPrefetchAssets).toBe(false);
      expect(exp.maxCelebrationParticles).toBe(0);
      expect(exp.experience.motion).toBe('off');
      expect(exp.experience.sound).toBe('off');
      expect(exp.experience.haptics).toBe('off');
      // Blur can remain if not power-strained, but animations are silenced
      expect(exp.allowBlur).toBe(true);
    });

    it('power-cut scenario eliminates blur, particles, rich motion, and shrinks list window', () => {
      const exp = experienceOf(mockSnapshot, { ...baseSettings, scenario: 'power-cut' });
      expect(exp.allowBlur).toBe(false);
      expect(exp.allowRichAnimation).toBe(false);
      expect(exp.allowAmbientEffects).toBe(false);
      expect(exp.maxCelebrationParticles).toBe(0);
      expect(exp.shouldPrefetchAssets).toBe(false);
      expect(exp.listDrawDistance).toBe(60);
      expect(exp.imageCachePolicy).toBe('disk');
    });

    it('low-data scenario halts asset prefetch and restricts image decode format to rgb', () => {
      const exp = experienceOf(mockSnapshot, { ...baseSettings, scenario: 'low-data' });
      expect(exp.shouldPrefetchAssets).toBe(false);
      expect(exp.imageCachePolicy).toBe('disk');
      expect(exp.imageDecodeFormat).toBe('rgb');
      // Motion and blur are not penalized by low-data
      expect(exp.allowBlur).toBe(true);
      expect(exp.allowRichAnimation).toBe(true);
    });
  });
});

