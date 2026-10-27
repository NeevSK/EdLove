import { GrowthBook } from '@growthbook/growthbook';
import { swaggerUI } from '@hono/swagger-ui';
import { OpenAPIHono } from '@hono/zod-openapi';
import { ORPCError } from '@orpc/server';
import { type SovereignRoute } from '@repo/core/api/server';
import { satisfiesEntitlementRequirement } from '@repo/core/logic/ports/entitlement.port';
import {
  type FeatureFlagKey,
  resolveFeatureFlagValue,
} from '@repo/core/logic/registry/featureLifecycleManifest';
import { normalizeError } from '@repo/core/logic/utils/errorNormalizer';
import { canUseZenStackDb, createZenStackDb, queryDatabaseRows } from '@repo/database/client';
import { check as checkCedar } from '@repo/policies';
import { apiReference } from '@scalar/hono-api-reference';
import * as Sentry from '@sentry/node';
import { bodyLimit } from 'hono/body-limit';
import { compress } from 'hono/compress';
import { cors } from 'hono/cors';
import { csrf } from 'hono/csrf';
import { etag } from 'hono/etag';
import { createFactory } from 'hono/factory';
import { HTTPException } from 'hono/http-exception';
import { logger } from 'hono/logger';
import { requestId } from 'hono/request-id';
import { secureHeaders } from 'hono/secure-headers';
import { timeout } from 'hono/timeout';
import { endTime, startTime, timing } from 'hono/timing';
import pino from 'pino';
import { PostHog } from 'posthog-node';
import { z } from 'zod';
import { aiRouter } from '../ai/routes';
import { evaluateWithRust, RustEvaluatorUnavailableError } from '../authorization/rustEvaluator';
import { createMcpDoor } from '../doors/mcp';
import { createOmnichannelDoor } from '../doors/omnichannel';
import { createWebSocketDoor } from '../doors/ws';
import { getCurrentTraceId, otelMiddleware } from '../telemetry/otel';
import { toSafeErrorTelemetry } from '../telemetry/safeErrorTelemetry';
import { canonicalV1Router } from './canonicalV1Registry';
import { correlationIdMiddleware, extractCorrelationIdMiddleware } from './middleware/correlation';
import { createIdentityBridge } from './middleware/identityBridge';
import { createPqcMiddleware } from './middleware/pqcMiddleware';
import { isOnboardingBootstrapProcedure } from './onboardingBootstrap';
import { type ORPCContext } from './orpc';
import { createConfiguredRateLimitStore, createRateLimitMiddleware } from './rateLimit';
import {
  buildORPCContextFromHono,
  router as orpcRouter,
  resolveServerDerivedAuthority,
} from './router';
import { createAdRewardRoutes } from './routes/adRewards';
import { createAuthCredentialRoutes } from './routes/authCredentials';
import { createAuthGatewayRoutes } from './routes/authGateway';
import { createAuthSyncRoutes } from './routes/authSync';
import { registerCanonicalV1Routes } from './routes/canonicalV1';
import { createDurableAgentRoutes } from './routes/durableAgents';
import { eventsStreamRoutes } from './routes/eventsStream';
import { healthRoutes } from './routes/health';
import { registerNativeORPCRoutes } from './routes/orpc';
import {
  type RequestIdEnv,
  requireHttpsMiddleware,
  resolveAllowedCorsOrigin,
} from './transportSecurity';

// Initialize Sentry
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: 0.1,
    // Attach trace context to errors
    beforeSend(event, hint) {
      const traceId = getCurrentTraceId?.();
      if (traceId) {
        event.tags = { ...event.tags, traceId };
      }
      return event;
    },
  });
}

// Initialize PostHog
let posthog: PostHog | null = null;
if (process.env.POSTHOG_API_KEY && process.env.POSTHOG_HOST) {
  posthog = new PostHog(process.env.POSTHOG_API_KEY, {
    host: process.env.POSTHOG_HOST,
    flushAt: 1,
    flushInterval: 10000,
  });
}

// Initialize GrowthBook
let growthbook: GrowthBook | null = null;
if (process.env.GROWTHBOOK_API_HOST && process.env.GROWTHBOOK_CLIENT_KEY) {
  growthbook = new GrowthBook({
    apiHost: process.env.GROWTHBOOK_API_HOST,
    clientKey: process.env.GROWTHBOOK_CLIENT_KEY,
    enableDevMode: process.env.NODE_ENV !== 'production',
    // Track feature usage
    trackingCallback: (experiment, result) => {
      posthog?.capture({
        distinctId: experiment.key,
        event: 'experiment_viewed',
        properties: {
          experiment_id: experiment.key,
          variation_id: result.variationId,
          value: result.value,
        },
      });
    },
  });
  // Load features on startup
  growthbook.loadFeatures().catch(console.error);
}

