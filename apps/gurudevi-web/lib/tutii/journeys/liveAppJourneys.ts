// apps/gurudevi-web/lib/tutii/journeys/liveAppJourneys.ts
import { tutiiJourneySpec } from '../schema';

/**
 * Teacher Live Walkthrough on the real Workspace
 */
export const teacherWorkspaceLiveJourney: tutiiJourneySpec = {
  id: 'teacher.workspace.live',
  version: 1,
  title: 'Teacher Workspace Walk',
  targetRole: 'teacher',
  allowSkip: true,
  rememberDismissal: true,
  steps: [
    {
      id: 'step.class.selector',
      targetSelector: '[data-tour="workspace-class-selector"], select, [role="combobox"]',
      fallbackSelector: 'header',
      title: 'Pick Your Class',
      narration: 'Start here. Choose your grade and section for the period.',
      preferredPlacement: 'bottom',
      highlightPadding: 8,
      borderRadius: 12,
      applicableRoles: ['teacher'],
    },
    {
      id: 'step.student.list',
      targetSelector:
        '[data-tour="workspace-student-row"], table tbody tr:first-child, [data-testid="student-row"]',
      fallbackSelector: 'main table, main [role="table"]',
      title: 'Quick Roll Call',
      narration:
        'Click a student to cycle between Present, Absent, or Excused. Takes 10 seconds for the whole room.',
      preferredPlacement: 'right',
      highlightPadding: 8,
      borderRadius: 10,
      applicableRoles: ['teacher'],
    },
    {
      id: 'step.offline.indicator',
      targetSelector:
        '[data-tour="workspace-sync-badge"], [aria-label*="sync" i], [aria-label*="online" i]',
      fallbackSelector: 'header div:last-child',
      title: 'Saved Right Here',
      narration:
        'See this? Your marks save to your device immediately. If the school Wi-Fi cuts out, you do not lose a thing.',
      preferredPlacement: 'bottom',
      highlightPadding: 6,
      borderRadius: 9999,
      applicableRoles: ['teacher', 'universal'],
    },
    {
      id: 'step.save.bar',
      targetSelector:
        '[data-tour="workspace-save-button"], button:has-text("Save"), button:has-text("Submit")',
      fallbackSelector: 'footer, main button:last-of-type',
      title: 'All Set',
      narration:
        'Hit save when you are done. It queues up and syncs automatically whenever you are online.',
      preferredPlacement: 'top',
      highlightPadding: 8,
      borderRadius: 12,
      applicableRoles: ['teacher'],
    },
  ],
};
