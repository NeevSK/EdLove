/**
 * Protocol Oriented Authority (POA) Types
 */

import { CapabilityResource, PolicyDecision } from './Policy';
import { UserContext } from '../permissions/schemas/user.schema';

/**
 * An Intent is a functional requirement or purposeful UI placeholder.
 * It is satisfied by one or more Vows from various holons (packages).
 */
export type IntentKey = 
  | 'dashboard.student.stat.active_sanctuaries'
  | 'dashboard.student.stat.goals'
  | 'dashboard.student.stat.growth_points'
  | 'dashboard.student.classroom_list'
  | 'dashboard.student.assignments_upcoming'
  | 'dashboard.student.widget.goals'
  | 'dashboard.student.widget.growth_points'
  | 'dashboard.student.widget.study_suite'
  | 'dashboard.teacher.stat.active_students'
  | 'dashboard.teacher.stat.attendance'
  | 'dashboard.teacher.stat.performance'
  | 'dashboard.teacher.classroom_list'
  | 'dashboard.teacher.assignments_sidebar'
  | 'dashboard.teacher.action.attendance'
  | 'dashboard.teacher.action.analysis'
  | 'dashboard.teacher.action.potential'
  | 'dashboard.teacher.action.observation'
  | 'dashboard.teacher.snapshot'
  | 'institutional.briefing' 
  | 'institutional.teacher_carousel'
  | 'institutional.student_pulse'
  | 'institutional.leave_approvals'
  | 'institutional.calendar'
  | 'institutional.principal_observations'
  | 'institutional.principal_workspace'
  | 'institutional.workspace.attendance'
  | 'institutional.workspace.faculty'
  | 'institutional.workspace.resources'
  | 'institutional.workspace.finance'
  | 'institutional.staff_presence'
  | 'institutional.curriculum_progress'
  | 'institutional.resource_needs'
  | 'institutional.observations'
  | 'institutional.echo_items'
  | 'institutional.topology'
  | 'institutional.curriculum_summary'
  | 'institutional.resource_summary'
  | 'institutional.relief_management'
  | 'dashboard.teacher.actions.primary'
  | 'dashboard.teacher.actions.echoes'
  | 'dashboard.student.header'
  | 'dashboard.guardian.header'
  | 'dashboard.guardian.children_list'
  | 'dashboard.guardian.attendance_summary'
  | 'dashboard.guardian.financial_summary'
  | 'dashboard.admin.school_pulse'
  | 'dashboard.admin.staff_registry'
  | 'metric.admin.financial_health'
  | 'metric.admin.staff_registry'
  | 'academy.shell.guest_view'
  | 'academy.shell.auth_view'
  | 'academy.shell.setup_view'
  | (string & {});

/**
 * A Vow is a package's commitment to fulfill an Intent.
 * It includes the authorization logic and the actual fulfillment (component/action).
 */
export interface Vow<P = any> {
  /**
   * The intent this vow satisfies.
   */
  intent: IntentKey;
  
  /**
   * Unique identifier for this vow provider (e.g., 'repo-people-pulse').
   */
  providerId: string;
  
  /**
   * Conditions under which this vow is satisfied.
   * If matched, the component will be rendered.
   */
  authorize: (context: UserContext, resource?: CapabilityResource) => PolicyDecision;
  
  /**
   * The actual fulfillment component.
   */
  component: React.ComponentType<P>;
  
  /**
   * Priority for resolving multiple vows for the same intent.
   * Higher number = higher priority.
   */
  priority?: number;
}

export interface IntentProps<P = any> {
  intent: IntentKey;
  props?: P;
  resource?: CapabilityResource;
  fallback?: React.ReactNode;
}
