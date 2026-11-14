import { SITE_URL } from '../lib/site';

export function GET() {
  const body = [
    '# EdLove Foundation Robots & Discovery Configuration',
    'User-agent: *',
    'Content-Signal: search=yes, ai-input=yes, ai-train=no',
    'Allow: /',
    'Disallow: /api/',
    '',
    '# AI Search & Citation Agents (Allowed for real-time reference and answer attribution)',
    'User-agent: OAI-SearchBot',
    'User-agent: PerplexityBot',
    'User-agent: Claude-SearchBot',
    'Allow: /',
    '',
    '# Foundation Model Training Opt-Out',
    'User-agent: Google-Extended',
    'User-agent: Applebot-Extended',
    'User-agent: CCBot',
    'Disallow: /',
    '',
    `Sitemap: ${SITE_URL}/sitemap-index.xml`,
    `Host: ${SITE_URL}`,
  ].join('\n');

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}
