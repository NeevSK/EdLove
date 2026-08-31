import { useTracking } from '@repo/core/hooks';
import { usePermissions } from '@repo/core/logic';
import { useFeatureStore } from '@repo/core/store/useFeatureStore';
import { useResponsiveRenderer } from '@repo/core/platform/useResponsiveRenderer';
import ErrorBoundary from '@repo/ui/components/ErrorBoundary';
import { WorkspaceRenderer } from '@repo/ui/components/workspace/WorkspaceRenderer';
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
 * Web entry — platform-aware responsive wrapper.
 * Behind flag `canvas.self.unified` renders unified canvas; else legacy role views.
 */
export default function SelfScreenWeb() {
  return (
    <ErrorBoundary name="SelfScreenWeb">
      <SelfScreenWebContent />
    </ErrorBoundary>
  );
}

function SelfScreenWebContent() {
  const { discoverFeature } = useTracking();
  const { can, context } = usePermissions();
  const flags = useFeatureStore((s) => s.flags as unknown as Record<string, unknown>);
  const unifiedEnabled = flags['canvas.self.unified'] === true;
  const { platform, isNative, isResizing } = useResponsiveRenderer();

  useEffect(() => {
    void discoverFeature('section_self');
  }, [discoverFeature]);

  const renderContent = () => {
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
  };

  return (
    <WorkspaceRenderer platform={platform} isNative={isNative} isResizing={isResizing}>
      <div className="sanctuary-screen">
        <div className="sanctuary-container">{renderContent()}</div>
      </div>
    </WorkspaceRenderer>
  );
}
