import type {
  DomainTemporalHorizon,
  WorkbenchDomain,
  WorkbenchRestorationSnapshot,
  WorkbenchTaskDescriptor,
  WorkbenchTaskResource,
} from '@repo/core/types';

export interface WorkbenchStorage {
  load(domain: WorkbenchDomain): WorkbenchRestorationSnapshot | null;
  save(snapshot: WorkbenchRestorationSnapshot): void;
}

export function createBrowserWorkbenchStorage(scope: string = 'sanctuary'): WorkbenchStorage {
  const memory = createMemoryWorkbenchStorage();
  if (typeof window === 'undefined') return memory;

  try {
    window.localStorage.setItem(probeKey, '1');
    window.localStorage.removeItem(probeKey);
    return {
      load: (domain) => {
        const scopedSnapshot = parseWorkbenchSnapshot(window.localStorage.getItem(storageKey(domain, scope)), domain);
        if (scopedSnapshot || scope !== 'sanctuary') return scopedSnapshot;
        return parseWorkbenchSnapshot(window.localStorage.getItem(legacyStorageKey(domain)), domain);
      },
      save: (snapshot) =>
        window.localStorage.setItem(storageKey(snapshot.domain, scope), JSON.stringify(snapshot)),
    };
  } catch {
    return memory;
  }
}

export function createMemoryWorkbenchStorage(): WorkbenchStorage {
  const snapshots = new Map<WorkbenchDomain, WorkbenchRestorationSnapshot>();
  return {
    load: (domain) => snapshots.get(domain) ?? null,
    save: (snapshot) => snapshots.set(snapshot.domain, snapshot),
  };
}

export function parseWorkbenchSnapshot(
  raw: string | null,
  domain: WorkbenchDomain,
): WorkbenchRestorationSnapshot | null {
  if (!raw) return null;
  try {
    return parseSnapshotValue(JSON.parse(raw), domain);
  } catch {
    return null;
  }
}

const probeKey = 'gurudevi:workbench:probe';
const storageVersion = 3;
const legacyStorageVersion = 2;

function storageKey(domain: WorkbenchDomain, scope: string): string {
  return `gurudevi:workbench:v${storageVersion}:${encodeURIComponent(scope)}:${domain}`;
}

function legacyStorageKey(domain: WorkbenchDomain): string {
  return `gurudevi:workbench:v${legacyStorageVersion}:${domain}`;
}

function parseSnapshotValue(
  value: unknown,
  expectedDomain: WorkbenchDomain,
): WorkbenchRestorationSnapshot | null {
  if (!isRecord(value) || value.domain !== expectedDomain || !Array.isArray(value.tasks))
    return null;

  const tasks = value.tasks.flatMap(parseTaskDescriptor);
  return {
    domain: expectedDomain,
    tasks,
    focusedTaskKey: typeof value.focusedTaskKey === 'string' ? value.focusedTaskKey : null,
    temporalHorizon: parseTemporalHorizon(value.temporalHorizon),
  };
}

function parseTaskDescriptor(value: unknown): WorkbenchTaskDescriptor[] {
  if (!isRecord(value)) return [];
  if (
    !isWorkbenchDomain(value.domain) ||
    typeof value.featureId !== 'string' ||
    typeof value.route !== 'string' ||
    typeof value.title !== 'string' ||
    typeof value.taskKey !== 'string' ||
    typeof value.openedAt !== 'string' ||
    typeof value.lastFocusedAt !== 'string'
  ) {
    return [];
  }

  const temporalBinding = parseTemporalBinding(value.temporalBinding);
  const localStatePolicy = parseLocalStatePolicy(value.localStatePolicy);
  if (!temporalBinding || !localStatePolicy) return [];

  const resource = parseResource(value.resource);
  const context = parseContext(value.context);
  if (value.resource !== undefined && !resource) return [];
  if (value.context !== undefined && !context) return [];

  return [
    {
      domain: value.domain,
      featureId: value.featureId,
      route: value.route,
      title: value.title,
      taskKey: value.taskKey,
      openedAt: value.openedAt,
      lastFocusedAt: value.lastFocusedAt,
      temporalBinding,
      localStatePolicy,
      ...(resource ? { resource } : {}),
      ...(context ? { context } : {}),
      ...(typeof value.icon === 'string' ? { icon: value.icon } : {}),
    },
  ];
}

function parseTemporalBinding(value: unknown): WorkbenchTaskDescriptor['temporalBinding'] | null {
  if (!isRecord(value) || typeof value.kind !== 'string') return null;
  if (value.kind === 'follow-domain' || value.kind === 'none') return { kind: value.kind };
  if (value.kind === 'fixed') {
    const horizon = parseTemporalHorizon(value.horizon);
    return horizon ? { kind: 'fixed', horizon } : null;
  }
  return null;
}

function parseLocalStatePolicy(value: unknown): WorkbenchTaskDescriptor['localStatePolicy'] | null {
  return value === 'none' || value === 'restore-permitted' || value === 'sensitive-no-restore'
    ? value
    : null;
}

function parseTemporalHorizon(value: unknown): DomainTemporalHorizon | null {
  if (!isRecord(value) || typeof value.scale !== 'string') return null;
  if (value.intent !== 'current' && value.intent !== 'review' && value.intent !== 'plan')
    return null;
  const anchor = parseTemporalAnchor(value.anchor);
  return anchor ? { anchor, scale: value.scale, intent: value.intent } : null;
}

function parseTemporalAnchor(value: unknown): DomainTemporalHorizon['anchor'] | null {
  if (!isRecord(value) || typeof value.kind !== 'string') return null;
  if (value.kind === 'today') return { kind: 'today' };
  if (value.kind === 'date' && typeof value.date === 'string')
    return { kind: 'date', date: value.date };
  if (value.kind === 'period' && typeof value.periodId === 'string') {
    return { kind: 'period', periodId: value.periodId };
  }
  if (value.kind === 'cycle' && typeof value.cycleId === 'string') {
    return { kind: 'cycle', cycleId: value.cycleId };
  }
  return null;
}

function parseResource(value: unknown): WorkbenchTaskResource | null {
  if (!isRecord(value) || typeof value.kind !== 'string' || typeof value.id !== 'string')
    return null;
  return { kind: value.kind, id: value.id };
}

function parseContext(value: unknown): Readonly<Record<string, string>> | null {
  if (!isRecord(value)) return null;
  const parsed: Record<string, string> = {};
  for (const [key, entry] of Object.entries(value)) {
    if (typeof entry !== 'string') return null;
    parsed[key] = entry;
  }
  return parsed;
}

function isWorkbenchDomain(value: unknown): value is WorkbenchDomain {
  return value === 'self' || value === 'workspace' || value === 'community' || value === 'library';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
