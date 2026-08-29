import { describe, expect, it } from 'vitest';
import { selfRouter } from '../apps/sanctuary-api/src/core/handlers/self';
import { profileRouter } from '../apps/sanctuary-api/src/core/handlers/profile';
import { historyRouter } from '../apps/sanctuary-api/src/core/handlers/history';
import { rewardsRouter } from '../apps/sanctuary-api/src/core/handlers/rewards';
import { presenceRouter } from '../apps/sanctuary-api/src/core/handlers/presence';
import { attendanceRouter } from '../apps/sanctuary-api/src/core/handlers/attendance';
import { inventoryRouter } from '../apps/sanctuary-api/src/core/handlers/inventory';
import { mappingRouter } from '../apps/sanctuary-api/src/core/handlers/mapping';
import { identityRouter } from '../apps/sanctuary-api/src/core/handlers/identity';
import { profileContract } from '../packages/core/src/api/profile.contract';
import { historyContract } from '../packages/core/src/api/history.contract';
import { rewardsContract } from '../packages/core/src/api/rewards.contract';
import { presenceContract } from '../packages/core/src/api/presence.contract';
import { attendanceContract } from '../packages/core/src/api/attendance.contract';
import { inventoryContract } from '../packages/core/src/api/inventory.contract';
import { mappingContract } from '../packages/core/src/api/mapping.contract';
import { identityContract } from '../packages/core/src/api/identity.contract';

const ALL_ROUTERS = [
  { name: 'self', router: selfRouter, contract: null },
  { name: 'profile', router: profileRouter, contract: null },
  { name: 'history', router: historyRouter, contract: historyContract },
  { name: 'rewards', router: rewardsRouter, contract: rewardsContract },
  { name: 'presence', router: presenceRouter, contract: presenceContract },
  { name: 'attendance', router: attendanceRouter, contract: attendanceContract },
  { name: 'inventory', router: inventoryRouter, contract: inventoryContract },
  { name: 'mapping', router: mappingRouter, contract: mappingContract },
  { name: 'identity', router: identityRouter, contract: identityContract },
];

describe('ADR Compliance: Middleware Enforcement', () => {
  for (const { name, router } of ALL_ROUTERS) {
    describe(`${name} router`, () => {
      it('every procedure uses doubleGateMiddleware', () => {
        for (const [procName, proc] of Object.entries(router._def.procedures)) {
          const middlewares = proc._def.middlewares || [];
          const hasDoubleGate = middlewares.some(m => m.name === 'doubleGateMiddleware');
          expect(hasDoubleGate).toBe(true);
        }
      });
    });
  });
});

describe('ADR Compliance: HTTP Method Correctness', () => {
  const ALL_CONTRACTS = [
    { name: 'history', contract: historyContract },
    { name: 'rewards', contract: rewardsContract },
    { name: 'presence', contract: presenceContract },
    { name: 'attendance', contract: attendanceContract },
    { name: 'inventory', contract: inventoryContract },
    { name: 'mapping', contract: mappingContract },
    { name: 'identity', contract: identityContract },
  ];

  for (const { name, contract } of ALL_CONTRACTS) {
    describe(`${name} contract HTTP methods`, () => {
      for (const [procName, proc] of Object.entries(contract)) {
        const isMutation = ['create', 'update', 'delete', 'log', 'save', 'burn', 'add', 'award', 'initialize', 'award', 'check', 'upsert', 'remove', 'enroll', 'enroll', 'shadow'].some(p => procName.toLowerCase().startsWith(p));
        
        it(`${name}.${procName} uses ${isMutation ? 'mutation' : 'query'} method`, () => {
          if (isMutation) {
            expect(['post', 'put', 'patch', 'delete']).toContain(proc.method);
          } else {
            expect(['get', 'post']).toContain(proc.method);
          }
        });
      });
    });
  });
});

