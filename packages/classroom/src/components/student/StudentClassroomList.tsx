import React from 'react';
import { BookOpen } from 'lucide-react-native';
import { SkeletonCard, PositiveInvitation } from '@repo/ui';
import { useNavigation } from '@react-navigation/native';

export const StudentClassroomList = ({ classrooms, loading, isDemo }: { classrooms: any[], loading: boolean, isDemo: boolean }) => {
    const navigation = useNavigation<any>();
    
    if (loading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[1, 2].map(i => <SkeletonCard key={i} />)}
            </div>
        );
    }

    if (classrooms.length === 0) {
        return (
            <div style={{ padding: '40px 0', textAlign: 'center' }}>
                <PositiveInvitation
                    type="empty"
                    title={isDemo ? "Join Your First Sanctuary" : "No Classrooms found"}
                    description={isDemo
                        ? "Welcome to the student sanctuary. Ready to officially join your classes and begin your quest? Connect with your teachers to get started."
                        : "You haven't joined any classrooms yet. Reach out to your teacher for an invite code or search for a sanctuary."
                    }
                    actionLabel="Join a Classroom"
                    onAction={() => navigation.navigate('Main', { screen: 'Community' })}
                />
            </div>
        );
    }

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(240px, 100%), 1fr))', gap: '24px' }}>
            {classrooms.map(cls => (
                <div
                    key={cls.id}
                    className="sanctuary-card interactive"
                    style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column', cursor: 'pointer' }}
                    onClick={() => navigation.navigate('StudentClassroomDashboard', { classroomId: cls.id, classroomName: cls.name })}
                >
                    <div style={{ height: '80px', background: cls.color_theme ?? 'var(--background-alt)', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', opacity: 0.9 }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                            <BookOpen size={20} color="var(--water)" />
                        </div>
                        <span style={{ padding: '4px 8px', background: 'rgba(255,255,255,0.9)', borderRadius: '6px', fontSize: '10px', fontWeight: '800', color: 'var(--ink-ghost)' }}>Active</span>
                    </div>
                    <div style={{ padding: '24px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: '800', margin: '0 0 4px' }}>{cls.name}</h3>
                        {cls.subject && (
                            <p style={{ fontSize: '12px', color: 'var(--ink-ghost)', margin: '0 0 12px' }}>{cls.subject}</p>
                        )}
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <span style={{ padding: '4px 8px', background: 'var(--background-alt)', borderRadius: '6px', fontSize: '11px', fontWeight: '700', color: 'var(--ink-ghost)' }}>
                                📖 Lessons
                            </span>
                            <span style={{ padding: '4px 8px', background: 'var(--background-alt)', borderRadius: '6px', fontSize: '11px', fontWeight: '700', color: 'var(--ink-ghost)' }}>
                                📋 Assignments
                            </span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};
