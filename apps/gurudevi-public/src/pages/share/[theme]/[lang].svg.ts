import type { APIRoute, GetStaticPaths } from 'astro';
import {
  type OgLang,
  type OgTheme,
  renderShareImage,
  SHARE_LANGS,
  SHARE_THEMES,
} from '../../../lib/shareImage';

// One share card per world and language, built at deploy time. Cards naming a school wait on
// the school-subdomain decision (docs/decisions/2026-11-12-web-stack-astro-vite.md).
export const getStaticPaths = (() =>
  SHARE_THEMES.flatMap((theme) =>
    SHARE_LANGS.map((lang) => ({ params: { theme, lang } })),
  )) satisfies GetStaticPaths;

export const GET: APIRoute<never, { theme: OgTheme; lang: OgLang }> = ({ params }) =>
  new Response(renderShareImage({ theme: params.theme, lang: params.lang }), {
    headers: { 'Content-Type': 'image/svg+xml; charset=utf-8' },
  });
