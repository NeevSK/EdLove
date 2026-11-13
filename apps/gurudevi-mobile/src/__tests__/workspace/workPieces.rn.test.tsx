import {
  sampleGuardianDesk,
  samplePrincipalDesk,
  sampleStudentDesk,
  sampleTeacherDesk,
} from '@repo/classroom/deskPort';
import { ROOM_PLANS } from '@repo/core/logic/floor';
import type { TFunction } from 'i18next';
import type { ReactElement } from 'react';
import { type WorkDesk, workPiece } from '@/components/workspace/pieces';
import type { PieceFrameProps } from '@/components/workspace/pieces/PieceFrame';
import { dueText, type PieceContext, teacherPiece } from '@/components/workspace/pieces/teacher';

/** English defaults with {{n}} filled, as i18next does without a catalogue. */
const t = ((key: string, def: string, vars?: Record<string, unknown>) =>
  (def ?? key).replace(/\{\{(\w+)\}\}/g, (_, k) =>
    String(vars?.[k] ?? ''),
  )) as unknown as TFunction;

const ctx = (open?: (id: string) => void, openable: string[] = []): PieceContext => ({
  t,
  locale: 'en',
  open,
  canOpen: (id) => openable.includes(id),
});

/** The frame a piece draws, read without a renderer (this engine has no Reanimated colours). */
const frame = (node: unknown) => (node as ReactElement<PieceFrameProps>).props;

describe('teacher work-room pieces', () => {
  const desk = sampleTeacherDesk();
  const plan = ROOM_PLANS['workspace:teacher']!;

  it('draws every piece in the teacher plan, titled with its own name', () => {
    for (const s of plan.surfaces) {
      const piece = teacherPiece(s.id, s.label, desk, ctx());
      expect(piece).not.toBeNull();
      expect(frame(piece).title).toBe(s.label);
    }
  });

  it('is not a button until it has somewhere to go', () => {
    const open = vi.fn();
    expect(frame(teacherPiece('events', 'Events', desk, ctx(open))).onOpen).toBeUndefined();
    frame(teacherPiece('events', 'Events', desk, ctx(open, ['events']))).onOpen?.();
    expect(open).toHaveBeenCalledWith('events');
  });

  it('lights the count when something waits, and says plainly when nothing does', () => {
    const waiting = frame(teacherPiece('marking', 'Marking', desk, ctx()));
    if (desk.marking.length > 0) expect(waiting.badge?.attention).toBe(true);
    const none = frame(teacherPiece('marking', 'Marking', { ...desk, marking: [] }, ctx()));
    expect(none.badge).toBeUndefined();
    expect(none.summary).toBe('Nothing waiting to be marked');
  });

  it('puts classes still to take the roll for in the badge', () => {
    const untaken = desk.roll.filter((r) => !r.taken).length;
    const p = frame(teacherPiece('attendance', 'Attendance', desk, ctx()));
    if (untaken > 0) expect(p.badge?.label).toBe(`${untaken} to take`);
    else expect(p.summary).toBe("Every class's roll is taken");
  });

  it('says due dates in words', () => {
    const now = Date.parse('2026-11-12T08:00:00Z');
    expect(dueText('2026-11-15T08:00:00Z', 'en', now)).toBe('in 3 days');
    expect(dueText('2026-11-13T08:00:00Z', 'en', now)).toBe('tomorrow');
    expect(dueText(null, 'en', now)).toBeNull();
  });

  it('returns nothing for a piece it does not know, so the floor falls back', () => {
    expect(teacherPiece('unknown', 'Unknown', desk, ctx())).toBeNull();
  });
});

describe('every work room has a real piece for each place on its floor', () => {
  const desks: WorkDesk[] = [
    { capacity: 'teacher', desk: sampleTeacherDesk() },
    { capacity: 'student', desk: sampleStudentDesk() },
    { capacity: 'guardian', desk: sampleGuardianDesk() },
    { capacity: 'principal', desk: samplePrincipalDesk() },
  ];
  for (const work of desks) {
    it(work.capacity, () => {
      const plan = ROOM_PLANS[`workspace:${work.capacity}`]!;
      for (const s of plan.surfaces) {
        const piece = workPiece(s.id, s.label, work, ctx());
        expect(piece, s.id).not.toBeNull();
        expect(frame(piece).title).toBe(s.label);
      }
    });
  }
});
