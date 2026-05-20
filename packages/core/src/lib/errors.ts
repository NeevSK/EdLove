/**
 * Sovereign Error Standard (2026 Edition)
 *
 * A structured error format that provides dual-resolution paths:
 * 1. Human Resolution: Empathetic, clear, and actionable for users.
 * 2. Agent Resolution: Technical, machine-readable, and precise for AI agents.
 */
export type ErrorResolutionAction = {
  label: string;
  onPress: () => void | Promise<void>;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
};

export interface ISovereignError {
  id: string;
  timestamp: string;
  code: string;
  message: string;

  // Human-facing resolution logic
  guide: string;

  // Agent-facing resolution logic (Operational precision)
  agentGuide?: string;
  agentHint?: string; // Short code for agent decision trees (e.g. "RETRY_ON_CONNECT")

  context?: Record<string, any>;
  isRetriable?: boolean;
  actions?: ErrorResolutionAction[];
}

export class SovereignError extends Error implements ISovereignError {
  public readonly id: string;
  public readonly timestamp: string;
  public readonly code: string;
  public readonly guide: string;
  public readonly agentGuide?: string;
  public readonly agentHint?: string;
  public readonly context?: Record<string, any>;
  public readonly isRetriable?: boolean;
  public readonly actions?: ErrorResolutionAction[];

  constructor(options: {
    message: string;
    code: string;
    guide: string;
    agentGuide?: string;
    agentHint?: string;
    context?: Record<string, any>;
    isRetriable?: boolean;
    actions?: ErrorResolutionAction[];
  }) {
    super(options.message);
    this.name = 'SovereignError';
    this.id = Math.random().toString(36).substring(2, 15);
    this.timestamp = new Date().toISOString();
    this.code = options.code;
    this.guide = options.guide;
    this.agentGuide = options.agentGuide;
    this.agentHint = options.agentHint;
    this.context = options.context;
    this.isRetriable = options.isRetriable;
    this.actions = options.actions;

    Object.setPrototypeOf(this, SovereignError.prototype);
  }

  public static from(error: any, overrides?: Partial<ISovereignError>): SovereignError {
    if (error instanceof SovereignError) return error;

    return new SovereignError({
      message: error?.message || 'An unexpected error occurred',
      code: error?.code || 'UNKNOWN_ERROR',
      guide: 'Please try again or contact support if the issue persists.',
      agentGuide: 'Generic failure caught. Check transaction logs for root cause.',
      agentHint: 'LOG_AND_ESCALATE',
      context: { originalError: error },
      ...overrides,
    });
  }
}
