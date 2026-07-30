import React from 'react';
import PositiveInvitation from '@repo/ui/components/PositiveInvitation';
import { LogIn } from '@repo/ui/icons';

interface SignupPromptProps {
  requiredLevel?: number;
  onAction?: () => void;
}

export function SignupPrompt({ requiredLevel, onAction }: SignupPromptProps) {
  return (
    <PositiveInvitation
      title="Create an Account"
      description="Create an account to access this feature and continue your journey."
      type="anonymous"
      icon={LogIn}
      actionLabel="Create Account"
      onAction={onAction ?? (() => {})}
    />
  );
}
