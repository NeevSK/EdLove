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

  static authenticationRequired(): SovereignError {
    return new SovereignError({
      type: 'https://polymath.network/errors/authentication-required',
      title: 'Authentication Required',
      detail: 'A valid authenticated session is required for this operation.',
      status: 401,
      category: ErrorCategory.AUTHORIZATION,
      code: 'AUTHENTICATION_REQUIRED',
      userMessage: 'Please sign in and try again.',
      agentAction: { suggestedAction: 'AUTHENTICATE_AND_RETRY' },
    });
  }

  static notFound(resource = 'Resource'): SovereignError {
    return new SovereignError({
      type: 'https://polymath.network/errors/not-found',
      title: `${resource} Not Found`,
      detail: 'The requested resource could not be found.',
      status: 404,
      category: ErrorCategory.UNKNOWN,
      code: 'RESOURCE_NOT_FOUND',
      userMessage: 'That resource is no longer available.',
      agentAction: { suggestedAction: 'REFRESH_RESOURCE_AND_RETRY' },
    });
  }

  static unavailable(code = 'DEPENDENCY_UNAVAILABLE'): SovereignError {
    return new SovereignError({
      type: 'https://polymath.network/errors/dependency-unavailable',
      title: 'Service Unavailable',
      detail: 'A required platform dependency is unavailable.',
      status: 503,
      category: ErrorCategory.NETWORK,
      code,
      userMessage: 'The service is temporarily unavailable. Please try again shortly.',
      agentAction: { suggestedAction: 'RETRY_WITH_BACKOFF' },
    });
  }

  static conflict(code = 'CONFLICT'): SovereignError {
    return new SovereignError({
      type: 'https://polymath.network/errors/conflict',
      title: 'Conflict',
      detail: 'The requested change conflicts with the current resource state.',
      status: 409,
      category: ErrorCategory.DATABASE,
      code,
      userMessage: 'That change could not be applied because the data has changed.',
      agentAction: { suggestedAction: 'REFRESH_RESOURCE_AND_RETRY' },
    });
  }

  static invalidInput(detail = 'One or more fields are invalid.'): SovereignError {
    return new SovereignError({
      type: 'https://polymath.network/errors/invalid-input',
      title: 'Invalid Request',
      detail,
      status: 400,
      category: ErrorCategory.VALIDATION,
      code: 'INVALID_INPUT',
      userMessage: 'Please check the information you entered.',
      agentAction: { suggestedAction: 'CHECK_INPUT_AND_RETRY' },
    });
  }

  static rateLimited(retryAfter?: number): SovereignError {
    return new SovereignError({
      type: 'https://polymath.network/errors/rate-limited',
      title: 'Too Many Requests',
      detail: 'The request rate limit has been exceeded.',
      status: 429,
      category: ErrorCategory.NETWORK,
      code: 'RATE_LIMITED',
      userMessage: 'Please wait a moment before trying again.',
      agentAction: { suggestedAction: 'RETRY_WITH_BACKOFF', retryAfter },
    });
  }
}
