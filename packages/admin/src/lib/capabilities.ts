import { registerRoleCapabilities } from '@repo/core';

/**
 * Admin Domain Capabilities
 * 
 * Registers platform-level capabilities for founders, admins, and developers.
 */
export function registerAdminCapabilities() {
  registerRoleCapabilities({
    platform: {
      founder: ['platform.observe.all', 'platform.override.support', 'tenant.read', 'tenant.manage'],
      platform_admin: ['platform.observe.all', 'platform.override.support', 'tenant.read', 'tenant.manage'],
      developer: ['platform.observe.all', 'tenant.read'],
      support_operator: ['platform.observe.all', 'tenant.read'],
      auditor: ['platform.observe.all', 'tenant.read'],
    }
  });
}
