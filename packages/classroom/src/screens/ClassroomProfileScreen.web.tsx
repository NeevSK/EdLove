import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { 
    useThemedColors, 
    SkeletonCard 
} from '@repo/ui';
import { 
    AvatarDisplay, 
    EditableItem
} from '@repo/profile';
import { useClassroomProfile } from '../hooks/useClassroomProfile';
import { 
    ArrowLeft, 
    BookOpen, 
    User, 
    GraduationCap,
    Clock,
    Hash
} from 'lucide-react-native';

export default function ClassroomProfileScreenWeb({ classroomId }: { classroomId: string }) {
    const { t } = useTranslation();
    const navigation = useNavigation();
    const colors = useThemedColors();
    const { classroom, loading, updateField, isEditable } = useClassroomProfile(classroomId);

    if (loading) return <div style={{ padding: '40px' }}><SkeletonCard /></div>;
    if (!classroom) return <div style={{ padding: '40px', textAlign: 'center' }}>Classroom not found</div>;

    return (
        <div className="sub-view-container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 24px' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                <button
                    onClick={() => navigation.goBack()}
                    className="secondary-button"
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px' }}
                >
                    <ArrowLeft size={16} /> Back
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '32px' }}>
                
                <div>
                    <div className="sanctuary-card" style={{ padding: '40px', marginBottom: '24px' }}>
                        <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
                            <div style={{ padding: '24px', background: 'var(--accent-action-soft)', borderRadius: '24px' }}>
                                <GraduationCap size={48} color="var(--accent-action)" />
                            </div>
                            
                            <div style={{ flex: 1 }}>
                                <EditableItem
                                    icon={Hash}
                                    label="Classroom Name"
                                    value={classroom.name}
                                    field="name"
                                    placeholder="Enter classroom name"
                                    onSave={(field, val) => updateField(field as any, val)}
                                    disabled={!isEditable}
                                />
                                
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--ink-ghost)', marginTop: '8px' }}>
                                    <BookOpen size={14} />
                                    <span style={{ fontSize: '14px', fontWeight: '600' }}>
                                        {classroom.subject || 'General Studies'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="sanctuary-card" style={{ padding: '32px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '20px' }}>Description</h3>
                        <EditableItem
                            icon={BookOpen}
                            label="Classroom Description"
                            value={classroom.description || ''}
                            field="description"
                            placeholder="Add a description for this classroom..."
                            onSave={(field, val) => updateField(field as any, val)}
                            disabled={!isEditable}
                            multiline={true}
                        />
                    </div>
                </div>

                <div>
                    <div className="sanctuary-card" style={{ padding: '24px', marginBottom: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                            <User size={16} color="var(--ink-ghost)" />
                            <span style={{ fontSize: '13px', fontWeight: '700' }}>Teacher</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                             <AvatarDisplay 
                                userId={classroom.teacher_id || 'unknown'}
                                size={40}
                                editable={false}
                                peekable={true}
                                peekType="user"
                             />
                             <div style={{ fontSize: '14px', fontWeight: '600' }}>Teacher In Charge</div>
                        </div>
                    </div>

                    <div className="sanctuary-card" style={{ padding: '24px', background: 'var(--background-alt)' }}>
                         <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                            <Clock size={16} color="var(--ink-ghost)" />
                            <span style={{ fontSize: '13px', fontWeight: '700' }}>Academic Year</span>
                        </div>
                        <div style={{ fontSize: '14px', color: 'var(--ink-ghost)' }}>
                             {classroom.academic_year || 'Current'}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
