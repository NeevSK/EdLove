import type React from 'react';
import type { Actions, Subjects } from '../abilities/base';
import type { FeatureFlags } from '../feature-engine';
import { usePermissions } from '../hooks/usePermissions';

interface FeatureGuardProps {
  action?: Actions;
  subject?: Subjects;
  feature?: keyof FeatureFlags;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * FeatureGuard: The declarative gatekeeper for UI elements.
 * Supports both RBAC (action/subject) and Feature Flags (boolean toggles).
 */
export const FeatureGuard: React.FC<FeatureGuardProps> = ({
  action,
  subject,
  feature,
  children,
  fallback = null,
}) => {
  const { can, flags } = usePermissions();

  let isAllowed = true;

  // 1. Check Feature Flag (Kill Switch / Gating)
  if (feature && !flags[feature]) {
    isAllowed = false;
  }

  // 2. Check RBAC (CASL Ability)
  if (isAllowed && action && subject) {
    if (!can(action, subject)) {
      isAllowed = false;
    }
  }

  if (isAllowed) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};
