import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(path.join(__dirname, "..", ".."));

/**
 * Standardized Execution Layer for Sovereign Tools (MJS version)
 */
export class AlchemistExecution {
  constructor(toolName) {
    this.toolName = toolName;
    this.startTime = null;
    this.status = 'pending';
  }

  start() {
    this.startTime = Date.now();
    console.error(`[Sovereign] Starting ${this.toolName}...`);
  }

  async complete(metadata = {}, output = "Success") {
    const durationMs = Date.now() - this.startTime;
    const timestamp = new Date().toISOString();
    
    const result = {
      tool: this.toolName,
      timestamp,
      durationMs,
      status: "success",
      output,
      metadata
    };

    this.saveReport(result);
  }

  async fail(error) {
    const durationMs = Date.now() - this.startTime;
    const timestamp = new Date().toISOString();
    
    const result = {
      tool: this.toolName,
      timestamp,
      durationMs,
      status: "failure",
      output: error.message,
      stack: error.stack
    };

    this.saveReport(result);
  }

  saveReport(result) {
    const reportDir = path.join(ROOT_DIR, "reports");
    if (!fs.existsSync(reportDir)) fs.mkdirSync(reportDir);

    const reportFileName = `${this.toolName}_${result.timestamp.replace(/[:.]/g, "-")}.json`;
    fs.writeFileSync(
      path.join(reportDir, reportFileName),
      JSON.stringify(result, null, 2),
      "utf-8"
    );
  }
}
