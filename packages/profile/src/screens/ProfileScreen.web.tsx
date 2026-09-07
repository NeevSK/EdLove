import { usePermissions } from '@repo/core/logic';
import { useAuthStore } from '@repo/core/store';
import { StaffPresencePulse } from '@repo/people';
import { AvatarDisplay } from '@repo/profile/components/AvatarDisplay';
import { ContactLinktree } from '@repo/profile/components/ContactLinktree';
import LivingJourneyPanel from '@repo/profile/components/LivingJourneyPanel';
import { useProfile } from '@repo/profile/hooks/useProfile';
import { useProfileCompletion } from '@repo/profile/hooks/useProfileCompletion';
import { isConfirmedProfileFieldUpdate } from '@repo/profile/hooks/profileFieldUpdateResult';
import { useSocialLinks } from '@repo/profile/hooks/useSocialLinks';
import { toFullProfileParams, useProfileNavigation } from '@repo/profile/navigation';
import { QRCodeGenerator } from '@repo/scanner-kit';
import NegentropyHubModal from '@repo/profile/components/NegentropyHubModal';
import { SignupPrompt } from '@repo/ui';
import { Briefcase, CircleCheck, FileText, Globe, GraduationCap, Sparkles, SquarePen } from '@repo/ui/icons';
import { GURUDEVI_APP } from '@repo/ui/utils';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

type EditableProfileField = 'display_name' | 'bio' | 'phone' | 'username';

