import type { APIRoute, GetStaticPaths } from 'astro';
import {
  BADGE_LANGS,
  BADGE_THEMES,
  type BadgeLang,
  type BadgeTheme,
  renderSchoolBadge,
} from '../../../lib/schoolBadge';

// The Gurudevi badge per world and language, built at deploy time. A badge naming a school waits
// on the school-subdomain decision (docs/decisions/2026-11-12-web-stack-astro-vite.md).
export const getStaticPaths = (() =>
  BADGE_THEMES.flatMap((theme) =>
    BADGE_LANGS.map((lang) => ({ params: { theme, lang } })),
  )) satisfies GetStaticPaths;

export const GET: APIRoute<never, { theme: BadgeTheme; lang: BadgeLang }> = ({ params }) =>
  new Response(renderSchoolBadge({ theme: params.theme, lang: params.lang }), {
    headers: { 'Content-Type': 'image/svg+xml; charset=utf-8' },
  });
