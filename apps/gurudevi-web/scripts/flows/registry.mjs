/**
 * Pluggable Flow Registry
 * Discovers and dynamically loads all *.flow.mjs definitions.
 * Zero hardcoded routes, steps, or screen files.
 */

import { readdirSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { loadPjcFlows } from './pjc-loader.mjs';

/**
 * Discovers and registers all flow definitions:
 * 1. Hand-crafted sentinels from *.flow.mjs files in dir
 * 2. Declarative PJC flows from packages/core/src/flows/pjc/*.yaml
 * @param {string} [dir] Directory path containing flow definition files.
 * @returns {Promise<Map<string, Object>>}
 */
export async function discoverFlows(dir = import.meta.dirname) {
  const registry = new Map();

  // 1. Load PJC synthesized flows from YAML contracts
  try {
    const pjcFlows = loadPjcFlows();
    for (const [id, flow] of pjcFlows.entries()) {
      registry.set(id, flow);
    }
  } catch (err) {
    console.warn(`[FlowRegistry] Warning: Could not load PJC catalog flows: ${err.message}`);
  }

  // 2. Load dedicated *.flow.mjs modules (overriding or augmenting)
  const entries = readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isFile() && entry.name.endsWith('.flow.mjs')) {
      const fullPath = join(dir, entry.name);
      try {
        const moduleUrl = pathToFileURL(fullPath).href;
        const module = await import(moduleUrl);
        const flow = module.default || module.flow;

        if (!flow || !flow.id) {
          console.warn(`[FlowRegistry] Warning: Flow module in ${entry.name} does not export a valid flow with an 'id'. Skipping.`);
          continue;
        }

        if (registry.has(flow.id)) {
          console.warn(`[FlowRegistry] Warning: Duplicate flow ID '${flow.id}' detected in ${entry.name}. Overwriting.`);
        }

        registry.set(flow.id, {
          ...flow,
          _sourceFile: entry.name,
          _fullPath: fullPath,
        });
      } catch (err) {
        console.error(`[FlowRegistry] Error loading flow module ${entry.name}:`, err.message);
      }
    }
  }

  return registry;
}

/**
 * Loads a single flow by ID or returns null if not found.
 * @param {string} flowId
 * @param {string} [dir]
 */
export async function loadFlow(flowId, dir = import.meta.dirname) {
  const registry = await discoverFlows(dir);
  return registry.get(flowId) || null;
}
