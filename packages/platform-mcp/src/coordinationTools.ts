import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { type CommandRunResult, runCommand } from './utils/execution.js';

type CheckImpact =
  | 'product'
  | 'architecture'
  | 'integration'
  | 'api'
  | 'web'
  | 'native'
  | 'database'
  | 'dependencies'
  | 'security';
export type CoordinationCheck = { readonly id: string; readonly impacts: readonly CheckImpact[] };
export type CoordinationCommandResult = Pick<
  CommandRunResult,
  'ok' | 'stdout' | 'stderr' | 'exitCode' | 'error'
>;

export const coordinationChecks: readonly CoordinationCheck[] = [
  { id: 'pjc-check', impacts: ['product'] },
  { id: 'c4-validate', impacts: ['architecture', 'integration'] },
  { id: 'api-composition', impacts: ['api', 'integration'] },
  { id: 'api-conformance', impacts: ['api'] },
  { id: 'ui-boundaries', impacts: ['web', 'native'] },
  { id: 'sql-migrations', impacts: ['database'] },
  { id: 'dependency-cohorts', impacts: ['dependencies'] },
  { id: 'security-review', impacts: ['security'] },
];

type CheckCommand = {
  readonly executable: string;
  readonly args: readonly string[];
  readonly cwd?: string;
};
function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function resolvePackageBin(root: string, packageName: string, binName = packageName): string {
  const requireFromRoot = createRequire(path.join(root, 'package.json'));
  const manifestPath = requireFromRoot.resolve(`${packageName}/package.json`);
  const manifestValue: unknown = JSON.parse(readFileSync(manifestPath, 'utf8'));
  if (!isRecord(manifestValue)) throw new Error(`Invalid ${packageName} package manifest`);
  const binValue = manifestValue.bin;
  const bin =
    typeof binValue === 'string' ? binValue : isRecord(binValue) ? binValue[binName] : undefined;
  if (typeof bin !== 'string' || bin.length === 0)
    throw new Error(`${packageName} does not declare bin ${binName}`);
  const executable = path.resolve(path.dirname(manifestPath), bin);
  if (!existsSync(executable)) throw new Error(`${packageName} bin does not exist: ${bin}`);
  return executable;
}

function commandFor(root: string, id: string): CheckCommand | { readonly error: string } {
  switch (id) {
    case 'pjc-check': {
      try {
        const tsx = resolvePackageBin(root, 'tsx');
        return {
          executable: process.execPath,
          args: [
            tsx,
            '--tsconfig',
            'packages/core/tsconfig.json',
            'scripts/pjc.ts',
            'check',
            '--format',
            'json',
          ],
        };
      } catch (error) {
        return {
          error: error instanceof Error ? error.message : 'Unable to resolve the tsx package bin',
        };
      }
    }
    case 'c4-validate': {
      try {
        return {
          executable: process.execPath,
          args: [resolvePackageBin(root, 'likec4'), 'validate', 'docs/architecture/model'],
        };
      } catch (error) {
        return {
          error:
            error instanceof Error ? error.message : 'Unable to resolve the likec4 package bin',
        };
      }
    }
    case 'api-composition':
      return { executable: process.execPath, args: ['scripts/audit-api-composition.mjs'] };
    case 'api-conformance':
      try {
        return {
          executable: process.execPath,
          args: [
            resolvePackageBin(root, 'tsx'),
            '--tsconfig',
            'tsconfig.json',
            'scripts/capability-conformance.ts',
            '--check',
          ],
          cwd: path.join(root, 'apps', 'sanctuary-api'),
        };
      } catch (error) {
        return {
          error: error instanceof Error ? error.message : 'Unable to resolve the tsx package bin',
        };
      }
    case 'ui-boundaries':
      return { executable: process.execPath, args: ['scripts/check-ui-boundaries.mjs'] };
    case 'sql-migrations':
      return { executable: process.execPath, args: ['scripts/lint-new-migrations.mjs'] };
    case 'dependency-cohorts':
      return {
        executable: process.execPath,
        args: ['scripts/harmonize-dependencies.mjs', '--check'],
      };
    case 'security-review':
      return {
        error: 'Security review is blocked because a scoped scan adapter is not implemented.',
      };
    default:
      return { error: `Unknown or unavailable check: ${id}` };
  }
}

