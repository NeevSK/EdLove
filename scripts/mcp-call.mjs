import { spawnSync } from "node:child_process";
import path from "node:path";
import process from "node:process";

function usage() {
	console.error(
		[
			"Usage:",
			"  node scripts/mcp-call.mjs <toolName> [jsonArgs]",
			"  node scripts/mcp-call.mjs <toolName> key=value [key2=value ...]",
			"",
			"Examples:",
			"  node scripts/mcp-call.mjs check_package_types package=classroom",
			"  node scripts/mcp-call.mjs structural_search query=useToast target=packages/classroom",
			'  node scripts/mcp-call.mjs check_package_types \'{"package":"@repo/ui"}\'',
		].join("\n"),
	);
}

const toolName = process.argv[2];
if (!toolName) {
	usage();
	process.exit(2);
}

const rawArgs = process.argv.slice(3);

let toolArgs = {};
if (
	rawArgs.length === 1 &&
	(rawArgs[0].trim().startsWith("{") || rawArgs[0].trim().startsWith("["))
) {
	try {
		toolArgs = JSON.parse(rawArgs[0]);
	} catch {
		console.error(`Invalid jsonArgs: ${rawArgs[0]}`);
		process.exit(2);
	}
} else {
	for (const part of rawArgs) {
		const eq = part.indexOf("=");
		if (eq === -1) continue;
		const key = part.slice(0, eq);
		const value = part.slice(eq + 1);
		if (!key) continue;
		toolArgs[key] = value;
	}
}

const repoRoot = process.cwd();
const platformMcpCwd = path.join(repoRoot, "packages", "platform-mcp");

const inline = String.raw`
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const toolName = process.env.MCP_TOOL_NAME;
const toolArgs = JSON.parse(process.env.MCP_TOOL_ARGS_JSON || "{}");

const transport = new StdioClientTransport({
  command: "node",
  args: ["dist/index.js"],
  cwd: process.cwd(),
});

const client = new Client({ name: "mcp-call", version: "0.0.0" }, { capabilities: {} });
await client.connect(transport);

try {
  const result = await client.callTool({ name: toolName, arguments: toolArgs });
  console.log(JSON.stringify(result, null, 2));
} finally {
  await client.close();
}
`;

const result = spawnSync("node", ["--input-type=module", "-"], {
	cwd: platformMcpCwd,
	env: {
		...process.env,
		MCP_TOOL_NAME: toolName,
		MCP_TOOL_ARGS_JSON: JSON.stringify(toolArgs),
	},
	input: inline,
	encoding: "utf8",
	stdio: ["pipe", "pipe", "pipe"],
});

if (result.stdout) process.stdout.write(result.stdout);
if (result.stderr) process.stderr.write(result.stderr);
process.exit(result.status ?? 1);
