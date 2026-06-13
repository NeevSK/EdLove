import { chat } from '@tanstack/ai';
import { geminiText } from '@tanstack/ai-gemini';
import { type LlmPort } from '../ports/LlmPort';

export class GeminiAdapter implements LlmPort {
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

    return chat({
      adapter: geminiText(model, { apiKey }),
      messages: formattedMessages,
    });
  }
}
