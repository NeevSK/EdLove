export type DurableAgentSynthesisMode =
  | 'openai_responses'
  | 'anthropic_messages'
  | 'deterministic_fallback';

type SynthesizeDraftInput = {
  systemPrompt: string;
  userPayload: Record<string, unknown>;
  deterministicFallback: string;
  maxOutputTokens?: number;
  openAiModel?: string;
  anthropicModel?: string;
};

function extractOpenAIText(data: unknown): string | null {
  if (!data || typeof data !== 'object') return null;
  const record = data as Record<string, unknown>;

  if (typeof record['output_text'] === 'string' && record['output_text'].trim()) {
    return record['output_text'].trim();
  }

  const output = record['output'];
  if (!Array.isArray(output)) return null;

  const fragments: string[] = [];
  for (const item of output) {
    if (!item || typeof item !== 'object') continue;
    const content = (item as Record<string, unknown>)['content'];
    if (!Array.isArray(content)) continue;
    for (const part of content) {
      if (!part || typeof part !== 'object') continue;
      const text = (part as Record<string, unknown>)['text'];
      if (typeof text === 'string' && text.trim()) {
        fragments.push(text.trim());
      }
    }
  }

  return fragments.length > 0 ? fragments.join('\n\n') : null;
}

function extractAnthropicText(data: unknown): string | null {
  if (!data || typeof data !== 'object') return null;
  const record = data as Record<string, unknown>;
  const content = record['content'];
  if (!Array.isArray(content)) return null;

  const fragments: string[] = [];
  for (const part of content) {
    if (!part || typeof part !== 'object') continue;
    const text = (part as Record<string, unknown>)['text'];
    if (typeof text === 'string' && text.trim()) {
      fragments.push(text.trim());
    }
  }

  return fragments.length > 0 ? fragments.join('\n\n') : null;
}

async function synthesizeWithOpenAI({
  systemPrompt,
  userPayload,
  maxOutputTokens = 420,
  openAiModel = import.meta.env['OPENAI_DURABLE_AGENT_MODEL'] || 'gpt-4.1-mini',
}: SynthesizeDraftInput) {
  const apiKey = import.meta.env['OPENAI_API_KEY'];
  if (!apiKey) return null;

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: openAiModel,
      max_output_tokens: maxOutputTokens,
      input: [
        {
          role: 'system',
          content: [{ type: 'input_text', text: systemPrompt }],
        },
        {
          role: 'user',
          content: [
            {
              type: 'input_text',
              text: JSON.stringify(userPayload, null, 2),
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`OpenAI durable-agent synthesis failed: ${response.status} ${errorBody}`);
  }

  const text = extractOpenAIText((await response.json()) as unknown);
  if (!text) {
    throw new Error('OpenAI durable-agent synthesis returned no text.');
  }

  return {
    text,
    mode: 'openai_responses' as const,
  };
}

async function synthesizeWithAnthropic({
  systemPrompt,
  userPayload,
  maxOutputTokens = 420,
  anthropicModel = import.meta.env['ANTHROPIC_DURABLE_AGENT_MODEL'] || 'claude-3-5-haiku-latest',
}: SynthesizeDraftInput) {
  const apiKey = import.meta.env['ANTHROPIC_API_KEY'];
  if (!apiKey) return null;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: anthropicModel,
      max_tokens: maxOutputTokens,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: JSON.stringify(userPayload, null, 2),
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Anthropic durable-agent synthesis failed: ${response.status} ${errorBody}`);
  }

  const text = extractAnthropicText((await response.json()) as unknown);
  if (!text) {
    throw new Error('Anthropic durable-agent synthesis returned no text.');
  }

  return {
    text,
    mode: 'anthropic_messages' as const,
  };
}

export async function synthesizeDurableAgentDraft(input: SynthesizeDraftInput): Promise<{
  summaryDraft: string;
  synthesisMode: DurableAgentSynthesisMode;
}> {
  const preferredProvider = String(import.meta.env['DURABLE_AGENT_PROVIDER'] || '').toLowerCase();

  const providers =
    preferredProvider === 'anthropic'
      ? [synthesizeWithAnthropic, synthesizeWithOpenAI]
      : preferredProvider === 'openai'
        ? [synthesizeWithOpenAI, synthesizeWithAnthropic]
        : [synthesizeWithOpenAI, synthesizeWithAnthropic];

  for (const provider of providers) {
    const result = await provider(input);
    if (result) {
      return {
        summaryDraft: result.text,
        synthesisMode: result.mode,
      };
    }
  }

  return {
    summaryDraft: input.deterministicFallback,
    synthesisMode: 'deterministic_fallback',
  };
}
