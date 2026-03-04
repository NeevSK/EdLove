import React from 'react';
import { useUserRole } from '@repo/core';
import { LotusPetalFAB } from '@repo/ui';

// High-Fidelity Role Sub-Views
import StudentSelfView from './self/views/StudentSelfView.web';
import TeacherSelfView from './self/views/TeacherSelfView.web';
import PrincipalSelfView from './self/views/PrincipalSelfView.web';
import FounderSelfView from './self/views/FounderSelfView.web';

export default function SelfScreenWeb() {
    const { role } = useUserRole();

    const renderRoleView = () => {
        switch (role) {
            case 'student':
                return <StudentSelfView />;
            case 'teacher':
                return <TeacherSelfView />;
            case 'principal':
                return <PrincipalSelfView />;
            case 'founder':
            case 'admin':
            case 'developer':
                return <FounderSelfView />;
            default:
                // Fallback to Student view as it's the most common/safe default
                return <StudentSelfView />;
        }
    };

    return (
        <div className="sanctuary-screen" style={{ padding: '0 40px 40px' }}>
            {renderRoleView()}
            <LotusPetalFAB />
        </div>
    );
}
