import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import * as dotenv from 'dotenv';

// --- Service Imports: The Modular Sovereignty ---
import { AuditService } from './services/AuditService.js';
import { DiscoveryService } from './services/DiscoveryService.js';
import { DocumentService } from './services/DocumentService.js';
import { HelpService } from './services/HelpService.js';
import { MaintenanceService } from './services/MaintenanceService.js';
import { ScoutService } from './services/ScoutService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

/**
 * The Polymath Platform MCP Server - MODULAR VERSION
 * The Sovereign Engineering Control Plane
 */
class PolymathPlatformServer {
  private server: Server;
  private audit: AuditService;
  private discovery: DiscoveryService;
  private maintenance: MaintenanceService;
  private scout: ScoutService;
  private help: HelpService;
  private document: DocumentService;

  constructor() {
    this.server = new Server(
      { name: 'polymath-platform-mcp', version: '1.1.0' },
      { capabilities: { tools: {} } },
    );

    this.document = new DocumentService();
    this.audit = new AuditService(this.document);
    this.discovery = new DiscoveryService();
    this.maintenance = new MaintenanceService();
    this.scout = new ScoutService(this.document);
    this.help = new HelpService();

    this.setupHandlers();
    this.server.onerror = (error) => console.error('[MCP Error]', error);
  }

