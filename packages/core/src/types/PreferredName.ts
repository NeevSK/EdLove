/**
 * PreferredName.ts — Canonical Preferred Name Domain Contract
 *
 * Single source of truth across Web and Mobile for candidate name extraction,
 * first name derivation, validation constraints, and UI prompts during
 * onboarding and profile enrollment.
 */

export interface NameValidationResult {
  valid: boolean;
  error?: string;
}

export const CANONICAL_NAME_PROMPTS = {
  title: 'What should we call you?',
  titleWithDetected: (detected: string) => `Welcome, ${detected}`,
  detectedPrompt: (detected: string) =>
    `Should we call you ${detected}, or do you prefer another name?`,
  fieldLabel: 'Preferred name',
  placeholder: 'e.g. Ananda or Teacher Sam',
  helperText: 'You can change this anytime in your settings.',
  callMeAction: (detected: string) => `Call me ${detected} →`,
  useDifferentAction: 'Use a different name',
  backToDetectedAction: (detected: string) => `← Back to “${detected}”`,
  nextAction: 'Next →',
  backAction: 'Back',
} as const;

export const PREFERRED_NAME_MAX_LENGTH = 120;

/**
 * Validates a user-entered preferred name against sanctuary constraints.
 */
export function validatePreferredName(name: string): NameValidationResult {
  const trimmed = name.trim();
  if (!trimmed) {
    return { valid: false, error: 'Please enter your preferred name.' };
  }
  if (trimmed.length > PREFERRED_NAME_MAX_LENGTH) {
    return {
      valid: false,
      error: `Preferred name must be ${PREFERRED_NAME_MAX_LENGTH} characters or fewer.`,
    };
  }
  return { valid: true };
}

/**
 * Extracts a friendly first name or greeting segment from a full preferred name.
 */
export function extractFirstName(displayName: string, fallback = 'there'): string {
  if (!displayName || typeof displayName !== 'string') return fallback;
  const parts = displayName.trim().split(/\s+/);
  return parts[0] || fallback;
}

/**
 * Deterministically extracts candidate full/first name from various identity substrates:
 * - Supabase Auth User metadata (full_name, name, given_name + family_name)
 * - Structured object metadata ({ firstName, lastName })
 * - Direct profile record (display_name)
 * - Safe fallback parsing of email local-part into title-cased words
 */
export function extractCandidateName(user: unknown): string {
  if (typeof user !== 'object' || user === null) return '';

  // Direct display_name property
  const directDisplayName = Reflect.get(user, 'display_name') ?? Reflect.get(user, 'displayName');
  if (typeof directDisplayName === 'string' && directDisplayName.trim()) {
    return directDisplayName.trim();
  }

  // Inspect user_metadata / metadata
  const meta =
    (Reflect.get(user, 'user_metadata') as Record<string, unknown> | null) ||
    (Reflect.get(user, 'metadata') as Record<string, unknown> | null) ||
    {};

  if (typeof meta.full_name === 'string' && meta.full_name.trim()) {
    return meta.full_name.trim();
  }
  if (typeof meta.name === 'string' && meta.name.trim()) {
    return meta.name.trim();
  }
  if (meta.name && typeof meta.name === 'object') {
    const first = String(
      Reflect.get(meta.name, 'firstName') ?? Reflect.get(meta.name, 'first_name') ?? '',
    ).trim();
    const last = String(
      Reflect.get(meta.name, 'lastName') ?? Reflect.get(meta.name, 'last_name') ?? '',
    ).trim();
    const combined = `${first} ${last}`.trim();
    if (combined) return combined;
  }
  if (typeof meta.given_name === 'string' && meta.given_name.trim()) {
    const family = typeof meta.family_name === 'string' ? meta.family_name.trim() : '';
    return `${meta.given_name} ${family}`.trim();
  }

  // Inspect direct profile sub-object
  const profile = Reflect.get(user, 'profile') as Record<string, unknown> | null;
  if (profile && typeof profile === 'object') {
    const profileName = profile.display_name ?? profile.name;
    if (typeof profileName === 'string' && profileName.trim()) {
      return profileName.trim();
    }
  }

  // Safe fallback: clean email local-part (e.g. "ananda.silva@domain.com" -> "Ananda Silva")
  const email = Reflect.get(user, 'email');
  if (typeof email === 'string' && email.includes('@')) {
    const local = email.split('@')[0] ?? '';
    const cleaned = local
      .replace(/[._+-]+/g, ' ')
      .replace(/\d+/g, '')
      .trim();
    if (cleaned.length >= 2) {
      return cleaned
        .split(/\s+/)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    }
  }

  return '';
}
