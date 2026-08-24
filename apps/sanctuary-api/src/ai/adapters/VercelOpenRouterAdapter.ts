import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { type LlmPort } from '../ports/LlmPort';
import { vercelStreamToTanStackChunks } from './vercel-stream-utils';

export class VercelOpenRouterAdapter implements LlmPort {
  async streamChat(
    systemPrompt: string,
    history: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
    apiKey: string,
    model: string,
  ) {
    const provider = createOpenAI({
      apiKey,
      baseURL: 'https://openrouter.ai/api/v1',
      headers: process.env.OPENROUTER_SITE_URL
        ? {
            'HTTP-Referer': process.env.OPENROUTER_SITE_URL,
            'X-Title': process.env.OPENROUTER_APP_NAME ?? 'Gurudevi Sanctuary',
          }
        : undefined,
    });

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
