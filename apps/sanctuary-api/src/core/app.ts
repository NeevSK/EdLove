import { swaggerUI } from '@hono/swagger-ui';
import { OpenAPIHono } from '@hono/zod-openapi';
import {
  type SovereignRoute,
} from '@repo/core/api/server';
import { resolveBondScope } from '@repo/core/logic/permissions/bondScope';
import { satisfiesEntitlementRequirement } from '@repo/core/logic/ports/entitlement.port';
import {
  type FeatureFlagKey,
  resolveFeatureFlagValue,
} from '@repo/core/logic/registry/featureLifecycleManifest';
import { normalizeError } from '@repo/core/logic/utils/errorNormalizer';
import { canUseZenStackDb, createZenStackDb, queryDatabaseRows } from '@repo/database/client';
import { check as checkCedar } from '@repo/policies';
import { apiReference } from '@scalar/hono-api-reference';
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
import { z } from 'zod';
import { aiRouter } from '../ai/routes';
import {
  evaluateWithRust,
  RustEvaluatorUnavailableError,
} from '../authorization/rustEvaluator';
import { verifySupabaseJwt } from '../jwt';
import { getCurrentTraceId, otelMiddleware } from '../telemetry/otel';

interface Env {
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

app.onError((err, c) => {
  if (err instanceof HTTPException) {
    const res = err.getResponse();
    if (c.res) {
      for (const [key, value] of c.res.headers.entries()) {
        if (!res.headers.has(key)) {
          res.headers.set(key, value);
        }
      }
    }
    return res;
  }
  const requestId = c.get('requestId') || 'unknown';
  const sovereign = normalizeError(err, requestId);
  console.error(
    `[${requestId}] [trace=${getCurrentTraceId() || 'unknown'}] UNCAUGHT:`,
    sovereign.details,
  );
  return c.json(sovereign.details, sovereign.details.status as any);
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

// --- 1. Global Middleware ---

// Mount core security and transport optimization middlewares
app.use('*', secureHeaders());
app.use('*', compress());
app.use('*', bodyLimit({ maxSize: 5 * 1024 * 1024 })); // 5MB limit

// CORS (dynamic — allow any localhost origin in dev, restricted list in production)
app.use(
  '*',
  cors({
    origin: (origin) => {
      if (!origin) return null;
      if (origin.startsWith('http://localhost') || origin.startsWith('https://localhost')) {
        return origin;
      }
      const allowedOrigins = ['https://platform.gurudevi.edlove.org'];
      return allowedOrigins.includes(origin) ? origin : null;
    },
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowHeaders: [
      'Content-Type',
      'Authorization',
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

// Cache-Control headers for read-heavy routes
app.use('/api/library/*', async (c, next) => {
  await next();
  c.header('Cache-Control', 'public, max-age=60, stale-while-revalidate=600');
});
app.use('/api/daily-content/*', async (c, next) => {
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

// Rate Limiter (custom in-memory — no built-in equivalent in hono core)
const RATE_LIMIT_WINDOW = 60 * 1000;
const RATE_LIMIT_MAX = 100;
const rateLimitCache = new Map<string, { count: number; resetTime: number }>();

if (typeof globalThis !== 'undefined' && !(globalThis as any).__rateLimitCleanupInterval) {
  (globalThis as any).__rateLimitCleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, val] of rateLimitCache.entries()) {
      if (now > val.resetTime) rateLimitCache.delete(key);
    }
  }, 60 * 1000);
}

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

  const ip =
    c.req.header('CF-Connecting-IP') ||
    c.req.header('X-Forwarded-For') ||
    c.req.header('X-Forwarding-For') ||
    'unknown-ip';
  const now = Date.now();
  const record = rateLimitCache.get(ip) || { count: 0, resetTime: now + RATE_LIMIT_WINDOW };

  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + RATE_LIMIT_WINDOW;
  } else {
    record.count++;
  }
  rateLimitCache.set(ip, record);

  c.header('X-RateLimit-Limit', String(RATE_LIMIT_MAX));
  c.header('X-RateLimit-Remaining', String(Math.max(0, RATE_LIMIT_MAX - record.count)));
  c.header('X-RateLimit-Reset', String(Math.ceil((record.resetTime - now) / 1000)));

  if (record.count > RATE_LIMIT_MAX) {
    return c.json(
      { error: 'Too Many Requests', message: 'Rate limit exceeded. Please try again later.' },
      429,
    );
  }
  return next();
});

// Rate Limiter
app.use('/api/*', rateLimitHandler);

// Logger (structured request/response logging)
app.use('*', logger());

// Request ID (built-in — available via c.get('requestId'))
app.use('*', requestId());
app.use('/api/*', otelMiddleware());

// Platform health contract. Liveness never touches external dependencies;
// readiness verifies the minimum runtime configuration and database reachability.
app.get('/health/live', (c) =>
  c.json({ status: 'ok', service: 'sanctuary-api', environment: getEnv('NODE_ENV') || 'unknown' }),
);

app.get('/health/ready', async (c) => {
  const databaseUrl = (c.env as any)?.DATABASE_URL || getEnv('DATABASE_URL');
  if (!databaseUrl) {
    return c.json({ status: 'not_ready', reason: 'database_configuration_missing' }, 503);
  }

  try {
    await queryDatabaseRows<{ ok: number }>('SELECT 1 AS ok');
    return c.json({ status: 'ready', service: 'sanctuary-api' });
  } catch {
    return c.json({ status: 'not_ready', reason: 'database_unreachable' }, 503);
  }
});

// --- 2. Sovereign Auth & ZenStack (ReBAC) Middleware ---
app.use('/api/*', async (c, next) => {
  // 1. Resolve User from Header using Authoritative Asymmetric Cryptographic JWT Verification
  const authHeader = c.req.header('Authorization');
  let user = { id: 'anonymous' };

  if (authHeader) {
    if (!authHeader.startsWith('Bearer ')) {
      throw new HTTPException(401, {
        message: 'Invalid Authorization header format. Must be Bearer token.',
      });
    }

    const token = authHeader.replace('Bearer ', '');
    // Provide potential environment context overrides from Hono (e.g. c.env)
    startTime(c, 'jwt', 'JWT Verification');
    const verifiedPayload = await verifySupabaseJwt(token, c.env as any);
    endTime(c, 'jwt');

    if (!verifiedPayload) {
      throw new HTTPException(401, {
        message:
          'Authoritative cryptographic identity verification failed (Invalid or Expired JWT).',
      });
    }

    user = { id: verifiedPayload.sub };
  }

  // 2. Inject ZenStack Enhanced DB
  const dbUrl = (c.env as any)?.DATABASE_URL || getEnv('DATABASE_URL');
  let db: ReturnType<typeof createZenStackDb> | null = null;
  if (canUseZenStackDb(dbUrl)) {
    db = createZenStackDb(user, dbUrl);
  } else {
    console.warn('DATABASE_URL not found. ReBAC enforcement will be offline.');
  }

  c.set('user', user);
  if (db) c.set('db', db);

  return await next();
});

// --- 3. Cedar Server Gate Check Middleware (Dynamic Route-level PEP) ---
async function getRequestSecurityContext(c: any) {
  const user = c.get('user') || { id: 'anonymous' };
  const db = c.get('db');
  const isAnonymousUser = user.id === 'anonymous';

  let school_id = '';
  let capacity: string | null = null;
  let activeBondId: string | null = null;
  let activeEntityId: string | null = null;
  let activeEntityType: string | null = null;
  let grade_id: string | undefined;
  let section_id: string | undefined;
  let classroom_ids: string[];
  let child_student_ids: string[];

  const clientHeaderSchoolId = c.req.header('x-school-id') || '';
  const clientHeaderCapacity = c.req.header('x-capacity') || null;
  const clientHeaderActiveBondId = c.req.header('x-active-bond-id') || null;
  const isOnboardingBootstrapRoute =
    c.req.path.includes('/identity/initial-bond') ||
    c.req.path.includes('/identity/complete-onboarding');
  const clientHeaderGradeId = c.req.header('x-grade-id') || undefined;
  const clientHeaderSectionId = c.req.header('x-section-id') || undefined;

  const xClassroomIds = c.req.header('x-classroom-ids');
  const clientHeaderClassroomIds = xClassroomIds
    ? xClassroomIds.split(',').map((id: string) => id.trim())
    : [];

  const xChildIds = c.req.header('x-child-student-ids');
  const clientHeaderChildIds = xChildIds ? xChildIds.split(',').map((id: string) => id.trim()) : [];

  let hydratedFromDb = false;
  if (!isAnonymousUser && db) {
    try {
      let activeBond: any;
      if (clientHeaderActiveBondId) {
        activeBond = await db.bond.findFirst({
          where: { id: clientHeaderActiveBondId, user_id: user.id },
        });
      } else if (!isOnboardingBootstrapRoute) {
        activeBond = await db.bond.findFirst({
          where: { user_id: user.id },
        });
        if (!activeBond) {
          throw new Error('MissingActiveBondSelection');
        }
      }
      if (activeBond) {
        const bondScope = resolveBondScope(activeBond);
        activeBondId = bondScope.activeBondId;
        activeEntityId = bondScope.activeEntityId;
        activeEntityType = bondScope.activeEntityType;
        capacity = activeBond.capacity;
        school_id = bondScope.schoolId || '';
        hydratedFromDb = true;
      } else if (clientHeaderActiveBondId) {
        throw new Error('MissingActiveCapacity');
      }
    } catch (err: any) {
      if (err?.message === 'MissingActiveBondSelection') throw err;
      console.warn('Server failed to resolve active bond from DB:', err);
    }
  }

  if (!hydratedFromDb) {
    school_id = clientHeaderSchoolId;
    capacity = isAnonymousUser ? 'wanderer' : clientHeaderCapacity;
    grade_id = clientHeaderGradeId;
    section_id = clientHeaderSectionId;
    classroom_ids = clientHeaderClassroomIds;
    child_student_ids = clientHeaderChildIds;
  } else {
    if (clientHeaderCapacity === 'admin' && capacity !== 'admin') {
      console.warn(
        `[SENTINEL SECURITY ALERT] Blocked header privilege escalation attempt by user "${user.id}"`,
      );
      throw new Error('PrivilegeEscalation');
    }
    grade_id = clientHeaderGradeId;
    section_id = clientHeaderSectionId;
    classroom_ids = clientHeaderClassroomIds;
    child_student_ids = clientHeaderChildIds;
  }

  if (!isAnonymousUser && !capacity && !isOnboardingBootstrapRoute) {
    throw new Error('MissingActiveCapacity');
  }

  const deviceTrust =
    c.req.header('x-device-trust') || c.req.header('x-device-status') || 'standard';
  const networkZone = c.req.header('x-network-zone') || 'trusted';

  return {
    user,
    db,
    principal: {
      id: user.id,
      type: capacity ?? 'unknown',
      attributes: {
        school_id,
        active_entity_id: activeEntityId ?? '',
        active_entity_type: activeEntityType ?? '',
        capacity: capacity ?? '',
        grade_id,
        section_id,
        classroom_ids,
        child_student_ids,
      },
    },
    context: {
      device_trust: deviceTrust,
      network_zone: networkZone,
    },
    school_id,
    capacity,
    activeBondId,
    activeEntityId,
    activeEntityType,
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
      c.req.path.includes('/identity/initial-bond') ||
      c.req.path.includes('/identity/complete-onboarding')
    ) {
      // These routes establish the first personal bond and onboarding state;
      // they cannot require the active-bond Cedar context they create.
      return await next();
    }

    let securityContext;
    try {
      securityContext = await getRequestSecurityContext(c);
    } catch (err: any) {
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
              resourceType === 'EnergyForecasts') && { user_id: user.id }),
          },
        },
        context,
      };
      const result = process.env.SANCTUARY_AUTHZ_EVALUATOR === 'rust'
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

    const resolved = await featureFlags.resolveFlags(userContext as any);
    const isEnabled = resolveFeatureFlagValue(resolved.flags, flagKey);

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

