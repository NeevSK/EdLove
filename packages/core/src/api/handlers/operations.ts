import type { Context } from 'hono';

/**
 * Operations Domain Handlers (Hono + ZenStack ReBAC)
 */
export const operationsHandlers = {
  /**
   * Retrieve attendance records.
   */
  getAttendance: async (c: Context) => {
    const db = c.get('db');
    const { classroom_id, date } = c.req.query();

    const records = await db.attendanceRecord.findMany({
      where: {
        classroom_id,
        date: date ? { equals: date } : undefined,
      },
      orderBy: { created_at: 'desc' },
      include: {
        student: {
          select: { full_name: true, avatar_url: true },
        },
      },
    });

    return c.json(records, 200);
  },

  /**
   * Record a single attendance entry.
   */
  recordAttendance: async (c: Context) => {
    const db = c.get('db');
    const body = await c.req.json();

    const record = await db.attendanceRecord.upsert({
      where: {
        student_id_classroom_id_date: {
          student_id: body.student_id,
          classroom_id: body.classroom_id,
          date: body.date,
        },
      },
      update: {
        status: body.status,
      },
      create: {
        student_id: body.student_id,
        classroom_id: body.classroom_id,
        status: body.status,
        date: body.date,
      },
    });

    return c.json(record, 201);
  },

  /**
   * Batch record attendance.
   * Uses a loop with upserts to ensure ReBAC is checked per record.
   */
  batchRecordAttendance: async (c: Context) => {
    const db = c.get('db');
    const records = await c.req.json();

    const results: any[] = [];
    for (const item of records) {
      const record = await db.attendanceRecord.upsert({
        where: {
          student_id_classroom_id_date: {
            student_id: item.student_id,
            classroom_id: item.classroom_id,
            date: item.date,
          },
        },
        update: {
          status: item.status,
        },
        create: {
          student_id: item.student_id,
          classroom_id: item.classroom_id,
          status: item.status,
          date: item.date,
        },
      });
      results.push(record);
    }

    return c.json(results, 200);
  },

  /**
   * Retrieve school attendance pulse.
   */
  getSchoolAttendancePulse: async (c: Context) => {
    const db = c.get('db');
    const { school_id, classroom_id, view_date } = c.req.query();

    // Aggregation logic for attendance pulse
    const records = await db.attendanceRecord.findMany({
      where: {
        classroom: {
          school_id: school_id,
          id: classroom_id || undefined,
        },
        date: view_date || undefined,
      },
      select: {
        status: true,
      },
    });

    const stats = {
      present: records.filter((r: any) => r.status === 'present').length,
      absent: records.filter((r: any) => r.status === 'absent').length,
      late: records.filter((r: any) => r.status === 'late').length,
      total: records.length,
    };

    return c.json({ stats, view_date: view_date || new Date().toISOString() }, 200);
  },
};
