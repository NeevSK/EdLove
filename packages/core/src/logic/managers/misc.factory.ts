import { DeepLinkManager } from './DeepLinkManager';
import { DeviceIdentityManager } from './DeviceIdentityManager';
import { DeviceSecurityManager } from './DeviceSecurityManager';
import { RealtimeManager } from './RealtimeManager';
import { AuditManager } from './AuditManager';
import { TeacherManager } from './TeacherManager';
import { TeacherInsightsManager } from './TeacherInsightsManager';
import { GlobalConfigManager } from './GlobalConfigManager';

import { SupabaseDeviceSecurityAdapter } from '../../adapters/supabaseDeviceSecurity.adapter';
import { createSupabaseRealtimeAdapter } from '../../adapters/realtime/supabase.adapter';
import { createSupabaseAuditRepository } from '../../adapters/supabase/auditRepository';
import { createSupabaseTeacherRepository } from '../../adapters/supabase/teacherRepository';
import { createSupabaseTeacherInsightsRepository } from '../../adapters/supabase/teacherInsightsRepository';
import { SupabaseGlobalConfigAdapter } from '../../adapters/supabase/globalConfig.adapter';

import { __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__ } from '../../api/supabase';
import { auth } from './auth.factory';

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
export const realtime = new RealtimeManager(createSupabaseRealtimeAdapter(__INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__));

/**
 * audit: The Global Sovereign Audit Instance.
 */
export const audit = new AuditManager(createSupabaseAuditRepository(__INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__));

/**
 * teacher: The Global Sovereign Teacher Instance.
 */
export const teacher = new TeacherManager(createSupabaseTeacherRepository(__INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__));

/**
 * teacherInsights: The Global Sovereign Teacher Insights Instance.
 */
export const teacherInsights = new TeacherInsightsManager(createSupabaseTeacherInsightsRepository(__INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__));

/**
 * globalConfig: The Global Sovereign Config Instance.
 */
export const globalConfig = new GlobalConfigManager(new SupabaseGlobalConfigAdapter());

/**
 * deviceIdentity: The Global Sovereign DeviceIdentity Instance.
 */
export const deviceIdentity = new DeviceIdentityManager();
