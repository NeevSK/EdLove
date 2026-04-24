import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { ROOT_DIR } from "./constants.js";

interface ExecutionResult {
  tool: string;
  timestamp: string;
  durationMs: number;
  status: "success" | "failure";
  output: string;
  metadata?: any;
}

/**
 * Standardized Execution Layer for Sovereign Tools
 */
export function executeSovereignTool(
  toolName: string,
  command: string,
  metadata: any = {}
): ExecutionResult {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();
  let status: "success" | "failure" = "success";
  let output = "";

  try {
    console.error(`[Sovereign] Executing ${toolName}...`);
    output = execSync(command, { cwd: ROOT_DIR }).toString();
  } catch (e: any) {
    status = "failure";
    output = e.message;
  }

  const durationMs = Date.now() - startTime;
  const result: ExecutionResult = {
    tool: toolName,
    timestamp,
    durationMs,
    status,
    output,
    metadata
  };

  // Persist report
  const reportDir = path.join(ROOT_DIR, "reports");
  if (!fs.existsSync(reportDir)) fs.mkdirSync(reportDir);

  const reportFileName = `${toolName}_${timestamp.replace(/[:.]/g, "-")}.json`;
  fs.writeFileSync(
    path.join(reportDir, reportFileName),
    JSON.stringify(result, null, 2),
    "utf-8"
  );

  return result;
}