  private setupHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      // --- LEGACY MODES (Retained for migration) ---
      const allTools = [
        {
          name: 'audit_monorepo_hygiene',
          description:
            'Runs corporate-scale hygiene checks (circular deps, unused code, boundary violations).',
          inputSchema: { type: 'object', properties: {} },
        },
        {
          name: 'heal_codebase',
          description: 'Surgically repairs JSX/TS syntax corruption.',
          inputSchema: {
            type: 'object',
            properties: {
              files: {
                type: 'array',
                items: { type: 'string' },
                description: 'File paths to heal.',
              },
            },
            required: ['files'],
          },
        },
        {
          name: 'sync_identity_schema',
          description: 'Aligns DB faceted profiles with identity schemas.',
          inputSchema: { type: 'object', properties: {} },
        },
        {
          name: 'check_package_types',
          description: 'Runs tsc audits for specific packages or monorepo root.',
          inputSchema: {
            type: 'object',
            properties: {
              package: {
                type: 'string',
                description: "Package name (e.g., '@repo/ui').",
              },
            },
          },
        },
        {
          name: 'grep_code',
          description:
            'Global structural code search with smart filtering. Powered by ripgrep (rg) for extreme speed. Supports context and smart summaries.',
          inputSchema: {
            type: 'object',
            properties: {
              query: { type: 'string', description: 'Search term or pattern.' },
              target: {
                type: 'string',
                description: 'Target directory or package alias (e.g. @repo/ui).',
              },
              context: {
                type: 'number',
                description: 'Number of context lines (before/after) to show. Default 0.',
              },
              fileType: {
                type: 'string',
                description: 'Filter by file type (e.g. ts, tsx, css, md).',
              },
              isRegex: {
                type: 'boolean',
                description: 'Treat query as a regular expression.',
              },
              include: {
                type: 'string',
                description: 'Glob pattern for files to include.',
              },
              includeNodeModules: {
                type: 'boolean',
                description: 'Search inside node_modules (default false).',
              },
              summaryOnly: {
                type: 'boolean',
                description: 'Return only file counts instead of full results.',
              },
              richText: {
                type: 'boolean',
                description: 'Output with enhanced formatting (bat-style) if possible.',
              },
            },
            required: ['query'],
          },
        },
        {
          name: 'sovereign_scout',
          description:
            'Orchestrated discovery intelligence. Combines file scouts, doc mining, and codebase heatmap into a single "Intelligence Dossier". Best for high-level understanding of any term.',
          inputSchema: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description: 'Search term or feature keyword.',
              },
              target: {
                type: 'string',
                description: 'Target directory or package alias.',
              },
            },
            required: ['query'],
          },
        },
        {
          name: 'search_docs',
          description: 'Targeted documentation and architectural guide discovery.',
          inputSchema: {
            type: 'object',
            properties: {
              query: { type: 'string' },
              target: { type: 'string' },
              includeNodeModules: { type: 'boolean' },
              summaryOnly: { type: 'boolean' },
              hybrid: { type: 'boolean' },
            },
            required: ['query'],
          },
        },
        {
          name: 'create_checkpoint',
          description: 'Atomically stages and commits changes with a smart ledger.',
          inputSchema: {
            type: 'object',
            properties: {
              message: { type: 'string' },
              stage_all: { type: 'boolean' },
            },
            required: ['message'],
          },
        },
        {
          name: 'normalize_imports',
          description: 'Converts relative imports to workspace aliases.',
          inputSchema: {
            type: 'object',
            properties: {
              target: { type: 'string' },
            },
          },
        },
        {
          name: 'normalize_inputs',
          description: 'Plumbing: Resolves package aliases to absolute filesystem paths.',
          inputSchema: {
            type: 'object',
            properties: {
              target: { type: 'string' },
            },
            required: ['target'],
          },
        },
        {
          name: 'audit_dependency_health',
          description: 'Combined report of dependency health and SDK compatibility.',
          inputSchema: { type: 'object', properties: {} },
        },
        {
          name: 'audit_accessibility',
          description: 'Targeted a11y linting and ARIA violation checks.',
          inputSchema: {
            type: 'object',
            properties: { target: { type: 'string' } },
          },
        },
        {
          name: 'check_contrast',
          description: 'WCAG/APCA contrast ratio calculation.',
          inputSchema: {
            type: 'object',
            properties: {
              fg: { type: 'string' },
              bg: { type: 'string' },
            },
            required: ['fg', 'bg'],
          },
        },
        {
          name: 'lint_package',
          description: 'High-speed Biome linting for packages.',
          inputSchema: {
            type: 'object',
            properties: { target: { type: 'string' } },
          },
        },
        {
          name: 'get_component_api',
          description: 'Extracts props/API docs for a React component.',
          inputSchema: {
            type: 'object',
            properties: { name: { type: 'string' } },
            required: ['name'],
          },
        },
        {
          name: 'audit_legacy_ui',
          description:
            'High-speed audit for legacy Gluestack/RN components (Zero-Legacy). Powered by ripgrep.',
          inputSchema: {
            type: 'object',
            properties: {
              target: {
                type: 'string',
                description: 'Directory to audit (defaults to packages).',
              },
            },
          },
        },
        {
          name: 'audit_package_architecture',
          description: 'Ensures platform agnosticism and boundary integrity.',
          inputSchema: {
            type: 'object',
            properties: { target: { type: 'string' } },
            required: ['target'],
          },
        },
        {
          name: 'get_inventory',
          description:
            'Monorepo file/package inventory discovery. Powered by eza for high-fidelity tree views.',
          inputSchema: {
            type: 'object',
            properties: {
              target: { type: 'string' },
              depth: { type: 'number' },
              format: { type: 'string', enum: ['text', 'markdown'] },
              verbose: { type: 'boolean' },
            },
          },
        },
        {
          name: 'shiny_view',
          description:
            'Enhanced file viewer with syntax highlighting and Git integration. Powered by bat.',
          inputSchema: {
            type: 'object',
            properties: {
              path: { type: 'string', description: 'Path to the file.' },
              range: {
                type: 'string',
                description: 'Line range (e.g. "10:40").',
              },
            },
            required: ['path'],
          },
        },
        {
          name: 'shiny_find',
          description: 'Ultra-fast filename search. Powered by fd.',
          inputSchema: {
            type: 'object',
            properties: {
              query: { type: 'string', description: 'Search pattern.' },
              target: { type: 'string', description: 'Target directory.' },
            },
            required: ['query'],
          },
        },
        {
          name: 'structural_search',
          description:
            'GritQL semantic pattern matching. Best for finding code structures like \'import { $X } from "$Y"\'.',
          inputSchema: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description: 'GritQL or structural pattern.',
              },
              target: {
                type: 'string',
                description: 'Target directory or package alias.',
              },
              include: {
                type: 'string',
                description: 'Glob pattern for files to include.',
              },
            },
            required: ['query'],
          },
        },
        {
          name: 'audit_colors',
          description: 'Contrast audit across design phases.',
          inputSchema: { type: 'object', properties: {} },
        },
        {
          name: 'test_sleekness',
          description: 'Smoke test for native leakage in core logic.',
          inputSchema: { type: 'object', properties: {} },
        },
        {
          name: 'generate_growth_signals',
          description: 'Growth signal schema synchronization.',
          inputSchema: { type: 'object', properties: {} },
        },
        {
          name: 'bridge_schema_zod',
          description: 'Generates Zod validation schemas from any Sovereign JSON Schema.',
          inputSchema: {
            type: 'object',
            properties: {
              input: {
                type: 'string',
                description: 'Path to input .json schema',
              },
              output: {
                type: 'string',
                description: 'Path to output .ts Zod file',
              },
            },
            required: ['input', 'output'],
          },
        },
        {
          name: 'audit_imports',
          description: 'Dependency leak detection.',
          inputSchema: { type: 'object', properties: {} },
        },
        {
          name: 'check_classroom_boundaries',
          description: 'Classroom boundary enforcement.',
          inputSchema: { type: 'object', properties: {} },
        },
        {
          name: 'check_self_boundaries',
          description: 'Self boundary enforcement.',
          inputSchema: { type: 'object', properties: {} },
        },
        {
          name: 'generate_readme_usage',
          description: 'Generates Usage sections in package READMEs from JSDocs.',
          inputSchema: {
            type: 'object',
            properties: { package_path: { type: 'string' } },
            required: ['package_path'],
          },
        },
        {
          name: 'detect_stale_feature_flags',
          description: 'Identifies feature flags that are statically true and can be removed.',
          inputSchema: { type: 'object', properties: {} },
        },
        {
          name: 'scaffold_mocks',
          description: 'Generates a Vitest mock scaffold based on file imports.',
          inputSchema: {
            type: 'object',
            properties: { file_path: { type: 'string' } },
            required: ['file_path'],
          },
        },
        {
          name: 'report_cognitive_load',
          description: "Reports high cognitive load 'God Files' in the codebase.",
          inputSchema: {
            type: 'object',
            properties: { target: { type: 'string' } },
          },
        },
        {
          name: 'audit_ui_components',
          description: 'Full component API documentation generation for @repo/ui.',
          inputSchema: { type: 'object', properties: {} },
        },
        {
          name: 'audit_i18n',
          description: 'Audits i18n key coverage and fallback policy compliance.',
          inputSchema: { type: 'object', properties: {} },
        },
        {
          name: 'find_native_leaks',
          description: 'Detects leak of React Native primitives into web-only shells.',
          inputSchema: { type: 'object', properties: {} },
        },
        {
          name: 'shield_unicode',
          description: 'Protects against encoding corruption by escaping non-ASCII characters.',
          inputSchema: {
            type: 'object',
            properties: { target: { type: 'string' } },
          },
        },
        {
          name: 'audit_dependency_duplication',
          description:
            'Detects version mismatches and high-frequency duplicates across the monorepo.',
          inputSchema: { type: 'object', properties: {} },
        },
        {
          name: 'debug_metro',
          description: 'Debugs Metro bundler ID resolution for native platforms.',
          inputSchema: { type: 'object', properties: {} },
        },
        {
          name: 'scaffold_feature_context',
          description:
            'Scouts existing schemas, components, and events related to a feature keyword.',
          inputSchema: {
            type: 'object',
            properties: { keyword: { type: 'string' } },
            required: ['keyword'],
          },
        },
        {
          name: 'audit_export_integrity',
          description: 'Analyzes package barrel exports and flags deep-import violations.',
          inputSchema: { type: 'object', properties: {} },
        },
        {
          name: 'trace_deletion_impact',
          description: 'Traces the recursive impact of deleting a symbol across the monorepo.',
          inputSchema: {
            type: 'object',
            properties: { symbol: { type: 'string' } },
            required: ['symbol'],
          },
        },
        {
          name: 'check_schema_drift',
          description: 'Detects alignment drift between Database ZModel and Core Logic models.',
          inputSchema: { type: 'object', properties: {} },
        },
        {
          name: 'audit_bundle_leak',
          description: 'Detects heavy library leakage into sleek logic packages.',
          inputSchema: { type: 'object', properties: {} },
        },
        {
          name: 'audit_feature_fidelity',
          description:
            'Audits the gap between documentation promises and actual implementation/feature-flags.',
          inputSchema: {
            type: 'object',
            properties: {
              includeArchives: {
                type: 'boolean',
                description: 'Whether to include archived docs in the ancestry (default: true)',
              },
            },
          },
        },
        {
          name: 'purge_stale_artifacts',
          description: 'Removes old reports, logs, and temporary files based on age and extension.',
          inputSchema: {
            type: 'object',
            properties: {
              ageDays: {
                type: 'number',
                description: 'Max age of files in days (default: 7)',
              },
              dryRun: {
                type: 'boolean',
                description: 'Whether to perform a dry run (default: false)',
              },
            },
          },
        },
        {
          name: 'shiny_stats',
          description: 'Code statistics (LOC, blanks, comments) by language. Powered by tokei.',
          inputSchema: {
            type: 'object',
            properties: { target: { type: 'string' } },
          },
        },
        {
          name: 'shiny_spellcheck',
          description: 'Ultra-fast source code spell checker. Powered by typos.',
          inputSchema: {
            type: 'object',
            properties: { target: { type: 'string' } },
          },
        },
        {
          name: 'shiny_disk_usage',
          description: 'Visualizes directory size and disk usage. Powered by dust.',
          inputSchema: {
            type: 'object',
            properties: {
              target: { type: 'string' },
              depth: { type: 'number' },
            },
          },
        },
        {
          name: 'shiny_refactor',
          description: 'Intuitive and fast project-wide find and replace. Powered by sd.',
          inputSchema: {
            type: 'object',
            properties: {
              find: { type: 'string' },
              replace: { type: 'string' },
              target: { type: 'string' },
            },
            required: ['find', 'replace'],
          },
        },
        {
          name: 'map_architecture',
          description:
            "Performs full architecture analysis, identifies misalignments with 'Zero-Legacy' goals, and provides remediation steps.",
          inputSchema: {
            type: 'object',
            properties: {
              target: { type: 'string' },
            },
          },
        },
      ];

      // --- SOVEREIGN GATEWAYS (The Future) ---
      const gatewayTools = [
        {
          name: 'sovereign_audit',
          description: 'Unified auditing engine for hygiene, architecture, and compliance.',
          inputSchema: {
            type: 'object',
            properties: {
              action: {
                type: 'string',
                enum: [
                  'hygiene',
                  'legacy_ui',
                  'architecture',
                  'a11y',
                  'dependency_health',
                  'i18n',
                  'colors',
                  'boundaries',
                  'features',
                  'exports',
                  'design_tokens',
                  'stale_flags',
                  'load_report',
                  'bundle_leak',
                  'lint',
                  'check',
                  'syncpack_fix',
                  'types',
                  'hooks',
                  'push_audit',
                  'deprecations',
                  'memory_sinks',
                  'cognitive_load',
                ],
              },
              params: {
                type: 'object',
                description: 'Optional parameters specific to the audit action.',
              },
            },
            required: ['action'],
          },
        },
        {
          name: 'sovereign_discovery',
          description: 'Unified discovery engine for search, scouting, and intel.',
          inputSchema: {
            type: 'object',
            properties: {
              action: {
                type: 'string',
                enum: [
                  'grep',
                  'scout',
                  'docs',
                  'inventory',
                  'find',
                  'lens',
                  'simulate',
                  'structural',
                  'stats',
                  'component_api',
                  'imports',
                  'ui_report',
                  'native_leaks',
                  'metro_debug',
                  'impact',
                  'jina',
                  'spellcheck',
                  'disk_usage',
                ],
              },
              params: {
                type: 'object',
                description: 'Optional parameters specific to the discovery action.',
              },
            },
            required: ['action'],
          },
        },
        {
          name: 'sovereign_maintenance',
          description: 'Unified maintenance engine for healing, refactoring, and synchronization.',
          inputSchema: {
            type: 'object',
            properties: {
              action: {
                type: 'string',
                enum: [
                  'heal',
                  'sync',
                  'checkpoint',
                  'refactor',
                  'normalize',
                  'inputs',
                  'scaffold',
                  'lint_fix',
                  'heal_architecture',
                  'zod_bridge',
                  'sleekness_test',
                  'readme_usage',
                  'scaffold_mocks',
                  'shield_unicode',
                  'dep_duplicate',
                  'schema_drift',
                  'purge',
                  'runbyte_config',
                  'push',
                ],
              },
              params: {
                type: 'object',
                description: 'Optional parameters specific to the maintenance action.',
              },
            },
            required: ['action'],
          },
        },
        {
          name: 'sovereign_guide',
          description: 'Help, architecture documentation, and tool inventory for the Polymath MCP.',
          inputSchema: {
            type: 'object',
            properties: {
              action: {
                type: 'string',
                enum: [
                  'architecture',
                  'inventory',
                  'philosophy',
                  'runbyte',
                  'soul',
                  'recent_evolutions',
                  'mistakes',
                  'refusal',
                ],
              },
            },
            required: ['action'],
          },
        },
        {
          name: 'help',
          description: 'Get help and overview of all available Polymath MCP tools and gateways.',
          inputSchema: { type: 'object', properties: {} },
        },
        {
          name: 'info',
          description: 'Get architectural information and philosophy of the Polymath Platform.',
          inputSchema: { type: 'object', properties: {} },
        },
      ];

      // Smart Selection Strategy
      const mcpMode = process.env.MCP_MODE;
      if (mcpMode === 'GATEWAY' || !mcpMode) {
        return { tools: gatewayTools };
      }

      if (mcpMode === 'LEAN') {
        const highValueToolNames = [
          'grep_code',
          'sovereign_scout',
          'structural_search',
          'shiny_view',
          'shiny_find',
          'audit_monorepo_hygiene',
          'audit_legacy_ui',
          'check_package_types',
          'map_architecture',
          'get_inventory',
          'lint_package',
          'create_checkpoint',
          'audit_package_architecture',
          'shiny_refactor',
          'heal_codebase',
        ];
        return {
          tools: allTools.filter((t) => highValueToolNames.includes(t.name)),
        };
      }

      return { tools: allTools };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        // --- GATEWAY ROUTING ---
        if (name === 'sovereign_audit') {
          const { action, params = {} } = args as any;
          switch (action) {
            case 'hygiene':
              return this.audit.handleAuditHygiene();
            case 'legacy_ui':
              return this.audit.handleAuditLegacyUI(params);
            case 'architecture':
              return this.audit.handleAuditPackageArchitecture(params);
            case 'a11y':
              return this.audit.handleAuditA11y(params);
            case 'dependency_health':
              return this.maintenance.handleAuditDependencyHealth();
            case 'i18n':
              return this.audit.handleAuditI18n();
            case 'colors':
              return this.audit.handleCheckContrast(params);
            case 'boundaries':
              return this.audit.handleCheckClassroomBoundaries();
            case 'features':
              return this.audit.handleAuditFeatureFidelity(params);
            case 'exports':
              return this.audit.handleAuditExportIntegrity();
            case 'design_tokens':
              return this.audit.handleAuditColors();
            case 'stale_flags':
              return this.audit.handleAuditFeatureFlags();
            case 'load_report':
              return this.audit.handleReportCognitiveLoad(params);
            case 'bundle_leak':
              return this.audit.handleAuditBundleLeak();
            case 'lint':
              return this.audit.handleLintPackage(params);
            case 'check':
              return this.audit.handleBiomeCheck(params);
            case 'syncpack_fix':
              return this.audit.handleSyncpackFix();
            case 'types':
              return this.audit.handleCheckTypes(params);
            case 'hooks':
              return this.audit.handleAuditHookViolations(params);
            case 'deprecations':
              return this.audit.handleAuditDeprecations(params);
            case 'memory_sinks':
              return this.audit.handleCheckMemorySinks();
            case 'cognitive_load':
              return this.audit.handleReportCognitiveLoad(params);
            case 'push_audit':
              return this.audit.handlePushAudit();
            default:
              throw new Error(`Unknown audit action: ${action}`);
          }
        }

        if (name === 'sovereign_discovery') {
          const { action, params = {} } = args as any;
          switch (action) {
            case 'grep':
              return this.discovery.handleGrepCode(params);
            case 'scout':
              return this.scout.handleSovereignScout(params);
            case 'docs':
              return this.discovery.handleSearchDocs(params);
            case 'inventory':
              return this.discovery.handleGetInventory(params);
            case 'view':
              return this.discovery.handleShinyView(params);
            case 'find':
              return this.discovery.handleShinyFind(params);
            case 'lens':
              return this.discovery.handleGetLens(params);
            case 'simulate':
              return this.discovery.handleSimulateImpact(params);
            case 'structural':
              return this.discovery.handleStructuralSearch(params);
            case 'stats':
              return this.discovery.handleGetCodeStats(params);
            case 'component_api':
              return this.discovery.handleGetComponentApi(params);
            case 'imports':
              return this.discovery.handleAuditImports();
            case 'ui_report':
              return this.discovery.handleAuditUIComponents();
            case 'native_leaks':
              return this.discovery.handleFindNativeLeaks();
            case 'metro_debug':
              return this.discovery.handleDebugMetro();
            case 'impact':
              return this.discovery.handleTraceDeletionImpact(params);
            case 'jina':
              return this.discovery.handleJinaReader(params);
            case 'spellcheck':
              return this.discovery.handleCheckSpelling(params);
            case 'disk_usage':
              return this.discovery.handleDiskUsage(params);
            default:
              throw new Error(`Unknown discovery action: ${action}`);
          }
        }

        if (name === 'sovereign_maintenance') {
          const { action, params = {} } = args as any;
          switch (action) {
            case 'heal':
              return this.maintenance.handleHealCodebase(params);
            case 'sync':
              return this.maintenance.handleSyncIdentity();
            case 'checkpoint':
              return this.maintenance.handleCreateCheckpoint(params);
            case 'refactor':
              return this.maintenance.handleRefactorReplace(params);
            case 'normalize':
              return this.maintenance.handleNormalizeImports(params);
            case 'heal_architecture':
              return this.maintenance.handleHealArchitecture(params);
            case 'lint_fix':
              return this.maintenance.handleLintFix(params);
            case 'inputs':
              return this.maintenance.handleNormalizeInputs(params);
            case 'scaffold':
              return this.discovery.handleScaffoldFeatureContext(params);
            case 'zod_bridge':
              return this.maintenance.handleBridgeSchemaZod(params);
            case 'sleekness_test':
              return this.maintenance.handleTestSleekness();
            case 'readme_usage':
              return this.maintenance.handleGenerateReadmeUsage(params);
            case 'scaffold_mocks':
              return this.maintenance.handleScaffoldMocks(params);
            case 'shield_unicode':
              return this.maintenance.handleShieldUnicode(params);
            case 'dep_duplicate':
              return this.maintenance.handleAuditDependencyDuplication();
            case 'schema_drift':
              return this.maintenance.handleCheckSchemaDrift();
            case 'purge':
              return this.maintenance.handlePurgeStaleArtifacts(params);
            case 'runbyte_config':
              return this.maintenance.handleGenerateRunbyteConfig(params);
            case 'push':
              return this.maintenance.handleSovereignPush();
            default:
              throw new Error(`Unknown maintenance action: ${action}`);
          }
        }

        if (name === 'sovereign_guide') {
          const { action } = args as any;
          switch (action) {
            case 'architecture':
              return this.help.handleGetArchitectureDoc();
            case 'inventory':
              return this.help.handleGetToolInventory();
            case 'philosophy':
              return this.help.handleGetPhilosophy();
            case 'soul':
              return this.help.handleGetSoul();
            case 'mistakes':
              return this.help.handleGetMistakeLedger();
            case 'refusal':
              return this.help.handleGetSeniorRefusal();
            case 'recent_evolutions':
              return this.help.handleGetRecentEvolutions();
            case 'runbyte':
              return this.help.handleGetRunbyteGuide();
            default:
              throw new Error(`Unknown guide action: ${action}`);
          }
        }

        if (name === 'help') {
          return this.help.handleGetHelpOverview();
        }
        if (name === 'info') {
          return this.help.handleGetArchitectureDoc();
        }

        // --- LEGACY ROUTING ---
        switch (name) {
          case 'audit_monorepo_hygiene':
            return this.audit.handleAuditHygiene();
          case 'audit_accessibility':
            return this.audit.handleAuditA11y(args as any);
          case 'check_contrast':
            return this.audit.handleCheckContrast(args as any);
          case 'lint_package':
            return this.audit.handleLintPackage(args as any);
          case 'audit_legacy_ui':
            return this.audit.handleAuditLegacyUI(args as any);
          case 'audit_package_architecture':
            return this.audit.handleAuditPackageArchitecture(args as any);
          case 'audit_colors':
            return this.audit.handleAuditColors();
          case 'check_classroom_boundaries':
            return this.audit.handleCheckClassroomBoundaries();
          case 'check_self_boundaries':
            return this.audit.handleCheckSelfBoundaries();
          case 'grep_code':
            return this.discovery.handleGrepCode(args as any);
          case 'sovereign_scout':
            return this.scout.handleSovereignScout(args as any);
          case 'search_docs':
            return this.discovery.handleSearchDocs(args as any);
          case 'get_component_api':
            return this.discovery.handleGetComponentApi(args as any);
          case 'get_inventory':
            return this.discovery.handleGetInventory(args as any);
          case 'shiny_view':
            return this.discovery.handleShinyView(args as any);
          case 'shiny_find':
            return this.discovery.handleShinyFind(args as any);
          case 'structural_search':
            return this.discovery.handleStructuralSearch(args as any);
          case 'audit_imports':
            return this.discovery.handleAuditImports();
          case 'heal_codebase':
            return this.maintenance.handleHealCodebase(args as any);
          case 'sync_identity_schema':
            return this.maintenance.handleSyncIdentity();
          case 'check_package_types':
            return this.audit.handleCheckTypes(args as any);
          case 'create_checkpoint':
            return this.maintenance.handleCreateCheckpoint(args as any);
          case 'normalize_imports':
            return this.maintenance.handleNormalizeImports(args as any);
          case 'normalize_inputs':
            return this.maintenance.handleNormalizeInputs(args as any);
          case 'audit_dependency_health':
            return this.maintenance.handleAuditDependencyHealth();
          case 'generate_growth_signals':
            return this.maintenance.handleGenerateGrowthSignals();
          case 'bridge_schema_zod':
            return this.maintenance.handleBridgeSchemaZod(args as any);
          case 'test_sleekness':
            return this.maintenance.handleTestSleekness();
          case 'generate_readme_usage':
            return this.maintenance.handleGenerateReadmeUsage(args as any);
          case 'scaffold_mocks':
            return this.maintenance.handleScaffoldMocks(args as any);
          case 'detect_stale_feature_flags':
            return this.audit.handleAuditFeatureFlags();
          case 'report_cognitive_load':
            return this.audit.handleReportCognitiveLoad(args as any);
          case 'audit_ui_components':
            return this.discovery.handleAuditUIComponents();
          case 'audit_i18n':
            return this.audit.handleAuditI18n();
          case 'find_native_leaks':
            return this.discovery.handleFindNativeLeaks();
          case 'shield_unicode':
            return this.maintenance.handleShieldUnicode(args as any);
          case 'audit_dependency_duplication':
            return this.maintenance.handleAuditDependencyDuplication();
          case 'debug_metro':
            return this.discovery.handleDebugMetro();
          case 'scaffold_feature_context':
            return this.discovery.handleScaffoldFeatureContext(args as any);
          case 'audit_export_integrity':
            return this.audit.handleAuditExportIntegrity();
          case 'trace_deletion_impact':
            return this.discovery.handleTraceDeletionImpact(args as any);
          case 'check_schema_drift':
            return this.maintenance.handleCheckSchemaDrift();
          case 'audit_bundle_leak':
            return this.audit.handleAuditBundleLeak();
          case 'audit_feature_fidelity':
            return this.audit.handleAuditFeatureFidelity(args as any);
          case 'purge_stale_artifacts':
            return this.maintenance.handlePurgeStaleArtifacts(args as any);
          case 'shiny_stats':
            return this.discovery.handleGetCodeStats(args as any);
          case 'shiny_spellcheck':
            return this.discovery.handleCheckSpelling(args as any);
          case 'shiny_disk_usage':
            return this.discovery.handleDiskUsage(args as any);
          case 'shiny_refactor':
            return this.maintenance.handleRefactorReplace(args as any);
          case 'map_architecture':
            return this.discovery.handleGetLens({
              type: 'debt',
              ...args,
            } as any);

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error: any) {
        return {
          content: [{ type: 'text', text: `Error: ${error.message}` }],
          isError: true,
        };
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Polymath Master MCP Server (Modular) running on stdio');
  }
}

const server = new PolymathPlatformServer();
server.run().catch(console.error);