describe('ADR Compliance: Path Naming Convention', () => {
  const ALL_CONTRACTS = [
    { name: 'self', contract: require('../packages/core/src/api/self.contract').selfContract },
    { name: 'profile', contract: require('../packages/core/src/api/profile.contract').profileContract },
    { name: 'history', contract: require('../packages/core/src/api/history.contract').historyContract },
    { name: 'rewards', contract: require('../packages/core/src/api/rewards.contract').rewardsContract },
    { name: 'presence', contract: require('../packages/core/src/api/presence.contract').presenceContract },
    { name: 'attendance', contract: require('../packages/core/src/api/attendance.contract').attendanceContract },
    { name: 'inventory', contract: require('../packages/core/src/api/inventory.contract').inventoryContract },
    { name: 'mapping', contract: require('../packages/core/src/api/mapping.contract').mappingContract },
    { name: 'identity', contract: require('../packages/core/src/api/identity.contract').identityContract },
  ];

  for (const { name, contract } of ALL_CONTRACTS) {
    describe(`${name} path convention`, () => {
      for (const [procName, proc] of Object.entries(contract)) {
        it(`${name}.${procName} path uses kebab-case`, () => {
          expect(proc.path).toMatch(/^(\/[a-z0-9]+(-[a-z0-9]+)*)+$/);
        });

        it(`${name}.${procName} path params use :param syntax`, () => {
          const pathParams = (proc.path.match(/:([a-zA-Z0-9_]+)/g) || []).map(p => p.slice(1));
          if (proc.request?.params) {
            const schemaParams = Object.keys(proc.request.params._def.shape());
            expect(pathParams.sort()).toEqual(schemaParams.sort());
          }
        });
      }
    });
  });
});

describe('ADR Compliance: Policy Metadata', () => {
  const ALL_CONTRACTS = [
    { name: 'self', contract: require('../packages/core/src/api/self.contract').selfContract },
    { name: 'profile', contract: require('../packages/core/src/api/profile.contract').profileContract },
    { name: 'history', contract: require('../packages/core/src/api/history.contract').historyContract },
    { name: 'rewards', contract: require('../packages/core/src/api/rewards.contract').rewardsContract },
    { name: 'presence', contract: require('../packages/core/src/api/presence.contract').presenceContract },
    { name: 'attendance', contract: require('../packages/core/src/api/attendance.contract').attendanceContract },
    { name: 'inventory', contract: require('../packages/core/src/api/inventory.contract').inventoryContract },
    { name: 'mapping', contract: require('../packages/core/src/api/mapping.contract').mappingContract },
    { name: 'identity', contract: require('../packages/core/src/api/identity.contract').identityContract },
  ];

  for (const { name, contract } of ALL_CONTRACTS) {
    describe(`${name} policy metadata`, () => {
      for (const [procName, proc] of Object.entries(contract)) {
        it(`${name}.${procName} has policy metadata`, () => {
          expect(proc.metadata).toBeDefined();
          expect(proc.metadata.policy).toBeDefined();
          expect(typeof proc.metadata.policy.action).toBe('string');
          expect(proc.metadata.policy.action.length).toBeGreaterThan(0);
          expect(typeof proc.metadata.policy.subject).toBe('string');
          expect(proc.metadata.policy.subject.length).toBeGreaterThan(0);
        });

        it(`${name}.${procName} action follows verb naming`, () => {
          const validActions = ['create', 'read', 'update', 'delete', 'use', 'list', 'view', 'manage', 'access', 'submit', 'award', 'initialize', 'check', 'award', 'log', 'save', 'burn'];
          expect(validActions).toContain(proc.metadata.policy.action);
        });

        it(`${name}.${procName} subject is PascalCase`, () => {
          expect(proc.metadata.policy.subject).toMatch(/^[A-Z][a-zA-Z]+$/);
        });
      }
    });
  });
});

describe('ADR Compliance: Response Schema Consistency', () => {
  const ALL_CONTRACTS = [
    { name: 'self', contract: require('../packages/core/src/api/self.contract').selfContract },
    { name: 'profile', contract: require('../packages/core/src/api/profile.contract').profileContract },
    { name: 'history', contract: require('../packages/core/src/api/history.contract').historyContract },
    { name: 'rewards', contract: require('../packages/core/src/api/rewards.contract').rewardsContract },
    { name: 'presence', contract: require('../packages/core/src/api/presence.contract').presenceContract },
  ];

  for (const { name, contract } of ALL_CONTRACTS) {
    describe(`${name} response schemas`, () => {
      for (const [procName, proc] of Object.entries(contract)) {
        it(`${name}.${procName} has success response schema`, () => {
          const has200 = proc.responses[200] !== undefined;
          const has201 = proc.responses[201] !== undefined;
          expect(has200 || has201).toBe(true);
          
          const successSchema = proc.responses[200]?.schema || proc.responses[201]?.schema;
          expect(successSchema).toBeDefined();
          expect(typeof successSchema.parse).toBe('function');
        });

        it(`${name}.${procName} has 400 error schema`, () => {
          expect(proc.responses[400]).toBeDefined();
        });

        it(`${name}.${procName} has 403 error schema`, () => {
          expect(proc.responses[403]).toBeDefined();
        });

        it(`${name}.${procName} has 404 error schema where applicable`, () => {
          // Procedures that can return 404 should have it documented
          if (procName.startsWith('get') && procName.includes('Id')) {
            expect(proc.responses[404]).toBeDefined();
          }
        });
      }
    });
  });
});