const loggerInstance = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV !== 'production' ? { target: 'pino-pretty' } : undefined,
});

interface Env extends RequestIdEnv {
  Variables: {
    db: ReturnType<typeof createZenStackDb>;
    user: { id: string };
    capacity: string | null;
    activeBondId: string | null;
    activeEntityId: string | null;
    activeEntityType: string | null;
    schoolId: string;
    requestId: string;
  };
}

export const app = new OpenAPIHono<Env>();
const factory = createFactory<Env>();

app.onError((c, next) => {
  const err = c.error;
  const requestId = c.get('requestId') || 'unknown';
  const traceId = getCurrentTraceId() || undefined;
  const sovereign = normalizeError(err, requestId);
  const safeError = toSafeErrorTelemetry(err, sovereign.details.code, sovereign.details.status);
  const headers = new Headers(c.res?.headers);

  if (err instanceof HTTPException) {
    const res = err.getResponse();
    for (const [key, value] of res.headers.entries()) {
      if (!headers.has(key)) {
        headers.set(key, value);
      }
    }
  }
  // The HTTPException response body is intentionally replaced by the problem
  // document below, so its content length must not be retained.
  headers.delete('Content-Length');
  headers.set('Content-Type', 'application/problem+json; charset=utf-8');

  loggerInstance.error({ ...safeError, requestId, traceId }, 'Sanctuary API request failed');
  if (process.env.SENTRY_DSN) {
    Sentry.captureMessage(safeError.message, {
      level: 'error',
      extra: { ...safeError, requestId, traceId },
      tags: { component: 'sanctuary-api', code: safeError.code },
    });
  }
  return new Response(JSON.stringify(sovereign.details), {
    status: sovereign.details.status,
    headers,
  });
});

// Helper to retrieve environment variables safely across runtimes.
function getEnv(key: string): string | undefined {
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key];
  }
  if (typeof globalThis !== 'undefined' && (globalThis as any).ENV) {
    return (globalThis as any).ENV[key];
  }
  return undefined;
}

function assertProductionTransportConfiguration() {
  if (getEnv('NODE_ENV') !== 'production') return;
  if (!getEnv('SUPABASE_JWT_ISSUER') || !getEnv('SUPABASE_JWT_AUDIENCE')) {
    throw new Error(
      'Production requires SUPABASE_JWT_ISSUER and SUPABASE_JWT_AUDIENCE for JWT claim verification.',
    );
  }
  if (!getEnv('SUPABASE_URL') && !getEnv('SUPABASE_JWT_PUBLIC_KEY')) {
    throw new Error(
      'Production requires SUPABASE_URL or SUPABASE_JWT_PUBLIC_KEY for JWT signature verification.',
    );
  }
  if (
    !getEnv('SUPABASE_URL') ||
    !(
      getEnv('SUPABASE_PUBLISHABLE_KEY') ||
      getEnv('EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY') ||
      getEnv('SUPABASE_ANON_KEY') ||
      getEnv('EXPO_PUBLIC_SUPABASE_ANON_KEY')
    )
  ) {
    throw new Error(
      'Production requires SUPABASE_URL and a publishable/anon key for live session verification.',
    );
  }
  if (getEnv('RATE_LIMIT_STORE') !== 'postgres') {
    throw new Error('Production requires RATE_LIMIT_STORE=postgres for shared rate limiting.');
  }
  if (!getEnv('RATE_LIMIT_TRUSTED_PROXY_HEADER')) {
    throw new Error(
      'Production requires RATE_LIMIT_TRUSTED_PROXY_HEADER to identify clients safely.',
    );
  }
}

assertProductionTransportConfiguration();

