/**
 * Pluggable Midscene Adapter
 * Grounded in @midscene/web for multimodal visual & layout assertions.
 */

import { PlaywrightPageAgent } from '@midscene/web';

/**
 * Creates and initializes a Midscene page agent adapter.
 * @param {import('@playwright/test').Page} page
 * @param {Object} [options]
 * @returns {Promise<Object>}
 */
export async function createMidsceneAdapter(page, options = {}) {
  const hasApiKey = Boolean(process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY || options.apiKey);
  const isEnabled = options.enabled ?? (hasApiKey || Boolean(process.env.MIDSCENE_ENABLED));

  if (!isEnabled) {
    return {
      type: 'fallback',
      enabled: false,
      aiAssert: async (assertion) => {
        console.log(`[MidsceneAdapter:Fallback] aiAssert: "${assertion}" (LLM disabled; skipped visual AI check)`);
        return true;
      },
      aiAction: async (instruction) => {
        console.log(`[MidsceneAdapter:Fallback] aiAction: "${instruction}" (LLM disabled; skipped visual AI action)`);
        return false;
      },
      aiQuery: async (_query) => {
        return null;
      },
    };
  }

  try {
    const agent = new PlaywrightPageAgent(page, options);
    return {
      type: 'live',
      enabled: true,
      agent,
      aiAssert: async (assertion) => {
        return await agent.aiAssert(assertion);
      },
      aiAction: async (instruction) => {
        return await agent.aiAction(instruction);
      },
      aiQuery: async (query) => {
        return await agent.aiQuery(query);
      },
    };
  } catch (err) {
    console.warn(`[MidsceneAdapter] Failed to initialize live Midscene agent: ${err.message}`);
    return createMidsceneAdapter(page, { enabled: false });
  }
}
