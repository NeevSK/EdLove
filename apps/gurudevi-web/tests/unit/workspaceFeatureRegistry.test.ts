import { describe, expect, it } from 'vitest';
import {
  getCoreCapabilityForFeature,
  getWorkspaceOverviewPosture,
  isOfferedTo,
  isPracticeAvailableForCapacity,
  WEB_WORKSPACE_FEATURES,
  workspaceFeatureAt,
  workspaceFeaturesFor,
  workspaceVoice,
} from '../../app/(sanctuary)/workspace/workspaceFeatureRegistry';

const ids = (capacity: string) => workspaceFeaturesFor(capacity).map((feature) => feature.id);

describe('web Workspace delivery (G1)', () => {
  it('offers each capacity only the features on its floor that the web can open', () => {
    expect(ids('teacher')).toEqual(
      expect.arrayContaining(['attendance', 'gradebook', 'plan', 'submissions', 'climate']),
    );
    expect(ids('teacher')).not.toEqual(expect.arrayContaining(['tuition']));
    for (const notForTeachers of [
      'tuition',
      'claim',
      'kiosk',
      'principal',
      'guardian',
      'founder_command',
    ]) {
      expect(ids('teacher')).not.toContain(notForTeachers);
    }

    expect(ids('student')).toEqual(
      expect.arrayContaining(['attendance', 'timetable', 'claim', 'submissions']),
    );
    for (const notForStudents of ['plan', 'climate', 'tuition', 'kiosk']) {
      expect(ids('student')).not.toContain(notForStudents);
    }

    expect(ids('principal')).toEqual(
      expect.arrayContaining([
        'kiosk',
        'badges',
        'school',
        'events',
        'climate',
        'tuition',
        'principal',
      ]),
    );

    expect(ids('guardian')).toEqual(
      expect.arrayContaining(['attendance', 'notices', 'gradebook', 'tuition', 'claim']),
    );
    for (const notForGuardians of ['kiosk', 'badges'])
      expect(ids('guardian')).not.toContain(notForGuardians);
  });

  it('gives founders their command and builders their labs, and nobody else', () => {
    expect(ids('founder')).toEqual(
      expect.arrayContaining(['founder_command', 'agent_lab', 'icon_lab']),
    );
    expect(ids('developer')).toEqual(expect.arrayContaining(['agent_lab', 'icon_lab']));
    expect(ids('developer')).not.toContain('founder_command');
    expect(ids('principal')).not.toContain('agent_lab');
  });

  it('never offers a feature the web has no route for', () => {
    expect(WEB_WORKSPACE_FEATURES.find((feature) => feature.id === 'qr_scanner')).toBeUndefined();
    expect(ids('teacher')).not.toContain('qr_scanner');
  });

  it('finds the feature a route belongs to, and offers links only to the floor', () => {
    expect(workspaceFeatureAt('/workspace/tuition')?.id).toBe('tuition');
    expect(workspaceFeatureAt('/community')).toBeUndefined();
    expect(isOfferedTo('teacher', '/workspace/gradebook')).toBe(true);
    expect(isOfferedTo('teacher', '/workspace/tuition')).toBe(false);
    expect(isOfferedTo('teacher', '/agent-lab')).toBe(false);
    expect(isOfferedTo('teacher', '/community?pillar=messages')).toBe(true);
    expect(isOfferedTo(undefined, '/workspace/gradebook')).toBe(false);
  });

  it('reads capitalised preview capacities like account capacities', () => {
    expect(ids('PRINCIPAL')).toEqual(ids('principal'));
  });

  describe('overview wording follows the capacity', () => {
    it('speaks to teachers, students and principals in their own words', () => {
      expect(workspaceVoice('assistantPrincipal')).toBe('principal');
      expect(workspaceVoice('parent')).toBe('guardian');
      expect(workspaceVoice('sectionHead')).toBe('teacher');

      const teacher = getWorkspaceOverviewPosture('teacher', 'current', 'Today');
      expect(teacher.actionText).toBe('Take Attendance');
      expect(getWorkspaceOverviewPosture('teacher', 'review', 'Oct 16, 2026').actionText).toBe(
        'Audit Attendance Log',
      );
      expect(getWorkspaceOverviewPosture('teacher', 'plan', 'Oct 20, 2026').actionText).toBe(
        'Draft Lesson Plan',
      );
      expect(getWorkspaceOverviewPosture('student', 'current', 'Today').actionText).toBe(
        'Open Daily Check-in',
      );
      expect(getWorkspaceOverviewPosture('principal', 'current', 'Today').actionText).toBe(
        'Open Doorway Kiosk',
      );
      expect(getWorkspaceOverviewPosture('principal', 'review', 'Oct 16, 2026').actionText).toBe(
        'Audit Compliance',
      );
    });
  });

  describe('core capability manifest integration', () => {
    it('binds attendance, climate, and submissions to canonical core capabilities', () => {
      expect(getCoreCapabilityForFeature('attendance')?.platforms).toContain('browser');
      expect(getCoreCapabilityForFeature('climate')?.id).toBe('climate_sensing');
      expect(getCoreCapabilityForFeature('submissions')?.id).toBe('learning_studio');
    });

    it('validates practice availability per capacity from the canonical manifest policy', () => {
      expect(isPracticeAvailableForCapacity('attendance', 'teacher')).toBe(true);
      expect(isPracticeAvailableForCapacity('attendance', 'principal')).toBe(true);
      expect(isPracticeAvailableForCapacity('climate', 'teacher')).toBe(true);
      expect(isPracticeAvailableForCapacity('climate', 'principal')).toBe(true);
      expect(isPracticeAvailableForCapacity('climate', 'student')).toBe(false);
      expect(isPracticeAvailableForCapacity('submissions', 'student')).toBe(true);
      expect(isPracticeAvailableForCapacity('submissions', 'teacher')).toBe(true);
      expect(isPracticeAvailableForCapacity('submissions', 'principal')).toBe(false);
    });
  });
});
