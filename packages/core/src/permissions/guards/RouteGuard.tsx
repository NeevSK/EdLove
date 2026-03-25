import React from 'react';
import { usePermissions } from '../hooks/usePermissions';
import { Actions, Subjects } from '../abilities/student';

interface RouteGuardProps {
  action: Actions;
  subject: Subjects;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const RouteGuard: React.FC<RouteGuardProps> = ({ 
  action, 
  subject, 
  children, 
  fallback = null 
}) => {
  const { can } = usePermissions();

  if (can(action, subject)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};
