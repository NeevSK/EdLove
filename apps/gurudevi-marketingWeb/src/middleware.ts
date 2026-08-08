import { defineMiddleware } from 'astro:middleware';

function addSecurityHeaders(response: Response): Response {
  const headers = new Headers(response.headers);
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('X-Frame-Options', 'DENY');
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export const onRequest = defineMiddleware(async (context, next) => {
  const url = new URL(context.request.url);

  // PostHog Reverse Proxy to bypass ad-blockers and ensure EU data residency
  if (url.pathname.startsWith('/ingest/')) {
    const posthogBase = 'https://eu.i.posthog.com';
    const path = url.pathname.replace(/^\/ingest\//, '/');
    const posthogUrl = new URL(path, posthogBase);

    // Forward all query parameters
    url.searchParams.forEach((value, key) => {
      posthogUrl.searchParams.append(key, value);
    });

    const requestHeaders = new Headers(context.request.headers);
    requestHeaders.set('Host', 'eu.i.posthog.com');

    // Remove headers that might interfere with proxying
    requestHeaders.delete('cookie');

    try {
      const response = await fetch(posthogUrl.toString(), {
        method: context.request.method,
        headers: requestHeaders,
        body:
          context.request.method !== 'GET' && context.request.method !== 'HEAD'
            ? context.request.body
            : undefined,
        // @ts-expect-error - Required for Node.js fetch with body
        duplex: 'half',
      });

      // Clone response to modify headers if needed
      const responseHeaders = new Headers(response.headers);
      responseHeaders.set('Access-Control-Allow-Origin', '*');

      return addSecurityHeaders(new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
      }));
    } catch (error) {
      console.error('PostHog Proxy Error:', error);
      return new Response('PostHog Proxy Error', { status: 502 });
    }
  }

  return addSecurityHeaders(await next());
});
