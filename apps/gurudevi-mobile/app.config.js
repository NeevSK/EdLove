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
    },
  },
});
