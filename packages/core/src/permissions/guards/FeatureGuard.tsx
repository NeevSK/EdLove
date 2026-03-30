import React from 'react';
import { usePermissions } from '../hooks/usePermissions';
import { Actions, Subjects } from '../abilities/base';

interface FeatureGuardProps {
  action: Actions;
  subject: Subjects;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const FeatureGuard: React.FC<FeatureGuardProps> = ({
  action,
  subject,
  children,
  fallback = null,
}) => {
  const { can } = usePermissions();

  if (can(action, subject)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};
