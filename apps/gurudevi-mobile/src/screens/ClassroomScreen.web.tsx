import React from 'react';
import { useUserRole, useStore } from '@repo/core';
import { LotusPetalFAB } from '@repo/ui';

// High-Fidelity Role Sub-Views
import StudentDashboard from './classroom/views/StudentDashboard.web';
import TeacherDashboard from './classroom/views/TeacherDashboard.web';
import PrincipalSchoolView from './classroom/views/PrincipalSchoolView.web';
import FounderDashboard from './classroom/views/FounderDashboard.web';

export default function ClassroomScreenWeb() {
    const { role } = useUserRole();
    const { user } = useStore();

    const renderRoleView = () => {
        const schoolId = user?.school_id || 'default-school';
        const userId = user?.id;

        switch (role) {
            case 'student':
                return <StudentDashboard />;
            case 'teacher':
            case 'section_head':
            case 'grade_head':
                return <TeacherDashboard />;
            case 'principal':
                return <PrincipalSchoolView schoolId={schoolId} userId={userId || ''} />;
            case 'founder':
            case 'admin':
            case 'developer':
                return <FounderDashboard />;
            default:
                return <StudentDashboard />;
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
