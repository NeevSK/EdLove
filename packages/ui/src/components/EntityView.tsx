import React from 'react';
import { EntityDefinition, EntityInstance, EntityMode } from '@repo/core/logic';
import { VStack, Text, HStack } from '../gluestack';
import { SkeletonTextLine } from './SkeletonLoader';

export interface EntityViewProps {
  definition: EntityDefinition;
  instance?: EntityInstance;
  mode: EntityMode;
  onAction?: (action: string, payload?: unknown) => void;
  /** Optional custom renderer for the 'view' mode. If not provided, a basic details list is shown. */
  renderView?: (instance: EntityInstance) => React.ReactNode;
}

/**
 * Default fallback for viewing entity details when no specialized component is provided.
 */
const DefaultEntityDetails = ({ instance }: { instance: EntityInstance }) => (
  <VStack className="gap-1">
    <Text className="text-sm font-bold">Details</Text>
    {Object.entries(instance || {}).map(
      ([key, value]) =>
        key !== 'id' &&
        key !== 'definition' &&
        typeof value !== 'object' && (
          <HStack key={key} className="justify-between">
            <Text className="text-xs text-phase-text-secondary">{key}:</Text>
            <Text className="text-xs text-phase-text-primary">{String(value)}</Text>
          </HStack>
        ),
    )}
  </VStack>
);

export default function EntityView({ definition, instance, mode, renderView }: EntityViewProps) {
  return (
    <VStack className={`gap-4 ${mode === 'compact' ? 'p-0' : 'p-4'}`}>
      <Text className="font-bold text-lg text-phase-text-primary">
        {definition.type.toUpperCase()} {mode.toUpperCase()} VIEW
      </Text>

      {instance ? (
        <VStack className="gap-2">
          <Text className="text-phase-text-primary">ID: {instance.id}</Text>
          {mode === 'public' && (
            <Text className="text-phase-text-secondary opacity-70">Public Profile View</Text>
          )}
          {mode === 'view' &&
            (renderView ? renderView(instance) : <DefaultEntityDetails instance={instance} />)}
        </VStack>
      ) : (
        <SkeletonTextLine />
      )}
    </VStack>
  );
}
