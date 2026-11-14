/**
 * Sovereign Function Invoker
 * Replaces direct @supabase/supabase-js functions.invoke with a decoupled, provider-agnostic HTTP runner.
 */

export async function invokeEdgeFunction<T = any>(
  functionName: string,
  options?: { body?: unknown; headers?: Record<string, string> },
): Promise<{ data: T | null; error: Error | null }> {
  try {
    const baseUrl =
      process.env.EXPO_PUBLIC_FUNCTIONS_URL ||
      process.env.EXPO_PUBLIC_SUPABASE_URL ||
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      'https://api.edlove.org';

    const anonKey =
      process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      '';

    const cleanBase = baseUrl.replace(/\/+$/, '');
    const url = cleanBase.includes('/functions/v1')
      ? `${cleanBase}/${functionName}`
      : `${cleanBase}/functions/v1/${functionName}`;

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(anonKey ? { Authorization: `Bearer ${anonKey}`, apikey: anonKey } : {}),
        ...(options?.headers ?? {}),
      },
      body: options?.body ? JSON.stringify(options.body) : undefined,
    });

    if (!res.ok) {
      return { data: null, error: new Error(`Function ${functionName} failed with status ${res.status}`) };
    }

    const data = (await res.json()) as T;
    return { data, error: null };
  } catch (err: unknown) {
    return { data: null, error: err instanceof Error ? err : new Error(String(err)) };
  }
}
