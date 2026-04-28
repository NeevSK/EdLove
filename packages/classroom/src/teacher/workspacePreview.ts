import type { TeacherDashboardSurfaceId } from '../workspace/useTeacherDashboardSurfaces';

const TEACHER_PREVIEW_SUMMARY: Record<TeacherDashboardSurfaceId, string> = {
  'temporal-context':
    'Preview, how a, teacher, begins, the, day, with, context, already, visible, so, planning, and, care, start from rhythm, rather, than, reaction.',
  'primary-actions':
    'Preview, the, core, teacher, motions, in a, mature, workspace: opening, classrooms, joining new ones, and, moving, quickly, into, live, teaching, flow.',
  'support-tools':
    'Preview, the, quieter, but, essential, support, layer, of, teaching, work: admin, tasks, principal, echoes, reflection, breathing, and, library, access.',
  pulse:
    'Preview a, teacher, workspace, that, already, carries, meaningful, class, load, student, signal, and, operational, clarity.',
  'classroom-registry':
    'Preview, the, living, classroom, registry, of a, teacher, who, has, already, built, and, sustained, multiple, active, sanctuaries.',
};

export function getTeacherPreviewSummary(surfaceId: TeacherDashboardSurfaceId): string {
  return TEACHER_PREVIEW_SUMMARY[surfaceId];
}