function toCoordinationResult(result: CommandRunResult): CoordinationCommandResult {
  return {
    ok: result.ok,
    stdout: result.stdout,
    stderr: result.stderr,
    exitCode: result.exitCode,
    ...(result.error ? { error: result.error } : {}),
  };
}

export function runCoordinationCheck(root: string, id: string): CoordinationCommandResult {
  const command = commandFor(root, id);
  if ('error' in command) {
    return { ok: false, stdout: '', stderr: command.error, exitCode: null, error: command.error };
  }
  return toCoordinationResult(
    runCommand(command.executable, [...command.args], {
      cwd: command.cwd ?? root,
      shell: false,
      timeoutMs: 120_000,
      maxBuffer: 2 * 1024 * 1024,
    }),
  );
}

export function runPjcJourney(root: string, journeyId: string): CoordinationCommandResult {
  if (!/^[a-zA-Z0-9:_.-]{1,160}$/.test(journeyId)) {
    const error = 'Invalid journey ID';
    return { ok: false, stdout: '', stderr: error, exitCode: null, error };
  }
  let tsx: string;
  try {
    tsx = resolvePackageBin(root, 'tsx');
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to resolve the tsx package bin';
    return { ok: false, stdout: '', stderr: message, exitCode: null, error: message };
  }
  return toCoordinationResult(
    runCommand(
      process.execPath,
      [
        tsx,
        '--tsconfig',
        'packages/core/tsconfig.json',
        'scripts/pjc.ts',
        'journey',
        journeyId,
        '--format',
        'json',
      ],
      {
        cwd: root,
        shell: false,
        timeoutMs: 120_000,
        maxBuffer: 2 * 1024 * 1024,
      },
    ),
  );
}

export type ContextScope = 'local' | 'interface' | 'full';

export interface ContextOptions {
  scope?: ContextScope;
  targetDomain?: string;
}

export interface ContextBottleneck {
  scope: ContextScope;
  targetDomain?: string;
  relevanceTarget: string;
  compressed: boolean;
  policy: string;
}

