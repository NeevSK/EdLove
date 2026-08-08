/* eslint-disable import-x/no-unresolved */

// --- Robust Stdio Protection: Redirect all stdout to stderr during the boot phase ---
const originalStdoutWrite = process.stdout.write;
process.stdout.write = function (chunk: any, encoding?: any, callback?: any) {
  return process.stderr.write(chunk, encoding, callback);
} as any;

import * as fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Client } from '@modelcontextprotocol/client';
import { StdioClientTransport } from '@modelcontextprotocol/client/stdio';
import { McpServer } from '@modelcontextprotocol/server';
import { StdioServerTransport } from '@modelcontextprotocol/server/stdio';
import { z } from 'zod';
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
dotenv.config({ path: path.join(__dirname, '..', '.env'), quiet: true });

/**
 * The Polymath Platform MCP Server - MODULAR VERSION
 * The Sovereign Engineering Control Plane
 */
class PolymathPlatformServer {
  private server: McpServer;
  private audit: AuditService;
  private discovery: DiscoveryService;
  private maintenance: MaintenanceService;
  private scout: ScoutService;
  private help: HelpService;
  private document: DocumentService;
  private downstreamClients: Map<string, { client: Client; tools: any[] }> = new Map();

  constructor() {
    this.server = new McpServer(
      { name: 'polymath-platform-mcp', version: '2.0.0' }
    );

    this.document = new DocumentService();
    this.audit = new AuditService(this.document);
    this.discovery = new DiscoveryService();
    this.maintenance = new MaintenanceService();
    this.scout = new ScoutService(this.document);
    this.help = new HelpService();

    this.setupHandlers();
    this.server.server.onerror = (error: any) => console.error('[MCP Error]', error);
  }

  private async syncWorkspaceSkillsToAntigravity() {
    const homedir = os.homedir();

    // Dynamically resolve the absolute workspace root relative to the current module folder
    let workspaceRoot = path.resolve(__dirname, '..', '..', '..');
    if (!fs.existsSync(path.join(workspaceRoot, 'package.json'))) {
      workspaceRoot = path.resolve(process.cwd());
    }

    const localSkillsDir = path.join(workspaceRoot, '.claude', 'skills');
    const globalKiDir = path.join(homedir, '.gemini', 'antigravity', 'knowledge');
    const globalCodexSkillsDir = path.join(homedir, '.codex', 'skills');

    // Assure basic directories exist on the local workspace
    if (!fs.existsSync(localSkillsDir)) {
      fs.mkdirSync(localSkillsDir, { recursive: true });
    }
    if (!fs.existsSync(globalKiDir)) {
      fs.mkdirSync(globalKiDir, { recursive: true });
    }

    // Step 1: Discover all playbooks across the local workspace and the global Codex folders
    const playbooks = new Map<string, { sourcePath: string; content: string }>();

    // A. Read local playbooks committed in the repo
    if (fs.existsSync(localSkillsDir)) {
      const localSkills = fs.readdirSync(localSkillsDir);
      for (const skillName of localSkills) {
        const skillPath = path.join(localSkillsDir, skillName);
        if (!fs.statSync(skillPath).isDirectory()) continue;

        const localSkillMdPath = path.join(skillPath, 'skill.md');
        if (fs.existsSync(localSkillMdPath)) {
          const content = fs.readFileSync(localSkillMdPath, 'utf8');
          playbooks.set(skillName, { sourcePath: localSkillMdPath, content });
        }
      }
    }

    // B. Read global Codex playbooks (if installed on this computer) to bootstrap the workspace
    if (fs.existsSync(globalCodexSkillsDir)) {
      const globalSkills = fs.readdirSync(globalCodexSkillsDir);
      for (const skillName of globalSkills) {
        if (skillName.startsWith('.')) continue;

        const skillPath = path.join(globalCodexSkillsDir, skillName);
        if (!fs.statSync(skillPath).isDirectory()) continue;

        let codexSkillMdPath = path.join(skillPath, 'SKILL.md');
        if (!fs.existsSync(codexSkillMdPath)) {
          codexSkillMdPath = path.join(skillPath, 'skill.md');
        }

        if (fs.existsSync(codexSkillMdPath)) {
          if (!playbooks.has(skillName)) {
            const content = fs.readFileSync(codexSkillMdPath, 'utf8');
            playbooks.set(skillName, { sourcePath: codexSkillMdPath, content });

            // Auto-import global Codex skill to local workspace folder so they are committed and shared!
            const targetWorkspaceSkillDir = path.join(localSkillsDir, skillName);
            if (!fs.existsSync(targetWorkspaceSkillDir)) {
              fs.mkdirSync(targetWorkspaceSkillDir, { recursive: true });
            }
            fs.writeFileSync(path.join(targetWorkspaceSkillDir, 'skill.md'), content, 'utf8');
            console.error(
              `[Gateway] Dynamic Auto-Import: Global Codex skill "${skillName}" imported into workspace.`,
            );
          }
        }
      }
    }

    // Step 2: Compile & Sync the unified playbooks globally and to .github/
    let consolidatedInstructions = `# Unified Developer Copilot Instructions\n\nGenerated automatically by the Polymath Platform Gateway. Do not edit directly.\n\n`;

    // Prepend root .cursorrules if available
    const cursorRulesPath = path.join(workspaceRoot, '.cursorrules');
    if (fs.existsSync(cursorRulesPath)) {
      consolidatedInstructions += `\n<!-- START SYSTEM RULES (.cursorrules) -->\n\n${fs.readFileSync(cursorRulesPath, 'utf8')}\n\n<!-- END SYSTEM RULES -->\n\n---\n`;
    }

    for (const [skillName, details] of playbooks.entries()) {
      consolidatedInstructions += `\n<!-- START SKILL: ${skillName} -->\n\n${details.content}\n\n<!-- END SKILL: ${skillName} -->\n`;

      // 1. Sync globally to Gemini/Antigravity KIs
      const targetSkillDir = path.join(globalKiDir, skillName);
      const targetArtifactsDir = path.join(targetSkillDir, 'artifacts');

      if (!fs.existsSync(targetSkillDir)) {
        fs.mkdirSync(targetSkillDir, { recursive: true });
      }
      if (!fs.existsSync(targetArtifactsDir)) {
        fs.mkdirSync(targetArtifactsDir, { recursive: true });
      }

      const metadata = {
        title: `${skillName
          .split('-')
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ')} Skill`,
        summary: `Workspace-bounded engineering playbook for ${skillName} integrated into the Polymath Platform.`,
        tags: [skillName, 'sovereign', 'monorepo', 'playbook'],
        updatedAt: new Date().toISOString(),
        references: [
          {
            title: `Workspace Playbook`,
            path: path.join(localSkillsDir, skillName, 'skill.md'),
          },
        ],
      };

      fs.writeFileSync(
        path.join(targetSkillDir, 'metadata.json'),
        JSON.stringify(metadata, null, 2),
        'utf8',
      );

      fs.writeFileSync(path.join(targetArtifactsDir, 'skill.md'), details.content, 'utf8');
      console.error(`[Gateway] Synced skill "${skillName}" globally to Antigravity KIs.`);

      // 2. Sync globally back to Codex skills (if Codex directory exists but this skill is missing)
      if (fs.existsSync(globalCodexSkillsDir)) {
        const targetCodexSkillDir = path.join(globalCodexSkillsDir, skillName);
        if (!fs.existsSync(targetCodexSkillDir)) {
          fs.mkdirSync(targetCodexSkillDir, { recursive: true });
          fs.writeFileSync(path.join(targetCodexSkillDir, 'SKILL.md'), details.content, 'utf8');
          console.error(
            `[Gateway] Dynamic Auto-Export: Synced skill "${skillName}" back to global Codex.`,
          );
        }
      }
    }

    // Write the compiled copilot instructions file in .github/
    const githubDir = path.join(workspaceRoot, '.github');
    if (!fs.existsSync(githubDir)) {
      fs.mkdirSync(githubDir, { recursive: true });
    }
    fs.writeFileSync(
      path.join(githubDir, 'copilot-instructions.md'),
      consolidatedInstructions,
      'utf8',
    );
    console.error(
      `[Gateway] Consolidated all workspace skills into .github/copilot-instructions.md.`,
    );
  }

