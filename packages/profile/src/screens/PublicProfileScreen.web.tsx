import React from 'react';
import { useRoute } from '@react-navigation/native';

import { useEntity, type EntityType } from '@repo/core';
import { Box, Center, EntityView, Spinner } from '@repo/ui';

export default function PublicProfileScreenWeb() {
    const route = useRoute<any>();
    const { id, type } = route.params || {};

    const { instance, isLoading, error } = useEntity(type as EntityType, id);

    if (isLoading) {
        return (
            <Center sx={{ height: '100vh' }}>
                <Spinner size="large" />
            </Center>
        );
    }

    if (error || !instance) {
        return (
            <Box sx={{ padding: '40px', textAlign: 'center', color: 'var(--ink-ghost)' }}>
                Profile Not Found or Error Loading
            </Box>
        );
    }

    return (
        <Box sx={{ maxWidth: 1200, margin: '0 auto', padding: '$6' }}>
            <EntityView definition={instance.definition} instance={instance} mode="view" />
        </Box>
    );
}
