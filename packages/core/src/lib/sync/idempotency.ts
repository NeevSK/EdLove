import crypto from 'isomorphic-webcrypto';

/**
 * generateIdempotencyKey
 *
 * Creates a deterministic SHA-256 hash from mutation metadata and an event salt.
 * Uses the Asynchronous path (WebCrypto) for future-proof execution.
 *
 * @param scope - The feature scope (e.g., 'community')
 * @param eventType - The specific event name or salt (e.g., 'CHECK_PULSE')
 * @param variables - The payload variables to hash
 * @param studentId - Optional student auth_id to incorporate into the salt
 */
export async function generateIdempotencyKey(
  scope: string,
  eventType: string,
  variables: unknown,
  studentId?: string,
): Promise<string> {
  const salt = studentId ? `${studentId}:${eventType}` : eventType;
  const stableVars = sortObject(variables);
  const inputString = `${scope}:${salt}:${JSON.stringify(stableVars)}`;

  const encoder = new TextEncoder();
  const data = encoder.encode(inputString);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);

  // Convert buffer to hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Deeply sorts an object's keys to ensure identical stringification.
 */
function sortObject(obj: unknown): unknown {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(sortObject);
  }

  const typedObj = obj as Record<string, unknown>;
  return Object.keys(typedObj)
    .sort()
    .reduce((result: Record<string, unknown>, key) => {
      result[key] = sortObject(typedObj[key]);
      return result;
    }, {});
}