// Pure JS MD5 implementation to ensure 100% WinterCG compliance (standard Web Crypto does not mandate MD5)
async function md5Hex(str: string): Promise<string> {
  const k = [
    0xd76aa478, 0xe8c7b756, 0x242070db, 0xc1bdceee, 0xf57c0faf, 0x4787c62a, 0xa8304613, 0xfd469501,
    0x698098d8, 0x8b44f7af, 0xffff5bb1, 0x895cd7be, 0x6b901122, 0xfd987193, 0xa679438e, 0x49b40821,
    0xf61e2562, 0xc040b340, 0x265e5a51, 0xe9b6c7aa, 0xd62f105d, 0x02441453, 0xd8a1e681, 0xe7d3fbc8,
    0x21e1cde6, 0xc33707d6, 0xf4d50d87, 0x455a14ed, 0xa9e3e905, 0xfcefa3f8, 0x676f02d9, 0x8d2a4c8a,
    0xfffa3942, 0x8771f681, 0x6d9d6122, 0xfde5380c, 0xa4beea44, 0x4bdecfa9, 0xf6bb4b60, 0xbebfbc70,
    0x289b7ec6, 0xeaa127fa, 0xd4ef3085, 0x04881d05, 0xd9d4d039, 0xe6db99e5, 0x1fa27cf8, 0xc4ac5665,
    0xf4292244, 0x432aff97, 0xab9423a7, 0xfc93a039, 0x655b59c3, 0x8f0ccc92, 0xffeff47d, 0x85845dd1,
    0x6fa87e4f, 0xfe2ce6e0, 0xa3014314, 0x4e0811a1, 0xf7537e82, 0xbd3af235, 0x2ad7d2bb, 0xeb86d391,
  ];
  const s = [
    7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9,
    14, 20, 5, 9, 14, 20, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 6, 10, 15, 21,
    6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21,
  ];

  const encoder = new TextEncoder();
  const bytes = encoder.encode(str);
  const words: number[] = [];
  const len = bytes.length;
  for (let i = 0; i < len; i++) {
    words[i >> 2] |= bytes[i] << ((i % 4) * 8);
  }

  words[len >> 2] |= 0x80 << ((len % 4) * 8);
  const wordsLen = (((len + 8) >> 6) + 1) * 16;
  while (words.length < wordsLen) {
    words.push(0);
  }
  words[wordsLen - 2] = len * 8;
  words[wordsLen - 1] = 0;

  let a = 0x67452301;
  let b = 0xefcdab89;
  let c = 0x98badcfe;
  let d = 0x10325476;

  for (let i = 0; i < wordsLen; i += 16) {
    const originalA = a;
    const originalB = b;
    const originalC = c;
    const originalD = d;

    for (let j = 0; j < 64; j++) {
      let f, g;
      if (j < 16) {
        f = (b & c) | (~b & d);
        g = j;
      } else if (j < 32) {
        f = (d & b) | (~d & c);
        g = (5 * j + 1) % 16;
      } else if (j < 48) {
        f = b ^ c ^ d;
        g = (3 * j + 5) % 16;
      } else {
        f = c ^ (b | ~d);
        g = (7 * j) % 16;
      }

      const temp = d;
      const sum = (a + f + k[j] + (words[i + g] || 0)) | 0;
      const rot = (sum << s[j]) | (sum >>> (32 - s[j]));
      d = c;
      c = b;
      b = (b + rot) | 0;
      a = temp;
    }

    a = (a + originalA) | 0;
    b = (b + originalB) | 0;
    c = (c + originalC) | 0;
    d = (d + originalD) | 0;
  }

  const hex = (n: number) => {
    let out = '';
    for (let i = 0; i < 4; i++) {
      out += ((n >> (i * 8)) & 0xff).toString(16).padStart(2, '0');
    }
    return out;
  };
  return hex(a) + hex(b) + hex(c) + hex(d);
}

async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

// Mount core security and transport optimization middlewares
app.use('*', requestId());
app.use('*', secureHeaders());
app.use('*', requireHttpsMiddleware());
app.use('*', compress());
app.use('*', bodyLimit({ maxSize: 5 * 1024 * 1024 })); // 5MB limit

// CORS only trusts exact application origins and exact localhost hosts in local modes.
app.use(
  '*',
  cors({
    origin: (origin) => resolveAllowedCorsOrigin(origin, process.env.NODE_ENV),
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowHeaders: [
      'Content-Type',
      'Authorization',
      'x-expected-auth-subject',
      'x-school-id',
      'x-capacity',
      'x-active-bond-id',
      'x-grade-id',
      'x-section-id',
      'x-classroom-ids',
      'x-child-student-ids',
      'x-device-trust',
      'x-network-zone',
      'x-idempotency-key',
      'idempotency-key',
      'x-pqc-kem',
      'x-sovereign-epoch',
      'x-poa-sig',
      'traceparent',
      'tracestate',
    ],
    exposeHeaders: ['x-request-id', 'x-trace-id'],
  }),
);

