import { useMemo } from 'react';
import { useAccessState } from './useAccessState';
import { useStore } from '../store/useStore';
import type { UserRole } from '../types';

export interface Capabilities {
  identity: {
    isAnonymous: boolean;
    isRegistered: boolean;
    needsOnboarding: boolean;
    role: UserRole | null;
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
}

export function useCapabilities(): Capabilities {
  const access = useAccessState();
  const schoolType = useStore((s) => s.schoolType);

  return useMemo(() => {
    const role = access.role;
    const isAnonymous = access.isAnonymous;
    const isRegistered = access.isRegistered;
    const needsOnboarding = access.stage === 'needs_onboarding';

    const hasSession = access.sessionResolved && !!access.session?.user;
    const hasSchoolId = !!access.schoolId && !access.isDemoSchool;
    const isPersonalWorkspace = schoolType === 'personal_workspace';

    const isTeacherLike =
      role === 'teacher' || role === 'grade_head' || role === 'section_head';
    const isPrincipalLike =
      role === 'principal' || role === 'founder' || role === 'admin' || role === 'developer';

    // Community policy (current code requires a school_id to post; groups/join require upgrade).
    const canDiscoverGroups = hasSession && !needsOnboarding;
    const canJoinGroup = isRegistered && !needsOnboarding;
    const canCreateGroup = isRegistered && !needsOnboarding;
    const canPost = isRegistered && !needsOnboarding && hasSchoolId;
    const canDM = isRegistered && !needsOnboarding;

    // Feed is intentionally empty until you have groups. We still treat "view feed"
    // as allowed once registered; UI can decide to show empty-state when no groups joined.
    const canViewFeed = isRegistered && !needsOnboarding;

    // Library policy: browsing is open post-onboarding; uploads require upgrade.
    const canBrowsePublic = hasSession && !needsOnboarding;
    const canViewVerified = hasSession && !needsOnboarding;
    const canUpload = isRegistered && !needsOnboarding;

    // Classroom policy:
    // - Demo always available.
    // - Teachers can use personal_workspace as a valid context for classroom creation/use.
    // - Principals must affiliate with a non-personal school for school-level features.
    const canViewDemo = hasSession;
    const canUsePersonalWorkspaceClassroom = isRegistered && !needsOnboarding && isTeacherLike && isPersonalWorkspace;
    const canUsePrincipalSchoolManagement =
      isRegistered && !needsOnboarding && isPrincipalLike && hasSchoolId && !isPersonalWorkspace;

    // Self policy: local-only always; cloud sync only once upgraded.
    const canUseLocal = hasSession;
    const canSyncCloud = isRegistered && !needsOnboarding;

    return {
      identity: { isAnonymous, isRegistered, needsOnboarding, role },
      community: {
        canDiscoverGroups,
        canViewFeed,
        canJoinGroup,
        canCreateGroup,
        canPost,
        canDM,
      },
      library: { canBrowsePublic, canViewVerified, canUpload },
      classroom: {
        canViewDemo,
        canUsePersonalWorkspaceClassroom,
        canUsePrincipalSchoolManagement,
      },
      self: { canUseLocal, canSyncCloud },
    };
  }, [
    access.isAnonymous,
    access.isDemoSchool,
    access.isRegistered,
    access.role,
    access.schoolId,
    access.session,
    access.sessionResolved,
    access.stage,
    schoolType,
  ]);
}

