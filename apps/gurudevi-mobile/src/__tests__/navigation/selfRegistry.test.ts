import { FEATURE_CATALOG } from '@repo/self/features/featureCatalog';
import { describe, expect, it, vi } from 'vitest';
import { getSelfRegistry } from '@/navigation/registries/selfRegistry';

vi.mock('@repo/ui/icons', () => {
  const Icon = () => null;
  return {
    BarChart3: Icon,
    Brain: Icon,
    Compass: Icon,
    FileText: Icon,
    Heart: Icon,
    HeartPulse: Icon,
    Layers: Icon,
    Moon: Icon,
    Sparkles: Icon,
    Sun: Icon,
    Wind: Icon,
  };
});

describe('getSelfRegistry', { tags: ['fast'] }, () => {
  it('adapts every native Self feature without manufacturing an Overview task', () => {
    const registry = getSelfRegistry('teacher');
    const ids = registry.items.map((item) => item.id);

    expect(ids).not.toContain('self-overview');
    expect(ids).toHaveLength(Object.keys(FEATURE_CATALOG).length);
    expect(new Set(ids).size).toBe(ids.length);
    expect(registry.items.every((item) => item.params?.feature === item.id)).toBe(true);
  });

  it('uses the active capacity only to order and describe the canonical catalog', () => {
    const student = getSelfRegistry('student');
    const teacher = getSelfRegistry('teacher');

    expect(student.roleBadge).toBe('Student');
    expect(teacher.roleBadge).toBe('Teacher');
    expect(student.items.map((item) => item.id).sort()).toEqual(
      teacher.items.map((item) => item.id).sort(),
    );
  });
});
