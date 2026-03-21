export type PrincipalView = 'main' | 'hierarchy' | 'invites' | 'log' | 'cycles';

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

export function presenceColor(present: number, total: number): string {
    if (total === 0) return 'var(--ink-ghost)';
    const pct = present / total;
    if (pct >= 0.9) return 'var(--moss)';
    if (pct >= 0.7) return 'var(--amber-glow)';
    return 'var(--ember)';
}
