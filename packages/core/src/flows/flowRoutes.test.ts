import { FLOW_REGISTRY } from '@repo/core/flows';
import { brokenRouteKey, checkFlowRoutes } from '@repo/core/flows/flowRoutes';
import { fillRoute, findRoute, routeExists } from '@repo/core/routing/routeMatch';
import { describe, expect, it } from 'vitest';

/**
 * Flow references to routes that don't exist, as found on 2026-11-13. A ratchet: a new broken
 * reference fails, and a fixed one must leave this list (so it only shrinks). Fix a reference by
 * pointing the flow at a real route, or by building the screen it names.
 */
const KNOWN_BROKEN = [
  'account.linked_providers step:initiate_provider_link mobile /(tabs)/self/settings',
  'account.linked_providers step:provider_inventory mobile /(tabs)/self/settings',
  'account.linked_providers step:providers_synced mobile /(tabs)/self/settings',
  'account.linked_providers step:unlink_provider_confirmation mobile /(tabs)/self/settings',
  'admin.academic_cycles fallback:set_calendar/school_registry_setup either /(tabs)/workspace/admin/school-creation',
  'admin.academic_cycles step:allocate_sections mobile /(tabs)/workspace/admin',
  'admin.academic_cycles step:publish_schedule mobile /(tabs)/workspace/admin',
  'admin.academic_cycles step:set_calendar mobile /(tabs)/workspace/admin',
  'classroom.student_desk_pass fallback:input_passcode/desk_pass_help either /(tabs)/workspace/support',
  'classroom.student_desk_pass step:input_passcode mobile /(tabs)/workspace/claim-pass',
  'classroom.student_desk_pass step:input_passcode web /workspace/claim-pass',
  'classroom.student_desk_pass step:preview_classroom mobile /(tabs)/workspace/claim-pass/preview',
  'classroom.student_desk_pass step:preview_classroom web /workspace/claim-pass/preview',
  'classroom.student_profile_soul_view completion either /(tabs)/workspace/classroom/student/[classroomId]',
  'classroom.student_profile_soul_view fallback:student_classroom_hub/classroom_desk_claim either /(tabs)/workspace/classroom',
  'classroom.student_profile_soul_view step:soul_radar_display mobile /(tabs)/workspace/classroom/student/[classroomId]',
  'classroom.student_profile_soul_view step:student_classroom_hub mobile /(tabs)/workspace/classroom/student/[classroomId]',
  'classroom.student_profile_soul_view step:terminal_soul_reflection_anchored mobile /(tabs)/workspace/classroom/student/[classroomId]',
  'classroom.teacher_attendance fallback:batch_mark/offline_attendance_vault either /(tabs)/workspace/attendance/offline-queue',
  'classroom.teacher_attendance fallback:select_roster/claim_desk_pass either /(tabs)/workspace/claim-pass',
  'classroom.teacher_attendance step:batch_mark mobile /(tabs)/workspace/attendance/register',
  'classroom.teacher_attendance step:batch_mark web /workspace/attendance/register',
  'classroom.teacher_attendance step:confirm_completion mobile /(tabs)/workspace/attendance/complete',
  'classroom.teacher_attendance step:confirm_completion web /workspace/attendance/complete',
  'classroom.teacher_attendance step:select_roster mobile /(tabs)/workspace/attendance',
  'classroom.teacher_student_radar_attunement fallback:select_student_roster/classroom_list_floor either /(tabs)/workspace/classroom',
  'classroom.teacher_student_radar_attunement step:radar_attunement_modal mobile /(tabs)/workspace/classroom/[classroomId]',
  'classroom.teacher_student_radar_attunement step:select_student_roster mobile /(tabs)/workspace/classroom/[classroomId]',
  'classroom.teacher_student_radar_attunement step:terminal_attunement_confirmed mobile /(tabs)/workspace/classroom/[classroomId]',
  'entry.web_sanctuary fallback:auth_sign_in/sign_up either /sign-up',
  'entry.web_sanctuary fallback:guest_house_welcome/vanity_invite either /c',
  'guardian.student_link fallback:scan_qr/manual_student_lookup either /(tabs)/workspace/link-student/manual',
  'guardian.student_link step:confirm_relationship mobile /(tabs)/workspace/link-student/confirm',
  'guardian.student_link step:confirm_relationship web /workspace/link-student/confirm',
  'guardian.student_link step:scan_qr mobile /(tabs)/workspace/link-student',
  'guardian.student_link step:scan_qr web /workspace/link-student',
  'platform.founder_cockpit completion either /(tabs)/workspace/founder',
  'platform.founder_cockpit fallback:add_directive/local_sqlite_deck either /(tabs)/workspace/founder',
  'platform.founder_cockpit step:add_directive mobile /(tabs)/workspace/founder',
  'platform.founder_cockpit step:cockpit_entry mobile /(tabs)/workspace/founder',
  'platform.founder_cockpit step:directives_settled mobile /(tabs)/workspace/founder',
  'qr.resolve_action fallback:scanner_viewfinder/manual_code_entry either /qr',
  'qr.resolve_action step:quishing_preview mobile /qr',
  'qr.resolve_action step:quishing_preview web /qr',
  'qr.resolve_action step:scanner_viewfinder mobile /qr',
  'qr.resolve_action step:scanner_viewfinder web /qr',
];

describe('flow routes / G1 against the generated route catalogue', () => {
  const broken = Object.values(FLOW_REGISTRY)
    .flatMap((flow) => checkFlowRoutes(flow).map(brokenRouteKey))
    .sort();

  it('adds no reference to a route that does not exist', () => {
    expect(broken.filter((key) => !KNOWN_BROKEN.includes(key))).toEqual([]);
  });

  it('keeps the known-broken list honest: fixed references leave it', () => {
    expect(KNOWN_BROKEN.filter((key) => !broken.includes(key))).toEqual([]);
  });
});

describe('route matching / G1', () => {
  it('matches with or without expo groups', () => {
    expect(findRoute('/(tabs)/workspace', 'mobile')).toBe('/(tabs)/workspace');
    expect(findRoute('/workspace', 'mobile')).toBe('/(tabs)/workspace');
  });

  it('matches a dynamic segment by value or by placeholder, and prefers static segments', () => {
    expect(findRoute('/community/chat/g-42', 'web')).toBe('/community/chat/[groupId]');
    expect(findRoute('/community/chat/[groupId]', 'web')).toBe('/community/chat/[groupId]');
  });

  it('does not let a placeholder match a static segment', () => {
    expect(routeExists('/[section]', 'web')).toBe(false);
  });

  it('reports a route that does not exist', () => {
    expect(routeExists('/workspace/attendance/register', 'web')).toBe(false);
  });

  it('fills params and reports the missing ones', () => {
    expect(fillRoute('/community/chat/[groupId]', { groupId: 'a b' })).toEqual({
      ok: true,
      href: '/community/chat/a%20b',
    });
    expect(fillRoute('/community/chat/[groupId]')).toEqual({ ok: false, missing: ['groupId'] });
    expect(fillRoute('/docs/[[...slug]]')).toEqual({ ok: true, href: '/docs' });
  });
});