export function filterContextProjection(
  projection: unknown,
  options: ContextOptions = {},
): Record<string, unknown> {
  if (!isRecord(projection)) {
    return {
      projection,
      bottleneck: {
        scope: options.scope ?? 'full',
        relevanceTarget: 'raw',
        compressed: false,
        policy: 'Raw unparseable projection',
      },
    };
  }

  const scope = options.scope ?? 'full';
  const targetDomain = options.targetDomain?.toLowerCase();

  const matchesDomain = (value: unknown): boolean => {
    if (!targetDomain) return true;
    if (typeof value === 'string') return value.toLowerCase().includes(targetDomain);
    if (isRecord(value)) {
      const serialized = JSON.stringify(value).toLowerCase();
      return serialized.includes(targetDomain);
    }
    return false;
  };

  const feature = isRecord(projection.feature) ? projection.feature : undefined;
  const intent = isRecord(projection.intent) ? projection.intent : undefined;
  const journey = isRecord(projection.journey) ? projection.journey : undefined;
  const development = journey && isRecord(journey.development) ? journey.development : undefined;
  const scenarios = Array.isArray(projection.scenarios) ? projection.scenarios : [];
  const steps = journey && Array.isArray(journey.steps) ? journey.steps : [];

  const integrationPoints = Array.isArray(development?.integrationPoints)
    ? development.integrationPoints.filter(matchesDomain)
    : [];

  const invariants = Array.isArray(development?.invariants)
    ? development.invariants.filter(matchesDomain)
    : [];

  if (scope === 'local') {
    const localSteps = steps.filter((step: unknown) => {
      if (!isRecord(step)) return false;
      if (journey?.entry && step.id === journey.entry) return true;
      return matchesDomain(step);
    });

    return {
      journeyId: journey?.id ?? 'unknown',
      title: journey?.title,
      entry: journey?.entry,
      preconditions: journey?.preconditions,
      invariants,
      integrationPoints,
      steps: localSteps,
      bottleneck: {
        scope: 'local',
        ...(options.targetDomain ? { targetDomain: options.targetDomain } : {}),
        relevanceTarget: options.targetDomain ? `domain:${options.targetDomain}` : 'local:component',
        compressed: true,
        policy:
          'H2 Information Bottleneck: Suppressed non-local scenarios, shared requirements, and transitive historical steps to bound decision variety (min I(X;Z) - beta*I(Z;Y)).',
      },
    };
  }

  if (scope === 'interface') {
    const interfaceScenarios = scenarios
      .map((scenario: unknown) => {
        if (!isRecord(scenario)) return scenario;
        return {
          id: scenario.id,
          title: scenario.title,
          scenario: scenario.scenario,
          tier: scenario.tier,
          result: scenario.result,
        };
      })
      .filter(matchesDomain);

    const interfaceSteps = steps
      .map((step: unknown) => {
        if (!isRecord(step)) return step;
        return {
          id: step.id,
          title: step.title,
          terminal: step.terminal,
        };
      })
      .filter(matchesDomain);

    return {
      feature,
      intent,
      journeyId: journey?.id ?? 'unknown',
      title: journey?.title,
      situation: journey?.situation,
      preconditions: journey?.preconditions,
      invariants,
      integrationPoints,
      steps: interfaceSteps,
      scenarios: interfaceScenarios,
      bottleneck: {
        scope: 'interface',
        ...(options.targetDomain ? { targetDomain: options.targetDomain } : {}),
        relevanceTarget: options.targetDomain
          ? `interface:${options.targetDomain}`
          : 'interface:boundary',
        compressed: true,
        policy:
          'H2 Information Bottleneck: Preserved seam contracts, boundary invariants, and verification tier summaries; compressed internal step interactions.',
      },
    };
  }

  if (targetDomain) {
    const domainScenarios = scenarios.filter(matchesDomain);
    const domainSteps = steps.filter(matchesDomain);

    return {
      ...projection,
      journey: journey
        ? {
            ...journey,
            development: development
              ? {
                  ...development,
                  invariants,
                  integrationPoints,
                }
              : development,
            steps: domainSteps,
          }
        : journey,
      scenarios: domainScenarios,
      bottleneck: {
        scope: 'full',
        targetDomain: options.targetDomain,
        relevanceTarget: `domain:${options.targetDomain}`,
        compressed: true,
        policy: 'H2 Information Bottleneck: Filtered full projection conditioned on targetDomain.',
      },
    };
  }

  return {
    ...projection,
    bottleneck: {
      scope: 'full',
      relevanceTarget: 'unconstrained',
      compressed: false,
      policy:
        'Unconstrained projection: Pass scope: "local" | "interface" or targetDomain to bound context variety.',
    },
  };
}

export function runPjcJourneyContext(
  root: string,
  journeyId: string,
  options: ContextOptions = {},
): {
  ok: boolean;
  journeyId: string;
  scope: ContextScope;
  targetDomain?: string;
  projection?: Record<string, unknown>;
  error?: string;
} {
  const result = runPjcJourney(root, journeyId);
  if (!result.ok) {
    return {
      ok: false,
      journeyId,
      scope: options.scope ?? 'full',
      ...(options.targetDomain ? { targetDomain: options.targetDomain } : {}),
      error: result.error ?? result.stderr,
    };
  }
  try {
    const raw = JSON.parse(result.stdout);
    const projection = filterContextProjection(raw, options);
    return {
      ok: true,
      journeyId,
      scope: options.scope ?? 'full',
      ...(options.targetDomain ? { targetDomain: options.targetDomain } : {}),
      projection,
    };
  } catch (error) {
    return {
      ok: false,
      journeyId,
      scope: options.scope ?? 'full',
      ...(options.targetDomain ? { targetDomain: options.targetDomain } : {}),
      error: error instanceof Error ? error.message : 'Invalid JSON from PJC journey',
    };
  }
}

