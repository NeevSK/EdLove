import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { 
    useThemedColors, 
    SkeletonCard 
} from '@repo/ui';
import { 
    AvatarDisplay, 
    EditableItem,
    useCommunityProfile
} from '@repo/profile';
import { 
    ArrowLeft, 
    Users, 
    MessageCircle, 
    Globe,
    Info,
    Layout
} from 'lucide-react-native';

export default function CommunityProfileScreenWeb({ communityId }: { communityId: string }) {
    const { t } = useTranslation();
    const navigation = useNavigation();
    const colors = useThemedColors();
    const { community, loading, updateField, isEditable } = useCommunityProfile(communityId);

    if (loading) return <div style={{ padding: '40px' }}><SkeletonCard /></div>;
    if (!community) return <div style={{ padding: '40px', textAlign: 'center' }}>Community not found</div>;

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
                            <AvatarDisplay 
                                userId={community.id}
                                avatarUrl={null}
                                fullName={community.name}
                                size={48}
                                editable={false}
                                peekable={true}
                                peekType="community"
                            />
                            
                            <div style={{ flex: 1 }}>
                                <EditableItem
                                    icon={Layout}
                                    label="Group Name"
                                    value={community.name}
                                    field="name"
                                    placeholder="Enter group name"
                                    onSave={(field, val) => updateField(field as any, val)}
                                    disabled={!isEditable}
                                />
                                
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--ink-ghost)', marginTop: '8px' }}>
                                    <Globe size={14} />
                                    <span style={{ fontSize: '14px', fontWeight: '600', textTransform: 'capitalize' }}>
                                        {community.visibility || 'Public'} community
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="sanctuary-card" style={{ padding: '32px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '20px' }}>About this Circle</h3>
                        <EditableItem
                            icon={Info}
                            label="Description"
                            value={community.description || ''}
                            field="description"
                            placeholder="Tell us about this community..."
                            onSave={(field, val) => updateField(field as any, val)}
                            disabled={!isEditable}
                            multiline={true}
                        />
                    </div>
                </div>

                <div>
                    <div className="sanctuary-card" style={{ padding: '24px', marginBottom: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                            <Users size={16} color="var(--ink-ghost)" />
                            <span style={{ fontSize: '13px', fontWeight: '700' }}>Engagement</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                             <div style={{ fontSize: '14px', color: 'var(--ink-ghost)' }}>Members</div>
                             <div style={{ fontSize: '16px', fontWeight: '800' }}>{community.member_count || 0}</div>
                        </div>
                    </div>

                    <button 
                        className="premium-button" 
                        style={{ width: '100%', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    >
                        <MessageCircle size={20} />
                        Join Conversation
                    </button>
                </div>

            </div>
        </div>
    );
}
