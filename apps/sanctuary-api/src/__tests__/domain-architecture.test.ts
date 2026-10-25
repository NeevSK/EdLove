import './setup';
import { beforeEach, describe, expect, it } from 'vitest';
import { createTestORPCClient } from './orpc-client';
import {
  setMockActiveBond,
  setMockClassroomRelationships,
  setMockDailyContentRows,
  setMockMoodLogs,
  setMockUserPreferences,
  setMockZenStackDbAvailable,
} from './setup';

describe('Sanctuary API: Canonical Domain-Driven Architecture (DDD)', () => {
  const userId = '123e4567-e89b-8101-8000-426614174000';
  const gradeClassId = '123e4567-e89b-12d3-a456-426614174001';
  const headers = { Authorization: `Bearer ${userId}`, 'x-classroom-ids': gradeClassId };

  beforeEach(() => {
    setMockZenStackDbAvailable(true);
    setMockActiveBond({
      id: 'bond-test',
      user_id: userId,
      entity_id: 'school-123',
      entity_type: 'SCHOOL',
      capacity: 'teacher',
      status: 'active',
    });
    setMockClassroomRelationships({
      classrooms: [{ id: gradeClassId, school_id: 'school-123', teacher_id: userId }],
    });
    setMockMoodLogs([]);
    setMockUserPreferences(null);
    setMockDailyContentRows([
      {
        id: 'daily-1',
        type: 'motivation',
        content: 'Keep going.',
        author: 'Sanctuary',
        date: '2026-07-30',
        active: true,
        created_at: '2026-07-30T00:00:00.000Z',
      },
    ]);
  });

  describe('Self Bounded Context (@repo/self)', () => {
    it('supports modern domain-scoped calls: self.logMood and self.wellbeing.logMood', async () => {
      const client = createTestORPCClient(headers);

      // Direct domain procedure call
      const res1 = await client.self.logMood({
        body: { user_id: userId, mood_score: 9, mood: 'grounded', note: 'Domain test' },
      });
      expect(res1).toMatchObject({
        user_id: userId,
        mood_score: 9,
        mood: 'grounded',
      });

      // Explicit nested capability call
      const res2 = await client.self.wellbeing.logMood({
        body: { user_id: userId, mood_score: 8, mood: 'peaceful', note: 'Wellbeing sub-route' },
      });
      expect(res2).toMatchObject({
        user_id: userId,
        mood_score: 8,
        mood: 'peaceful',
      });
    });
  });

  describe('Workspace Bounded Context (@repo/classroom, @repo/workforce, @repo/admin, @repo/accounting)', () => {
    it('supports modern domain-scoped calls: workspace.attendance.getByClassroom', async () => {
      const client = createTestORPCClient(headers);

      const res = await client.workspace.attendance.getByClassroom({
        query: { gradeClassId, date: '2026-07-30' },
      });
      expect(res).toEqual([]);
    });

    it('preserves legacy flat facade: attendance.getByClassroom', async () => {
      const client = createTestORPCClient(headers);

      const res = await client.attendance.getByClassroom({
        query: { gradeClassId, date: '2026-07-30' },
      });
      expect(res).toEqual([]);
    });
  });

  describe('Library Bounded Context (@repo/library, @repo/editorial)', () => {
    it('supports modern domain-scoped calls: library.dailyContent.getToday', async () => {
      const client = createTestORPCClient(headers);

      const res = await client.library.dailyContent.getToday();
      expect(res.motivation).toMatchObject({ id: 'daily-1', content: 'Keep going.' });
    });

    it('preserves legacy flat facade: dailyContent.getToday', async () => {
      const client = createTestORPCClient(headers);

      const res = await client.dailyContent.getToday();
      expect(res.motivation).toMatchObject({ id: 'daily-1', content: 'Keep going.' });
    });
  });
});
