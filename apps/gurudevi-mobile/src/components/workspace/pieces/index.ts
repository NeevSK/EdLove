import {
  type GuardianDesk,
  type PrincipalDesk,
  type StudentDesk,
  type TeacherDesk,
  type WorkDeskPort,
} from '@repo/classroom/deskPort';
import type { ReactNode } from 'react';
import type { PieceContext } from './common';
import { guardianPiece } from './guardian';
import { principalPiece } from './principal';
import { studentPiece } from './student';
import { teacherPiece } from './teacher';

export type { PieceContext } from './common';

/** The work rooms that have real pieces, by the plan's capacity. */
export type WorkDesk =
  | { capacity: 'teacher'; desk: TeacherDesk }
  | { capacity: 'student'; desk: StudentDesk }
  | { capacity: 'guardian'; desk: GuardianDesk }
  | { capacity: 'principal'; desk: PrincipalDesk };

export type DeskCapacity = WorkDesk['capacity'];

export const hasDesk = (capacity: string): capacity is DeskCapacity =>
  capacity === 'teacher' ||
  capacity === 'student' ||
  capacity === 'guardian' ||
  capacity === 'principal';

/** Asks the port for the desk this capacity's room shows. */
export async function loadWorkDesk(
  port: WorkDeskPort,
  capacity: DeskCapacity,
  signal?: AbortSignal,
): Promise<WorkDesk> {
  switch (capacity) {
    case 'teacher':
      return { capacity, desk: await port.teacherDesk(signal) };
    case 'student':
      return { capacity, desk: await port.studentDesk(signal) };
    case 'guardian':
      return { capacity, desk: await port.guardianDesk(signal) };
    case 'principal':
      return { capacity, desk: await port.principalDesk(signal) };
  }
}

/** Draws one piece for whichever room the desk belongs to; null when it has no real piece yet. */
export function workPiece(id: string, label: string, work: WorkDesk, ctx: PieceContext): ReactNode {
  switch (work.capacity) {
    case 'teacher':
      return teacherPiece(id, label, work.desk, ctx);
    case 'student':
      return studentPiece(id, label, work.desk, ctx);
    case 'guardian':
      return guardianPiece(id, label, work.desk, ctx);
    case 'principal':
      return principalPiece(id, label, work.desk, ctx);
  }
}
