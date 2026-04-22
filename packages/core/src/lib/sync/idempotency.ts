import { v5 as uuidv5 } from 'uuid';

// Fixed namespace for Polymath idempotency keys
const POLYMATH_NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';

/**
 * generateIdempotencyKey
 *
 * Creates a deterministic UUID-v5 hash from mutation metadata.
 * Same inputs always result in the same key, allowing the server
 * to deduplicate identical retries.
 */
export function generateIdempotencyKey(scope: string, name: string, variables: any): string {
  // Sort variables to ensure key stability if object order changes
  const stableVars = sortObject(variables);
  const inputString = `${scope}:${name}:${JSON.stringify(stableVars)}`;

  return uuidv5(inputString, POLYMATH_NAMESPACE);
}

/**
 * Deeply sorts an object's keys to ensure identical stringification.
 */
function sortObject(obj: any): any {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(sortObject);
  }

  return Object.keys(obj)
    .sort()
    .reduce((result: any, key) => {
      result[key] = sortObject(obj[key]);
      return result;
    }, {});
}
