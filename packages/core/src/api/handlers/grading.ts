import type { Context } from 'hono';

/**
 * Grading Domain Handlers (Hono + ZenStack ReBAC)
 */
export const gradingHandlers = {
  /**
   * Retrieve report card for a student.
   */
  getReportCard: async (c: Context) => {
    const db = c.get('db');
    const { studentId } = c.req.query();

    const grades = await db.grade.findMany({
      where: { student_id: studentId },
      orderBy: { created_at: 'desc' },
      include: {
        classroom: { select: { name: true, subject: true } },
      },
    });

    return c.json(grades, 200);
  },

  /**
   * Retrieve grades for a classroom.
   */
  getClassroomGrades: async (c: Context) => {
    const db = c.get('db');
    const { classroomId } = c.req.query();

    const grades = await db.grade.findMany({
      where: { classroom_id: classroomId },
      orderBy: { created_at: 'desc' },
    });

    return c.json(grades, 200);
  },

  /**
   * Submit a new grade.
   * Includes server-side auditing and GPA calculation.
   */
  submitGrade: async (c: Context) => {
    const db = c.get('db');
    const user = c.get('user');
    const { studentId, classroomId, marks, assignmentId, feedback } = await c.req.json();

    const grade = await db.grade.create({
      data: {
        student_id: studentId,
        classroom_id: classroomId,
        marks,
        assignment_id: assignmentId,
        feedback,
        graded_by: user.id,
        grade: marks >= 75 ? 'A' : marks >= 65 ? 'B' : marks >= 50 ? 'C' : 'S',
        gpa: marks / 25,
      },
    });

    // SOVEREIGN AUDIT: Side effect at the source
    await db.sentinelAuditLog.create({
      data: {
        action: 'grade_submitted',
        entity_id: grade.id,
        entity_type: 'grade',
        executor_id: user.id,
        metadata: { marks, studentId, classroomId },
      },
    });

    return c.json(grade, 201);
  },

  /**
   * Publish a grade.
   */
  publishGrade: async (c: Context) => {
    const db = c.get('db');
    const user = c.get('user');
    const { id } = c.req.param();

    const grade = await db.grade.update({
      where: { id },
      data: {
        publication_state: 'published',
        published_at: new Date(),
      },
    });

    await db.sentinelAuditLog.create({
      data: {
        action: 'grade_published',
        entity_id: id,
        entity_type: 'grade',
        executor_id: user.id,
        metadata: { publication_state: 'published' },
      },
    });

    return c.json(grade, 200);
  },

  /**
   * Retrieve grading settings.
   */
  getGradingSettings: async (c: Context) => {
    const db = c.get('db');
    const { classroomId } = c.req.param();

    const settings = await db.classroomGradingSettings.findUnique({
      where: { classroom_id: classroomId },
    });

    if (!settings) return c.json({ message: 'Settings not found' }, 404);
    return c.json(settings, 200);
  },
};
