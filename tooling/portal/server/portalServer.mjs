import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { applyUpgrades, scanDependencies } from '../../../scripts/lib/deps-engine.mjs';

const rootDir = process.cwd();
const uiDir = path.join(rootDir, 'tooling', 'portal', 'ui');
const reportsDir = path.join(rootDir, 'reports');

function walkFiles(dir, extensions) {
  let results = [];
  try {
    const list = fs.readdirSync(dir, { withFileTypes: true });
    for (const item of list) {
      const fullPath = path.join(dir, item.name);
      if (item.isDirectory()) {
        if (!['node_modules', '.git', '.turbo', 'dist', 'archives', 'reports', 'build', '.cache', 'coverage'].includes(item.name)) {
          results = results.concat(walkFiles(fullPath, extensions));
        }
      } else if (item.isFile()) {
        const ext = path.extname(item.name).toLowerCase();
        if (extensions.includes(ext)) {
          results.push(path.relative(rootDir, fullPath).replace(/\\/g, '/'));
        }
      }
    }
  } catch (e) {}
  return results;
}

function getFileCategory(filePath) {
  const normalized = filePath.replace(/\\/g, '/');
  if (normalized.startsWith('packages/core/src/flows/pjc/')) {
    return { category: 'PJC YAML Catalogs (Layer 1 Intent)', order: 1, type: 'yaml' };
  }
  if (normalized.startsWith('packages/core/src/flows/') && (normalized.endsWith('.flow.ts') || normalized.includes('navigator') || normalized.includes('navigationPolicy') || normalized.includes('hierarchyQuery'))) {
    return { category: 'Flows & Navigation Physics (Layer 2 Substrate)', order: 2, type: 'code' };
  }
  if (normalized.startsWith('packages/core/src/routing/')) {
    return { category: 'Routing Engine & Route Catalog', order: 3, type: 'code' };
  }
  if (normalized.startsWith('docs/architecture/model/')) {
    return { category: 'LikeC4 Architecture Model', order: 4, type: 'model' };
  }
  if (normalized.startsWith('docs/architecture/')) {
    return { category: 'Core Architecture Docs', order: 5, type: 'doc' };
  }
  if (normalized.startsWith('docs/decisions/')) {
    return { category: 'Architecture Decision Records (ADRs)', order: 6, type: 'doc' };
  }
  if (normalized.startsWith('apps/sanctuary-api/docs/')) {
    return { category: 'Sanctuary API Architecture & Docs', order: 7, type: 'doc' };
  }
  if (normalized.startsWith('docs/current_progress/')) {
    return { category: 'Current Progress & Cutover Ledgers', order: 8, type: 'doc' };
  }
  if (normalized.startsWith('docs/specs/') || normalized.startsWith('docs/rfc/') || normalized.startsWith('openspec/')) {
    return { category: 'Specifications & OpenSpec RFCs', order: 9, type: 'spec' };
  }
  if (normalized.startsWith('.agents/skills/') && normalized.endsWith('SKILL.md')) {
    return { category: 'Agent Skills & Playbooks', order: 10, type: 'skill' };
  }
  if (normalized.startsWith('scripts/') && (normalized.endsWith('.ts') || normalized.endsWith('.mjs') || normalized.endsWith('.js'))) {
    return { category: 'Verification & Harmonization Scripts', order: 11, type: 'script' };
  }
  if (['AGENTS.md', '.spectral.yaml', 'mise.toml', 'package.json'].includes(normalized)) {
    return { category: 'Root Platform Standards', order: 12, type: 'standard' };
  }
  if (normalized.startsWith('docs/')) {
    return { category: 'General Documentation', order: 13, type: 'doc' };
  }
  return { category: 'Domain & Package Docs', order: 14, type: 'doc' };
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml'
};

// In-Memory NPM Version Cache (10 min TTL)
const npmVersionCache = new Map();
const CACHE_TTL_MS = 10 * 60 * 1000;
let depsScanCache = { data: null, ts: 0 };
const depsApplyJobs = new Map();

