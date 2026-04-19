import React from 'react';
import { EntityDefinition, EntityMode, EntityInstance } from '@repo/core';
import SanctuaryModal from './SanctuaryModal';
import { Box, Text, VStack } from '../gluestack';
import EntityView from './EntityView';

export interface EntityModalProps {
    isOpen: boolean;
    onClose: () => void;
    definition: EntityDefinition;
    mode: EntityMode;
    instance?: EntityInstance;
    title?: string;
    onSuccess?: (data: any) => void;
}

/**
 * EntityModal
 * 
 * A generalized modal for viewing or editing entities.
 * Hardened v3 implementation.
 */
export default function EntityModal({
    isOpen,
    onClose,
    definition,
    mode,
    instance,
    title,
    onSuccess,
}: EntityModalProps) {
    const displayTitle = title || `${mode.charAt(0).toUpperCase() + mode.slice(1)} ${definition.type}`;

    const renderContent = () => {
        // If a specialized component exists for this mode (e.g., a multi-step flow for school creation), use it.
        const components = definition.components as any;
        const specializedComponent = components?.[mode];

        if (specializedComponent) {
            return (
                <EntityView 
                    definition={definition} 
                    instance={instance} 
                    mode={mode} 
                    onAction={(action: string, payload: any) => {
                        if (action === 'complete' || action === 'close') onClose();
                        if (action === 'success' || action === 'complete') onSuccess?.(payload);
                    }}
                />
            );
        }

        // Fallback to standard views/forms
        if (mode === 'create' || mode === 'edit') {
            return (
                <VStack className="gap-4">
                    <Text className="text-phase-text-primary font-bold">
                        {mode === 'create' ? 'Creating' : 'Editing'} {definition.type}
                    </Text>
                    {/* Default FormManager-powered form or generic FormBuilder */}
                    <Box className="bg-phase-surface p-5 rounded-comfortable">
                        <Text className="text-phase-text-secondary">Standard Form for {definition.type}</Text>
                    </Box>
                </VStack>
            );
        }

        return (
            <EntityView 
                definition={definition} 
                instance={instance} 
                mode={mode} 
            />
        );
    };

    return (
        <SanctuaryModal
            isOpen={isOpen}
            onClose={onClose}
            title={displayTitle}
        >
            <Box className="p-4">
                {renderContent()}
            </Box>
        </SanctuaryModal>
    );
}
