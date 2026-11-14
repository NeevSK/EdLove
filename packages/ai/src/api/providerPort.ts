/**
 * IAIProviderAdapter Port
 *
 * Defines the contract for pluggable AI engines across the Polymath Platform.
 * Enables zero-friction switching between Sanctuary Cloud, BYOK (custom API keys),
 * on-premise instances, and local private models (vLLM / Ollama) without modifying UI screens.
 */

export interface AGUIEvent {
  type:
    | 'RUN_STARTED'
    | 'RUN_FINISHED'
    | 'STEP_STARTED'
    | 'STEP_FINISHED'
    | 'TEXT_MESSAGE_START'
    | 'TEXT_MESSAGE_CONTENT'
    | 'TOOL_CALL_START'
    | 'TOOL_CALL_ARGS'
    | 'TOOL_RESULT'
    | 'APPROVAL_REQUIRED'
    | 'APPROVAL_RESPONSE';
  payload: Record<string, unknown>;
}

export interface AIStreamRequest {
  threadId: string;
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
  }>;
  persona?: string;
  context?: Record<string, unknown>;
  privacyMode: 'saved' | 'temporary' | 'incognito';
}

export interface IAIProviderAdapter {
  readonly id: string;
  readonly name: string;
  readonly supportsStreaming: boolean;
  streamMessage(
    request: AIStreamRequest,
    onChunk: (event: AGUIEvent) => void,
    signal?: AbortSignal,
  ): Promise<void>;
}

/**
 * Registry for registered AI Provider Adapters
 */
class AIProviderRegistry {
  private adapters = new Map<string, IAIProviderAdapter>();
  private activeProviderId = 'sanctuary-cloud';

  register(adapter: IAIProviderAdapter): void {
    this.adapters.set(adapter.id, adapter);
  }

  get(id?: string): IAIProviderAdapter {
    const target = id ?? this.activeProviderId;
    const adapter = this.adapters.get(target);
    if (!adapter) {
      throw new Error(`AI Provider "${target}" is not registered.`);
    }
    return adapter;
  }

  setActiveProvider(id: string): void {
    if (!this.adapters.has(id)) {
      throw new Error(`Cannot set unknown AI Provider "${id}" as active.`);
    }
    this.activeProviderId = id;
  }

  list(): Array<{ id: string; name: string }> {
    return Array.from(this.adapters.values()).map((a) => ({ id: a.id, name: a.name }));
  }
}

export const aiProviderRegistry = new AIProviderRegistry();
