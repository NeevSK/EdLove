
import React from 'react';
import { EntityDefinition, EntityMode, EntityInstance } from '@repo/core';
import SanctuaryModal from './SanctuaryModal.web';
import { Box, Text, VStack } from '../gluestack';

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

    return (
        <SanctuaryModal
            isOpen={isOpen}
            onClose={onClose}
            title={displayTitle}
            size="md"
        >
            <VStack space="md">
                {mode === 'view' ? (
                    <Box>
                        <Text>Web View for {definition.type}</Text>
                        {/* Web-optimized view component */}
                    </Box>
                ) : (
                    <Box>
                        <Text>Web Form for {definition.type}</Text>
                        {/* Web-optimized form component */}
                    </Box>
                )}
            </VStack>
        </SanctuaryModal>
    );
}
