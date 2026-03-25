import { staffManagementAPI, type CalendarEvent } from '@repo/core';

export type { CalendarEvent };

export const adminCalendarAPI = {
  async listUpcomingEvents(schoolId: string, limit = 5, viewDate?: string): Promise<CalendarEvent[]> {
    return staffManagementAPI.getUpcomingCalendarEvents(schoolId, limit, viewDate);
  },

  async createEvent(
    schoolId: string,
    principalId: string,
    event: {
      title: string;
      type: string;
      start_date: string;
      end_date?: string;
      is_public?: boolean;
    },
  ): Promise<boolean> {
    return staffManagementAPI.createCalendarEvent(schoolId, principalId, event);
  },
};
