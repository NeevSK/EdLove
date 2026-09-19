/** The four Sanctuary destinations that own independent working sets. */
export type WorkbenchDomain = 'self' | 'workspace' | 'community' | 'library';

export type TemporalIntent = 'current' | 'review' | 'plan';

export type TemporalAnchor =
  | { kind: 'today' }
  | { kind: 'date'; date: string }
  | { kind: 'period'; periodId: string }
  | { kind: 'cycle'; cycleId: string };

/** A temporal lens belongs to one domain workbench, never to the global app. */
export interface DomainTemporalHorizon {
  anchor: TemporalAnchor;
  scale: string;
  intent: TemporalIntent;
}

export type TaskTemporalBinding =
  | { kind: 'follow-domain' }
  | { kind: 'fixed'; horizon: DomainTemporalHorizon }
  | { kind: 'none' };

export interface WorkbenchTaskResource {
  kind: string;
  id: string;
}

/**
 * This policy says whether local presentation state may be restored after the
 * authoritative task data has been rehydrated. It is not a data-sync policy.
 */
export type WorkbenchTaskLocalStatePolicy = 'none' | 'restore-permitted' | 'sensitive-no-restore';

export interface WorkbenchTaskInput {
  domain: WorkbenchDomain;
  featureId: string;
  route: string;
  title: string;
  temporalBinding: TaskTemporalBinding;
  localStatePolicy: WorkbenchTaskLocalStatePolicy;
  resource?: WorkbenchTaskResource;
  context?: Readonly<Record<string, string>>;
  icon?: string;
}

/** A validated, resumable feature instance. Overview/Catalog is never this type. */
export interface WorkbenchTaskDescriptor extends WorkbenchTaskInput {
  taskKey: string;
  openedAt: string;
  lastFocusedAt: string;
}

export interface DomainWorkbenchState {
  domain: WorkbenchDomain;
  tasks: readonly WorkbenchTaskDescriptor[];
  focusedTaskKey: string | null;
  temporalHorizon: DomainTemporalHorizon | null;
}

export interface WorkbenchTaskDescriptorIssue {
  field: string;
  message: string;
}

export type WorkbenchTaskCreation =
  | { ok: true; descriptor: WorkbenchTaskDescriptor }
  | { ok: false; issues: readonly WorkbenchTaskDescriptorIssue[] };

export interface WorkbenchRestorationSnapshot {
  domain: WorkbenchDomain;
  tasks: readonly WorkbenchTaskDescriptor[];
  focusedTaskKey: string | null;
  temporalHorizon: DomainTemporalHorizon | null;
}
