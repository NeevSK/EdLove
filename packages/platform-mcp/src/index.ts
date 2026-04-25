import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import * as dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// --- Service Imports: The Modular Sovereignty ---
import { AuditService } from "./services/AuditService.js";
import { DiscoveryService } from "./services/DiscoveryService.js";
import { MaintenanceService } from "./services/MaintenanceService.js";
import { ROOT_DIR } from "./utils/constants.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "..", ".env") });

/**
 * The Polymath Platform MCP Server - MODULAR VERSION
 * The Sovereign Engineering Control Plane
 */
class PolymathPlatformServer {
  private server: Server;
  private audit: AuditService;
  private discovery: DiscoveryService;
  private maintenance: MaintenanceService;

  constructor() {
    this.server = new Server(
      { name: "polymath-platform-mcp", version: "1.1.0" },
      { capabilities: { tools: {} } }
    );

    this.audit = new AuditService();
    this.discovery = new DiscoveryService();
    this.maintenance = new MaintenanceService();

    this.setupHandlers();
    this.server.onerror = (error) => console.error("[MCP Error]", error);
  }

  private setupHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: "audit_monorepo_hygiene",
          description: "Runs corporate-scale hygiene checks (circular deps, unused code, boundary violations).",
          inputSchema: { type: "object", properties: {} },
        },
        {
          name: "heal_codebase",
          description: "Surgically repairs JSX/TS syntax corruption.",
          inputSchema: {
            type: "object",
            properties: {
              files: { type: "array", items: { type: "string" }, description: "File paths to heal." }
            },
            required: ["files"]
          },
        },
        {
          name: "sync_identity_schema",
          description: "Aligns DB faceted profiles with identity schemas.",
          inputSchema: { type: "object", properties: {} },
        },
        {
          name: "check_package_types",
          description: "Runs tsc audits for specific packages or monorepo root.",
          inputSchema: {
            type: "object",
            properties: {
              package: { type: "string", description: "Package name (e.g., '@repo/ui')." }
            }
          }
        },
        {
          name: 'grep_code',
          description: 'Global structural code search with smart filtering. Powered by ripgrep (rg) for extreme speed.',
          inputSchema: {
            type: 'object',
            properties: {
              query: { type: 'string', description: 'Search term or pattern.' },
              isRegex: { type: 'boolean' },
              include: { type: 'string' },
              target: { type: 'string' },
              includeNodeModules: { type: 'boolean' },
              summaryOnly: { type: 'boolean' },
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
          name: "create_checkpoint",
          description: "Atomically stages and commits changes with a smart ledger.",
          inputSchema: {
            type: "object",
            properties: {
              message: { type: "string" },
              stage_all: { type: "boolean" }
            },
            required: ["message"]
          },
        },
        {
          name: "normalize_imports",
          description: "Converts relative imports to workspace aliases.",
          inputSchema: {
            type: "object",
            properties: {
              target: { type: "string" }
            }
          }
        },
        {
          name: "normalize_inputs",
          description: "Plumbing: Resolves package aliases to absolute filesystem paths.",
          inputSchema: {
            type: "object",
            properties: {
              target: { type: "string" }
            },
            required: ["target"]
          }
        },
        {
          name: "audit_dependency_health",
          description: "Combined report of dependency health and SDK compatibility.",
          inputSchema: { type: "object", properties: {} },
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
          description: 'High-speed audit for legacy Gluestack/RN components (Zero-Legacy). Powered by ripgrep.',
          inputSchema: {
            type: 'object',
            properties: { target: { type: 'string', description: 'Directory to audit (defaults to packages).' } },
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
          description: 'Monorepo file/package inventory discovery. Powered by eza for high-fidelity tree views.',
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
          description: 'Enhanced file viewer with syntax highlighting and Git integration. Powered by bat.',
          inputSchema: {
            type: 'object',
            properties: {
              path: { type: 'string', description: 'Path to the file.' },
              range: { type: 'string', description: 'Line range (e.g. "10:40").' }
            },
            required: ['path']
          },
        },
        {
          name: 'shiny_find',
          description: 'Ultra-fast filename search. Powered by fd.',
          inputSchema: {
            type: 'object',
            properties: {
              query: { type: 'string', description: 'Search pattern.' },
              target: { type: 'string', description: 'Target directory.' }
            },
            required: ['query']
          },
        },
        {
          name: 'structural_search',
          description: "GritQL semantic pattern matching.",
          inputSchema: {
            type: 'object',
            properties: {
              query: { type: 'string' },
              target: { type: 'string' },
            },
            required: ['query'],
          },
        },
        {
          name: "audit_colors",
          description: "Contrast audit across design phases.",
          inputSchema: { type: "object", properties: {} },
        },
        {
          name: "test_sleekness",
          description: "Smoke test for native leakage in core logic.",
          inputSchema: { type: "object", properties: {} },
        },
        {
          name: "generate_growth_signals",
          description: "Growth signal schema synchronization.",
          inputSchema: { type: "object", properties: {} },
        },
        {
          name: "bridge_schema_zod",
          description: "Generates Zod validation schemas from any Sovereign JSON Schema.",
          inputSchema: {
            type: "object",
            properties: {
              input: { type: "string", description: "Path to input .json schema" },
              output: { type: "string", description: "Path to output .ts Zod file" }
            },
            required: ["input", "output"]
          },
        },
        {
          name: "audit_imports",
          description: "Dependency leak detection.",
          inputSchema: { type: "object", properties: {} },
        },
        {
          name: "check_classroom_boundaries",
          description: "Classroom boundary enforcement.",
          inputSchema: { type: "object", properties: {} },
        },
        {
          name: "check_self_boundaries",
          description: "Self boundary enforcement.",
          inputSchema: { type: "object", properties: {} },
        },
        {
          name: "generate_readme_usage",
          description: "Generates Usage sections in package READMEs from JSDocs.",
          inputSchema: {
            type: "object",
            properties: { package_path: { type: "string" } },
            required: ["package_path"]
          },
        },
        {
          name: "detect_stale_feature_flags",
          description: "Identifies feature flags that are statically true and can be removed.",
          inputSchema: { type: "object", properties: {} },
        },
        {
          name: "scaffold_mocks",
          description: "Generates a Vitest mock scaffold based on file imports.",
          inputSchema: {
            type: "object",
            properties: { file_path: { type: "string" } },
            required: ["file_path"]
          },
        },
        {
          name: "report_cognitive_load",
          description: "Reports high cognitive load 'God Files' in the codebase.",
          inputSchema: {
            type: "object",
            properties: { target: { type: "string" } }
          },
        },
        {
          name: "audit_ui_components",
          description: "Full component API documentation generation for @repo/ui.",
          inputSchema: { type: "object", properties: {} },
        },
        {
          name: "audit_i18n",
          description: "Audits i18n key coverage and fallback policy compliance.",
          inputSchema: { type: "object", properties: {} },
        },
        {
          name: "find_native_leaks",
          description: "Detects leak of React Native primitives into web-only shells.",
          inputSchema: { type: "object", properties: {} },
        },
        {
          name: "shield_unicode",
          description: "Protects against encoding corruption by escaping non-ASCII characters.",
          inputSchema: {
            type: "object",
            properties: { target: { type: "string" } }
          },
        },
        {
          name: "audit_dependency_duplication",
          description: "Detects version mismatches and high-frequency duplicates across the monorepo.",
          inputSchema: { type: "object", properties: {} },
        },
        {
          name: "debug_metro",
          description: "Debugs Metro bundler ID resolution for native platforms.",
          inputSchema: { type: "object", properties: {} },
        },
        {
          name: "scaffold_feature_context",
          description: "Scouts existing schemas, components, and events related to a feature keyword.",
          inputSchema: {
            type: "object",
            properties: { keyword: { type: "string" } },
            required: ["keyword"]
          },
        },
        {
          name: "audit_export_integrity",
          description: "Analyzes package barrel exports and flags deep-import violations.",
          inputSchema: { type: "object", properties: {} },
        },
        {
          name: "trace_deletion_impact",
          description: "Traces the recursive impact of deleting a symbol across the monorepo.",
          inputSchema: {
            type: "object",
            properties: { symbol: { type: "string" } },
            required: ["symbol"]
          },
        },
        {
          name: "check_schema_drift",
          description: "Detects alignment drift between Database ZModel and Core Logic models.",
          inputSchema: { type: "object", properties: {} },
        },
        {
          name: "audit_bundle_leak",
          description: "Detects heavy library leakage into sleek logic packages.",
          inputSchema: { type: "object", properties: {} },
        },
        {
          name: "audit_feature_fidelity",
          description: "Audits the gap between documentation promises and actual implementation/feature-flags.",
          inputSchema: {
            type: "object",
            properties: {
              includeArchives: { type: "boolean", description: "Whether to include archived docs in the ancestry (default: true)" }
            }
          },
        },
        {
          name: "purge_stale_artifacts",
          description: "Removes old reports, logs, and temporary files based on age and extension.",
          inputSchema: {
            type: "object",
            properties: {
              ageDays: { type: "number", description: "Max age of files in days (default: 7)" },
              dryRun: { type: "boolean", description: "Whether to perform a dry run (default: false)" }
            }
          },
        },
        {
          name: "shiny_stats",
          description: "Code statistics (LOC, blanks, comments) by language. Powered by tokei.",
          inputSchema: {
            type: "object",
            properties: { target: { type: "string" } }
          },
        },
        {
          name: "shiny_spellcheck",
          description: "Ultra-fast source code spell checker. Powered by typos.",
          inputSchema: {
            type: "object",
            properties: { target: { type: "string" } }
          },
        },
        {
          name: "shiny_disk_usage",
          description: "Visualizes directory size and disk usage. Powered by dust.",
          inputSchema: {
            type: "object",
            properties: {
              target: { type: "string" },
              depth: { type: "number" }
            }
          },
        },
        {
          name: "shiny_refactor",
          description: "Intuitive and fast project-wide find and replace. Powered by sd.",
          inputSchema: {
            type: "object",
            properties: {
              find: { type: "string" },
              replace: { type: "string" },
              target: { type: "string" }
            },
            required: ["find", "replace"]
          },
        },
        {
          name: "map_architecture",
          description: "Performs full architecture analysis, identifies misalignments with 'Zero-Legacy' goals, and provides remediation steps.",
          inputSchema: {
            type: "object",
            properties: {
              target: { type: "string" }
            }
          },
        },
      ],
    }));




    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      try {
        switch (name) {
          // Audit Domain
          case "audit_monorepo_hygiene": return this.audit.handleAuditHygiene();
          case 'audit_accessibility': return this.audit.handleAuditA11y(args as any);
          case 'check_contrast': return this.audit.handleCheckContrast(args as any);
          case 'lint_package': return this.audit.handleLintPackage(args as any);
          case 'audit_legacy_ui': return this.audit.handleAuditLegacyUI(args as any);
          case 'audit_package_architecture': return this.audit.handleAuditPackageArchitecture(args as any);
          case "audit_colors": return this.audit.handleAuditColors();
          case "check_classroom_boundaries": return this.audit.handleCheckClassroomBoundaries();
          case "check_self_boundaries": return this.audit.handleCheckSelfBoundaries();

          // Discovery Domain
          case 'grep_code': return this.discovery.handleGrepCode(args as any);
          case 'search_docs': return this.discovery.handleSearchDocs(args as any);
          case 'get_component_api': return this.discovery.handleGetComponentApi(args as any);
          case 'get_inventory': return this.discovery.handleGetInventory(args as any);
          case 'shiny_view': return this.discovery.handleShinyView(args as any);
          case 'shiny_find': return this.discovery.handleShinyFind(args as any);
          case 'structural_search': return this.discovery.handleStructuralSearch(args as any);
          case "audit_imports": return this.discovery.handleAuditImports();

          // Maintenance Domain
          case "heal_codebase": return this.maintenance.handleHealCodebase(args as any);
          case "sync_identity_schema": return this.maintenance.handleSyncIdentity();
          case "check_package_types": return this.maintenance.handleCheckTypes(args as any);
          case "create_checkpoint": return this.maintenance.handleCreateCheckpoint(args as any);
          case "normalize_imports": return this.maintenance.handleNormalizeImports(args as any);
          case "normalize_inputs": return this.maintenance.handleNormalizeInputs(args as any);
          case "audit_dependency_health": return this.maintenance.handleAuditDependencyHealth();
          case "generate_growth_signals": return this.maintenance.handleGenerateGrowthSignals();
          case "bridge_schema_zod": return this.maintenance.handleBridgeSchemaZod(args as any);
          case "test_sleekness": return this.maintenance.handleTestSleekness();
          case "generate_readme_usage": return this.maintenance.handleGenerateReadmeUsage(args as any);
          case "scaffold_mocks": return this.maintenance.handleScaffoldMocks(args as any);

          // Additional Audit / Discovery
          case "detect_stale_feature_flags": return this.audit.handleAuditFeatureFlags();
          case "report_cognitive_load": return this.audit.handleReportCognitiveLoad(args as any);
          case "audit_ui_components": return this.discovery.handleAuditUIComponents();
          case "audit_i18n": return this.audit.handleAuditI18n();
          case "find_native_leaks": return this.discovery.handleFindNativeLeaks();
          case "shield_unicode": return this.maintenance.handleShieldUnicode(args as any);
          case "audit_dependency_duplication": return this.maintenance.handleAuditDependencyDuplication();
          case "debug_metro": return this.discovery.handleDebugMetro();
          case "scaffold_feature_context": return this.discovery.handleScaffoldFeatureContext(args as any);
          case "audit_export_integrity": return this.audit.handleAuditExportIntegrity();
          case "trace_deletion_impact": return this.discovery.handleTraceDeletionImpact(args as any);
          case "check_schema_drift": return this.maintenance.handleCheckSchemaDrift();
          case "audit_bundle_leak": return this.audit.handleAuditBundleLeak();
          case "audit_feature_fidelity": return this.audit.handleAuditFeatureFidelity(args as any);
          case "purge_stale_artifacts": return this.maintenance.handlePurgeStaleArtifacts(args as any);
          case "shiny_stats": return this.discovery.handleGetCodeStats(args as any);
          case "shiny_spellcheck": return this.discovery.handleCheckSpelling(args as any);
          case "shiny_disk_usage": return this.discovery.handleDiskUsage(args as any);
          case "shiny_refactor": return this.maintenance.handleRefactorReplace(args as any);
          case "map_architecture": return this.discovery.handleMapArchitecture(args as any);

          default: throw new Error(`Unknown tool: ${name}`);



        }
      } catch (error: any) {
        return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("Polymath Master MCP Server (Modular) running on stdio");
  }
}

const server = new PolymathPlatformServer();
server.run().catch(console.error);
