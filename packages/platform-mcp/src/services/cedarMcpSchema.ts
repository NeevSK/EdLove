import { generateSchema } from '@cedar-policy/mcp-schema-generator-wasm';
import { z } from 'zod';

const toolSchema = z
  .object({
    name: z.string().min(1),
    inputSchema: z.object({ type: z.literal('object') }).passthrough(),
  })
  .passthrough();
const generatorResult = z.object({
  isOk: z.boolean(),
  schema: z.string().nullable(),
  error: z.string().nullable(),
});

const defaultStub = `namespace PlatformMcp {
  @mcp_principal entity User;
  @mcp_resource entity McpServer;
}`;

export function generateMcpCedarSchema(input: unknown, stub = defaultStub) {
  const tools = z.array(toolSchema).min(1).parse(input);
  const names = tools.map((tool) => tool.name);
  if (new Set(names).size !== names.length) throw new Error('Tool names must be unique.');
  // The generator uses tool names as Cedar type identifiers as well as quoted
  // action IDs. Encode them for identifiers, then restore the real action IDs.
  const encodedNames = names.map(
    (name) =>
      `mcp_${Array.from(name, (character) => character.codePointAt(0)?.toString(16)).join('_')}`,
  );
  const encodedTools = tools.map((tool, index) => ({ ...tool, name: encodedNames[index] }));
  const result = generatorResult.parse(
    JSON.parse(generateSchema(stub, JSON.stringify(encodedTools))),
  );
  if (!result.isOk || result.schema === null) {
    throw new Error(result.error ?? 'Cedar MCP schema generation failed.');
  }
  let schema = result.schema;
  for (const [index, name] of names.entries()) {
    const encodedAction = `action "${encodedNames[index]}"`;
    if (!schema.includes(encodedAction))
      throw new Error(`Generated action missing for tool ${name}.`);
    schema = schema.replace(encodedAction, `action ${JSON.stringify(name)}`);
  }
  return { tools: names, schema };
}

export function generateDownstreamCedarSchema(serverName: string, input: unknown) {
  const tools = z.array(toolSchema).min(1).parse(input);
  return generateMcpCedarSchema(
    tools.map((tool) => ({ ...tool, name: `${serverName}_${tool.name}` })),
  );
}
