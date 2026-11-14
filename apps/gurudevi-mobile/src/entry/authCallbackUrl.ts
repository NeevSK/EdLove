type AuthCallbackQueryValue = string | readonly string[] | undefined;

/**
 * Reconstruct the canonical native callback URL after Expo Router has safely
 * normalized an operating-system deep link into the internal callback route.
 * Repeated values are retained so the core callback policy can reject them.
 */
export function createNativeAuthCallbackUrl(
  params: Readonly<Record<string, AuthCallbackQueryValue>>,
): string {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (typeof value === 'string') {
      query.append(key, value);
      continue;
    }

    for (const item of value ?? []) {
      query.append(key, item);
    }
  }

  const search = query.toString();
  return search ? `gurudevi://auth/callback?${search}` : 'gurudevi://auth/callback';
}
