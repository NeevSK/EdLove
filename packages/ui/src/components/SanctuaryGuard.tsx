import { useSanctuaryFeature } from '@repo/core/logic/permissions/hooks/useSanctuaryFeature';
import type { FeatureRequirement } from '@repo/core/logic/permissions/sanctuaryFeature';
import { CITIZENSHIP } from '@repo/core/logic/permissions/sanctuaryFeature';
import React from 'react';
import { SchoolJoinPrompt } from '@repo/ui/components/prompts/SchoolJoinPrompt';
import { SignupPrompt } from '@repo/ui/components/prompts/SignupPrompt';
import { UpgradePrompt } from '@repo/ui/components/prompts/UpgradePrompt';

interface SanctuaryGuardProps {
  action: string;
  subject: string;
  requirement: FeatureRequirement;
  resource?: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function SanctuaryGuard({
  action,
  subject,
  requirement,
  resource,
  children,
  fallback,
}: SanctuaryGuardProps) {
  const result = useSanctuaryFeature(action, subject, requirement, resource);

  if (result.permitted) {
    return <>{children}</>;
  }

  if (fallback !== undefined) {
    return <>{fallback}</>;
  }

  switch (result.reason) {
    case 'not_initialized':
      return null; // Render loading indicator or null

    case 'citizenship':
      if (result.current === CITIZENSHIP.THIRD_CLASS) {
        return <SignupPrompt requiredLevel={result.required} />;
      }
      return <SchoolJoinPrompt />;

    case 'entitlement':
      return <UpgradePrompt requiredTier={result.required} currentTier={result.current} />;

    case 'authz':
    case 'platform':
    case 'feature':
    default:
      return null; // Wrong role or operational flag (disabled) -> invisible to user
  }
}