const server = http.createServer(async (req, res) => {
  // Universal CORS headers for all responses
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, 'http://localhost:4242');
  const pathname = parsedUrl.pathname;

  // API: List monorepo files
  if (pathname === '/api/files') {
    const rawFiles = [
      ...walkFiles(path.join(rootDir, 'docs'), ['.md', '.c4']),
      ...walkFiles(path.join(rootDir, 'apps', 'sanctuary-api', 'docs'), ['.md']),
      ...walkFiles(path.join(rootDir, 'packages', 'core', 'src', 'flows'), ['.ts', '.tsx', '.yaml']),
      ...walkFiles(path.join(rootDir, 'packages', 'core', 'src', 'routing'), ['.ts']),
      ...walkFiles(path.join(rootDir, '.agents', 'skills'), ['.md']),
      ...walkFiles(path.join(rootDir, 'scripts'), ['.ts', '.mjs', '.js']),
      ...['AGENTS.md', '.spectral.yaml', 'mise.toml', 'package.json'].filter(f => fs.existsSync(path.join(rootDir, f)))
    ];

    const uniquePaths = Array.from(new Set(rawFiles));
    const files = uniquePaths.map(f => {
      const { category, order, type } = getFileCategory(f);
      let size = 0;
      try {
        const stats = fs.statSync(path.join(rootDir, f));
        size = stats.size;
      } catch (e) {}
      return {
        path: f,
        name: path.basename(f),
        ext: path.extname(f).toLowerCase().replace('.', ''),
        category,
        order,
        type,
        size
      };
    });

    files.sort((a, b) => {
      if (a.order !== b.order) return a.order - b.order;
      return a.path.localeCompare(b.path);
    });

    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
    res.end(JSON.stringify(files));
    return;
  }

  // API: Get file content safely
  if (pathname === '/api/file') {
    try {
      const target = parsedUrl.searchParams.get('path');
      if (!target) {
        res.writeHead(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({ error: 'Missing path' }));
        return;
      }
      const safePath = path.resolve(rootDir, target);
      if (!safePath.startsWith(rootDir)) {
        res.writeHead(403, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({ error: 'Access denied' }));
        return;
      }
      let resolvedPath = safePath;
      if (!fs.existsSync(resolvedPath)) {
        // Resilient resolution heuristics: .ts <-> .tsx, .yaml <-> .json, path deduplication, index files
        const deduplicatedTarget = target.replace(/\/([^\/]+)\/\1\//g, '/$1/');
        const candidates = [
          resolvedPath.endsWith('.ts') ? resolvedPath.slice(0, -3) + '.tsx' : null,
          resolvedPath.endsWith('.tsx') ? resolvedPath.slice(0, -4) + '.ts' : null,
          resolvedPath.endsWith('.yaml') ? resolvedPath.slice(0, -5) + '.json' : null,
          resolvedPath.endsWith('.json') ? resolvedPath.slice(0, -5) + '.yaml' : null,
          path.resolve(rootDir, deduplicatedTarget),
          deduplicatedTarget.endsWith('.ts') ? path.resolve(rootDir, deduplicatedTarget.slice(0, -3) + '.tsx') : null,
          path.join(safePath, 'package.json'),
          path.join(safePath, 'README.md'),
          path.join(safePath, 'index.ts'),
          path.join(safePath, 'index.tsx')
        ].filter(Boolean);

        for (const cand of candidates) {
          if (cand.startsWith(rootDir) && fs.existsSync(cand)) {
            resolvedPath = cand;
            break;
          }
        }
      }

      if (!fs.existsSync(resolvedPath)) {
        res.writeHead(404, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({ error: `Path not found: ${target}` }));
        return;
      }
      const stats = fs.statSync(resolvedPath);
      if (stats.isDirectory()) {
        const rawEntries = fs.readdirSync(resolvedPath, { withFileTypes: true });
        const ignored = new Set(['node_modules', '.git', '.turbo', 'dist', 'archives', 'reports', 'build', '.cache', 'coverage', '.expo', '.tmp', 'temp']);
        const entries = rawEntries.filter(e => !ignored.has(e.name));

        const normalizedTarget = path.relative(rootDir, resolvedPath).replace(/\\/g, '/');

        // Check for package.json
        let pkgInfo = null;
        const pkgPath = path.join(resolvedPath, 'package.json');
        if (fs.existsSync(pkgPath)) {
          try {
            pkgInfo = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
          } catch (e) {}
        }

        // Check for README.md
        let readmeContent = '';
        const readmePath = path.join(resolvedPath, 'README.md');
        if (fs.existsSync(readmePath)) {
          try {
            readmeContent = fs.readFileSync(readmePath, 'utf8');
          } catch (e) {}
        }

        const folders = entries.filter(e => e.isDirectory()).sort((a, b) => a.name.localeCompare(b.name));
        const files = entries.filter(e => e.isFile()).sort((a, b) => a.name.localeCompare(b.name));

        let content = `# Directory: ${normalizedTarget}\n\n`;

        if (pkgInfo) {
          content += `### 📦 Package Manifest: \`${pkgInfo.name || path.basename(resolvedPath)}\`\n`;
          if (pkgInfo.version) content += `**Version**: \`v${pkgInfo.version}\`\n\n`;
          if (pkgInfo.description) content += `> ${pkgInfo.description}\n\n`;
          
          const scriptKeys = Object.keys(pkgInfo.scripts || {});
          if (scriptKeys.length > 0) {
            content += `**Available Scripts** (${scriptKeys.length}): \`${scriptKeys.slice(0, 8).join('`, `')}${scriptKeys.length > 8 ? '`...' : '`'}\n\n`;
          }

          const depCount = Object.keys(pkgInfo.dependencies || {}).length;
          const devDepCount = Object.keys(pkgInfo.devDependencies || {}).length;
          content += `**Dependencies**: ${depCount} production, ${devDepCount} devDependencies • [📄 View package.json](${normalizedTarget}/package.json)\n\n`;
          content += `---\n\n`;
        }

        if (readmeContent) {
          content += `### 📖 README.md\n\n${readmeContent.slice(0, 3000)}${readmeContent.length > 3000 ? '\n\n*...[Read full README.md](' + normalizedTarget + '/README.md)*' : ''}\n\n---\n\n`;
        }

        content += `### 📂 Directory Contents (${entries.length} items)\n\n`;
        folders.forEach(f => {
          content += `- 📁 [${f.name}/](${normalizedTarget}/${f.name})\n`;
        });
        files.forEach(f => {
          content += `- 📄 [${f.name}](${normalizedTarget}/${f.name})\n`;
        });

        res.writeHead(200, {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        });
        res.end(JSON.stringify({
          path: normalizedTarget,
          name: path.basename(resolvedPath),
          ext: 'md',
          kind: pkgInfo ? 'package' : 'dir',
          size: stats.size,
          lines: entries.length,
          content
        }));
        return;
      }

      const content = fs.readFileSync(resolvedPath, 'utf8');
      const lineCount = content.split('\n').length;

      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(JSON.stringify({
        path: path.relative(rootDir, resolvedPath).replace(/\\/g, '/'),
        name: path.basename(resolvedPath),
        ext: path.extname(resolvedPath).toLowerCase().replace('.', ''),
        size: stats.size,
        lines: lineCount,
        content
      }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // API: Get parsed report JSON dynamically
  if (pathname.startsWith('/api/reports/')) {
    const reportName = pathname.replace('/api/reports/', '').replace('.json', '');
    const candidatePath = path.join(reportsDir, `${reportName}.json`);
    const safeReportPath = path.resolve(candidatePath);

    if (!safeReportPath.startsWith(reportsDir) || !fs.existsSync(safeReportPath)) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: `Report ${reportName} not found` }));
      return;
    }

    try {
      const data = fs.readFileSync(safeReportPath, 'utf8');
      res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
      res.end(data);
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: `Failed to read report: ${e.message}` }));
    }
    return;
  }

  // API: System Architecture Walkthrough & Stack Definition
  if (pathname === '/api/walkthrough') {
    const walkthrough = {
      overview: {
        title: 'Gurudevi Sovereign Platform',
        vision: 'A person-centred education platform that covers a person whole life with learning: wellbeing, classroom operations, community, and knowledge records.',
        invariants: [
          'Offline-first and local-first SQLite replication via PowerSync.',
          'Multi-device and multi-account identity with canonical UUIDv8.',
          'Single fact ownership by domain (Tabs are places, not domains).',
          'Strict 2026 Taxonomy (*Driver, *Monitor, *Vault, *.adapter.ts, use*Store).'
        ]
      },
      apps: [
        {
          id: 'gurudevi-web',
          name: 'Gurudevi Web',
          purpose: 'Sanctuary & Explore Web Apps (Desktop / Tablet)',
          framework: 'Vite + React 19 + TanStack Router (spa/)',
          styling: 'CSS Modules + World Theme CSS Variables (var(--w-*))',
          deployment: 'Static SPA on Cloudflare Pages',
          path: 'apps/gurudevi-web',
          hosted: [
            { label: 'sanctuary.gurudevi.app', url: 'https://sanctuary.gurudevi.app', type: 'prod', desc: 'Production Sanctuary Web App' },
            { label: 'explore.gurudevi.app', url: 'https://explore.gurudevi.app', type: 'explore', desc: 'Explore & Learner Surface' }
          ]
        },
        {
          id: 'gurudevi-public',
          name: 'Gurudevi Public',
          purpose: 'Public SEO, Journal & Agent Knowledge Pages',
          framework: 'Astro (Static HTML with interactive React islands)',
          path: 'apps/gurudevi-public',
          deployment: 'Static HTML on Cloudflare Pages',
          hosted: [
            { label: 'gurudevi.app', url: 'https://gurudevi.app', type: 'public', desc: 'Public Portal & Documentation' },
            { label: 'gurudevi.app/journal', url: 'https://gurudevi.app/journal', type: 'journal', desc: 'Civic Journal & Articles' }
          ]
        },
        {
          id: 'sanctuary-api',
          name: 'Sanctuary API',
          purpose: 'Core Backend Procedure & Gateway Engine',
          framework: 'Node.js + Hono v5 + oRPC v2 Typed RPC Contracts (/api/v1)',
          database: 'Supabase PostgreSQL + RLS + public.get_my_id()',
          path: 'apps/sanctuary-api',
          deployment: 'Fly.io / Edge Cloud Container',
          hosted: [
            { label: 'api.sanctuary.gurudevi.app', url: 'https://api.sanctuary.gurudevi.app/api/v1', type: 'api', desc: 'Production RPC /api/v1' },
            { label: 'localhost:3000/healthz', url: 'http://localhost:3000/healthz', type: 'local', desc: 'Local Gateway Health Check' }
          ]
        },
        {
          id: 'gurudevi-mobile',
          name: 'Gurudevi Mobile',
          purpose: 'Flagship Mobile Client (iOS / Android)',
          framework: 'Expo SDK 58 (React Native 0.88, New Architecture Fabric/TurboModules)',
          styling: 'NativeWind + World Token Recipes',
          motion: 'Reanimated 4 (scheduleOnRN / scheduleOnUI) + Skia v3',
          path: 'apps/gurudevi-mobile',
          deployment: 'Expo EAS Cloud & Native Stores',
          hosted: [
            { label: 'Expo EAS Dashboard', url: 'https://expo.dev/accounts/polymath/projects/gurudevi-mobile', type: 'eas', desc: 'EAS Builds & Update Channels' }
          ]
        }
      ],
      hostedSolutions: [
        {
          name: 'Gurudevi Sanctuary Web',
          appId: 'gurudevi-web',
          domain: 'sanctuary.gurudevi.app',
          url: 'https://sanctuary.gurudevi.app',
          env: 'Production',
          target: 'Cloudflare Pages',
          framework: 'Vite + React 19 (spa/)',
          desc: 'Primary person-centred educational sanctuary web app for desktop and tablet users.'
        },
        {
          name: 'Gurudevi Explore Surface',
          appId: 'gurudevi-web',
          domain: 'explore.gurudevi.app',
          url: 'https://explore.gurudevi.app',
          env: 'Production',
          target: 'Cloudflare Pages',
          framework: 'Vite + React 19',
          desc: 'Public and guest learner discovery and exploration interface.'
        },
        {
          name: 'Gurudevi Public Site',
          appId: 'gurudevi-public',
          domain: 'gurudevi.app',
          url: 'https://gurudevi.app',
          env: 'Production',
          target: 'Cloudflare Pages',
          framework: 'Astro 5 + React Islands',
          desc: 'High-speed static SEO portal, documentation, and civic journal.'
        },
        {
          name: 'Sanctuary API Gateway',
          appId: 'sanctuary-api',
          domain: 'api.sanctuary.gurudevi.app',
          url: 'https://api.sanctuary.gurudevi.app/api/v1',
          localUrl: 'http://localhost:3000/healthz',
          env: 'Production / Local',
          target: 'Fly.io / Edge Cloud',
          framework: 'Hono v5 + oRPC v2',
          desc: 'Typed RPC procedure endpoints (/api/v1) and Cedar authorization gate.'
        },
        {
          name: 'Gurudevi Mobile Native',
          appId: 'gurudevi-mobile',
          domain: 'EAS Cloud / TestFlight',
          url: 'https://expo.dev/accounts/polymath/projects/gurudevi-mobile',
          env: 'Internal Beta & OTA',
          target: 'Expo EAS Cloud',
          framework: 'Expo SDK 58 (RN 0.88)',
          desc: 'Flagship mobile native client with offline PowerSync SQLite WAL replication.'
        }
      ],
      stack: [
        { layer: 'Data & Sync', tool: 'PowerSync + SQLite WAL', role: 'Local-first client replication with offline mutation queues' },
        { layer: 'Backend Store', tool: 'Supabase PostgreSQL', role: 'Transaction-safe authoritative store with Row Level Security (RLS)' },
        { layer: 'Identity', tool: 'EdLove UUIDv8', role: 'Immutable canonical account ID (public.users.id) transactionally minted' },
        { layer: 'Authorization', tool: 'Cedar Policy Engine', role: 'Fine-grained policy-as-code evaluating principal, action, and resource bonds' },
        { layer: 'State Management', tool: 'Zustand + Atomic Selectors', role: 'Memory-safe UI stores with MMKV persistent storage driver' },
        { layer: 'Architecture Model', tool: 'LikeC4 (LikeC4.c4)', role: 'Living C4 architecture-as-code model verified in CI' },
        { layer: 'Intent Engine', tool: 'Product & Journey Catalog (YAML)', role: 'W3C YAML-LD graph specification of user journeys and business rules' },
        { layer: 'Secrets & Config', tool: 'Doppler', role: 'Runtime credential injection (gurudevi-mobile:dev), zero plaintext keys' }
      ],
      macroLayers: [
        { level: 1, name: 'Channels', desc: 'Who calls in: Mobile App, Web, Messaging Bots, Sovereign Agent MCP tools' },
        { level: 2, name: 'Places', desc: 'Where people go: Self, Workspace, Community, Library, Profile, AI Companion' },
        { level: 3, name: 'Business Domains', desc: 'Who owns each fact: Wellbeing, Learning, Institution Ops, Family, Rewards' },
        { level: 4, name: 'Platform Services', desc: 'What every domain uses: Identity, Bonds, Privacy, Audit, Time, Notifications' },
        { level: 5, name: 'Runtime & Edge', desc: 'How it runs safely: PowerSync sync, sessions, Verger client runtime' },
        { level: 6, name: 'Substrate', desc: 'Where it is stored: Postgres RLS, SQLite WAL, Cedar policies' }
      ],
      microTiers: [
        { tier: 'T0', name: 'Contracts', desc: 'Zod schemas, types, constants (Single source of truth)' },
        { tier: 'T1', name: 'Ports', desc: 'Typed interfaces for external dependencies (GrowthViewSource, INetworkPort)' },
        { tier: 'T2', name: 'Pure Logic', desc: '100% deterministic functions taking data and returning data' },
        { tier: 'T3', name: 'Adapters (I/O)', desc: 'Only code that talks to Supabase, PowerSync, Storage, Network' },
        { tier: 'C', name: 'Wiring', desc: 'Effect-TS Layers and AppRuntime bindings' },
        { tier: 'T4', name: 'State', desc: 'Zustand stores, XState machines, TanStack Query definitions' },
        { tier: 'T5', name: 'Hooks & Coordinators', desc: 'UI facades and multi-step business orchestrators' },
        { tier: 'T6', name: 'Screens & Components', desc: 'Visual JSX presentations (Mobile Screen, Web Floor)' }
      ]
    };

    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
    res.end(JSON.stringify(walkthrough));
    return;
  }

  // API: Cross-Wired Transitive Feature Trace (Intent -> Flow -> Route -> Authz -> DB)
  if (pathname === '/api/crosswire') {
    const traces = [
      {
        id: 'classroom.teaching_loop',
        title: 'Classroom Daily Teaching & Learning Loop',
        domain: 'Classroom / Learning',
        actor: 'Teacher / Section Head',
        pjcFile: 'packages/core/src/flows/pjc/classroom.teaching_loop.yaml',
        flowFile: 'packages/core/src/flows/classroom/teacherRollCall.flow.ts',
        purpose: 'take_attendance',
        mobileRoute: '/(tabs)/workspace/attendance',
        webRoute: '/workspace/attendance',
        navOpCompact: 'push',
        navOpRegular: 'push',
        sheetDetents: '[0.5, 1.0]',
        authority: 'TeacherBond / isTeacher(capacity)',
        apiProcedure: 'sanctuary-api: /api/v1/attendance.mark',
        dbTables: ['attendance_records', 'students', 'classrooms'],
        downstreamFiles: [
          'packages/classroom/src/machines/attendanceSessionMachine.ts',
          'packages/classroom/src/logic/studentAttendanceSummary.ts',
          'packages/core/src/flows/classroom/teacherRollCall.flow.ts',
          'apps/gurudevi-mobile/app/(tabs)/workspace/index.tsx'
        ]
      },
      {
        id: 'admin.school_connection',
        title: 'School Organization Connection & Onboarding',
        domain: 'Institution Operations',
        actor: 'Principal / School Founder',
        pjcFile: 'packages/core/src/flows/pjc/admin.school_connection.yaml',
        flowFile: 'packages/core/src/flows/admin/principalConnectSchool.flow.ts',
        purpose: 'connect_institution',
        mobileRoute: '/(tabs)/workspace/school-connect',
        webRoute: '/workspace/school-connect',
        navOpCompact: 'sheet',
        navOpRegular: 'modal',
        sheetDetents: '[0.5, 1.0]',
        authority: 'InstitutionalBond / isSovereignSteward',
        apiProcedure: 'sanctuary-api: /api/v1/schools.connect',
        dbTables: ['schools', 'memberships', 'institutions'],
        downstreamFiles: [
          'packages/admin/src/components/school/SchoolConnectionWelcome.tsx',
          'packages/admin/src/components/school/InviteCodeManager.tsx',
          'packages/admin/src/machines/schoolProvisioningMachine.ts'
        ]
      },
      {
        id: 'self.learner_growth',
        title: 'Learner Holistic Growth & Skill Mastery',
        domain: 'Wellbeing & Personal Growth',
        actor: 'Learner / Student',
        pjcFile: 'packages/core/src/flows/pjc/self.learner_growth.yaml',
        flowFile: 'packages/core/src/flows/self/mindfulBreathing.flow.ts',
        purpose: 'daily_reflection',
        mobileRoute: '/(tabs)/self/growth',
        webRoute: '/self/growth',
        navOpCompact: 'push',
        navOpRegular: 'panel',
        sheetDetents: 'N/A (Push/Panel)',
        authority: 'PersonalScope / isSelfUser',
        apiProcedure: 'sanctuary-api: /api/v1/growth.reflect',
        dbTables: ['growth_entries', 'learner_skills', 'habits'],
        downstreamFiles: [
          'apps/gurudevi-web/app/(sanctuary)/self/SelfFloor.tsx',
          'apps/gurudevi-web/app/(sanctuary)/welcome/WelcomeStage.tsx',
          'apps/gurudevi-web/app/(sanctuary)/workspace/plan/PlanFloor.tsx'
        ]
      },
      {
        id: 'platform.founder_cockpit',
        title: 'Founder & Operator Cockpit',
        domain: 'Platform Governance',
        actor: 'Platform Founder / Operator',
        pjcFile: 'packages/core/src/flows/pjc/platform.founder_cockpit.yaml',
        flowFile: 'packages/core/src/flows/founder/founderCommandDeck.flow.ts',
        purpose: 'governance_audit',
        mobileRoute: '/(tabs)/workspace/cockpit',
        webRoute: '/workspace/cockpit',
        navOpCompact: 'replace',
        navOpRegular: 'replace',
        sheetDetents: 'N/A (Replace)',
        authority: 'TechnicalOperator / SOVEREIGN_STEWARD',
        apiProcedure: 'sanctuary-api: /api/v1/cockpit.metrics',
        dbTables: ['platform_audit_events', 'tenants', 'users'],
        downstreamFiles: [
          'packages/platform-mcp/src/services/ScoutService.ts',
          'docs/architecture/authority-model.md'
        ]
      }
    ];

    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
    res.end(JSON.stringify(traces));
    return;
  }

  // API: Incompatibility & Drift Sentinel
  if (pathname === '/api/drift') {
    let tierAudit = { findings: [] };
    let permAudit = { phantomEdges: [] };
    let deprecationsCount = 0;

    try {
      if (fs.existsSync(path.join(reportsDir, 'tier-audit.json'))) {
        tierAudit = JSON.parse(fs.readFileSync(path.join(reportsDir, 'tier-audit.json'), 'utf8'));
      }
      if (fs.existsSync(path.join(reportsDir, 'permission-ecosystem-graph.json'))) {
        permAudit = JSON.parse(fs.readFileSync(path.join(reportsDir, 'permission-ecosystem-graph.json'), 'utf8'));
      }
      if (fs.existsSync(path.join(reportsDir, 'live-deprecations.json'))) {
        const depData = JSON.parse(fs.readFileSync(path.join(reportsDir, 'live-deprecations.json'), 'utf8'));
        deprecationsCount = Array.isArray(depData) ? depData.length : Object.keys(depData).length;
      }
    } catch (e) {}

    const drift = {
      specPipelineStatus: 'GREEN',
      tierFindingsCount: tierAudit.findings?.length || 0,
      tierFindings: tierAudit.findings || [],
      phantomEdgesCount: permAudit.phantomEdges?.length || 0,
      phantomEdges: permAudit.phantomEdges || [],
      liveDeprecationsPackageCount: deprecationsCount,
      bannedDialectChecks: [
        { dialect: 'Worklets runOnJS/runOnUI', status: 'VETO_ENFORCED', rule: 'Must use scheduleOnRN / scheduleOnUI' },
        { dialect: 'RNGH PanGestureHandler', status: 'VETO_ENFORCED', rule: 'Must use Gesture.Pan() with GestureDetector' },
        { dialect: 'React 19 forwardRef', status: 'VETO_ENFORCED', rule: 'Pass ref directly as standard prop' },
        { dialect: 'RN 0.88 findNodeHandle', status: 'VETO_ENFORCED', rule: 'Strictly forbidden in Fabric architecture' },
        { dialect: 'RN 0.88 Alert.alert', status: 'VETO_ENFORCED', rule: 'Must use dialog primitives or Sonner' }
      ]
    };

    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
    res.end(JSON.stringify(drift));
    return;
  }

  // API: Monorepo Internal Packages / Modules (@repo/*)
  if (pathname === '/api/modules') {
    const packagesDir = path.join(rootDir, 'packages');
    const appsList = [
      { id: 'apps/gurudevi-mobile', path: 'apps/gurudevi-mobile/package.json' },
      { id: 'apps/gurudevi-web', path: 'apps/gurudevi-web/package.json' },
      { id: 'apps/sanctuary-api', path: 'apps/sanctuary-api/package.json' },
      { id: 'apps/gurudevi-public', path: 'apps/gurudevi-public/package.json' }
    ];

    const appPkgs = appsList.map(a => {
      const full = path.join(rootDir, a.path);
      return fs.existsSync(full) ? { id: a.id, data: JSON.parse(fs.readFileSync(full, 'utf8')) } : null;
    }).filter(Boolean);

    function classifyArchetype(name, dir) {
      if (['core', 'platform-mcp', 'database', 'schema', 'policies', 'types-shim'].includes(dir)) return 'Platform Spine';
      if (['ui', 'graphics', 'form-builder'].includes(dir)) return 'UI Kit & Themes';
      if (dir.startsWith('verger')) return 'Verger Adaptive Runtime';
      if (['typescript-config', 'eslint-config'].includes(dir)) return 'Toolchain Config';
      return 'Domain Bounded Context';
    }

    function getBoundaryRule(name, dir) {
      if (dir === 'core') return 'Platform Spine: Auth, tenancy, contracts, API clients. Zero native pollution (never import MMKV or Expo directly in core).';
      if (dir === 'platform-mcp') return 'Sovereign Control Plane & Gateway: Multiplexes downstream tools, scouts codebase, zero business policy.';
      if (dir === 'ui') return 'Kit & Themes: Components read tokens from world recipes, never raw hex. Phase styling is retired.';
      if (dir === 'classroom') return 'Classroom Domain: Attendance, gradebook, reflect, classroom workspaces. Strictly bounded domain logic.';
      if (dir.startsWith('verger')) return 'Verger Runtime: Host-neutral adaptive resource supervisor (battery, thermal, long-task, frame budget). Measures; never decides.';
      if (dir === 'database') return 'Data Layer: ZenStack / Prisma models, database migrations, and canonical schema definitions.';
      if (dir === 'policies') return 'Security Layer: Cedar policy schemas and sovereign authorization rules.';
      if (dir === 'graphics') return 'Topology & Layout Brain: Coordinate math for Gurudevi visual perspectives. Pure math, zero rendering.';
      return 'Single fact ownership: Tab is a place, not a domain. Enforces hexagonal ports and pure schemas.';
    }

    const packageDirs = fs.readdirSync(packagesDir).filter(d => {
      const stat = fs.statSync(path.join(packagesDir, d));
      return stat.isDirectory() && fs.existsSync(path.join(packagesDir, d, 'package.json'));
    });

    // First gather all package data
    const allModulesData = packageDirs.map(d => {
      const pkgJsonPath = path.join(packagesDir, d, 'package.json');
      const data = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
      return { dir: d, name: data.name, version: data.version, description: data.description || '', data };
    });

    const modules = allModulesData.map(mod => {
      const allDeps = { ...(mod.data.dependencies || {}), ...(mod.data.devDependencies || {}) };
      const internalDeps = Object.keys(allDeps).filter(k => k.startsWith('@repo/'));

      // Find inbound consumers (apps and other packages)
      const consumers = [];
      appPkgs.forEach(app => {
        const appDeps = { ...(app.data.dependencies || {}), ...(app.data.devDependencies || {}) };
        if (appDeps[mod.name]) consumers.push(app.id);
      });

      allModulesData.forEach(other => {
        if (other.name === mod.name) return;
        const otherDeps = { ...(other.data.dependencies || {}), ...(other.data.devDependencies || {}) };
        if (otherDeps[mod.name]) consumers.push(`packages/${other.dir}`);
      });

      const archetype = classifyArchetype(mod.name, mod.dir);
      const boundaryRule = getBoundaryRule(mod.name, mod.dir);

      return {
        id: mod.dir,
        name: mod.name,
        version: mod.version,
        archetype,
        path: `packages/${mod.dir}`,
        manifestPath: `packages/${mod.dir}/package.json`,
        description: mod.description,
        boundaryRule,
        internalDeps,
        consumers,
        consumerCount: consumers.length
      };
    });

    // Sort by archetype priority then name
    const archetypeOrder = { 'Platform Spine': 1, 'Domain Bounded Context': 2, 'UI Kit & Themes': 3, 'Verger Adaptive Runtime': 4, 'Toolchain Config': 5 };
    modules.sort((a, b) => {
      const orderA = archetypeOrder[a.archetype] || 99;
      const orderB = archetypeOrder[b.archetype] || 99;
      if (orderA !== orderB) return orderA - orderB;
      return a.name.localeCompare(b.name);
    });

    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
    res.end(JSON.stringify(modules));
    return;
  }

  // Pre-compiled Grounded Substrate Profiles (rn-terrain / TCDI rules / live-deprecations.json)
  const RN_TERRAIN_PROFILES = {
    'react-native-reanimated': {
      sacredPin: '4.7.1',
      engine: 'New Architecture Fabric Compliant',
      coDependency: 'react-native-worklets@0.13.1',
      category: 'Motion, Canvas & Graphics',
      role: 'Declarative layout animations, shared value transitions, UI-thread worklets',
      bannedPattern: 'useAnimatedGestureHandler({ ... }) / runOnJS / runOnUI',
      mandatoryStandard: '<GestureDetector gesture={Gesture.Pan()}> + scheduleOnRN(...) / scheduleOnUI(...) from react-native-worklets',
      whyLegacyFails: 'Decoupled from RNGH; legacy handler deleted from runtime. runOnJS and runOnUI are deprecated in Reanimated 4 and Worklets 0.13.',
      compilerSafety: 'Prefer .get() / .set() over direct .value assignment for React 19 compiler safety.',
      physicalSubstrate: 'node_modules/react-native-reanimated/package.json'
    },
    'react-native-gesture-handler': {
      sacredPin: '3.4.0',
      engine: 'Fabric / TurboModules Compliant',
      coDependency: 'react-native-reanimated',
      category: 'Motion, Canvas & Graphics',
      role: 'Declarative multi-touch gesture recognition and native pointer handling',
      bannedPattern: '<PanGestureHandler onGestureEvent={...}>',
      mandatoryStandard: '<GestureDetector gesture={Gesture.Pan().onUpdate(...)}>',
      whyLegacyFails: 'Legacy class wrappers bypass Fabric UI-thread state and cannot interoperate with Reanimated 4.',
      compilerSafety: 'Use chainable Gesture builder APIs.',
      physicalSubstrate: 'node_modules/react-native-gesture-handler/package.json'
    },
    'react-native-mmkv': {
      sacredPin: '4.3.2',
      engine: 'Nitro Modules C++ Direct JSI',
      coDependency: 'react-native-nitro-modules@0.37.1',
      category: 'Data, Local-First Sync & Storage',
      role: 'Ultra-fast synchronous key-value storage engine (zero bridge overhead)',
      bannedPattern: 'await AsyncStorage.getItem(k) / manual JSI bridge shims',
      mandatoryStandard: 'storage.getString(k) synchronous reads via react-native-nitro-modules',
      whyLegacyFails: 'Async storage causes UI layout flashes and desync during initial client hydration; legacy JSI lacks type safety.',
      compilerSafety: 'Synchronous C++ memory mapping.',
      physicalSubstrate: 'node_modules/react-native-mmkv/package.json'
    },
    'react-native': {
      sacredPin: '0.88.0',
      engine: 'Bridgeless New Architecture (Fabric + TurboModules)',
      coDependency: 'react@19.3.0',
      category: 'Core Engine & Frameworks',
      role: 'Mobile native platform host and C++ runtime core',
      bannedPattern: 'NativeModules.* (Legacy Bridge) / findNodeHandle / Alert.alert / useNativeDriver: false / InteractionManager',
      mandatoryStandard: 'TurboModuleRegistry.getEnforcing(...) / direct React refs / Sonner or in-app dialogs',
      whyLegacyFails: 'Legacy bridge message queue is severed in React Native 0.88; synchronous C++ JSI and Fabric UI trees only.',
      compilerSafety: 'Bridgeless runtime model.',
      physicalSubstrate: 'node_modules/react-native/package.json'
    },
    'expo': {
      sacredPin: 'SDK 58 (58.0.0+)',
      engine: 'New Architecture Default (Continuous Native Generation)',
      coDependency: 'react-native@0.88.0',
      category: 'Core Engine & Frameworks',
      role: 'Native autolinking, build system, and mobile device capabilities',
      bannedPattern: 'Expo Go legacy development / detached Xcode/Android configs without CNG',
      mandatoryStandard: 'npx expo prebuild / Development Client (expo-dev-client)',
      whyLegacyFails: 'Expo SDK 58 enforces New Architecture by default; legacy modules without TurboModule specs fail compilation.',
      compilerSafety: 'CNG config plugins.',
      physicalSubstrate: 'node_modules/expo/package.json'
    },
    '@expo/ui': {
      sacredPin: '58.0.20',
      engine: 'Real SwiftUI (iOS) & Jetpack Compose (Android)',
      coDependency: 'expo',
      category: 'UI Kit & Styling Tokens',
      role: 'Native system sheets (BottomSheet), pickers, switches, and sliders',
      bannedPattern: 'Reaching for @gorhom/bottom-sheet or built-in RN Picker/Switch',
      mandatoryStandard: '@expo/ui Host, Column, Row, BottomSheet, Switch, Slider',
      whyLegacyFails: 'Third-party JS sheet libraries desync from native window insets, Dynamic Island, and virtual keyboard resizing.',
      compilerSafety: 'Native grouped UI trees.',
      physicalSubstrate: 'node_modules/@expo/ui/package.json'
    },
    '@powersync/react-native': {
      sacredPin: '1.x',
      engine: 'op-sqlite Native C++ TurboModule',
      coDependency: '@op-engineering/op-sqlite',
      category: 'Data, Local-First Sync & Storage',
      role: 'Offline-first SQLite local-first bi-directional replication stream',
      bannedPattern: 'Direct client-side PostgreSQL queries / non-reactive manual fetch loops',
      mandatoryStandard: 'useLiveQuery() + Drizzle ORM query compilation + client outbox pattern',
      whyLegacyFails: 'Violates offline-first architectural invariant; drops user state when connection drops.',
      compilerSafety: 'Reactive SQLite queries.',
      physicalSubstrate: 'node_modules/@powersync/react-native/package.json'
    },
    'hono': {
      sacredPin: '5.0.0-rc.1',
      engine: 'Web Standards Fetch API / Node & Bun',
      coDependency: '@hono/bun',
      category: 'Core Engine & Frameworks',
      role: 'Sanctuary API edge & node HTTP router and middleware chain',
      bannedPattern: 'app.onError((err, c) => ...) / const body = await c.req.json() as implicit any',
      mandatoryStandard: 'app.onError((c, next) => { const err = c.error; }) + runtime Zod schema parse',
      whyLegacyFails: 'Error handler signature inverted in Hono v5; c.req.json() returns unknown to enforce runtime schema validation.',
      compilerSafety: 'Type-safe request context.',
      physicalSubstrate: 'node_modules/hono/package.json'
    },
    '@orpc/server': {
      sacredPin: '2.0.0-beta.46',
      engine: 'Native @orpc/server/fetch RPCHandler',
      coDependency: '@orpc/contract',
      category: 'Core Engine & Frameworks',
      role: 'Type-safe RPC procedure execution, OpenAPI docs, and MCP tool publishing',
      bannedPattern: 'augmentRouter(router, middleware) / dedicated @orpc/server/adapters/hono',
      mandatoryStandard: 'os.use(middleware).router(router) builder chains + native fetch RPCHandler',
      whyLegacyFails: 'augmentRouter removed; dedicated Hono adapter retired in favor of universal Web Standards fetch handler.',
      compilerSafety: 'End-to-end typed contracts.',
      physicalSubstrate: 'node_modules/@orpc/server/package.json'
    },
    'react': {
      sacredPin: '19.3.0',
      engine: 'React 19 Compiler-Ready Core',
      coDependency: 'react-dom@19.3.0',
      category: 'Core Engine & Frameworks',
      role: 'Declarative component model, reconciler, and Actions lifecycle',
      bannedPattern: 'React.forwardRef / useFormState',
      mandatoryStandard: 'Direct ref prop passing (function Component({ ref, ...props })) / useActionState',
      whyLegacyFails: 'forwardRef is deprecated in React 19; useFormState was renamed to useActionState.',
      compilerSafety: 'React 19 compiler memoization.',
      physicalSubstrate: 'node_modules/react/package.json'
    },
    'zustand': {
      sacredPin: '5.0.3',
      engine: 'useSyncExternalStore Compatible',
      coDependency: 'react@19.3.0',
      category: 'State & Domain Architecture',
      role: 'Lightweight atomic client state stores',
      bannedPattern: 'Non-atomic store selection (const state = useStore())',
      mandatoryStandard: 'Atomic selector subscription (useStore((s) => s.foo))',
      whyLegacyFails: 'Whole-store subscription triggers cascade re-renders on unrelated state mutations across the app.',
      compilerSafety: 'Atomic selector subscriptions.',
      physicalSubstrate: 'node_modules/zustand/package.json'
    },
    'drizzle-orm': {
      sacredPin: '0.38.0',
      engine: 'Platform-Agnostic SQL Builder',
      coDependency: '@powersync/react-native',
      category: 'Data, Local-First Sync & Storage',
      role: 'Type-safe SQL query compilation for PowerSync SQLite and backend Postgres',
      bannedPattern: 'Raw untyped SQL strings without parameter binding',
      mandatoryStandard: 'Drizzle query schema builders (db.select().from(...))',
      whyLegacyFails: 'Raw SQL strings introduce injection risks and desynchronize from TypeScript model schemas.',
      compilerSafety: 'Compile-time query verification.',
      physicalSubstrate: 'node_modules/drizzle-orm/package.json'
    },
    'effect': {
      sacredPin: '3.x / 4.x',
      engine: 'Fiber-Based Concurrency & Typed Errors',
      coDependency: 'typescript',
      category: 'State & Domain Architecture',
      role: 'Fiber concurrency, typed domain error models, and canonical retry schedules',
      bannedPattern: 'Untyped runtime exceptions (throw new Error(...))',
      mandatoryStandard: 'Effect.gen(function* () { ... }) with typed yieldable errors',
      whyLegacyFails: 'Untyped exceptions escape catch boundaries, causing unmonitored crashes and telemetry blindness.',
      compilerSafety: 'Yieldable error signatures.',
      physicalSubstrate: 'node_modules/effect/package.json'
    },
    'zod': {
      sacredPin: '3.24.1',
      engine: 'TypeScript Schema Validation Engine',
      coDependency: '@repo/schema',
      category: 'State & Domain Architecture',
      role: 'Single source of truth for runtime validation contracts',
      bannedPattern: 'Hand-written TypeScript interfaces without runtime validation',
      mandatoryStandard: 'z.infer<typeof Schema> generated directly from Zod definitions',
      whyLegacyFails: 'Interface-only types evaporate at runtime; client-server payload drift leads to uncaught exceptions.',
      compilerSafety: 'Deterministic runtime contracts.',
      physicalSubstrate: 'node_modules/zod/package.json'
    },
    '@shopify/react-native-skia': {
      sacredPin: '3.7.0',
      engine: 'Fabric Compliant / C++ GPU Pipeline (Graphite/WebGPU)',
      coDependency: 'react-native@0.88.0',
      category: 'Motion, Canvas & Graphics',
      role: 'High-performance 2D canvas drawing, shaders, and procedural art',
      bannedPattern: 'CPU-based canvas polling or DOM <canvas> shims on native',
      mandatoryStandard: '<Canvas> with declarative Skia elements and Reanimated shared values',
      whyLegacyFails: 'CPU rasterization drops frames below 60fps and triggers thermal throttling on mobile devices.',
      compilerSafety: 'GPU hardware acceleration.',
      physicalSubstrate: 'node_modules/@shopify/react-native-skia/package.json'
    }
  };

  // Load RN-Terrain Profiles Database (c:\x\reports\rn-terrain-profiles.json)
  let rnTerrainData = { layers: {}, byName: {} };
  try {
    const terrainFile = path.join(reportsDir, 'rn-terrain-profiles.json');
    if (fs.existsSync(terrainFile)) {
      rnTerrainData = JSON.parse(fs.readFileSync(terrainFile, 'utf8'));
    }
  } catch (e) {}

  // Stack Layer definitions (ordered bedrock hierarchy)
  const STACK_LAYERS_MAP = {
    'L0-ENGINE': { title: 'L0 • Host & Native Runtime', desc: 'JS engine & native runtime (React Native 0.88, Hermes, Node, Bun).' },
    'L1-FRAMEWORK': { title: 'L1 • App Frameworks & SDKs', desc: 'Frameworks that own the app shape (React 19, Expo SDK 58, Vite, Astro).' },
    'L2-NATIVE-BRIDGE': { title: 'L2 • Native Bridge & Worklets', desc: 'Module systems, JSI & threading worklet runtimes (Worklets, Nitro Modules).' },
    'L3-UI-PRIMITIVES': { title: 'L3 • UI & Motion Primitives', desc: 'Rendering, animation, gesture & native canvas view primitives (Reanimated, RNGH, Skia).' },
    'L4-APP-INFRA': { title: 'L4 • App Infrastructure & Sync', desc: 'Cross-cutting navigation, state, local-first sync, storage & validation (PowerSync, Zustand, Drizzle, MMKV, Zod).' },
    'L5-FEATURE': { title: 'L5 • Device Features & Capabilities', desc: 'Device capabilities (camera, maps, notifications, sensors, audio, documents).' },
    'L6-UI-KIT': { title: 'L6 • UI Kits & Styling Sugar', desc: 'UI kits and styling primitives (@expo/ui, Lucide, Tailwind/NativeWind, Sonner).' },
    'S1-SERVER': { title: 'S1 • Server Gateway & Protocols', desc: 'Server frameworks, RPC routers, and protocol layers (Hono v5, oRPC, MCP Server).' },
    'D1-BUILD': { title: 'D1 • Compilers & Bundlers', desc: 'Compilers, bundlers, Babel/Metro plugins & build tools.' },
    'D2-TEST': { title: 'D2 • Test & E2E Verification', desc: 'Test runners, matchers, mocks, and E2E verification (Vitest, Playwright).' },
    'D3-QUALITY': { title: 'D3 • Static Analysis & Specs', desc: 'Linters, formatters, schema audits, Spectral & LikeC4.' },
    'D4-TYPES': { title: 'D4 • TypeScript Type Definitions', desc: 'Type definitions and compiler ambient declarations (@types/*).' },
    'D5-DEVOPS': { title: 'D5 • Monorepo & DevOps Tooling', desc: 'Turborepo, pnpm orchestration, git hooks & CI tooling.' },
    'D6-DEVTOOLS-AGENT': { title: 'D6 • Agent Tooling & MCP Controls', desc: 'Autonomous agent controls, MCP tools, and sovereign dev-console.' }
  };

  // Helper to resolve layer code for any package
  function resolveStackLayer(pkgName) {
    if (rnTerrainData.byName && rnTerrainData.byName[pkgName]?.stack_layer) {
      return rnTerrainData.byName[pkgName].stack_layer;
    }
    // Heuristic fallbacks for unindexed packages
    if (pkgName.startsWith('@types/')) return 'D4-TYPES';
    if (pkgName.includes('eslint') || pkgName.includes('biome') || pkgName.includes('spectral') || pkgName.includes('likec4')) return 'D3-QUALITY';
    if (pkgName.includes('vitest') || pkgName.includes('jest') || pkgName.includes('playwright') || pkgName.includes('testing-library')) return 'D2-TEST';
    if (pkgName.includes('turbo') || pkgName.includes('pnpm') || pkgName.includes('changesets')) return 'D5-DEVOPS';
    if (pkgName.includes('typescript') || pkgName.includes('babel') || pkgName.includes('postcss') || pkgName.includes('metro') || pkgName.includes('vite')) return 'D1-BUILD';
    if (pkgName.includes('hono') || pkgName.includes('orpc') || pkgName.includes('modelcontextprotocol') || pkgName.includes('cedar')) return 'S1-SERVER';
    if (pkgName.includes('reanimated') || pkgName.includes('gesture') || pkgName.includes('skia')) return 'L3-UI-PRIMITIVES';
    if (pkgName.includes('worklet') || pkgName.includes('nitro')) return 'L2-NATIVE-BRIDGE';
    if (pkgName.includes('powersync') || pkgName.includes('sqlite') || pkgName.includes('drizzle') || pkgName.includes('zustand') || pkgName.includes('zod') || pkgName.includes('effect') || pkgName.includes('mmkv') || pkgName.includes('router') || pkgName.includes('navigation')) return 'L4-APP-INFRA';
    if (pkgName.includes('lucide') || pkgName.includes('tailwind') || pkgName.includes('nativewind') || pkgName.includes('sonner') || pkgName === '@expo/ui') return 'L6-UI-KIT';
    if (pkgName.includes('camera') || pkgName.includes('audio') || pkgName.includes('notifications') || pkgName.includes('contacts') || pkgName.includes('location')) return 'L5-FEATURE';
    if (pkgName === 'react' || pkgName === 'react-dom' || pkgName === 'expo' || pkgName === 'astro') return 'L1-FRAMEWORK';
    if (pkgName === 'react-native') return 'L0-ENGINE';
    return 'L4-APP-INFRA';
  }

  // API: Get Deep Grounded Profile for a Specific Dependency
  if (pathname === '/api/dep-profile') {
    const depName = parsedUrl.searchParams.get('name');
    if (!depName) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Missing ?name= parameter' }));
      return;
    }

    let liveDeprecations = [];
    try {
      const depFile = path.join(reportsDir, 'live-deprecations.json');
      if (fs.existsSync(depFile)) {
        const depData = JSON.parse(fs.readFileSync(depFile, 'utf8'));
        liveDeprecations = depData[depName] || [];
      }
    } catch (e) {}

    const terrainProfile = (rnTerrainData.byName && rnTerrainData.byName[depName]) || null;
    const curatedProfile = RN_TERRAIN_PROFILES[depName] || null;
    const substratePath = path.join(rootDir, 'node_modules', depName, 'package.json');
    const substrateExists = fs.existsSync(substratePath);

    let installedVersion = null;
    let installedLicense = null;
    if (substrateExists) {
      try {
        const installedPkg = JSON.parse(fs.readFileSync(substratePath, 'utf8'));
        installedVersion = installedPkg.version || null;
        installedLicense = installedPkg.license || null;
      } catch (e) {}
    }

    // Real-Time NPM Registry Query with caching & timeout
    let latestInfo = npmVersionCache.get(depName);
    if (!latestInfo || Date.now() - latestInfo.cachedAt > CACHE_TTL_MS) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 2000);
        const npmRes = await fetch(`https://registry.npmjs.org/${encodeURIComponent(depName)}/latest`, {
          signal: controller.signal,
          headers: { 'Accept': 'application/vnd.npm.install-v1+json; q=1.0, application/json; q=0.8, */*' }
        });
        clearTimeout(timeout);
        if (npmRes.ok) {
          const npmData = await npmRes.json();
          latestInfo = {
            latestVersion: npmData.version || null,
            latestLicense: npmData.license || null,
            description: npmData.description || null,
            publishedAt: npmData._time || null,
            homepage: npmData.homepage || null,
            cachedAt: Date.now()
          };
          npmVersionCache.set(depName, latestInfo);
        }
      } catch (e) {
        latestInfo = npmVersionCache.get(depName) || { latestVersion: null, error: e.message };
      }
    }

    // Find all consumers across apps and packages
    const consumers = [];
    const scanPaths = [
      'apps/gurudevi-mobile/package.json',
      'apps/gurudevi-web/package.json',
      'apps/sanctuary-api/package.json',
      'apps/gurudevi-public/package.json',
      'package.json'
    ];
    scanPaths.forEach(sp => {
      const p = path.join(rootDir, sp);
      if (fs.existsSync(p)) {
        const pj = JSON.parse(fs.readFileSync(p, 'utf8'));
        const all = { ...(pj.dependencies || {}), ...(pj.devDependencies || {}) };
        if (all[depName]) consumers.push({ target: sp.replace('/package.json', ''), version: all[depName] });
      }
    });

    const stackLayer = resolveStackLayer(depName);
    const layerMeta = STACK_LAYERS_MAP[stackLayer] || { title: stackLayer, desc: '' };

    const declaredVersion = consumers.length > 0 ? consumers[0].version : null;
    const cleanDeclared = (declaredVersion || '').replace(/^[\^~>=<]+/, '');
    const activeVersion = installedVersion || cleanDeclared;
    const isUpToDate = latestInfo?.latestVersion && activeVersion ? activeVersion === latestInfo.latestVersion : null;

    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
    res.end(JSON.stringify({
      name: depName,
      stackLayer,
      layerMeta,
      terrainProfile,
      curatedProfile,
      deprecationsCount: liveDeprecations.length,
      deprecations: liveDeprecations.slice(0, 20),
      consumers,
      substrateExists,
      substratePath: substrateExists ? `node_modules/${depName}/package.json` : null,
      declaredVersion,
      installedVersion,
      installedLicense,
      latestVersion: latestInfo?.latestVersion || null,
      latestLicense: latestInfo?.latestLicense || null,
      isUpToDate,
      publishedAt: latestInfo?.publishedAt || null
    }));
    return;
  }

  // API: Categorized Application Dependencies (External NPM Packages Only)
  if (pathname === '/api/dependencies') {
    // Load live deprecations map
    let liveDeprecationsMap = {};
    try {
      const depFile = path.join(reportsDir, 'live-deprecations.json');
      if (fs.existsSync(depFile)) {
        liveDeprecationsMap = JSON.parse(fs.readFileSync(depFile, 'utf8'));
      }
    } catch (e) {}

    // Only genuine physical application targets (NEVER internal @repo packages here)
    const apps = [
      { id: 'gurudevi-mobile', name: 'Gurudevi Mobile', path: 'apps/gurudevi-mobile/package.json', icon: '📱', desc: 'Flagship iOS/Android (Expo 58 / RN 0.88 New Architecture)' },
      { id: 'gurudevi-web', name: 'Gurudevi Web', path: 'apps/gurudevi-web/package.json', icon: '💻', desc: 'Sanctuary Web App (Vite + React 19 + TanStack Router)' },
      { id: 'sanctuary-api', name: 'Sanctuary API', path: 'apps/sanctuary-api/package.json', icon: '⚡', desc: 'Core Backend Gateway (Hono v5 + oRPC v2)' },
      { id: 'gurudevi-public', name: 'Gurudevi Public', path: 'apps/gurudevi-public/package.json', icon: '🌐', desc: 'Public Marketing & Docs Site (Astro)' },
      { id: 'root', name: 'Root Monorepo', path: 'package.json', icon: '🛠️', desc: 'Monorepo Toolchain, CI & Verification Gates' }
    ];

    const result = apps.map(app => {
      const fullPath = path.join(rootDir, app.path);
      let layers = {};
      let totalDeps = 0;

      // Initialize all 14 stack layers in canonical order
      Object.keys(STACK_LAYERS_MAP).forEach(k => {
        layers[k] = {
          code: k,
          title: STACK_LAYERS_MAP[k].title,
          desc: STACK_LAYERS_MAP[k].desc,
          packages: []
        };
      });

      if (fs.existsSync(fullPath)) {
        const pkg = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
        const all = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
        
        for (const [name, version] of Object.entries(all)) {
          // Strictly exclude internal monorepo packages (@repo/*)
          if (name.startsWith('@repo/')) continue;

          totalDeps++;
          const layerCode = resolveStackLayer(name);
          if (!layers[layerCode]) {
            layers[layerCode] = { code: layerCode, title: layerCode, desc: '', packages: [] };
          }

          const depDeprecations = liveDeprecationsMap[name] || [];
          const terrain = (rnTerrainData.byName && rnTerrainData.byName[name]) || null;
          const curated = RN_TERRAIN_PROFILES[name] || null;

          layers[layerCode].packages.push({
            name,
            version,
            isDev: !!(pkg.devDependencies && pkg.devDependencies[name]),
            layerCode,
            category: terrain?.category || 'general',
            useCase: terrain?.use_case || curated?.role || terrain?.description || 'NPM Dependency',
            docsUrl: terrain?.docs_url || terrain?.homepage || null,
            repoUrl: terrain?.repository_url || null,
            githubRepo: terrain?.github_repo || null,
            ghStars: terrain?.gh_stars || null,
            ghOwner: terrain?.gh_owner || null,
            isNative: !!(terrain?.is_native || curated?.engine?.includes('Fabric') || curated?.engine?.includes('Nitro')),
            nativeKind: terrain?.native_kind || curated?.engine || null,
            hasTerrainProfile: !!terrain,
            hasCuratedProfile: !!curated,
            deprecationsCount: depDeprecations.length,
            substrateExists: fs.existsSync(path.join(rootDir, 'node_modules', name, 'package.json'))
          });
        }
      }

      // Filter out empty layers
      const activeLayers = {};
      Object.keys(layers).forEach(k => {
        if (layers[k].packages.length > 0) {
          activeLayers[k] = layers[k];
        }
      });

      return { ...app, totalDeps, layers: activeLayers };
    });

    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
    res.end(JSON.stringify({ apps: result, stackLayers: STACK_LAYERS_MAP }));
    return;
  }

  // API: Unified Dependency Scan & Radar
  if (pathname === '/api/deps/scan') {
    const refresh = parsedUrl.searchParams.get('refresh') === '1';
    if (!refresh && depsScanCache.data && Date.now() - depsScanCache.ts < CACHE_TTL_MS) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(depsScanCache.data));
      return;
    }
    try {
      const data = await scanDependencies({ rootDir, includePrerelease: true });
      depsScanCache = { data, ts: Date.now() };
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(data));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // API: Apply Approved Upgrades (Async Job)
  if (pathname === '/api/deps/apply' && req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        const jobId = `job_${Date.now()}`;
        const job = { id: jobId, status: 'running', currentStep: 'Queued', logs: [], ok: null };
        depsApplyJobs.set(jobId, job);

        applyUpgrades({
          rootDir,
          selections: payload.selections || [],
          exclude24h: payload.exclude24h || [],
          onProgress: (ev) => {
            if (ev.step) job.currentStep = `${ev.step} (${ev.status})`;
            if (ev.log) job.logs.push(ev.log);
          },
        }).then((result) => {
          job.status = result.ok ? 'passed' : 'failed';
          job.ok = result.ok;
          job.failedStep = result.failedStep || null;
          depsScanCache = { data: null, ts: 0 };
        }).catch((err) => {
          job.status = 'failed';
          job.ok = false;
          job.logs.push(err.message);
        });

        res.writeHead(202, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ jobId }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // API: Poll Apply Job Status
  if (pathname === '/api/deps/job') {
    const jobId = parsedUrl.searchParams.get('id');
    const job = depsApplyJobs.get(jobId);
    if (!job) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Job not found' }));
      return;
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ...job, logs: job.logs.slice(-120).join('') }));
    return;
  }

  // Serve static UI assets from tooling/portal/ui/
  let reqPath = pathname === '/' ? '/index.html' : pathname;
  const filePath = path.join(uiDir, reqPath);
  const safeFilePath = path.resolve(filePath);

  if (!safeFilePath.startsWith(uiDir) || !fs.existsSync(safeFilePath) || fs.statSync(safeFilePath).isDirectory()) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('404 Not Found');
    return;
  }

  const ext = path.extname(safeFilePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'text/plain; charset=utf-8';

  res.writeHead(200, { 'Content-Type': contentType });
  fs.createReadStream(safeFilePath).pipe(res);
});

const PORT = 4242;
server.listen(PORT, () => {
  console.log(`[Polymath Dev-Console] Live at http://localhost:${PORT}/ (IPv4 & IPv6 localhost)`);
});
