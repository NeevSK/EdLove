import React from 'react';
import { useUserRole, useStore } from '@repo/core';
import { WebScreenHeader } from '@repo/ui';
import { useTranslation } from 'react-i18next';

// High-Fidelity Role Sub-Views
import StudentSelfView from './self/views/StudentSelfView.web';
import TeacherSelfView from './self/views/TeacherSelfView.web';
import PrincipalSelfView from './self/views/PrincipalSelfView.web';
import FounderSelfView from './self/views/FounderSelfView.web';

export default function SelfScreenWeb() {
    const { t } = useTranslation();
    const { role } = useUserRole();
    const { user } = useStore();

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

    const getHeaderDetails = () => {
        return {
            title: role === 'student' ? 'Mastery Hub' : 'Sadhana',
            note: role === 'principal' ? "Principal's Inner Sanctuary" : 
                  role === 'founder' ? "Founder's Vision Lab" : 
                  "Personal Growth Stream"
        };
    };

    const header = getHeaderDetails();

    return (
        <div className="sanctuary-screen">
            <div className="sanctuary-container">
                <WebScreenHeader 
                    title={header.title}
                    note={header.note}
                    showPersonalizedGreeting={true}
                />
                <div style={{ marginTop: 24 }}>
                    {renderRoleView()}
                </div>
            </div>
        </div>
    );
}