  private async initializeDownstream() {
    console.error('[Gateway] Initializing Sovereign Downstream Multiplexer...');

    // Auto-sync local skills on boot
    try {
      await this.syncWorkspaceSkillsToAntigravity();
    } catch (e: any) {
      console.error('[Gateway] Skills Sync Warning:', e.message);
    }

    const servers = [
      {
        name: 'sequential-thinking',
        envKey: 'EXPO_TOKEN', // sequential thinking doesn't need specific tokens but we want it always active
        alwaysRun: true,
        command: 'node',
        args: [
          path.join(__dirname, '..', '..', '..', 'scripts', 'mcp-proxy.mjs'),
          'node',
          path.join(
            __dirname,
            '..',
            'node_modules',
            '@modelcontextprotocol',
            'server-sequential-thinking',
            'dist',
            'index.js',
          ),
        ],
      },
      {
        name: 'jscpd',
        envKey: 'EXPO_TOKEN',
        alwaysRun: true,
        command: 'node',
        args: [
          // jscpd is a root devDependency — resolve from monorepo root
          path.join(__dirname, '..', '..', '..', 'node_modules', 'jscpd', 'run-jscpd.js'),
          '--mcp',
          '--directory',
          'apps/gurudevi-mobile',
        ],
      },
      {
        name: 'github',
        envKey: 'GITHUB_PERSONAL_ACCESS_TOKEN',
        command: 'node',
        args: [
          'C:\\Users\\Naween\\projects\\polymath-platform\\scripts\\mcp-proxy.mjs',
          'pnpm',
          'dlx',
          '@modelcontextprotocol/server-github',
        ],
      },
      {
        name: 'supabase',
        envKey: 'SUPABASE_ACCESS_TOKEN',
        command: 'node',
        args: [
          'C:\\Users\\Naween\\projects\\polymath-platform\\scripts\\mcp-proxy.mjs',
          'node',
          'C:\\Users\\Naween\\projects\\polymath-platform\\node_modules\\@supabase\\mcp-server-supabase\\dist\\transports\\stdio.js',
        ],
      },
      {
        name: 'expo',
        envKey: 'EXPO_TOKEN',
        command: 'node',
        args: [
          path.join(__dirname, '..', '..', '..', 'scripts', 'mcp-proxy.mjs'),
          'node',
          path.join(__dirname, '..', 'node_modules', 'mcp-remote', 'dist', 'proxy.js'),
          'https://mcp.expo.dev/mcp',
        ],
      },
      {
        name: 'growthbook',
        envKey: 'GB_API_KEY',
        command: 'node',
        args: [
          path.join(__dirname, '..', '..', '..', 'scripts', 'mcp-proxy.mjs'),
          'pnpm',
          'dlx',
          '@growthbook/mcp',
        ],
      },
      {
        name: 'context7',
        envKey: 'CONTEXT7_API_KEY',
        command: 'node',
        args: [
          path.join(__dirname, '..', '..', '..', 'scripts', 'mcp-proxy.mjs'),
          'npx',
          '-y',
          '@upstash/context7-mcp',
        ],
      },
      {
        name: 'firecrawl',
        envKey: 'FIRECRAWL_API_KEY',
        command: 'node',
        args: [
          path.join(__dirname, '..', '..', '..', 'scripts', 'mcp-proxy.mjs'),
          'npx',
          '-y',
          '@mendable/firecrawl-mcp-server',
        ],
      },
      {
        name: 'reactnative-solutions',
        envKey: 'NONE', // No API key required
        alwaysRun: true,
        command: 'node',
        args: [
          path.join(__dirname, '..', '..', '..', 'scripts', 'mcp-proxy.mjs'),
          'node',
          path.join(__dirname, '..', 'node_modules', 'mcp-remote', 'dist', 'proxy.js'),
          'https://reactnative.solutions/api/mcp',
        ],
      },
      {
        name: 'cloudflare',
        envKey: 'CLOUDFLARE_API_TOKEN',
        command: 'node',
        args: [
          path.join(__dirname, '..', '..', '..', 'scripts', 'mcp-proxy.mjs'),
          'node',
          path.join(__dirname, '..', 'node_modules', 'mcp-remote', 'dist', 'proxy.js'),
          'https://mcp.cloudflare.com/mcp',
        ],
      },
    ];

    for (const serverConf of servers) {
      const token = process.env[serverConf.envKey];
      if (!token && !serverConf.alwaysRun) {
        console.error(
          `[Gateway] Skipping ${serverConf.name} server (missing ${serverConf.envKey})`,
        );
        continue;
      }

      if (serverConf.name === 'expo' && token) {
        try {
          const checkRes = await fetch('https://mcp.expo.dev/mcp', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              jsonrpc: '2.0',
              id: 1,
              method: 'initialize',
              params: {
                protocolVersion: '2024-11-05',
                capabilities: {},
                clientInfo: { name: 'gateway-probe', version: '1.0.0' },
              },
            }),
          });
          if (checkRes.status === 401) {
            console.error(
              `[Gateway] ⚠️  Warning: The provided EXPO_TOKEN returned 401 Unauthorized. Attempting to launch expo server anyway (it may fall back to cached browser tokens)...`,
            );
          }
        } catch (e: any) {
          console.error(`[Gateway] Expo token validation probe failed:`, e.message);
        }
      }

      try {
        console.error(`[Gateway] Launching downstream client: ${serverConf.name}...`);
        const cleanEnv: Record<string, string> = {};
        for (const [key, value] of Object.entries(process.env)) {
          if (value !== undefined && key !== 'NODE_OPTIONS') {
            cleanEnv[key] = value;
          }
        }
        if (token) {
          cleanEnv[serverConf.envKey] = token;
        }

        // Special handling for Context7 to pass API key via command line
        let finalArgs = serverConf.args;
        if (serverConf.name === 'context7' && token) {
          finalArgs = [...serverConf.args, '--api-key', token];
        }
        // Firecrawl uses environment variable for API key (already set in cleanEnv)

        const transport = new StdioClientTransport({
          command: serverConf.command,
          args: finalArgs,
          env: cleanEnv,
        });

        const client = new Client(
          { name: `gateway-${serverConf.name}-client`, version: '1.0.0' },
          { capabilities: {} },
        );

        await client.connect(transport);
        const toolsResult = await client.listTools();
        const toolsList = toolsResult.tools || [];

        this.downstreamClients.set(serverConf.name, {
          client,
          tools: toolsList,
        });

        console.error(
          `[Gateway] Successfully bonded downstream server: ${serverConf.name} exposing ${toolsList.length} tools`,
        );

        // Register downstream tools with the gateway server
        for (const tool of toolsList) {
          const toolName = `${serverConf.name}_${tool.name}`;
          this.server.registerTool(toolName, {
            description: `[${serverConf.name}] ${tool.description || ''}`,
            inputSchema: z.object({}).passthrough() // Accept any input structure
          }, async (args: any) => {
            try {
              const downstreamClient = this.downstreamClients.get(serverConf.name);
              if (!downstreamClient) {
                throw new Error(`Downstream client ${serverConf.name} not available`);
              }
              
              const result = await downstreamClient.client.callTool({
                name: tool.name,
                arguments: args
              });
              
              return result;
            } catch (error: any) {
              return {
                content: [{ type: 'text', text: `Error calling ${toolName}: ${error.message}` }],
                isError: true,
              };
            }
          });
        }
        
        console.error(`[Gateway] Registered ${toolsList.length} tools from ${serverConf.name} as gateway tools`);
      } catch (err: any) {
        console.error(
          `[Gateway] Failed to bind downstream server ${serverConf.name}:`,
          err.message,
        );
      }
    }
  }

  private registerPlatformTool<T extends z.ZodObject<any>>(
    name: string,
    description: string,
    schema: T,
    handler: (args: z.infer<T>) => Promise<any>
  ) {
    const mcpMode = process.env.MCP_MODE || 'GATEWAY';
    const gatewayTools = [
      'sovereign_audit',
      'sovereign_discovery',
      'sovereign_maintenance',
      'sovereign_guide',
      'help',
      'info',
      'sync_workspace_skills',
    ];
    const leanTools = [
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

    let shouldRegister = false;
    if (mcpMode === 'GATEWAY') {
      shouldRegister = gatewayTools.includes(name);
    } else if (mcpMode === 'LEAN') {
      shouldRegister = leanTools.includes(name);
    } else {
      shouldRegister = true;
    }

    if (shouldRegister) {
      this.server.registerTool(name, {
        description,
        inputSchema: schema.shape
      }, async (args: any) => {
        try {
          return await handler(args);
        } catch (error: any) {
          return {
            content: [{ type: 'text', text: `Error: ${error.message}` }],
            isError: true,
          };
        }
      });
    }
  }

  private setupHandlers() {
    // --- Custom Tools ---
    this.registerPlatformTool(
      'sync_workspace_skills',
      'Surgically syncs active repo-level agent skills into global Antigravity Knowledge Items (KIs) dynamically.',
      z.object({}),
      async () => {
        await this.syncWorkspaceSkillsToAntigravity();
        return {
          content: [
            {
              type: 'text',
              text: 'Successfully synced workspace skills to global Antigravity Knowledge Items (KIs)!',
            },
          ],
        };
      }
    );

    // --- GATEWAY ROUTING ---
    this.registerPlatformTool(
      'sovereign_audit',
      'Unified auditing engine for hygiene, architecture, and compliance.',
      z.object({
        action: z.enum([
          'hygiene', 'legacy_ui', 'architecture', 'a11y', 'dependency_health',
          'taze', 'i18n', 'colors', 'boundaries', 'features', 'exports',
          'design_tokens', 'stale_flags', 'load_report', 'bundle_leak', 'lint',
          'biome_lint', 'check', 'syncpack_fix', 'types', 'hooks', 'deprecations',
          'memory_sinks', 'cognitive_load', 'push_audit'
        ]),
        params: z.record(z.string(), z.any()).optional()
      }),
      async ({ action, params = {} }) => {
        switch (action) {
          case 'hygiene':
            return this.audit.handleAuditHygiene();
          case 'legacy_ui':
            return this.audit.handleAuditLegacyUI(params as any);
          case 'architecture':
            return this.audit.handleAuditPackageArchitecture(params as any);
          case 'a11y':
            return this.audit.handleAuditA11y(params as any);
          case 'dependency_health':
            return this.maintenance.handleAuditDependencyHealth();
          case 'taze':
            return this.maintenance.handleTazeAudit(params as any);
          case 'i18n':
            return this.audit.handleAuditI18n();
          case 'colors':
            return this.audit.handleCheckContrast(params as any);
          case 'boundaries':
            return this.audit.handleCheckClassroomBoundaries();
          case 'features':
            return this.audit.handleAuditFeatureFidelity(params as any);
          case 'exports':
            return this.audit.handleAuditExportIntegrity();
          case 'design_tokens':
            return this.audit.handleAuditColors();
          case 'stale_flags':
            return this.audit.handleAuditFeatureFlags();
          case 'load_report':
            return this.audit.handleReportCognitiveLoad(params as any);
          case 'bundle_leak':
            return this.audit.handleAuditBundleLeak();
          case 'lint':
            return this.audit.handleLintPackage(params as any);
          case 'biome_lint':
            return this.audit.handleBiomeLint(params as any);
          case 'check':
            return this.audit.handleBiomeCheck(params as any);
          case 'syncpack_fix':
            return this.audit.handleSyncpackFix();
          case 'types':
            return this.audit.handleCheckTypes(params as any);
          case 'hooks':
            return this.audit.handleAuditHookViolations(params as any);
          case 'deprecations':
            return this.audit.handleAuditDeprecations(params as any);
          case 'memory_sinks':
            return this.audit.handleCheckMemorySinks();
          case 'cognitive_load':
            return this.audit.handleReportCognitiveLoad(params as any);
          case 'push_audit':
            return this.audit.handlePushAudit();
          default:
            throw new Error(`Unknown audit action: ${action}`);
        }
      }
    );

    this.registerPlatformTool(
      'sovereign_discovery',
      'Unified discovery engine for search, scouting, and intel.',
      z.object({
        action: z.enum([
          'grep', 'scout', 'docs', 'inventory', 'view', 'find', 'lens',
          'simulate', 'structural', 'stats', 'component_api', 'imports',
          'ui_report', 'native_leaks', 'metro_debug', 'impact', 'jina',
          'spellcheck', 'disk_usage'
        ]),
        params: z.record(z.string(), z.any()).optional()
      }),
      async ({ action, params = {} }) => {
        switch (action) {
          case 'grep':
            return this.discovery.handleGrepCode(params as any);
          case 'scout':
            return this.scout.handleSovereignScout(params as any);
          case 'docs':
            return this.discovery.handleSearchDocs(params as any);
          case 'inventory':
            return this.discovery.handleGetInventory(params as any);
          case 'view':
            return this.discovery.handleShinyView(params as any);
          case 'find':
            return this.discovery.handleShinyFind(params as any);
          case 'lens':
            return this.discovery.handleGetLens(params as any);
          case 'simulate':
            return this.discovery.handleSimulateImpact(params as any);
          case 'structural':
            return this.discovery.handleStructuralSearch(params as any);
          case 'stats':
            return this.discovery.handleGetCodeStats(params as any);
          case 'component_api':
            return this.discovery.handleGetComponentApi(params as any);
          case 'imports':
            return this.discovery.handleAuditImports();
          case 'ui_report':
            return this.discovery.handleAuditUIComponents();
          case 'native_leaks':
            return this.discovery.handleFindNativeLeaks();
          case 'metro_debug':
            return this.discovery.handleDebugMetro();
          case 'impact':
            return this.discovery.handleTraceDeletionImpact(params as any);
          case 'jina':
            return this.discovery.handleJinaReader(params as any);
          case 'spellcheck':
            return this.discovery.handleCheckSpelling(params as any);
          case 'disk_usage':
            return this.discovery.handleDiskUsage(params as any);
          default:
            throw new Error(`Unknown discovery action: ${action}`);
        }
      }
    );

    this.registerPlatformTool(
      'sovereign_maintenance',
      'Unified maintenance engine for healing, refactoring, and synchronization.',
      z.object({
        action: z.enum([
          'heal', 'sync', 'checkpoint', 'refactor', 'normalize', 'inputs',
          'scaffold', 'lint_fix', 'heal_architecture', 'zod_bridge',
          'sleekness_test', 'readme_usage', 'scaffold_mocks', 'shield_unicode',
          'dep_duplicate', 'schema_drift', 'purge', 'runbyte_config', 'push'
        ]),
        params: z.record(z.string(), z.any()).optional()
      }),
      async ({ action, params = {} }) => {
        switch (action) {
          case 'heal':
            return this.maintenance.handleHealCodebase(params as any);
          case 'sync':
            return this.maintenance.handleSyncIdentity();
          case 'checkpoint':
            return this.maintenance.handleCreateCheckpoint(params as any);
          case 'refactor':
            return this.maintenance.handleRefactorReplace(params as any);
          case 'normalize':
            return this.maintenance.handleNormalizeImports(params as any);
          case 'heal_architecture':
            return this.maintenance.handleHealArchitecture(params as any);
          case 'lint_fix':
            return this.maintenance.handleLintFix(params as any);
          case 'inputs':
            return this.maintenance.handleNormalizeInputs(params as any);
          case 'scaffold':
            return this.discovery.handleScaffoldFeatureContext(params as any);
          case 'zod_bridge':
            return this.maintenance.handleBridgeSchemaZod(params as any);
          case 'sleekness_test':
            return this.maintenance.handleTestSleekness();
          case 'readme_usage':
            return this.maintenance.handleGenerateReadmeUsage(params as any);
          case 'scaffold_mocks':
            return this.maintenance.handleScaffoldMocks(params as any);
          case 'shield_unicode':
            return this.maintenance.handleShieldUnicode(params as any);
          case 'dep_duplicate':
            return this.maintenance.handleAuditDependencyDuplication();
          case 'schema_drift':
            return this.maintenance.handleCheckSchemaDrift();
          case 'purge':
            return this.maintenance.handlePurgeStaleArtifacts(params as any);
          case 'runbyte_config':
            return this.maintenance.handleGenerateRunbyteConfig(params as any);
          case 'push':
            return this.maintenance.handleSovereignPush();
          default:
            throw new Error(`Unknown maintenance action: ${action}`);
        }
      }
    );

    this.registerPlatformTool(
      'sovereign_guide',
      'Help, architecture documentation, and tool inventory for the Polymath MCP.',
      z.object({
        action: z.enum([
          'architecture', 'inventory', 'philosophy', 'soul', 'mistakes',
          'refusal', 'recent_evolutions', 'runbyte'
        ])
      }),
      async ({ action }) => {
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
    );

    this.registerPlatformTool(
      'help',
      'Get help and overview of all available Polymath MCP tools and gateways.',
      z.object({}),
      async () => {
        return this.help.handleGetHelpOverview();
      }
    );

    this.registerPlatformTool(
      'info',
      'Get architectural information and philosophy of the Polymath Platform.',
      z.object({}),
      async () => {
        return this.help.handleGetArchitectureDoc();
      }
    );

    // --- LEGACY MODES (Retained for migration/full options) ---
    this.registerPlatformTool(
      'audit_monorepo_hygiene',
      'Runs corporate-scale hygiene checks (circular deps, unused code, boundary violations).',
      z.object({}),
      async () => {
        return this.audit.handleAuditHygiene();
      }
    );

    this.registerPlatformTool(
      'heal_codebase',
      'Surgically repairs JSX/TS syntax corruption.',
      z.object({
        files: z.array(z.string()).describe('File paths to heal.')
      }),
      async (args) => {
        return this.maintenance.handleHealCodebase(args as any);
      }
    );

    this.registerPlatformTool(
      'sync_identity_schema',
      'Aligns DB faceted profiles with identity schemas.',
      z.object({}),
      async () => {
        return this.maintenance.handleSyncIdentity();
      }
    );

    this.registerPlatformTool(
      'check_package_types',
      'Runs tsc audits for specific packages or monorepo root.',
      z.object({
        package: z.string().optional().describe("Package name (e.g., '@repo/ui').")
      }),
      async (args) => {
        return this.audit.handleCheckTypes(args as any);
      }
    );

    this.registerPlatformTool(
      'grep_code',
      'Global structural code search with smart filtering. Powered by ripgrep (rg).',
      z.object({
        query: z.string().describe('Search term or pattern.'),
        target: z.string().optional().describe('Target directory or package alias (e.g. @repo/ui).'),
        context: z.number().optional().describe('Number of context lines (before/after) to show. Default 0.'),
        fileType: z.string().optional().describe('Filter by file type (e.g. ts, tsx, css, md).'),
        isRegex: z.boolean().optional().describe('Treat query as a regular expression.'),
        include: z.string().optional().describe('Glob pattern for files to include.'),
        includeNodeModules: z.boolean().optional().describe('Search inside node_modules (default false).'),
        summaryOnly: z.boolean().optional().describe('Return only file counts instead of full results.'),
        richText: z.boolean().optional().describe('Output with enhanced formatting if possible.')
      }),
      async (args) => {
        return this.discovery.handleGrepCode(args as any);
      }
    );

    this.registerPlatformTool(
      'sovereign_scout',
      'Orchestrated discovery intelligence. Combines file scouts, doc mining, and codebase heatmap.',
      z.object({
        query: z.string().describe('Search term or feature keyword.'),
        target: z.string().optional().describe('Target directory or package alias.')
      }),
      async (args) => {
        return this.scout.handleSovereignScout(args as any);
      }
    );

    this.registerPlatformTool(
      'search_docs',
      'Targeted documentation and architectural guide discovery.',
      z.object({
        query: z.string(),
        target: z.string().optional(),
        includeNodeModules: z.boolean().optional(),
        summaryOnly: z.boolean().optional(),
        hybrid: z.boolean().optional()
      }),
      async (args) => {
        return this.discovery.handleSearchDocs(args as any);
      }
    );

    this.registerPlatformTool(
      'create_checkpoint',
      'Atomically stages and commits changes with a smart ledger.',
      z.object({
        message: z.string(),
        stage_all: z.boolean().optional()
      }),
      async (args) => {
        return this.maintenance.handleCreateCheckpoint(args as any);
      }
    );

    this.registerPlatformTool(
      'normalize_imports',
      'Converts relative imports to workspace aliases.',
      z.object({
        target: z.string().optional()
      }),
      async (args) => {
        return this.maintenance.handleNormalizeImports(args as any);
      }
    );

    this.registerPlatformTool(
      'normalize_inputs',
      'Plumbing: Resolves package aliases to absolute filesystem paths.',
      z.object({
        target: z.string()
      }),
      async (args) => {
        return this.maintenance.handleNormalizeInputs(args as any);
      }
    );

    this.registerPlatformTool(
      'audit_dependency_health',
      'Combined report of dependency health and SDK compatibility.',
      z.object({}),
      async () => {
        return this.maintenance.handleAuditDependencyHealth();
      }
    );

    this.registerPlatformTool(
      'audit_accessibility',
      'Targeted a11y linting and ARIA violation checks.',
      z.object({
        target: z.string().optional()
      }),
      async (args) => {
        return this.audit.handleAuditA11y(args as any);
      }
    );

    this.registerPlatformTool(
      'check_contrast',
      'WCAG/APCA contrast ratio calculation.',
      z.object({
        fg: z.string(),
        bg: z.string()
      }),
      async (args) => {
        return this.audit.handleCheckContrast(args as any);
      }
    );

    this.registerPlatformTool(
      'lint_package',
      'High-speed Biome linting for packages.',
      z.object({
        target: z.string().optional()
      }),
      async (args) => {
        return this.audit.handleLintPackage(args as any);
      }
    );

    this.registerPlatformTool(
      'get_component_api',
      'Extracts props/API docs for a React component.',
      z.object({
        name: z.string()
      }),
      async (args) => {
        return this.discovery.handleGetComponentApi(args as any);
      }
    );

    this.registerPlatformTool(
      'audit_legacy_ui',
      'High-speed audit for legacy Gluestack/RN components. Powered by ripgrep.',
      z.object({
        target: z.string().optional().describe('Directory to audit (defaults to packages).')
      }),
      async (args) => {
        return this.audit.handleAuditLegacyUI(args as any);
      }
    );

    this.registerPlatformTool(
      'audit_package_architecture',
      'Ensures platform agnosticism and boundary integrity.',
      z.object({
        target: z.string()
      }),
      async (args) => {
        return this.audit.handleAuditPackageArchitecture(args as any);
      }
    );

    this.registerPlatformTool(
      'get_inventory',
      'Monorepo file/package inventory discovery. Powered by eza.',
      z.object({
        target: z.string().optional(),
        depth: z.number().optional(),
        format: z.enum(['markdown', 'text']).optional(),
        verbose: z.boolean().optional()
      }),
      async (args) => {
        return this.discovery.handleGetInventory(args as any);
      }
    );

    this.registerPlatformTool(
      'shiny_view',
      'Enhanced file viewer with syntax highlighting and Git integration. Powered by bat.',
      z.object({
        path: z.string().describe('Path to the file.'),
        range: z.string().optional().describe('Line range (e.g. "10:40").')
      }),
      async (args) => {
        return this.discovery.handleShinyView(args as any);
      }
    );

    this.registerPlatformTool(
      'shiny_find',
      'Ultra-fast filename search. Powered by fd.',
      z.object({
        query: z.string().describe('Search pattern.'),
        target: z.string().optional().describe('Target directory.')
      }),
      async (args) => {
        return this.discovery.handleShinyFind(args as any);
      }
    );

    this.registerPlatformTool(
      'structural_search',
      'GritQL semantic pattern matching.',
      z.object({
        query: z.string().describe('GritQL or structural pattern.'),
        target: z.string().optional().describe('Target directory or package alias.'),
        include: z.string().optional().describe('Glob pattern for files to include.')
      }),
      async (args) => {
        return this.discovery.handleStructuralSearch(args as any);
      }
    );

    this.registerPlatformTool(
      'audit_colors',
      'Contrast audit across design phases.',
      z.object({}),
      async () => {
        return this.audit.handleAuditColors();
      }
    );

    this.registerPlatformTool(
      'test_sleekness',
      'Smoke test for native leakage in core logic.',
      z.object({}),
      async () => {
        return this.maintenance.handleTestSleekness();
      }
    );

    this.registerPlatformTool(
      'generate_growth_signals',
      'Growth signal schema synchronization.',
      z.object({}),
      async () => {
        return this.maintenance.handleGenerateGrowthSignals();
      }
    );

    this.registerPlatformTool(
      'bridge_schema_zod',
      'Generates Zod validation schemas from any Sovereign JSON Schema.',
      z.object({
        input: z.string().describe('Path to input .json schema'),
        output: z.string().describe('Path to output .ts Zod file')
      }),
      async (args) => {
        return this.maintenance.handleBridgeSchemaZod(args as any);
      }
    );

    this.registerPlatformTool(
      'audit_imports',
      'Dependency leak detection.',
      z.object({}),
      async () => {
        return this.discovery.handleAuditImports();
      }
    );

    this.registerPlatformTool(
      'check_classroom_boundaries',
      'Classroom boundary enforcement.',
      z.object({}),
      async () => {
        return this.audit.handleCheckClassroomBoundaries();
      }
    );

    this.registerPlatformTool(
      'check_self_boundaries',
      'Self boundary enforcement.',
      z.object({}),
      async () => {
        return this.audit.handleCheckSelfBoundaries();
      }
    );

    this.registerPlatformTool(
      'generate_readme_usage',
      'Generates Usage sections in package READMEs from JSDocs.',
      z.object({
        package_path: z.string()
      }),
      async (args) => {
        return this.maintenance.handleGenerateReadmeUsage(args as any);
      }
    );

    this.registerPlatformTool(
      'detect_stale_feature_flags',
      'Audits feature and catalog lifecycle contracts.',
      z.object({}),
      async () => {
        return this.audit.handleAuditFeatureFlags();
      }
    );

    this.registerPlatformTool(
      'scaffold_mocks',
      'Generates a Vitest mock scaffold based on file imports.',
      z.object({
        file_path: z.string()
      }),
      async (args) => {
        return this.maintenance.handleScaffoldMocks(args as any);
      }
    );

    this.registerPlatformTool(
      'report_cognitive_load',
      "Reports high cognitive load 'God Files' in the codebase.",
      z.object({
        target: z.string().optional()
      }),
      async (args) => {
        return this.audit.handleReportCognitiveLoad(args as any);
      }
    );

    this.registerPlatformTool(
      'audit_ui_components',
      'Full component API documentation generation for @repo/ui.',
      z.object({}),
      async () => {
        return this.discovery.handleAuditUIComponents();
      }
    );

    this.registerPlatformTool(
      'audit_i18n',
      'Audits i18n key coverage and fallback policy compliance.',
      z.object({}),
      async () => {
        return this.audit.handleAuditI18n();
      }
    );

    this.registerPlatformTool(
      'find_native_leaks',
      'Detects leak of React Native primitives into web-only shells.',
      z.object({}),
      async () => {
        return this.discovery.handleFindNativeLeaks();
      }
    );

    this.registerPlatformTool(
      'shield_unicode',
      'Protects against encoding corruption by escaping non-ASCII characters.',
      z.object({
        target: z.string().optional()
      }),
      async (args) => {
        return this.maintenance.handleShieldUnicode(args as any);
      }
    );

    this.registerPlatformTool(
      'audit_dependency_duplication',
      'Detects version mismatches and high-frequency duplicates across the monorepo.',
      z.object({}),
      async () => {
        return this.maintenance.handleAuditDependencyDuplication();
      }
    );

    this.registerPlatformTool(
      'debug_metro',
      'Debugs Metro bundler ID resolution for native platforms.',
      z.object({}),
      async () => {
        return this.discovery.handleDebugMetro();
      }
    );

    this.registerPlatformTool(
      'scaffold_feature_context',
      'Scouts existing schemas, components, and events related to a feature keyword.',
      z.object({
        keyword: z.string()
      }),
      async (args) => {
        return this.discovery.handleScaffoldFeatureContext(args as any);
      }
    );

    this.registerPlatformTool(
      'audit_export_integrity',
      'Analyzes package barrel exports and flags deep-import violations.',
      z.object({}),
      async () => {
        return this.audit.handleAuditExportIntegrity();
      }
    );

    this.registerPlatformTool(
      'trace_deletion_impact',
      'Traces the recursive impact of deleting a symbol across the monorepo.',
      z.object({
        symbol: z.string()
      }),
      async (args) => {
        return this.discovery.handleTraceDeletionImpact(args as any);
      }
    );

    this.registerPlatformTool(
      'check_schema_drift',
      'Detects alignment drift between Database ZModel and Core Logic models.',
      z.object({}),
      async () => {
        return this.maintenance.handleCheckSchemaDrift();
      }
    );

    this.registerPlatformTool(
      'audit_bundle_leak',
      'Detects heavy library leakage into sleek logic packages.',
      z.object({}),
      async () => {
        return this.audit.handleAuditBundleLeak();
      }
    );

    this.registerPlatformTool(
      'audit_feature_fidelity',
      'Audits the gap between documentation promises and actual implementation.',
      z.object({
        includeArchives: z.boolean().optional()
      }),
      async (args) => {
        return this.audit.handleAuditFeatureFidelity(args as any);
      }
    );

    this.registerPlatformTool(
      'purge_stale_artifacts',
      'Removes old reports, logs, and temporary files.',
      z.object({
        ageDays: z.number().optional(),
        dryRun: z.boolean().optional()
      }),
      async (args) => {
        return this.maintenance.handlePurgeStaleArtifacts(args as any);
      }
    );

    this.registerPlatformTool(
      'shiny_stats',
      'Code statistics by language.',
      z.object({
        target: z.string().optional()
      }),
      async (args) => {
        return this.discovery.handleGetCodeStats(args as any);
      }
    );

    this.registerPlatformTool(
      'shiny_spellcheck',
      'Ultra-fast source code spell checker.',
      z.object({
        target: z.string().optional()
      }),
      async (args) => {
        return this.discovery.handleCheckSpelling(args as any);
      }
    );

    this.registerPlatformTool(
      'shiny_disk_usage',
      'Visualizes directory size and disk usage.',
      z.object({
        target: z.string().optional(),
        depth: z.number().optional()
      }),
      async (args) => {
        return this.discovery.handleDiskUsage(args as any);
      }
    );

    this.registerPlatformTool(
      'shiny_refactor',
      'Intuitive and fast project-wide find and replace.',
      z.object({
        find: z.string(),
        replace: z.string(),
        target: z.string().optional()
      }),
      async (args) => {
        return this.maintenance.handleRefactorReplace(args as any);
      }
    );

    this.registerPlatformTool(
      'map_architecture',
      'Performs full architecture analysis and identifies misalignments.',
      z.object({
        target: z.string().optional()
      }),
      async (args) => {
        return this.discovery.handleGetLens({
          type: 'debt',
          ...args,
        } as any);
      }
    );
  }

  async run() {
    const transport = new StdioServerTransport();
    // Restore stdout write right before connecting the JSON-RPC channel
    process.stdout.write = originalStdoutWrite;
    await this.server.connect(transport);
    console.error('Polymath Master MCP Server (Modular) running on stdio');

    // Initialize downstream in the background so it doesn't block startup
    this.initializeDownstream().catch((err) => {
      console.error('[Gateway] Background downstream initialization failed:', err);
    });

    const cleanup = async () => {
      console.error('[Gateway] Shutting down, cleaning up downstream servers...');
      const closePromises: Promise<void>[] = [];
      for (const [name, details] of this.downstreamClients.entries()) {
        closePromises.push(
          details.client.close().catch((err: any) => {
            console.error(`[Gateway] Error closing downstream ${name}:`, err.message);
          }),
        );
      }
      try {
        await Promise.all(closePromises);
      } catch {
        // Suppress and guarantee exit
      } finally {
        process.exit(0);
      }
    };

    process.on('SIGINT', () => {
      cleanup().catch((err) => {
        console.error('[Gateway] Shutdown error:', err.message);
      });
    });
    process.on('SIGTERM', () => {
      cleanup().catch((err) => {
        console.error('[Gateway] Shutdown error:', err.message);
      });
    });
  }
}

const server = new PolymathPlatformServer();
server.run().catch(console.error);