export type CoordinationTool = {
  readonly id: string;
  readonly availability: 'available' | 'unavailable' | 'blocked';
  readonly version: string | null;
  readonly observedAt: string;
  readonly capability: 'discovery-only' | 'check-enabled';
  readonly prerequisites: readonly string[];
  readonly limits: readonly string[];
  readonly detail?: string;
};

type ToolProbe = {
  readonly id: string;
  readonly executable: string;
  readonly args: readonly string[];
  readonly packageBin?: { readonly packageName: string; readonly binName?: string };
  readonly capability: CoordinationTool['capability'];
  readonly prerequisites: readonly string[];
  readonly limits: readonly string[];
};

const probeDefinitions: readonly ToolProbe[] = [
  {
    id: 'likec4',
    executable: 'likec4',
    args: ['--version'],
    packageBin: { packageName: 'likec4' },
    capability: 'check-enabled',
    prerequisites: ['Model files and installed package'],
    limits: [
      'C4 validation checks model syntax and declared structure, not runtime hops or semantic correctness.',
    ],
  },
  {
    id: 'k6',
    executable: 'k6.exe',
    args: ['version'],
    capability: 'discovery-only',
    prerequisites: ['Approved workload and target'],
    limits: ['No load or network scans are run by inventory.'],
  },
  {
    id: 'syft',
    executable: 'syft.exe',
    args: ['version'],
    capability: 'discovery-only',
    prerequisites: ['Explicit scan target'],
    limits: ['No filesystem scan is run by inventory.'],
  },
  {
    id: 'gitleaks',
    executable: 'gitleaks.exe',
    args: ['version'],
    capability: 'discovery-only',
    prerequisites: ['Scoped repository or commit range'],
    limits: ['A gitleaks version probe does not run a security review.'],
  },
  {
    id: 'osv-scanner',
    executable: 'osv-scanner.exe',
    args: ['--version'],
    capability: 'discovery-only',
    prerequisites: ['Supported lockfile and scan scope'],
    limits: ['No dependency scan is run by inventory.'],
  },
  {
    id: 'schemathesis',
    executable: 'schemathesis.exe',
    args: ['--version'],
    capability: 'discovery-only',
    prerequisites: ['Supported contract schema and approved target'],
    limits: ['Do not create a parallel OpenAPI API contract.'],
  },
  {
    id: 'spectral',
    executable: 'spectral',
    args: ['--version'],
    packageBin: { packageName: '@stoplight/spectral-cli', binName: 'spectral' },
    capability: 'discovery-only',
    prerequisites: ['Explicit ruleset and document'],
    limits: ['No lint is run without a selected ruleset.'],
  },
  {
    id: 'squawk',
    executable: 'squawk',
    args: ['--version'],
    packageBin: { packageName: 'squawk-cli', binName: 'squawk' },
    capability: 'discovery-only',
    prerequisites: ['SQL input and selected rules'],
    limits: ['No migration runtime behavior is exercised.'],
  },
  {
    id: 'rg',
    executable: 'rg.exe',
    args: ['--version'],
    capability: 'discovery-only',
    prerequisites: [],
    limits: ['Search results do not establish complete source coverage.'],
  },
  {
    id: 'fd',
    executable: 'fd.exe',
    args: ['--version'],
    capability: 'discovery-only',
    prerequisites: [],
    limits: ['Discovery output is not a complete repository inventory guarantee.'],
  },
  {
    id: 'ast-grep',
    executable: 'ast-grep.exe',
    args: ['--version'],
    capability: 'discovery-only',
    prerequisites: ['Query or rule'],
    limits: ['AST matches do not prove semantic correctness.'],
  },
];

