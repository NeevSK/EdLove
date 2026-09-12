export type SupabaseConfig = Readonly<{
  url: string;
  publishableKey: string;
}>;

function configured(value: string | undefined): value is string {
  return Boolean(value?.trim());
}

export function supabaseConfig(): SupabaseConfig | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!configured(url) || !configured(publishableKey)) return null;
  return { url, publishableKey };
}
