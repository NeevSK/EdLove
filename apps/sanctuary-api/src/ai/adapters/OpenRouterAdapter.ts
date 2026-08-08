import { chat, type StreamChunk } from '@tanstack/ai';
import { createOpenaiChatCompletions } from '@tanstack/ai-openai';
import { type LlmPort } from '../ports/LlmPort';

export class OpenRouterAdapter implements LlmPort {
  async streamChat(
    systemPrompt: string,
    history: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
    apiKey: string,
    model: string,
  ): Promise<AsyncIterable<StreamChunk>> {
    // OpenRouter exposes an OpenAI-compatible chat completions endpoint, so we
    // configure the OpenAI completions adapter with OpenRouter's URL.
    const config: Parameters<typeof createOpenaiChatCompletions>[2] = {
      baseURL: 'https://openrouter.ai/api/v1',
    };
    if (process.env.OPENROUTER_SITE_URL) {
      config.defaultHeaders = {
        'HTTP-Referer': process.env.OPENROUTER_SITE_URL,
        'X-Title': process.env.OPENROUTER_APP_NAME ?? 'Gurudevi Sanctuary',
      };
    }
    return chat({
      adapter: createOpenaiChatCompletions(model as any, apiKey, config),
      systemPrompts: [systemPrompt],
      messages: history
        .filter((m) => m.role !== 'system')
        .map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
    }) as unknown as AsyncIterable<StreamChunk>;
  }
}
