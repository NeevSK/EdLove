import { serve } from "inngest/astro";
import { schoolAttendanceRecorded } from "../../inngest/functions/attendanceHandlers";
import { schoolClassroomCreated } from "../../inngest/functions/classroomHandlers";
import { teacherSummaryRequested } from "../../inngest/functions/durableAgentHandlers";
import { schoolGradePublished } from "../../inngest/functions/gradingHandlers";
import { syncMutationQueued } from "../../inngest/functions/mutationHandlers";
import { studentSupportRequested } from "../../inngest/functions/studentSupportHandlers";
import { wellbeingMoodLogged } from "../../inngest/functions/wellbeingHandlers";
import { inngest } from "../../lib/inngest";

export const prerender = false;

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    wellbeingMoodLogged,
    syncMutationQueued,
    schoolAttendanceRecorded,
    schoolClassroomCreated,
    schoolGradePublished,
    teacherSummaryRequested,
    studentSupportRequested,
  ],
});
