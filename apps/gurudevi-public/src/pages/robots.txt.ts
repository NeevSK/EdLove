import { robotsTxt } from '@repo/core/site';
import type { APIRoute } from 'astro';

export const GET: APIRoute = () =>
  new Response(robotsTxt(), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
