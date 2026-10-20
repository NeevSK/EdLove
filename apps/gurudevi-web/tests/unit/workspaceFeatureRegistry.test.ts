import { describe, expect, it } from 'vitest';
import {
  filterWorkspaceFeatures,
  getCoreCapabilityForFeature,
  getWorkspaceOverviewPosture,
  isPracticeAvailableForRole,
  WORKSPACE_FEATURES,
} from '../../app/(sanctuary)/workspace/workspaceFeatureRegistry';

describe('workspaceFeatureRegistry (G1)', () => {
  it('returns all features when roleFilter is "all"', () => {
    const filtered = filterWorkspaceFeatures(WORKSPACE_FEATURES, 'all');
    expect(filtered.length).toBe(WORKSPACE_FEATURES.length);
  });

  it('filters only common features when roleFilter is "common"', () => {
    const filtered = filterWorkspaceFeatures(WORKSPACE_FEATURES, 'common');
    expect(filtered.length).toBeGreaterThan(0);
    expect(filtered.every((f) => f.isCommon)).toBe(true);
    // Kiosk and Badges should NOT be common
    expect(filtered.find((f) => f.id === 'kiosk')).toBeUndefined();
    expect(filtered.find((f) => f.id === 'badges')).toBeUndefined();
  });

  it('contains 14 workspace features including submissions, climate, and tuition', () => {
    expect(WORKSPACE_FEATURES.length).toBe(14);
    expect(WORKSPACE_FEATURES.find((f) => f.id === 'submissions')).toBeDefined();
    expect(WORKSPACE_FEATURES.find((f) => f.id === 'climate')).toBeDefined();
    expect(WORKSPACE_FEATURES.find((f) => f.id === 'tuition')).toBeDefined();
  });

  it('includes common and teacher features when roleFilter is "teacher"', () => {
    const filtered = filterWorkspaceFeatures(WORKSPACE_FEATURES, 'teacher');
    expect(filtered.find((f) => f.id === 'attendance')).toBeDefined();
    expect(filtered.find((f) => f.id === 'gradebook')).toBeDefined();
    expect(filtered.find((f) => f.id === 'plan')).toBeDefined();
    expect(filtered.find((f) => f.id === 'submissions')).toBeDefined();
    expect(filtered.find((f) => f.id === 'climate')).toBeDefined();
    // Tuition and Student claim spot should NOT be present for teacher
    expect(filtered.find((f) => f.id === 'tuition')).toBeUndefined();
    expect(filtered.find((f) => f.id === 'claim')).toBeUndefined();
    // Kiosk should NOT be present for teacher
    expect(filtered.find((f) => f.id === 'kiosk')).toBeUndefined();
  });

  it('includes student-appropriate features when roleFilter is "student"', () => {
    const filtered = filterWorkspaceFeatures(WORKSPACE_FEATURES, 'student');
    expect(filtered.find((f) => f.id === 'attendance')).toBeDefined();
    expect(filtered.find((f) => f.id === 'timetable')).toBeDefined();
    expect(filtered.find((f) => f.id === 'claim')).toBeDefined();
    expect(filtered.find((f) => f.id === 'submissions')).toBeDefined();
    // Teacher lesson planning, climate sensing, and tuition should NOT be present for student
    expect(filtered.find((f) => f.id === 'plan')).toBeUndefined();
    expect(filtered.find((f) => f.id === 'climate')).toBeUndefined();
    expect(filtered.find((f) => f.id === 'tuition')).toBeUndefined();
    // Kiosk should NOT be present for student
    expect(filtered.find((f) => f.id === 'kiosk')).toBeUndefined();
  });

  it('includes institutional leadership features when roleFilter is "principal"', () => {
    const filtered = filterWorkspaceFeatures(WORKSPACE_FEATURES, 'principal');
    expect(filtered.find((f) => f.id === 'kiosk')).toBeDefined();
    expect(filtered.find((f) => f.id === 'badges')).toBeDefined();
    expect(filtered.find((f) => f.id === 'school')).toBeDefined();
    expect(filtered.find((f) => f.id === 'events')).toBeDefined();
    expect(filtered.find((f) => f.id === 'climate')).toBeDefined();
    expect(filtered.find((f) => f.id === 'tuition')).toBeDefined();
  });

  it('includes family-facing features when roleFilter is "guardian"', () => {
    const filtered = filterWorkspaceFeatures(WORKSPACE_FEATURES, 'guardian');
    expect(filtered.find((f) => f.id === 'attendance')).toBeDefined();
    expect(filtered.find((f) => f.id === 'notices')).toBeDefined();
    expect(filtered.find((f) => f.id === 'gradebook')).toBeDefined();
    expect(filtered.find((f) => f.id === 'tuition')).toBeDefined();
    expect(filtered.find((f) => f.id === 'claim')).toBeDefined();
    // Principal tools should NOT be present for guardian
    expect(filtered.find((f) => f.id === 'kiosk')).toBeUndefined();
    expect(filtered.find((f) => f.id === 'badges')).toBeUndefined();
  });

  describe('getWorkspaceOverviewPosture', () => {
    it('returns teacher current, review, and plan postures', () => {
      const current = getWorkspaceOverviewPosture('teacher', 'current', 'Today');
      expect(current.title).toContain('Daily Attendance');
      expect(current.actionText).toBe('Take Attendance');

      const review = getWorkspaceOverviewPosture('teacher', 'review', 'Oct 16, 2026');
      expect(review.title).toContain('Attendance & Roster Audit');
      expect(review.actionText).toBe('Audit Attendance Log');

      const plan = getWorkspaceOverviewPosture('teacher', 'plan', 'Oct 20, 2026');
      expect(plan.title).toContain('Lesson Planning');
      expect(plan.actionText).toBe('Draft Lesson Plan');
    });

    it('returns student current, review, and plan postures', () => {
      const current = getWorkspaceOverviewPosture('student', 'current', 'Today');
      expect(current.title).toContain('Today’s Classes & Daily Presence');
      expect(current.actionText).toBe('Open Daily Check-in');

      const review = getWorkspaceOverviewPosture('student', 'review', 'Oct 16, 2026');
      expect(review.title).toContain('Attendance & Study History');
      expect(review.actionText).toBe('View Past Presence');

      const plan = getWorkspaceOverviewPosture('student', 'plan', 'Oct 20, 2026');
      expect(plan.title).toContain('Class Timetable');
      expect(plan.actionText).toBe('Preview Timetable');
    });

    it('returns principal leadership postures', () => {
      const current = getWorkspaceOverviewPosture('principal', 'current', 'Today');
      expect(current.title).toContain('Real-Time Campus Presence & Kiosks');
      expect(current.actionText).toBe('Open Doorway Kiosk');

      const review = getWorkspaceOverviewPosture('principal', 'review', 'Oct 16, 2026');
      expect(review.title).toContain('Campus Compliance');
      expect(review.actionText).toBe('Audit Compliance');
    });
  });

  describe('core capability manifest integration', () => {
    it('binds attendance, climate, and submissions to canonical core capabilities', () => {
      const attendanceCap = getCoreCapabilityForFeature('attendance');
      expect(attendanceCap).toBeDefined();
      expect(attendanceCap?.id).toBe('attendance');
      expect(attendanceCap?.platforms).toContain('browser');

      const climateCap = getCoreCapabilityForFeature('climate');
      expect(climateCap).toBeDefined();
      expect(climateCap?.id).toBe('climate_sensing');

      const submissionsCap = getCoreCapabilityForFeature('submissions');
      expect(submissionsCap).toBeDefined();
      expect(submissionsCap?.id).toBe('learning_studio');
    });

    it('validates practice availability per role based on canonical manifest policy', () => {
      expect(isPracticeAvailableForRole('attendance', 'teacher')).toBe(true);
      expect(isPracticeAvailableForRole('attendance', 'principal')).toBe(true);

      expect(isPracticeAvailableForRole('climate', 'teacher')).toBe(true);
      expect(isPracticeAvailableForRole('climate', 'principal')).toBe(true);
      expect(isPracticeAvailableForRole('climate', 'student')).toBe(false);

      expect(isPracticeAvailableForRole('submissions', 'student')).toBe(true);
      expect(isPracticeAvailableForRole('submissions', 'teacher')).toBe(true);
      expect(isPracticeAvailableForRole('submissions', 'principal')).toBe(false);
    });
  });
});
