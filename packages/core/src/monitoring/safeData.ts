/**
 * Privacy boundary for third-party telemetry.
 *
 * Product analytics may contain small, intentional dimensions, but it must
 * never become a second database of identity or educational records. Nested
 * objects are dropped rather than serialized because they are difficult to
 * audit and redact consistently.
 */
export type SafeTelemetryValue = string | number | boolean | null;

const MAX_INPUT_PROPERTIES = 64;
const MAX_SAFE_PROPERTIES = 32;
const MAX_KEY_CODE_UNITS = 64;
const MAX_STRING_CODE_UNITS = 120;
const MAX_JSON_CODE_UNITS = 4096;

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
  if (value === null || typeof value === 'boolean') return true;
  if (typeof value === 'number') return Number.isFinite(value);
  return typeof value === 'string' && value.length <= MAX_STRING_CODE_UNITS;
}

export function sanitizeTelemetryData(
  data?: Record<string, unknown>,
): Record<string, SafeTelemetryValue> {
  if (!data) return {};

  const safeData: Record<string, SafeTelemetryValue> = {};
  let inspected = 0;
  let safePropertyCount = 0;
  let jsonCodeUnits = 2;
  for (const key in data) {
    inspected += 1;
    if (inspected > MAX_INPUT_PROPERTIES) break;
    if (!Object.prototype.hasOwnProperty.call(data, key)) continue;
    const value = data[key];
    if (key.length > MAX_KEY_CODE_UNITS || isSensitiveKey(key) || !isSafeValue(value)) continue;

    const propertyCodeUnits =
      JSON.stringify(key).length +
      1 +
      JSON.stringify(value).length +
      (safePropertyCount > 0 ? 1 : 0);
    if (
      safePropertyCount >= MAX_SAFE_PROPERTIES ||
      jsonCodeUnits + propertyCodeUnits > MAX_JSON_CODE_UNITS
    ) {
      continue;
    }
    safeData[key] = value;
    safePropertyCount += 1;
    jsonCodeUnits += propertyCodeUnits;
  }
  return safeData;
}
