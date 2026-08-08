import { chat, type StreamChunk } from '@tanstack/ai';
import { createOpenaiChatCompletions } from '@tanstack/ai-openai';
import { type LlmPort } from '../ports/LlmPort';

export class DeepSeekAdapter implements LlmPort {
  async streamChat(
    systemPrompt: string,
    history: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
    apiKey: string,
    model: string,
  ): Promise<AsyncIterable<StreamChunk>> {
    // DeepSeek is OpenAI API-compatible (chat completions), so we configure
    // the OpenAI completions adapter with DeepSeek's URL.
    return chat({
      adapter: createOpenaiChatCompletions(model as any, apiKey, {
        baseURL: 'https://api.deepseek.com/v1',
      }),
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
