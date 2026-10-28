import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactCompiler: true,
  transpilePackages: ['@repo/self', '@repo/ui'],
  // Doppler already supplies these public values to the native app. Expose the
  // same values under Next's browser-safe names; no second Supabase project or
  // credential copy is introduced for the web application.
  env: {
    NEXT_PUBLIC_SUPABASE_URL:
      process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
      process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
      '',
  },
  async rewrites() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'status.gurudevi.app',
          },
        ],
        destination: '/status',
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/auth',
        destination: '/sign-in',
        permanent: false,
      },
      {
        source: '/sign-up',
        destination: '/sign-in?intent=signup',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
