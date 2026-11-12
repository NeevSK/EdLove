import { describe, expect, it } from 'vitest';
import { deskCounts, deskPort, nextLessonOf, sampleTeacherDesk } from './deskPort';

describe('teacher desk port', () => {
  it('answers from the samples until a server port is put in', async () => {
    expect(deskPort.get().source).toBe('sample');
    const desk = await deskPort.get().teacherDesk();
    expect(desk.classes.length).toBeGreaterThan(0);
    expect(desk.timetable).toBeNull();
  });

  it('counts each class roll and what waits to be marked', () => {
    const desk = sampleTeacherDesk();
    for (const r of desk.roll) {
      expect(r.present + r.late + r.absent + r.excused).toBeLessThanOrEqual(r.total);
      if (!r.taken) expect(r.present + r.late + r.absent + r.excused).toBe(0);
    }
    const c = deskCounts(desk);
    expect(c.waitingToMark).toBe(desk.marking.reduce((n, m) => n + m.waiting, 0));
    expect(c.rollsToTake).toBe(desk.roll.filter((r) => !r.taken).length);
  });

  it('picks the next lesson by order in the first class', () => {
    const desk = sampleTeacherDesk();
    const next = nextLessonOf(desk);
    if (next) {
      const same = desk.lessons.filter((l) => l.classId === next.classId);
      expect(Math.min(...same.map((l) => l.order))).toBe(next.order);
    }
    expect(nextLessonOf({ ...desk, classes: [] })).toBeNull();
  });

  it('can be swapped for another source and back', async () => {
    const empty = { ...sampleTeacherDesk(), classes: [], roll: [] };
    deskPort.use({ source: 'server', teacherDesk: async () => empty });
    expect((await deskPort.get().teacherDesk()).classes).toEqual([]);
    deskPort.reset();
    expect(deskPort.get().source).toBe('sample');
  });
});
