/**
 * Privacy boundary for third-party telemetry.
 *
 * Product analytics may contain small, intentional dimensions, but it must
 * never become a second database of identity or educational records. Nested
 * objects are dropped rather than serialized because they are difficult to
 * audit and redact consistently.
 */
export type SafeTelemetryValue = string | number | boolean | null;

const SENSITIVE_KEY_NAMES = new Set([
  'email',
  'username',
  'display_name',
  'full_name',
  'phone',
  'user_id',
  'student_id',
  'school_id',
  'classroom_id',
  'group_id',
  'resource_id',
  'assignment_id',
  'conversation_id',
  'message',
  'content',
  'body',
  'description',
  'metadata',
  'notes',
]);

// Catalog identifiers are not user/resource identifiers and are safe for
// product comparison. Keep this exception explicit rather than weakening the
// general *_id protection.
const SAFE_CATALOG_KEY_NAMES = new Set(['feature_id']);

function isSensitiveKey(key: string): boolean {
  const normalized = key.trim().toLowerCase();
  if (SAFE_CATALOG_KEY_NAMES.has(normalized)) return false;
  return SENSITIVE_KEY_NAMES.has(normalized) || normalized.endsWith('_id');
}

function isSafeValue(value: unknown): value is SafeTelemetryValue {
  return value === null || ['string', 'number', 'boolean'].includes(typeof value);
}

export function sanitizeTelemetryData(
  data?: Record<string, unknown>,
): Record<string, SafeTelemetryValue> {
  if (!data) return {};

  const safeData: Record<string, SafeTelemetryValue> = {};
  for (const [key, value] of Object.entries(data)) {
    if (!isSensitiveKey(key) && isSafeValue(value)) {
      safeData[key] = value;
    }
  }
  return safeData;
}