function findVersion(output: string): string | null {
  const match = output.match(/(?:^|[^\d])v?(\d+\.\d+(?:\.\d+)?(?:[-+][\w.-]+)?)/);
  return match?.[1] ?? null;
}

function nativeExecutableName(executable: string): string {
  if (process.platform === 'win32')
    return executable.endsWith('.exe') ? executable : `${executable}.exe`;
  return executable.endsWith('.exe') ? executable.slice(0, -4) : executable;
}

export function listCoordinationTools(root: string): CoordinationTool[] {
  const observedAt = new Date().toISOString();
  const probes = probeDefinitions.map((definition): CoordinationTool => {
    let executable = nativeExecutableName(definition.executable);
    let args = [...definition.args];
    try {
      if (definition.packageBin) {
        executable = process.execPath;
        args = [
          resolvePackageBin(root, definition.packageBin.packageName, definition.packageBin.binName),
          ...args,
        ];
      }
    } catch (error) {
      return {
        id: definition.id,
        availability: 'unavailable',
        version: null,
        observedAt,
        capability: definition.capability,
        prerequisites: definition.prerequisites,
        limits: definition.limits,
        detail: error instanceof Error ? error.message : 'Package executable could not be resolved',
      };
    }
    const available = runCommand(executable, args, {
      cwd: root,
      shell: false,
      timeoutMs: 5_000,
      maxBuffer: 64 * 1024,
    });
    const output = `${available.stdout}\n${available.stderr}`.trim();
    if (available.exitCode === null && available.error) {
      return {
        id: definition.id,
        availability: 'unavailable',
        version: null,
        observedAt,
        capability: definition.capability,
        prerequisites: definition.prerequisites,
        limits: definition.limits,
        detail: available.error,
      };
    }
    return {
      id: definition.id,
      availability: available.ok ? 'available' : 'unavailable',
      version: available.ok ? findVersion(output) : null,
      observedAt,
      capability: definition.capability,
      prerequisites: definition.prerequisites,
      limits: definition.limits,
      ...(!available.ok ? { detail: available.error ?? (output || 'Version probe failed') } : {}),
    };
  });
  for (const check of coordinationChecks) {
    if (check.id === 'security-review') continue;
    const resolution = commandFor(root, check.id);
    const scriptPath =
      'args' in resolution
        ? resolution.args.find((argument) => argument.startsWith('scripts/'))
        : undefined;
    const workingDirectory = 'cwd' in resolution && resolution.cwd ? resolution.cwd : root;
    const scriptAvailable =
      scriptPath === undefined || existsSync(path.join(workingDirectory, scriptPath));
    const available = !('error' in resolution) && scriptAvailable;
    probes.push({
      id: `check:${check.id}`,
      availability: available ? 'available' : 'unavailable',
      version: null,
      observedAt,
      capability: 'check-enabled',
      prerequisites:
        check.id === 'api-conformance'
          ? ['Sanctuary API package files and installed tsx package']
          : check.id === 'pjc-check'
            ? ['PJC catalog inputs and installed tsx package']
            : check.id === 'c4-validate'
              ? ['Model files and installed LikeC4 package']
              : ['Required repository script and inputs'],
      limits:
        check.id === 'sql-migrations'
          ? ['A clean migration lint does not prove SQL runtime behavior.']
          : ['Availability means the command and its entrypoint resolve; the check has not run.'],
      ...(!available
        ? {
            detail:
              'error' in resolution ? resolution.error : `Missing check entrypoint: ${scriptPath}`,
          }
        : {}),
    });
  }
  probes.push({
    id: 'security-review',
    availability: 'blocked',
    version: null,
    observedAt,
    capability: 'discovery-only',
    prerequisites: ['Scoped security scan adapter'],
    limits: ['A gitleaks executable alone does not run a security review.'],
    detail:
      'Select a scan scope, then implement and verify a scoped adapter. Inventory does not run a security scan.',
  });
  return probes;
}
