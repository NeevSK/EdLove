/**
 * isFieldFilled — determines if a UserProfile field value counts as "filled".
 *
 * Rules:
 *  - null / undefined   → false
 *  - empty string ""    → false
 *  - number 0           → false  (experience_years = 0 means "not set")
 *  - empty array []     → false
 *  - anything else      → true
 */
export function isFieldFilled(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (typeof value === 'number') return value !== 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}
