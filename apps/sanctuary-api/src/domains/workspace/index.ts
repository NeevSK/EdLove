import { adminRouter } from '../../core/handlers/admin';
import { attendanceRouter } from '../../core/handlers/attendance';
import { attendanceV1Router } from '../../core/handlers/attendanceV1';
import { educationalRouter } from '../../core/handlers/educational';
import { erpRouter } from '../../core/handlers/erp';
import { formsRouter } from '../../core/handlers/forms';
import { gradingRouter } from '../../core/handlers/grading';
import { guardianAssessmentRouter } from '../../core/handlers/guardianAssessment';
import { inventoryRouter } from '../../core/handlers/inventory';
import { principalNotesRouter } from '../../core/handlers/principalNotes';
import { studentPotentialRouter } from '../../core/handlers/studentPotential';
import { workspaceProvisioningRouter } from '../../core/handlers/workspaceProvisioning';
import { o } from '../../core/orpc';

/**
 * Workspace Bounded Context (Role-Shaped Institutional Learning & Operations)
 * 
 * Grounded in @repo/classroom, @repo/workforce, @repo/accounting, @repo/admin, @repo/form-builder:
 * Participation is strictly capacity-shaped: learner, teacher, leader, guardian, workforce.
 */
export const workspaceDomainRouter = o.router({
  // Academic & Learning core
  attendance: attendanceRouter,
  attendanceV1: attendanceV1Router,
  grading: gradingRouter,
  educational: educationalRouter,
  classroom: educationalRouter,
  studentPotential: studentPotentialRouter,
  guardianAssessment: guardianAssessmentRouter,
  principalNotes: principalNotesRouter,

  // Institutional operations & finance
  admin: adminRouter,
  erp: erpRouter,
  inventory: inventoryRouter,
  forms: formsRouter,
  workspaceProvisioning: workspaceProvisioningRouter,
});

export {
  attendanceRouter,
  attendanceV1Router,
  gradingRouter,
  educationalRouter,
  adminRouter,
  erpRouter,
  inventoryRouter,
  formsRouter,
  guardianAssessmentRouter,
  principalNotesRouter,
  studentPotentialRouter,
  workspaceProvisioningRouter,
};
