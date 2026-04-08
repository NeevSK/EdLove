import React from 'react';
import { VStack } from '../gluestack';
import PositiveInvitation from './PositiveInvitation';
import SanctuaryButton from './SanctuaryButton';

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
  const mappedContext =
    context === 'profile' || context === 'general' ? 'self' : (context as any);

  return (
    <VStack className="gap-4 w-full items-center">
      <PositiveInvitation
        title={title}
        description={description}
        type="guest"
        context={mappedContext}
        actionLabel={actionLabel}
        onAction={onAction}
      />
      {secondaryLabel && onSecondary && (
        <SanctuaryButton
          variant="outline"
          action="secondary"
          onPress={onSecondary}
          className="px-8"
        >
          {secondaryLabel}
        </SanctuaryButton>
      )}
    </VStack>
  );
}
