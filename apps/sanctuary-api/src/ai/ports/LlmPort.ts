import type { StreamChunk } from '@tanstack/ai';

export interface LlmPort {
  streamChat(
    systemPrompt: string,
    history: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
    apiKey: string,
    model: string,
  ): Promise<AsyncIterable<StreamChunk>>;
}
