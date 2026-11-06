// The module frame of the walking skeleton. Every domain, platform and channel
// module is named here before it has code; the fitness tests beside this file keep
// the router, the domain index and the Cedar namespaces in step with it.
// Structure: docs/architecture/module-structure.md

export type ModuleStatus = 'skeleton' | 'admitted' | 'retired';

export const platformModules = [
  { name: 'identity', layer: 1, status: 'admitted' },
  { name: 'authority', layer: 2, status: 'admitted' },
  { name: 'operations', layer: 3, status: 'skeleton' },
  { name: 'budgets', layer: 4, status: 'skeleton' },
  { name: 'audit', layer: 5, status: 'skeleton' },
  { name: 'records', layer: 6, status: 'skeleton' },
  { name: 'consent', layer: 7, status: 'skeleton' },
  { name: 'calendar', layer: 8, status: 'skeleton' },
  { name: 'devices', layer: 9, status: 'skeleton' },
  { name: 'notify', layer: 10, status: 'skeleton' },
  { name: 'files', layer: 11, status: 'skeleton' },
  { name: 'exports', layer: 12, status: 'skeleton' },
  { name: 'search', layer: null, status: 'skeleton' },
  { name: 'entitlements', layer: null, status: 'skeleton' },
  { name: 'integrations', layer: null, status: 'skeleton' },
] as const satisfies readonly {
  name: string;
  layer: number | null;
  status: ModuleStatus;
}[];

export type PlatformModule = (typeof platformModules)[number]['name'];

// Layers 0–7 of the playbook: what every domain module needs before admission.
const base = [
  'identity',
  'authority',
  'operations',
  'budgets',
  'audit',
  'records',
  'consent',
] as const satisfies readonly PlatformModule[];

const domains = {
  wellbeing: ['mood', 'journal', 'reflection', 'practice'],
  learning: ['classrooms', 'lessons', 'assignments', 'assessments', 'grading', 'notes'],
  ops: [
    'institutions',
    'enrolment',
    'timetables',
    'attendance',
    'staff',
    'welfare',
    'inventory',
    'events',
    'finance',
    'tutoring',
  ],
  family: ['verification', 'access'],
  community: ['groups', 'posts', 'conversations', 'notices', 'moderation'],
  library: ['resources', 'collections', 'editorial', 'media', 'commons'],
  journey: ['profile', 'record', 'achievements', 'portfolio', 'transitions'],
  rewards: ['ledger'],
  agents: ['assist', 'runs', 'delegation', 'memory'],
} as const;

export type Domain = keyof typeof domains;

export type DomainModule = {
  [D in Domain]: `${D}.${(typeof domains)[D][number]}`;
}[Domain];

export interface DomainManifest {
  name: DomainModule;
  domain: Domain;
  status: ModuleStatus;
  needs: readonly PlatformModule[];
  publishes: readonly string[];
  reads: readonly DomainModule[];
}

// Skeleton modules declare only the base layers. A module's card adds its other
// needs, events and reads when it is written.
export const domainModules: readonly DomainManifest[] = (
  Object.entries(domains) as [Domain, readonly string[]][]
).flatMap(([domain, subdomains]) =>
  subdomains.map((subdomain) => ({
    name: `${domain}.${subdomain}` as DomainModule,
    domain,
    status: 'skeleton' as const,
    needs: base,
    publishes: [],
    reads: [],
  })),
);

export const channels = [
  { name: 'app', status: 'admitted' },
  { name: 'workers', status: 'skeleton' },
  { name: 'bots', status: 'skeleton' },
  { name: 'mcp', status: 'skeleton' },
  { name: 'partners', status: 'skeleton' },
  { name: 'operators', status: 'skeleton' },
] as const satisfies readonly { name: string; status: ModuleStatus }[];

export const domainNames = Object.keys(domains) as Domain[];

/** Top-level router namespaces that may exist: admitted platform modules and domains with an admitted subdomain. */
export function admittedNamespaces(): string[] {
  const fromPlatform = platformModules.filter((m) => m.status === 'admitted').map((m) => m.name);
  const fromDomains = domainNames.filter((d) =>
    domainModules.some((m) => m.domain === d && m.status === 'admitted'),
  );
  return [...fromPlatform, ...fromDomains].sort();
}
