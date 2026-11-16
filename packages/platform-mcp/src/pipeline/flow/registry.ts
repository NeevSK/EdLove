import type { FlowDefinition } from './types.js';
import { chatMessagingFlow } from './chatJourney.flow.js';
import { todoReorderSyncFlow } from './todoJourney.flow.js';
import { libraryResourceFlow } from './libraryJourney.flow.js';

class FlowRegistry {
  private flows: Map<string, FlowDefinition> = new Map();

  constructor() {
    this.register(chatMessagingFlow);
    this.register(todoReorderSyncFlow);
    this.register(libraryResourceFlow);
  }

  public register(flow: FlowDefinition): void {
    this.flows.set(flow.metadata.id, flow);
  }

  public get(id: string): FlowDefinition | undefined {
    return this.flows.get(id);
  }

  public list(): FlowDefinition[] {
    return Array.from(this.flows.values());
  }

  public resolve(query: string): FlowDefinition | undefined {
    const cleanQuery = query.toLowerCase().trim();

    // 1. Direct ID match
    if (this.flows.has(query)) return this.flows.get(query);
    if (this.flows.has(`journey:${query}`)) return this.flows.get(`journey:${query}`);

    // 2. Exact match against metadata ID or domain
    for (const [id, flow] of this.flows.entries()) {
      if (id.toLowerCase() === cleanQuery || flow.metadata.domain.toLowerCase() === cleanQuery) {
        return flow;
      }
    }

    // 3. Dynamic token scoring index (zero hardcoded domain keywords)
    const queryTokens = cleanQuery.split(/[\s:._-]+/).filter((t) => t.length > 2);
    let bestMatch: FlowDefinition | undefined;
    let maxMatchedTokens = 0;

    for (const [id, flow] of this.flows.entries()) {
      const targetTokens = `${id} ${flow.metadata.domain} ${flow.metadata.riskTier}`.toLowerCase().split(/[\s:._-]+/);
      const matches = queryTokens.filter((q) => targetTokens.includes(q)).length;
      if (matches > maxMatchedTokens) {
        maxMatchedTokens = matches;
        bestMatch = flow;
      }
    }

    return bestMatch;
  }
}

export const flowRegistry = new FlowRegistry();
