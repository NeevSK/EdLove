import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore, FeatureGuard } from '@repo/core';
import { SandboxBanner, WebScreenHeader, TemporalNavigator } from '@repo/ui';
import { CreateClassroomModal } from '../components';

// Sub-components
import {
    TeacherStats,
    TeacherClassroomList,
    TeacherAssignmentsSidebar,
    TeacherAdminActions,
    TeacherSnapshot
} from '../components/teacher';

import { 
    TeacherCreateClassroomAction, 
    TeacherScanQRAction, 
    TeacherPrincipalEchoAction, 
    TeacherMyEchoesAction 
} from '../components/poa';

export default function TeacherDashboardWeb({ forceDemo }: { forceDemo?: boolean } = {}) {
    const { t } = useTranslation();
    const { user } = useStore();
    const isDemo = forceDemo === true;
    const [showCreateClassroom, setShowCreateClassroom] = useState(false);

    // Mock data for initial POA bridge - will be connected to real hooks next
    const stats = {
        totalStudents: 42,
        averageAttendance: 94,
        pendingAssignments: 5,
        activeClassrooms: 3
    };

    const dummyClassrooms = [
        { id: '1', name: 'Grade 10 - Mathematics', subject: 'Maths', studentCount: 30, nextSession: '10:30 AM' },
        { id: '2', name: 'Grade 11 - Science', subject: 'Biology', studentCount: 28, nextSession: 'Tomorrow' }
    ];

    const dummySnapshot = [
        { time: '08:00', activity: 'Morning Assembly', location: 'Main Hall' },
        { time: '10:30', activity: 'Mathematics P1', location: 'Room 4B' }
    ];

    const dummyAssignments = [
        { id: '1', title: 'Calculus Basics', dueDate: new Date().toISOString(), submittedCount: 15, totalCount: 30 }
    ];

    const adminActions = [
        { id: 'att', label: 'Attendance', icon: 'UserCheck', onClick: () => {} },
        { id: 'ana', label: 'Analysis', icon: 'BarChart', onClick: () => {} }
    ];

    return (
        <>
            {isDemo && <SandboxBanner />}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', paddingBottom: '40px' }}>
                
                {/* 1. Header & Primary Actions */}
                <WebScreenHeader
                    title={<>Registry & <span style={{ color: 'var(--sanctuary-saffron)' }}>Resonance</span>.</>}
                    note={isDemo ? 'Demo view — Sanduni Perera · Gurudevi Life School' : `Welcome back, ${user?.full_name?.split(' ')[0] ?? 'Teacher'}`}
                    timeText="Classroom Management"
                    actions={(
                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                            <TeacherCreateClassroomAction onCreateClassroom={() => setShowCreateClassroom(true)} />
                            <TeacherScanQRAction />
                            <TeacherPrincipalEchoAction />
                            <TeacherMyEchoesAction />
                        </div>
                    )}
                />

                {/* 2. Temporal Context */}
                <div style={{ maxWidth: '400px' }}>
                    <TemporalNavigator />
                </div>

                {/* 3. Global Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                    <TeacherStats stats={stats} />
                </div>

                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1fr 320px', 
                    gap: '32px',
                    alignItems: 'start'
                }}>
                    {/* 4. Left Column: Classrooms Registry */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <TeacherClassroomList classrooms={dummyClassrooms} onClassroomPress={() => {}} />
                    </div>

                    {/* 5. Right Column: Sidebars & Snapshots */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <TeacherSnapshot items={dummySnapshot} />
                        <TeacherAssignmentsSidebar assignments={dummyAssignments} onAssignmentPress={() => {}} />
                        
                        {/* Granular Admin Actions */}
                        <TeacherAdminActions actions={adminActions} />
                    </div>
                </div>
            </div>

            <CreateClassroomModal
                isOpen={showCreateClassroom}
                onClose={() => setShowCreateClassroom(false)}
                onSuccess={() => setShowCreateClassroom(false)}
            />
        </>
    );
}