import { RPCHandler } from '@orpc/server/fetch';
import { OpenAPIHandler } from '@orpc/openapi/fetch';
import { buildORPCContextFromHono, router as orpcRouter } from './router';

const rpcHandler = new RPCHandler(orpcRouter);
const openapiHandler = new OpenAPIHandler(orpcRouter, {
  filter: ({ contract }) => {
    const policy = (contract['~orpc'].meta as any)?.policy;
    return policy?.action === 'read' && ['Classroom', 'Material', 'Assignment', 'AssignmentSubmission', 'Group', 'Post', 'School'].includes(policy.subject);
  },
});

app.all('/api/openapi/*', async (c) => {
  const context = await buildORPCContextFromHono(c);
  const { matched, response } = await openapiHandler.handle(c.req.raw, { context, prefix: '/api/openapi' });
  return matched && response ? response : c.text('Not Found', 404);
});

app.all('/api/self/*', async (c) => {
  const context = await buildORPCContextFromHono(c);
  const { matched, response } = await rpcHandler.handle(c.req.raw, { context, prefix: '/api' });
  return matched && response ? response : c.text('Not Found', 404);
});

app.all('/api/profile/*', async (c) => {
  const context = await buildORPCContextFromHono(c);
  const { matched, response } = await rpcHandler.handle(c.req.raw, { context, prefix: '/api' });
  return matched && response ? response : c.text('Not Found', 404);
});

