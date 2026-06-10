/* eslint-disable import-x/no-unresolved */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import {
  getAlternatives,
  getEcosystemTopology,
  getVitalityCard,
  scanProject,
} from '@rn-terrain/core';

const server = new Server(
  {
    name: 'rn-terrain-mcp',
    version: '0.0.1',
  },
  {
    capabilities: {
      tools: {},
    },
  },
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'audit_package',
        description:
          'Audit a React Native dependency package against RN Terrain signals to get its VitalityCard.',
        inputSchema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Name of the npm package (e.g. react-native-reanimated)',
            },
          },
          required: ['name'],
        },
      },
      {
        name: 'scan_project',
        description:
          'Scan package.json dependencies in a React Native project to get a ProjectAudit report.',
        inputSchema: {
          type: 'object',
          properties: {
            package_json_path: {
              type: 'string',
              description: 'Path to package.json (e.g. ./package.json)',
            },
          },
          required: ['package_json_path'],
        },
      },
      {
        name: 'v1_readiness_check',
        description:
          "Check a package's readiness for React Native 1.0 (Architecture, API compatibility, risk).",
        inputSchema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Name of the npm package (e.g. react-native-reanimated)',
            },
          },
          required: ['name'],
        },
      },
      {
        name: 'get_alternatives',
        description:
          'Get recommended, higher-vitality alternative packages for a given dependency.',
        inputSchema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Name of the npm package (e.g. react-native-async-storage)',
            },
          },
          required: ['name'],
        },
      },
      {
        name: 'ecosystem_map',
        description:
          'Get the macro topology view of the React Native package ecosystem, optionally filtered by category.',
        inputSchema: {
          type: 'object',
          properties: {
            category: {
              type: 'string',
              description: 'Category to filter by (e.g. navigation, animation, storage)',
            },
          },
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === 'audit_package') {
      const packageName = args?.name as string;
      const card = await getVitalityCard(packageName);
      if (!card) {
        return {
          content: [
            { type: 'text', text: `Package "${packageName}" not found in RN Terrain registry.` },
          ],
          isError: true,
        };
      }
      return {
        content: [{ type: 'text', text: JSON.stringify(card, null, 2) }],
      };
    }

    if (name === 'scan_project') {
      const packageJsonPath = args?.package_json_path as string;
      const audit = await scanProject(packageJsonPath);
      return {
        content: [{ type: 'text', text: JSON.stringify(audit, null, 2) }],
      };
    }

    if (name === 'v1_readiness_check') {
      const packageName = args?.name as string;
      const card = await getVitalityCard(packageName);
      if (!card) {
        return {
          content: [
            { type: 'text', text: `Package "${packageName}" not found in RN Terrain registry.` },
          ],
          isError: true,
        };
      }
      return {
        content: [{ type: 'text', text: JSON.stringify(card.v1_readiness, null, 2) }],
      };
    }

    if (name === 'get_alternatives') {
      const packageName = args?.name as string;
      const alternatives = await getAlternatives(packageName);
      return {
        content: [{ type: 'text', text: JSON.stringify(alternatives, null, 2) }],
      };
    }

    if (name === 'ecosystem_map') {
      const category = args?.category as string | undefined;
      const topology = await getEcosystemTopology(category);
      return {
        content: [{ type: 'text', text: JSON.stringify(topology, null, 2) }],
      };
    }

    throw new Error(`Tool not found: ${name}`);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [{ type: 'text', text: `Error executing tool "${name}": ${errorMessage}` }],
      isError: true,
    };
  }
});

async function run() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('RN Terrain MCP server running on stdio');
}

run().catch((error) => {
  console.error('Fatal error running server:', error);
  process.exit(1);
});
