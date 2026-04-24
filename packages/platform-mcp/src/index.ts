import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import * as dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";
import fs from "fs";

// --- Alchemist's Setup: Environment Sovereignty ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, "..", "..", "..");

dotenv.config({ path: path.join(__dirname, "..", ".env") });

/**
 * The Polymath Platform MCP Server - MASTER VERSION
 * The Sovereign Engineering Control Plane
 */
class PolymathPlatformServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: "polymath-platform-mcp",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
    this.server.onerror = (error) => console.error("[MCP Error]", error);
  }

  private setupHandlers() {
    // 1. Tool Listing: The Sovereign Capabilities
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: "audit_monorepo_hygiene",
          description: "Runs the unified hygiene check (circular imports, unused code, boundary violations).",
          inputSchema: { type: "object", properties: {} },
        },
        {
          name: "heal_codebase",
          description: "Performs surgical repair on corrupted JSX or TypeScript types.",
          inputSchema: {
            type: "object",
            properties: {
              files: {
                type: "array",
                items: { type: "string" },
                description: "Array of absolute or relative file paths to heal."
              }
            },
            required: ["files"]
          },
        },
        {
          name: "sync_identity_schema",
          description: "Verifies the alignment between Database faceted profiles and identity schemas.",
          inputSchema: { type: "object", properties: {} },
        },
        {
          name: "check_package_types",
          description: "Runs TypeScript type checks for specific packages or the entire monorepo.",
          inputSchema: {
            type: "object",
            properties: {
              package: {
                type: "string",
                description: "The package name (filter) to check (e.g., '@repo/ui'). If omitted, checks all packages."
              }
            }
          }
        },
        {
          name: "create_checkpoint",
          description: "Stages changes and creates a git commit with a categorized ledger, bypassing pre-commit hooks (--no-verify).",
          inputSchema: {
            type: "object",
            properties: {
              message: {
                type: "string",
                description: "The commit message summarising the checkpoint."
              },
              stage_all: {
                type: "boolean",
                description: "Whether to stage all changes (git add .). Defaults to true."
              }
            },
            required: ["message"]
          },
        },
        {
          name: "normalize_imports",
          description: "Normalizes relative imports to workspace aliases (@repo/*).",
          inputSchema: {
            type: "object",
            properties: {
              target: {
                type: "string",
                description: "Target directory or file to normalize. Defaults to root."
              }
            }
          }
        },
        {
          name: "audit_dependency_health",
          description: "Runs a combined report of pnpm outdated vs. Expo SDK compatibility.",
          inputSchema: { type: "object", properties: {} },
        }
      ],
    }));

    // 2. Tool Invocation: The Execution Engine
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case "audit_monorepo_hygiene":
            return this.handleAuditHygiene();
          case "heal_codebase":
            return this.handleHealCodebase(args as { files: string[] });
          case "sync_identity_schema":
            return this.handleSyncIdentity();
          case "check_package_types":
            return this.handleCheckTypes(args as { package?: string });
          case "create_checkpoint":
            return this.handleCreateCheckpoint(args as { message: string, stage_all?: boolean });
          case "normalize_imports":
            return this.handleNormalizeImports(args as { target?: string });
          case "audit_dependency_health":
            return this.handleAuditDependencyHealth();
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error: any) {
        return {
          content: [{ type: "text", text: `Error: ${error.message}` }],
          isError: true,
        };
      }
    });
  }

  private handleCreateCheckpoint(args: { message: string, stage_all?: boolean }) {
    console.error(`Creating checkpoint: ${args.message}`);
    const stageAll = args.stage_all !== false;
    const tempMsgPath = path.join(ROOT_DIR, ".checkpoint_msg.txt");

    try {
      // 1. Stage changes
      if (stageAll) {
        execSync("git add .", { cwd: ROOT_DIR });
      }

      // 2. Verify we have something to commit
      const staged = execSync("git diff --cached --name-only", { cwd: ROOT_DIR }).toString().trim();
      if (!staged) {
        return { content: [{ type: "text", text: "Nothing to commit. Checkpoint aborted." }] };
      }

      // 3. New: Generate Smart Changeset for internal package versioning
      try {
        console.error("Generating Smart Changeset...");
        execSync(`node scripts/smart-changeset.mjs --staged "${args.message.replace(/"/g, '\\"')}"`, { cwd: ROOT_DIR });
        // Re-stage the new changeset file
        execSync("git add .changeset/*.md", { cwd: ROOT_DIR });
      } catch (changesetError) {
        console.error("Smart Changeset failed (likely no package changes), continuing...");
      }

      // 4. Prepare message with Ledger
      fs.writeFileSync(tempMsgPath, args.message, "utf-8");
      
      try {
        // Run the ledger script (Silent Fail-Safe)
        execSync(`powershell -ExecutionPolicy Bypass -File scripts/commit-ledger.ps1 -CommitMsgFile "${tempMsgPath}"`, { cwd: ROOT_DIR });
      } catch (ledgerError) {
        console.error("Ledger script failed, continuing with raw message.");
      }

      // 4. Commit with no-verify
      const output = execSync(`git commit -F "${tempMsgPath}" --no-verify`, { cwd: ROOT_DIR }).toString();
      
      // Cleanup
      if (fs.existsSync(tempMsgPath)) fs.unlinkSync(tempMsgPath);

      return {
        content: [{ type: "text", text: `Checkpoint created successfully!\n\n${output}` }]
      };
    } catch (error: any) {
      if (fs.existsSync(tempMsgPath)) fs.unlinkSync(tempMsgPath);
      return {
        content: [{ type: "text", text: `Failed to create checkpoint: ${error.message}` }],
        isError: true
      };
    }
  }

  private handleAuditHygiene() {
    console.error("Running Hygiene Audit...");
    try {
      execSync("powershell -ExecutionPolicy Bypass -File scripts/check-hygiene.ps1", { cwd: ROOT_DIR });
    } catch (e) {
      console.error("Hygiene script reported errors (expected result).");
    }
    
    // Read reports
    const circular = this.readReport("circular_deps.txt");
    const unused = this.readReport("unused_code.txt");
    const architecture = this.readReport("architecture.txt");

    return {
      content: [{
        type: "text",
        text: JSON.stringify({ circular, unused, architecture }, null, 2)
      }]
    };
  }

  private handleNormalizeImports(args: { target?: string }) {
    const target = args.target || ".";
    console.error(`Normalizing imports in: ${target}`);
    const output = execSync(`powershell -ExecutionPolicy Bypass -File scripts/normalize-imports.ps1 -Target "${target}"`, { cwd: ROOT_DIR }).toString();
    return {
      content: [{ type: "text", text: output }]
    };
  }

  private handleAuditDependencyHealth() {
    console.error("Running Dependency Health Audit...");
    const output = execSync("powershell -ExecutionPolicy Bypass -File scripts/audit-dependency-health.ps1", { cwd: ROOT_DIR }).toString();
    return {
      content: [{ type: "text", text: output }]
    };
  }

  private handleHealCodebase(args: { files: string[] }) {
    console.error(`Healing files: ${args.files.join(", ")}`);
    const fileList = args.files.map(f => `"${f}"`).join(" ");
    const output = execSync(`powershell -ExecutionPolicy Bypass -File scripts/heal-codebase.ps1 ${fileList}`, { cwd: ROOT_DIR }).toString();
    
    return {
      content: [{ type: "text", text: output }]
    };
  }

  private handleSyncIdentity() {
    console.error("Syncing Identity Schema...");
    const output = execSync("node scripts/check-identity-alignment.mjs", { cwd: ROOT_DIR }).toString();
    return {
      content: [{ type: "text", text: output }]
    };
  }

  private handleCommitLedger() {
    console.error("Generating Commit Ledger...");
    const output = execSync("powershell -ExecutionPolicy Bypass -File scripts/commit-ledger.ps1", { cwd: ROOT_DIR }).toString();
    return {
      content: [{ type: "text", text: output }]
    };
  }

  private handleCheckTypes(args: { package?: string }) {
    // 1. ARGUMENT NORMALIZATION (AI-Proofing)
    const rawTarget = args.package || "";
    const cleanTarget = rawTarget.replace(/^@repo\/|^@app\/|^\/|^\.\\|^.\//, "");
    
    console.error(`Checking types for: ${cleanTarget || "all packages"}...`);
    
    if (cleanTarget) {
      // 2. ROOT CLEANUP (Enforcing Order)
      // Delete any "Agent Slip-up" reports in the root to ensure we don't serve stale data.
      const rootSummary = path.join(ROOT_DIR, `audit-${cleanTarget}-summary.txt`);
      if (fs.existsSync(rootSummary)) fs.unlinkSync(rootSummary);

      const psCmd = `powershell -ExecutionPolicy Bypass -File scripts/audit-errors.ps1 -Target "${cleanTarget}" -LocalOnly`;
      
      try {
        const output = execSync(psCmd, { cwd: ROOT_DIR }).toString();
        const summaryName = `audit-${cleanTarget}-summary.txt`;
        const summary = this.findSurgicalReport(summaryName, cleanTarget);
        
        return {
          content: [
            { type: "text", text: output },
            { type: "text", text: `--- Surgical Analysis Summary ---\n${summary}` }
          ]
        };
      } catch (e: any) {
        const summaryName = `audit-${cleanTarget}-summary.txt`;
        const summary = this.findSurgicalReport(summaryName, cleanTarget);

        return {
          content: [
            { type: "text", text: `Type check command reported errors (expected).\n${e.message}` },
            { type: "text", text: `--- Partial Analysis Summary (If found) ---\n${summary}` }
          ],
          isError: true
        };
      }
    } else {
      // General monorepo check
      const psCmd = `powershell -ExecutionPolicy Bypass -File scripts/audit-wrapper.ps1 -Cmd "pnpm turbo run check-types" -Log "reports/check-types.txt"`;
      
      try {
        const output = execSync(psCmd, { cwd: ROOT_DIR }).toString();
        const report = this.readReport("check-types.txt");
        return { content: [{ type: "text", text: output }, { type: "text", text: report }] };
      } catch (e: any) {
        const report = this.readReport("check-types.txt");
        return { content: [{ type: "text", text: e.message }, { type: "text", text: report }], isError: true };
      }
    }
  }

  /**
   * The "Hunter" Logic: Scouts for the report in ordered and unordered locations.
   */
  private findSurgicalReport(filename: string, packageShortName: string): string {
    const candidates = [
      path.join(ROOT_DIR, "reports", filename),          // 1. Global reports (ORDERED - PRIMARY)
      path.join(ROOT_DIR, "packages", packageShortName, filename), // 2. Package root
      path.join(ROOT_DIR, filename),                     // 3. Root (LURKING/STALE - FALLBACK)
      path.join(ROOT_DIR, "packages", packageShortName, "reports", filename), // Package reports
      path.join(ROOT_DIR, "apps", packageShortName, filename),     // App root
      path.join(ROOT_DIR, "apps", packageShortName, "reports", filename), // App reports
    ];

    for (const p of candidates) {
      if (fs.existsSync(p)) {
        console.error(`>>> Discovery: Found report at ${p}`);
        return fs.readFileSync(p, "utf-8");
      }
    }

    return "Discovery failed: Surgical report could not be found in any candidate location.";
  }

  private readReport(filename: string): string {
    const p = path.join(ROOT_DIR, "reports", filename);
    if (fs.existsSync(p)) return fs.readFileSync(p, "utf-8");
    
    // Fallback search for general reports
    const fallback = path.join(ROOT_DIR, filename);
    return fs.existsSync(fallback) ? fs.readFileSync(fallback, "utf-8") : "Report not found.";
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("Polymath Master MCP Server running on stdio");
  }
}

const server = new PolymathPlatformServer();
server.run().catch(console.error);
