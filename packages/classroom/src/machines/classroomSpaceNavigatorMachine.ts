import { Cause, Effect, Exit } from 'effect';
import { createActor, createMachine, types } from 'xstate';
import { z } from 'zod';

export const ClassroomPerspectiveEnum = z.enum([
  'teacher',
  'student',
  'guardian',
  'principal',
  'wanderer',
]);
export type ClassroomPerspective = z.infer<typeof ClassroomPerspectiveEnum>;

export const ClassroomSurfaceDescriptorSchema = z.object({
  id: z.string(),
  label: z.string(),
  icon: z.string().optional(),
  requiredRole: z.string().optional(),
});
export type ClassroomSurfaceDescriptor = z.infer<typeof ClassroomSurfaceDescriptorSchema>;

export const ClassroomSpaceNavigatorContextSchema = z.object({
  activePerspective: ClassroomPerspectiveEnum.default('teacher'),
  selectedClassroomId: z.string().nullable().default(null),
  selectedSurfaceId: z.string().default('overview'),
  availableSurfaces: z.array(ClassroomSurfaceDescriptorSchema).default([]),
  isSwitching: z.boolean().default(false),
  error: z.string().nullable().default(null),
});
export type ClassroomSpaceNavigatorContext = z.infer<
  typeof ClassroomSpaceNavigatorContextSchema
>;

export type ClassroomSpaceNavigatorEvent =
  | {
      type: 'INIT_NAVIGATOR';
      perspective: ClassroomPerspective;
      classroomId?: string | null;
      defaultSurface?: string;
    }
  | { type: 'SWITCH_PERSPECTIVE'; perspective: ClassroomPerspective }
  | { type: 'SELECT_CLASSROOM'; classroomId: string }
  | { type: 'SELECT_SURFACE'; surfaceId: string }
  | {
      type: 'SET_AVAILABLE_SURFACES';
      surfaces: ClassroomSurfaceDescriptor[];
      targetSurface?: string;
    }
  | { type: 'NAVIGATION_ERROR'; error: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'RESET' };

export const initialClassroomSpaceNavigatorContext: ClassroomSpaceNavigatorContext = {
  activePerspective: 'teacher',
  selectedClassroomId: null,
  selectedSurfaceId: 'overview',
  availableSurfaces: [],
  isSwitching: false,
  error: null,
};

export const DEFAULT_PERSPECTIVE_SURFACES: Record<
  ClassroomPerspective,
  ClassroomSurfaceDescriptor[]
> = {
  teacher: [
    { id: 'overview', label: 'Class Overview', icon: 'School' },
    { id: 'attendance', label: 'Daily Attendance', icon: 'CheckSquare' },
    { id: 'gradebook', label: 'Gradebook & Scoring', icon: 'Award' },
    { id: 'students', label: 'Student Directory', icon: 'Users' },
    { id: 'insights', label: 'Class Analytics', icon: 'BarChart' },
  ],
  student: [
    { id: 'overview', label: 'My Classroom', icon: 'School' },
    { id: 'my_grades', label: 'My Report Card', icon: 'Award' },
    { id: 'attendance', label: 'My Attendance', icon: 'CheckSquare' },
    { id: 'assignments', label: 'Lesson Feed', icon: 'BookOpen' },
    { id: 'reflection', label: 'Reflections', icon: 'Sparkles' },
  ],
  guardian: [
    { id: 'overview', label: 'Ward Summary', icon: 'Heart' },
    { id: 'student_progress', label: 'Academic Standing', icon: 'TrendingUp' },
    { id: 'attendance_records', label: 'Attendance Ledger', icon: 'CheckSquare' },
    { id: 'teacher_notes', label: 'Educator Messages', icon: 'MessageCircle' },
  ],
  principal: [
    { id: 'overview', label: 'School Pulse', icon: 'Building' },
    { id: 'school_insights', label: 'Institutional Analytics', icon: 'BarChart2' },
    { id: 'attendance_audit', label: 'Attendance Audit', icon: 'ClipboardCheck' },
    { id: 'gradebook_overview', label: 'Academic Standard', icon: 'BookOpen' },
    { id: 'staff', label: 'Faculty Roster', icon: 'Shield' },
  ],
  wanderer: [
    { id: 'overview', label: 'Preview Class', icon: 'Compass' },
    { id: 'about', label: 'About Sanctuary', icon: 'Info' },
  ],
};

