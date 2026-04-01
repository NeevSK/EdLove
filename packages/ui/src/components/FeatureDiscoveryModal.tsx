import React from 'react';
import { VStack, Text, Heading, InfoIcon, Icon, Box } from '../gluestack';
import SanctuaryModal from './SanctuaryModal';
import { Theme } from '../theme/Theme';

export interface FeatureDiscoveryModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    whatIsIt: string;
    whereToFind: string;
}

/**
 * FeatureDiscoveryModal - A premium modal explaining a feature to the user.
 * Follows the "Sanctuary" aesthetic with glassmorphic layers.
 */
export default function FeatureDiscoveryModal({
    isOpen,
    onClose,
    title,
    whatIsIt,
    whereToFind,
}: FeatureDiscoveryModalProps) {
    return (
        <SanctuaryModal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            subtitle="Feature Discovery"
            icon={<Icon as={InfoIcon} color="var(--water)" size="xl" />}
        >
            <VStack space="xl" sx={{ py: 8 }}>
                <Box>
                    <Heading 
                        size="xs" 
                        sx={{ textTransform: 'uppercase', letterSpacing: 1.5, color: 'var(--ink-ghost)', mb: 8 }}
                    >
                        What is it?
                    </Heading>
                    <Text size="md" sx={{ lineHeight: '$md', color: 'var(--ink)' }}>
                        {whatIsIt}
                    </Text>
                </Box>
                
                <Box 
                    sx={{ 
                        p: 16, 
                        borderRadius: Theme.corners.medium, 
                        backgroundColor: 'rgba(var(--water-rgb), 0.05)', 
                        borderLeftWidth: 4, 
                        borderLeftColor: 'var(--water)' 
                    }}
                >
                    <Heading 
                        size="xs" 
                        sx={{ textTransform: 'uppercase', letterSpacing: 1.5, color: 'var(--water)', mb: 8 }}
                    >
                        Where to find it?
                    </Heading>
                    <Text size="sm" sx={{ color: 'var(--ink-ghost)', fontWeight: '500' }}>
                        {whereToFind}
                    </Text>
                </Box>
            </VStack>
        </SanctuaryModal>
    );
}