// Skeleton Component logic (mocked because it was used in corrupt code)
const SkeletonCard = ({ height }: { height: number }) => (
  <div
    aria-hidden="true"
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
  const authority = context.activeBond?.capacity;
  const user = useAuthStore((state) => state.user);
  const {
    profile,
    error,
    loading: isProfileLoading,
    updateField,
    refresh,
    uploadAvatar,
  } = useProfile(userId);
  const completionResult = useProfileCompletion(profile, authority ?? null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isNegentropyModalOpen, setIsNegentropyModalOpen] = useState(false);
  const [editForm, setEditForm] = useState<{
    display_name: string;
    bio: string;
    phone: string;
    username: string;
  } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [copyError, setCopyError] = useState<string | null>(null);
  const [queuedFields, setQueuedFields] = useState<Set<EditableProfileField>>(new Set());

  const isOwnProfile = !userId || userId === user?.id;
  const { links: socialLinks } = useSocialLinks(userId || user?.id);

  const openInlineEdit = () =>
    setEditForm({
      display_name: profile?.display_name ?? '',
      bio: profile?.bio ?? '',
      phone: profile?.phone ?? '',
      username: profile?.username ?? '',
    });

  const cancelEdit = () => setEditForm(null);

  const copyProfileLink = async () => {
    if (!profilePublicUrl || !navigator.clipboard?.writeText) {
      setCopyError(t('profile.copyUnavailable', 'Copy is not available in this browser.'));
      return;
    }

    try {
      await navigator.clipboard.writeText(profilePublicUrl);
      setCopyError(null);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (copyFailure) {
      console.error('[ProfileScreenWeb] could not copy profile link', copyFailure);
      setCopyError(t('profile.copyFailed', 'The profile link could not be copied.'));
    }
  };

  const saveEdit = async () => {
    if (!editForm || !profile) return;
    setIsSaving(true);
    setSaveError(null);
    const savedFields: string[] = [];
    let pendingMessage: string | null = null;
    let failureMessage: string | null = null;
    try {
      const updates: ReadonlyArray<readonly [EditableProfileField, string, string]> = [
        ['display_name', editForm.display_name, profile.display_name],
        ['bio', editForm.bio, profile.bio ?? ''],
        ['phone', editForm.phone, profile.phone ?? ''],
        ['username', editForm.username, profile.username ?? ''],
      ];

      for (const [field, value, previousValue] of updates) {
        if (value === previousValue && !queuedFields.has(field)) continue;
        const result = await updateField(field, value);
        if (isConfirmedProfileFieldUpdate(result)) {
          savedFields.push(field.replace('_', ' '));
          setQueuedFields((current) => {
            if (!current.has(field)) return current;
            const next = new Set(current);
            next.delete(field);
            return next;
          });
          continue;
        }

        if (result.status === 'queued') {
          setQueuedFields((current) => new Set(current).add(field));
          pendingMessage =
            result.error || 'Profile update is waiting to sync and has not been confirmed yet.';
          continue;
        }

        failureMessage = result.error || t('profile.updateFailed', 'Profile update failed');
        break;
      }

      if (failureMessage) {
        const savedPrefix =
          savedFields.length > 0
            ? `Saved ${savedFields.join(', ')}. `
            : '';
        setSaveError(`${savedPrefix}${failureMessage} Try saving again to finish the remaining fields.`);
        return;
      }

      if (pendingMessage) {
        setSaveError(pendingMessage);
        return;
      }

      setEditForm(null);
      refresh?.();
    } catch (saveFailure) {
      setSaveError(
        saveFailure instanceof Error
          ? saveFailure.message
          : t('profile.updateFailed', 'Profile update failed'),
      );
    } finally {
      setIsSaving(false);
    }
  };

  const profilePublicUrl = profile?.username
    ? `${GURUDEVI_APP}/profile/public/${encodeURIComponent(profile.username)}`
    : profile?.id
      ? `${GURUDEVI_APP}/profile/public/${encodeURIComponent(profile.id)}`
      : '';

  const profileDisplayName =
    profile?.display_name?.trim() ||
    profile?.username?.trim() ||
    user?.display_name?.trim() ||
    user?.email?.split('@')[0] ||
    t('profile.unnamedUser', 'Gurudevi User');

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

  if (isProfileLoading) {
    return (
      <div className="sanctuary-screen profile-web-surface" role="status" aria-live="polite" aria-busy="true">
        <div className="sanctuary-container">
          <p className="profile-state-label">{t('profile.loading', 'Loading your profile')}</p>
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

  if (!profile && error) {
    return (
      <div className="sanctuary-screen profile-web-surface">
        <div className="sanctuary-container">
          <div className="sanctuary-card profile-state-card" role="alert" aria-live="assertive">
            <h1>{t('profile.loadFailed', 'Your profile could not be opened')}</h1>
            <p style={{ color: 'var(--ink-soft)' }}>{error}</p>
            <button type="button" className="sanctuary-button" onClick={() => void refresh()}>
              {t('common.retry', 'Try again')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="sanctuary-screen profile-web-surface">
        <div className="sanctuary-container">
          <div className="sanctuary-card profile-state-card">
            <h1>{t('profile.emptyTitle', 'Profile not available')}</h1>
            <p>{t('profile.emptyMessage', 'There is no profile information to show yet.')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sanctuary-screen profile-web-surface">
      <div className="sanctuary-container">
        <section
          className="profile-hero sanctuary-card"
          aria-labelledby="profile-heading"
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
                  fullName={profileDisplayName}
                  size={88}
                  editable={isOwnProfile}
                  onAvatarSelected={async (localUri: string) => {
                    const result = await uploadAvatar(localUri);
                    if (result.success) {
                      refresh?.();
                      return;
                    }
                    setSaveError(
                      result.error instanceof Error
                        ? result.error.message
                        : t('profile.avatarUploadFailed', 'Your profile photo could not be updated. Please try again.'),
                    );
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
                    id="profile-heading"
                    style={{
                      margin: 0,
                      fontSize: '30px',
                      fontWeight: '800',
                      color: 'var(--ink)',
                    }}
                  >
                    {profileDisplayName}
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
                        {t('profile.profileCompletion', 'Profile Completion')}
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
                      <CircleCheck size={18} />
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

                {isOwnProfile && !context.isAnonymous && (
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="secondary-button"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                      onClick={openInlineEdit}
                    >
                      <SquarePen size={16} />
                      {t('profile.viewEditProfile')}
                    </button>
                    <button
                      type="button"
                      className="secondary-button"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                      onClick={() => navigation.openFullProfile(toFullProfileParams(profile))}
                    >
                      {t('profile.fullProfile', 'Full Profile')}
                    </button>
                    <button
                      type="button"
                      className="secondary-button"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                      onClick={() => navigation.openSettings?.()}
                    >
                      {t('profile.settings', 'Settings')}
                    </button>
                    <button
                      type="button"
                      className="secondary-button"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                      onClick={() => navigation.openPrivacyLedger?.()}
                    >
                      {t('profile.privacyLedgerTitle', 'Privacy Ledger')}
                    </button>
                    <button
                      type="button"
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
                      {t('profile.publicPreview', 'Public Preview')}
                    </button>
                  </div>
                )}

                {isOwnProfile && context.isAnonymous && (
                  <div style={{ marginTop: '12px' }}>
                    <SignupPrompt
                      onAction={() => navigation.openAuth?.()}
                    />
                  </div>
                )}
              </div>
            </div>

            {context.isAnonymous ? null : (
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
                  <QRCodeGenerator
                    value={profilePublicUrl}
                    size={104}
                    label={profileDisplayName}
                  />
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
                  {t('profile.scanToViewProfile', 'Scan to view profile')}
                </p>
                <button
                  type="button"
                  aria-label={t('profile.copyLink', 'Copy link')}
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
                  onClick={() => void copyProfileLink()}
                >
                  {copiedLink ? t('profile.copied', 'Copied!') : t('profile.copyLink', 'Copy link')}
                </button>
                {copyError ? (
                  <p role="alert" aria-live="assertive" style={{ margin: 0, color: 'var(--warning)' }}>
                    {copyError}
                  </p>
                ) : null}
              </div>
            )}
          </div>
        </section>

        {(error || saveError) && (
          <div
            role="alert"
            aria-live="assertive"
            style={{
              marginBottom: '24px',
              padding: '12px 16px',
              borderRadius: '16px',
              background: 'var(--warning-surface)',
              border: '1px solid var(--warning)',
              color: 'var(--warning)',
              fontSize: '13px',
            }}
          >
            {saveError || error}
          </div>
        )}

        {editForm && !context.isAnonymous && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="profile-edit-title"
            aria-describedby="profile-edit-description"
            className="sanctuary-card profile-edit-dialog"
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
              <h2 id="profile-edit-title" style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>
                {t('profile.editProfile', 'Edit Profile')}
              </h2>
              <button
                type="button"
                aria-label={t('profile.closeEditProfile', 'Close edit profile')}
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
            <p id="profile-edit-description" className="profile-dialog-description">
              {t('profile.editProfileHint', 'Update the details shown on your profile.')}
            </p>
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
                  htmlFor="edit-display-name"
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
                  {t('profile.displayName', 'Display Name')}
                </label>
                <input
                  id="edit-display-name"
                  value={editForm.display_name}
                  onChange={(e) =>
                    setEditForm((f) => (f ? { ...f, display_name: e.target.value } : f))
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
                  {t('profile.handleUsername', 'Handle / Username')}
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
                    {t('profile.anonymousHandleDisabled', 'Anonymous users cannot have handles.')}
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
                  {t('profile.phone', 'Phone')}
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
                {t('profile.bio', 'Bio')}
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
              <button
                type="button"
                className="premium-button"
                onClick={saveEdit}
                disabled={isSaving}
                style={{ minWidth: '100px' }}
              >
                {isSaving ? t('profile.saving', 'Saving...') : t('profile.saveChanges', 'Save Changes')}
              </button>
              <button type="button" className="secondary-button" onClick={cancelEdit}>
                {t('profile.cancel', 'Cancel')}
              </button>
            </div>
          </div>
        )}

        <main
          aria-label={t('profile.profileContent', 'Profile content')}
        >
        <div
          className="profile-content-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 0.8fr)',
            gap: '24px',
            alignItems: 'start',
          }}
        >
          <section aria-labelledby="profile-bio-title" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
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
                  id="profile-bio-title"
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

            <details className="profile-secondary-disclosure">
              <summary>
                <span>{t('profile.moreDetails', 'More about this profile')}</span>
                <span className="profile-secondary-disclosure-hint">
                  {t('profile.moreDetailsHint', 'Professional credentials and social links')}
                </span>
              </summary>
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
                      {t('profile.professionalCredentials', 'Professional Credentials')}
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
                          {t('profile.subjectsTaught', 'Subjects Taught')}
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
                          {t('profile.qualifications', 'Qualifications')}
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
                        {t('profile.teachingExperienceYears', {
                          count: profile.experience_years,
                          defaultValue: '{{count}} years of teaching experience',
                        })}
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
                  <h2
                    style={{
                      margin: 0,
                      fontSize: '14px',
                      fontWeight: '800',
                      color: 'var(--ink-ghost)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.8px',
                    }}
                  >
                    {t('profile.socialSanctuary', 'Social Sanctuary')}
                  </h2>
                </div>
              </div>
              <ContactLinktree
                links={socialLinks || []}
                userName={profileDisplayName}
                userId={profile.id}
                isOwnProfile={isOwnProfile}
                editable={isOwnProfile}
                inline
              />
            </div>
            </details>
          </section>
          <aside aria-label={t('profile.journeyAside', 'Profile journey')} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {isStaff && profile.school_id && (
              <div className="sanctuary-card" style={{ padding: '24px' }}>
                <StaffPresencePulse userId={profile.id} schoolId={profile.school_id} />
              </div>
            )}

            <div style={{ width: '100%' }}>
              <LivingJourneyPanel userId={profile.id} authority={authority} />
            </div>

            {isOwnProfile && (
              <div
                className="sanctuary-card"
                style={{
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  border: '1px solid var(--border)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: 'rgba(246, 191, 140, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Sparkles size={18} color="var(--action, #F6BF8C)" />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700' }}>Energy Reservoir</h3>
                    <p style={{ margin: 0, fontSize: '12px', color: 'var(--ink-soft)' }}>Sponsors & Negentropy</p>
                  </div>
                </div>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--ink-soft)', lineHeight: 1.5 }}>
                  Contribute voluntary attention to generate real-world compute energy and earn Sanctuary Energy tokens.
                </p>
                <button
                  type="button"
                  onClick={() => setIsNegentropyModalOpen(true)}
                  style={{
                    padding: '10px 16px',
                    borderRadius: '12px',
                    background: 'var(--action, #F6BF8C)',
                    color: '#2A2318',
                    border: 'none',
                    fontWeight: '700',
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                >
                  <Sparkles size={16} color="#2A2318" />
                  Open Energy Reservoir
                </button>
              </div>
            )}
          </aside>
        </div>
        </main>

        <NegentropyHubModal
          isOpen={isNegentropyModalOpen}
          onClose={() => setIsNegentropyModalOpen(false)}
        />
        <style>{`
                    .profile-web-surface {
                        --profile-focus: var(--focus-ring, var(--action));
                        --profile-control-surface: var(--glass-surface);
                    }

                    .profile-web-surface button,
                    .profile-web-surface input,
                    .profile-web-surface textarea,
                    .profile-web-surface summary {
                        font: inherit;
                    }

                    .profile-web-surface button:focus-visible,
                    .profile-web-surface input:focus-visible,
                    .profile-web-surface textarea:focus-visible,
                    .profile-web-surface summary:focus-visible {
                        outline: 3px solid var(--profile-focus);
                        outline-offset: 3px;
                    }

                    .profile-state-label {
                        margin: 0 0 16px;
                        color: var(--ink-ghost);
                        font-size: 13px;
                        font-weight: 700;
                    }

                    .profile-state-card {
                        padding: clamp(28px, 6vw, 48px);
                        text-align: center;
                    }

                    .profile-state-card h1 {
                        margin: 0 0 12px;
                        color: var(--ink);
                        font-size: clamp(22px, 3vw, 30px);
                    }

                    .profile-state-card p {
                        max-width: 48ch;
                        margin: 0 auto 20px;
                        color: var(--ink-soft);
                        line-height: 1.6;
                    }

                    .profile-edit-dialog {
                        padding: 32px;
                        margin-bottom: 24px;
                        border: 2px solid var(--action);
                    }

                    .profile-dialog-description {
                        margin: -12px 0 24px;
                        color: var(--ink-soft);
                        font-size: 14px;
                        line-height: 1.5;
                    }

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

                    .profile-secondary-disclosure {
                        display: flex;
                        flex-direction: column;
                        gap: 24px;
                    }

                    .profile-secondary-disclosure summary {
                        display: flex;
                        align-items: baseline;
                        justify-content: space-between;
                        gap: 16px;
                        cursor: pointer;
                        list-style: none;
                        padding: 16px 4px;
                        color: var(--ink);
                        font-size: 14px;
                        font-weight: 800;
                    }

                    .profile-secondary-disclosure summary::-webkit-details-marker { display: none; }
                    .profile-secondary-disclosure summary::after { content: '⌄'; color: var(--action); font-size: 18px; }
                    .profile-secondary-disclosure[open] summary::after { content: '⌃'; }
                    .profile-secondary-disclosure-hint { color: var(--ink-ghost); font-size: 12px; font-weight: 500; }

                    @media (max-width: 919px) {
                        .profile-web-surface .sanctuary-container { padding-inline: 16px; }
                        .profile-hero { padding: 24px !important; margin-bottom: 24px !important; }
                        .profile-hero-grid { grid-template-columns: 1fr !important; gap: 20px !important; }
                        .profile-identity-column { gap: 16px !important; }
                        .profile-content-grid {
                            grid-template-columns: minmax(0, 1fr) minmax(220px, 0.68fr) !important;
                            gap: 16px !important;
                        }
                        .profile-web-surface .sanctuary-card { border-radius: 18px; }
                        .profile-edit-dialog { padding: 24px !important; }

                        .profile-qr-panel {
                            min-width: 0 !important;
                            width: 100%;
                            flex-direction: row !important;
                            justify-content: flex-start;
                            align-items: center !important;
                        }
                    }

                    @media (max-width: 680px) {
                        .profile-content-grid { grid-template-columns: 1fr !important; }
                        .profile-qr-panel { flex-wrap: wrap; }
                    }

                    @media (prefers-reduced-motion: reduce) {
                        .profile-web-surface * { transition-duration: 0.01ms !important; animation-duration: 0.01ms !important; }
                    }
                `}</style>
      </div>
    </div>
  );
}

export { ProfileScreenWeb as ProfileScreen };
