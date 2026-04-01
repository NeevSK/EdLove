import React, { useState } from 'react';
import { Pressable, Icon, InfoIcon } from '../gluestack';
import FeatureDiscoveryModal from './FeatureDiscoveryModal';
import { Theme } from '../theme/Theme';

export interface FeatureInfoIconProps {
    title: string;
    discoveryInfo?: {
        whatIsIt: string;
        whereToFind: string;
    };
    color?: string;
}

/**
 * FeatureInfoIcon - A subtle info icon that triggers the discovery modal.
 * Uses a soft ripple effect and identity-aware coloring.
 */
export default function FeatureInfoIcon({
    title,
    discoveryInfo,
    color = 'var(--ink-ghost)',
}: FeatureInfoIconProps) {
    const [isOpen, setIsOpen] = useState(false);

    if (!discoveryInfo) return null;

    return (
        <>
            <Pressable 
                accessibilityRole="button"
                onPress={() => setIsOpen(true)}
                sx={{
                    padding: 4,
                    borderRadius: Theme.corners.full,
                    ':hover': {
                        backgroundColor: 'rgba(0,0,0,0.05)',
                    },
                    ':active': {
                        transform: [{ scale: 0.92 }],
                    }
                }}
            >
                <Icon as={InfoIcon} color={color} size="sm" />
            </Pressable>
            <FeatureDiscoveryModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                title={title}
                whatIsIt={discoveryInfo.whatIsIt}
                whereToFind={discoveryInfo.whereToFind}
            />
        </>
    );
}
