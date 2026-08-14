export type DataHighway = 'direct-api' | 'power-sync' | 'local-first';

export type DataHighwayRule = {
  highway: DataHighway;
  reason: string;
  failLoudly?: boolean;
};

export const DATA_HIGHWAYS: Record<string, DataHighwayRule> = {
  identity_bootstrap: {
    highway: 'direct-api',
    reason:
      'Session identity and onboarding gating should resolve directly from the authoritative API.',
    failLoudly: true,
  },
  auth_session: {
    highway: 'direct-api',
    reason: 'Auth/session bootstrap must remain simple and deterministic across web and mobile.',
    failLoudly: true,
  },
  workspace_sync: {
    highway: 'power-sync',
    reason: 'Workspace, classroom, and other replicated app data can benefit from offline sync.',
  },
  offline_queue: {
    highway: 'local-first',
    reason: 'Optimistic writes and deferred mutations need a local-first queue.',
  },
  profile_core: {
    highway: 'direct-api',
    reason: 'Profile updates used for onboarding and routing should stay authoritative and loud.',
    failLoudly: true,
  },
  principal_notes_core: {
    highway: 'direct-api',
    reason: 'Principal notes are private authoritative records and must not bypass server authorization.',
    failLoudly: true,
  },
  messaging_core: {
    highway: 'direct-api',
    reason: 'Private messages must use the server-owned participant and authorization boundary.',
    failLoudly: true,
  },
  announcements_core: {
    highway: 'direct-api',
    reason: 'School announcements require server-side school scope and author derivation.',
    failLoudly: true,
  },
  social_core: {
    highway: 'direct-api',
    reason: 'Notifications and safety controls require server-side user ownership checks.',
    failLoudly: true,
  },
};

export function assertHighway(ruleName: string, actual: DataHighway) {
  const rule = DATA_HIGHWAYS[ruleName];
  if (!rule) return;

  if (rule.highway !== actual && rule.failLoudly) {
    throw new Error(
      `[DataHighway] "${ruleName}" must use "${rule.highway}" but received "${actual}". ${rule.reason}`,
    );
  }
}

export function assertPowerSyncBootstrapReady() {
  if (typeof window === 'undefined') return;

  throw new Error(
    'PowerSync bootstrap guard: browser code touched PowerSync before the app was ready. Use the direct API highway for bootstrap and identity, and only enter PowerSync after the runtime is intentionally registered.',
  );
}
