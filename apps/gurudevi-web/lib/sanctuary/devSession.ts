import { classifyGurudeviHost, isLocalPreviewHost } from '../host-routing';

export interface SanctuaryDevSession {
  readonly isDevSession: boolean;
  readonly accountId: string;
  readonly displayName: string;
  readonly capacity: string;
}

export interface ResolveSanctuaryDevSessionParams {
  readonly searchParams?: {
    readonly dev?: string;
    readonly mode?: string;
    readonly role?: string;
    readonly name?: string;
    readonly surface?: string;
  };
  readonly host: string;
  readonly cookieStore?: { get(name: string): { value: string } | undefined } | null;
}

const VALID_CAPACITIES = new Set([
  'TEACHER', 'STUDENT', 'PRINCIPAL', 'GUARDIAN', 'PARENT', 'LIBRARIAN', 'FOUNDER', 'RESEARCHER',
]);

/** Local development preview; this is not a persisted account or bond. */
export function resolveSanctuaryDevSession({
  searchParams, host, cookieStore,
}: ResolveSanctuaryDevSessionParams): SanctuaryDevSession {
  if (process.env.NODE_ENV === 'production') {
    return { isDevSession: false, accountId: '', displayName: '', capacity: '' };
  }
  const isExplicitDev = searchParams?.dev === 'true' || searchParams?.mode === 'sanctuary';
  const isLocalSanctuaryHost = classifyGurudeviHost(host) === 'sanctuary' && isLocalPreviewHost(host);
  if (!isExplicitDev && !isLocalSanctuaryHost) {
    return { isDevSession: false, accountId: '', displayName: '', capacity: '' };
  }
  const rawName = searchParams?.name || cookieStore?.get('gurudevi_dev_name')?.value || 'Dev Member';
  const rawRole = (searchParams?.role || cookieStore?.get('gurudevi_dev_role')?.value || 'TEACHER').toUpperCase();
  return {
    isDevSession: true,
    accountId: 'dev-sanctuary',
    displayName: decodeURIComponent(rawName),
    capacity: VALID_CAPACITIES.has(rawRole) ? rawRole : 'TEACHER',
  };
}
