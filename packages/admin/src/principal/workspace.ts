export type PrincipalWorkspaceView =
  | 'main'
  | 'hierarchy'
  | 'invites'
  | 'notes'
  | 'log'
  | 'cycles'
  | 'attendance_report';

export const LEAVE_STATUS_COLORS: Record<string, string> = {
  pending: 'var(--amber-glow)',
  approved: 'var(--moss)',
  rejected: 'var(--ember)',
};

export const PRESENCE_STATUS_COLORS: Record<string, string> = {
  present: 'var(--moss)',
  absent: 'var(--ember)',
  on_leave: 'var(--amber-glow)',
  late: 'var(--water)',
  half_day: 'var(--lotus)',
};

export function resolvePrincipalWorkspaceView(featureId: string): PrincipalWorkspaceView {
  if (featureId === 'hierarchy') return 'hierarchy';
  if (featureId === 'invites') return 'invites';
  if (featureId === 'log' || featureId === 'notes') return 'log';
  if (featureId === 'cycles') return 'cycles';
  return 'main';
}