// Mount optimization & request profiling middlewares
app.use('/api/*', async (c, next) => {
  if (c.req.header('Authorization')) {
    return next();
  }
  return csrf()(c, next);
});
app.use('/api/*', etag());
app.use('/api/*', timing());

// Library responses can be personalized (for example, bookmarks and resources
// visible through the caller's scope). A shared cache must never reuse one
// caller's representation for another caller.
app.use('/api/library/*', async (c, next) => {
  await next();
  c.header('Cache-Control', 'private, no-store');
});

// Student, classroom, attendance, grading, and relational records contain sensitive PII.
// Shared proxy caches, Cloudflare edge, and browser disk caches must never store them.
const SENSITIVE_PRIVATE_API_PATHS = [
  '/api/workspace/*',
  '/api/self/*',
  '/api/attendance/*',
  '/api/classroom/*',
  '/api/grading/*',
  '/api/grades/*',
  '/api/profile/*',
  '/api/identity/*',
  '/api/studentPotential/*',
  '/api/student-potential/*',
  '/api/guardian/*',
  '/api/guardianAssessment/*',
  '/api/editorial/*',
  '/api/assignment/*',
  '/api/tuition/*',
  '/api/erp/*',
  '/api/openapi/attendance/*',
] as const;

for (const path of SENSITIVE_PRIVATE_API_PATHS) {
  app.use(path, async (c, next) => {
    await next();
    c.header('Cache-Control', 'private, no-store, no-cache, max-age=0, must-revalidate');
    c.header('Pragma', 'no-cache');
  });
}

app.use('/api/daily-content/*', async (c, next) => {
  await next();
  c.header('Cache-Control', 'public, max-age=60, stale-while-revalidate=600');
});
app.use('/api/dailyContent/*', async (c, next) => {
  await next();
  c.header('Cache-Control', 'public, max-age=60, stale-while-revalidate=600');
});

// Adaptive Timeouts
app.use('/api/*', async (c, next) => {
  if (c.req.path.includes('/powersync/upload')) {
    return next();
  }
  return timeout(10000)(c, next); // 10s default timeout
});
app.use('/api/powersync/upload', timeout(45000)); // 45s bulk sync timeout

const apiRateLimit = createRateLimitMiddleware({
  prefix: 'api',
  limit: 100,
  windowMs: 60 * 1000,
  store: createConfiguredRateLimitStore(),
  key: (context) => {
    const configuredHeader = getEnv('RATE_LIMIT_TRUSTED_PROXY_HEADER') || 'CF-Connecting-IP';
    const value = context.req.header(configuredHeader);
    return value ? `proxy:${value.split(',')[0].trim()}` : 'anonymous';
  },
});

const rateLimitHandler = factory.createMiddleware(async (c, next) => {
  if (
    c.req.path.startsWith('/payments/') ||
    c.req.path === '/doc' ||
    c.req.path === '/ui' ||
    c.req.path === '/reference' ||
    c.req.method === 'OPTIONS'
  ) {
    return next();
  }

  return apiRateLimit(c, next);
});

// Rate Limiter
app.use('/api/*', rateLimitHandler);

// Logger (structured request/response logging)
app.use('*', logger());

// Correlation ID propagation (W3C traceparent/tracestate)
app.use('/api/*', extractCorrelationIdMiddleware());

app.use('/api/*', otelMiddleware());

// Sentry tracing middleware (captures request context)
if (process.env.SENTRY_DSN) {
  app.use('/api/*', async (c, next) => {
    const transaction = Sentry.startInactiveSpan({
      name: `${c.req.method} ${c.req.path}`,
      op: 'http.server',
      attributes: {
        'http.method': c.req.method,
        'http.route': c.req.path,
        'http.request_id': c.get('requestId'),
        'otel.trace_id': getCurrentTraceId(),
      },
    });
    try {
      await next();
      transaction.setAttribute('http.response.status_code', c.res.status);
      transaction.setStatus({ code: c.res.status >= 500 ? 2 : 1 }); // 2=error, 1=ok
    } catch (error) {
      transaction.setStatus({ code: 2 });
      const sovereign = normalizeError(error, c.get('requestId') || 'unknown');
      const safeError = toSafeErrorTelemetry(
        error,
        sovereign.details.code,
        sovereign.details.status,
      );
      transaction.recordException({
        type: safeError.category,
        value: safeError.message,
        code: safeError.code,
        status: safeError.status,
      });
      throw error;
    } finally {
      transaction.end();
    }
  });
}

