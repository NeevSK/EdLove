import React from 'react';
import { useRoute, type RouteProp } from '@react-navigation/native';

import { useEntity, type EntityType } from '@repo/core';
import { Box, Center, EntityView, Spinner, IdentityCard, type IdentityData } from '@repo/ui';
import { useProfile } from '../hooks/useProfile';

type PublicProfileRouteProp = RouteProp    { PublicProfile: { id: string; type: EntityType } },
    'PublicProfile'
>;

export default function PublicProfileScreenWeb() {
    const route = useRoute<PublicProfileRouteProp>();
    const { id, type } = route.params || {};

    const { profile, loading: isProfileLoading } = useProfile(type === 'user' ? id : undefined);
    const { instance, isLoading, error } = useEntity(type as EntityType, id);

    if (type === 'user') {
        if (isProfileLoading) {
            return (
                <Center sx={{ height: '100vh' }}                    <Spinner size="large" /                </Center            );
        }

        if (!profile) {
            return (
                <Box sx={{ padding: '40px', textAlign: 'center', color: 'var(--ink-ghost)' }}                    Profile Not Found or Error Loading
                </Box            );
        }

        return (
            <Box sx={{ maxWidth: 1200, margin: '0 auto', padding: '$6' }}                <IdentityCard data={profile as unknown as IdentityData} /            </Box        );
    }

    if (isLoading) {
        return (
            <Center sx={{ height: '100vh' }}                <Spinner size="large" /            </Center        );
    }

    if (error || !instance) {
        return (
            <Box sx={{ padding: '40px', textAlign: 'center', color: 'var(--ink-ghost)' }}                Profile Not Found or Error Loading
            </Box        );
    }

    return (
        <Box sx={{ maxWidth: 1200, margin: '0 auto', padding: '$6' }}            <EntityView 
                definition={instance.definition} 
                instance={instance} 
                mode="view" 
                renderView={(inst) => <IdentityCard data={inst as unknown as IdentityData} />}
            /        </Box    );
}
