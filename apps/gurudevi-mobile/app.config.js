/**
 * Runtime configuration bridge for public Expo values.
 *
 * EXPO_PUBLIC_* values are available to the Expo CLI while it evaluates the
 * app config, but package source under the monorepo is not always transformed
 * by Metro's env inliner. Keep the values in Expo's public manifest as a
 * deterministic fallback. These are public client values, not service keys.
 */
module.exports = ({ config }) => ({
  ...config,
  extra: {
    ...(config.extra || {}),
    publicRuntime: {
      ...(config.extra?.publicRuntime || {}),
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL || undefined,
      supabasePublishableKey: process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY || undefined,
      // Reserved for future Hub Pull federation (Tier 1) — leave empty unless
      // you implement GET hub/api/library/nodes → local nodes upsert.
      // ADR: docs/decisions/2026-08-25-transparent-hosted-oss.md Seam C.
      libraryUpstreamUrl: process.env.EXPO_PUBLIC_LIBRARY_UPSTREAM_URL || undefined,
    },
  },
});
