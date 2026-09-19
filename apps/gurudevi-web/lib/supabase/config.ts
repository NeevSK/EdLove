export type SupabaseConfig = Readonly<{
  url: string;
  publishableKey: string;
}>;

function normalized(value: string | undefined): string | null {
  const trimmed = value?.trim().replace(/^['\"]|['\"]$/g, '');
  return trimmed ? trimmed : null;
}

export function supabaseConfig(): SupabaseConfig | null {
  const url = normalized(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const publishableKey = normalized(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);

  if (!url || !publishableKey) return null;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return null;
  } catch {
    return null;
  }
  return { url, publishableKey };
}
