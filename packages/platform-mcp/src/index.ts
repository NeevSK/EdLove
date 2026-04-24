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
          description: 'Global structural code search with smart filtering.',
          inputSchema: {
            type: 'object',
            properties: {
              query: { type: 'string', description: 'Search term.' },
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
          description: 'Detects deprecated Gluestack/RN patterns.',
          inputSchema: {
            type: 'object',
            properties: { target: { type: 'string' } },
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
          description: 'Monorepo file/package inventory discovery.',
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
          case 'structural_search': return this.discovery.handleStructuralSearch(args as any);
          case "audit_imports": return this.discovery.handleAuditImports();

          // Maintenance Domain
          case "heal_codebase": return this.maintenance.handleHealCodebase(args as any);
          case "sync_identity_schema": return this.maintenance.handleSyncIdentity();
          case "check_package_types": return this.maintenance.handleCheckTypes(args as any);
          case "create_checkpoint": return this.maintenance.handleCreateCheckpoint(args as any);
          case "normalize_imports": return this.maintenance.handleNormalizeImports(args as any);
          case "audit_dependency_health": return this.maintenance.handleAuditDependencyHealth();
          case "generate_growth_signals": return this.maintenance.handleGenerateGrowthSignals();
          case "bridge_schema_zod": return this.maintenance.handleBridgeSchemaZod(args as any);
          case "test_sleekness": return this.maintenance.handleTestSleekness();

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
