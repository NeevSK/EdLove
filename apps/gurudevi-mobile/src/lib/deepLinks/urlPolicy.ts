/**
 * URL Policy & Sanitization
 * Re-exports the Effect-driven deep link policy pipeline from @repo/core.
 */

export {
  ALLOWED_NATIVE_HOSTS,
  ALLOWED_WEB_HOSTS,
  ALLOWED_WEB_PATH_PREFIXES,
  isQRDeepLink,
  MAX_DEEP_LINK_LENGTH,
  normalizeAcceptedDeepLink,
  normalizeAcceptedInternalRoute,
  validateDeepLinkEffect,
} from '@repo/core/logic/deeplink/deepLinkPolicyPipeline';
