import type React from 'react';
import { useSafeAction } from '@/hooks/useSafeAction';
import { Button, type IButtonProps } from '@/components/ui/button';

export interface ISafeButtonProps extends Omit<IButtonProps, 'onPress'> {
  /**
   * The async action to perform when the button is pressed.
   * Automatically managed for idempotency and loading states.
   */
  onSafePress: (...args: any[]) => Promise<any>;

  /** Optional message to show on success */
  successMessage?: string;

  /** Optional message to show on failure (defaults to error.message) */
  errorMessage?: string;

  /** Callback triggered after successful execution */
  onSuccess?: (result: any) => void;

  /** Callback triggered after failed execution */
  onError?: (error: any) => void;
}

/**
 * SafeButton Component (2026 UX Standard)
 *
 * A drop-in replacement for Button when performing async actions.
 * Ensures the user cannot double-click and provides automatic feedback.
 */
export const SafeButton: React.FC<ISafeButtonProps> = ({
  onSafePress,
  successMessage,
  errorMessage,
  onSuccess,
  onError,
  children,
  isLoading,
  ...props
}) => {
  const { execute, isPending } = useSafeAction(onSafePress, {
    successMessage,
    errorMessage,
    onSuccess,
    onError,
  });

  return (
    <Button
      {...props}
      isLoading={isPending || isLoading}
      onPress={() => {
        void execute();
      }}
    >
      {children}
    </Button>
  );
};
