import { describe, expect, it } from 'vitest';
import { MOTION } from '../faces';
import { resolveMotion } from '../motion';
import { WORLD_IDS } from '../worlds';

const LEVELS = ['off', 'essential', 'refined', 'rich'] as const;

describe('world motion', () => {
  it.each(WORLD_IDS)('%s stays inside the motion rules at every level', (id) => {
    for (const level of LEVELS) {
      const m = resolveMotion(MOTION[id], level);
      if (!m.animates) {
        expect(m.duration.transition).toBe(0);
        continue;
      }
      expect(m.duration.micro).toBeGreaterThanOrEqual(80);
      expect(m.duration.micro).toBeLessThanOrEqual(300);
      for (const d of [m.duration.transition, m.duration.meaningful]) {
        expect(d).toBeGreaterThanOrEqual(120);
        expect(d).toBeLessThanOrEqual(600);
      }
      // Never ease in: every curve arrives gently (the second handle sits high and early).
      expect(m.easing[3]).toBeGreaterThan(m.easing[2]);
      expect(Math.abs(m.from.x) + Math.abs(m.from.y)).toBeLessThanOrEqual(24);
    }
  });

  it('turns everything off when verger says off', () => {
    const m = resolveMotion(MOTION.spark, 'off');
    expect(m.animates).toBe(false);
    expect(m.spring).toBeNull();
    expect(m.press).toBe(1);
  });

  it('only fades at essential, whatever the world', () => {
    for (const id of WORLD_IDS) {
      const m = resolveMotion(MOTION[id], 'essential');
      expect(m.from).toEqual({ x: 0, y: 0 });
      expect(m.spring).toBeNull();
      expect(m.stagger).toBe(0);
      expect(m.duration.transition).toBe(240);
    }
  });

  it('keeps overshoot for rich and calms it at refined', () => {
    const rich = resolveMotion(MOTION.spark, 'rich');
    const refined = resolveMotion(MOTION.spark, 'refined');
    const critical = (s: { stiffness: number }) => 2 * Math.sqrt(s.stiffness);
    expect(rich.spring && rich.spring.damping < critical(rich.spring)).toBe(true);
    expect(refined.spring && refined.spring.damping >= Math.round(critical(refined.spring))).toBe(
      true,
    );
    expect(refined.from.x).toBeLessThan(rich.from.x);
    expect(refined.stagger).toBe(rich.stagger / 2);
  });

  it('gives each world its own character', () => {
    expect(resolveMotion(MOTION.wewa, 'rich').duration.transition).toBeGreaterThan(
      resolveMotion(MOTION.spark, 'rich').duration.transition,
    );
    expect(resolveMotion(MOTION.colombo, 'rich').from).toEqual({ x: 16, y: 0 });
    expect(resolveMotion(MOTION.kandyan, 'rich').from).toEqual({ x: 0, y: 0 });
    expect(resolveMotion(MOTION.sanctuary, 'rich').spring).toBeNull();
  });
});
