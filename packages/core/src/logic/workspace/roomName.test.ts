import { describe, expect, it } from 'vitest';
import { CapacitySchema } from '@repo/core/logic/schemas/capacity.schema';
import { workspaceRoomNameOf } from '@repo/core/logic/workspace/roomName';

describe('workspaceRoomNameOf', () => {
  it('names the room for the role, never "Workspace"', () => {
    expect(
      workspaceRoomNameOf({
        perspectiveKind: 'institutional',
        capacity: 'teacher',
      }).fallback,
    ).toBe('Classroom');
    expect(
      workspaceRoomNameOf({
        perspectiveKind: 'institutional',
        capacity: 'principal',
      }).fallback,
    ).toBe('School');
    expect(
      workspaceRoomNameOf({
        perspectiveKind: 'institutional',
        capacity: 'student',
      }).fallback,
    ).toBe('Learning');
    expect(
      workspaceRoomNameOf({
        perspectiveKind: 'institutional',
        capacity: 'sectionHead',
      }).fallback,
    ).toBe('Section');
    expect(
      workspaceRoomNameOf({
        perspectiveKind: 'institutional',
        capacity: 'gradeHead',
      }).fallback,
    ).toBe('Grade');
    expect(
      workspaceRoomNameOf({
        perspectiveKind: 'institutional',
        capacity: 'founder',
      }).fallback,
    ).toBe('Platform');
    expect(workspaceRoomNameOf({ perspectiveKind: 'guardian', capacity: 'teacher' }).fallback).toBe(
      'Family',
    );
    expect(workspaceRoomNameOf({ perspectiveKind: 'commercial' }).fallback).toBe('Class');
    expect(workspaceRoomNameOf({ perspectiveKind: 'personal' }).fallback).toBe('Studio');
    expect(
      workspaceRoomNameOf({
        perspectiveKind: 'personal',
        studioType: 'learner',
      }).fallback,
    ).toBe('Learning');
  });

  it('gives every capacity a room name and falls back to Classroom', () => {
    for (const capacity of CapacitySchema.options) {
      const name = workspaceRoomNameOf({ capacity });
      expect(name.key.startsWith('tabs.')).toBe(true);
      expect(name.fallback).not.toBe('Workspace');
    }
    expect(workspaceRoomNameOf({ capacity: 'unknown' }).fallback).toBe('Classroom');
    expect(workspaceRoomNameOf({}).fallback).toBe('Classroom');
  });
});
