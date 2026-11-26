/**
 * Citizenship model — registration depth, not pricing.
 *
 * FIRST_CLASS  = 1  Highest access. Bonded to a real school entity.
 * SECOND_CLASS = 2  Authenticated personal-use registration.
 * THIRD_CLASS  = 3  Lowest authenticated registration level.
 *
 * There is no guest citizenship. The persisted WANDERER value is a legacy
 * alias normalized to THIRD_CLASS during context hydration/migration.
 *
 * Lower number = more access.
 * Never write the comparison inline — always call meetsCitizenship().
 */

export const CITIZENSHIP = {
  FIRST_CLASS: 1,
  SECOND_CLASS: 2,
  THIRD_CLASS: 3,
} as const;

export type CitizenshipLevel = (typeof CITIZENSHIP)[keyof typeof CITIZENSHIP];
// resolves to: 1 | 2 | 3

export type CitizenshipName = keyof typeof CITIZENSHIP;
// resolves to: 'FIRST_CLASS' | 'SECOND_CLASS' | 'THIRD_CLASS'

/**
 * meetsCitizenship — the only place the comparison is written.
 *
 * Returns true if the user's citizenship level is sufficient
 * for the required level.
 *
 * Examples:
 *   meetsCitizenship(1, 1) → true   (First Class meets First Class req)
 *   meetsCitizenship(2, 1) → false  (Second Class does not meet First Class req)
 *   meetsCitizenship(3, 3) → true   (Third Class meets Third Class req)
 *   meetsCitizenship(1, 3) → true   (First Class meets any requirement)
 */
export function meetsCitizenship(
  userCitizenship: CitizenshipLevel,
  required: CitizenshipLevel,
): boolean {
  return userCitizenship <= required;
}

/**
 * citizenshipName — readable name for display and logging.
 */
export function citizenshipName(level: CitizenshipLevel): CitizenshipName {
  const entry = Object.entries(CITIZENSHIP).find(([, v]) => v === level);
  if (!entry) throw new Error(`Unknown citizenship level: ${level}`);
  return entry[0] as CitizenshipName;
}
