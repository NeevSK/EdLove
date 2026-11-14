import { readFileSync } from 'node:fs';
import { generateMcpCedarSchema } from '../services/cedarMcpSchema.js';

const [toolsPath, stubPath] = process.argv.slice(2);
if (!toolsPath || toolsPath === '--help') {
  console.error(
    'Usage: pnpm --filter @repo/platform-mcp cedar:mcp-schema <tools.json> [schema-stub.cedarschema]',
  );
  process.exit(toolsPath ? 0 : 2);
}
try {
  const input: unknown = JSON.parse(readFileSync(toolsPath, 'utf8'));
  const response = input as { tools?: unknown; result?: { tools?: unknown } } | null;
  const tools = Array.isArray(input) ? input : (response?.tools ?? response?.result?.tools);
  const stub = stubPath ? readFileSync(stubPath, 'utf8') : undefined;
  process.stdout.write(generateMcpCedarSchema(tools, stub).schema);
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
