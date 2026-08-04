import { chat, toServerSentEventsStream } from '@tanstack/ai';
import { openaiText } from '@tanstack/ai-openai';
import { type LlmPort } from '../ports/LlmPort';

export class OpenAiAdapter implements LlmPort {
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
      adapter: openaiText(model as any, { apiKey } as any),
      messages: formattedMessages as any,
    });

    return toServerSentEventsStream(stream as any) as any;
  }
}
