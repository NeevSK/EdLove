import { assertSecureApiUrl } from '@repo/core/api/transportSecurity';
import { type AuthorizedEntryResult, mapAuthorizedEntry } from '@repo/core/web-authorized-entry';
import { ACTIVE_BOND_COOKIE, authoritativeFacts, readV1Entry } from './v1Entry';

export interface AccountEntryOptions {
  /** The API origin; defaults to this build's. */
  readonly origin?: string;
  readonly fetcher?: typeof fetch;
  /** The bond this browser last chose; only a choice, Sanctuary re-checks it on every command. */
  readonly selectedBond?: string;
}

/**
 * What a signed-in person may enter, from Sanctuary. The access token is only the credential:
 * Sanctuary verifies it and answers from its own bond records. Throws when Sanctuary can't be
 * reached or isn't configured securely, so the caller shows that rather than guessing.
 */
export async function readAccountEntry(
  accessToken: string,
  subject: string,
  {
    origin = process.env.NEXT_PUBLIC_API_URL ?? '',
    fetcher = fetch,
    selectedBond = readCookie(ACTIVE_BOND_COOKIE),
  }: AccountEntryOptions = {},
): Promise<AuthorizedEntryResult> {
  const base = origin.trim().replace(/\/+$/, '');
  if (!base) throw new Error('Sanctuary services are not configured in this build.');
  assertSecureApiUrl(base);
  const entry = await readV1Entry(base, accessToken, fetcher);
  return mapAuthorizedEntry(authoritativeFacts(entry, subject, selectedBond));
}

function readCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined;
  const match = document.cookie.split('; ').find((part) => part.startsWith(`${name}=`));
  return match === undefined ? undefined : decodeURIComponent(match.slice(name.length + 1));
}
