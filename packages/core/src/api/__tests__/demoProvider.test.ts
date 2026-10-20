import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getDemoAssignments,
  getDemoClassrooms,
  getDemoGoals,
  getDemoGrades,
  getDemoSchoolStats,
  getDemoStudentStats,
  interceptApiCall,
  processGhostData,
} from '../demoProvider';
import { useAuthStore } from '@repo/core/store/useAuthStore';
import { useStore } from '@repo/core/store/useStore';
import { createResonantProxy } from '../resonantProxy';

describe('Canonical demoProvider and Ghost Seeding', () => {
  beforeEach(() => {
    useAuthStore.setState({
      isDemoMode: false,
      isExplorerMode: false,
      dismissedSampleIds: [],
      isBridging: false,
    });
    useStore.getState().setDemoMode(false);
  });

  describe('interceptApiCall', () => {
    it('intercepts queries targeting sample entities even when isDemoMode is false', async () => {
      const result = await interceptApiCall('classroomStudents', 'getAll', ['sample-c1']);
      expect(result).toBeTruthy();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThanOrEqual(10);
      expect(result[0]).toHaveProperty('full_name', 'Nimal Silva');
      expect(result[0]).toHaveProperty('classroom_id', 'sample-c1');
    });

    it('intercepts attendance snapshot queries targeting sample-c1', async () => {
      const result = await interceptApiCall('attendance', 'getClassroomAttendanceSnapshot', [
        'sample-c1',
        '2026-10-17',
      ]);
      expect(result).toBeTruthy();
      expect(result).toHaveProperty('records');
      expect(result.records.length).toBeGreaterThan(0);
      expect(result.records[0]).toHaveProperty('status', 'present');
    });

    it('intercepts echo queries targeting sample entities', async () => {
      const result = await interceptApiCall('echo', 'getEchoesByClassroom', ['sample-c1']);
      expect(result).toBeTruthy();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('content');
    });

    it('intercepts teacher temporal snapshots', async () => {
      useAuthStore.setState({ isDemoMode: true });
      const result = await interceptApiCall('teacherDashboard', 'getTemporalSnapshot', ['mock-t']);
      expect(result).toBeTruthy();
      expect(Array.isArray(result)).toBe(true);
      expect(result.some((m: any) => m.phase === 'past')).toBe(true);
    });

    it('does not intercept real database queries when not in demo mode', async () => {
      const result = await interceptApiCall('classrooms', 'getByTeacher', ['real-user-uuid']);
      expect(result).toBeNull();
    });

    it('serves Library browse data and counts in demo mode without a backend call', async () => {
      useStore.getState().setDemoMode(true);

      const resources = await interceptApiCall('library', 'getResources');
      const collections = await interceptApiCall('library', 'getCollections');
      const resourceCount = await interceptApiCall('library', 'getResourcesCount');
      const collectionCount = await interceptApiCall('library', 'getCollectionsCount');

      expect(resources).toHaveLength(3);
      expect(collections).toHaveLength(1);
      expect(resourceCount).toBe(3);
      expect(collectionCount).toBe(1);
    });

    it('short-circuits Library API reads through the resonant proxy in demo mode', async () => {
      useStore.getState().setDemoMode(true);
      const getResources = vi.fn(async () => [{ id: 'live-resource' }]);
      const api = createResonantProxy('library', { getResources });

      const resources = await api.getResources();

      expect(resources.map((resource) => resource.id)).toEqual(['v-r1', 'v-r2', 'v-r3']);
      expect(getResources).not.toHaveBeenCalled();
    });
  });

  describe('processGhostData', () => {
    it('returns empty realData untouched when isExplorerMode is false', () => {
      useAuthStore.setState({ isExplorerMode: false });
      const realData: any[] = [];
      const output = processGhostData('classrooms', 'getByTeacher', realData);
      expect(output).toEqual([]);
    });

    it('injects sample classrooms with is_sample: true when isExplorerMode is true and real data is empty', () => {
      useAuthStore.setState({ isExplorerMode: true });
      const realData: any[] = [];
      const output = processGhostData('classrooms', 'getByTeacher', realData);
      expect(output.length).toBeGreaterThan(0);
      expect(output[0].is_sample).toBe(true);
      expect(output.some((c: any) => c.id === 'sample-c1')).toBe(true);
    });

    it('filters out sample classrooms that have been dismissed by the user', () => {
      useAuthStore.setState({ isExplorerMode: true, dismissedSampleIds: ['sample-c1'] });
      const realData: any[] = [];
      const output = processGhostData('classrooms', 'getByTeacher', realData);
      expect(output.some((c: any) => c.id === 'sample-c1')).toBe(false);
    });

    it('does not inject sample classrooms if real data already exists in the database', () => {
      useAuthStore.setState({ isExplorerMode: true });
      const realData = [{ id: 'real-classroom-uuid', name: 'My Real Classroom' }];
      const output = processGhostData('classrooms', 'getByTeacher', realData);
      expect(output).toEqual(realData);
      expect(output.length).toBe(1);
      expect(output[0].id).toBe('real-classroom-uuid');
    });

    it('injects mock school stats if real stats are all zero and isExplorerMode is true', () => {
      useAuthStore.setState({ isExplorerMode: true });
      const emptyStats = { total_students: 0, total_teachers: 0, total_classrooms: 0 };
      const output = processGhostData('school', 'getSchoolStats', emptyStats);
      expect(output.is_sample).toBe(true);
      expect(output.total_students).toBe(450);
      expect(output.total_teachers).toBe(28);
    });

    it('injects ghost echoes when isExplorerMode is true and real echoes are empty', () => {
      useAuthStore.setState({ isExplorerMode: true });
      const output = processGhostData('echo', 'getEchoesByClassroom', []);
      expect(output.length).toBeGreaterThan(0);
      expect(output.every((e: any) => e.is_sample === true)).toBe(true);
    });

    it('injects ghost teacher observations and classroom notes in explorer mode', () => {
      useAuthStore.setState({ isExplorerMode: true });
      const obs = processGhostData('teacherInsights', 'listStudentObservations', []);
      expect(obs.length).toBeGreaterThan(0);
      expect(obs.every((o: any) => o.is_sample === true)).toBe(true);

      const notes = processGhostData('classroomNotes', 'getAll', []);
      expect(notes.length).toBeGreaterThan(0);
      expect(notes.every((n: any) => n.is_sample === true)).toBe(true);
    });

    it('injects ghost student stats in explorer mode', () => {
      useAuthStore.setState({ isExplorerMode: true });
      const stats = processGhostData('classrooms', 'getStudentStats', {
        active_sanctuaries: 0,
        goals_set: 0,
        growth_points: 0,
      });
      expect(stats.is_sample).toBe(true);
      expect(stats.active_sanctuaries).toBe(3);
    });
  });

  describe('Canonical Helpers', () => {
    it('getDemoClassrooms returns sample classrooms with is_sample flag', () => {
      const classrooms = getDemoClassrooms();
      expect(classrooms.length).toBeGreaterThan(0);
      expect(classrooms.every((c: any) => c.is_sample === true)).toBe(true);
    });

    it('getDemoSchoolStats returns realistic sanctuary stats with is_sample flag', () => {
      const stats = getDemoSchoolStats();
      expect(stats.is_sample).toBe(true);
      expect(stats.total_students).toBe(450);
      expect(stats.attendance_rate).toBeCloseTo(0.942);
    });

    it('getDemoStudentStats, getDemoAssignments, getDemoGrades, getDemoGoals return complete data sets', () => {
      const stats = getDemoStudentStats();
      expect(stats.is_sample).toBe(true);
      expect(stats.active_sanctuaries).toBe(3);

      const assignments = getDemoAssignments();
      expect(assignments.length).toBeGreaterThan(0);
      expect(assignments.every((a: any) => a.is_sample === true)).toBe(true);

      const grades = getDemoGrades();
      expect(grades.length).toBeGreaterThan(0);
      expect(grades.every((g: any) => g.is_sample === true)).toBe(true);

      const goals = getDemoGoals();
      expect(goals.length).toBeGreaterThan(0);
      expect(goals.every((g: any) => g.is_sample === true)).toBe(true);
    });
  });
});
