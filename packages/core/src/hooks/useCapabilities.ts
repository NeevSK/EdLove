import { useMemo } from 'react';
import { usePermissions } from '../permissions/hooks/usePermissions';
import { useStore } from '../store/useStore';
import { useTenantContext } from './useTenantContext';
import { can as evaluateCapability, getPlatformAccessContext, getResolvedCapabilities } from '../lib/capabilities';
import type {
  AuthorityTier,
  CapabilityKey,
  CapabilityResource,
  PlatformAccessContext,
  PolicyDecision,
  TenantContext,
} from '../types';

export interface Capabilities {
  identity: {
    isAnonymous: boolean;
    isRegistered: boolean;
    needsOnboarding: boolean;
    authority: AuthorityTier | null;
  };
  community: {
    canDiscoverGroups: boolean;
    canViewFeed: boolean;
    canJoinGroup: boolean;
    canCreateGroup: boolean;
    canPost: boolean;
    canDM: boolean;
  };
  library: {
    canBrowsePublic: boolean;
    canViewVerified: boolean;
    canUpload: boolean;
  };
  classroom: {
    canViewDemo: boolean;
    canUsePersonalWorkspaceClassroom: boolean;
    canUsePrincipalSchoolManagement: boolean;
  };
  self: {
    canUseLocal: boolean;
    canSyncCloud: boolean;
  };
  policy: {
    tenant: TenantContext;
    platformAccess: PlatformAccessContext;
    capabilities: CapabilityKey[];
    can: (capability: CapabilityKey, resource?: CapabilityResource) => boolean;
    evaluate: (capability: CapabilityKey, resource?: CapabilityResource) => PolicyDecision;
  };
}

export function useCapabilities(): Capabilities {
  const { context, can: canFn, ability } = usePermissions();
  const schoolType = useStore((s) => s.schoolType);
  const tenant = useTenantContext();
  const onboardingCompleted = useStore((s) => s.onboardingCompleted);

  return useMemo(() => {
    const isAnonymous = context.isAnonymous;
    const isRegistered = !isAnonymous && !!context.email;
    const needsOnboarding = !onboardingCompleted;

    const platformAccess = getPlatformAccessContext(useStore.getState().user, { tenantKind: tenant.tenantKind });
    const capabilities = getResolvedCapabilities(platformAccess);
    
    // Evaluate using ability from usePermissions
    const evaluate = (capability: CapabilityKey, resource?: CapabilityResource) => {
        // Bridge legacy CapabilityKey to AppAbility Subjects/Actions
        let action: any = 'read';
        let subject: any = capability;

        if (capability.includes('.')) {
            const parts = capability.split('.');
            // Common mapping logic for legacy dots
            if (parts.includes('manage')) action = 'manage';
            if (parts.includes('create')) action = 'create';
            if (parts.includes('delete')) action = 'delete';
            if (parts.includes('update')) action = 'update';

            // Map legacy namespaces to AppAbility Subjects
            if (parts[0] === 'school') subject = 'School';
            else if (parts[0] === 'classroom') subject = 'Classroom';
            else if (parts[0] === 'student') subject = 'Student';
            else if (parts[0] === 'staff') subject = 'Staff';
            else if (parts[0] === 'inventory') subject = 'Inventory';
            else if (parts[0] === 'attendance') subject = 'Attendance';
            else if (parts[0] === 'leave') subject = 'LeaveApproval';
            else subject = parts[0].charAt(0).toUpperCase() + parts[0].slice(1); // Fallback title case
        }

        // Special mappings for specific functional keys
        if (capability === 'classroom.school.manage') { action = 'manage'; subject = 'School'; }
        if (capability === 'app.local.use') { action = 'read'; subject = 'Ecosystem'; }

        // Evaluation
        const allowed = ability.can(action, subject);
        
        return { 
            allowed, 
            capability,
            action,
            reason: allowed ? 'Granted by POA' : 'Denied by POA'
        } as PolicyDecision;
    };

    const can = (cap: CapabilityKey, res?: CapabilityResource) => evaluate(cap, res).allowed;

    return {
      identity: {
        isAnonymous,
        isRegistered,
        needsOnboarding,
        authority: context.roles[0] || null,
      },
      community: {
        canDiscoverGroups: can('community.groups.discover'),
        canViewFeed: can('community.feed.view'),
        canJoinGroup: can('community.groups.join'),
        canCreateGroup: can('community.groups.create'),
        canPost: can('community.feed.post'), // Assuming this key exists or would be mapped
        canDM: can('community.dm.create'),
      },
      library: {
        canBrowsePublic: can('library.browse'),
        canViewVerified: can('library.verified.view'),
        canUpload: can('library.upload'),
      },
      classroom: {
        canViewDemo: can('app.local.use'), // Mapping demo access to local use for now
        canUsePersonalWorkspaceClassroom: can('classroom.personal.use'),
        canUsePrincipalSchoolManagement: can('classroom.school.manage'),
      },
      self: {
        canUseLocal: can('app.local.use'),
        canSyncCloud: can('app.cloud.sync'),
      },
      policy: {
        tenant,
        platformAccess,
        capabilities,
        can: (capability, resource) => evaluate(capability, resource).allowed,
        evaluate,
      },
    };
  }, [
    context,
    ability,
    onboardingCompleted,
    schoolType,
    tenant,
  ]);
}
