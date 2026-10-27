export {
  supabaseClient,
  supabaseClient as supabase,
} from '@repo/core/adapters/supabaseClient';
export { authAPI } from '@repo/core/api/auth';
export { identityAPI } from '@repo/core/api/identity';
export { bootstrapPlatform } from '@repo/core/native/bootstrap';
export { deviceTrustAPI } from '@repo/core/native/deviceTrust';
export { FlowResolver } from '@repo/core/native/flows/FlowResolver';
export type {
  AnonymousAuthSubject,
  AuthenticatedAuthSubject,
  GuestConversionRecord,
} from '@repo/core/native/guestConversionLedger';
export {
  assertAnonymousGuestSource,
  authorizeExistingAccountTransfer,
  beginGuestConversion,
  beginLocalGuestConversion,
  bindGuestConversionTarget,
  clearGuestConversionRecord,
  discardGuestConversion,
  readGuestConversionRecord,
} from '@repo/core/native/guestConversionLedger';
export { GuestDataManager } from '@repo/core/native/guestDataManager';
export { GuestDataSync } from '@repo/core/native/guestDataSync';
export {
  clearLocalGuestIdentity,
  getGuestClaimIdentity,
  getLocalGuestIdentity,
  updateLocalGuestIdentity,
} from '@repo/core/native/guestIdentity';
export type { GuestLeaseStatus } from '@repo/core/native/guestLease';
export {
  clearGuestLease,
  clearGuestLeaseData,
  dismissGuestLeaseReminder,
  GUEST_LEASE_DAYS,
  GUEST_LEASE_REMINDER_DAYS,
  getGuestLeaseStatus,
  getOrCreateGuestLease,
  registerGuestLeaseDataKey,
} from '@repo/core/native/guestLease';
export {
  getGuestScope,
  guestStorageKey,
  isGuestUserId,
  setGuestScope,
} from '@repo/core/native/guestScope';
export { discardLocalGuestSession } from '@repo/core/native/guestSessionCleanup';
export {
  completeLocalGuestOnboarding,
  createLocalGuestInitialBond,
  discardLocalGuestOnboarding,
} from '@repo/core/native/localGuestOnboarding';
export type { LocalGuestSession } from '@repo/core/native/localGuestSession';
export {
  clearLocalGuestSession,
  getOrCreateLocalGuestSession,
  isLocalGuestSessionId,
  LocalGuestSessionError,
  restoreLocalGuestSession,
} from '@repo/core/native/localGuestSession';
export { Runtime } from '@repo/core/native/runtime';
export {
  nativeDeviceProvider,
  nativeHapticsProvider,
  nativeLinkingProvider,
  nativeLocationProvider,
  nativeNetworkProvider,
  nativeRuntimeEnvironment,
  nativeShareProvider,
  nativeStorageProvider,
  nativeUIProvider,
} from '@repo/core/native/runtimeAdapter';
export { StorageKeys, storage } from '@repo/core/native/storage';
export { supabaseAuthStorage } from '@repo/core/native/supabaseAuthStorage';
export { useWorkspaceLayoutSync } from '@repo/core/native/useWorkspaceLayoutSync';
