import { createSupabaseRealtimeAdapter } from '@/adapters/realtime/supabase.adapter';
import { createSupabaseAuditRepository } from '@/adapters/supabase/auditRepository';
import { createSupabaseTeacherInsightsRepository } from '@/adapters/supabase/teacherInsightsRepository';
import { createSupabaseTeacherRepository } from '@/adapters/supabase/teacherRepository';
import { SupabaseDeviceSecurityAdapter } from '@/adapters/supabaseDeviceSecurity.adapter';
import { __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__ } from '@/api/supabase';
import { AuditManager } from '@/logic/managers/AuditManager';
import { auth } from '@/logic/managers/auth.factory';
import { DeepLinkManager } from '@/logic/managers/DeepLinkManager';
import { DeviceIdentityManager } from '@/logic/managers/DeviceIdentityManager';
import { DeviceSecurityManager } from '@/logic/managers/DeviceSecurityManager';
import { RealtimeManager } from '@/logic/managers/RealtimeManager';
import { TeacherInsightsManager } from '@/logic/managers/TeacherInsightsManager';
import { TeacherManager } from '@/logic/managers/TeacherManager';

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
