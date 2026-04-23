import { inngest } from '../bus';
import { logger } from '../../utils/logger';

/**
 * Wellbeing Alert Handler
 * 
 * TRIGGERS ON: 'wellbeing/mood-logged'
 * GOAL: Analyze mood score and trigger institutional alerts if below threshold.
 * 
 * 🧊 IDEMPOTENCY: Inngest handles retries automatically. 
 * Use step.run() for side effects like DB writes or SMS sending.
 */
export const wellbeingAlertHandler = inngest.createFunction(
  { id: 'wellbeing-alert-processor', name: 'Process Wellbeing Mood' },
  { event: 'wellbeing/mood-logged' },
  async ({ event, step }) => {
    const { studentId, moodScore, schoolId } = event.data;

    // 1. Log the attempt
    await step.run('log-analysis', async () => {
      logger.info({ studentId, moodScore }, 'Analyzing mood for potential alert');
    });

    // 2. Conditional Logic (Mental Health Filter)
    if (moodScore <= 2) {
      await step.run('trigger-institutional-alert', async () => {
        // Here we would call an internal Service or emit another event
        // e.g. emitEvent('system/alert-triggered', { target: 'school-counselor' })
        logger.warn({ studentId, schoolId }, 'CRITICAL: Low mood threshold reached. Alerting school counselor.');
        return { alerted: true, priority: 'HIGH' };
      });
    }

    return { alerted: false };
  }
);

/**
 * Attendance Registry Handler
 * 
 * TRIGGERS ON: 'attendance/taken'
 * GOAL: Update school-level summaries (async side effect).
 */
export const attendanceSyncHandler = inngest.createFunction(
  { id: 'attendance-sync-processor', name: 'Sync Attendance Summaries' },
  { event: 'attendance/taken' },
  async ({ event, step }) => {
    const { schoolId, studentIds } = event.data;

    await step.run('update-daily-stats', async () => {
      // Direct DB call or API call to update school dashboards
      logger.info({ schoolId, count: studentIds.length }, 'Updating daily attendance statistics');
    });
  }
);
