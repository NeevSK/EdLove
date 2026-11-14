import { execFileSync } from 'node:child_process';
import { existsSync, lstatSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { adminORPCContract } from '@repo/core/api/admin.orpc.contract';
import { agentORPCContract } from '@repo/core/api/agent.orpc.contract';
import { announcementsORPCContract } from '@repo/core/api/announcements.orpc.contract';
import { attendanceORPCContract } from '@repo/core/api/attendance.orpc.contract';
import { channelORPCContract } from '@repo/core/api/channel.orpc.contract';
import { communityORPCContract } from '@repo/core/api/community.orpc.contract';
import { inspectContractRoutes } from '@repo/core/api/contractInspection';
import { POAMetadataSchema } from '@repo/core/api/contracts';
import { dailyContentORPCContract } from '@repo/core/api/dailyContent.orpc.contract';
import { decisionJournalContract } from '@repo/core/api/decisionJournal.contract';
import { echoContract } from '@repo/core/api/echo.contract';
import { editorialContract } from '@repo/core/api/editorial.contract';
import { educationalORPCContract } from '@repo/core/api/educational.orpc.contract';
import { erpContract } from '@repo/core/api/erp.contract';
import { eventsORPCContract } from '@repo/core/api/events.orpc.contract';
import { formsContract } from '@repo/core/api/forms.contract';
import { gradingORPCContract } from '@repo/core/api/grading.orpc.contract';
import { guardianAssessmentORPCContract } from '@repo/core/api/guardian-assessment.orpc.contract';
import { historyContract } from '@repo/core/api/history.contract';
import { identityContract } from '@repo/core/api/identity.contract';
import { inventoryContract } from '@repo/core/api/inventory.contract';
import { libraryContract } from '@repo/core/api/library.contract';
import { longitudinalContract } from '@repo/core/api/longitudinal.contract';
import { mappingContract } from '@repo/core/api/mapping.contract';
import { mediaUploadContract } from '@repo/core/api/mediaUpload.contract';
import { messagingORPCContract } from '@repo/core/api/messaging.orpc.contract';
import { onboardingORPCContract } from '@repo/core/api/onboarding.orpc.contract';
import { permissionSnapshotContract } from '@repo/core/api/permissionSnapshot.contract';
import { planBridgeORPCContract } from '@repo/core/api/planBridge.orpc.contract';
import { presenceContract } from '@repo/core/api/presence.contract';
import { principalNotesORPCContract } from '@repo/core/api/principalNotes.orpc.contract';
import { privacyORPCContract } from '@repo/core/api/privacy.orpc.contract';
import { profileContract } from '@repo/core/api/profile.contract';
import { sacredMissionsContract } from '@repo/core/api/sacredMissions.contract';
import { schoolForestContract } from '@repo/core/api/schoolForest.contract';
import { selfContract } from '@repo/core/api/self.contract';
import { socialORPCContract } from '@repo/core/api/social.orpc.contract';
import { studentPotentialContract } from '@repo/core/api/studentPotential.contract';
import { syncContract } from '@repo/core/api/sync.contract';
import { thuthimalContract } from '@repo/core/api/thuthimal.contract';
import { trackingContract } from '@repo/core/api/tracking.contract';
import { warmMirrorContract } from '@repo/core/api/warmMirror.contract';
import { workspaceProvisioningORPCContract } from '@repo/core/api/workspace-provisioning.orpc.contract';
import { AUTHORIZATION_RESOURCES } from '@repo/policies/authorizationRegistry';
import { nativeORPCPaths } from '../apps/sanctuary-api/src/core/routes/nativeORPCPaths';
import { journalEntriesContract } from '../packages/core/src/api/journalEntries.contract';
import { learningReflectionsContract } from '../packages/core/src/api/learningReflections.contract';
import { rewardsORPCContract } from '../packages/core/src/api/rewards.orpc.contract';

type ContractSource = {
  name: string;
  contractFile: string;
  handlerFile: string;
  contract: unknown;
  clientStatus: 'mapped' | 'partially-mapped' | 'legacy-direct' | 'server-only' | 'planned';
  clientFiles: string[];
};

type Finding = {
  severity: 'error' | 'warning';
  code: string;
  source: string;
  procedure: string;
  path?: string;
  message: string;
};

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const sources: ContractSource[] = [
  {
    name: 'events',
    contractFile: 'events.orpc.contract.ts',
    handlerFile: 'events.ts',
    contract: eventsORPCContract,
    clientStatus: 'mapped',
    clientFiles: ['apps/gurudevi-mobile/src/lib/inngestEvents.ts'],
  },
  {
    name: 'editorial',
    contractFile: 'editorial.contract.ts',
    handlerFile: 'editorial.ts',
    contract: editorialContract,
    clientStatus: 'mapped',
    clientFiles: ['apps/gurudevi-mobile/app/(tabs)/workspace/editorial.tsx'],
  },
  {
    name: 'channel',
    contractFile: 'channel.orpc.contract.ts',
    handlerFile: 'channel.ts',
    contract: channelORPCContract,
    clientStatus: 'server-only',
    clientFiles: [],
  },
  {
    name: 'media',
    contractFile: 'mediaUpload.contract.ts',
    handlerFile: 'media.ts',
    contract: mediaUploadContract,
    clientStatus: 'mapped',
    clientFiles: ['packages/core/src/api/mediaUpload.ts', 'packages/core/src/api/media.ts'],
  },
  {
    name: 'planBridge',
    contractFile: 'planBridge.orpc.contract.ts',
    handlerFile: 'planBridge.ts',
    contract: planBridgeORPCContract,
    clientStatus: 'mapped',
    clientFiles: ['packages/core/src/api/planBridge.ts'],
  },
  {
    name: 'workspaceProvisioning',
    contractFile: 'workspace-provisioning.orpc.contract.ts',
    handlerFile: 'workspaceProvisioning.ts',
    contract: workspaceProvisioningORPCContract,
    clientStatus: 'mapped',
    clientFiles: ['packages/core/src/api/workspaceProvisioning.ts'],
  },
  {
    name: 'self',
    contractFile: 'self.contract.ts',
    handlerFile: 'self.ts',
    contract: selfContract,
    clientStatus: 'mapped',
    clientFiles: ['packages/core/src/lib/sync/registry.ts'],
  },
  {
    name: 'profile',
    contractFile: 'profile.contract.ts',
    handlerFile: 'profile.ts',
    contract: profileContract,
    clientStatus: 'mapped',
    clientFiles: ['packages/core/src/api/profile.ts'],
  },
  {
    name: 'identity',
    contractFile: 'identity.contract.ts',
    handlerFile: 'identity.ts',
    contract: identityContract,
    clientStatus: 'mapped',
    clientFiles: ['packages/core/src/api/identity.ts'],
  },
  {
    name: 'onboarding',
    contractFile: 'onboarding.orpc.contract.ts',
    handlerFile: 'onboarding.ts',
    contract: onboardingORPCContract,
    clientStatus: 'mapped',
    clientFiles: [
      'packages/core/src/api/onboarding.ts',
      'packages/core/src/api/onboardingClient.ts',
    ],
  },
  {
    name: 'principalNotes',
    contractFile: 'principalNotes.orpc.contract.ts',
    handlerFile: 'principalNotes.ts',
    contract: principalNotesORPCContract,
    clientStatus: 'mapped',
    clientFiles: ['packages/core/src/api/principalNotes.ts'],
  },
  {
    name: 'sync',
    contractFile: 'sync.contract.ts',
    handlerFile: 'sync.ts',
    contract: syncContract,
    clientStatus: 'mapped',
    clientFiles: [
      'packages/core/src/lib/sync/registry.ts',
      'packages/core/src/native/guestDataSync.ts',
      'packages/core/src/adapters/powersync/SupabasePowerSyncConnector.ts',
    ],
  },
  {
    name: 'tracking',
    contractFile: 'tracking.contract.ts',
    handlerFile: 'tracking.ts',
    contract: trackingContract,
    clientStatus: 'mapped',
    clientFiles: ['packages/core/src/api/tracking.ts'],
  },
  {
    name: 'warmMirror',
    contractFile: 'warmMirror.contract.ts',
    handlerFile: 'warmMirror.ts',
    contract: warmMirrorContract,
    clientStatus: 'mapped',
    clientFiles: ['packages/core/src/api/warmMirror.ts'],
  },
  {
    name: 'presence',
    contractFile: 'presence.contract.ts',
    handlerFile: 'presence.ts',
    contract: presenceContract,
    clientStatus: 'mapped',
    clientFiles: ['packages/core/src/api/presence.ts'],
  },
  {
    name: 'dailyContent',
    contractFile: 'dailyContent.orpc.contract.ts',
    handlerFile: 'dailyContent.ts',
    contract: dailyContentORPCContract,
    clientStatus: 'mapped',
    clientFiles: ['packages/core/src/api/dailyContent.ts'],
  },
  {
    name: 'decisionJournal',
    contractFile: 'decisionJournal.contract.ts',
    handlerFile: 'decisionJournal.ts',
    contract: decisionJournalContract,
    clientStatus: 'server-only',
    clientFiles: [],
  },
  {
    name: 'journalEntries',
    contractFile: 'journalEntries.contract.ts',
    handlerFile: 'journalEntries.ts',
    contract: journalEntriesContract,
    clientStatus: 'mapped',
    clientFiles: ['packages/core/src/api/journalEntries.ts'],
  },
  {
    name: 'learningReflections',
    contractFile: 'learningReflections.contract.ts',
    handlerFile: 'learningReflections.ts',
    contract: learningReflectionsContract,
    clientStatus: 'server-only',
    clientFiles: [],
  },
  {
    name: 'sacredMissions',
    contractFile: 'sacredMissions.contract.ts',
    handlerFile: 'sacredMissions.ts',
    contract: sacredMissionsContract,
    clientStatus: 'mapped',
    clientFiles: ['packages/core/src/api/sacredMissions.ts'],
  },
  {
    name: 'library',
    contractFile: 'library.contract.ts',
    handlerFile: 'library.ts',
    contract: libraryContract,
    clientStatus: 'mapped',
    clientFiles: ['packages/core/src/api/library.ts'],
  },
  {
    name: 'authorization',
    contractFile: 'permissionSnapshot.contract.ts',
    handlerFile: 'permissionSnapshot.ts',
    contract: permissionSnapshotContract,
    clientStatus: 'mapped',
    clientFiles: ['packages/core/src/api/authorization.ts'],
  },
  {
    name: 'educational',
    contractFile: 'educational.orpc.contract.ts',
    handlerFile: 'educational.ts',
    contract: educationalORPCContract,
    clientStatus: 'mapped',
    clientFiles: [
      'packages/core/src/api/classroom.ts',
      'packages/core/src/api/classrooms.ts',
      'packages/core/src/api/community.ts',
      'packages/core/src/api/resources.ts',
    ],
  },
  {
    name: 'grading',
    contractFile: 'grading.orpc.contract.ts',
    handlerFile: 'grading.ts',
    contract: gradingORPCContract,
    clientStatus: 'mapped',
    clientFiles: ['packages/core/src/api/grading.ts'],
  },
  {
    name: 'attendance',
    contractFile: 'attendance.orpc.contract.ts',
    handlerFile: 'attendance.ts',
    contract: attendanceORPCContract,
    clientStatus: 'mapped',
    clientFiles: ['packages/core/src/api/attendance.ts'],
  },
  {
    name: 'community',
    contractFile: 'community.orpc.contract.ts',
    handlerFile: 'community.ts',
    contract: communityORPCContract,
    clientStatus: 'mapped',
    clientFiles: ['packages/core/src/api/community.ts', 'packages/core/src/api/groups.ts'],
  },
  {
    name: 'admin',
    contractFile: 'admin.orpc.contract.ts',
    handlerFile: 'admin.ts',
    contract: adminORPCContract,
    clientStatus: 'mapped',
    clientFiles: ['packages/core/src/api/staffManagement.ts'],
  },
  {
    name: 'messaging',
    contractFile: 'messaging.orpc.contract.ts',
    handlerFile: 'messaging.ts',
    contract: messagingORPCContract,
    clientStatus: 'mapped',
    clientFiles: ['packages/core/src/api/messaging.ts'],
  },
  {
    name: 'social',
    contractFile: 'social.orpc.contract.ts',
    handlerFile: 'social.ts',
    contract: socialORPCContract,
    clientStatus: 'mapped',
    clientFiles: [
      'packages/core/src/api/social.ts',
      'packages/core/src/hooks/useScopedNotifications.ts',
    ],
  },
  {
    name: 'announcements',
    contractFile: 'announcements.orpc.contract.ts',
    handlerFile: 'announcements.ts',
    contract: announcementsORPCContract,
    clientStatus: 'mapped',
    clientFiles: ['packages/core/src/api/announcements.ts'],
  },
  {
    name: 'guardianAssessment',
    contractFile: 'guardian-assessment.orpc.contract.ts',
    handlerFile: 'guardianAssessment.ts',
    contract: guardianAssessmentORPCContract,
    clientStatus: 'server-only',
    clientFiles: [],
  },
  {
    name: 'agent',
    contractFile: 'agent.orpc.contract.ts',
    handlerFile: 'agent.ts',
    contract: agentORPCContract,
    clientStatus: 'mapped',
    clientFiles: ['packages/core/src/api/agent.ts'],
  },
  {
    name: 'thuthimal',
    contractFile: 'thuthimal.contract.ts',
    handlerFile: 'thuthimal.ts',
    contract: thuthimalContract,
    clientStatus: 'mapped',
    clientFiles: ['packages/core/src/api/thuthimal.ts'],
  },
  {
    name: 'erp',
    contractFile: 'erp.contract.ts',
    handlerFile: 'erp.ts',
    contract: erpContract,
    clientStatus: 'mapped',
    clientFiles: ['packages/core/src/api/erp.ts'],
  },
  {
    name: 'forms',
    contractFile: 'forms.contract.ts',
    handlerFile: 'forms.ts',
    contract: formsContract,
    clientStatus: 'mapped',
    clientFiles: ['packages/core/src/api/formTemplates.ts'],
  },
  {
    name: 'mapping',
    contractFile: 'mapping.contract.ts',
    handlerFile: 'mapping.ts',
    contract: mappingContract,
    clientStatus: 'mapped',
    clientFiles: ['packages/core/src/api/mapping.ts'],
  },
  {
    name: 'inventory',
    contractFile: 'inventory.contract.ts',
    handlerFile: 'inventory.ts',
    contract: inventoryContract,
    clientStatus: 'mapped',
    clientFiles: ['packages/core/src/api/inventory.ts'],
  },
  {
    name: 'history',
    contractFile: 'history.contract.ts',
    handlerFile: 'history.ts',
    contract: historyContract,
    clientStatus: 'mapped',
    clientFiles: ['packages/core/src/api/history.ts'],
  },
  {
    name: 'longitudinal',
    contractFile: 'longitudinal.contract.ts',
    handlerFile: 'longitudinal.ts',
    contract: longitudinalContract,
    clientStatus: 'mapped',
    clientFiles: ['packages/core/src/api/longitudinal.ts'],
  },
  {
    name: 'schoolForest',
    contractFile: 'schoolForest.contract.ts',
    handlerFile: 'schoolForest.ts',
    contract: schoolForestContract,
    clientStatus: 'mapped',
    clientFiles: ['packages/core/src/api/schoolForest.ts'],
  },
  {
    name: 'privacy',
    contractFile: 'privacy.orpc.contract.ts',
    handlerFile: 'privacy.ts',
    contract: privacyORPCContract,
    clientStatus: 'mapped',
    clientFiles: ['packages/core/src/api/privacy.ts'],
  },
  {
    name: 'studentPotential',
    contractFile: 'studentPotential.contract.ts',
    handlerFile: 'studentPotential.ts',
    contract: studentPotentialContract,
    clientStatus: 'mapped',
    clientFiles: ['packages/core/src/api/studentPotential.ts'],
  },
  {
    name: 'rewards',
    contractFile: 'rewards.orpc.contract.ts',
    handlerFile: 'rewards.ts',
    contract: rewardsORPCContract,
    clientStatus: 'mapped',
    clientFiles: ['packages/core/src/api/rewards.ts'],
  },
  {
    name: 'echoes',
    contractFile: 'echo.contract.ts',
    handlerFile: 'echo.ts',
    contract: echoContract,
    clientStatus: 'mapped',
    clientFiles: ['packages/core/src/api/echo.ts'],
  },
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function protocolFor(source: ContractSource): string {
  if (source.name === 'social' && source.clientStatus === 'partially-mapped') return 'mixed';
  if (source.clientStatus === 'legacy-direct') return 'direct-supabase';
  if (source.clientStatus === 'server-only') return 'server-only';
  return 'native-orpc';
}

function collectClientCalls(clientFiles: string[]): string[] {
  const calls = new Set<string>();
  const callPattern =
    /(?:client\.api(?:\s+as\s+any)?\)?(?:\.[A-Za-z0-9_$-]+|\[['"][^'"]+['"]\])+\.\$(get|post|put|patch|delete)|orpcClient(?:\.[A-Za-z0-9_$-]+|\[['"][^'"]+['"]\]){2,})/g;
  for (const clientFile of clientFiles) {
    const filePath = resolve(root, clientFile);
    if (!existsSync(filePath)) continue;
    const contents = readFileSync(filePath, 'utf8');
    for (const match of contents.matchAll(callPattern)) {
      calls.add(match[0]);
    }
  }
  return [...calls].sort();
}

function audit(): {
  sources: Array<Record<string, unknown>>;
  routes: Array<Record<string, unknown>>;
  findings: Finding[];
} {
  const findings: Finding[] = [];
  const routes: Array<Record<string, unknown>> = [];
  const seenPaths = new Map<string, string>();

  for (const source of sources) {
    const handlerPath = resolve(root, 'apps/sanctuary-api/src/core/handlers', source.handlerFile);
    const clientCalls = collectClientCalls(source.clientFiles);
    if (!existsSync(handlerPath)) {
      findings.push({
        severity: 'error',
        code: 'HANDLER_FILE_MISSING',
        source: source.name,
        procedure: '*',
        message: `Active contract points at missing handler file ${source.handlerFile}`,
      });
    }

    for (const clientFile of source.clientFiles) {
      if (!existsSync(resolve(root, clientFile))) {
        findings.push({
          severity: 'error',
          code: 'CLIENT_FILE_MISSING',
          source: source.name,
          procedure: '*',
          message: `Declared ${source.clientStatus} client file is missing: ${clientFile}`,
        });
      }
    }

    if (source.clientStatus === 'legacy-direct' || source.clientStatus === 'partially-mapped') {
      findings.push({
        severity: 'warning',
        code:
          source.clientStatus === 'partially-mapped'
            ? 'PARTIAL_LEGACY_CLIENT'
            : 'LEGACY_DIRECT_CLIENT',
        source: source.name,
        procedure: '*',
        message:
          source.clientStatus === 'partially-mapped'
            ? 'Some first-party methods use the active API contract, but this client file still contains direct database methods; migrate the remaining methods before treating this domain as production-complete.'
            : 'First-party client surface still bypasses the active API contract through a legacy/direct adapter; migrate it before treating this domain as production-complete.',
      });
    }

    if (source.clientStatus === 'planned') {
      findings.push({
        severity: 'warning',
        code: 'CLIENT_SURFACE_PLANNED',
        source: source.name,
        procedure: '*',
        message:
          'No first-party client mapping is declared in this registry; actual callers require separate discovery.',
      });
    }

    if (source.clientStatus === 'mapped' && clientCalls.length === 0) {
      findings.push({
        severity: 'warning',
        code: 'CLIENT_MAPPING_EMPTY',
        source: source.name,
        procedure: '*',
        message:
          'Domain is declared mapped but no matching lexical API call was found in its listed files. Indirect or cast callers require separate inspection.',
      });
    }

    for (const { procedure, route } of inspectContractRoutes(source.contract)) {
      const routeKey = `${route.method.toUpperCase()} ${route.path}`;
      const previous = seenPaths.get(routeKey);
      if (previous) {
        findings.push({
          severity: 'warning',
          code: 'DUPLICATE_HTTP_ROUTE',
          source: source.name,
          procedure,
          path: route.path,
          message: `${routeKey} is also declared by ${previous}`,
        });
      } else {
        seenPaths.set(routeKey, `${source.name}.${procedure}`);
      }

      if (!['get', 'post', 'put', 'patch', 'delete'].includes(route.method.toLowerCase())) {
        findings.push({
          severity: 'error',
          code: 'INVALID_HTTP_METHOD',
          source: source.name,
          procedure,
          path: route.path,
          message: `Unsupported HTTP method: ${route.method}`,
        });
      }

      if (!route.path.startsWith('/')) {
        findings.push({
          severity: 'error',
          code: 'INVALID_ROUTE_PATH',
          source: source.name,
          procedure,
          path: route.path,
          message: 'Contract paths must begin with /',
        });
      }

      const rpcCandidatePath = `/api/${source.name}/${procedure.replaceAll('.', '/')}`;
      const isMounted = nativeORPCPaths.some((mount) => {
        const prefix = mount.slice(0, -2);
        return rpcCandidatePath === prefix || rpcCandidatePath.startsWith(`${prefix}/`);
      });
      if (!isMounted) {
        findings.push({
          severity: 'warning',
          code: 'EXPLICIT_RPC_MOUNT_UNLISTED',
          source: source.name,
          procedure,
          path: route.path,
          message: `No explicit wildcard lists candidate RPC path ${rpcCandidatePath}. The /api/* fallback may dispatch it; actual router membership and reachability remain unverified.`,
        });
      }

      const metadataResult = POAMetadataSchema.safeParse(route.metadata);
      if (!metadataResult.success) {
        findings.push({
          severity: 'error',
          code: 'INVALID_POLICY_METADATA',
          source: source.name,
          procedure,
          path: route.path,
          message: metadataResult.error.issues.map((issue) => issue.message).join('; '),
        });
      } else if (
        !AUTHORIZATION_RESOURCES.some((resource) => resource === metadataResult.data.policy.subject)
      ) {
        findings.push({
          severity: 'error',
          code: 'UNKNOWN_POLICY_SUBJECT',
          source: source.name,
          procedure,
          path: route.path,
          message: `Policy subject is not in the shared authorization registry: ${metadataResult.data.policy.subject}`,
        });
      }

      if (
        !route.responses ||
        !isRecord(route.responses) ||
        Object.keys(route.responses).length === 0
      ) {
        findings.push({
          severity: 'warning',
          code: 'MISSING_RESPONSE_CONTRACT',
          source: source.name,
          procedure,
          path: route.path,
          message:
            'Route has no declared response schema; clients cannot rely on a typed output contract.',
        });
      }

      routes.push({
        source: source.name,
        procedure,
        method: route.method,
        path: route.path,
        representation: route.representation,
        rpcCandidatePath,
        mountDeclarationStatus: isMounted ? 'candidate-covered' : 'explicit-mount-unlisted',
        inputSchemaCount: route.inputSchemaCount,
        outputSchemaCount: route.outputSchemaCount,
        runtimeStatus: 'unverified',
        authorizationStatus: 'unverified',
        persistenceStatus: 'unverified',
        clientTypingStatus: 'unverified',
        scenarioEvidence: [],
        policy: metadataResult.success ? metadataResult.data.policy : null,
        protocol: protocolFor(source),
        clientStatus: source.clientStatus,
        clientFiles: source.clientFiles,
        clientCalls,
        hasResponses: Boolean(
          route.responses && isRecord(route.responses) && Object.keys(route.responses).length > 0,
        ),
      });
    }
  }

  return {
    sources: sources.map((source) => ({
      name: source.name,
      contractFile: source.contractFile,
      handlerFile: source.handlerFile,
      contractReference: `packages/core/src/api/${source.contractFile}`,
      handlerReference: `apps/sanctuary-api/src/core/handlers/${source.handlerFile}`,
      protocol: protocolFor(source),
      clientStatus: source.clientStatus,
      clientFiles: source.clientFiles,
    })),
    routes,
    findings,
  };
}

const { values } = parseArgs({
  options: { output: { type: 'string' }, stdout: { type: 'boolean' } },
  strict: true,
  allowPositionals: false,
});
if (values.output !== undefined && values.stdout) {
  throw new Error('Use either --output or --stdout, not both.');
}
if (values.output !== undefined && !values.output.trim()) {
  throw new Error('--output must name a nonempty file path.');
}

const report = {
  schemaVersion: 2,
  scope: 'declared-contract-sources',
  knownCoverageGaps: [
    {
      namespace: 'todos',
      reference: 'apps/sanctuary-api/src/core/handlers/todos.ts',
      reason: 'Handler-local SDK procedures have no registered shared contract source.',
    },
    {
      namespace: 'canonical-v1',
      reference: 'apps/sanctuary-api/src/core/canonicalV1Registry.ts',
      reason: 'Capability transport is separate from this native namespace inventory.',
    },
    {
      namespace: 'canonical-domain-aliases',
      reference: 'apps/sanctuary-api/src/core/router.ts',
      reason:
        'Manual source registry does not enumerate every canonical alias and nested router path.',
    },
  ],
  limitations: [
    'Sources are manually registered; this inventory does not establish exhaustive runtime router coverage.',
    'File presence, source text and contract metadata do not prove middleware execution, authorization or persistence.',
    'Client calls are lexical observations across declared files, not procedure-level typed-call or runtime proof.',
    'Native schema counts measure stacked SDK input/output entries. Legacy counts measure request channels and success-response schemas; these are not equivalent denominators.',
  ],
  ...audit(),
};
const serialized = `${JSON.stringify(report, null, 2)}\n`;
const outputPath = resolve(root, values.output ?? 'docs/architecture/api-contract-inventory.json');
if (!values.stdout && existsSync(outputPath) && lstatSync(outputPath).isSymbolicLink()) {
  throw new Error(
    'Refusing to overwrite a symbolic-link report. Use --stdout or a new --output path.',
  );
}
if (values.stdout) {
  process.stdout.write(serialized);
} else if (!existsSync(outputPath) || readFileSync(outputPath, 'utf8') !== serialized) {
  if (existsSync(outputPath)) {
    const reportRelativePath = relative(root, outputPath);
    if (reportRelativePath.startsWith('..')) {
      throw new Error('Refusing to overwrite a differing report outside the repository.');
    }
    const tracked = execFileSync('git', ['ls-files', '--', reportRelativePath], {
      cwd: root,
      encoding: 'utf8',
    });
    const changes = execFileSync(
      'git',
      ['status', '--porcelain=v1', '--untracked-files=all', '--', reportRelativePath],
      { cwd: root, encoding: 'utf8' },
    );
    if (!tracked.trim() || changes.trim()) {
      throw new Error(
        'Refusing to overwrite a modified or untracked report. Use --stdout or a new --output path.',
      );
    }
  }
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, serialized, 'utf8');
}

const errors = report.findings.filter((finding) => finding.severity === 'error');
const warnings = report.findings.filter((finding) => finding.severity === 'warning');
const log = values.stdout ? console.error : console.log;
log(
  `Inspected ${report.routes.length} declared procedures across ${report.sources.length} registered contract sources.`,
);
log(`Findings: ${errors.length} errors, ${warnings.length} warnings.`);
for (const finding of report.findings) {
  log(
    `${finding.severity.toUpperCase()} ${finding.code} ${finding.source}.${finding.procedure}: ${finding.message}`,
  );
}
if (!values.stdout) log(`Inventory: ${outputPath}`);

if (errors.length > 0) process.exitCode = 1;
