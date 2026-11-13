import { describe, expect, it } from 'vitest';
import {
  canEditPast,
  lensFit,
  TIMELESS,
  TimeProfileSchema,
  timeProfile,
  timeProfileFromCapabilities,
} from '../timeProfile';

describe('time profile', () => {
  it('says how a feature meets each lens', () => {
    const lessonPlans = timeProfile('plan', ['review', 'current', 'plan'], 'editable');
    expect(lensFit(lessonPlans, 'plan')).toBe('home');
    expect(lensFit(lessonPlans, 'review')).toBe('supported');
    const fire = timeProfile('current', ['current']);
    expect(lensFit(fire, 'review')).toBe('absent');
    expect(lensFit(TIMELESS, 'plan')).toBe('timeless');
  });

  it('keeps past records sealed, append-only or editable', () => {
    expect(canEditPast(timeProfile('current', ['review', 'current'], 'sealed'))).toBe('add-only');
    expect(canEditPast(timeProfile('current', ['review', 'current'], 'append'))).toBe('add-only');
    expect(canEditPast(timeProfile('plan', ['review', 'plan'], 'editable'))).toBe('yes');
    expect(canEditPast(timeProfile('current', ['current']))).toBe('no');
  });

  it('refuses a home outside its modes, and review without a past rule', () => {
    expect(() => timeProfile('plan', ['current'])).toThrow();
    expect(() => timeProfile('review', ['review'])).toThrow();
    expect(TimeProfileSchema.safeParse({ modes: ['current'], home: 'timeless' }).success).toBe(
      false,
    );
  });

  it('bridges the older review/plan flags', () => {
    expect(timeProfileFromCapabilities({ hasReview: true, hasPlan: false })).toEqual({
      modes: ['review', 'current'],
      home: 'current',
      past: 'sealed',
    });
    expect(timeProfileFromCapabilities({ hasReview: false, hasPlan: true }, 'plan').home).toBe(
      'plan',
    );
    expect(timeProfileFromCapabilities({ hasReview: false, hasPlan: false }, 'plan').home).toBe(
      'current',
    );
  });
});
