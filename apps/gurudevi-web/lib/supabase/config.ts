import { assertSecureApiUrl } from '@repo/core/api/transportSecurity';

export type SupabaseConfig = Readonly<{
  url: string;
  publishableKey: string;
}>;

function normalized(value: string | undefined): string | null {
  const trimmed = value?.trim().replace(/^['\"]|['\"]$/g, '');
  return trimmed ? trimmed : null;
}

export function supabaseConfig(): SupabaseConfig | null {
  const url = normalized(
    process.env.NEXT_PUBLIC_SUPABASE_URL ??
      process.env.EXPO_PUBLIC_SUPABASE_URL ??
      process.env.SUPABASE_URL,
  );
  const publishableKey = normalized(
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
      process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
      process.env.SUPABASE_ANON_KEY,
  );

  if (!url || !publishableKey) return null;
  try {
    assertSecureApiUrl(url);
  } catch {
    return null;
  }
  return { url, publishableKey };
}
