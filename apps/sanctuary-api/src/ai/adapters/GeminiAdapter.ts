import { chat, toServerSentEventsStream } from '@tanstack/ai';
import { geminiText } from '@tanstack/ai-gemini';
import { type LlmPort } from '../ports/LlmPort';

export class GeminiAdapter implements LlmPort {
  async streamChat(
    systemPrompt: string,
    history: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
    apiKey: string,
    model: string,
  ): Promise<ReadableStream> {
    const formattedMessages: Array<Record<string, string>> = [
      { role: 'system', content: systemPrompt },
      ...history.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    ];

    const stream = chat({
      adapter: geminiText(model as any, { apiKey }),
      messages: formattedMessages as any,
    });

    return toServerSentEventsStream(stream as any) as any;
  }
}
