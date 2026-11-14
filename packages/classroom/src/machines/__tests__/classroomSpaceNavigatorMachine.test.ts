import {
  classroomSpaceNavigatorMachine,
  createClassroomSpaceNavigatorActor,
  DEFAULT_PERSPECTIVE_SURFACES,
  executePerspectiveResolutionEffect,
} from '@repo/classroom/machines/classroomSpaceNavigatorMachine';
import { describe, expect, it, vi } from 'vitest';
import { createActor } from 'xstate';

describe('ClassroomSpaceNavigatorMachine v6 + Effect-TS v4', () => {
  it('initializes in resolving state', () => {
    const actor = createActor(classroomSpaceNavigatorMachine);
    actor.start();

    expect(actor.getSnapshot().value).toBe('resolving');
    expect(actor.getSnapshot().context.selectedSurfaceId).toBe('overview');
  });

  it('initializes with INIT_NAVIGATOR into ready state with default teacher surfaces', () => {
    const actor = createClassroomSpaceNavigatorActor();
    actor.send({
      type: 'INIT_NAVIGATOR',
      perspective: 'teacher',
      classroomId: 'class-9B',
    });

    const snapshot = actor.getSnapshot();
    expect(snapshot.value).toBe('ready');
    expect(snapshot.context.activePerspective).toBe('teacher');
    expect(snapshot.context.selectedClassroomId).toBe('class-9B');
    expect(snapshot.context.selectedSurfaceId).toBe('overview');
    expect(snapshot.context.availableSurfaces).toEqual(DEFAULT_PERSPECTIVE_SURFACES.teacher);
  });

  it('switches perspective from teacher to student, resetting to valid student surfaces', () => {
    const actor = createClassroomSpaceNavigatorActor();
    actor.send({
      type: 'INIT_NAVIGATOR',
      perspective: 'teacher',
    });

    actor.send({ type: 'SWITCH_PERSPECTIVE', perspective: 'student' });

    const snapshot = actor.getSnapshot();
    expect(snapshot.context.activePerspective).toBe('student');
    expect(snapshot.context.availableSurfaces).toEqual(DEFAULT_PERSPECTIVE_SURFACES.student);
    expect(snapshot.context.selectedSurfaceId).toBe('overview');
  });

  it('permits selecting allowed surfaces and rejects unauthorized surfaces', () => {
    const actor = createClassroomSpaceNavigatorActor();
    actor.send({
      type: 'INIT_NAVIGATOR',
      perspective: 'teacher',
    });

    actor.send({ type: 'SELECT_SURFACE', surfaceId: 'gradebook' });
    expect(actor.getSnapshot().context.selectedSurfaceId).toBe('gradebook');
    expect(actor.getSnapshot().context.error).toBeNull();

    // Attempting to select an invalid surface for teacher
    actor.send({ type: 'SELECT_SURFACE', surfaceId: 'forbidden_secret_vault' });
    expect(actor.getSnapshot().context.selectedSurfaceId).toBe('gradebook');
    expect(actor.getSnapshot().context.error).toContain('forbidden_secret_vault');
  });

  it('updates selectedClassroomId via SELECT_CLASSROOM', () => {
    const actor = createClassroomSpaceNavigatorActor();
    actor.send({
      type: 'INIT_NAVIGATOR',
      perspective: 'guardian',
    });

    actor.send({ type: 'SELECT_CLASSROOM', classroomId: 'class-12-math' });
    expect(actor.getSnapshot().context.selectedClassroomId).toBe('class-12-math');
  });

  it('executes executePerspectiveResolutionEffect successfully', async () => {
    const actor = createClassroomSpaceNavigatorActor({
      selectedClassroomId: 'class-101',
    });

    const customSurfaces = [
      { id: 'overview', label: 'Dashboard' },
      { id: 'custom_lab', label: 'Virtual Physics Lab' },
    ];

    const mockFetch = vi.fn().mockResolvedValue(customSurfaces);

    const result = await executePerspectiveResolutionEffect(actor, 'teacher', {
      fetchSurfaces: mockFetch,
    });

    expect(result.success).toBe(true);
    expect(result.surfaces).toEqual(customSurfaces);
    expect(actor.getSnapshot().value).toBe('ready');
    expect(actor.getSnapshot().context.availableSurfaces).toEqual(customSurfaces);
    expect(actor.getSnapshot().context.selectedSurfaceId).toBe('overview');
  });

  it('handles executePerspectiveResolutionEffect failure and transitions to error', async () => {
    const actor = createClassroomSpaceNavigatorActor();

    const mockFetch = vi.fn().mockRejectedValue(new Error('Permission denied by Cedar policy'));

    const result = await executePerspectiveResolutionEffect(actor, 'principal', {
      fetchSurfaces: mockFetch,
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('Permission denied by Cedar policy');
    expect(actor.getSnapshot().value).toBe('error');
    expect(actor.getSnapshot().context.error).toBe('Permission denied by Cedar policy');
  });

  it('safely handles actor disposal/stop mid-flight in executePerspectiveResolutionEffect', async () => {
    const actor = createClassroomSpaceNavigatorActor();

    const mockFetch = vi.fn().mockImplementation(async () => {
      actor.stop();
      return [{ id: 'overview', label: 'Overview' }];
    });

    const result = await executePerspectiveResolutionEffect(actor, 'teacher', {
      fetchSurfaces: mockFetch,
    });

    expect(result.success).toBe(true);
    expect(actor.getSnapshot().status).toBe('stopped');
  });
});
