import { useTracking } from '@repo/core/hooks';
import { usePermissions } from '@repo/core/logic';
import { useFeatureStore } from '@repo/core/store/useFeatureStore';

import { useEffect } from 'react';
import {
  AdminSelfView,
  FounderSelfView,
  GuardianSelfView,
  PrincipalSelfView,
  StudentSelfView,
  TeacherSelfView,
} from '@repo/self/screens/self';
import { resolveSelfViewRole } from '@repo/self/screens/self/roleResolution';
import SelfScreenUnified from '@repo/self/screens/SelfScreen.unified';

/**
 * SelfScreen  declarative entry point for the user's sanctuary.
 * Capability-driven (POA) instead of registry-intent based.
 * Unified canvas behind flag `canvas.self.unified` — enables multi-role + user prioritization.
 * Fallback preserves existing role views until rollout completes.
 */
export default function SelfScreen() {
  const { discoverFeature } = useTracking();
  const { can, context } = usePermissions();
  const flags = useFeatureStore((s) => s.flags as unknown as Record<string, unknown>);
  const unifiedEnabled = flags['canvas.self.unified'] === true;

  useEffect(() => {
    void discoverFeature('section_self');
  }, [discoverFeature]);

  if (unifiedEnabled) {
    return <SelfScreenUnified />;
  }

  const role = resolveSelfViewRole(context.capacity, can);

  switch (role) {
    case 'admin':
      return <AdminSelfView />;
    case 'founder':
      return <FounderSelfView />;
    case 'principal':
      return <PrincipalSelfView />;
    case 'teacher':
      return <TeacherSelfView />;
    case 'guardian':
      return <GuardianSelfView />;
    case 'student':
      return <StudentSelfView />;
    default:
      return <StudentSelfView />;
  }
}
