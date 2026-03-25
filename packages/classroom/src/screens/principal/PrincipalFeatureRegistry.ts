/**
 * Principal Dashboard Feature Registry
 *
 * Provides metadata and guidance for all dashboard components.
 */

import { getPrincipalFeatureScopeMeta, type PrincipalFeatureScope } from './PrincipalIAScope';

export interface FeatureInfo {
  title: string;
  description: string;
  howToUse?: string;
  establishment?: string;
  daily?: string;
  scope: PrincipalFeatureScope;
  scopeBadgeLabelKey: string;
  scopeHelpTextKey: string;
}

export const PRINCIPAL_FEATURE_REGISTRY: Record<string, FeatureInfo> = {
  morning_brief: {
    title: 'Morning Brief',
    description: 'A real-time operational pulse of your school today.',
    daily: 'Check here first every morning to see staff attendance gaps and immediately assign relief teachers to uncovered classrooms.',
    ...getPrincipalFeatureScopeMeta('morning_brief')!,
  },
  faculty_overview: {
    title: 'Faculty Overview',
    description: 'Real-time heartbeat of your teaching staff. Monitor presence, energy levels, and active classroom engagements.',
    establishment: 'Add teachers and assign roles.',
    daily: 'Monitor attendance and live classroom pulse.',
    howToUse: 'Use the [+] button to add new teachers or [history] to see attendance patterns.',
    ...getPrincipalFeatureScopeMeta('faculty_overview')!,
  },
  student_pulse: {
    title: 'Student Pulse',
    description: 'Holistic view of student wellbeing and attendance. Identifies at-risk students based on participation and attendance anomalies.',
    daily: 'Check for low energy or high absence signals.',
    howToUse: 'The attendance arc shows today versus historical averages. Intervene early when risks are detected.',
    ...getPrincipalFeatureScopeMeta('student_pulse')!,
  },
  hierarchy: {
    title: 'Institutional Hierarchy',
    description: 'Manage the structure of your school, from grades and sections to specialized departments.',
    establishment: 'Define the grade structure (e.g., Grade 1-12).',
    howToUse: 'Use [+] to create new sections or classrooms.',
    ...getPrincipalFeatureScopeMeta('hierarchy')!,
  },
  inventory: {
    title: 'Tactical Inventory',
    description: 'Track school-wide essential resources, from digital devices to sports equipment.',
    establishment: 'Inventory initial stock.',
    daily: 'Update stock levels as items are used or received.',
    howToUse: 'Use [+] to add new items or request restocks.',
    ...getPrincipalFeatureScopeMeta('inventory')!,
  },
  relief: {
    title: 'Relief Management',
    description: 'Coordinate substitute teachers for absent faculty to ensure no classroom is left unattended.',
    daily: 'Assign relief teachers to open slots.',
    howToUse: 'Open the [+] menu to assign a relief teacher to an active period for an absent staff member.',
    ...getPrincipalFeatureScopeMeta('relief')!,
  },
  institutional_calendar: {
    title: 'Institutional Calendar',
    description: 'The master schedule of school events, terms, and holidays.',
    establishment: 'Define your academic terms and holidays here at the start of the year.',
    daily: 'Check upcoming events and ensure staff readiness.',
    ...getPrincipalFeatureScopeMeta('institutional_calendar')!,
  },
  pending_approvals: {
    title: 'Pending Approvals',
    description: 'Centralized queue for all operational requests requiring principal sign-off.',
    daily: 'Review leave requests, expense claims, and requisition orders.',
    ...getPrincipalFeatureScopeMeta('pending_approvals')!,
  },
  ecosystem_resonance: {
    title: 'Ecosystem Resonance',
    description: 'Topological visualization of your school community connections.',
    howToUse: 'Explore the constellation to see how different grades, departments, and community members are resonating.',
    ...getPrincipalFeatureScopeMeta('ecosystem_resonance')!,
  },
};
