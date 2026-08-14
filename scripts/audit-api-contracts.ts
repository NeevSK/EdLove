import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { adminORPCContract } from '@repo/core/api/admin.orpc.contract';
import { agentORPCContract } from '@repo/core/api/agent.orpc.contract';
import { announcementsORPCContract } from '@repo/core/api/announcements.orpc.contract';
import { attendanceORPCContract } from '@repo/core/api/attendance.orpc.contract';
import { communityORPCContract } from '@repo/core/api/community.orpc.contract';
import { POAMetadataSchema } from '@repo/core/api/contracts';
import { dailyContentContract } from '@repo/core/api/dailyContent.contract';
import { decisionJournalContract } from '@repo/core/api/decisionJournal.contract';
import { echoContract } from '@repo/core/api/echo.contract';
import { educationalORPCContract } from '@repo/core/api/educational.orpc.contract';
import { erpContract } from '@repo/core/api/erp.contract';
import { formsContract } from '@repo/core/api/forms.contract';
import { gradingORPCContract } from '@repo/core/api/grading.orpc.contract';
import { guardianAssessmentORPCContract } from '@repo/core/api/guardian-assessment.orpc.contract';
import { historyContract } from '@repo/core/api/history.contract';
import { identityContract } from '@repo/core/api/identity.contract';
import { inventoryContract } from '@repo/core/api/inventory.contract';
import { libraryContract } from '@repo/core/api/library.contract';
import { longitudinalContract } from '@repo/core/api/longitudinal.contract';
import { mappingContract } from '@repo/core/api/mapping.contract';
import { messagingORPCContract } from '@repo/core/api/messaging.orpc.contract';
import { onboardingContract } from '@repo/core/api/onboarding.contract';
import { permissionSnapshotContract } from '@repo/core/api/permissionSnapshot.contract';
import { presenceContract } from '@repo/core/api/presence.contract';
import { principalNotesORPCContract } from '@repo/core/api/principalNotes.orpc.contract';
import { privacyContract } from '@repo/core/api/privacy.contract';
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
import { AUTHORIZATION_RESOURCES } from '@repo/policies/authorizationRegistry';

type ContractRoute = {
  method: string;
  path: string;
  metadata?: unknown;
  responses?: unknown;
};

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
    contractFile: 'onboarding.contract.ts',
    handlerFile: 'onboarding.ts',
    contract: onboardingContract,
    clientStatus: 'mapped',
    clientFiles: ['packages/core/src/api/onboarding.ts'],
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
    contractFile: 'dailyContent.contract.ts',
    handlerFile: 'dailyContent.ts',
    contract: dailyContentContract,
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
    clientFiles: ['packages/core/src/api/social.ts', 'packages/core/src/hooks/useNotifications.ts'],
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
    contractFile: 'privacy.contract.ts',
    handlerFile: 'privacy.ts',
    contract: privacyContract,
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

function isRoute(value: unknown): value is ContractRoute {
  return isRecord(value) && typeof value.method === 'string' && typeof value.path === 'string';
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
    /client\.api(?:\s+as\s+any)?\)?(?:\.[A-Za-z0-9_$-]+|\[['"][^'"]+['"]\])+\.\$(get|post|put|patch|delete)/g;
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

function collectRoutes(
  value: unknown,
  prefix = '',
): Array<{ procedure: string; route: ContractRoute }> {
  if (!isRecord(value)) return [];
  const routes: Array<{ procedure: string; route: ContractRoute }> = [];

  for (const [key, child] of Object.entries(value)) {
    const procedure = prefix ? `${prefix}.${key}` : key;
    if (isRoute(child)) {
      routes.push({ procedure, route: child });
    } else if (isRecord(child)) {
      routes.push(...collectRoutes(child, procedure));
    }
  }

  return routes;
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
          'No first-party client mapping is declared yet; keep this domain server-only until an explicit client is designed.',
      });
    }

    if (source.clientStatus === 'mapped' && clientCalls.length === 0) {
      findings.push({
        severity: 'warning',
        code: 'CLIENT_MAPPING_EMPTY',
        source: source.name,
        procedure: '*',
        message:
          'Domain is marked mapped but no typed client API call was found in its declared client files.',
      });
    }

    for (const { procedure, route } of collectRoutes(source.contract)) {
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

      if (!['get', 'post', 'put', 'patch', 'delete'].includes(route.method)) {
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
      } else if (!AUTHORIZATION_RESOURCES.includes(metadataResult.data.policy.subject as never)) {
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
      protocol: protocolFor(source),
      clientStatus: source.clientStatus,
      clientFiles: source.clientFiles,
    })),
    routes,
    findings,
  };
}

const report = audit();
const outputPath = resolve(root, 'docs/architecture/api-contract-inventory.json');
mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

const errors = report.findings.filter((finding) => finding.severity === 'error');
const warnings = report.findings.filter((finding) => finding.severity === 'warning');
console.log(
  `Audited ${report.routes.length} active API routes across ${report.sources.length} contract sources.`,
);
console.log(`Findings: ${errors.length} errors, ${warnings.length} warnings.`);
for (const finding of report.findings) {
  console.log(
    `${finding.severity.toUpperCase()} ${finding.code} ${finding.source}.${finding.procedure}: ${finding.message}`,
  );
}
console.log(`Inventory: ${outputPath}`);

if (errors.length > 0) process.exitCode = 1;