app.route('/', healthRoutes);

// Dev Diagnostics Pipeline: Ingests aggregated mobile error reports in development
if (process.env.NODE_ENV === 'development') {
  app.post('/dev/diagnostics', async (c) => {
    const body = await c.req.json().catch(() => null);
    if (body) {
      loggerInstance.warn({ devCrashReport: body }, '🚨 [MOBILE DEV CRASH REPORT INGESTED]');
      try {
        const fs = await import('node:fs/promises');
        await fs.writeFile(
          'c:/x/apps/gurudevi-mobile/scratch/latest_mobile_errors.json',
          JSON.stringify(body, null, 2),
          'utf-8',
        );
      } catch (fsErr) {
        console.warn('Could not write dev diagnostics scratch file:', fsErr);
      }
    }
    return c.json({ ok: true, received: Boolean(body) });
  });
}

app.use('/api/*', createPqcMiddleware());
app.use('/api/*', createIdentityBridge());

async function getRequestSecurityContext(c: any) {
  const user = c.get('user') || { id: 'anonymous' };
  const db = c.get('db');
  const isAnonymousUser = user.id === 'anonymous';

  if (!isAnonymousUser && !db) {
    // A client header is never an authority source. Continuing without the
    // server-side relationship store would turn an outage into tenant escape.
    throw new Error('AuthoritativeScopeUnavailable');
  }

  let authority;
  try {
    authority = await resolveServerDerivedAuthority({
      user,
      db,
      requestPath: c.req.path,
      missingScopeError: () => new Error('MissingActiveBondSelection'),
      wrapUnexpected: true,
    });
  } catch (error) {
    if (error instanceof ORPCError && error.code === 'SERVICE_UNAVAILABLE') {
      throw new Error('AuthoritativeScopeUnavailable');
    }
    throw error;
  }
  const capacity = isAnonymousUser ? 'wanderer' : authority.capacity;

  if (!isAnonymousUser && !capacity && !isOnboardingBootstrapProcedure(c.req.path)) {
    throw new Error('MissingActiveCapacity');
  }

  return {
    user,
    db,
    principal: {
      ...authority.principal,
      type: capacity ?? 'unknown',
      attributes: {
        ...authority.principal?.attributes,
        capacity: capacity ?? '',
      },
    },
    context: authority.securityContext,
    school_id: authority.schoolId,
    capacity,
    activeBondId: authority.activeBondId,
    activeEntityId: authority.activeEntityId,
    activeEntityType: authority.activeEntityType,
  };
}

