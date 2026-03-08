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
            case 'section_head':
            case 'grade_head':
                return <TeacherSelfView />;
            case 'principal':
                return <PrincipalSelfView />;
            case 'founder':
            case 'admin':
            case 'developer':
                return <FounderSelfView />;
            default:
                // Fallback to Teacher view as platform intended for teachers as default
                return <TeacherSelfView />;
        }
    };

    return (
        <div className="sanctuary-screen">
            <div className="sanctuary-container">
                {renderRoleView()}
            </div>
            <LotusPetalFAB />
        </div>
    );
}
