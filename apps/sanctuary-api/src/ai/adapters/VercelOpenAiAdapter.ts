import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { type LlmPort } from '../ports/LlmPort';
import { vercelStreamToTanStackChunks } from './vercel-stream-utils';

export class VercelOpenAiAdapter implements LlmPort {
  async streamChat(
    systemPrompt: string,
    history: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
    apiKey: string,
    model: string,
  ) {
    const provider = createOpenAI({ apiKey });

    const result = streamText({
      model: provider(model),
      system: systemPrompt,
      messages: history.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    });

    return vercelStreamToTanStackChunks(result.fullStream, model);
  }
}
