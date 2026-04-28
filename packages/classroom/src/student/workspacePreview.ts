import type { StudentCapabilityId } from './workspace';

export type StudentWorkspacePresentation = 'live' | 'preview';

const STUDENT_CAPABILITY_PREVIEW_SUMMARY: Partial<Record<StudentCapabilityId, string>> = {
  assignment_queue:
    'Preview, the, assignment, rhythm a, thriving, student, workspace, can, hold for you: timely, submissions, clearer, load, planning, and, fewer, last-minute, surprises.',
  growth_goals:
    'Preview a, private, student, growth, space, where, goals, stay, close, to, daily, study, so, ambition, feels, lived, rather, than, hidden, away.',
  grades_overview:
    'Preview, how, feedback, marks, and, teacher, recognition, can, become a, visible, academic, mirror, inside, the, workspace, you return to, every, day.',
  growth_progress:
    'Preview a, longer, arc, of, student, progress, where, effort, consistency, and, improvement, are, seen, together, instead, of as isolated, events.',
  rewards_pulse:
    'Preview, the, encouragement, layer, of, student, work: points, badges, and, signs, of, momentum, that, make, steady, effort, feel, meaningful.',
};

export function resolveStudentWorkspacePresentation(
  isPreview: boolean,
): StudentWorkspacePresentation {
  return isPreview ? 'preview' : 'live';
}

export function getStudentCapabilityPreviewSummary(capabilityId: StudentCapabilityId): string {
  return (
    STUDENT_CAPABILITY_PREVIEW_SUMMARY[capabilityId] ??
    'Preview, how, this, student, capability, can, grow, into a, richer, part, of, the, workspace, over, time.'
  );
}
