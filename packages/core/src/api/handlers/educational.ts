import type { Context } from 'hono';

/**
 * Educational Domain Handlers (Hono + ZenStack ReBAC)
 */
export const educationalHandlers = {
  /**
   * Retrieve classrooms by teacher.
   */
  getByTeacher: async (c: Context) => {
    const db = c.get('db');
    const { teacher_id, limit, offset } = c.req.query();

    const classrooms = await db.classroom.findMany({
      where: { teacher_id },
      take: Number(limit) || 20,
      skip: Number(offset) || 0,
      orderBy: { created_at: 'desc' },
      include: {
        school: {
          select: { name: true, avatar_url: true },
        },
      },
    });

    return c.json(classrooms, 200);
  },

  /**
   * Retrieve a single classroom by ID.
   */
  getById: async (c: Context) => {
    const db = c.get('db');
    const { id } = c.req.param();

    const classroom = await db.classroom.findUnique({
      where: { id },
      include: {
        teacher: {
          select: { full_name: true, avatar_url: true },
        },
        _count: {
          select: { students: true, lessons: true },
        },
      },
    });

    if (!classroom) return c.json({ message: 'Classroom not found' }, 404);
    return c.json(classroom, 200);
  },

  /**
   * Create a new lesson.
   */
  createLesson: async (c: Context) => {
    const db = c.get('db');
    const body = await c.req.json();

    const lesson = await db.lesson.create({
      data: body,
    });

    return c.json(lesson, 201);
  },

  /**
   * Get classroom resources.
   */
  getClassroomResources: async (c: Context) => {
    const db = c.get('db');
    const { classroomId } = c.req.param();

    const resources = await db.classroomResource.findMany({
      where: { classroom_id: classroomId },
      orderBy: [{ is_pinned: 'desc' }, { created_at: 'desc' }],
    });

    return c.json(resources, 200);
  },
};
