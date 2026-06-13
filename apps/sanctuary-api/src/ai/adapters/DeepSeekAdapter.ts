import { chat } from '@tanstack/ai';
import { openaiText } from '@tanstack/ai-openai';
import { type LlmPort } from '../ports/LlmPort';

export class DeepSeekAdapter implements LlmPort {
  async streamChat(
    systemPrompt: string,
    history: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
    apiKey: string,
    model: string
  ): Promise<any> {
    const formattedMessages = [
      { role: 'system', content: systemPrompt },
      ...history.map((m) => ({
        role: m.role as 'user' | 'assistant' | 'system',
        content: m.content,
      })),
    ];

    // DeepSeek is OpenAI API-compatible, so we configure the OpenAI adapter with DeepSeek's URL
    return chat({
      adapter: openaiText(model, {
        apiKey,
        baseURL: 'https://api.deepseek.com/v1',
      }),
      messages: formattedMessages,
    });
  }
}
