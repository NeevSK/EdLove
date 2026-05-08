import { IdentityManager } from './IdentityManager';
import { DeepLinkManager } from './DeepLinkManager';
import { DeviceIdentityManager } from './DeviceIdentityManager';
import { SupabaseIdentityAdapter } from '../../adapters/supabaseIdentity.adapter';
import { NotificationManager } from './NotificationManager';
import { SupabaseNotificationAdapter } from '../../adapters/supabaseNotification.adapter';
import { DeviceSecurityManager } from './DeviceSecurityManager';
import { SupabaseDeviceSecurityAdapter } from '../../adapters/supabaseDeviceSecurity.adapter';
import { RealtimeManager } from './RealtimeManager';
import { createSupabaseRealtimeAdapter } from '../../adapters/realtime/supabase.adapter';
import { AuthManager } from './AuthManager';
import { SupabaseAuthAdapter } from '../../adapters/supabase/auth.adapter';
import { GrowthManager } from './GrowthManager';
import { SupabaseGrowthAdapter } from '../../adapters/supabase/growth.adapter';
import { MediaManager } from './MediaManager';
import { createCloudinaryAdapter } from '../../adapters/storage/cloudinary.adapter';
import { CommunityManager } from './CommunityManager';
import { SupabaseCommunityRepository } from '../../adapters/supabase/communityRepository';
import { ProfileManager } from './ProfileManager';
import { createSupabaseProfileRepository } from '../../adapters/supabase/profileRepository';
import { createZenStackProfileRepository, isZenStackProfileRepositoryAvailable } from '../../adapters/zenstack/profileRepository';
import { EducationalManager } from './EducationalManager';
import { createSupabaseEducationalRepository } from '../../adapters/supabase/educationalRepository';
import { AuditManager } from './AuditManager';
import { createSupabaseAuditRepository } from '../../adapters/supabase/auditRepository';
import { TeacherManager } from './TeacherManager';
import { createSupabaseTeacherRepository } from '../../adapters/supabase/teacherRepository';
import { TeacherInsightsManager } from './TeacherInsightsManager';
import { createSupabaseTeacherInsightsRepository } from '../../adapters/supabase/teacherInsightsRepository';
import { GlobalConfigManager } from './GlobalConfigManager';
import { SupabaseGlobalConfigAdapter } from '../../adapters/supabase/globalConfig.adapter';
import { PushNotificationManager } from './PushNotificationManager';
import { coreRuntime } from '../runtimeRegistry';
import { disconnectPowerSync } from '../../adapters/powersync/database';
import { storage } from '../../lib/storage';
import { __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__ } from '../../api/supabase';

/**
 * identity: The Global Sovereign Identity Instance.
 */
export const identity = new IdentityManager(new SupabaseIdentityAdapter());

/**
 * notification: The Global Sovereign Notification Instance.
 */
export const notification = new NotificationManager(new SupabaseNotificationAdapter());

/**
 * deviceSecurity: The Global Sovereign Device Security Instance.
 */
export const deviceSecurity = new DeviceSecurityManager(new SupabaseDeviceSecurityAdapter());

/**
 * realtime: The Global Sovereign Realtime Instance.
 */
export const realtime = new RealtimeManager(createSupabaseRealtimeAdapter(__INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__));

/**
 * auth: The Global Sovereign Auth Instance.
 */
export const auth = new AuthManager(
  new SupabaseAuthAdapter(),
  identity, // Pass the global identity manager
  {
    onSignOut: async () => {
      await disconnectPowerSync();
    },
    storage: {
      clearAll: () => storage.clearAll(),
    },
  }
);

/**
 * growth: The Global Sovereign Growth Instance.
 */
export const growth = new GrowthManager(new SupabaseGrowthAdapter());

/**
 * media: The Global Sovereign Media Instance.
 */
export const media = new MediaManager(createCloudinaryAdapter());

/**
 * community: The Global Sovereign Community Instance.
 */
export const community = new CommunityManager(new SupabaseCommunityRepository());

/**
 * profile: The Global Sovereign Profile Instance.
 */
export const profile = new ProfileManager(
  isZenStackProfileRepositoryAvailable()
    ? createZenStackProfileRepository(
        () => ({ id: storage.getString('user_id') || null }), // Use storage for synchronous ID access
        media.adapter, // Inject the storage adapter from media manager
      )
    : createSupabaseProfileRepository(),
);

/**
 * educational: The Global Sovereign Educational Instance.
 */
export const educational = new EducationalManager(
  createSupabaseEducationalRepository(__INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__),
  identity,
  growth,
  community,
);

/**
 * audit: The Global Sovereign Audit Instance.
 */
export const audit = new AuditManager(
  createSupabaseAuditRepository(__INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__),
);

/**
 * teacher: The Global Sovereign Teacher Instance.
 */
export const teacher = new TeacherManager(
  createSupabaseTeacherRepository(__INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__),
);

/**
 * teacherInsights: The Global Sovereign Teacher Insights Instance.
 */
export const teacherInsights = new TeacherInsightsManager(
  createSupabaseTeacherInsightsRepository(__INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__),
);

/**
 * globalConfig: The Global Sovereign Config Instance.
 */
export const globalConfig = new GlobalConfigManager(new SupabaseGlobalConfigAdapter());

/**
 * deepLink: The Global Sovereign DeepLink Instance.
 */
export const deepLink = new DeepLinkManager(auth);

/**
 * deviceIdentity: The Global Sovereign DeviceIdentity Instance.
 */
export const deviceIdentity = new DeviceIdentityManager();

/**
 * pushNotification: The Global Sovereign PushNotification Instance.
 */
export const pushNotification = new PushNotificationManager(coreRuntime as any, identity, deepLink);