app.all('/api/identity/*', async (c) => {
  const context = await buildORPCContextFromHono(c);
  const { matched, response } = await rpcHandler.handle(c.req.raw, { context, prefix: '/api' });
  return matched && response ? response : c.text('Not Found', 404);
});

app.all('/api/onboarding/*', async (c) => {
  const context = await buildORPCContextFromHono(c);
  const { matched, response } = await rpcHandler.handle(c.req.raw, { context, prefix: '/api' });
  return matched && response ? response : c.text('Not Found', 404);
});

// Native oRPC community procedures are the sole community API surface.
app.all('/api/community/*', async (c) => {
  const context = await buildORPCContextFromHono(c);
  const { matched, response } = await rpcHandler.handle(c.req.raw, { context, prefix: '/api' });
  return matched && response ? response : c.text('Not Found', 404);
});

app.all('/api/messaging/*', async (c) => {
  const context = await buildORPCContextFromHono(c);
  const { matched, response } = await rpcHandler.handle(c.req.raw, { context, prefix: '/api' });
  return matched && response ? response : c.text('Not Found', 404);
});

app.all('/api/social/*', async (c) => {
  const context = await buildORPCContextFromHono(c);
  const { matched, response } = await rpcHandler.handle(c.req.raw, { context, prefix: '/api' });
  return matched && response ? response : c.text('Not Found', 404);
});

