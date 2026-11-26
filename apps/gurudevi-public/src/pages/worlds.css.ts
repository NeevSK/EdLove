import type { APIRoute } from 'astro';
import { worldsCss } from '@repo/ui/theme/web';

// The same CSS `WorldStyles` inlines on every Next page, written once at build time as a file
// the browser caches across pages and visits.
export const GET: APIRoute = () =>
  new Response(worldsCss(), { headers: { 'Content-Type': 'text/css; charset=utf-8' } });
