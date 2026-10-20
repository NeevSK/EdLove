import type { MetadataRoute } from 'next';
import { absoluteUrl } from './seo';

const PRIVATE_SANCTUARY_PATHS = [
  '/api/',
  '/auth/',
  '/self/',
  '/workspace/',
  '/library/',
  '/community/',
  '/claim/',
  '/profile/',
  '/settings/',
  '/onboarding/',
  '/recovery/',
  '/reset-password/',
] as const;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Standard search engine & web discovery crawlers
      {
        userAgent: '*',
        allow: '/',
        disallow: [...PRIVATE_SANCTUARY_PATHS],
      },
      // Search and Citation bots (Google, Bing, Apple Intelligence, DuckDuckGo)
      {
        userAgent: ['Googlebot', 'Bingbot', 'Applebot', 'DuckDuckBot'],
        allow: '/',
        disallow: [...PRIVATE_SANCTUARY_PATHS],
      },
      // AI Search & Answer Engine citation bots (ChatGPT Search, Perplexity, Claude Search)
      {
        userAgent: ['OAI-SearchBot', 'PerplexityBot', 'Claude-SearchBot'],
        allow: '/',
        disallow: [...PRIVATE_SANCTUARY_PATHS],
      },
      // AI Foundation Model Training bots (Allow public editorial education only, shield user app)
      {
        userAgent: ['GPTBot', 'ClaudeBot', 'anthropic-ai'],
        allow: ['/about', '/faq', '/thuthimal', '/journal/', '/authors/'],
        disallow: [...PRIVATE_SANCTUARY_PATHS, '/sign-in', '/sign-up', '/welcome'],
      },
      // Restrict aggressive training crawlers that ignore fair use or lack citation attribution
      {
        userAgent: ['Google-Extended', 'Applebot-Extended', 'CCBot'],
        disallow: ['/'],
      },
    ],
    sitemap: absoluteUrl('/sitemap.xml'),
    host: absoluteUrl('/'),
  };
}
