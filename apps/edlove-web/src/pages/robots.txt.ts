import { SITE_URL } from '../lib/site';

export function GET() {
  const body = [
    '# EdLove Foundation Robots & Discovery Configuration',
    '# Standard: RFC 9309 + AI Crawl Control & Content-Signal Standard',
    'User-agent: *',
    'Content-Signal: search=yes, ai-input=yes, ai-train=no',
    'Allow: /',
    'Disallow: /api/',
    '',
    '# Tier 1: Canonical Web Search Engines (Full Indexing Allowed)',
    'User-agent: Googlebot',
    'User-agent: Bingbot',
    'User-agent: DuckDuckBot',
    'User-agent: Slurp',
    'User-agent: Baiduspider',
    'User-agent: YandexBot',
    'Allow: /',
    '',
    '# Tier 2: Real-time AI Search, Answer Engines & Attribution Bots (Allowed for citation with attribution)',
    'User-agent: OAI-SearchBot',
    'User-agent: PerplexityBot',
    'User-agent: Claude-SearchBot',
    'Allow: /',
    '',
    '# Tier 3: Foundation Model Bulk Training Scrapers (Disallowed without reciprocal licensing)',
    'User-agent: GPTBot',
    'User-agent: CCBot',
    'User-agent: ClaudeBot',
    'User-agent: Anthropic-AI',
    'User-agent: Google-Extended',
    'User-agent: Applebot-Extended',
    'User-agent: Bytespider',
    'User-agent: Diffbot',
    'User-agent: Amazonbot',
    'Disallow: /',
    '',
    `Sitemap: ${SITE_URL}/sitemap-index.xml`,
    `Host: ${SITE_URL}`,
  ].join('\n');

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  });
}
