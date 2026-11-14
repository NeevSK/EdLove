// apps/gurudevi-web/lib/tutii/journeys/roleJourneys.ts
import { tutiiJourneySpec } from '../schema';

/**
 * Teacher Journey: Practical 3-step walkthrough on taking attendance, marking grades, and offline sync.
 */
export const teacherClassroomJourney: tutiiJourneySpec = {
  id: 'teacher.classroom.onboarding',
  version: 1,
  title: 'Teacher Daily Workflow',
  targetRole: 'teacher',
  allowSkip: true,
  rememberDismissal: true,
  steps: [
    {
      id: 'step.attendance.toggle',
      targetSelector: '[data-tour="attendance-status-toggle"], button[aria-label*="attendance" i]',
      fallbackSelector: 'main button',
      title: 'Taking Roll Call',
      narration:
        'Click any student to toggle Present or Absent. It records in seconds without paperwork.',
      preferredPlacement: 'bottom',
      highlightPadding: 8,
      borderRadius: 12,
      applicableRoles: ['teacher'],
    },
    {
      id: 'step.offline.badge',
      targetSelector: '[data-tour="sync-status-indicator"], [data-testid="sync-status"]',
      fallbackSelector: 'header',
      title: 'Offline Vault',
      narration:
        'If your school loses Wi-Fi or power cuts hit, your changes save right to your device and sync later.',
      preferredPlacement: 'bottom',
      highlightPadding: 6,
      borderRadius: 8,
      applicableRoles: ['teacher', 'universal'],
    },
    {
      id: 'step.save.records',
      targetSelector:
        '[data-tour="save-register-action"], button:has-text("Save"), button:has-text("Submit")',
      fallbackSelector: 'footer',
      title: 'Saving Your Day',
      narration:
        'Hit save when you finish. You can always review and edit before final term submission.',
      preferredPlacement: 'top',
      highlightPadding: 8,
      borderRadius: 10,
      applicableRoles: ['teacher'],
    },
  ],
};

/**
 * Principal Journey: School-wide sync, faculty management, and curriculum pacing.
 */
export const principalOverviewJourney: tutiiJourneySpec = {
  id: 'principal.overview.onboarding',
  version: 1,
  title: 'Principal School Hub',
  targetRole: 'principal',
  allowSkip: true,
  rememberDismissal: true,
  steps: [
    {
      id: 'step.school.sync',
      targetSelector: '[data-tour="principal-sync-card"], section:has-text("Sync Status")',
      fallbackSelector: 'main section:first-of-type',
      title: 'School-Wide Sync',
      narration:
        'Here is your live view of teacher sync. You can verify records are up to date across all grades.',
      preferredPlacement: 'bottom',
      highlightPadding: 10,
      borderRadius: 16,
      applicableRoles: ['principal'],
    },
    {
      id: 'step.faculty.roster',
      targetSelector: '[data-tour="principal-faculty-roster"], section:has-text("Faculty")',
      fallbackSelector: 'main section:nth-of-type(2)',
      title: 'Faculty Roster',
      narration:
        'Invite teachers, manage class assignments, and monitor active academic terms from here.',
      preferredPlacement: 'top',
      highlightPadding: 8,
      borderRadius: 12,
      applicableRoles: ['principal'],
    },
  ],
};

/**
 * Student Journey: Daily schedule, study goals, and quiet reflection.
 */
export const studentSelfJourney: tutiiJourneySpec = {
  id: 'student.self.onboarding',
  version: 1,
  title: 'Student Sanctuary',
  targetRole: 'student',
  allowSkip: true,
  rememberDismissal: true,
  steps: [
    {
      id: 'step.student.goals',
      targetSelector: '[data-tour="student-daily-goals"], section:has-text("Goals")',
      fallbackSelector: 'main section:first-of-type',
      title: 'Daily Intentions',
      narration:
        'Set your focus topics for today. Checking them off keeps your study routine on track.',
      preferredPlacement: 'bottom',
      highlightPadding: 8,
      borderRadius: 12,
      applicableRoles: ['student'],
    },
    {
      id: 'step.breath.break',
      targetSelector: '[data-tour="breath-guide-trigger"], button:has-text("Breathe")',
      fallbackSelector: 'main button',
      title: 'Quiet Reset',
      narration:
        'Take a quick 2-minute breathing break with gentle singing bowl tones whenever you feel stressed.',
      preferredPlacement: 'top',
      highlightPadding: 8,
      borderRadius: 12,
      applicableRoles: ['student', 'universal'],
    },
  ],
};
