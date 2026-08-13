import type { Context } from 'hono';

/**
 * Legacy Hono grading boundary.
 *
 * Grading is now served by Sanctuary's lifecycle-aware oRPC router. This
 * export remains only so old package imports fail explicitly at runtime rather
 * than silently writing to the retired `grades`/`classroom_id` model.
 */
const RETIRED_RESPONSE = {
  error: 'LEGACY_GRADING_API_RETIRED',
  message: 'Use the Sanctuary lifecycle grading API backed by GradeMark.',
};

function retired(c: Context) {
  return c.json(RETIRED_RESPONSE, 410);
}

export const gradingHandlers = {
  getReportCard: async (c: Context) => retired(c),
  getClassroomGrades: async (c: Context) => retired(c),
  submitGrade: async (c: Context) => retired(c),
  publishGrade: async (c: Context) => retired(c),
  getGradingSettings: async (c: Context) => retired(c),
};
