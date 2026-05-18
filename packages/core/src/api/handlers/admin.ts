import { type Context } from 'hono';

/**
 * Admin Domain Handlers (Hono + ZenStack ReBAC)
 */
export const adminHandlers = {
  /**
   * Get staff presence summary.
   */
  getStaffPresence: async (c: Context) => {
    const db = c.get('db');
    const { schoolId } = c.req.param();
    const { viewDate } = c.req.query();
    const date = viewDate || new Date().toISOString().split('T')[0];

    const records = await db.staffAttendance.findMany({
      where: { school_id: schoolId, date },
    });

    return c.json({
      present: records.filter((r: any) => r.status === 'present' || r.status === 'late').length,
      absent: records.filter((r: any) => r.status === 'absent').length,
      onLeave: records.filter((r: any) => r.status === 'on_leave' || r.status === 'half_day').length,
      total: records.length,
    }, 200);
  },

  /**
   * Get teacher carousel items.
   */
  getTeacherCarousel: async (c: Context) => {
    const db = c.get('db');
    const { schoolId } = c.req.param();
    const { viewDate } = c.req.query();
    const date = viewDate || new Date().toISOString().split('T')[0];

    // Aggregated query for staff info
    const staff = await db.user.findMany({
      where: {
        bonds: {
          some: {
            entity_id: schoolId,
            entity_type: 'SCHOOL',
            capacity: { in: ['teacher', 'grade_head', 'principal'] }
          }
        }
      },
      include: {
        staff_attendance: {
          where: { date },
          select: { status: true }
        },
        _count: {
          select: { classrooms: { where: { school_id: schoolId } } }
        }
      }
    });

    return c.json(staff.map((u: any) => ({
      userId: u.id,
      fullName: u.full_name || '',
      capacity: 'teacher', // Simplified for demo
      todayStatus: u.staff_attendance[0]?.status || null,
      classroomCount: u._count.classrooms,
      avatarUrl: u.avatar_url,
    })), 200);
  },

  /**
   * Submit leave request.
   */
  submitLeave: async (c: Context) => {
    const db = c.get('db');
    const body = await c.req.json();

    await db.staffLeave.create({
      data: {
        school_id: body.schoolId,
        user_id: body.userId,
        leave_type: body.leaveType,
        start_date: body.startDate,
        end_date: body.endDate,
        reason: body.reason,
      }
    });

    return c.json({ success: true }, 201);
  },

  /**
   * Get school details.
   */
  getSchool: async (c: Context) => {
    const db = c.get('db');
    const { id } = c.req.param();

    const school = await db.school.findUnique({
      where: { id },
      include: {
        _count: {
          select: { classrooms: true, bonds: true }
        }
      }
    });

    if (!school) return c.json({ message: 'School not found' }, 404);
    return c.json(school, 200);
  },
};
