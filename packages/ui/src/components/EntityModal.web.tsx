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

/**
 * EntityModal.web
 * 
 * Web-optimized entity modal.
 * Hardened v3 implementation.
 */
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
            <VStack className="gap-4">
                {mode === 'view' ? (
                    <Box>
                        <Text className="text-phase-text-primary">Web View for {definition.type}</Text>
                        {/* Web-optimized view component */}
                    </Box>
                ) : (
                    <Box>
                        <Text className="text-phase-text-primary">Web Form for {definition.type}</Text>
                        {/* Web-optimized form component */}
                    </Box>
                )}
            </VStack>
        </SanctuaryModal>
    );
}
