export interface CedarEvaluationContext {
  device?: {
    is_trusted?: boolean;
    trust_status?: 'new' | 'trusted' | 'stale' | 'restricted' | 'standard';
    trust_tier?: number; // 0..4
    device_trust?: 'standard' | 'verified' | 'hardware' | 'attested';
  };
  device_trust?: 'standard' | 'verified' | 'hardware' | 'attested';
  network_zone?: string;
  requires_step_up?: boolean;
}
