import React from 'react';
import { VStack, Button, ButtonText } from '../gluestack';
import { Theme } from '../theme/Theme';
import PositiveInvitation from './PositiveInvitation';
import { useThemedColors } from '../hooks/useThemedColors';

export interface CitizenGateProps {
  context?: 'self' | 'library' | 'classroom' | 'community' | 'profile' | 'general';
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
}

export default function CitizenGate({
  context = 'general',
  title,
  description,
  actionLabel,
  onAction,
  secondaryLabel,
  onSecondary,
}: CitizenGateProps) {
  const colors = useThemedColors();

  const mappedContext =
    context === 'profile' || context === 'general' ? 'self' : (context as any);

  return (
    <VStack space="md" width="100%" alignItems="center"
      <PositiveInvitation
        title={title}
        description={description}
        type="guest"
        context={mappedContext}
        actionLabel={actionLabel}
        onAction={onAction}
      /
      {secondaryLabel && onSecondary && (
        <Button
          variant="outline"
          action="secondary"
          onPress={onSecondary}
          sx={{
            borderColor: colors.border,
            borderRadius: Theme.corners.full,
            paddingHorizontal: Theme.spacing.lg,
          }}
        
          <ButtonText color={colors.textSecondary}>{secondaryLabel}</ButtonText
        </Button
      )}
    </VStack
  );
}

