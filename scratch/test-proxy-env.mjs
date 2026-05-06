import { execSync } from "node:child_process";
import path from "node:path";

const ROOT_DIR = "C:\\Users\\Naween\\projects\\polymath-platform";
const PROXY_PATH = path.join(ROOT_DIR, "scripts", "mcp-proxy.mjs");

console.log("--- Testing Sovereign Proxy Env Injection ---");

try {
	// Run the proxy with a command that prints the env
	// On Windows, 'set' prints env vars
	const output = execSync(
		`node "${PROXY_PATH}" cmd /c set SUPABASE_ACCESS_TOKEN`,
		{
			cwd: ROOT_DIR,
			encoding: "utf-8",
		},
	);
	console.log("Result:", output.trim());
} catch (e) {
	console.error("Failed to find variable or proxy error:", e.message);
	if (e.stdout) console.error("STDOUT:", e.stdout);
}