export const classroomSpaceNavigatorMachine = createMachine({
  id: 'classroomSpaceNavigator',
  initial: 'resolving',
  schemas: {
    context: ClassroomSpaceNavigatorContextSchema,
    events: {
      INIT_NAVIGATOR: types<{
        perspective: ClassroomPerspective;
        classroomId?: string | null;
        defaultSurface?: string;
      }>(),
      SWITCH_PERSPECTIVE: types<{ perspective: ClassroomPerspective }>(),
      SELECT_CLASSROOM: types<{ classroomId: string }>(),
      SELECT_SURFACE: types<{ surfaceId: string }>(),
      SET_AVAILABLE_SURFACES: types<{
        surfaces: ClassroomSurfaceDescriptor[];
        targetSurface?: string;
      }>(),
      NAVIGATION_ERROR: types<{ error: string }>(),
      CLEAR_ERROR: types<void>(),
      RESET: types<void>(),
    },
  },
  context: ({ input }: { input?: Partial<ClassroomSpaceNavigatorContext> }) => ({
    ...initialClassroomSpaceNavigatorContext,
    ...input,
  }),
  states: {
    resolving: {
      on: {
        INIT_NAVIGATOR: ({ context, event }) => {
          const defaultSurfaces = DEFAULT_PERSPECTIVE_SURFACES[event.perspective] || [];
          const initialSurface = event.defaultSurface || defaultSurfaces[0]?.id || 'overview';
          return {
            target: 'ready',
            context: {
              ...context,
              activePerspective: event.perspective,
              selectedClassroomId: event.classroomId !== undefined ? event.classroomId : context.selectedClassroomId,
              selectedSurfaceId: initialSurface,
              availableSurfaces: defaultSurfaces,
              isSwitching: false,
              error: null,
            },
          };
        },
        SET_AVAILABLE_SURFACES: ({ context, event }) => {
          const activeValid = event.surfaces.some((s) => s.id === context.selectedSurfaceId);
          const nextSurface = event.targetSurface ?? (activeValid ? context.selectedSurfaceId : event.surfaces[0]?.id ?? 'overview');
          return {
            target: 'ready',
            context: {
              ...context,
              availableSurfaces: event.surfaces,
              selectedSurfaceId: nextSurface,
              isSwitching: false,
              error: null,
            },
          };
        },
        NAVIGATION_ERROR: ({ context, event }) => ({
          target: 'error',
          context: {
            ...context,
            isSwitching: false,
            error: event.error,
          },
        }),
      },
    },
    ready: {
      on: {
        SWITCH_PERSPECTIVE: ({ context, event }) => {
          const surfaces = DEFAULT_PERSPECTIVE_SURFACES[event.perspective] || [];
          return {
            target: 'ready',
            context: {
              ...context,
              activePerspective: event.perspective,
              availableSurfaces: surfaces,
              selectedSurfaceId: surfaces[0]?.id || 'overview',
              error: null,
            },
          };
        },
        SELECT_CLASSROOM: ({ context, event }) => ({
          target: 'ready',
          context: {
            ...context,
            selectedClassroomId: event.classroomId,
            error: null,
          },
        }),
        SELECT_SURFACE: ({ context, event }) => {
          const isValid =
            context.availableSurfaces.length === 0 ||
            context.availableSurfaces.some((s) => s.id === event.surfaceId);

          if (!isValid) {
            return {
              target: 'ready',
              context: {
                ...context,
                error: `Surface "${event.surfaceId}" is not permitted under ${context.activePerspective} perspective.`,
              },
            };
          }

          return {
            target: 'ready',
            context: {
              ...context,
              selectedSurfaceId: event.surfaceId,
              error: null,
            },
          };
        },
        SET_AVAILABLE_SURFACES: ({ context, event }) => {
          const activeValid = event.surfaces.some((s) => s.id === context.selectedSurfaceId);
          const nextSurface = event.targetSurface ?? (activeValid ? context.selectedSurfaceId : event.surfaces[0]?.id ?? 'overview');
          return {
            target: 'ready',
            context: {
              ...context,
              availableSurfaces: event.surfaces,
              selectedSurfaceId: nextSurface,
              error: null,
            },
          };
        },
      },
    },
    error: {
      on: {
        CLEAR_ERROR: ({ context }) => ({
          target: 'ready',
          context: {
            ...context,
            error: null,
          },
        }),
        SWITCH_PERSPECTIVE: ({ context, event }) => {
          const surfaces = DEFAULT_PERSPECTIVE_SURFACES[event.perspective] || [];
          return {
            target: 'ready',
            context: {
              ...context,
              activePerspective: event.perspective,
              availableSurfaces: surfaces,
              selectedSurfaceId: surfaces[0]?.id || 'overview',
              error: null,
            },
          };
        },
      },
    },
  },
  on: {
    RESET: () => ({
      target: '.resolving',
      context: initialClassroomSpaceNavigatorContext,
    }),
  },
});

