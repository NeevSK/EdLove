import { Inngest } from 'inngest';

/**
 * Gurudevi Platform Event Bus
 * Powered by Inngest.
 * 
 * 🧱 ARCHITECTURAL BOUNDARY:
 * This is the central orchestration point for non-blocking side effects.
 * Every cross-module action (e.g. Attendance -> Wellbeing) should flow through here.
 */
export const inngest = new Inngest({ 
  id: 'gurudevi-platform',
  // In a multi-tenant world, we want to ensure events carry tenant context
  eventKey: process.env.INNGEST_EVENT_KEY,
});

/**
 * Common Event Schemas
 * Defined here to ensure strong typing across the monorepo.
 */
export type PlatformEvents = {
  'attendance/taken': {
    data: {
      schoolId: string;
      classId: string;
      studentIds: string[];
      occurredAt: string;
      recordedById: string;
    }
  };
  'wellbeing/mood-logged': {
    data: {
      schoolId: string;
      studentId: string;
      moodScore: number;
      occurredAt: string;
    }
  };
  'system/audit-log-created': {
    data: {
      action: string;
      userId: string;
      schoolId?: string;
      targetId?: string;
      metadata?: Record<string, any>;
    }
  };
}

export const emitEvent = async <K extends keyof PlatformEvents>(
  name: K,
  data: PlatformEvents[K]['data']
) => {
  return inngest.send({
    name,
    data,
  });
};

export default inngest;