app.all('/api/announcements/*', async (c) => {
  const context = await buildORPCContextFromHono(c);
  const { matched, response } = await rpcHandler.handle(c.req.raw, { context, prefix: '/api' });
  return matched && response ? response : c.text('Not Found', 404);
});

app.all('/api/principalNotes/*', async (c) => {
  const context = await buildORPCContextFromHono(c);
  const { matched, response } = await rpcHandler.handle(c.req.raw, { context, prefix: '/api' });
  return matched && response ? response : c.text('Not Found', 404);
});

app.all('/api/admin/*', async (c) => {
  const context = await buildORPCContextFromHono(c);
  const { matched, response } = await rpcHandler.handle(c.req.raw, { context, prefix: '/api' });
  return matched && response ? response : c.text('Not Found', 404);
});

// Native oRPC routes (Vertical Slice: SYNC)
app.all('/api/sync/*', async (c) => {
  const context = await buildORPCContextFromHono(c);
  const { matched, response } = await rpcHandler.handle(c.req.raw, { context, prefix: '/api' });
  return matched && response ? response : c.text('Not Found', 404);
});

// Native oRPC routes (Vertical Slice: DAILY CONTENT)
app.all('/api/dailyContent/*', async (c) => {
  const context = await buildORPCContextFromHono(c);
  const { matched, response } = await rpcHandler.handle(c.req.raw, { context, prefix: '/api' });
  return matched && response ? response : c.text('Not Found', 404);
});

// Native oRPC routes (Vertical Slice: LIBRARY)
app.all('/api/library/*', async (c) => {
  const context = await buildORPCContextFromHono(c);
  const { matched, response } = await rpcHandler.handle(c.req.raw, { context, prefix: '/api' });
  return matched && response ? response : c.text('Not Found', 404);
});

// Native oRPC routes (Vertical Slice: OFFLINE AUTHORIZATION SNAPSHOT)
app.all('/api/authorization/*', async (c) => {
  const context = await buildORPCContextFromHono(c);
  const { matched, response } = await rpcHandler.handle(c.req.raw, { context, prefix: '/api' });
  return matched && response ? response : c.text('Not Found', 404);
});

// Native oRPC routes (Vertical Slice: EDUCATION)
app.all('/api/educational/*', async (c) => {
  const context = await buildORPCContextFromHono(c);
  const { matched, response } = await rpcHandler.handle(c.req.raw, { context, prefix: '/api' });
  return matched && response ? response : c.text('Not Found', 404);
});

// Native oRPC routes (Vertical Slice: GRADING)
app.all('/api/grading/*', async (c) => {
  const context = await buildORPCContextFromHono(c);
  const { matched, response } = await rpcHandler.handle(c.req.raw, { context, prefix: '/api' });
  return matched && response ? response : c.text('Not Found', 404);
});

app.all('/api/attendance/*', async (c) => {
  const context = await buildORPCContextFromHono(c);
  const { matched, response } = await rpcHandler.handle(c.req.raw, { context, prefix: '/api' });
  return matched && response ? response : c.text('Not Found', 404);
});

