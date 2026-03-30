/**
 * isFieldFilled \u2014 determines if a UserProfile field value counts as "filled".
 *
 * Rules:
 *  - null / undefined   \u2192 false
 *  - empty string ""    \u2192 false
 *  - number 0           \u2192 false  (experience_years = 0 means "not set")
 *  - empty array []     \u2192 false
 *  - anything else      \u2192 true
 */
export function isFieldFilled(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (typeof value === 'number') return value !== 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}
