import { absoluteUrl, CRAWLER_RULES } from '@repo/core/site';
import type { APIRoute } from 'astro';

const list = (value: string | readonly string[] | undefined) =>
  value === undefined ? [] : typeof value === 'string' ? [value] : value;

export const GET: APIRoute = () => {
  const groups = CRAWLER_RULES.map((rule) =>
    [
      ...list(rule.userAgent).map((agent) => `User-agent: ${agent}`),
      ...list(rule.allow).map((path) => `Allow: ${path}`),
      ...list(rule.disallow).map((path) => `Disallow: ${path}`),
    ].join('\n'),
  );
  const body = `${groups.join('\n\n')}\n\nHost: ${absoluteUrl('/')}\nSitemap: ${absoluteUrl('/sitemap-index.xml')}\n`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
