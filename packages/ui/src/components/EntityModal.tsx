
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
}

export default function EntityModal({
    isOpen,
    onClose,
    definition,
    mode,
    instance,
    title,
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
                    onAction={(action: string) => {
                        if (action === 'complete' || action === 'close') onClose();
                    }}
                />
            );
        }

        // Fallback to standard views/forms
        if (mode === 'create' || mode === 'edit') {
            return (
                <VStack space="md">
                    <Text>{mode === 'create' ? 'Creating' : 'Editing'} {definition.type}</Text>
                    {/* Default FormManager-powered form or generic FormBuilder */}
                    <Box bg="$backgroundLight100" p={20} rounded="$md">
                        <Text color="$textLight500">Standard Form for {definition.type}</Text>
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
            <Box p={16}>
                {renderContent()}
            </Box>
        </SanctuaryModal>
    );
}
