import {
  MOCK_ANNOUNCEMENTS,
  MOCK_ASSIGNMENTS,
  MOCK_ATTENDANCE_SNAPSHOTS,
  MOCK_CLASSROOM_NOTES,
  MOCK_CLASSROOMS,
  MOCK_DIRECT_CONVERSATIONS,
  MOCK_LESSONS,
  MOCK_STUDENT_SUBMISSIONS,
  MOCK_STUDENTS,
} from '@repo/core/api/mockData';
import { answer, definePort, type PortSource } from '@repo/core/ports/definePort';

/**
 * What a teacher's work room shows, shaped for the room rather than for the
 * tables behind it. Every date is an ISO string so the room can say it in the
 * person's language and calendar.
 */
export interface DeskClass {
  id: string;
  name: string;
  subject: string;
  students: number;
}

export interface DeskRoll {
  classId: string;
  className: string;
  /** False until today's roll is marked for this class. */
  taken: boolean;
  present: number;
  late: number;
  absent: number;
  excused: number;
  total: number;
}

export interface DeskMarking {
  assignmentId: string;
  title: string;
  className: string;
  /** Handed in and not yet marked. */
  waiting: number;
}

export interface DeskLesson {
  id: string;
  title: string;
  classId: string;
  className: string;
  order: number;
}

export interface DeskAssignment {
  id: string;
  title: string;
  className: string;
  dueAt: string | null;
}

export interface DeskNote {
  id: string;
  text: string;
  className: string;
  pinned: boolean;
  at: string;
}

export interface DeskNotice {
  id: string;
  text: string;
  author: string;
  pinned: boolean;
  at: string;
}

export interface DeskConversation {
  id: string;
  name: string;
  last: string;
  at: string;
  unread: number;
}

export interface TeacherDesk {
  classes: readonly DeskClass[];
  roll: readonly DeskRoll[];
  marking: readonly DeskMarking[];
  lessons: readonly DeskLesson[];
  assignments: readonly DeskAssignment[];
  notes: readonly DeskNote[];
  notices: readonly DeskNotice[];
  conversations: readonly DeskConversation[];
  /** Timetable and school events have no source yet; the room says so. */
  timetable: null;
  events: null;
}

export interface DeskPort extends PortSource {
  teacherDesk(signal?: AbortSignal): Promise<TeacherDesk>;
}

const iso = (d: Date | string | null | undefined) =>
  d == null ? null : typeof d === 'string' ? d : d.toISOString();

/** Builds the teacher's desk from the shared samples (the same ones web shows). */
export function sampleTeacherDesk(): TeacherDesk {
  const classes = MOCK_CLASSROOMS.filter((c) => !c.is_archived);
  const nameOf = new Map(classes.map((c) => [c.id, c.name]));
  const studentsIn = (id: string) =>
    MOCK_STUDENTS.filter((s) => s.classroom_id === id && s.status === 'active');

  const roll: DeskRoll[] = classes.map((c) => {
    const records = MOCK_ATTENDANCE_SNAPSHOTS[c.id]?.records ?? [];
    const count = (s: string) => records.filter((r) => r.status === s).length;
    return {
      classId: c.id,
      className: c.name,
      taken: records.length > 0,
      present: count('present'),
      late: count('late'),
      absent: count('absent'),
      excused: count('excused'),
      total: Math.max(records.length, studentsIn(c.id).length),
    };
  });

  const assignmentById = new Map(MOCK_ASSIGNMENTS.map((a) => [a.id, a]));
  const waitingBy = new Map<string, number>();
  for (const s of MOCK_STUDENT_SUBMISSIONS) {
    if (s.status !== 'submitted') continue;
    waitingBy.set(s.assignment_id, (waitingBy.get(s.assignment_id) ?? 0) + 1);
  }
  const marking: DeskMarking[] = [...waitingBy.entries()].flatMap(([id, waiting]) => {
    const a = assignmentById.get(id);
    return a
      ? [{ assignmentId: id, title: a.title, className: nameOf.get(a.classroom_id) ?? '', waiting }]
      : [];
  });

  return {
    classes: classes.map((c) => ({
      id: c.id,
      name: c.name,
      subject: c.subject ?? '',
      students: studentsIn(c.id).length,
    })),
    roll,
    marking,
    lessons: MOCK_LESSONS.filter((l) => nameOf.has(l.classroom_id)).map((l) => ({
      id: l.id,
      title: l.title,
      classId: l.classroom_id,
      className: nameOf.get(l.classroom_id) ?? '',
      order: l.order_index ?? 0,
    })),
    assignments: MOCK_ASSIGNMENTS.filter((a) => nameOf.has(a.classroom_id)).map((a) => ({
      id: a.id,
      title: a.title,
      className: nameOf.get(a.classroom_id) ?? '',
      dueAt: iso(a.due_date),
    })),
    notes: MOCK_CLASSROOM_NOTES.map((n) => ({
      id: n.id,
      text: n.content,
      className: nameOf.get(n.classroom_id) ?? '',
      pinned: n.is_pinned,
      at: n.updated_at,
    })),
    notices: MOCK_ANNOUNCEMENTS.map((a) => ({
      id: a.id,
      text: a.content,
      author: a.author_name ?? '',
      pinned: a.is_pinned,
      at: iso(a.created_at) ?? '',
    })),
    conversations: MOCK_DIRECT_CONVERSATIONS.filter((c) => !c.is_special).map((c) => ({
      id: c.id,
      name: c.participant_name,
      last: c.last_message,
      at: c.last_message_at,
      unread: c.unread_count,
    })),
    timetable: null,
    events: null,
  };
}

const sample: DeskPort = {
  source: 'sample',
  teacherDesk: (signal) => answer(sampleTeacherDesk(), signal),
};

/** Where the work room's records come from. Samples until the classroom module is admitted. */
export const deskPort = definePort<DeskPort>(sample);

/** The lesson to teach next: the first one by order in the first class. */
export function nextLessonOf(desk: TeacherDesk): DeskLesson | null {
  const first = desk.classes[0];
  if (!first) return null;
  return (
    [...desk.lessons].filter((l) => l.classId === first.id).sort((a, b) => a.order - b.order)[0] ??
    null
  );
}

/** Classes whose roll is not marked yet, then the total waiting to be marked. */
export function deskCounts(desk: TeacherDesk) {
  return {
    rollsToTake: desk.roll.filter((r) => !r.taken).length,
    waitingToMark: desk.marking.reduce((n, m) => n + m.waiting, 0),
    unread: desk.conversations.reduce((n, c) => n + c.unread, 0),
  };
}
