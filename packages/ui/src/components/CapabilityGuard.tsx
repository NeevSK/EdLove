import { usePermissions } from '@repo/core/logic';
import type { Actions, Subjects } from '@repo/core/logic/permissions/abilities/base';
import type { ReactNode } from 'react';
import CitizenGate, { type CitizenGateProps } from './CitizenGate';

interface CapabilityGuardProps {
  children: ReactNode;
  action: Actions;
  subject: Subjects;
  fallback?: ReactNode;
  /**
   * If provided, will render a CitizenGate with these props as fallback
   */
  gateProps?: Omit<CitizenGateProps, 'onAction'> & { onAction?: () => void };
}

/**
 * CapabilityGuard Component
 * Standardized POA guard that renders children only if the user has the required capability.
 */
export function CapabilityGuard({
  children,
  action,
  subject,
  fallback,
  gateProps,
}: CapabilityGuardProps) {
  const { can } = usePermissions();
  const hasCapability = can(action, subject);

  if (hasCapability) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (gateProps) {
    return <CitizenGate {...gateProps} onAction={gateProps.onAction || (() => {})} />;
  }

  return null;
}
