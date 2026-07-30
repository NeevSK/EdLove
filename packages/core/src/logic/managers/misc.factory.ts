import { createSupabaseRealtimeAdapter } from '@repo/core/adapters/realtime/supabase.adapter';
import { createSupabaseAuditRepository } from '@repo/core/adapters/supabase/auditRepository';
import { createSupabaseTeacherInsightsRepository } from '@repo/core/adapters/supabase/teacherInsightsRepository';
import { createSupabaseTeacherRepository } from '@repo/core/adapters/supabase/teacherRepository';
import { SupabaseDeviceSecurityAdapter } from '@repo/core/adapters/supabaseDeviceSecurity.adapter';
import { __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__ } from '@repo/core/api/supabase';
import { AuditManager } from '@repo/core/logic/managers/AuditManager';
import { auth } from '@repo/core/logic/managers/auth.factory';
import { DeepLinkManager } from '@repo/core/logic/managers/DeepLinkManager';
import { DeviceIdentityManager } from '@repo/core/logic/managers/DeviceIdentityManager';
import { DeviceSecurityManager } from '@repo/core/logic/managers/DeviceSecurityManager';
import { RealtimeManager } from '@repo/core/logic/managers/RealtimeManager';
import { TeacherInsightsManager } from '@repo/core/logic/managers/TeacherInsightsManager';
import { TeacherManager } from '@repo/core/logic/managers/TeacherManager';

/**
 * deepLink: The Global Sovereign DeepLink Instance.
 */
export const deepLink = new DeepLinkManager(auth);

/**
 * deviceSecurity: The Global Sovereign Device Security Instance.
 */
export const deviceSecurity = new DeviceSecurityManager(new SupabaseDeviceSecurityAdapter());

/**
 * realtime: The Global Sovereign Realtime Instance.
 */
export const realtime = new RealtimeManager(
  createSupabaseRealtimeAdapter(__INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__),
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
 * deviceIdentity: The Global Sovereign DeviceIdentity Instance.
 */
export const deviceIdentity = new DeviceIdentityManager();
