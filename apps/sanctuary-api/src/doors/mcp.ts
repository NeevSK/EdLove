import { McpServer } from '@modelcontextprotocol/server';
import { McpRegistrar } from '@orpc/mcp';
import { Hono } from 'hono';
import { canonicalDomainRouter } from '../domains';
import { type ORPCContext } from '../core/orpc';
import { buildORPCContextFromHono } from '../core/router';

export function createMcpDoor() {
  const door = new Hono();

  const mcpServer = new McpServer({
    name: 'sanctuary-api-mcp',
    version: '2026.1.0',
  });

  // Register clean, bounded-context tools from the canonical domain router
  const registrar = new McpRegistrar(canonicalDomainRouter as any);
  let registeredPromise: Promise<any> | null = null;

  async function ensureRegistered() {
    if (!registeredPromise) {
      registeredPromise = registrar.register(mcpServer, {
        context: async () => ({} as ORPCContext),
      });
    }
    return registeredPromise;
  }

  // MCP Service Discovery / Metadata
  door.get('/info', (c) => {
    return c.json({
      status: 'active',
      name: 'sanctuary-api-mcp',
      version: '2026.1.0',
      protocolVersion: '2024-11-05',
      capabilities: {
        tools: { listChanged: false },
        resources: { subscribe: false },
      },
    });
  });

  // Tools Catalog Listing for Agents
  door.get('/tools', async (c) => {
    const registered = await ensureRegistered();
    const tools = Object.entries(registered.tools || {}).map(([name, tool]: [string, any]) => ({
      name,
      description: tool.description || `Tool for ${name}`,
      inputSchema: tool.inputSchema || {},
    }));

    return c.json({ tools });
  });

  // Tool Invocation Endpoint
  door.post('/call', async (c) => {
    const registered = await ensureRegistered();
    const body = (await c.req.json()) as { name?: string; arguments?: Record<string, unknown> };

    if (!body?.name || typeof body.name !== 'string') {
      return c.json({ error: 'Missing or invalid "name" parameter' }, 400);
    }

    const tool = registered.tools?.[body.name];
    if (!tool) {
      return c.json({ error: `Tool "${body.name}" not found in Sanctuary MCP catalog` }, 404);
    }

    try {
      const context = await buildORPCContextFromHono(c);
      const result = await tool.execute(body.arguments || {}, { context });
      return c.json({ content: [{ type: 'text', text: JSON.stringify(result) }] });
    } catch (err: any) {
      return c.json(
        {
          isError: true,
          content: [{ type: 'text', text: `Tool execution failed: ${err.message || String(err)}` }],
        },
        500,
      );
    }
  });

  return door;
}
