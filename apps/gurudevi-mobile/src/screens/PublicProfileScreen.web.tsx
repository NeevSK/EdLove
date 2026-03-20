import React from 'react';
import { useRoute } from '@react-navigation/native';
import { useEntity, EntityType } from '@repo/core';
import { EntityView } from '@repo/ui';
import { Box, Center, Spinner } from '@repo/ui';

export default function PublicProfileScreenWeb() {
    const route = useRoute<any>();
    const { id, type } = route.params || {};
    
    const { entity, loading, error } = useEntity(type as EntityType, id);

    if (loading) {
        return (
            <Center sx={{ height: '100vh' }}>
                <Spinner size="large" />
            </Center>
        );
    }

    if (error || !entity) {
        return (
            <Box sx={{ padding: '40px', textAlign: 'center', color: 'var(--ink-ghost)' }}>
                Profile Not Found or Error Loading
            </Box>
        );
    }

    return (
        <Box sx={{ maxWidth: 1200, margin: '0 auto', padding: '$6' }}>
            <EntityView 
                definition={entity.definition}
                instance={entity}
                mode="view"
            />
        </Box>
    );
}
