import { canonicalSelfFeatureId, SELF_REGISTRY } from '@repo/self/constants/selfRegistry';
import { describe, expect, it } from 'vitest';
import { resolveSelfViewRole, selfRoleHeader } from './roleResolution';

describe('Self role resolution', () => {
  it('keeps an admin capacity on the Admin surface when multiple gates are available', () => {
    const can = () => true;

    expect(resolveSelfViewRole('admin', can)).toBe('admin');
    expect(selfRoleHeader('admin')).toEqual({ title: 'Sadhana', note: 'Admin Sanctuary' });
  });

  it('does not grant a role from capacity when its capability is denied', () => {
    expect(resolveSelfViewRole('admin', () => false)).toBeNull();
  });

  it('falls back to the capability order only when capacity is unavailable', () => {
    expect(resolveSelfViewRole(null, (_action, subject) => subject === 'TeacherDashboard')).toBe(
      'teacher',
    );
  });
});

describe('Self feature catalog alignment', () => {
  it('normalizes role-view aliases to the registry vocabulary', () => {
    expect(canonicalSelfFeatureId('pulse')).toBe('daily_pulse');
    expect(canonicalSelfFeatureId('mood-lotus')).toBe('mood_lotus');
    expect(canonicalSelfFeatureId('joy-jar')).toBe('joy_jar');
    expect(canonicalSelfFeatureId('sleep')).toBe('sleep_tracker');
  });

  it('keeps registry feature IDs canonical and stable', () => {
    const ids = Object.values(SELF_REGISTRY).flatMap(
      (domain) => domain.presentation?.featureIds ?? [],
    );
    expect(ids).toContain('daily_pulse');
    expect(ids).not.toContain('pulse');
    expect(ids.every((id) => canonicalSelfFeatureId(id) === id)).toBe(true);
  });
});
