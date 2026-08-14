import { createConfiguredRateLimitStore, createRateLimitMiddleware } from '../../core/rateLimit';

export const rateLimit = createRateLimitMiddleware({
  prefix: 'ai',
  limit: 10,
  windowMs: 60 * 1000,
  store: createConfiguredRateLimitStore(),
});
