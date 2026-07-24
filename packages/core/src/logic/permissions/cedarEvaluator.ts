export interface CedarEvaluationContext {
  device: {
    is_trusted: boolean;
    trust_status: 'new' | 'trusted' | 'stale' | 'restricted' | 'standard';
  };
}