export type ClassroomSpaceNavigatorMachine = typeof classroomSpaceNavigatorMachine;
export type ClassroomSpaceNavigatorActor = ReturnType<typeof createClassroomSpaceNavigatorActor>;

/**
 * Instantiates and starts a ClassroomSpaceNavigator actor.
 */
export function createClassroomSpaceNavigatorActor(
  initial?: Partial<ClassroomSpaceNavigatorContext>,
) {
  const actor = createActor(classroomSpaceNavigatorMachine, {
    input: initial,
  });
  actor.start();
  return actor;
}

/**
 * Effect-TS v4 runner for dynamically resolving allowed surfaces with permissions and telemetry.
 */
export async function executePerspectiveResolutionEffect(
  actor: ClassroomSpaceNavigatorActor,
  perspective: ClassroomPerspective,
  dependencies: {
    fetchSurfaces: (
      perspective: ClassroomPerspective,
      classroomId?: string | null,
    ) => Promise<ClassroomSurfaceDescriptor[]>;
  },
): Promise<{ success: boolean; surfaces?: ClassroomSurfaceDescriptor[]; error?: string }> {
  const snapshot = actor.getSnapshot();
  const classroomId = snapshot.context.selectedClassroomId;

  const program = Effect.tryPromise({
    try: () => dependencies.fetchSurfaces(perspective, classroomId),
    catch: (err: unknown) => (err instanceof Error ? err.message : String(err)),
  });

  const exit = await Effect.runPromiseExit(program);

  return Exit.match(exit, {
    onSuccess: (surfaces) => {
      if (actor.getSnapshot().status === 'stopped') {
        return { success: true, surfaces };
      }
      actor.send({
        type: 'SET_AVAILABLE_SURFACES',
        surfaces,
      });
      return { success: true, surfaces };
    },
    onFailure: (cause) => {
      const errOption = Cause.findErrorOption(cause);
      const errorMessage =
        errOption._tag === 'Some'
          ? String(errOption.value)
          : 'Failed to resolve permitted classroom workspace surfaces.';
      if (actor.getSnapshot().status === 'stopped') {
        return { success: false, error: errorMessage };
      }
      actor.send({ type: 'NAVIGATION_ERROR', error: errorMessage });
      return { success: false, error: errorMessage };
    },
  });
}
