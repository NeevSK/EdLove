import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

// --- Alchemist's Path: Discovery ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');
const PACKAGE_DIR = path.join(ROOT_DIR, 'packages', 'platform-mcp');
const ENV_FILE = path.join(PACKAGE_DIR, '.env');

/**
 * The Automation Bridge: Transforming Scattered Configuration into Sovereign Control.
 */
async function setupMcpBridge() {
    console.log("🛠️ Starting Polymath MCP Automation Bridge...");

    // 1. Locate Config
    const homeDir = os.homedir();
    const configPath = path.join(homeDir, '.gemini', 'antigravity', 'mcp_config.json');

    if (!fs.existsSync(configPath)) {
        console.error(`❌ Config not found at ${configPath}. Are you running in Antigravity?`);
        return;
    }

    // 2. Safety First: Create Timestamped Backup
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const backupPath = `${configPath}.backup_${timestamp}`;
    fs.copyFileSync(configPath, backupPath);
    console.log(`✅ Backup created: ${backupPath}`);

    // 3. Parse Configuration
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    let envContent = fs.existsSync(ENV_FILE) ? fs.readFileSync(ENV_FILE, 'utf-8') : "";

    // 4. Sensing Token Migration (Non-Destructive Sensing)
    const secrets: Record<string, string> = {};

    // A. GitHub Migration
    if (config.mcpServers?.github?.env?.GITHUB_PERSONAL_ACCESS_TOKEN) {
        secrets['GITHUB_PERSONAL_ACCESS_TOKEN'] = config.mcpServers.github.env.GITHUB_PERSONAL_ACCESS_TOKEN;
        console.log("💎 Found GitHub Token. Migrating...");
    }

    // B. Supabase Migration
    const sb = config.mcpServers?.['supabase-mcp-server'];
    if (sb?.args) {
        const tokenIndex = sb.args.indexOf('--access-token') + 1;
        if (tokenIndex > 0 && sb.args[tokenIndex]) {
            secrets['SUPABASE_ACCESS_TOKEN'] = sb.args[tokenIndex];
            console.log("💎 Found Supabase Token. Migrating...");
        }
    }

    // 5. Hardening .env
    for (const [key, val] of Object.entries(secrets)) {
        if (!envContent.includes(key)) {
            envContent += `\n${key}=${val}`;
        }
    }
    fs.writeFileSync(ENV_FILE, envContent.trim() + "\n");
    console.log(`✅ Secrets moved to ${path.relative(ROOT_DIR, ENV_FILE)}`);

    // 6. Injection: The Absolute Bridge
    const serverEntryPoint = path.join(PACKAGE_DIR, 'dist', 'index.js').replace(/\\/g, '\\\\');
    
    if (!config.mcpServers) config.mcpServers = {};

    config.mcpServers['platform-mcp'] = {
        command: "node",
        args: [serverEntryPoint],
        env: {}
    };

    // 7. Cleanup & Hardening: The Proxy Bridge
    const proxyPath = path.join(ROOT_DIR, 'scripts', 'mcp-proxy.mjs').replace(/\\/g, '\\\\');

    if (secrets['GITHUB_PERSONAL_ACCESS_TOKEN'] && config.mcpServers?.github) {
        const gh = config.mcpServers.github;
        if (gh.command !== "node" || !gh.args[0].includes('mcp-proxy.mjs')) {
            gh.args = [proxyPath, gh.command, ...(gh.args || [])];
            gh.command = "node";
            // Add --no-warnings to prevent breaking the MCP protocol
            gh.args.unshift("--no-warnings");
        }
        if (!gh.env) gh.env = {};
        gh.env.GITHUB_PERSONAL_ACCESS_TOKEN = `\${env.GITHUB_PERSONAL_ACCESS_TOKEN}`;
        console.log("🔒 GitHub Instrumented with Proxy.");
    }

    if (secrets['SUPABASE_ACCESS_TOKEN'] && config.mcpServers?.['supabase-mcp-server']) {
        const sb = config.mcpServers['supabase-mcp-server'];
        
        // Ensure token placeholder is used
        const tokenIndex = sb.args.indexOf('--access-token') + 1;
        if (tokenIndex > 0 && sb.args[tokenIndex] !== `\${env.SUPABASE_ACCESS_TOKEN}`) {
             // If it's a raw token or wrong placeholder, fix it
             sb.args[tokenIndex] = `\${env.SUPABASE_ACCESS_TOKEN}`;
        }

        if (sb.command !== "node" || !sb.args[0].includes('mcp-proxy.mjs')) {
            sb.args = [proxyPath, sb.command, ...(sb.args || [])];
            sb.command = "node";
            // Add --no-warnings to prevent breaking the MCP protocol
            sb.args.unshift("--no-warnings");
        }
        
        if (!sb.env) sb.env = {};
        sb.env.SUPABASE_ACCESS_TOKEN = `\${env.SUPABASE_ACCESS_TOKEN}`;
        console.log("🔒 Supabase Instrumented with Proxy.");
    }

    // 8. Write-back
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log(`🚀 Bridge Instrumented! New server added: platform-mcp`);
    console.log(`⚠️ Please restart Antigravity to finalize the 'Teaning'.`);
}

setupMcpBridge().catch(err => {
    console.error("💥 Bridge Setup Failed:", err);
    process.exit(1);
});
