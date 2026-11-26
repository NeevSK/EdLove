/**
 * Pluggable Stagehand Adapter
 * Grounded in @browserbasehq/stagehand for intent-driven agentic web actions.
 */

import { Stagehand } from '@browserbasehq/stagehand';

/**
 * Creates and initializes a Stagehand adapter instance.
 * @param {Object} [options]
 * @param {string} [options.model]
 * @param {string} [options.apiKey]
 * @param {boolean} [options.enabled]
 * @returns {Promise<Object>}
 */
export async function createStagehandAdapter(options = {}) {
  const hasApiKey = Boolean(process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY || options.apiKey);
  const isEnabled = options.enabled ?? (hasApiKey || Boolean(process.env.STAGEHAND_ENABLED));

  if (!isEnabled) {
    // Resilient local fallback adapter that provides the Stagehand interface
    return {
      type: 'fallback',
      enabled: false,
      act: async (page, instruction) => {
        console.log(`[StagehandAdapter:LocalFallback] Simulating act: "${instruction}" via Playwright`);
        // If instruction mentions button or click, attempt click
        const match = instruction.match(/click (?:on )?(?:the )?["']?([^"']+)["']?/i);
        if (match && match[1]) {
          const target = page.locator(`button:has-text("${match[1]}"), [aria-label*="${match[1]}" i]`).first();
          if ((await target.count()) > 0) {
            await target.click();
            return { success: true };
          }
        }
        return { success: false, reason: 'Stagehand LLM not configured; fallback could not resolve selector' };
      },
      extract: async (_page, instruction) => {
        return { message: `Stagehand extract requires API key: ${instruction}` };
      },
      observe: async (_page) => {
        return [];
      },
      close: async () => {},
    };
  }

  try {
    const stagehand = new Stagehand({
      model: options.model || 'claude-3-5-sonnet-latest',
      apiKey: options.apiKey || process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY,
      domSettleTimeoutMs: 1500,
      ...options,
    });

    await stagehand.init();

    return {
      type: 'live',
      enabled: true,
      instance: stagehand,
      act: async (_page, instruction) => {
        return await stagehand.act(instruction);
      },
      extract: async (_page, instruction, schema) => {
        return await stagehand.extract(instruction, schema);
      },
      observe: async (_page, instruction) => {
        return await stagehand.observe(instruction);
      },
      close: async () => {
        await stagehand.close();
      },
    };
  } catch (err) {
    console.warn(`[StagehandAdapter] Failed to initialize live Stagehand, using fallback: ${err.message}`);
    return createStagehandAdapter({ enabled: false });
  }
}
