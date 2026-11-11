import { describe, expect, it } from 'vitest';
import { workspaceRoomNameOf } from '@repo/core/logic/workspace/roomName';

const nameOf = (capacity: string | null, commercial = false) =>
  workspaceRoomNameOf({ capacity, commercial }).fallback;

describe('workspaceRoomNameOf', () => {
  it('names the room for the capacity in the active bond', () => {
    expect(nameOf('teacher')).toBe('Classroom');
    expect(nameOf('principal')).toBe('School');
    expect(nameOf('assistantPrincipal')).toBe('School');
    expect(nameOf('student')).toBe('Learning');
    expect(nameOf('guardian')).toBe('Family');
    expect(nameOf('parent')).toBe('Family');
    expect(nameOf('sectionHead')).toBe('Section');
    expect(nameOf('gradeHead')).toBe('Grade');
    expect(nameOf('founder')).toBe('Platform');
  });

  it('keeps the name when only the entity kind changes', () => {
    expect(nameOf('teacher', true)).toBe(nameOf('teacher'));
    expect(nameOf('lead_tutor', true)).toBe('Classroom');
    expect(nameOf('paper_marker', true)).toBe('Classroom');
    expect(nameOf('founder', true)).toBe('Institute');
  });

  it('calls any other capacity a Workspace', () => {
    expect(nameOf('librarian')).toBe('Workspace');
    expect(nameOf('nurse')).toBe('Workspace');
    expect(nameOf('member')).toBe('Workspace');
    expect(nameOf('constructor')).toBe('Workspace');
    expect(nameOf(null)).toBe('Workspace');
  });
});
