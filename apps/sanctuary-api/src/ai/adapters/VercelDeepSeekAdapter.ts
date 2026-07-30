import { createOpenAI } from '@ai-sdk/openai';
import { toServerSentEventsStream } from '@tanstack/ai';
import { streamText } from 'ai';
import { type LlmPort } from '../ports/LlmPort';
import { vercelStreamToTanStackChunks } from './vercel-stream-utils';

export class VercelDeepSeekAdapter implements LlmPort {
  async streamChat(
    systemPrompt: string,
    history: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
    apiKey: string,
    model: string,
  ): Promise<ReadableStream> {
    const provider = createOpenAI({ apiKey, baseURL: 'https://api.deepseek.com/v1' });

    const result = streamText({
      model: provider(model),
      system: systemPrompt,
      messages: history.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    });

    const tanStackChunks = vercelStreamToTanStackChunks(result.fullStream, model);
    return toServerSentEventsStream(tanStackChunks);
  }
}
