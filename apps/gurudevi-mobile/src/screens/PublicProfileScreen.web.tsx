import React from 'react';
import { useRoute } from '@react-navigation/native';
import ProfileScreenWeb from './ProfileScreen.web';
import SchoolProfileScreenWeb from './SchoolProfileScreen.web';
import ClassroomProfileScreenWeb from './ClassroomProfileScreen.web';
import CommunityProfileScreenWeb from './CommunityProfileScreen.web';

export default function PublicProfileScreenWeb() {
    const route = useRoute<any>();
    const { id, type } = route.params || {};

    if (type === 'user') {
        return <ProfileScreenWeb userId={id} isPublic={true} />;
    }

    if (type === 'school') {
        return <SchoolProfileScreenWeb schoolId={id} />;
    }

    if (type === 'classroom') {
        return <ClassroomProfileScreenWeb classroomId={id} />;
    }

    if (type === 'community') {
        return <CommunityProfileScreenWeb communityId={id} />;
    }

    return (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--ink-ghost)' }}>
            Profile Not Found
        </div>
    );
}
