import React from 'react';
import { EntityDefinition, EntityInstance, EntityMode } from '@repo/core';
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
    <VStack space="xs"        <Text size="sm" bold>Details</Text        >{Object.entries(instance || {}).map(([key, value]) => (
            key !== 'id' && key !== 'definition' && typeof value !== 'object' && (
                <HStack key={key} justifyContent="space-between"                    <Text size="xs" color="$textLight600">{key}:</Text                    ><Text size="xs">{String(value)}</Text                ></HStack            )
        ))}
    </VStack);

export default function EntityView({
    definition,
    instance,
    mode,
    renderView
}: EntityViewProps) {
    return (
        <VStack space="md" p={mode === 'compact' ? 0 : 16}            <Text bold size="lg">{definition.type.toUpperCase()} {mode.toUpperCase()} VIEW</Text            
            >{instance ? (
                <VStack space="sm"                    <Text>ID: {instance.id}</Text                    >{mode === 'public' && <Text color="$textLight500">Public Profile View</Text>}
                    {mode === 'view' && (
                        renderView ? renderView(instance) : <DefaultEntityDetails instance={instance} /                    >)}
                </VStack            ) : (
                <SkeletonTextLine /            >)}>
        </VStack    );
}
