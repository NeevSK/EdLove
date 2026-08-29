# Architectural Testing Strategy — Sanctuary API

**Status**: Active | **Version**: 1.0 | **Owner**: Platform Team  
**Principle**: *Tests must validate architectural contracts, not mock implementations*

---

## 🎯 Core Philosophy

> **Tests are executable architecture documentation.** They verify that the system behaves according to its declared contracts, not that mocks return expected values.

```
┌─────────────────────────────────────────────────────────────────────┐
│  SHALLOW TESTS (What we're ELIMINATING)                            │
├─────────────────────────────────────────────────────────────────────┤
│  mockUser.findUnique.mockResolvedValue({ id: '1', name: 'Test' })  │
│  const result = await getUser('1')                                  │
│  expect(result.name).toBe('Test')  ← Tests the MOCK, not the code  │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  ARCHITECTURAL TESTS (What we're BUILDING)                         │
├─────────────────────────────────────────────────────────────────────┤
│  const result = await client.profile.getUser({ id: '1' })           │
│  expect(UserSchema.parse(result)).toEqual(result)  ← REAL contract  │
│  expect(result.created_at).toBeValidISO8601()  ← Real behavior      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 📐 The Three-Layer Test Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│ LAYER 3: ARCHITECTURAL CONTRACT TESTS                              │
│ (tests/architecture/)                                               │
│ • Contract conformance (Zod schemas)                               │
│ • ADR compliance (middleware, naming, policies)                    │
│ • Property-based invariants (fast-check)                           │
│ • Cross-contract compatibility                                     │
└─────────────────────────────────────────────────────────────────────┘
                                ▲
                                │ validates against
                                │
┌─────────────────────────────────────────────────────────────────────┐
│ LAYER 2: INTEGRATION CONTRACT TESTS                                │
│ (tests/integration/contracts/)                                     │
│ • Real DB (SQLite/PostgreSQL test containers)                      │
│ • Full handler stack (middleware → handler → DB)                   │
│ • End-to-end contract validation                                   │
│ • Cross-handler workflows                                          │
└─────────────────────────────────────────────────────────────────────┘
                                ▲
                                │ exercises
                                │
┌─────────────────────────────────────────────────────────────────────┐
│ LAYER 1: UNIT CONTRACT TESTS                                       │
│ (src/**/__tests__/*.contract.test.ts)                              │
│ • Handler logic with TestContextBuilder                            │
• Schema-driven input/output validation                              │
• Error contract validation                                          │
• Edge cases via property-based testing                              │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 📋 Mandatory Test Patterns (ENFORCED)

### 1. Contract-First Input/Output Validation

```typescript
// ❌ NEVER
expect(result).toEqual({ id: '1', name: 'Test' });

// ✅ ALWAYS - Validate against REAL contract schema
import { MoodLogSchema } from '@repo/core/logic/schemas/self.schema';

it('logMood returns valid MoodLog', async () => {
  const result = await client.self.logMood(validInput);
  const parsed = MoodLogSchema.parse(result);  // Throws if invalid
  expect(parsed.id).toBeDefined();
  expect(parsed.mood_score).toBeGreaterThanOrEqual(0);
  expect(parsed.mood_score).toBeLessThanOrEqual(10);
});
```

### 2. Error Contract Validation

```typescript
// Every procedure MUST test error contracts
it('rejects invalid input with BAD_REQUEST', async () => {
  await expect(client.self.logMood({ mood_score: 15 }))
    .rejects.toMatchObject({ 
      code: 'BAD_REQUEST',
      status: 400,
      data: expect.objectContaining({
        issues: expect.arrayContaining([
          expect.objectContaining({ path: ['mood_score'] })
        ])
      });
});

it('rejects unauthenticated with FORBIDDEN', async () => {
  await expect(unauthClient.self.logMood(validInput))
    .rejects.toMatchObject({ 
      code: 'FORBIDDEN',
      status: 403 
    });
});
```

### 3. Property-Based Invariants

```typescript
import { fc } from '@fast-check/vitest';

it('logMood → getMoodHistory roundtrip', async () => {
  await fc.assert(fc.asyncProperty(
    fc.record({
      mood_score: fc.integer({ min: 0, max: 10 }),
      mood: fc.option(fc.string({ minLength: 1, maxLength: 20 })),
      note: fc.option(fc.string({ maxLength: 500 })),
    }),
    async (input) => {
      const client = createTestClient();
      const created = await client.self.logMood(input);
      const history = await client.self.getMoodHistory({ limit: 1 });
      
      expect(history[0].id).toBe(created.id);
      expect(history[0].mood_score).toBe(input.mood_score);
      expect(history[0].mood).toBe(input.mood ?? null);
    }
  ));
});
```

### 4. ADR Compliance Tests

```typescript
it('All handlers use doubleGateMiddleware', () => {
  const routers = [selfRouter, profileRouter, historyRouter, rewardsRouter];
  for (const router of routers) {
    for (const [name, proc] of Object.entries(router._def.procedures)) {
      const hasDoubleGate = proc._def.middlewares.some(
        m => m.name === 'doubleGateMiddleware'
      );
      expect(hasDoubleGate).toBe(true);
    }
  });
});

it('All mutations use correct HTTP method', () => {
  for (const [name, proc] of Object.entries(selfContract)) {
    if (['create', 'update', 'delete', 'log', 'save', 'burn'].some(p => name.startsWith(p))) {
      expect(['post', 'put', 'patch', 'delete']).toContain(procedure.method);
    }
  });
});
```

---

## 🏗️ Implementation Directory Structure

```
tests/
├── architecture/
│   ├── contract-conformance.test.ts      # Zod schema validation
│   ├── adr-compliance.test.ts            # ADR enforcement
│   ├── property-invariants.test.ts       # fast-check properties
│   └── cross-contract.test.ts            # Cross-contract workflows
│
├── integration/
│   ├── contracts/
│   │   ├── self.handler.integration.test.ts
│   │   ├── profile.handler.integration.test.ts
│   │   └── ...
│   ├── workflows/
│   │   ├── onboarding.workflow.test.ts
│   │   ├── mood-journal.workflow.test.ts
│   │   └── ...
│   └── containers/
│       └── testcontainers.postgres.ts
│
└── unit/
    ├── self.contract.test.ts
    ├── profile.contract.test.ts
    └── ...
