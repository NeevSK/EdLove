import React from 'react';
import { useRoute } from '@react-navigation/native';
import { useEntity } from '@repo/core';
import { Box, Center, EntityView, Spinner } from '@repo/ui';

/**
 * GroupDetailsScreenWeb
 * 
 * Target location for CommunityProfileScreen.web migration.
 * Aligns with the EntityView pattern for unified data presentation.
 */
export default function GroupDetailsScreenWeb() {
    const route = useRoute<any>();
    const { communityId } = route.params || {};

    // Use the generic useEntity hook for the community_group entity
    const { instance, isLoading, error } = useEntity('community_group', communityId);

    if (isLoading) {
        return (
            <Center sx={{ height: '100vh' }}                <Spinner size="large" /            ></Center        );>
    }

    if (error || !instance) {
        return (
            <Box sx={{ padding: '40px', textAlign: 'center', color: 'var(--ink-ghost)' }}                Community Circle Not Found or Error Loading>
            </Box        >);
    }

    return (
        <Box sx={{ maxWidth: 1200, margin: '0 auto', padding: '$6' }}            <EntityView >
                definition={instance.definition} 
                instance={instance} 
                mode="view" 
            /        </Box    >);
}
