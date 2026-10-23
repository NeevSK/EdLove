import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const repoRoot = process.cwd();
const sourceRoots = ['apps', 'packages'];
const sourceExtensions = new Set(['.ts', '.tsx']);
const excludedDirectories = new Set([
  'node_modules',
  'dist',
  '.turbo',
  'coverage',
  'docs',
  'reports',
  '__tests__',
]);
const writeReport = process.argv.includes('--write');
const jsonOutput = process.argv.includes('--json');
const stateRegistryPath = join(
  repoRoot,
  'packages',
  'core',
  'src',
  'lib',
  'clientStateFoundation.ts',
);

const createLineLocator = (source) => {
  const starts = [0];
  for (let index = source.indexOf('\n'); index !== -1; index = source.indexOf('\n', index + 1)) {
    starts.push(index + 1);
  }
  return (offset) => {
    let low = 0;
    let high = starts.length;
    while (low + 1 < high) {
      const middle = Math.floor((low + high) / 2);
      if (starts[middle] <= offset) low = middle;
      else high = middle;
    }
    return low + 1;
  };
};

const linesFor = (source, lineAt, expression) => {
  const lines = [];
  const flags = expression.flags.includes('g') ? expression.flags : `${expression.flags}g`;
  const pattern = new RegExp(expression.source, flags);
  let match;
  while ((match = pattern.exec(source)) !== null) {
    lines.push(lineAt(match.index));
  }
  return lines;
};

function walk(directory, files) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const fullPath = join(directory, entry.name);
    if (entry.isDirectory()) {
      if (!excludedDirectories.has(entry.name)) walk(fullPath, files);
      continue;
    }
    const extension = entry.name.slice(entry.name.lastIndexOf('.'));
    if (entry.name.includes('.test.') || entry.name.includes('.spec.')) continue;
    if (sourceExtensions.has(extension)) files.push(fullPath);
  }
}

function candidateOwner(file, source) {
  if (file.includes('/lib/sync/useMutationQueue') || source.includes('MutationQueue')) {
    return 'durable-command';
  }
  if (file.includes('/lib/sync/versionGating')) return 'protocol-candidate';
  if (file.includes('/logic/deeplink/pendingIntentStore')) return 'navigation-handoff';
  if (file.includes('/store/useConflictStore')) return 'durable-command-reconciliation';
  if (file.includes('/store/useConsentStore') || file.includes('/store/useUIStore')) {
    return 'device-preference';
  }
  if (file.includes('/store/useDraftsStore')) return 'scoped-preference';
  if (file.includes('/store/useGrowthStore')) return 'domain-projection-review';
  if (file.includes('/store/useTemporalStore')) return 'shared-client';
  if (file.includes('/store/useActiveSubTabsStore') || file.includes('selfCanvasStore')) {
    return 'scoped-preference';
  }
  if (
    /NotificationStore|DeviceSecurityStore|EntitlementStore|CedarDecisionStore|FeatureStore/.test(
      file,
    )
  ) {
    return 'server-state-candidate';
  }
  if (/AuthStore|TenantStore|PerspectiveStore/.test(file)) return 'scope-session-candidate';
  return 'unclassified';
}

const files = [];
for (const root of sourceRoots) walk(join(repoRoot, root), files);

const inventory = {
  generatedAt: new Date().toISOString(),
  scope: 'apps-and-packages-source-excluding-docs-conventional-tests-and-generated-output',
  counts: {
    filesScanned: files.length,
    zustandStores: 0,
    persistedStores: 0,
    queryClients: 0,
    xstateImports: 0,
    contexts: 0,
    reducers: 0,
    fullStoreSubscriptions: 0,
    rawStoreAccesses: 0,
    browserStorageAccesses: 0,
    queryOperations: 0,
    queryPersistence: 0,
    serviceWorkerRegistrations: 0,
    stateRegistryEntries: 0,
    unregisteredZustandStorePaths: 0,
  },
  zustandStores: [],
  queryClients: [],
  xstateImports: [],
  contexts: [],
  reducers: [],
  persistence: [],
  fullStoreSubscriptions: [],
  rawStoreAccesses: [],
  browserStorageAccesses: [],
  queryOperations: [],
  queryPersistence: [],
  serviceWorkerRegistrations: [],
  stateRegistry: {
    path: relative(repoRoot, stateRegistryPath).replaceAll('\\', '/'),
    entryCount: 0,
    unregisteredZustandStorePaths: [],
  },
};

