import { implement } from '../orpc';
import { ORPCError } from '@orpc/server';
import { educationalORPCContract } from '@repo/core/api/educational.orpc.contract';
import type { ORPCContext } from '../orpc';
import { doubleGateMiddleware } from '../orpcMiddleware';

const impl = implement(educationalORPCContract).$context<ORPCContext>();
const iso = (value: unknown) => value instanceof Date ? value.toISOString() : String(value ?? '');

const mapClassroom = (row: any) => ({
  id: String(row.id), school_id: row.school_id ?? null, grade_id: row.grade_id ?? null, teacher_id: row.teacher_id ?? null,
  section_id: row.section_id ?? null, name: String(row.name ?? ''), handle: row.handle ?? null, subject: row.subject ?? null,
  description: row.description ?? null, color_theme: row.color_theme ?? null, is_archived: Boolean(row.is_archived),
  academic_year: String(row.academic_year ?? ''), created_at: iso(row.created_at), updated_at: iso(row.updated_at),
  teacher_name: row.teacher?.full_name ?? null,
  ...(row._count?.students !== undefined ? { student_count: Number(row._count.students) } : {}),
  ...(row._count?.lessons !== undefined ? { lesson_count: Number(row._count.lessons) } : {}),
});
const mapClassroomStudent = (row: any) => ({
  id: String(row.id), classroom_id: String(row.classroom_id), student_id: row.student_id ?? null,
  full_name: row.full_name ?? null, invite_code: row.invite_code ?? null,
  roll_number: row.roll_number == null ? null : Number(row.roll_number),
  enrolled_at: iso(row.enrolled_at), claimed_at: row.claimed_at ? iso(row.claimed_at) : null,
});
const mapClassroomNote = (row: any) => ({
  id: String(row.id), classroom_id: String(row.classroom_id), author_id: String(row.author_id), content: String(row.content ?? ''),
  note_type: String(row.note_type ?? 'note'), visibility: String(row.visibility ?? 'private'), is_pinned: Boolean(row.is_pinned),
  created_at: iso(row.created_at), updated_at: iso(row.updated_at), author_name: row.author?.full_name ?? null,
});
const mapClassroomNoteEvent = (row: any) => ({
  id: String(row.id), note_id: String(row.note_id), classroom_id: String(row.classroom_id), author_id: String(row.author_id),
  event_type: String(row.event_type), note_type: String(row.note_type), visibility: String(row.visibility), is_pinned: Boolean(row.is_pinned),
  snapshot: (row.snapshot && typeof row.snapshot === 'object') ? row.snapshot : {}, occurred_at: iso(row.occurred_at), recorded_at: iso(row.recorded_at),
  effective_from: row.effective_from ? iso(row.effective_from) : null, effective_to: row.effective_to ? iso(row.effective_to) : null, recorded_by: row.recorded_by ?? null,
});
const noteEventData = (note: any, eventType: string, recordedBy: string) => ({
  note_id: String(note.id), classroom_id: String(note.classroom_id), author_id: String(note.author_id), event_type: eventType,
  note_type: String(note.note_type ?? 'note'), visibility: String(note.visibility ?? 'private'), is_pinned: Boolean(note.is_pinned),
  snapshot: { id: String(note.id), classroom_id: String(note.classroom_id), author_id: String(note.author_id), content: String(note.content ?? ''), note_type: String(note.note_type ?? 'note'), visibility: String(note.visibility ?? 'private'), is_pinned: Boolean(note.is_pinned), created_at: iso(note.created_at), updated_at: iso(note.updated_at), author_name: note.author?.full_name ?? null },
  occurred_at: new Date(), effective_from: note.created_at ?? new Date(), recorded_by: recordedBy,
});
const mapMaterial = (row: any) => ({
  id: String(row.id), classroom_id: String(row.classroom_id), lesson_id: row.lesson_id ?? null, title: String(row.title ?? ''),
  type: String(row.type ?? 'link'), url: row.url ?? null, content: row.content ?? null, is_pinned: Boolean(row.is_pinned),
  created_at: iso(row.created_at), updated_at: iso(row.updated_at),
});
const mapAssignment = (row: any) => ({
  id: String(row.id), classroom_id: String(row.classroom_id), lesson_id: row.lesson_id ?? null, title: String(row.title ?? ''),
  description: row.description ?? null, due_date: row.due_date ? iso(row.due_date) : null, max_points: Number(row.max_points ?? 100),
  created_at: iso(row.created_at), updated_at: iso(row.updated_at),
});
const mapSubmission = (row: any) => ({
  id: String(row.id), assignment_id: String(row.assignment_id), student_id: String(row.student_id), content: row.content ?? null,
  submitted_at: iso(row.submitted_at), classroom_id: String(row.assignment?.classroom_id ?? row.classroom_id ?? ''), grade: row.grade == null ? null : Number(row.grade), feedback: row.feedback ?? null,
  graded_at: row.graded_at ? iso(row.graded_at) : null, idempotency_key: row.idempotency_key ?? null,
});

