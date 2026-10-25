import { os } from '@orpc/server';
import { doubleGateMiddleware } from './orpcMiddleware';

/**
 * decorateRouterWithDoubleGate
 *
 * Systemic solution architect invariant:
 * Replaces manual copy-pasting of `.use(doubleGateMiddleware)` on individual procedures.
 * Recursively traverses all procedures in a router or nested procedure tree and decorates
 * each procedure with Cedar doubleGateMiddleware, guaranteeing zero routes fail open.
 */
export function decorateRouterWithDoubleGate<T>(router: T): T {
  return (os as any).use(doubleGateMiddleware).router(router as any) as T;
}
