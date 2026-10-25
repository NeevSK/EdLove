import { check as checkCedar, type AuthRequest, type AuthResponse } from '@repo/policies';

type RustEvaluatorResponse = {
  contract_version: number;
  request_id: string;
  permitted: boolean;
  reason: string;
  evaluator: string;
  policy_version: string;
};

const CONTRACT_VERSION = 1;

export class RustEvaluatorUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RustEvaluatorUnavailableError';
  }
}

export async function evaluateWithRust(
  request: AuthRequest,
  requestId: string,
): Promise<AuthResponse> {
  const socketPath = process.env.SANCTUARY_CEDAR_SOCKET_PATH;
  const endpoint = process.env.SANCTUARY_RUST_EVALUATOR_URL || 'http://127.0.0.1:8788';
  const strictMode = process.env.SANCTUARY_STRICT_RUST_AUTHZ === 'true';

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 1500);

  try {
    const fetchUrl = socketPath ? 'http://localhost/v1/authorize' : `${endpoint}/v1/authorize`;
    const fetchOptions: RequestInit & { unix?: string } = {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-request-id': requestId },
      body: JSON.stringify({
        contract_version: CONTRACT_VERSION,
        request_id: requestId,
        principal: {
          type: request.principal.type,
          id: request.principal.id,
          attributes: request.principal.attributes,
        },
        action: request.action,
        resource: request.resource,
        context: request.context || {},
      }),
      signal: controller.signal,
      ...(socketPath ? { unix: socketPath } : {}),
    };

    const response = await fetch(fetchUrl, fetchOptions as any);

    if (!response.ok) {
      throw new RustEvaluatorUnavailableError(`Rust evaluator returned HTTP ${response.status}`);
    }

    const result = (await response.json()) as RustEvaluatorResponse;
    if (result.contract_version !== CONTRACT_VERSION || typeof result.permitted !== 'boolean') {
      throw new RustEvaluatorUnavailableError('Rust evaluator returned an incompatible response');
    }

    return {
      permitted: result.permitted,
      reason: `${result.reason} (${result.evaluator}@${result.policy_version})`,
      gaps: [],
    };
  } catch (error) {
    if (strictMode) {
      if (error instanceof RustEvaluatorUnavailableError) throw error;
      throw new RustEvaluatorUnavailableError(
        `Rust evaluator request failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
    // Graceful fallback to in-process policy evaluation engine
    return checkCedar(request);
  } finally {
    clearTimeout(timeoutId);
  }
}
