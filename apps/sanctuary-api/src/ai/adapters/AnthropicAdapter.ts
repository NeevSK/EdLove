import { chat } from '@tanstack/ai';
import { anthropicText } from '@tanstack/ai-anthropic';
import { type LlmPort } from '../ports/LlmPort';

export class AnthropicAdapter implements LlmPort {
  async streamChat(
    systemPrompt: string,
    history: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
    apiKey: string,
    model: string,
  ): Promise<any> {
    const formattedMessages: Array<Record<string, string>> = [
      { role: 'system', content: systemPrompt },
      ...history.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    ];

    return chat({
      adapter: anthropicText(model as any, { apiKey }),
      messages: formattedMessages as any,
    });
  }
}
