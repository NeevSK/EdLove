import React from 'react';
import { useTranslation } from 'react-i18next';
import { Users, UserPlus } from 'lucide-react-native';
import type { TeacherCarouselItem, TeacherCarouselItem as TeacherItem } from '@repo/people';
import { PRESENCE_STATUS_COLORS } from '@repo/admin';
import { SkeletonCard, getInitialsFromName } from '@repo/ui';

interface FacultyOverviewProps {
    teachers: TeacherItem[];
    loading: boolean;
    onAddStaff: () => void;
}

export const FacultyOverview: React.FC<FacultyOverviewProps> = ({ teachers, loading, onAddStaff }) => {
    const { t } = useTranslation();

    return (
        <div className="sanctuary-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ background: 'rgba(59,130,246,0.1)', color: 'var(--water)', padding: '10px', borderRadius: '12px' }}>
                        <Users size={20} />
                    </div>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>Faculty Overview</h3>
                        <p style={{ margin: 0, fontSize: '13px', color: 'var(--ink-ghost)' }}>Staff presence and availability</p>
                    </div>
                </div>
                <button 
                    onClick={onAddStaff} 
                    style={{ background: 'none', border: '1px solid var(--border)', borderRadius: '10px', padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600', color: 'var(--ink)' }}
                >
                    <UserPlus size={16} /> Invite
                </button>
            </div>

            {loading ? <SkeletonCard /> : teachers.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', border: '1px dashed var(--border)', borderRadius: '12px' }}>
                    <p style={{ margin: 0, color: 'var(--ink-ghost)', fontSize: '14px' }}>No staff onboarded yet.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '8px', scrollbarWidth: 'none' }}>
                    {teachers.map(teacher => (
                        <div key={teacher.userId} style={{ minWidth: '180px', padding: '20px', borderRadius: '16px', background: 'var(--background-alt)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '12px' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '24px', background: 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: '800', color: 'var(--ink-ghost)', position: 'relative' }}>
                                {getInitialsFromName(teacher.fullName)}
                                <div style={{ position: 'absolute', bottom: 0, right: 0, width: '12px', height: '12px', borderRadius: '6px', background: PRESENCE_STATUS_COLORS[teacher.todayStatus || 'absent'], border: '2px solid var(--background-alt)' }} />
                            </div>
                            <div>
                                <div style={{ fontSize: '14px', fontWeight: '800', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }}>{teacher.fullName}</div>
                                <div style={{ fontSize: '11px', color: 'var(--ink-ghost)', marginTop: '2px' }}>{teacher.role || 'Teacher'}</div>
                            </div>
                            <div style={{ fontSize: '11px', fontWeight: '700', padding: '4px 8px', borderRadius: '8px', background: 'rgba(0,0,0,0.05)', color: 'var(--ink-ghost)' }}>
                                {teacher.classroomCount} Classrooms
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
