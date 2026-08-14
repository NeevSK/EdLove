import { SovereignError } from '@repo/core/types/Errors';

type DatabaseContext = { db?: unknown };

/**
 * Every database-backed handler uses the same typed dependency failure. The
 * assertion also narrows the context for TypeScript after the guard.
 */
export function assertDatabase<T extends DatabaseContext>(
  context: T,
): asserts context is T & { db: NonNullable<T['db']> } {
  if (!context.db) throw SovereignError.unavailable('DATABASE_UNAVAILABLE');
}
