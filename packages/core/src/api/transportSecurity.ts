const DEVELOPMENT_ENVIRONMENTS = new Set(['development', 'test']);

function isPrivateIpv4(hostname: string): boolean {
  const octets = hostname.split('.').map(Number);
  if (
    octets.length !== 4 ||
    octets.some((octet) => !Number.isInteger(octet) || octet < 0 || octet > 255)
  ) {
    return false;
  }

  const [first, second] = octets;
  return (
    first === 10 ||
    first === 127 ||
    (first === 172 && second !== undefined && second >= 16 && second <= 31) ||
    (first === 192 && second === 168)
  );
}

function isLocalDevelopmentHost(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, '');
  return host === 'localhost' || host === '::1' || isPrivateIpv4(host);
}

export function assertSecureApiUrl(input: string | URL): void {
  if (
    typeof process !== 'undefined' &&
    process.env.NODE_TLS_REJECT_UNAUTHORIZED === '0'
  ) {
    throw new Error('TLS certificate verification must remain enabled.');
  }

  let url: URL;
  try {
    url = input instanceof URL ? new URL(input.href) : new URL(input);
  } catch {
    throw new Error('The API URL must be an absolute HTTPS URL.');
  }

  if (
    (url.protocol !== 'https:' && url.protocol !== 'http:') ||
    url.username.length > 0 ||
    url.password.length > 0 ||
    url.href.includes('#')
  ) {
    throw new Error('The API URL is invalid or unsafe.');
  }

  if (url.protocol === 'https:') return;

  const nodeEnvironment = typeof process !== 'undefined' ? process.env.NODE_ENV : undefined;
  if (
    !DEVELOPMENT_ENVIRONMENTS.has(nodeEnvironment ?? '') ||
    !isLocalDevelopmentHost(url.hostname)
  ) {
    throw new Error('The API URL must use HTTPS outside local development.');
  }
}

export async function secureApiFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const requestUrl =
    typeof input === 'string' || input instanceof URL
      ? input
      : typeof Request !== 'undefined' && input instanceof Request
        ? input.url
        : String(input);
  assertSecureApiUrl(requestUrl);
  return globalThis.fetch(input, { ...init, redirect: 'error' });
}
