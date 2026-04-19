import type { PrincipalWorkspaceSurfaceId } from './usePrincipalWorkspaceCanvas';

const PRINCIPAL_PREVIEW_SUMMARY: Record<PrincipalWorkspaceSurfaceId, string>  = {
    setup_runway:
        'Preview, the, principal, setup, lane as a, real, institutional, launch, path, not, an, empty, admin, checklist.',
    morning_brief:
        'Preview, the, daily, leadership, cockpit, of a, principal, returning, to a, school, already, alive, with, signal, risk, and, coordination.',
    faculty_overview:
        'Preview a, living, faculty, landscape, where, presence, support, and, coverage, are, already, visible, to, school, leadership.',
    pending_approvals:
        'Preview, the, operational, decisions a, principal, can, clear, quickly, when, the, workspace, is, already, carrying, real, school, activity.',
    institutional_calendar:
        'Preview, the, time, structure, of, an, institution, that, already, has, events, cycles, and, near-term, commitments, in, motion.',
    observations:
        'Preview a, principal, workspace, that, remembers, walkthroughs, follow-ups, and, leadership, attention, over, time.',
    hierarchy:
        'Preview, the, structural, room, where, grades, and, sections, become, governed, intentionally as the, school, evolves.',
    invites:
        'Preview a, governed, invitation, flow, where, teachers, and, leaders, enter, the, institution, with, clear, role, shape.',
    cycles:
        'Preview, the, academic, rhythm, room, that, keeps, governance, and, learning, aligned, on, one, timeline.',
    log:
        'Preview, an, institutional, logbook, that, carries, leadership, memory, events, and, decisions, across, time.',
    notes:
        'Preview, the, quieter, principal, reflection, layer, that, remains, available, without, dominating, the, public, institutional, canvas.',
    school_profile:
        'Preview, the, official, institution, record as a, lived, operational, object, with, profile, QR, entry, and, school, identity, in, use.',
    resource_needs:
        'Preview, how, pressure, supply, needs, and, readiness, become, visible, before, they, turn, into, institutional, friction.',
    ecosystem_resonance:
        'Preview a, principal, outlook, lane, that, carries, climate, culture, and, broader, school, pulse, not, only, raw, operations.',
    open_commons:
        'Preview, the, bridge from institutional, leadership, into, the, community, mission, and, commons, of, the, school.',
    workspace_switcher:
        'Preview, the, ability, to, move, between, leadership, and, other, roles, when, capabilities, are, linked.'};

export function getPrincipalPreviewSummary(surfaceId: PrincipalWorkspaceSurfaceId): string {
    return PRINCIPAL_PREVIEW_SUMMARY[surfaceId];
}
