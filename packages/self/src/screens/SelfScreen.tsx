import React from 'react';
import { useTracking, Intent } from '@repo/core';

/**
 * SelfScreen — declarative entry point for the user's sanctuary.
 * Resolves to the correct Vow (Student/Teacher/etc.) via ProtocolRegistry.
 */
export default function SelfScreen() {
    const { discoverFeature } = useTracking();

    React.useEffect(() => {
        discoverFeature('section_self');
    }, []);

    return (
        <Intent intent="identity.self.view" />
    );
}
