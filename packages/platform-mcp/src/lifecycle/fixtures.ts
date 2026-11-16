import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type { LifecycleRequest, LifecycleState } from './model.js';

export type LifecycleFixture = {
  root: string;
  databasePath: string;
  sourcePaths: string[];
  dispose: () => void;
};

export type ArtifactDraft = Omit<
  LifecycleState['artifacts'][number],
  'version' | 'observedAt' | 'sourceSnapshots' | 'procedureRevision'
>;

type RequestBase = Extract<LifecycleRequest, { operationId: string }>;
type RequestInput<T> = T extends RequestBase ? Omit<T, 'operationId' | 'expectedRevision'> : never;
export type LifecycleMutationInput = RequestInput<LifecycleRequest>;

type AnalysisContent = Extract<
  LifecycleState['artifacts'][number]['content'],
  { kind: 'analysis' }
>;
type AnalysisDimension = AnalysisContent['dimensions']['ux'];

export function createLifecycleFixture(
  files: Record<string, string> = { 'feature.md': 'Initial feature source.\n' },
): LifecycleFixture {
  const root = mkdtempSync(path.join(os.tmpdir(), 'coordination-lifecycle-'));
  for (const [relative, contents] of Object.entries(files)) {
    const destination = path.join(root, relative);
    mkdirSync(path.dirname(destination), { recursive: true });
    writeFileSync(destination, contents);
  }
  return {
    root,
    databasePath: path.join(root, 'coordination.sqlite'),
    sourcePaths: Object.keys(files),
    dispose: () => rmSync(root, { recursive: true, force: true }),
  };
}

export function baseLifecycleActors(): LifecycleState['actors'] {
  return [
    { id: 'product-agent', roles: ['product'] },
    { id: 'ux-agent', roles: ['ux'] },
    { id: 'motion-agent', roles: ['visual-motion'] },
    { id: 'architecture-agent', roles: ['architecture'] },
    { id: 'dependency-agent', roles: ['dependencies'] },
    { id: 'implementation-agent', roles: ['implementation'] },
    { id: 'verifier', roles: ['verification'] },
  ];
}

export function createRequest(
  fixture: LifecycleFixture,
  id: string,
): Extract<LifecycleRequest, { action: 'create' }> {
  return {
    action: 'create',
    id,
    operationId: `${id}-create`,
    expectedRevision: 0,
    goal: 'Implement the bounded feature slice',
    scope: 'feature',
    actors: baseLifecycleActors(),
    sourcePaths: fixture.sourcePaths,
    externalRefs: [],
  };
}

function dimension(sourcePath: string): AnalysisDimension {
  return {
    applicability: 'applies',
    reason: 'The feature scope includes this area.',
    sources: [sourcePath],
  };
}

export function analysisArtifact(sourcePath: string): ArtifactDraft {
  const dimensions: AnalysisContent['dimensions'] = {
    ux: dimension(sourcePath),
    screens: dimension(sourcePath),
    state: dimension(sourcePath),
    errors: dimension(sourcePath),
    feedback: dimension(sourcePath),
    motion: dimension(sourcePath),
    accessibility: dimension(sourcePath),
    data: dimension(sourcePath),
    api: dimension(sourcePath),
    database: dimension(sourcePath),
    dependencies: dimension(sourcePath),
    security: dimension(sourcePath),
    offline: dimension(sourcePath),
    reuse: dimension(sourcePath),
  };
  return {
    id: 'analysis',
    scope: 'Feature analysis',
    authorId: 'product-agent',
    sourcePaths: [sourcePath],
    dependsOn: [],
    content: {
      kind: 'analysis',
      requestKind: 'feature',
      dimensions,
      reuse: ['Check the existing shared component before adding a new one.'],
      openQuestions: [],
    },
  };
}

export function productArtifacts(
  sourcePath: string,
  analysisRef: { id: string; version: number },
): ArtifactDraft[] {
  return [
    {
      id: 'requirement',
      scope: 'Feature requirements',
      authorId: 'product-agent',
      sourcePaths: [sourcePath],
      dependsOn: [analysisRef],
      content: {
        kind: 'requirement',
        statement: 'The feature exposes its declared user outcome.',
        classification: 'functional',
        acceptance: ['The user can complete the declared journey.'],
        origin: 'proposal',
        authorityRefs: [],
        unresolved: [],
      },
    },
    {
      id: 'invariant',
      scope: 'Feature invariants',
      authorId: 'product-agent',
      sourcePaths: [sourcePath],
      dependsOn: [analysisRef],
      content: {
        kind: 'invariant',
        statement: 'Only accepted user actions change durable feature state.',
        scope: ['The feature command boundary'],
        violations: ['An unapproved action changes persisted data.'],
        verification: 'Verify the state before and after the command.',
      },
    },
    {
      id: 'scenario',
      scope: 'Feature scenario',
      authorId: 'product-agent',
      sourcePaths: [sourcePath],
      dependsOn: [analysisRef],
      content: {
        kind: 'scenario',
        preconditions: ['The user can open the feature.'],
        actions: ['The user completes the primary action.'],
        expected: ['The feature reports the resulting state.'],
      },
    },
  ];
}

export function experienceArtifact(
  sourcePath: string,
  authorId = 'ux-agent',
  dependsOn: ArtifactDraft['dependsOn'] = [],
): ArtifactDraft {
  return {
    id: 'experience',
    scope: 'Feature experience',
    authorId,
    sourcePaths: [sourcePath],
    dependsOn,
    content: {
      kind: 'experience',
      screens: [{ id: 'assistant', route: '/assistant', states: ['idle', 'streaming', 'failed'] }],
      stateAxes: [{ id: 'connection', states: ['connected', 'offline'] }],
      transitions: [
        {
          id: 'send',
          screenId: 'assistant',
          from: 'idle',
          to: 'streaming',
          event: 'submit',
          guard: 'valid message',
          effects: ['send request'],
          feedback: 'show response stream',
          recovery: 'preserve draft and retry',
          motionRef: 'motion:assistant-send',
        },
        {
          id: 'fail',
          screenId: 'assistant',
          from: 'streaming',
          to: 'failed',
          event: 'network error',
          guard: 'request failed',
          effects: [],
          feedback: 'show recoverable error',
          recovery: 'retry with same message',
          motionRef: 'motion:assistant-failure',
        },
      ],
      motionRequirements: [
        {
          id: 'motion:assistant-send',
          trigger: 'Message submission and stream start.',
          reducedMotion: 'Show streaming state without spatial movement.',
          cancellation: 'Cancel motion when request fails or screen closes.',
        },
        {
          id: 'motion:assistant-failure',
          trigger: 'The request enters the failed state.',
          reducedMotion: 'Show failure state without spatial movement.',
          cancellation: 'Cancel when retry begins.',
        },
      ],
      journeys: [
        {
          id: 'primary',
          actor: 'authenticated user',
          entryTransition: 'send',
          transitionIds: ['send', 'fail'],
          outcome: 'The user receives a response or a recoverable failure state.',
        },
      ],
      accessibility: ['Announce the streaming state.', 'Respect reduced motion.'],
      combinations: [
        {
          when: [{ axisId: 'connection', state: 'offline' }],
          must: ['show the recoverable error and preserve the draft'],
        },
      ],
    },
  };
}
