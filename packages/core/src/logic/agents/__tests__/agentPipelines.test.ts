import { Effect } from 'effect';
import { describe, expect, it } from 'vitest';
import {
  type ClassroomRow,
  CoordinationGapSchema,
  checkSectionReliefGapsEffect,
  detectAttendanceGapsEffect,
} from '../index';

describe('AI Agent Resilience Pipelines', () => {
  describe('detectAttendanceGapsEffect', () => {
    it('detects unrecorded attendance and returns schema-validated gaps', async () => {
      const classrooms: ClassroomRow[] = [
        { id: 'c1', name: 'Grade 1A' },
        { id: 'c2', name: 'Grade 1B' },
      ];

      const mockDb: any = {
        from: (table: string) => {
          expect(table).toBe('attendance');
          return {
            select: () => ({
              in: () => ({
                eq: async () => ({
                  data: [{ classroom_id: 'c1' }],
                  error: null,
                }),
              }),
            }),
          };
        },
      };

      const result = await Effect.runPromise(
        detectAttendanceGapsEffect(classrooms, '2026-10-08', mockDb),
      );

      expect(result).toHaveLength(1);
      expect(result[0]!.id).toBe('attendance-c2-2026-10-08');
      expect(result[0]!.type).toBe('relief');
      expect(result[0]!.title).toBe('Attendance pending: Grade 1B');
      expect(result[0]!.priority).toBe('high');
      expect(result[0]!.suggestedAction).toBe('Mark attendance now');
    });

    it('returns empty array when all classrooms have marked attendance', async () => {
      const classrooms: ClassroomRow[] = [{ id: 'c1', name: 'Grade 1A' }];

      const mockDb: any = {
        from: () => ({
          select: () => ({
            in: () => ({
              eq: async () => ({
                data: [{ classroom_id: 'c1' }],
                error: null,
              }),
            }),
          }),
        }),
      };

      const result = await Effect.runPromise(
        detectAttendanceGapsEffect(classrooms, '2026-10-08', mockDb),
      );

      expect(result).toEqual([]);
    });

    it('captures database failures into AgentDatabaseError', async () => {
      const classrooms: ClassroomRow[] = [{ id: 'c1', name: 'Grade 1A' }];

      const mockDb: any = {
        from: () => ({
          select: () => ({
            in: () => ({
              eq: async () => ({
                data: null,
                error: { message: 'connection dropped' },
              }),
            }),
          }),
        }),
      };

      const exit = await Effect.runPromiseExit(
        detectAttendanceGapsEffect(classrooms, '2026-10-08', mockDb),
      );

      expect(exit._tag).toBe('Failure');
    });
  });

  describe('checkSectionReliefGapsEffect', () => {
    it('returns empty array when no staff leaves are approved today', async () => {
      const mockDb: any = {
        from: (table: string) => {
          expect(table).toBe('staff_leaves');
          return {
            select: () => ({
              eq: () => ({
                eq: () => ({
                  lte: () => ({
                    gte: async () => ({ data: [], error: null }),
                  }),
                }),
              }),
            }),
          };
        },
      };

      const result = await Effect.runPromise(
        checkSectionReliefGapsEffect('school-123', undefined, mockDb),
      );

      expect(result).toEqual([]);
    });

    it('surfaces uncovered classrooms with suggested available teacher', async () => {
      const mockDb: any = {
        from: (table: string) => {
          if (table === 'staff_leaves') {
            return {
              select: () => ({
                eq: () => ({
                  eq: () => ({
                    lte: () => ({
                      gte: async () => ({
                        data: [{ user_id: 'teacher-1', users: { full_name: 'Guru Somapala' } }],
                        error: null,
                      }),
                    }),
                  }),
                }),
              }),
            };
          }
          if (table === 'classrooms') {
            return {
              select: () => ({
                in: () => ({
                  eq: () => ({
                    limit: async () => ({
                      data: [
                        { id: 'class-1', name: 'Lotus Room', grade: '1', teacher_id: 'teacher-1' },
                      ],
                      error: null,
                    }),
                  }),
                }),
              }),
            };
          }
          if (table === 'users') {
            return {
              select: () => ({
                eq: () => ({
                  eq: () => ({
                    not: async () => ({
                      data: [{ id: 'teacher-2', full_name: 'Guru Bandara' }],
                      error: null,
                    }),
                  }),
                }),
              }),
            };
          }
          throw new Error(`Unexpected table: ${table}`);
        },
      };

      const result = await Effect.runPromise(
        checkSectionReliefGapsEffect('school-123', undefined, mockDb),
      );

      expect(result).toHaveLength(1);
      expect(result[0]!.type).toBe('relief');
      expect(result[0]!.title).toBe('Relief needed: Lotus Room');
      expect(result[0]!.description).toContain('Guru Somapala is on approved leave');
      expect(result[0]!.suggestedAction).toBe('Assign Guru Bandara (available)');
    });

    it('captures database failures into AgentDatabaseError', async () => {
      const mockDb: any = {
        from: () => ({
          select: () => ({
            eq: () => ({
              eq: () => ({
                lte: () => ({
                  gte: async () => ({
                    data: null,
                    error: { message: 'table locked' },
                  }),
                }),
              }),
            }),
          }),
        }),
      };

      const exit = await Effect.runPromiseExit(
        checkSectionReliefGapsEffect('school-123', undefined, mockDb),
      );

      expect(exit._tag).toBe('Failure');
    });
  });
});
