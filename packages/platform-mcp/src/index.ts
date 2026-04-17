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
          },
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
          case "generate_commit_ledger":
            return this.handleCommitLedger();
          case "check_package_types":
            return this.handleCheckTypes(args as { package?: string });
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
    console.error(`Checking types for: ${args.package || "all packages"}...`);
    
    if (args.package) {
      // Use the specialized audit script for specific packages
      const psCmd = `powershell -ExecutionPolicy Bypass -File scripts/audit-errors.ps1 -Target "${args.package}"`;
      try {
        const output = execSync(psCmd, { cwd: ROOT_DIR }).toString();
        const summaryFile = `audit-${args.package.replace(/[@/]/g, "_")}-summary.txt`;
        const summary = this.readReport(summaryFile);
        
        return {
          content: [
            { type: "text", text: output },
            { type: "text", text: `--- Analysis Summary ---\n${summary}` }
          ]
        };
      } catch (e: any) {
        return {
          content: [{ type: "text", text: `Error running target audit: ${e.message}` }],
          isError: true
        };
      }
    } else {
      // General monorepo check using turbo
      const logFile = "reports/check-types.txt";
      const cmd = `pnpm turbo run check-types`;
      const psCmd = `powershell -ExecutionPolicy Bypass -File scripts/audit-wrapper.ps1 -Cmd "${cmd.replace(/"/g, '`"')}" -Log "${logFile}"`;
      
      try {
        const output = execSync(psCmd, { cwd: ROOT_DIR }).toString();
        const report = this.readReport("check-types.txt");
        
        return {
          content: [
            { type: "text", text: output },
            { type: "text", text: `--- Detailed Report ---\n${report}` }
          ]
        };
      } catch (e: any) {
        const report = this.readReport("check-types.txt");
        return {
          content: [
            { type: "text", text: `Type check failed.\n${e.message}` },
            { type: "text", text: `--- Detailed Report (from log) ---\n${report}` }
          ],
          isError: true
        };
      }
    }
  }

  private readReport(filename: string): string {
    const p = path.join(ROOT_DIR, "reports", filename);
    return fs.existsSync(p) ? fs.readFileSync(p, "utf-8") : "Report not found.";
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("Polymath Master MCP Server running on stdio");
  }
}

const server = new PolymathPlatformServer();
server.run().catch(console.error);
