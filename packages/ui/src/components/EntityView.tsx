import React from 'react';
import { EntityDefinition, EntityInstance, EntityMode } from '@repo/core';
import { VStack, Text } from '../gluestack';
import IdentityCard from './IdentityCard';
import { SkeletonTextLine } from './SkeletonLoader';

export interface EntityViewProps {
    definition: EntityDefinition;
    instance?: EntityInstance;
    mode: EntityMode;
    onAction?: (action: string, payload?: unknown) => void;
}

export default function EntityView({
    definition,
    instance,
    mode
}: EntityViewProps) {
    // Fallback logic for when specific components aren't provided
    // For 'public' mode, if no 'public' component exists, we fallback to 'view'
    // but with restricted permissions/data in the future.
    
    return (
        <VStack space="md" p={mode === 'compact' ? 0 : 16}>
            <Text bold size="lg">{definition.type.toUpperCase()} {mode.toUpperCase()} VIEW</Text>
            
            {/* 
                In a real implementation, we would have a component registry here.
                registry.get(componentName) 
            */}
            
            {instance ? (
                <VStack space="sm">
                    <Text>ID: {instance.id}</Text>
                    {mode === 'public' && <Text color="$textLight500">Public Profile View</Text>}
                    {mode === 'view' && <IdentityCard data={instance as any} />}
                </VStack>
            ) : (
                <SkeletonTextLine />
            )}
        </VStack>
    );
}
