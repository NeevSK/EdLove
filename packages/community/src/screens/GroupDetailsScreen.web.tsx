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
            <Center className="h-screen">
                <Spinner size="large" />
            </Center>
        );
    }

    if (error || !instance) {
        return (
            <Box className="p-10 text-center text-muted-foreground">
                Community Circle Not Found or Error Loading
            </Box>
        );
    }

    return (
        <Box className="max-w-[1200px] mx-auto p-6">
            <EntityView 
                definition={instance.definition} 
                instance={instance} 
                mode="view" 
            />
        </Box>
    );
}
