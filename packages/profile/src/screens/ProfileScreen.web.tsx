import { usePermissions, useStore } from '@repo/core/logic';

import { StaffPresencePulse } from '@repo/people';
import { QRCodeGenerator } from '@repo/scanner-kit';
import CitizenGate from '@repo/ui/components/CitizenGate';
import {
  Briefcase,
  CheckCircle2,
  Edit3,
  FileText,
  Globe,
  GraduationCap,
} from 'lucide-react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AvatarDisplay } from '../components/AvatarDisplay';
import { ContactLinktree } from '../components/ContactLinktree';
import LivingJourneyPanel from '../components/LivingJourneyPanel';
import { useProfile } from '../hooks/useProfile';
import { useProfileCompletion } from '../hooks/useProfileCompletion';
import { useSocialLinks } from '../hooks/useSocialLinks';
import { toFullProfileParams, useProfileNavigation } from '../navigation';

// Skeleton Component logic (mocked because it was used in corrupt code)
const SkeletonCard = ({ height }: { height: number }) => (
  <div
    style={{
      height: `${height}px`,
      background: 'var(--border)',
      borderRadius: '16px',
      opacity: 0.3,
    }}
  />
);

export default function ProfileScreenWeb({
  userId,
  isPublic,
}: {
  userId?: string;
  isPublic?: boolean;
}) {
  const { t } = useTranslation();
  const navigation = useProfileNavigation();
  const { can, context } = usePermissions();
  const authority = context.active_bond?.capacity;
  const { user } = useStore();
  const {
    profile,
    loading: isProfileLoading,
    updateField,
    refresh,
    uploadAvatar,
  } = useProfile(userId);
  const completionResult = useProfileCompletion(profile, (authority as any) ?? null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [editForm, setEditForm] = useState<{
    full_name: string;
    bio: string;
    phone: string;
    username: string;
  } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const isOwnProfile = !userId || userId === user?.id;
  const { links: socialLinks } = useSocialLinks(userId || user?.id);

  const openInlineEdit = () =>
    setEditForm({
      full_name: profile?.full_name ?? '',
      bio: profile?.bio ?? '',
      phone: profile?.phone ?? '',
      username: profile?.username ?? '',
    });

  const cancelEdit = () => setEditForm(null);

  const saveEdit = async () => {
    if (!editForm || !profile) return;
    setIsSaving(true);
    try {
      if (editForm.full_name !== profile.full_name)
        await updateField('full_name', editForm.full_name);
      if (editForm.bio !== (profile.bio ?? '')) await updateField('bio', editForm.bio);
      if (editForm.phone !== (profile.phone ?? '')) await updateField('phone', editForm.phone);
      if (editForm.username !== (profile.username ?? ''))
        await updateField('username', editForm.username);
      setEditForm(null);
      refresh?.();
    } finally {
      setIsSaving(false);
    }
  };

  const profilePublicUrl = profile?.username
    ? `https://platform.gurudevi.edlove.org/p/${profile.username}`
    : profile?.id
      ? `https://platform.gurudevi.edlove.org/p/${profile.id}`
      : '';

  const isStaff = can('read', 'TeacherPulse') || can('read', 'PrincipalPulse');
  const subjectsTaught = Array.isArray(profile?.subjects_taught)
    ? profile.subjects_taught
    : profile?.subjects_taught
      ? [profile.subjects_taught]
      : [];

  const qualifications = Array.isArray(profile?.qualifications)
    ? profile.qualifications
    : profile?.qualifications
      ? [profile.qualifications]
      : [];

  if (isProfileLoading || !profile) {
    return (
      <div className="sanctuary-screen">
        <div className="sanctuary-container">
          <div
            style={{
              height: '220px',
              background: 'var(--border)',
              borderRadius: '24px',
              marginBottom: '32px',
              opacity: 0.4,
            }}
          />
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(240px, 100%), 1fr))',
              gap: '24px',
            }}
          >
            {[1, 2, 3, 4].map((i) => (
              <SkeletonCard key={i} height={140} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sanctuary-screen">
      <div className="sanctuary-container">
        <div
          className="profile-hero sanctuary-card"
          style={{
            padding: '40px',
            marginBottom: '32px',
            background:
              'linear-gradient(135deg, var(--glass-surface) 0%, var(--background-alt) 100%)',
            border: '1px solid var(--border)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '-60px',
              right: '-60px',
              width: '200px',
              height: '200px',
              background: 'radial-gradient(circle, var(--action-soft) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />
          <div
            className="profile-hero-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1fr) auto',
              gap: '32px',
              position: 'relative',
              zIndex: 1,
              alignItems: 'start',
            }}
          >
            <div
              className="profile-identity-column"
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '28px',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ flexShrink: 0 }}>
                <AvatarDisplay
                  userId={profile.id}
                  avatarUrl={profile.avatar_url}
                  fullName={profile.full_name}
                  size={88}
                  editable={isOwnProfile}
                  onAvatarSelected={async (localUri: string) => {
                    const result = await uploadAvatar(localUri);
                    if (result.success) {
                      refresh?.();
                    }
                  }}
                  peekable={!isOwnProfile || isPublic}
                  peekType="user"
                />
              </div>
              <div className="profile-identity-copy" style={{ flex: 1, minWidth: '180px' }}>
                <div
                  className="profile-title-row"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '4px',
                    flexWrap: 'wrap',
                  }}
                >
                  <h1
                    style={{
                      margin: 0,
                      fontSize: '30px',
                      fontWeight: '800',
                      color: 'var(--ink)',
                    }}
                  >
                    {profile.full_name}
                  </h1>
                  {profile.is_thuthimal && (
                    <span
                      style={{
                        padding: '4px 10px',
                        background: 'var(--sanctuary-saffron)',
                        color: 'var(--text-on-action)',
                        borderRadius: '8px',
                        fontSize: '11px',
                        fontWeight: '800',
                      }}
                    >
                      Thuthimal
                    </span>
                  )}
                </div>
                <div
                  className="profile-context-row"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    marginBottom: '16px',
                    flexWrap: 'wrap',
                  }}
                >
                  <span
                    style={{
                      fontSize: '15px',
                      color: 'var(--action)',
                      fontWeight: '600',
                      textTransform: 'capitalize',
                    }}
                  >
                    {authority?.split('_').join(' ')}
                  </span>
                  {profile.school_name && (
                    <>
                      <span style={{ color: 'var(--border)', fontWeight: '300' }}>\u00B7</span>
                      <span style={{ fontSize: '14px', color: 'var(--ink-ghost)' }}>
                        {profile.school_name}
                      </span>
                    </>
                  )}
                </div>

                {!completionResult.isComplete && (
                  <div style={{ marginBottom: '16px' }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '6px',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '12px',
                          fontWeight: '700',
                          color: 'var(--ink-ghost)',
                        }}
                      >
                        Profile Completion
                      </span>
                      <span
                        style={{
                          fontSize: '12px',
                          fontWeight: '800',
                          color: 'var(--action)',
                        }}
                      >
                        {completionResult.percentage}%
                      </span>
                    </div>
                    <div
                      style={{
                        height: '6px',
                        background: 'var(--border)',
                        borderRadius: '3px',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: `${completionResult.percentage}%`,
                          height: '100%',
                          background: 'linear-gradient(to right, var(--action), var(--water))',
                          borderRadius: '3px',
                          transition: 'width 0.6s ease',
                        }}
                      />
                    </div>
                    {completionResult.nextHint && (
                      <p
                        style={{
                          fontSize: '11px',
                          color: 'var(--ink-ghost)',
                          margin: '6px 0 0',
                        }}
                      >
                        {completionResult.nextHint}
                      </p>
                    )}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                  {completionResult.isComplete ? (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        color: 'var(--success)',
                        fontSize: '14px',
                        fontWeight: 600,
                      }}
                    >
                      <CheckCircle2 size={18} />
                      {t('profile.completion.done')}
                    </div>
                  ) : (
                    <div
                      style={{
                        padding: '4px 12px',
                        background: 'var(--warning-surface)',
                        color: 'var(--warning)',
                        borderRadius: '100px',
                        fontSize: '12px',
                        fontWeight: 600,
                      }}
                    >
                      {t('profile.completion.incomplete')}
                    </div>
                  )}
                </div>

                {isOwnProfile && !context.is_anonymous && (
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button type="button"
                      className="secondary-button"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                      onClick={openInlineEdit}
                    >
                      <Edit3 size={16} />
                      {t('profile.viewEditProfile')}
                    </button>
                    <button type="button"
                      className="secondary-button"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                      onClick={() => navigation.openFullProfile(toFullProfileParams(profile))}
                    >
                      Full Profile
                    </button>
                    <button type="button"
                      className="secondary-button"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                      onClick={() => navigation.openSettings?.()}
                    >
                      Settings
                    </button>
                    <button type="button"
                      className="secondary-button"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                      onClick={() => navigation.openPrivacyLedger?.()}
                    >
                      Privacy Ledger
                    </button>
                    <button type="button"
                      className="secondary-button"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                      onClick={() =>
                        navigation.openPublicProfile?.({
                          id: profile.id,
                          type: 'user',
                        })
                      }
                    >
                      Public Preview
                    </button>
                  </div>
                )}

                {isOwnProfile && context.is_anonymous && (
                  <div style={{ marginTop: '12px' }}>
                    <CitizenGate
                      context="profile"
                      title="Upgrade to edit your profile"
                      description="Create an account to save your identity across devices and unlock citizen features."
                      actionLabel="Create account"
                      onAction={() => navigation.openAuth?.()}
                    />
                  </div>
                )}
              </div>
            </div>

            {context.is_anonymous ? null : (
              <div
                className="profile-qr-panel"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '20px',
                  background: 'var(--glass-surface)',
                  borderRadius: '16px',
                  border: '1px solid var(--border)',
                  flexShrink: 0,
                  minWidth: '140px',
                }}
              >
                <div
                  style={{
                    borderRadius: '8px',
                    overflow: 'hidden',
                    background: '#fff',
                    padding: '8px',
                  }}
                >
                  <QRCodeGenerator value={profilePublicUrl} size={104} label={profile.full_name} />
                </div>
                <p
                  style={{
                    margin: 0,
                    fontSize: '11px',
                    fontWeight: '600',
                    color: 'var(--ink-ghost)',
                    textAlign: 'center',
                    lineHeight: 1.4,
                  }}
                >
                  Scan to view profile
                </p>
                <button type="button"
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '11px',
                    color: copiedLink ? 'var(--moss)' : 'var(--action)',
                    fontWeight: '600',
                    padding: '2px 0',
                    fontFamily: 'var(--font-body)',
                    transition: 'color 0.2s',
                  }}
                  onClick={() => {
                    navigator.clipboard
                      ?.writeText(profilePublicUrl)
                      .then(() => {
                        setCopiedLink(true);
                        setTimeout(() => setCopiedLink(false), 2000);
                      })
                      .catch(() => {});
                  }}
                >
                  {copiedLink ? 'Copied!' : 'Copy link'}
                </button>
              </div>
            )}
          </div>
        </div>

        {editForm && !context.is_anonymous && (
          <div
            className="sanctuary-card"
            style={{
              padding: '32px',
              marginBottom: '24px',
              border: '2px solid var(--action)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '24px',
              }}
            >
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>Edit Profile</h3>
              <button type="button"
                onClick={cancelEdit}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--ink-ghost)',
                  fontSize: '20px',
                }}
              >
                \u00D7
              </button>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))',
                gap: '20px',
                marginBottom: '24px',
              }}
            >
              <div>
                <label
                  htmlFor="edit-full-name"
                  style={{
                    display: 'block',
                    fontSize: '11px',
                    fontWeight: '800',
                    textTransform: 'uppercase',
                    letterSpacing: '0.8px',
                    color: 'var(--ink-ghost)',
                    marginBottom: '6px',
                  }}
                >
                  Display Name
                </label>
                <input
                  id="edit-full-name"
                  value={editForm.full_name}
                  onChange={(e) =>
                    setEditForm((f) => (f ? { ...f, full_name: e.target.value } : f))
                  }
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid var(--border)',
                    background: 'var(--glass-surface)',
                    fontSize: '15px',
                    fontFamily: 'var(--font-body)',
                    color: 'var(--ink)',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              <div>
                <label
                  htmlFor="edit-username"
                  style={{
                    display: 'block',
                    fontSize: '11px',
                    fontWeight: '800',
                    textTransform: 'uppercase',
                    letterSpacing: '0.8px',
                    color: 'var(--ink-ghost)',
                    marginBottom: '6px',
                  }}
                >
                  Handle / Username
                </label>
                <input
                  id="edit-username"
                  value={editForm.username}
                  onChange={(e) => setEditForm((f) => (f ? { ...f, username: e.target.value } : f))}
                  placeholder="your-handle"
                  disabled={!!profile.is_anonymous}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid var(--border)',
                    background: 'var(--glass-surface)',
                    fontSize: '15px',
                    fontFamily: 'var(--font-body)',
                    color: 'var(--ink)',
                    outline: 'none',
                    boxSizing: 'border-box',
                    opacity: profile.is_anonymous ? 0.5 : 1,
                  }}
                />
                {profile.is_anonymous && (
                  <p
                    style={{
                      fontSize: '10px',
                      color: 'var(--ink-ghost)',
                      marginTop: '4px',
                    }}
                  >
                    Anonymous users cannot have handles.
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="edit-phone"
                  style={{
                    display: 'block',
                    fontSize: '11px',
                    fontWeight: '800',
                    textTransform: 'uppercase',
                    letterSpacing: '0.8px',
                    color: 'var(--ink-ghost)',
                    marginBottom: '6px',
                  }}
                >
                  Phone
                </label>
                <input
                  id="edit-phone"
                  value={editForm.phone}
                  onChange={(e) => setEditForm((f) => (f ? { ...f, phone: e.target.value } : f))}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid var(--border)',
                    background: 'var(--glass-surface)',
                    fontSize: '15px',
                    fontFamily: 'var(--font-body)',
                    color: 'var(--ink)',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label
                htmlFor="edit-bio"
                style={{
                  display: 'block',
                  fontSize: '11px',
                  fontWeight: '800',
                  textTransform: 'uppercase',
                  letterSpacing: '0.8px',
                  color: 'var(--ink-ghost)',
                  marginBottom: '6px',
                }}
              >
                Bio
              </label>
              <textarea
                id="edit-bio"
                value={editForm.bio}
                onChange={(e) => setEditForm((f) => (f ? { ...f, bio: e.target.value } : f))}
                rows={3}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid var(--border)',
                  background: 'var(--glass-surface)',
                  fontSize: '14px',
                  fontFamily: 'var(--font-body)',
                  color: 'var(--ink)',
                  outline: 'none',
                  resize: 'vertical',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="button"
                className="premium-button"
                onClick={saveEdit}
                disabled={isSaving}
                style={{ minWidth: '100px' }}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
              <button type="button" className="secondary-button" onClick={cancelEdit}>
                Cancel
              </button>
            </div>
          </div>
        )}

        <div
          className="profile-content-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 0.8fr)',
            gap: '24px',
            alignItems: 'start',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="sanctuary-card" style={{ padding: '32px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '20px',
                }}
              >
                <FileText size={18} color="var(--ink-ghost)" />
                <h3
                  style={{
                    margin: 0,
                    fontSize: '14px',
                    fontWeight: '800',
                    color: 'var(--ink-ghost)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.8px',
                  }}
                >
                  {t('profile.bio_title')}
                </h3>
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: '15px',
                  lineHeight: '1.7',
                  color: profile.bio ? 'var(--ink)' : 'var(--ink-ghost)',
                  fontStyle: profile.bio ? 'normal' : 'italic',
                }}
              >
                {profile.bio || t('profile.no_bio_fallback')}
              </p>
            </div>

            {isStaff &&
              (subjectsTaught.length > 0 ||
                qualifications.length > 0 ||
                profile.experience_years) && (
                <div className="sanctuary-card" style={{ padding: '32px' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      marginBottom: '20px',
                    }}
                  >
                    <Briefcase size={18} color="var(--ink-ghost)" />
                    <h3
                      style={{
                        margin: 0,
                        fontSize: '14px',
                        fontWeight: '800',
                        color: 'var(--ink-ghost)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.8px',
                      }}
                    >
                      Professional Credentials
                    </h3>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '16px',
                    }}
                  >
                    {subjectsTaught.length > 0 && (
                      <div>
                        <div
                          style={{
                            fontSize: '12px',
                            fontWeight: '700',
                            color: 'var(--ink-ghost)',
                            textTransform: 'uppercase',
                            marginBottom: '8px',
                          }}
                        >
                          Subjects Taught
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '8px',
                          }}
                        >
                          {subjectsTaught.map((subject: string) => (
                            <span
                              key={subject}
                              style={{
                                padding: '4px 12px',
                                background: 'var(--action-soft)',
                                color: 'var(--action)',
                                borderRadius: '8px',
                                fontSize: '13px',
                                fontWeight: '600',
                              }}
                            >
                              {subject}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {qualifications.length > 0 && (
                      <div>
                        <div
                          style={{
                            fontSize: '12px',
                            fontWeight: '700',
                            color: 'var(--ink-ghost)',
                            textTransform: 'uppercase',
                            marginBottom: '8px',
                          }}
                        >
                          Qualifications
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '8px',
                          }}
                        >
                          {qualifications.map((qualification: string) => (
                            <span
                              key={qualification}
                              style={{
                                padding: '4px 12px',
                                background: 'var(--moss-soft)',
                                color: 'var(--moss)',
                                borderRadius: '8px',
                                fontSize: '13px',
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                              }}
                            >
                              <GraduationCap size={12} style={{ marginRight: 4 }} />
                              {qualification}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {profile.experience_years && (
                      <div
                        style={{
                          fontSize: '14px',
                          color: 'var(--ink)',
                          fontWeight: '600',
                        }}
                      >
                        {profile.experience_years} years of teaching experience
                      </div>
                    )}
                  </div>
                </div>
              )}

            <div className="sanctuary-card" style={{ padding: '32px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  marginBottom: '20px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Globe size={18} color="var(--ink-ghost)" />
                  <h3
                    style={{
                      margin: 0,
                      fontSize: '14px',
                      fontWeight: '800',
                      color: 'var(--ink-ghost)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.8px',
                    }}
                  >
                    Social Sanctuary
                  </h3>
                </div>
              </div>
              <ContactLinktree
                links={socialLinks || []}
                userName={profile.full_name}
                userId={profile.id}
                isOwnProfile={isOwnProfile}
                editable={isOwnProfile}
                inline
              />
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {isStaff && profile.school_id && (
              <div className="sanctuary-card" style={{ padding: '24px' }}>
                <StaffPresencePulse userId={profile.id} schoolId={profile.school_id} />
              </div>
            )}

            <div style={{ width: '100%' }}>
              <LivingJourneyPanel userId={profile.id} authority={authority as any} />
            </div>
          </div>
        </div>
        <style>{`
                    .profile-hero {
                        background:
                            linear-gradient(135deg, rgba(252, 249, 242, 0.74) 0%, rgba(252, 249, 242, 0.56) 100%),
                            radial-gradient(circle at top right, rgba(125, 212, 192, 0.14), transparent 26%);
                    }

                    .profile-title-row h1 {
                        letter-spacing: -0.05em;
                        line-height: 0.98;
                    }

                    .profile-context-row {
                        padding-bottom: 4px;
                        border-bottom: 1px solid rgba(121, 93, 48, 0.08);
                    }

                    .profile-qr-panel {
                        background: linear-gradient(180deg, rgba(252, 249, 242, 0.68), rgba(252, 249, 242, 0.52));
                        box-shadow: 0 18px 40px rgba(121, 93, 48, 0.08);
                    }

                    .profile-content-grid {
                        grid-template-columns: minmax(0, 1.18fr) minmax(300px, 0.82fr);
                    }

                    @media (max-width: 980px) {
                        .profile-hero-grid,
                        .profile-content-grid {
                            grid-template-columns: 1fr !important;
                        }

                        .profile-qr-panel {
                            min-width: 0 !important;
                            width: 100%;
                        }
                    }
                `}</style>
      </div>
    </div>
  );
}