function poa(route: SovereignRoute) {
  return factory.createMiddleware(async (c, next) => {
    if (c.req.method.toLowerCase() !== route.method.toLowerCase()) {
      return await next();
    }

    // Special bypass for resolveIdentity bootstrapping and anonymous capacity summary
    if (
      c.req.path.includes('/identity/resolveIdentity') ||
      c.req.path.includes('/identity/classroom-capacity-summary/anonymous') ||
      isOnboardingBootstrapProcedure(c.req.path)
    ) {
      // These routes establish the first personal bond and onboarding state;
      // they cannot require the active-bond Cedar context they create.
      return await next();
    }

    let securityContext;
    try {
      securityContext = await getRequestSecurityContext(c);
    } catch (err: any) {
      if (err.message === 'AuthoritativeScopeUnavailable') {
        throw new HTTPException(503, {
          message: 'Authorization context is temporarily unavailable. Please retry shortly.',
        });
      }
      if (err.message === 'PrivilegeEscalation') {
        throw new HTTPException(403, {
          message: 'Authoritative database policy rejects the requested administrative capability.',
          res: new Response(
            JSON.stringify({
              error: 'Forbidden',
              message:
                'Authoritative database policy rejects the requested administrative capability.',
            }),
            { status: 403, headers: { 'Content-Type': 'application/json' } },
          ),
        });
      }
      if (err.message === 'MissingActiveCapacity') {
        throw new HTTPException(409, {
          message: 'An active capacity is required before accessing the application.',
        });
      }
      if (err.message === 'MissingActiveBondSelection') {
        throw new HTTPException(409, {
          message: 'Select an active sanctuary, school, classroom, or community before continuing.',
        });
      }
      throw new HTTPException(500, { message: 'Internal Server Error' });
    }

    const {
      user,
      principal,
      context,
      school_id,
      capacity,
      activeBondId,
      activeEntityId,
      activeEntityType,
    } = securityContext;
    c.set('capacity', capacity);
    c.set('activeBondId', activeBondId);
    c.set('activeEntityId', activeEntityId);
    c.set('activeEntityType', activeEntityType);
    c.set('schoolId', school_id);

    const policy = route.metadata.policy;
    const cedarAction = policy.action;
    const resourceType = policy.subject;

    let resourceId = school_id || 'school_institutional';
    const params = c.req.param() as Record<string, string | undefined>;
    const paramKeys = Object.keys(params);
    if (paramKeys.length > 0) {
      if (params.id) {
        resourceId = params.id;
      } else if (params.userId) {
        resourceId = params.userId;
      } else if (params.studentId) {
        resourceId = params.studentId;
      } else if (params.classroomId) {
        resourceId = params.classroomId;
      } else if (params.classroomStudentId) {
        resourceId = params.classroomStudentId;
      } else if (params.teacherId) {
        resourceId = params.teacherId;
      } else if (params.schoolId) {
        resourceId = params.schoolId;
      } else if (params.principalId) {
        resourceId = params.principalId;
      } else if (params.insightId) {
        resourceId = params.insightId;
      } else if (params.token) {
        resourceId = params.token;
      } else if (params.workspaceId) {
        resourceId = params.workspaceId;
      } else {
        resourceId = params[paramKeys[0]] || 'unknown';
      }
    } else {
      if (resourceType === 'User') {
        resourceId = user.id;
      } else if (resourceType === 'MoodLog') {
        resourceId = 'user_mood_log';
      } else if (resourceType === 'FireJournal') {
        resourceId = 'user_fire_journal';
      } else if (resourceType === 'JoyMoments') {
        resourceId = 'user_joy_moment';
      } else if (resourceType === 'GratitudeEntries') {
        resourceId = 'user_gratitude_entry';
      }
    }

    let bodyClassroomId: string | undefined;
    const method = c.req.method.toUpperCase();
    if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
      try {
        const cloned = c.req.raw.clone();
        const bodyJson = await cloned.json();
        bodyClassroomId = bodyJson?.classroom_id ?? bodyJson?.classroomId;
      } catch {
        // Body is not JSON or cannot be read, ignore gracefully
      }
    }

    const entitlementPromise = route.metadata.entitlement
      ? resolveServerEntitlement(
          c.get('db'),
          user.id,
          route.metadata.entitlement,
          c.get('activeBondId'),
          c.get('activeEntityId'),
          c.get('activeEntityType'),
        )
      : Promise.resolve(true);

    const cedarPromise = async () => {
      startTime(c, 'cedar', 'Cedar Policy Evaluation');
      const request = {
        principal,
        action: cedarAction,
        resource: {
          id: resourceId,
          type: resourceType,
          attributes: {
            ...(resourceType !== 'School' && { school_id }),
            ...(bodyClassroomId && { classroom_id: bodyClassroomId }),
            ...((resourceType === 'MoodLog' ||
              resourceType === 'FireJournal' ||
              resourceType === 'JoyMoments' ||
              resourceType === 'GratitudeEntries' ||
              resourceType === 'EnergyForecasts' ||
              resourceType === 'UserRewards' ||
              resourceType === 'WhisperedMoment') && { user_id: user.id }),
          },
        },
        context,
      };
      const result =
        process.env.SANCTUARY_AUTHZ_EVALUATOR === 'rust'
          ? await evaluateWithRust(request, c.get('requestId'))
          : checkCedar(request);
      endTime(c, 'cedar');
      return result;
    };

    let entitlementAllowed: boolean;
    let authResult: Awaited<ReturnType<typeof checkCedar>>;
    try {
      [entitlementAllowed, authResult] = await Promise.all([entitlementPromise, cedarPromise()]);
    } catch (error) {
      if (error instanceof RustEvaluatorUnavailableError) {
        throw new HTTPException(503, {
          message: 'Authoritative authorization evaluator is unavailable.',
        });
      }
      throw error;
    }

    if (!authResult.permitted || !entitlementAllowed) {
      throw new HTTPException(403, {
        message:
          'Access denied by authoritative authorization and commercial access policies (Double Gate Enforcement).',
        res: new Response(
          JSON.stringify({
            error: 'Forbidden',
            message: 'Access denied by authoritative Cedar policy engine',
            reason: authResult.reason,
            gaps: authResult.gaps,
          }),
          { status: 403, headers: { 'Content-Type': 'application/json' } },
        ),
      });
    }

    if (capacity === 'admin') {
      console.info(
        `[SENTINEL AUDIT LOG] Platform Admin Action Authorized:
         - Operator ID: "${user.id}"
         - Action: "${cedarAction}"
         - Target Resource: "${resourceType}::${resourceId}"
         - Path: "${c.req.method} ${c.req.path}"
         - Device Trust: "${context.device_trust}"
         - Network Zone: "${context.network_zone}"
         - Status: APPROVED & AUDITED`,
      );
    }

    return await next();
  });
}