app.all('/api/guardianAssessment/*', async (c) => {
  const context = await buildORPCContextFromHono(c);
  const { matched, response } = await rpcHandler.handle(c.req.raw, { context, prefix: '/api' });
  return matched && response ? response : c.text('Not Found', 404);
});

// Native oRPC routes (Vertical Slice: AGENT SURFACE)
app.all('/api/agent/*', async (c) => {
  const context = await buildORPCContextFromHono(c);
  const { matched, response } = await rpcHandler.handle(c.req.raw, { context, prefix: '/api' });
  return matched && response ? response : c.text('Not Found', 404);
});
const aiPolicyRoute: SovereignRoute = {
  path: '/api/ai/chat',
  method: 'post',
  responses: { 200: { schema: z.any(), description: 'AI response stream' } },
  metadata: { policy: { action: 'use_ai', subject: 'AIAssistant' } },
};
app.use('/api/ai/*', poa(aiPolicyRoute));
app.use('/api/ai/*', featureFlagGateForKey('isAIAssistantEnabled', '/api/ai'));
app.route('/api/ai', aiRouter);

// Transitional ownership bridge: the durable-agent UI now lives in Gurudevi
// Mobile (including web), while the server-only worker is being moved behind
// the canonical Sanctuary API.
app.all('/api/durable-agents/*', async (c) => {
  const legacyBase = getEnv('DURABLE_AGENT_LEGACY_API_URL')?.replace(/\/$/, '');
  if (!legacyBase) return c.json({ error: 'Durable-agent service is not configured.' }, 503);

  const incoming = new URL(c.req.url);
  const target = new URL(`${legacyBase}${incoming.pathname}`);
  incoming.searchParams.forEach((value, key) => target.searchParams.append(key, value));
  const headers = new Headers(c.req.raw.headers);
  headers.delete('host');
  headers.delete('content-length');
  const response = await fetch(target, {
    method: c.req.raw.method,
    headers,
    body: c.req.raw.method === 'GET' || c.req.raw.method === 'HEAD' ? undefined : c.req.raw.body,
    // @ts-expect-error Node fetch requires duplex for streaming request bodies.
    duplex: 'half',
  });
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers: response.headers });
});

// Public Payments Webhook (Bypasses Bearer Auth)
app.post('/payments/payhere-webhook', async (c) => {
  const body = await c.req.parseBody();
  const { merchant_id, order_id, payhere_amount, payhere_currency, status_code, md5sig } = body;

  if (
    typeof merchant_id !== 'string' ||
    typeof order_id !== 'string' ||
    typeof payhere_amount !== 'string' ||
    typeof payhere_currency !== 'string' ||
    typeof status_code !== 'string' ||
    typeof md5sig !== 'string'
  ) {
    return c.text('Bad Request', 400);
  }

  const merchantSecret = getEnv('PAYHERE_MERCHANT_SECRET');
  if (!merchantSecret) {
    console.error('PAYHERE_MERCHANT_SECRET is not set in environment variables');
    return c.text('Configuration Error', 500);
  }

  // Calculate MD5 signature to verify authenticity using standard Web Crypto API
  const secretHash = (await md5Hex(merchantSecret)).toUpperCase();
  const rawString = `${merchant_id}${order_id}${payhere_amount}${payhere_currency}${status_code}${secretHash}`;
  const localSignature = (await md5Hex(rawString)).toUpperCase();

  if (localSignature !== md5sig) {
    console.error('Invalid signature received for order:', order_id);
    return c.text('Unauthorized', 401);
  }

  // Signature matches! Let's process the payment
  if (status_code === '2') {
    console.log(
      `Payment successful for order ${order_id}, amount: ${payhere_amount} ${payhere_currency}`,
    );

    const systemDb = createZenStackDb({ id: 'system-payment-service' });

    try {
      const user = await systemDb.user.findUnique({
        where: { id: order_id },
      });

      if (user) {
        await systemDb.user.update({
          where: { id: order_id },
          data: {
            pricing_tier: 'PRO',
          },
        });
        console.log(`Successfully upgraded user ${order_id} to PRO tier.`);
      } else {
        console.log(
          `Order ID ${order_id} is not a direct user. Handling as transaction reference...`,
        );
      }
    } catch (dbError) {
      console.error('Database update failed during webhook handling:', dbError);
      return c.text('Database Error', 500);
    }
  }

  return c.text('OK', 200);
});

// --- 4. Documentation ---
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
