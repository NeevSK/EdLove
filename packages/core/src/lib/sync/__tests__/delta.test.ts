import { describe, expect, it } from 'vitest';
import { DeltaResonance } from '../delta';

describe('DeltaResonance Engine (G0 Unit / G1 State)', () => {
  it('generates accurate RFC 6902 JSON patch and applies immutably', () => {
    const original = {
      id: 'inv-1',
      name: 'Microscope A',
      condition: 'good',
      quantity: 5,
      tags: ['lab', 'science'],
    };

    const updated = {
      id: 'inv-1',
      name: 'Microscope A',
      condition: 'damaged',
      quantity: 4,
      tags: ['lab', 'science', 'needs-repair'],
    };

    const patch = DeltaResonance.diff(original, updated);
    expect(patch.length).toBeGreaterThan(0);

    const patched = DeltaResonance.patch(original, patch);
    expect(patched).toEqual(updated);
    // Immutability check
    expect(original.condition).toBe('good');
  });

  it('detects substantive changes and identifies no-ops', () => {
    const base = { title: 'Lesson 1', duration: 45 };
    const same = { title: 'Lesson 1', duration: 45 };
    const changed = { title: 'Lesson 1: Introduction', duration: 45 };

    expect(DeltaResonance.isSubstantiveChange(base, same)).toBe(false);
    expect(DeltaResonance.isSubstantiveChange(base, changed)).toBe(true);
  });

  it('converts RFC 6902 patches into flat partial update objects', () => {
    const original = { id: 'user-1', name: 'Alice', role: 'teacher', status: 'active' };
    const updated = { id: 'user-1', name: 'Alice Smith', role: 'teacher', status: 'on_leave' };

    const patch = DeltaResonance.diff(original, updated);
    const partial = DeltaResonance.toPartialObject(patch);

    expect(partial).toEqual({
      name: 'Alice Smith',
      status: 'on_leave',
    });
  });

  it('calculates accurate compression savings and telemetry metrics', () => {
    const original = {
      id: 'doc-999',
      hugeContent: 'Lorem ipsum '.repeat(100),
      status: 'draft',
      version: 1,
    };
    const updated = {
      ...original,
      status: 'published',
      version: 2,
    };

    const metrics = DeltaResonance.computeMetrics(original, updated);
    expect(metrics.operationCount).toBe(2);
    expect(metrics.savingsPercentage).toBeGreaterThan(70);
    expect(metrics.modifiedPaths).toContain('/status');
    expect(metrics.modifiedPaths).toContain('/version');
  });

  it('performs three-way merge without conflicts on non-overlapping fields', () => {
    const base = { id: 'doc-1', title: 'Plan', notes: 'Initial note', tags: 'tag1' };
    const local = { id: 'doc-1', title: 'Renamed Plan', notes: 'Initial note', tags: 'tag1' };
    const remote = { id: 'doc-1', title: 'Plan', notes: 'Remote updated note', tags: 'tag1' };

    const result = DeltaResonance.threeWayMerge(base, local, remote);
    expect(result.hasConflicts).toBe(false);
    expect(result.merged).toEqual({
      id: 'doc-1',
      title: 'Renamed Plan',
      notes: 'Remote updated note',
      tags: 'tag1',
    });
  });

  it('performs deep nested three-way merges without collisions on disjoint sub-properties', () => {
    const base = {
      id: 'classroom-101',
      config: {
        theme: 'dark',
        grading: { scale: 'letter', passMark: 50 },
        notifications: { email: true, push: false },
      },
      tags: ['grade-5', 'science'],
    };

    const local = {
      id: 'classroom-101',
      config: {
        theme: 'dark',
        grading: { scale: 'percentage', passMark: 50 }, // changed grading scale
        notifications: { email: true, push: false },
      },
      tags: ['grade-5', 'science'],
    };

    const remote = {
      id: 'classroom-101',
      config: {
        theme: 'dark',
        grading: { scale: 'letter', passMark: 50 },
        notifications: { email: true, push: true }, // enabled push
      },
      tags: ['grade-5', 'science'],
    };

    const result = DeltaResonance.threeWayMerge(base, local, remote);
    expect(result.hasConflicts).toBe(false);
    expect(result.merged.config.grading.scale).toBe('percentage');
    expect(result.merged.config.notifications.push).toBe(true);
    expect(result.merged.config.theme).toBe('dark');
  });

  it('detects and handles deep nested field collisions with configurable resolution strategies', () => {
    const base = {
      student: { name: 'John Doe', profile: { gpa: 3.5, tier: 'silver' } },
    };
    const local = {
      student: { name: 'John Doe', profile: { gpa: 3.8, tier: 'silver' } }, // local updated GPA
    };
    const remote = {
      student: { name: 'John Doe', profile: { gpa: 3.9, tier: 'gold' } }, // remote updated GPA and tier
    };

    // Test local-wins strategy
    const localWinsResult = DeltaResonance.threeWayMerge(base, local, remote, 'local-wins');
    expect(localWinsResult.hasConflicts).toBe(true);
    expect(localWinsResult.conflicts).toHaveLength(1);
    expect(localWinsResult.conflicts[0]?.path).toBe('/student/profile/gpa');
    expect(localWinsResult.conflicts[0]?.resolution).toBe('local');
    expect(localWinsResult.merged.student.profile.gpa).toBe(3.8);
    expect(localWinsResult.merged.student.profile.tier).toBe('gold'); // non-conflicting remote update preserved

    // Test remote-wins strategy
    const remoteWinsResult = DeltaResonance.threeWayMerge(base, local, remote, 'remote-wins');
    expect(remoteWinsResult.merged.student.profile.gpa).toBe(3.9);
  });

  it('correctly structures deeply nested partial objects from RFC 6902 patches', () => {
    const original = {
      settings: {
        security: { twoFactor: false, pin: 1234 },
      },
      profile: { bio: 'Hello' },
    };
    const updated = {
      settings: {
        security: { twoFactor: true, pin: 1234 },
      },
      profile: { bio: 'Hello World' },
    };

    const patch = DeltaResonance.diff(original, updated);
    const partial = DeltaResonance.toPartialObject(patch);

    expect(partial).toEqual({
      settings: {
        security: {
          twoFactor: true,
        },
      },
      profile: {
        bio: 'Hello World',
      },
    });
  });
});
