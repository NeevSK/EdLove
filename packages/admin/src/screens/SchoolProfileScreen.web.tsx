import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { 
    useThemedColors, 
    SkeletonCard,
    Icon } from '@repo/ui';
import { AvatarDisplay } from '@repo/profile/components/AvatarDisplay';
import { ContactLinktree } from '@repo/profile/components/ContactLinktree';
import { EditableItem } from '@repo/profile/components/EditableItem';
import { useSchoolProfile } from '@repo/profile/hooks/useSchoolProfile';
import { 
    ArrowLeft, 
    School as SchoolIcon,
    Users, 
    BookOpen, 
    Layout, 
    Globe,
    Shield
} from 'lucide-react-native';

export default function SchoolProfileScreenWeb({ schoolId }: { schoolId: string }) {
    const { t } = useTranslation();
    const navigation = useNavigation();
    const { school, stats, loading, updateField, isEditable } = useSchoolProfile(schoolId);

    if (loading) return <div style={{ padding: '40px' }}><SkeletonCard /></div>;
    if (!school) return <div style={{ padding: '40px', textAlign: 'center' }}>School not found</div>;

    return (
        <div className="sub-view-container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 24px' }}>
             {/* Header with Back button */}
             <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                <button
                    onClick={() => navigation.goBack()}
                    className="secondary-button"
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', border: '1px solid var(--border)', borderRadius: '12px', background: 'transparent', cursor: 'pointer' }}
                >
                    <Icon as={ArrowLeft} size={16} /> 
                    <span style={{ fontWeight: '600' }}>Back</span>
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '32px' }}>
                {/* Left Column: Essential Info */}
                <div>
                    {/* Hero Section */}
                    <div className="sanctuary-card" style={{ padding: '40px', marginBottom: '24px', position: 'relative', overflow: 'hidden', background: 'var(--background)', borderRadius: '24px', border: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
                            <AvatarDisplay 
                                userId={school.id}
                                avatarUrl={null}
                                fullName={school.name}
                                size={120}
                                editable={false}
                                peekable={true}
                                peekType="school"
                            />
                            
                            <div style={{ flex: 1 }}>
                                <EditableItem
                                    icon={SchoolIcon}
                                    label="School Name"
                                    value={school.name}
                                    field="name"
                                    placeholder="Enter school name"
                                    onSave={(field, val) => updateField(field as any, val)}
                                    disabled={!isEditable}
                                />
                                
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--ink-ghost)', marginBottom: '16px', marginTop: '12px' }}>
                                    <Icon as={Shield} size={14} />
                                    <span style={{ fontSize: '14px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                        {school.type} School
                                    </span>
                                    <span style={{ opacity: 0.3 }}>•</span>
                                    <span style={{ fontSize: '14px' }}>@{school.handle}</span>
                                </div>

                                <div style={{ display: 'flex', gap: '12px' }}>
                                    {isEditable && (
                                        <button className="premium-button" style={{ padding: '10px 20px', borderRadius: '12px', border: 'none', background: 'var(--ink)', color: 'var(--background)', fontWeight: '700', cursor: 'pointer' }}>
                                            Manage School
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                        <div className="sanctuary-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px', background: 'var(--background)', borderRadius: '24px', border: '1px solid var(--border)' }}>
                            <div style={{ padding: '12px', background: 'var(--water-soft)', borderRadius: '12px' }}>
                                <Icon as={Users} size="lg" className="text-water" />
                            </div>
                            <div>
                                <div style={{ fontSize: '24px', fontWeight: '800' }}>{stats?.total_students || 0}</div>
                                <div style={{ fontSize: '12px', color: 'var(--ink-ghost)', fontWeight: '600' }}>Students</div>
                            </div>
                        </div>
                        <div className="sanctuary-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px', background: 'var(--background)', borderRadius: '24px', border: '1px solid var(--border)' }}>
                            <div style={{ padding: '12px', background: 'var(--moss-soft)', borderRadius: '12px' }}>
                                <Icon as={BookOpen} size="lg" className="text-moss" />
                            </div>
                            <div>
                                <div style={{ fontSize: '24px', fontWeight: '800' }}>{stats?.total_teachers || 0}</div>
                                <div style={{ fontSize: '12px', color: 'var(--ink-ghost)', fontWeight: '600' }}>Teachers</div>
                            </div>
                        </div>
                    </div>

                    {/* About Section */}
                    <div className="sanctuary-card" style={{ padding: '32px', background: 'var(--background)', borderRadius: '24px', border: '1px solid var(--border)' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '20px' }}>Our Mission</h3>
                        <p style={{ color: 'var(--ink-ghost)', lineHeight: '1.6', fontSize: '15px' }}>
                            Welcome to the public profile of {school.name}. We are dedicated to nurturing the growth of every student and educator in our community.
                        </p>
                    </div>
                </div>

                {/* Right Column: Socials & Context */}
                <div>
                     {/* Social Sanctuary */}
                     <div className="sanctuary-card" style={{ padding: '32px', marginBottom: '24px', background: 'var(--background)', borderRadius: '24px', border: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                            <Icon as={Globe} size={18} color="var(--ink-ghost)" />
                            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: 'var(--ink-ghost)', textTransform: 'uppercase' }}>
                                Official Links
                            </h3>
                        </div>
                        
                        <ContactLinktree 
                            links={[]} 
                            userName={school.name}
                            userId={school.id}
                            isOwnProfile={isEditable}
                            editable={isEditable}
                        />
                    </div>

                    {/* Info Card */}
                    <div className="sanctuary-card" style={{ padding: '24px', background: 'var(--background-alt)', borderRadius: '24px', border: '1px solid var(--border)' }}>
                         <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                            <Icon as={Layout} size={16} color="var(--ink-ghost)" />
                            <span style={{ fontSize: '13px', fontWeight: '700' }}>School Structure</span>
                        </div>
                        <div style={{ fontSize: '14px', color: 'var(--ink-ghost)' }}>
                             {stats?.total_sections || 0} Sections • {stats?.total_classrooms || 0} Classrooms
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