for (const file of files) {
  const source = readFileSync(file, 'utf8');
  const path = relative(repoRoot, file).replaceAll('\\', '/');
  const lineAt = createLineLocator(source);
  const zustandImport = /from\s+['"]zustand(?:\/[^'"]*)?['"]/.test(source);
  const declarations = [
    ...source.matchAll(/export\s+const\s+(use[A-Za-z0-9]+Store)\s*=\s*create(?:<[^>]+>)?\s*\(/g),
  ];
  for (const declaration of declarations) {
    inventory.zustandStores.push({
      symbol: declaration[1],
      path,
      line: lineAt(declaration.index),
      candidateOwner: candidateOwner(path, source),
      persisted: /persist\s*\(/.test(source),
    });
  }

  if (zustandImport && /persist\s*\(/.test(source)) {
    inventory.persistence.push({
      symbols: declarations.map((declaration) => declaration[1]),
      path,
      lines: linesFor(source, lineAt, /persist\s*\(/g),
      names: [...source.matchAll(/name:\s*['"]([^'"]+)['"]/g)].map((match) => match[1]),
      hasVersion: /version:\s*\d+/.test(source),
      hasMigrate: /migrate\s*:/.test(source),
      hasPartialize: /partialize\s*:/.test(source),
    });
  }

  if (/new\s+QueryClient\s*\(/.test(source)) {
    inventory.queryClients.push({
      path,
      lines: linesFor(source, lineAt, /new\s+QueryClient\s*\(/g),
    });
  }
  for (const match of source.matchAll(
    /\b(useQuery|useInfiniteQuery|useSuspenseQuery|useSuspenseInfiniteQuery|useMutation)\s*(?:<[^>]+>)?\s*\(/g,
  )) {
    inventory.queryOperations.push({
      operation: match[1],
      path,
      line: lineAt(match.index),
    });
  }
  for (const match of source.matchAll(/\b(persistQueryClient|PersistQueryClientProvider)\b/g)) {
    inventory.queryPersistence.push({
      symbol: match[1],
      path,
      line: lineAt(match.index),
    });
  }
  if (/from\s+['"]xstate['"]/.test(source)) {
    inventory.xstateImports.push({
      path,
      lines: linesFor(source, lineAt, /from\s+['"]xstate['"]/g),
    });
  }
  if (/createContext\s*(?:<[^>]+>)?\s*\(/.test(source)) {
    inventory.contexts.push({
      path,
      lines: linesFor(source, lineAt, /createContext\s*(?:<[^>]+>)?\s*\(/g),
    });
  }
  if (/useReducer\s*(?:<[^>]+>)?\s*\(/.test(source)) {
    inventory.reducers.push({
      path,
      lines: linesFor(source, lineAt, /useReducer\s*(?:<[^>]+>)?\s*\(/g),
    });
  }

  if (!path.includes('.test.')) {
    for (const match of source.matchAll(/\b(use[A-Za-z0-9]+Store)\s*\(\s*\)/g)) {
      inventory.fullStoreSubscriptions.push({
        symbol: match[1],
        path,
        line: lineAt(match.index),
      });
    }
  }

  for (const match of source.matchAll(/\b(use[A-Za-z0-9]+Store)\.(getState|setState)\s*\(/g)) {
    inventory.rawStoreAccesses.push({
      symbol: match[1],
      operation: match[2],
      path,
      line: lineAt(match.index),
    });
  }

  const storagePatterns = [
    {
      facility: 'localStorage',
      expression: /\blocalStorage\.(getItem|setItem|removeItem|clear|key)\s*\(/g,
    },
    {
      facility: 'sessionStorage',
      expression: /\bsessionStorage\.(getItem|setItem|removeItem|clear|key)\s*\(/g,
    },
    {
      facility: 'indexedDB',
      expression: /\bindexedDB\.(open|deleteDatabase|databases)\s*\(/g,
    },
    {
      facility: 'opfs',
      expression: /\bnavigator\.storage\.getDirectory\s*\(/g,
    },
    {
      facility: 'idb-wrapper',
      expression: /\bopenDB\s*(?:<[^>]+>)?\s*\(/g,
    },
  ];
  for (const { facility, expression } of storagePatterns) {
    for (const match of source.matchAll(expression)) {
      inventory.browserStorageAccesses.push({
        facility,
        operation: match[1] ?? 'open',
        path,
        line: lineAt(match.index),
      });
    }
  }
  for (const match of source.matchAll(/\bserviceWorker\.register\s*\(/g)) {
    inventory.serviceWorkerRegistrations.push({ path, line: lineAt(match.index) });
  }
}

const registrySource = readFileSync(stateRegistryPath, 'utf8');
const registryPaths = new Set(
  [...registrySource.matchAll(/\bsource:\s*'([^']+)'/g)].map((match) => match[1]),
);
inventory.stateRegistry.entryCount = [...registrySource.matchAll(/\bid:\s*'[^']+'/g)].length;
inventory.stateRegistry.unregisteredZustandStorePaths = [
  ...new Set(
    inventory.zustandStores
      .map((store) => store.path)
      .filter((storePath) => !registryPaths.has(storePath)),
  ),
].sort();

for (const [key, collection] of Object.entries({
  zustandStores: inventory.zustandStores,
  persistedStores: inventory.persistence,
  queryClients: inventory.queryClients,
  xstateImports: inventory.xstateImports,
  contexts: inventory.contexts,
  reducers: inventory.reducers,
  fullStoreSubscriptions: inventory.fullStoreSubscriptions,
  rawStoreAccesses: inventory.rawStoreAccesses,
  browserStorageAccesses: inventory.browserStorageAccesses,
  queryOperations: inventory.queryOperations,
  queryPersistence: inventory.queryPersistence,
  serviceWorkerRegistrations: inventory.serviceWorkerRegistrations,
  stateRegistryEntries: Array(inventory.stateRegistry.entryCount),
  unregisteredZustandStorePaths: inventory.stateRegistry.unregisteredZustandStorePaths,
})) {
  inventory.counts[key] = collection.length;
}

const output = `${JSON.stringify(inventory, null, 2)}\n`;
const reportPath = join(repoRoot, 'reports', 'state-architecture', 'inventory.json');
if (writeReport) {
  mkdirSync(join(repoRoot, 'reports', 'state-architecture'), { recursive: true });
  writeFileSync(reportPath, output);
}

if (jsonOutput) {
  console.log(output);
} else {
  console.log(JSON.stringify(inventory.counts, null, 2));
  if (writeReport) console.log(`Wrote ${relative(repoRoot, reportPath)}`);
}
