import { chat, type StreamChunk } from '@tanstack/ai';
import { createOpenaiChat } from '@tanstack/ai-openai';
import { type LlmPort } from '../ports/LlmPort';

export class OpenAiAdapter implements LlmPort {
  async streamChat(
    systemPrompt: string,
    history: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
    apiKey: string,
    model: string,
  ): Promise<AsyncIterable<StreamChunk>> {
    return chat({
      adapter: createOpenaiChat(model as any, apiKey),
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