async function resolveServerEntitlement(
  db: ReturnType<typeof createZenStackDb> | null | undefined,
  userId: string,
  requirement: NonNullable<SovereignRoute['metadata']['entitlement']>,
  activeBondId: string | null,
  activeEntityId: string | null,
  activeEntityType: string | null,
): Promise<boolean> {
  if (!db || userId === 'anonymous') return false;

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { pricing_tier: true },
  });
  const currentTier = user?.pricing_tier;
  if (currentTier !== 'FREE' && currentTier !== 'PRO' && currentTier !== 'INSTITUTIONAL') {
    return false;
  }

  const entitlementScope = requirement.scope ?? 'individual';
  let effectiveTier = entitlementScope === 'individual' ? currentTier : 'FREE';
  let activeEntitlements: string[] = [];
  if (entitlementScope !== 'individual') {
    const rows = await queryDatabaseRows<{
      tier: string;
      modules: unknown;
      scope_type: string;
      bond_id: string | null;
      entity_id: string | null;
      entity_type: string | null;
    }>(
      `SELECT tier, modules, scope_type, bond_id
       FROM public.user_entitlement_grants
       WHERE user_id = $1
         AND status = 'ACTIVE'
         AND starts_at <= now()
         AND (expires_at IS NULL OR expires_at > now())
       AND ((scope_type = 'BOND' AND bond_id = $2)
         OR (scope_type = 'ENTITY' AND entity_id = $3 AND entity_type = $4)
         OR scope_type = 'ADD_ON')`,
      [userId, activeBondId, activeEntityId, activeEntityType],
    );
    const scopedRows = rows.filter((row) => {
      if (entitlementScope === 'active_bond')
        return row.scope_type === 'BOND' && row.bond_id === activeBondId;
      if (entitlementScope === 'active_entity') return row.scope_type === 'ENTITY';
      return row.scope_type === 'ADD_ON';
    });
    for (const row of scopedRows) {
      if (row.tier === 'INSTITUTIONAL' || (row.tier === 'PRO' && effectiveTier === 'FREE')) {
        effectiveTier = row.tier as typeof currentTier;
      }
      if (Array.isArray(row.modules)) {
        activeEntitlements.push(
          ...row.modules.filter((module): module is string => typeof module === 'string'),
        );
      }
    }
  }
  if (requirement.modulesAllOf?.length) {
    try {
      const rows = await queryDatabaseRows<{ features: unknown }>(
        'SELECT features FROM public.pricing_manifest WHERE tier = $1 LIMIT 1',
        [effectiveTier],
      );
      const features = rows[0]?.features;
      if (Array.isArray(features)) {
        activeEntitlements = features.filter(
          (feature): feature is string => typeof feature === 'string',
        );
      } else if (typeof features === 'string') {
        const parsed = JSON.parse(features) as unknown;
        if (!Array.isArray(parsed)) return false;
        activeEntitlements = parsed.filter(
          (feature): feature is string => typeof feature === 'string',
        );
      } else {
        return false;
      }
    } catch {
      return false;
    }
  }

  return satisfiesEntitlementRequirement(
    {
      pricingTier: effectiveTier as any,
      activeEntitlements: [...new Set(activeEntitlements)],
      expirationDate: null,
    },
    { ...requirement, scope: undefined },
  );
}

import { featureFlags } from '@repo/core/logic/managers/featureFlag.factory';

const routeFeatureFlagMap = {
  '/powersync': 'isPowerSyncEnabled',
  '/ai': 'isAIAssistantEnabled',
} as const satisfies Record<string, FeatureFlagKey>;

