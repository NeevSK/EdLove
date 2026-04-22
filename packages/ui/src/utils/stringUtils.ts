/**
 * stringUtils.ts \u2014 Shared string manipulation helpers.
 *
 * These utilities are used across packages (ui, profile, community, classroom)
 * and were previously copy-pasted verbatim in 6 separate files.
 * Single source of truth: import from `@repo/ui`.
 */

/**
 * Returns up to `maxChars` initials from a display name.
 *
 * Behavior:
 *  - Single word  \u2192 up to 2 chars of that word, uppercased
 *  - Multiple words \u2192 first char of first word + first char of last word, uppercased
 *  - Null / empty  \u2192 '?'
 *
 * @example
 * getInitialsFromName('Amara Perera') // 'AP'
 * getInitialsFromName('Saman')        // 'SA'
 * getInitialsFromName(null)           // '?'
 */
export function getInitialsFromName(name?: string | null, maxChars: number = 2): string {
  if (!name?.trim()) return '?';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) {
    return (parts[0] ?? '').substring(0, maxChars).toUpperCase();
  }
  const first = (parts[0] ?? '').charAt(0);
  const last = (parts[parts.length - 1] ?? '').charAt(0);
  return (first + last).toUpperCase().slice(0, maxChars);
}
