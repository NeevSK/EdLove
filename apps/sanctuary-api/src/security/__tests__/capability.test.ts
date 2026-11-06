import { createModularPolicySet, loadModularPolicySet } from '@repo/policies';
import { exportJWK, generateKeyPair, SignJWT } from 'jose';
import { Pool } from 'pg';
import { describe, expect, it, vi } from 'vitest';
import { type Capability, createSecurity, type SecurityOptions } from '../security';

const issuer = 'https://identity.example/auth/v1';
const accountId = '01234567-89ab-8101-8000-010203040506';
const subject = '123e4567-e89b-4123-8123-426614174000';
const sessionId = '123e4567-e89b-4123-8123-426614174001';
const bondId = '123e4567-e89b-4123-8123-426614174002';

const learning = `namespace Learning {
  entity Assignment { schoolId: String };
  action "submit" appliesTo {
    principal: [Platform::Account], resource: [Assignment], context: { bond: Platform::Bond }
  };
}`;
const teacherSubmits = createModularPolicySet({
  schemas: [loadModularPolicySet().schema.replace(/namespace Learning \{\}/, learning)],
  policies: [
    `permit(principal, action == Learning::Action::"submit", resource)
     when { context.bond.citizenship == "FIRST_CLASS" && resource.schoolId == context.bond.entityId };`,
  ],
});

async function boundary(
  bond: { entity_type: string; capacity: string; citizenship?: string | null } | null,
  extra: Partial<SecurityOptions> = {},
) {
  const keys = await generateKeyPair('ES256');
  const jwk = await exportJWK(keys.publicKey);
  const pool = new Pool();
  let bondRow = bond;
  const query = vi.fn().mockImplementation(async (sql: string) => ({
    rows: sql.includes('FROM public.bonds bond')
      ? bondRow
        ? [
            {
              id: bondId,
              entity_id: 'school-1',
              citizenship: bondRow.entity_type === 'SCHOOL' ? 'FIRST_CLASS' : 'SECOND_CLASS',
              ...bondRow,
            },
          ]
        : []
      : [{ account_id: accountId }],
  }));
  Object.defineProperty(pool, 'query', { value: query, configurable: true });
  const security = createSecurity({
    pool,
    issuer,
    audience: 'authenticated',
    jwksUrl: `${issuer}/.well-known/jwks.json`,
    algorithms: ['ES256'],
    jwksFetch: async () => Response.json({ keys: [{ ...jwk, kid: 'test', alg: 'ES256' }] }),
    ...extra,
  });
  const token = await new SignJWT({
    session_id: sessionId,
    canonical_account_id: accountId,
    role: 'authenticated',
  })
    .setProtectedHeader({ alg: 'ES256', kid: 'test' })
    .setIssuer(issuer)
    .setAudience('authenticated')
    .setSubject(subject)
    .setExpirationTime('1h')
    .sign(keys.privateKey);
  const signal = new AbortController().signal;
  const identity = await security.authenticate(`Bearer ${token}`, signal);
  const scope = await security.resolveScope(identity, bondId, signal);
  return {
    security,
    scope,
    signal,
    pool,
    endBond: () => {
      bondRow = null;
    },
  };
}

const submit = (schoolId: string): Capability => ({
  name: 'Learning::submit',
  resourceType: 'Assignment',
  resolveResource: async () => ({ id: 'assignment-1', attributes: { schoolId } }),
});

describe('domain capability authority boundary', () => {
  it('reads citizenship stored on the bond, never from its entity type', async () => {
    const stored = await boundary({
      entity_type: 'SCHOOL',
      capacity: 'teacher',
      citizenship: 'SECOND_CLASS',
    });
    try {
      expect(stored.scope.citizenship).toBe('SECOND_CLASS');
    } finally {
      await stored.pool.end();
    }
  });

  it('refuses a bond with no valid stored citizenship', async () => {
    await expect(
      boundary({ entity_type: 'SCHOOL', capacity: 'teacher', citizenship: null }),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    await expect(
      boundary({ entity_type: 'SCHOOL', capacity: 'teacher', citizenship: 'WANDERER' }),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });

  it('denies every domain capability by default', async () => {
    const { security, scope, signal, pool } = await boundary({
      entity_type: 'SCHOOL',
      capacity: 'teacher',
    });
    try {
      await expect(
        security.authorizeCapability(scope, submit('school-1'), signal),
      ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    } finally {
      await pool.end();
    }
  });

  it('permits through the bond once a policy says so, and only for its own school', async () => {
    const { security, scope, signal, pool } = await boundary(
      { entity_type: 'SCHOOL', capacity: 'teacher' },
      { capabilityPolicies: teacherSubmits },
    );
    try {
      await expect(
        security.authorizeCapability(scope, submit('school-1'), signal),
      ).resolves.toMatchObject({ permitted: true });
      await expect(
        security.authorizeCapability(scope, submit('school-2'), signal),
      ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    } finally {
      await pool.end();
    }
  });

  it('does not let a resolver override the declared resource type', async () => {
    const { security, scope, signal, pool } = await boundary(
      { entity_type: 'SCHOOL', capacity: 'teacher' },
      { capabilityPolicies: teacherSubmits },
    );
    const capability: Capability = {
      name: 'Learning::submit',
      resourceType: 'DifferentResource',
      resolveResource: async () => ({
        id: 'assignment-1',
        type: 'Assignment',
        attributes: { schoolId: 'school-1' },
      }),
    };
    try {
      await expect(security.authorizeCapability(scope, capability, signal)).rejects.toMatchObject({
        code: 'SERVICE_UNAVAILABLE',
      });
    } finally {
      await pool.end();
    }
  });

  it('denies a personal bond the institutional capability', async () => {
    const { security, scope, signal, pool } = await boundary(
      { entity_type: 'PERSONAL', capacity: 'teacher' },
      { capabilityPolicies: teacherSubmits },
    );
    try {
      await expect(
        security.authorizeCapability(scope, submit('school-1'), signal),
      ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    } finally {
      await pool.end();
    }
  });

  it('denies once the bond has ended, even with a scope resolved earlier', async () => {
    const { security, scope, signal, pool, endBond } = await boundary(
      { entity_type: 'SCHOOL', capacity: 'teacher' },
      { capabilityPolicies: teacherSubmits },
    );
    try {
      endBond();
      await expect(
        security.authorizeCapability(scope, submit('school-1'), signal),
      ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    } finally {
      await pool.end();
    }
  });

  it('fails closed on an unknown namespace and on a missing resource', async () => {
    const { security, scope, signal, pool } = await boundary({
      entity_type: 'SCHOOL',
      capacity: 'teacher',
    });
    try {
      await expect(
        security.authorizeCapability(
          scope,
          { ...submit('school-1'), name: 'Payroll::run' },
          signal,
        ),
      ).rejects.toMatchObject({ code: 'SERVICE_UNAVAILABLE' });
      await expect(
        security.authorizeCapability(
          scope,
          { ...submit('school-1'), resolveResource: async () => null },
          signal,
        ),
      ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    } finally {
      await pool.end();
    }
  });

  it('refuses a scope it did not resolve', async () => {
    const { security, scope, signal, pool } = await boundary({
      entity_type: 'SCHOOL',
      capacity: 'teacher',
    });
    try {
      await expect(
        security.authorizeCapability({ ...scope }, submit('school-1'), signal),
      ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    } finally {
      await pool.end();
    }
  });
});
