/* eslint-disable no-var */
declare var __DEV__: boolean | undefined;
/* eslint-enable no-var */

/**
 * Sovereign Error Architecture (2026 Standard)
 * -------------------------------------------
 * A tiered error system designed for Security, Observability, and Agentic Actionability.
 */

export enum ErrorTier {
  USER = 'USER', // Consumer-facing (Warm, Generic)
  DEV = 'DEV', // Architect-facing (Verbose, Raw)
  AGENT = 'AGENT', // AI-facing (Semantic, Structured)
  SYSTEM = 'SYSTEM', // Log-only (Internal)
}

export enum ErrorCategory {
  VALIDATION = 'VALIDATION',
  AUTHORIZATION = 'AUTHORIZATION',
  CITIZENSHIP = 'CITIZENSHIP',
  NETWORK = 'NETWORK',
  DATABASE = 'DATABASE',
  UNKNOWN = 'UNKNOWN',
}

/**
 * RFC 9457 compliant error structure
 */
export interface ProblemDetails {
  type: string; // URI identifying the error type
  title: string; // Human-readable summary
  status: number; // HTTP status code
  detail?: string; // Safe explanation
  instance?: string; // Correlation ID
  category: ErrorCategory;
  code: string; // Machine-readable code (e.g. CITIZENSHIP_RESTRICTED)

  // Tiered Payloads
  userMessage?: string; // Warm message for Toasts
  devDetails?: any; // Stack traces, Schemas (Only in __DEV__)
  agentAction?: {
    // Instructions for AI Agents
    suggestedAction: string;
    parameters?: Record<string, any>;
    retryAfter?: number;
  };
}

export class SovereignError extends Error {
  public readonly details: ProblemDetails;

  constructor(details: Partial<ProblemDetails>) {
    super(details.title || 'An unexpected error occurred');
    this.name = 'SovereignError';

    this.details = {
      type: 'https://polymath.network/errors/unknown',
      title: 'Unknown Error',
      status: 500,
      category: ErrorCategory.UNKNOWN,
      code: 'INTERNAL_ERROR',
      ...details,
    };

    const isDevelopment =
      (typeof __DEV__ !== 'undefined' && __DEV__) ||
      (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development');

    // Auto-sanitize dev details if not in development
    if (!isDevelopment) {
      delete this.details.devDetails;
    }
  }

  /**
   * Factory for Validation Errors (Zod integration)
   */
  static validation(detail: string, issues?: any): SovereignError {
    return new SovereignError({
      title: 'Validation Failed',
      detail,
      status: 400,
      category: ErrorCategory.VALIDATION,
      code: 'INVALID_INPUT',
      devDetails: issues,
      userMessage: 'Please check the information you entered.',
      agentAction: {
        suggestedAction: 'CHECK_SCHEMA_AND_RETRY',
      },
    });
  }

  /**
   * Factory for Authorization Errors (CASL/POA integration)
   */
  static unauthorized(action: string, subject: string): SovereignError {
    return new SovereignError({
      title: 'Access Denied',
      detail: `You do not have permission to ${action} this ${subject}.`,
      status: 403,
      category: ErrorCategory.AUTHORIZATION,
      code: 'UNAUTHORIZED',
      userMessage: 'You are not authorized to perform this action.',
      agentAction: {
        suggestedAction: 'UPGRADE_CITIZENSHIP_OR_SWITCH_BOND',
      },
    });
  }
}