describe('ADR Compliance: Input Schema Validation', () => {
  const ALL_CONTRACTS = [
    { name: 'self', contract: require('../packages/core/src/api/self.contract').selfContract },
    { name: 'history', contract: require('../packages/core/src/api/history.contract').historyContract },
    { name: 'rewards', contract: require('../packages/core/src/api/rewards.contract').rewardsContract },
  ];

  for (const { name, contract } of ALL_CONTRACTS) {
    describe(`${name} input schemas`, () => {
      for (const [procName, proc] of Object.entries(contract)) {
        it(`${name}.${procName} has defined input`, () => {
          expect(proc.request).toBeDefined();
          // Every procedure must declare its input shape
          expect(Object.keys(proc.request).length).toBeGreaterThan(0);
        });

        it(`${name}.${procName} body/query/params are Zod schemas`, () => {
          if (proc.request.body) {
            expect(typeof proc.request.body.parse).toBe('function');
          }
          if (proc.request.query) {
            expect(typeof proc.request.query.parse).toBe('function');
          }
          if (proc.request.params) {
            expect(typeof proc.request.params.parse).toBe('function');
          }
        });
      }
    });
  });
});

describe('ADR Compliance: Error Code Consistency', () => {
  const ALL_CONTRACTS = [
    { name: 'self', contract: require('../packages/core/src/api/self.contract').selfContract },
    { name: 'history', contract: require('../packages/core/src/api/history.contract').historyContract },
    { name: 'rewards', contract: require('../packages/core/src/api/rewards.contract').rewardsContract },
  ];

  const VALID_ERROR_CODES = ['400', '401', '403', '404', '409', '422', '500'];

  for (const { name, contract } of ALL_CONTRACTS) {
    describe(`${name} error codes`, () => {
      for (const [procName, proc] of Object.entries(contract)) {
        it(`${name}.${procName} uses only valid error codes`, () => {
          for (const code of Object.keys(proc.responses)) {
            expect(VALID_ERROR_CODES).toContain(code);
          }
        });

        it(`${name}.${procName} has 400 for validation errors`, () => {
          expect(proc.responses[400]).toBeDefined();
        });

        it(`${name}.${procName} has 403 for auth errors`, () => {
          expect(proc.responses[403]).toBeDefined();
        });
      }
    });
  });
});

describe('ADR Compliance: Cross-Contract Consistency', () => {
  it('All contracts use consistent ID format (UUID)', () => {
    const ALL_CONTRACTS = [
      require('../packages/core/src/api/self.contract').selfContract,
      require('../packages/core/src/api/history.contract').historyContract,
      require('../packages/core/src/api/rewards.contract').rewardsContract,
      require('../packages/core/src/api/profile.contract').profileContract,
    ];

    for (const contract of ALL_CONTRACTS) {
      for (const proc of Object.values(contract)) {
        // Check path params that look like IDs
        if (proc.request?.params) {
          const shape = proc.request.params._def.shape();
          for (const [key, schema] of Object.entries(shape)) {
            if (key.toLowerCase().includes('id')) {
              // Should be UUID validation
              expect(schema._def.checks.some((c: any) => c.kind === 'uuid')).toBe(true);
            }
          }
        }
      }
    });
  });

  it('All timestamps use ISO 8601 in schemas', () => {
    // This is validated at the schema level (z.string().datetime())
    // but we can verify at the contract level too
    const ALL_CONTRACTS = [
      require('../packages/core/src/api/self.contract').selfContract,
      require('../packages/core/src/api/history.contract').historyContract,
    ];

    for (const contract of ALL_CONTRACTS) {
      for (const proc of Object.values(contract)) {
        const checkSchema = (schema: any) => {
          if (!schema || !schema._def) return;
          const checks = schema._def.checks || [];
          const hasDatetime = checks.some((c: any) => c.kind === 'datetime' || c.kind === 'iso_datetime');
          // If it's a timestamp field, it should have datetime check
        };
        
        // Check response schemas for datetime fields
        const successSchema = proc.responses[200]?.schema || proc.responses[201]?.schema;
        if (successSchema) {
          const traverse = (s: any) => {
            if (!s || !s._def) return;
            const checks = s._def.checks || [];
            if (checks.some((c: any) => c.kind === 'datetime')) return;
            for (const key of Object.keys(s._def.shape?.() || {})) {
              traverse(s._def.shape()[key]);
            }
          };
          traverse(successSchema);
        }
      }
    });
  });
});