export const educationalRouter = impl.router({
  getByTeacher: impl.getByTeacher.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    if (!context.db) throw new Error('Database context not initialized');
    const rows = await (context.db as any).classroom.findMany({ where: { teacher_id: input.teacherId }, take: input.limit ?? 20, skip: input.offset ?? 0, orderBy: { created_at: 'desc' }, include: { school: { select: { name: true, avatar_url: true } } } });
    return rows.map(mapClassroom);
  }),
  getByStudent: impl.getByStudent.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    if (!context.db) throw new Error('Database context not initialized');
    const rows = await (context.db as any).classroom.findMany({ where: { students: { some: { student_id: input.studentId } } }, orderBy: { created_at: 'desc' }, include: { teacher: { select: { full_name: true } } } });
    return rows.map(mapClassroom);
  }),
  getTeacherStats: impl.getTeacherStats.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    if (!context.db) throw new Error('Database context not initialized');
    const rows = await (context.db as any).classroom.findMany({ where: { teacher_id: input.id }, include: { students: true } });
    return { active_classes: rows.filter((row: any) => !row.is_archived).length, total_students: rows.reduce((count: number, row: any) => count + (Array.isArray(row.students) ? row.students.length : 0), 0) };
  }),
  getById: impl.getById.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    if (!context.db) throw new Error('Database context not initialized');
    const row = await (context.db as any).classroom.findUnique({ where: { id: input.id }, include: { teacher: { select: { full_name: true, avatar_url: true } }, _count: { select: { students: true, lessons: true } } } });
    if (!row) throw new ORPCError('NOT_FOUND', { message: 'Classroom not found' });
    return mapClassroom(row);
  }),
  createClassroom: impl.createClassroom.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    if (!context.db) throw new Error('Database context not initialized');
    const row = await (context.db as any).classroom.create({
      data: {
        name: input.name.trim(), teacher_id: input.teacherId, school_id: input.schoolId,
        grade_id: input.gradeId, section_id: input.sectionId, subject: input.subject,
        description: input.description, handle: input.handle, color_theme: input.colorTheme,
        academic_year: input.academicYear ?? String(new Date().getUTCFullYear()),
      },
      include: { teacher: { select: { full_name: true, avatar_url: true } }, _count: { select: { students: true, lessons: true } } },
    });
    return mapClassroom(row);
  }),
  updateClassroom: impl.updateClassroom.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    if (!context.db) throw new Error('Database context not initialized');
    const { id, ...updates } = input;
    const row = await (context.db as any).classroom.update({
      where: { id },
      data: {
        ...(updates.name !== undefined && { name: updates.name.trim() }), ...(updates.teacherId !== undefined && { teacher_id: updates.teacherId }),
        ...(updates.schoolId !== undefined && { school_id: updates.schoolId }), ...(updates.gradeId !== undefined && { grade_id: updates.gradeId }),
        ...(updates.sectionId !== undefined && { section_id: updates.sectionId }), ...(updates.subject !== undefined && { subject: updates.subject }),
        ...(updates.description !== undefined && { description: updates.description }), ...(updates.handle !== undefined && { handle: updates.handle }),
        ...(updates.colorTheme !== undefined && { color_theme: updates.colorTheme }), ...(updates.isArchived !== undefined && { is_archived: updates.isArchived }),
      },
      include: { teacher: { select: { full_name: true, avatar_url: true } }, _count: { select: { students: true, lessons: true } } },
    });
    return mapClassroom(row);
  }),
  deleteClassroom: impl.deleteClassroom.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    if (!context.db) throw new Error('Database context not initialized');
    await (context.db as any).classroom.delete({ where: { id: input.id } });
    return { success: true };
  }),
  getClassroomResources: impl.getClassroomResources.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    if (!context.db) throw new Error('Database context not initialized');
    const rows = await (context.db as any).classroomResource.findMany({ where: { classroom_id: input.classroomId }, orderBy: [{ is_pinned: 'desc' }, { created_at: 'desc' }] });
    return rows.map((row: any) => ({ id: String(row.id), classroom_id: String(row.classroom_id), title: String(row.title ?? ''), description: row.description ?? null, url: row.url ?? null, is_pinned: Boolean(row.is_pinned), created_at: iso(row.created_at), updated_at: iso(row.updated_at) }));
  }),
  createLesson: impl.createLesson.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    if (!context.db) throw new Error('Database context not initialized');
    const row = await (context.db as any).lesson.create({ data: { ...input, published_at: input.published_at ? new Date(input.published_at) : null } });
    return { id: String(row.id), classroom_id: String(row.classroom_id), title: String(row.title ?? ''), content: row.content ?? null, order_index: Number(row.order_index ?? 0), published_at: row.published_at ? iso(row.published_at) : null, created_at: iso(row.created_at), updated_at: iso(row.updated_at) };
  }),
  getClassroomStudents: impl.getClassroomStudents.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    const rows = await (context.db as any).classroomStudent.findMany({ where: { classroom_id: input.classroomId }, orderBy: [{ roll_number: 'asc' }, { enrolled_at: 'asc' }] });
    return rows.map(mapClassroomStudent);
  }),
  enrollStudent: impl.enrollStudent.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    const db = context.db as any;
    const existing = await db.classroomStudent.findFirst({ where: { classroom_id: input.classroomId, student_id: input.studentId } });
    const row = existing
      ? await db.classroomStudent.update({ where: { id: existing.id }, data: { roll_number: input.rollNumber } })
      : await db.classroomStudent.create({ data: { classroom_id: input.classroomId, student_id: input.studentId, roll_number: input.rollNumber } });
    return mapClassroomStudent(row);
  }),
  addShadowStudent: impl.addShadowStudent.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    const row = await (context.db as any).classroomStudent.create({ data: { classroom_id: input.classroomId, full_name: input.fullName.trim(), roll_number: input.rollNumber } });
    return mapClassroomStudent(row);
  }),
  updateClassroomStudent: impl.updateClassroomStudent.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    const row = await (context.db as any).classroomStudent.update({ where: { id: input.id }, data: { full_name: input.fullName?.trim(), roll_number: input.rollNumber } });
    return mapClassroomStudent(row);
  }),
  removeClassroomStudent: impl.removeClassroomStudent.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    await (context.db as any).classroomStudent.delete({ where: { id: input.id } });
    return { success: true };
  }),
  claimShadowStudent: impl.claimShadowStudent.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    const db = context.db as any;
    const row = await db.classroomStudent.findUnique({ where: { invite_code: input.inviteCode } });
    if (!row) throw new ORPCError('NOT_FOUND', { message: 'Invite code not found' });
    const claimed = await db.classroomStudent.update({ where: { id: row.id }, data: { student_id: context.user.id, claimed_at: new Date() } });
    return mapClassroomStudent(claimed);
  }),
  getClassroomNotes: impl.getClassroomNotes.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    const rows = await (context.db as any).classroomNote.findMany({ where: { classroom_id: input.classroomId, created_at: input.viewDate ? { lte: new Date(input.viewDate) } : undefined }, orderBy: [{ is_pinned: 'desc' }, { created_at: 'desc' }], include: { author: { select: { full_name: true } } } });
    return rows.map(mapClassroomNote);
  }),
  getClassroomNoteSnapshot: impl.getClassroomNoteSnapshot.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    const events = await (context.db as any).classroomNoteEvent.findMany({ where: { classroom_id: input.classroomId, occurred_at: { lte: new Date(input.viewDate) } }, orderBy: [{ occurred_at: 'desc' }, { recorded_at: 'desc' }] });
    const latest = new Map<string, any>();
    for (const event of events) {
      const noteId = String(event.note_id);
      if (!latest.has(noteId) && event.event_type !== 'delete') latest.set(noteId, event.snapshot);
    }
    return Array.from(latest.values()).map(mapClassroomNote);
  }),
  getClassroomNoteTimeline: impl.getClassroomNoteTimeline.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    const events = await (context.db as any).classroomNoteEvent.findMany({ where: { note_id: input.id, classroom_id: input.classroomId }, orderBy: [{ occurred_at: 'desc' }, { recorded_at: 'desc' }] });
    return events.map(mapClassroomNoteEvent);
  }),
  createClassroomNote: impl.createClassroomNote.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    const db = context.db as any;
    const row = await db.classroomNote.create({ data: { classroom_id: input.classroomId, author_id: context.user.id, content: input.content.trim(), note_type: input.noteType ?? 'note', visibility: input.visibility ?? 'private' }, include: { author: { select: { full_name: true } } } });
    await db.classroomNoteEvent.create({ data: noteEventData(row, 'create', context.user.id) });
    return mapClassroomNote(row);
  }),
  updateClassroomNote: impl.updateClassroomNote.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    const db = context.db as any;
    const row = await db.classroomNote.update({ where: { id: input.id }, data: { content: input.content?.trim(), is_pinned: input.isPinned, visibility: input.visibility }, include: { author: { select: { full_name: true } } } });
    await db.classroomNoteEvent.create({ data: noteEventData(row, 'update', context.user.id) });
    return mapClassroomNote(row);
  }),
  deleteClassroomNote: impl.deleteClassroomNote.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    const db = context.db as any;
    const row = await db.classroomNote.findUnique({ where: { id: input.id }, include: { author: { select: { full_name: true } } } });
    await db.classroomNote.delete({ where: { id: input.id } });
    if (row) await db.classroomNoteEvent.create({ data: { ...noteEventData(row, 'delete', context.user.id), effective_to: new Date() } });
    return { success: true };
  }),
  getMaterials: impl.getMaterials.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    const rows = await (context.db as any).material.findMany({ where: { classroom_id: input.classroomId }, orderBy: [{ is_pinned: 'desc' }, { created_at: 'desc' }] });
    return rows.map(mapMaterial);
  }),
  getLessonMaterials: impl.getLessonMaterials.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    const rows = await (context.db as any).material.findMany({ where: { lesson_id: input.lessonId }, orderBy: [{ is_pinned: 'desc' }, { created_at: 'desc' }] });
    return rows.map(mapMaterial);
  }),
  createMaterial: impl.createMaterial.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    const row = await (context.db as any).material.create({ data: { classroom_id: input.classroomId, lesson_id: input.lessonId, title: input.title.trim(), type: input.type, url: input.url, content: input.content, is_pinned: input.isPinned ?? false } });
    return mapMaterial(row);
  }),
  updateMaterial: impl.updateMaterial.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    const row = await (context.db as any).material.update({ where: { id: input.id }, data: { title: input.title?.trim(), type: input.type, url: input.url, content: input.content, is_pinned: input.isPinned } });
    return mapMaterial(row);
  }),
  deleteMaterial: impl.deleteMaterial.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    await (context.db as any).material.delete({ where: { id: input.id } });
    return { success: true };
  }),
  getAssignments: impl.getAssignments.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    const rows = await (context.db as any).assignment.findMany({ where: { classroom_id: input.classroomId }, orderBy: [{ due_date: 'asc' }, { created_at: 'desc' }] });
    return rows.map(mapAssignment);
  }),
  getLessonAssignments: impl.getLessonAssignments.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    const rows = await (context.db as any).assignment.findMany({ where: { lesson_id: input.lessonId }, orderBy: [{ due_date: 'asc' }, { created_at: 'desc' }] });
    return rows.map(mapAssignment);
  }),
  createAssignment: impl.createAssignment.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    const row = await (context.db as any).assignment.create({ data: { classroom_id: input.classroomId, lesson_id: input.lessonId, title: input.title.trim(), description: input.description, due_date: input.dueDate ? new Date(input.dueDate) : null, max_points: input.maxPoints ?? 100 } });
    return mapAssignment(row);
  }),
  updateAssignment: impl.updateAssignment.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    const row = await (context.db as any).assignment.update({ where: { id: input.id }, data: { title: input.title?.trim(), description: input.description, due_date: input.dueDate === undefined ? undefined : input.dueDate ? new Date(input.dueDate) : null, max_points: input.maxPoints } });
    return mapAssignment(row);
  }),
  deleteAssignment: impl.deleteAssignment.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    await (context.db as any).assignment.delete({ where: { id: input.id } });
    return { success: true };
  }),
  getStudentSubmissions: impl.getStudentSubmissions.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    const rows = await (context.db as any).assignmentSubmission.findMany({ where: { student_id: input.studentId, assignment: input.classroomId ? { classroom_id: input.classroomId } : undefined }, orderBy: { submitted_at: 'desc' }, take: 24, include: { assignment: { select: { classroom_id: true } } } });
    return rows.map(mapSubmission);
  }),
  getUpcomingAssignments: impl.getUpcomingAssignments.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    const rows = await (context.db as any).assignment.findMany({ where: { classroom: { students: { some: { student_id: input.studentId } } }, due_date: { gte: new Date() } }, orderBy: { due_date: 'asc' }, take: input.limit ?? 6, include: { classroom: { select: { name: true } }, submissions: { where: { student_id: input.studentId }, select: { id: true } } } });
    return rows.map((row: any) => ({ ...mapAssignment(row), classroom: row.classroom?.name ?? null, submitted: Array.isArray(row.submissions) && row.submissions.length > 0 }));
  }),
  submitAssignment: impl.submitAssignment.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    const db = context.db as any;
    const where = input.idempotencyKey ? { idempotency_key: input.idempotencyKey } : { assignment_id_student_id: { assignment_id: input.assignmentId, student_id: context.user.id } };
    const existing = await db.assignmentSubmission.findUnique({ where });
    if (existing) return mapSubmission(existing);
    const row = await db.assignmentSubmission.create({ data: { assignment_id: input.assignmentId, student_id: context.user.id, content: input.content, idempotency_key: input.idempotencyKey }, include: { assignment: { select: { classroom_id: true } } } });
    return mapSubmission(row);
  }),
  gradeAssignmentSubmission: impl.gradeAssignmentSubmission.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    const row = await (context.db as any).assignmentSubmission.update({ where: { id: input.id }, data: { grade: input.grade, feedback: input.feedback, graded_at: input.grade == null ? null : new Date() }, include: { assignment: { select: { classroom_id: true } } } });
    return mapSubmission(row);
  }),
});