function featureFlagGateForKey(flagKey: FeatureFlagKey, routePath: string) {
  return factory.createMiddleware(async (c, next) => {
    const user = c.get('user') || { id: 'anonymous' };
    const schoolId = c.get('schoolId') || null;
    const capacity = c.get('capacity') || null;

    const userContext = {
      userId: user.id === 'anonymous' ? null : user.id,
      email: null,
      schoolId,
      primaryCapacity: capacity,
      activeBond: capacity ? { capacity } : null,
      isAnonymous: user.id === 'anonymous',
    };

    // Check GrowthBook first (if configured)
    let isEnabled: boolean | undefined;
    if (growthbook) {
      try {
        // GrowthBook uses feature keys directly
        const gbResult = growthbook.getFeatureValue(flagKey, undefined);
        if (gbResult !== undefined) {
          isEnabled = gbResult as boolean;
        }
      } catch (e) {
        console.warn(`[Feature Gate] GrowthBook check failed for ${flagKey}:`, e);
      }
    }

    // Fall back to internal feature flags
    if (isEnabled === undefined) {
      const resolved = await featureFlags.resolveFlags(userContext as any);
      isEnabled = resolveFeatureFlagValue(resolved.flags, flagKey);
    }

    if (isEnabled === false) {
      console.warn(
        `[Feature Gate] Access denied: flag "${flagKey}" is disabled for route "${routePath}"`,
      );
      throw new HTTPException(503, {
        message: 'This feature is currently disabled.',
        res: new Response(JSON.stringify({ error: 'FeatureDisabled', flag: flagKey }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' },
        }),
      });
    }

    return await next();
  });
}

function featureFlagGate(route: SovereignRoute) {
  const flagEntry = Object.entries(routeFeatureFlagMap).find(([prefix]) =>
    route.path.startsWith(prefix),
  );
  return flagEntry
    ? featureFlagGateForKey(flagEntry[1], route.path)
    : factory.createMiddleware(async (_c, next) => next());
}

import { OpenAPIHandler } from '@orpc/openapi/fetch';
import type { Router } from '@orpc/server';
import { RPCHandler } from '@orpc/server/fetch';
import { BatchHandlerPlugin, CORSPlugin } from '@orpc/server/plugins';
import { isReadOnlyOpenApiProcedure } from './openapiReadOnly';

const rpcHandler = new RPCHandler(orpcRouter as any, {
  plugins: [
    new BatchHandlerPlugin(),
    new CORSPlugin({
      allowHeaders: ['orpc-batch'],
    }),
  ],
});
const openapiHandler = new OpenAPIHandler(orpcRouter as any, {
  filter: isReadOnlyOpenApiProcedure,
});
const canonicalV1Handler = new OpenAPIHandler(canonicalV1Router as any);

app.all('/api/openapi/*', async (c) => {
  const context = await buildORPCContextFromHono(c);
  const { matched, response } = await openapiHandler.handle(c.req.raw, {
    context,
    prefix: '/api/openapi',
  });
  return matched && response ? response : c.text('Not Found', 404);
});

app.route('/api', createAdRewardRoutes(getEnv));
app.route('/api/auth', createAuthGatewayRoutes());
app.route('/api/auth', createAuthCredentialRoutes());
app.route('/api/auth', createAuthSyncRoutes());
app.route('/api', eventsStreamRoutes);
app.route('/api/mcp', createMcpDoor());
app.route('/api/ws', createWebSocketDoor());

// This literal, capability-owned mount must precede the native /api/* oRPC
// compatibility catch-all. v0 remains independently mounted below.
registerCanonicalV1Routes(app, canonicalV1Handler);

registerNativeORPCRoutes(app, rpcHandler);
const aiPolicyRoute: SovereignRoute = {
  path: '/api/ai/chat',
  method: 'post',
  responses: { 200: { schema: z.any(), description: 'AI response stream' } },
  metadata: { policy: { action: 'use_ai', subject: 'AIAssistant' } },
};
app.use('/api/ai/*', poa(aiPolicyRoute));
app.use('/api/ai/*', featureFlagGateForKey('isAIAssistantEnabled', '/api/ai'));
app.route('/api/ai', aiRouter);

app.route('/', createDurableAgentRoutes());
app.route('/', createOmnichannelDoor({ getEnv, cryptoUtils: { md5Hex, sha256Hex } }));

app.doc('/doc', {
  openapi: '3.1.0',
  info: {
    title: 'Sanctuary API',
    version: '2026.1.0',
    description: 'Sovereign API Gateway (ZenStack v3.6.4 + Zod v4)',
  },
});

app.get('/ui', swaggerUI({ url: '/doc' }));
app.get('/reference', apiReference({ spec: { url: '/doc' } }));
