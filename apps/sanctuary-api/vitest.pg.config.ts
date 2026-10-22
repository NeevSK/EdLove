/**
 * Real-Postgres policy suite: no global mocks (setup.ts), schema pushed by ZenStack into
 * a throwaway database. Run: POLICY_TEST_DATABASE_URL=postgres://... pnpm test:policy-pg
 * The URL's database name must contain "test"; every run drops and recreates `public`.
 */
import base from './vitest.config';

const test = { ...(base as any).test };
test.setupFiles = [];
test.include = ['src/__tests__/policy-pg/**/*.test.ts'];
test.exclude = ['**/node_modules/**'];
test.fileParallelism = false;
test.testTimeout = 60000;
test.hookTimeout = 120000;

export default { ...base, test };