```

---

## 🔧 TestContextBuilder Usage (The Right Way)

```typescript
// tests/unit/self.contract.test.ts
import { TestContextBuilder, resetTestDatabase, createTestORPCClient } from '../test-doubles';

describe('Self Contract', () => {
  const headers = { Authorization: `Bearer ${TEST_USER_ID}` };

  beforeEach(() => {
    resetTestDatabase(b => b
      .withZenStackDb(true)
      .withActiveBond({ capacity: 'teacher' })
    );
  });

  describe('logMood', () => {
    const validInput = { mood_score: 8, mood: 'happy', note: 'Test' };

    it('accepts valid input per MoodLogSchema', async () => {
      const result = await createTestORPCClient(headers).self.logMood(validInput);
      MoodLogSchema.parse(result);  // ✅ Real contract validation
    });

    it('rejects mood_score > 10', async () => {
      await expect(client.self.logMood({ mood_score: 11 }))
        .rejects.toMatchObject({ code: 'BAD_REQUEST' });
    });

    it('persists to database', async () => {
      const db = resetTestDatabase(b => b.withCollectionNodeEvents([]));
      const result = await client.self.logMood({ mood_score: 8, mood: 'happy' });
      
      const persisted = await db.moodLog.findUnique({ where: { id: result.id } });
      expect(persisted).toMatchObject({ mood_score: 8, mood: 'happy' });
    });
  });
});
```

---

## 🚫 Forbidden Patterns (CI WILL FAIL)

```typescript
// eslint.config.js additions
module.exports = {
  rules: {
    'no-restricted-syntax': [
      'error',
      {
        selector: "CallExpression[callee.property.name='mockResolvedValue']",
        message: 'Use contract validation, not mockResolvedValue'
      },
      {
        selector: "CallExpression[callee.property.name='mockReturnValue']",  
        message: 'Use contract validation, not mockReturnValue'
      },
      {
        selector: "CallExpression[callee.object.name='expect'][callee.property.name='toHaveBeenCalled']",
        message: 'Test behavior, not mock calls'
      }
    ]
  }
};
```

---

## 📊 Coverage Quality Gates

```typescript
// vitest.config.ts
coverage: {
  thresholds: {
    lines: 50,
    functions: 50, 
    branches: 50,
    statements: 50,
  },
  // Quality metrics
  perFile: true,
  include: ['src/**/*.ts'],
  exclude: ['**/*.test.ts', '**/*.d.ts'],
};
```

**Quality Metrics (NOT just %):**
| Metric | Target | Measurement |
|--------|--------|-------------|
| Contract Coverage | 100% | Every procedure has contract test |
| Error Contract Coverage | 100% | Every error code tested |
| ADR Compliance | 100% | All ADRs have test |
| Property Invariants | ≥5/handler | fast-check properties |

---

## 🚀 Implementation Priority

| Phase | Focus | Files | Effort |
|-------|-------|-------|--------|
| 1 | **Fix build + enable blocked tests** | entitlement port, history, rewards, sync | 1 day |
| 2 | **Architecture test suite** | `tests/architecture/*.test.ts` | 2 days |
| 3 | **Integration contracts** | `tests/integration/contracts/*.test.ts` | 2 days |
| 4 | **Unit contract coverage** | All handlers to 80%+ | 3 days |
| 5 | **Property invariants** | 5+ properties/handler | 2 days |
| 6 | **ADR compliance** | Automated CI gates | 1 day |

---

## 🛡️ Quality Gate (CI)

```yaml
# .github/workflows/quality.yml
jobs:
  contract-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: pnpm install --frozen-lockfile
      - run: pnpm run build  # Fix entitlement port first
      - run: pnpm run test:architecture
      - run: pnpm run test:integration:contracts
      - run: pnpm run test:unit:contracts
      - run: pnpm run test:adr
      - run: pnpm run test:properties
      - run: pnpm run check:coverage  # 50% thresholds
```

---

**This document IS the testing architecture. Any test not following these patterns is technical debt and will be refactored.**