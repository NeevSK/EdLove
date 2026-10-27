'use client';

import { getSandboxSamples } from '@repo/core/api/sandboxDataset';
import type { WorkspaceAppearance } from '@repo/core/types';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { type ProfileSection, useProfileCanvas } from '../../../lib/canvas/useProfileCanvas';
import {
  getExploreCapacityMeta,
  useExploreCapacity,
} from '../../../lib/explore/exploreCapacity';
import { AccountSignOut } from '../components/AccountSignOut';
import { CapacityPerspectiveSwitcher } from '../components/CapacityPerspectiveSwitcher';
import { SanctuaryFloorCanvas } from '../components/SanctuaryFloorCanvas';
import type { FurnitureDefinition } from '../components/FloorStudioDrawer';
import { AccountDeletionControl } from './AccountDeletionControl';
import { CreateAccountGuidanceModal } from './CreateAccountGuidanceModal';
import { ThuthimalClaimModal } from './ThuthimalClaimModal';
import styles from './profile.module.css';

const PROFILE_FURNITURE_ITEMS: readonly FurnitureDefinition[] = [
  { id: 'profile-intro', label: 'Persona & Role Header', icon: '👤' },
  { id: 'profile-stage', label: 'Active Profile Module Stage', icon: '🪷' },
];

const SECTION_LABELS: Record<ProfileSection, { label: string; icon: string }> = {
  identity: { label: 'Identity', icon: '👤' },
  settings: { label: 'Atmosphere & Motion', icon: '✨' },
  security: { label: 'Security & Data', icon: '🛡️' },
};

const PRESET_OPTIONS: readonly {
  id: WorkspaceAppearance['preset'];
  label: string;
  description: string;
}[] = [
  { id: 'default', label: 'Default', description: 'Warm sandstone' },
  { id: 'dawn', label: 'Dawn', description: 'Sunrise coral' },
  { id: 'garden', label: 'Garden', description: 'Fresh pine' },
  { id: 'night', label: 'Night', description: 'Deep cosmic' },
];

export function ProfileFloor({
  accountId,
  displayName,
  primaryScopeRole,
  isExplore = false,
}: Readonly<{
  accountId: string;
  displayName: string;
  primaryScopeRole: string;
  isExplore?: boolean;
}>) {
  const canvas = useProfileCanvas({
    accountId,
  });
  const [activeSection, setActiveSection] = useState<ProfileSection>('identity');
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const exploreCapacity = useExploreCapacity();
  const exploreRole = getExploreCapacityMeta(exploreCapacity);

  const defaultProfile = useMemo(() => {
    return getSandboxSamples<any>('user', 'getProfile', [exploreCapacity]);
  }, [exploreCapacity]);

  // Profile data & edit state
  // In Explore mode: initialized from canonical sandboxDataset tailored to exploreCapacity
  // In Neutral Sanctuary mode: starts clean and neutral, populated strictly via authenticated Supabase hydration
  const [profileName, setProfileName] = useState(displayName);
  const [bio, setBio] = useState('');
  const [phone, setPhone] = useState('');
  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [socialLinks, setSocialLinks] = useState<{ platform: string; url: string }[]>([]);
  const [experienceYears, setExperienceYears] = useState<number>(0);
  const [subjectsTaught, setSubjectsTaught] = useState<string[]>([]);
  const [qualifications, setQualifications] = useState<string[]>([]);
  const [newSubjectInput, setNewSubjectInput] = useState('');
  const [newQualificationInput, setNewQualificationInput] = useState('');
  const [isEnergyModalOpen, setIsEnergyModalOpen] = useState(false);
  const [isGuidanceModalOpen, setIsGuidanceModalOpen] = useState(false);
  const [energyTokens, setEnergyTokens] = useState<number>(() =>
    isExplore ? (defaultProfile?.energy_tokens ?? 108) : 0,
  );
  const [isContributingEnergy, setIsContributingEnergy] = useState(false);
  const [newLinkPlatform, setNewLinkPlatform] = useState('Website');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  // Load canonical demo persona for exploring and testing
  const handleLoadSamplePersona = () => {
    setProfileName(defaultProfile.display_name);
    setBio(defaultProfile.bio);
    setPhone(defaultProfile.phone);
    setUsername(defaultProfile.username);
    setAvatarUrl(defaultProfile.avatar_url);
    setSocialLinks(defaultProfile.social_links);
    setExperienceYears(defaultProfile.experience_years);
    setSubjectsTaught(defaultProfile.subjects_taught);
    setQualifications(defaultProfile.qualifications);
    setEnergyTokens(defaultProfile.energy_tokens);
    try {
      localStorage.setItem(
        'gurudevi_guest_profile_v1',
        JSON.stringify({
          name: defaultProfile.display_name,
          bio: defaultProfile.bio,
          phone: defaultProfile.phone,
          username: defaultProfile.username,
          avatarUrl: defaultProfile.avatar_url,
          socialLinks: defaultProfile.social_links,
          experienceYears: defaultProfile.experience_years,
          subjectsTaught: defaultProfile.subjects_taught,
          qualifications: defaultProfile.qualifications,
          energyTokens: defaultProfile.energy_tokens,
        }),
      );
    } catch {
      // storage fallback
    }
    triggerNotice(`Loaded sample persona for ${exploreRole.roleTitle}.`);
  };

  // Revert back to clean neutral sanctuary profile
  const handleResetToNeutral = () => {
    try {
      localStorage.removeItem('gurudevi_guest_profile_v1');
    } catch {
      // storage unavailable
    }
    setProfileName(displayName);
    setBio('');
    setPhone('');
    setUsername('');
    setAvatarUrl(null);
    setSocialLinks([]);
    setExperienceYears(0);
    setSubjectsTaught([]);
    setQualifications([]);
    setEnergyTokens(0);
    triggerNotice('Reverted to clean neutral sanctuary profile.');
  };

  // Reversible reset action for Explore mode
  const handleResetSamplePersona = () => {
    handleLoadSamplePersona();
  };

  // Initialize from localStorage in explore mode or load existing details from remote DB
  useEffect(() => {
    if (isExplore) {
      try {
        const cached = localStorage.getItem('gurudevi_guest_profile_v1');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed.name) setProfileName(parsed.name);
          if (parsed.bio !== undefined) setBio(parsed.bio);
          if (parsed.phone !== undefined) setPhone(parsed.phone);
          if (parsed.username !== undefined) setUsername(parsed.username);
          if (parsed.avatarUrl !== undefined) setAvatarUrl(parsed.avatarUrl);
          if (parsed.socialLinks) setSocialLinks(parsed.socialLinks);
          if (typeof parsed.experienceYears === 'number') setExperienceYears(parsed.experienceYears);
          if (Array.isArray(parsed.subjectsTaught)) setSubjectsTaught(parsed.subjectsTaught);
          if (Array.isArray(parsed.qualifications)) setQualifications(parsed.qualifications);
          if (typeof parsed.energyTokens === 'number') setEnergyTokens(parsed.energyTokens);
          return;
        }
      } catch {
        // Fall back to neutral state
      }
    } else if (accountId) {
      let isMounted = true;
      (async () => {
        try {
          const { createBrowserSupabaseClient } = await import('../../../lib/supabase/browser');
          const supabase = createBrowserSupabaseClient();
          if (!supabase) return;

          const { data: userRecord } = await supabase
            .from('users')
            .select('display_name, bio, phone, username, avatar_url, experience_years, subjects_taught, qualifications')
            .eq('id', accountId)
            .maybeSingle();

          if (isMounted && userRecord) {
            if (userRecord.display_name) setProfileName(userRecord.display_name);
            if (userRecord.bio) setBio(userRecord.bio);
            if (userRecord.phone) setPhone(userRecord.phone);
            if (userRecord.username) setUsername(userRecord.username);
            if (userRecord.avatar_url) setAvatarUrl(userRecord.avatar_url);
            if (typeof userRecord.experience_years === 'number') setExperienceYears(userRecord.experience_years);
            if (Array.isArray(userRecord.subjects_taught) && userRecord.subjects_taught.length > 0) {
              setSubjectsTaught(userRecord.subjects_taught);
            }
            if (Array.isArray(userRecord.qualifications) && userRecord.qualifications.length > 0) {
              setQualifications(userRecord.qualifications);
            }
          }

          const { data: remoteLinks } = await supabase
            .from('user_social_links')
            .select('platform, url')
            .eq('user_id', accountId)
            .order('order_index', { ascending: true });

          if (isMounted && remoteLinks && remoteLinks.length > 0) {
            setSocialLinks(
              remoteLinks.map((l: { platform: string; url: string }) => ({
                platform: l.platform,
                url: l.url,
              })),
            );
          }
        } catch (err: unknown) {
          console.warn('[ProfileFloor] Remote hydration skipped:', err);
        }
      })();

      return () => {
        isMounted = false;
      };
    }
  }, [isExplore, accountId]);

  // Dynamic Profile Calibration calculation
  const completionPercentage = useMemo(() => {
    let score = 25; // Base account & perspective established
    if (profileName.trim()) score += 20;
    if (bio.trim()) score += 20;
    if (phone.trim() || username.trim()) score += 15;
    if (avatarUrl) score += 10;
    if (socialLinks.length > 0) score += 10;
    return Math.min(100, score);
  }, [profileName, bio, phone, username, avatarUrl, socialLinks]);

  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Avatar image must be smaller than 2MB.');
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setAvatarUrl(previewUrl);

    if (isExplore) {
      try {
        const cached = localStorage.getItem('gurudevi_guest_profile_v1') || '{}';
        const parsed = JSON.parse(cached);
        parsed.avatarUrl = previewUrl;
        localStorage.setItem('gurudevi_guest_profile_v1', JSON.stringify(parsed));
      } catch {
        // Local storage full or private browsing
      }
      triggerNotice('Avatar preview updated in guest sandbox.');
    } else {
      triggerNotice('Avatar selected. Click Save to persist.');
    }
  };

  const handleAddSubject = () => {
    if (!newSubjectInput.trim()) return;
    const updated = [...subjectsTaught, newSubjectInput.trim()];
    setSubjectsTaught(updated);
    setNewSubjectInput('');
  };

  const handleRemoveSubject = (idx: number) => {
    setSubjectsTaught(subjectsTaught.filter((_, i) => i !== idx));
  };

  const handleAddQualification = () => {
    if (!newQualificationInput.trim()) return;
    const updated = [...qualifications, newQualificationInput.trim()];
    setQualifications(updated);
    setNewQualificationInput('');
  };

  const handleRemoveQualification = (idx: number) => {
    setQualifications(qualifications.filter((_, i) => i !== idx));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    if (isExplore) {
      try {
        const payload = {
          name: profileName,
          bio,
          phone,
          username,
          avatarUrl,
          socialLinks,
          experienceYears,
          subjectsTaught,
          qualifications,
          energyTokens,
        };
        localStorage.setItem('gurudevi_guest_profile_v1', JSON.stringify(payload));
      } catch {
        // Local storage full
      }
      setIsSaving(false);
      setIsEditing(false);
      triggerNotice('Guest sandbox profile saved successfully!');
      return;
    }

    // Sanctuary authenticated save
    try {
      const { createBrowserSupabaseClient } = await import('../../../lib/supabase/browser');
      const supabase = createBrowserSupabaseClient();
      if (supabase && accountId) {
        const { error } = await supabase
          .from('users')
          .update({
            display_name: profileName,
            bio: bio || null,
            phone: phone || null,
            username: username || null,
            avatar_url: avatarUrl || null,
            experience_years: experienceYears,
            subjects_taught: subjectsTaught,
            qualifications: qualifications,
          })
          .eq('id', accountId);

        if (error) {
          throw error;
        }

        // Sync social links
        try {
          await supabase.from('user_social_links').delete().eq('user_id', accountId);
          if (socialLinks.length > 0) {
            const rows = socialLinks.map((link, idx) => ({
              user_id: accountId,
              platform: link.platform,
              url: link.url,
              order_index: idx,
            }));
            await supabase.from('user_social_links').insert(rows);
          }
        } catch (linkErr) {
          console.warn('[ProfileFloor] Social links sync warning:', linkErr);
        }
      }
      triggerNotice('Profile saved to your personal sanctuary!');
      setIsEditing(false);
    } catch (err: unknown) {
      console.warn('[ProfileFloor] Save failed:', err);
      triggerNotice('Could not persist to cloud. Changes kept locally.');
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddSocialLink = () => {
    if (!newLinkUrl.trim()) return;
    const updated = [...socialLinks, { platform: newLinkPlatform, url: newLinkUrl.trim() }];
    setSocialLinks(updated);
    setNewLinkUrl('');
    if (isExplore) {
      try {
        const cached = localStorage.getItem('gurudevi_guest_profile_v1') || '{}';
        const parsed = JSON.parse(cached);
        parsed.socialLinks = updated;
        localStorage.setItem('gurudevi_guest_profile_v1', JSON.stringify(parsed));
      } catch {
        // storage fallback
      }
    }
    triggerNotice('Social link added.');
  };

  const handleRemoveSocialLink = (index: number) => {
    const updated = socialLinks.filter((_, i) => i !== index);
    setSocialLinks(updated);
    if (isExplore) {
      try {
        const cached = localStorage.getItem('gurudevi_guest_profile_v1') || '{}';
        const parsed = JSON.parse(cached);
        parsed.socialLinks = updated;
        localStorage.setItem('gurudevi_guest_profile_v1', JSON.stringify(parsed));
      } catch {
        // storage fallback
      }
    }
  };

  const triggerNotice = (msg: string) => {
    setFeedbackNotice(msg);
    setTimeout(() => setFeedbackNotice(null), 3000);
  };

  return (
    <SanctuaryFloorCanvas
      appearance={canvas.appearance}
      domain="profile"
      furnitureItems={PROFILE_FURNITURE_ITEMS}
      setAppearance={canvas.setAppearance}
      titleId="profile-title"
    >
      {({ isModuleVisible }) => (
        <div
          className={styles.profile}
          data-appearance={canvas.appearance.preset}
          data-domain="profile"
          data-motion={canvas.appearance.motion}
        >
          {isModuleVisible('profile-intro') && (
            <header className={styles.intro}>
              <p className={styles.eyebrow}>Profile</p>
              <h1 id="profile-title">Your Sanctuary Persona</h1>
              <p>
                {profileName}, manage your verified credentials, workspace atmosphere, and account safety.
              </p>
            </header>
          )}

          {feedbackNotice && (
            <div
              role="status"
              style={{
                marginTop: '1rem',
                padding: '0.65rem 1rem',
                borderRadius: '0.5rem',
                background: 'var(--paper-light, #fdf6ec)',
                border: '1px solid var(--color-action, #9a5b2d)',
                color: 'var(--color-action, #744321)',
                fontWeight: 600,
                fontSize: '0.85rem',
              }}
            >
              ✓ {feedbackNotice}
            </div>
          )}

          {isModuleVisible('profile-stage') && (
            <div className={styles.masterDetailLayout}>
              {/* Mobile quick-switch pills */}
              <div className={styles.mobileSectionPills} role="tablist" aria-label="Profile sections">
                {canvas.sections.map((section) => (
                  <button
                    key={section}
                    type="button"
                    role="tab"
                    aria-selected={activeSection === section}
                    className={`${styles.mobilePill} ${activeSection === section ? styles.mobilePillActive : ''}`}
                    onClick={() => setActiveSection(section)}
                  >
                    {SECTION_LABELS[section].icon} {SECTION_LABELS[section].label}
                  </button>
                ))}
              </div>

              {/* Desktop / Tablet rail */}
              <aside className={styles.sectionsRail} aria-label="Profile navigation rail">
                <span className={styles.sectionsRailTitle}>Sections & Focus</span>
                {canvas.sections.map((section) => (
                  <button
                    key={section}
                    type="button"
                    className={`${styles.railItem} ${activeSection === section ? styles.railItemActive : ''}`}
                    onClick={() => setActiveSection(section)}
                  >
                    <span>{SECTION_LABELS[section].icon}</span>
                    <span>{SECTION_LABELS[section].label}</span>
                  </button>
                ))}

                <div style={{ margin: '0.85rem 0 0.5rem', borderTop: '1px solid #eee2d8' }} />

                <span className={styles.sectionsRailTitle}>Living Passport</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <button
                    type="button"
                    className={styles.quickBtn}
                    style={{ width: '100%', justifyContent: 'flex-start' }}
                    onClick={() => setIsEnergyModalOpen(true)}
                  >
                    ⚡ Reservoir ({energyTokens} NT)
                  </button>
                  <button
                    type="button"
                    className={styles.quickBtn}
                    style={{ width: '100%', justifyContent: 'flex-start' }}
                    onClick={() => {
                      const targetUrl = isExplore
                        ? 'https://explore.gurudevi.app'
                        : `https://gurudevi.app/profile/${accountId}`;
                      if (navigator.clipboard?.writeText) {
                        void navigator.clipboard.writeText(targetUrl);
                        triggerNotice('Pass link copied to clipboard!');
                      }
                    }}
                  >
                    🪪 Share Sanctuary Pass
                  </button>
                  <button
                    type="button"
                    className={styles.quickBtn}
                    style={{ width: '100%', justifyContent: 'flex-start' }}
                    onClick={() => setClaimModalOpen(true)}
                  >
                    🌸 Claim Thuthimal
                  </button>
                </div>
              </aside>

              {/* Stage */}
              <main className={styles.activeSectionStage}>
                {activeSection === 'identity' && (
                  <section className={styles.identity} aria-label="Verified profile identity">
                    <div className={styles.avatarContainer}>
                      <label
                        htmlFor="avatar-file-input"
                        className={styles.avatarCircle}
                        style={{ cursor: 'pointer' }}
                        title="Click to change avatar"
                        aria-label="Upload profile avatar"
                      >
                        {avatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={avatarUrl} alt={profileName} className={styles.avatarImg} />
                        ) : (
                          <span>👤</span>
                        )}
                      </label>
                      <input
                        id="avatar-file-input"
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        style={{ display: 'none' }}
                        onChange={handleAvatarFile}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                          <div>
                            <strong style={{ fontSize: '1.2rem', color: 'var(--ink, #2d2018)' }}>{profileName}</strong>
                            <p style={{ margin: '0.15rem 0 0', color: 'var(--ink-soft, #74675d)', fontSize: '0.85rem' }}>
                              {isExplore ? 'Guest Explorer' : primaryScopeRole}
                            </p>
                          </div>
                          <button
                            type="button"
                            className={styles.copyQrBtn}
                            onClick={() => setIsEditing(!isEditing)}
                          >
                            {isEditing ? 'Cancel Edit' : '✏️ Edit Profile'}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Quick Navigation Shortcuts Bar */}
                    <div className={styles.quickActionsBar} role="navigation" aria-label="Profile Shortcuts">
                      <Link href="/settings" className={styles.quickBtn}>
                        ⚙️ Sanctuary Settings
                      </Link>
                      <Link href="/profile/security" className={styles.quickBtn}>
                        🛡️ Device & Security Floor
                      </Link>
                      <a
                        href={isExplore ? 'https://explore.gurudevi.app' : `https://gurudevi.app/profile/public/${username || accountId}`}
                        target="_blank"
                        rel="noreferrer"
                        className={styles.quickBtn}
                      >
                        🌐 Public Preview ↗
                      </a>
                      <button
                        type="button"
                        className={`${styles.quickBtn} ${styles.quickBtnPrimary}`}
                        onClick={() => setIsEnergyModalOpen(true)}
                      >
                        ⚡ Energy Reservoir ({energyTokens} Tokens)
                      </button>
                      {isExplore && (
                        <button
                          type="button"
                          className={styles.quickBtn}
                          style={{
                            background: 'var(--color-sanctuary-saffron, #a85022)',
                            color: '#fff',
                            borderColor: 'var(--color-sanctuary-saffron, #a85022)',
                            fontWeight: 700,
                          }}
                          onClick={() => setIsGuidanceModalOpen(true)}
                        >
                          🪷 Step into Sanctuary (Create Account)
                        </button>
                      )}
                    </div>

                    {isEditing && (
                      <form onSubmit={handleSaveProfile} className={styles.editModeForm} aria-label="Edit Profile Form">
                        <div className={styles.formField}>
                          <label htmlFor="edit-name">Display Name</label>
                          <input
                            id="edit-name"
                            className={styles.formInput}
                            type="text"
                            value={profileName}
                            onChange={(e) => setProfileName(e.target.value)}
                            required
                          />
                        </div>
                        <div className={styles.formField}>
                          <label htmlFor="edit-username">Sanctuary Username</label>
                          <input
                            id="edit-username"
                            className={styles.formInput}
                            type="text"
                            placeholder="@username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                          />
                        </div>
                        <div className={`${styles.formField} ${styles.formFieldFull}`}>
                          <label htmlFor="edit-bio">Pedagogical Bio & Contemplative Focus</label>
                          <textarea
                            id="edit-bio"
                            className={styles.formTextarea}
                            rows={3}
                            placeholder="Share your teaching philosophy, learning aspirations, or mindfulness practice..."
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                          />
                        </div>
                        <div className={styles.formField}>
                          <label htmlFor="edit-phone">Contact Phone</label>
                          <input
                            id="edit-phone"
                            className={styles.formInput}
                            type="tel"
                            placeholder="+94 7X XXX XXXX"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                          />
                        </div>
                        <div className={styles.formField}>
                          <label htmlFor="edit-exp">Experience (Years)</label>
                          <input
                            id="edit-exp"
                            className={styles.formInput}
                            type="number"
                            min="0"
                            max="60"
                            value={experienceYears}
                            onChange={(e) => setExperienceYears(parseInt(e.target.value, 10) || 0)}
                          />
                        </div>
                        <div className={styles.formField}>
                          <label htmlFor="edit-subj">Add Subject / Discipline</label>
                          <div style={{ display: 'flex', gap: '0.4rem' }}>
                            <input
                              id="edit-subj"
                              className={styles.formInput}
                              type="text"
                              placeholder="e.g. Science"
                              value={newSubjectInput}
                              onChange={(e) => setNewSubjectInput(e.target.value)}
                            />
                            <button type="button" className={styles.copyQrBtn} onClick={handleAddSubject}>+ Add</button>
                          </div>
                        </div>
                        <div className={styles.formField}>
                          <label htmlFor="edit-qual">Add Qualification / Accreditation</label>
                          <div style={{ display: 'flex', gap: '0.4rem' }}>
                            <input
                              id="edit-qual"
                              className={styles.formInput}
                              type="text"
                              placeholder="e.g. M.Ed, B.A"
                              value={newQualificationInput}
                              onChange={(e) => setNewQualificationInput(e.target.value)}
                            />
                            <button type="button" className={styles.copyQrBtn} onClick={handleAddQualification}>+ Add</button>
                          </div>
                        </div>
                        <div className={styles.formFieldFull} style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                          <button
                            type="submit"
                            disabled={isSaving}
                            className={styles.copyQrBtn}
                            style={{ background: 'var(--color-action, #9a5b2d)', color: '#fff', border: 'none', padding: '0.5rem 1.25rem' }}
                          >
                            {isSaving ? 'Saving…' : 'Save Changes'}
                          </button>
                          <button
                            type="button"
                            className={styles.copyQrBtn}
                            onClick={() => setIsEditing(false)}
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    )}

                    {isExplore && (
                      <div
                        style={{
                          padding: '1rem',
                          marginBottom: '1.25rem',
                          borderRadius: '0.75rem',
                          background: 'var(--paper-light)',
                          border: '1px solid var(--line)',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                          <strong style={{ fontSize: '0.9rem' }}>
                            🪷 Guest Explorer Sandbox · {exploreRole.roleTitle} Lens
                          </strong>
                          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                            <button
                              type="button"
                              onClick={handleLoadSamplePersona}
                              style={{
                                background: 'var(--paper)',
                                border: '1px solid var(--color-action, #9a5b2d)',
                                borderRadius: '999px',
                                padding: '0.2rem 0.65rem',
                                fontSize: '0.75rem',
                                color: 'var(--color-action, #9a5b2d)',
                                fontWeight: 650,
                                cursor: 'pointer',
                              }}
                              title="Populate active role demo persona for interactive testing"
                            >
                              ✨ Populate Sample Persona
                            </button>
                            <button
                              type="button"
                              onClick={handleResetToNeutral}
                              style={{
                                background: 'none',
                                border: '1px solid var(--line)',
                                borderRadius: '999px',
                                padding: '0.2rem 0.65rem',
                                fontSize: '0.75rem',
                                color: 'var(--ink-soft)',
                                cursor: 'pointer',
                              }}
                              title="Clear all fields back to clean sovereign sanctuary state"
                            >
                              🔄 Revert to Neutral
                            </button>
                            <button
                              type="button"
                              onClick={handleResetSamplePersona}
                              style={{
                                background: 'none',
                                border: '1px solid var(--line)',
                                borderRadius: '999px',
                                padding: '0.2rem 0.65rem',
                                fontSize: '0.75rem',
                                color: 'var(--ink-soft)',
                                cursor: 'pointer',
                              }}
                              title="Revert all local sandbox edits to canonical demo persona"
                            >
                              🔄 Reset Sample Persona
                            </button>
                          </div>
                        </div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--ink-soft)', margin: '0 0 0.75rem' }}>
                          Exploring sample profile and curricular desk. Your sample activity stays private on this device.
                        </p>
                        <CapacityPerspectiveSwitcher mode="explore" />
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
                          <Link
                            href="https://sanctuary.gurudevi.app/login"
                            style={{
                              padding: '0.35rem 0.85rem',
                              borderRadius: '999px',
                              background: 'var(--color-sanctuary-saffron, #a85022)',
                              color: '#fff',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              textDecoration: 'none',
                              display: 'inline-flex',
                              alignItems: 'center',
                            }}
                          >
                            Go to Sanctuary ↗
                          </Link>
                          <button
                            type="button"
                            onClick={() => setIsGuidanceModalOpen(true)}
                            style={{
                              padding: '0.35rem 0.85rem',
                              borderRadius: '999px',
                              background: 'color-mix(in srgb, var(--paper) 60%, var(--line))',
                              color: 'var(--ink)',
                              fontSize: '0.75rem',
                              fontWeight: 650,
                              border: '1px solid var(--line)',
                              cursor: 'pointer',
                            }}
                          >
                            Step into Sanctuary (Create Account) ↗
                          </button>
                          <Link
                            href="/welcome"
                            style={{
                              padding: '0.35rem 0.85rem',
                              borderRadius: '999px',
                              background: 'color-mix(in srgb, var(--paper) 60%, var(--line))',
                              color: 'var(--ink)',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              textDecoration: 'none',
                            }}
                          >
                            Welcome Gate →
                          </Link>
                          <Link
                            href="/community"
                            style={{
                              padding: '0.35rem 0.85rem',
                              borderRadius: '999px',
                              background: 'color-mix(in srgb, var(--paper) 60%, var(--line))',
                              color: 'var(--ink)',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              textDecoration: 'none',
                            }}
                          >
                            Explore Circles →
                          </Link>
                          <Link
                            href="/library"
                            style={{
                              padding: '0.35rem 0.85rem',
                              borderRadius: '999px',
                              background: 'color-mix(in srgb, var(--paper) 60%, var(--line))',
                              color: 'var(--ink)',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              textDecoration: 'none',
                            }}
                          >
                            Explore Library →
                          </Link>
                        </div>
                      </div>
                    )}
                    <dl>
                      <div>
                        <dt>Display name</dt>
                        <dd>{profileName}</dd>
                      </div>
                      {bio && (
                        <div>
                          <dt>Contemplative bio</dt>
                          <dd style={{ fontSize: '0.95rem', fontWeight: 500, lineHeight: 1.5 }}>{bio}</dd>
                        </div>
                      )}
                      <div>
                        <dt>Selected sanctuary role</dt>
                        <dd>{isExplore ? exploreRole.roleTitle : primaryScopeRole}</dd>
                      </div>
                      <div>
                        <dt>Account ID</dt>
                        <dd>{isExplore ? 'Browser Local Session' : accountId}</dd>
                      </div>
                    </dl>
                    <p className={styles.readOnly} role="note">
                      {isExplore
                        ? 'Guest sandbox mode. All reflections and notes are stored locally.'
                        : 'Verified identity secured by Gurudevi Sanctuary.'}
                    </p>

                    {/* Dynamic Profile Calibration Progress */}
                    <div className={styles.completionCard}>
                      <div className={styles.completionHeader}>
                        <span className={styles.completionTitle}>Profile Calibration Progress</span>
                        <span className={styles.completionPercent}>{completionPercentage}%</span>
                      </div>
                      <div className={styles.completionTrack}>
                        <div className={styles.completionFill} style={{ width: `${completionPercentage}%` }} />
                      </div>
                      <div className={styles.completionSteps}>
                        <span>✓ Persona &amp; Identity established</span>
                        <span>{bio.trim() ? '✓' : '○'} Pedagogical reflection &amp; focus documented</span>
                        <span>{phone.trim() || username.trim() ? '✓' : '○'} Contact and handle verified</span>
                        <span>{avatarUrl ? '✓' : '○'} Visual avatar established</span>
                        <span>{socialLinks.length > 0 ? '✓' : '○'} Collaborative links attached</span>
                        {isExplore && (
                          <span
                            onClick={() => setIsGuidanceModalOpen(true)}
                            style={{ cursor: 'pointer', textDecoration: 'underline' }}
                          >
                            ○ Complete permanent Sanctuary enrollment ↗
                          </span>
                        )}
                      </div>
                    </div>

                    <div className={styles.statsGrid}>
                      <div className={styles.statCard}>
                        <div className={styles.statNumber}>
                          {isExplore ? defaultProfile.stats.circles_visited : 0}
                        </div>
                        <div className={styles.statLabel}>Circles Visited</div>
                      </div>
                      <div className={styles.statCard}>
                        <div className={styles.statNumber}>
                          {isExplore ? `${defaultProfile.stats.mindful_streak_days}d` : '0d'}
                        </div>
                        <div className={styles.statLabel}>Mindful Streak</div>
                      </div>
                      <div className={styles.statCard}>
                        <div className={styles.statNumber}>
                          {isExplore ? defaultProfile.stats.journals_released : 0}
                        </div>
                        <div className={styles.statLabel}>Journal Released</div>
                      </div>
                    </div>

                    {/* Social Links Linktree */}
                    <div className={styles.linktreeCard}>
                      <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.9rem', color: 'var(--ink, #2d2018)' }}>
                        Connected Linktree &amp; Circles
                      </h4>
                      {socialLinks.length === 0 ? (
                        <p style={{ fontSize: '0.8rem', color: 'var(--ink-soft, #74675d)', margin: '0 0 0.75rem' }}>
                          No collaborative social links added yet.
                        </p>
                      ) : (
                        <div className={styles.linktreeGrid}>
                          {socialLinks.map((link, idx) => (
                            <div key={idx} className={styles.linktreeItem}>
                              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                🔗 {link.platform}: {link.url}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleRemoveSocialLink(idx)}
                                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-danger, #b23b3b)' }}
                                title="Remove link"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                        <select
                          className={styles.formInput}
                          style={{ padding: '0.35rem 0.5rem', fontSize: '0.8rem' }}
                          value={newLinkPlatform}
                          onChange={(e) => setNewLinkPlatform(e.target.value)}
                        >
                          <option value="Website">Website</option>
                          <option value="LinkedIn">LinkedIn</option>
                          <option value="GitHub">GitHub</option>
                          <option value="Twitter">Twitter/X</option>
                          <option value="YouTube">YouTube</option>
                        </select>
                        <input
                          type="url"
                          placeholder="https://..."
                          className={styles.formInput}
                          style={{ flex: 1, minWidth: '160px', padding: '0.35rem 0.5rem', fontSize: '0.8rem' }}
                          value={newLinkUrl}
                          onChange={(e) => setNewLinkUrl(e.target.value)}
                        />
                        <button
                          type="button"
                          className={styles.copyQrBtn}
                          onClick={handleAddSocialLink}
                        >
                          + Add Link
                        </button>
                      </div>
                    </div>

                    {isExplore && defaultProfile.focus_areas && defaultProfile.focus_areas.length > 0 && (
                      <div className={styles.tagsSection}>
                        <div className={styles.tagsTitle}>Pedagogical Focus Areas &amp; Circles</div>
                        <div className={styles.tagsRow}>
                          {defaultProfile.focus_areas.map((tag: string, idx: number) => (
                            <span key={idx} className={styles.tagPill}>
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {isExplore && defaultProfile.custom_badges && defaultProfile.custom_badges.length > 0 && (
                      <div className={styles.tagsSection} style={{ marginTop: '1rem' }}>
                        <div className={styles.tagsTitle}>🏅 Verified Role Badges &amp; Accreditations</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.4rem' }}>
                          {defaultProfile.custom_badges.map((badge: any) => (
                            <div
                              key={badge.id}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.4rem 0.75rem',
                                background: 'color-mix(in srgb, var(--paper) 70%, var(--line))',
                                border: '1px solid var(--line)',
                                borderRadius: '0.5rem',
                                fontSize: '0.8rem',
                              }}
                            >
                              <span style={{ fontSize: '1.1rem' }}>{badge.icon}</span>
                              <div>
                                <strong style={{ color: 'var(--ink)' }}>{badge.label}</strong>
                                <span style={{ color: 'var(--ink-soft)', marginLeft: '0.5rem' }}>· {badge.description}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Saved Library Materials & Learning Desk (Explore Sandbox Showcase) */}
                    {isExplore && (
                      <div className={styles.linktreeCard} style={{ marginTop: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                          <h4 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--ink, #2d2018)' }}>
                            📚 Sample Library Desk &amp; Curations
                          </h4>
                          <Link
                            href="/library"
                            style={{ fontSize: '0.75rem', fontWeight: 650, color: 'var(--color-action, #a85022)', textDecoration: 'none' }}
                          >
                            Open Library →
                          </Link>
                        </div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--ink-soft, #74675d)', margin: '0 0 0.75rem' }}>
                          Curricular circulars, field guides, and video lectures bookmarked for sample practice.
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                          <Link
                            href="/library/reader/mangroves"
                            className={styles.linktreeItem}
                            style={{ textDecoration: 'none' }}
                          >
                            <span style={{ flex: 1, fontSize: '0.825rem', color: 'var(--ink)' }}>
                              📖 Field Guide to Sri Lankan Mangrove Ecosystems
                            </span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--color-action, #a85022)', fontWeight: 600 }}>
                              Page 1 • Continue
                            </span>
                          </Link>
                          <Link
                            href="/library/video/intro-botany"
                            className={styles.linktreeItem}
                            style={{ textDecoration: 'none' }}
                          >
                            <span style={{ flex: 1, fontSize: '0.825rem', color: 'var(--ink)' }}>
                              🎬 Field Botany: Identifying Endemic Wet-Zone Plants
                            </span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--color-action, #a85022)', fontWeight: 600 }}>
                              Video Lecture
                            </span>
                          </Link>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                          <Link
                            href="/library/contribute"
                            className={styles.copyQrBtn}
                            style={{ textDecoration: 'none', fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
                          >
                            + Contribute New Material
                          </Link>
                          <Link
                            href="/library/tools"
                            className={styles.copyQrBtn}
                            style={{ textDecoration: 'none', fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
                          >
                            🛠️ Launch Knowledge Tools
                          </Link>
                        </div>
                      </div>
                    )}

                    <div className={styles.qrExplorationCard}>
                      {/* Decorative SVG Pass QR */}
                      <svg
                        width="72"
                        height="72"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="var(--color-action, #9a5b2d)"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ background: 'var(--paper-light, #faf3e6)', padding: '6px', borderRadius: '8px', flexShrink: 0 }}
                        aria-label="Sanctuary Pass QR"
                      >
                        <rect width="5" height="5" x="3" y="3" rx="1" />
                        <rect width="5" height="5" x="16" y="3" rx="1" />
                        <rect width="5" height="5" x="3" y="16" rx="1" />
                        <path d="M21 16h-3a2 2 0 0 0-2 2v3" />
                        <path d="M21 21v.01" />
                        <path d="M12 7v3a2 2 0 0 1-2 2H7" />
                        <path d="M3 12h.01" />
                        <path d="M12 3h.01" />
                        <path d="M12 16v.01" />
                        <path d="M16 12h1" />
                        <path d="M21 12v.01" />
                        <path d="M12 21v-1" />
                      </svg>
                      <div className={styles.qrContent}>
                        <h4 className={styles.qrTitle}>Living Sanctuary Exploration Pass</h4>
                        <p className={styles.qrDesc}>
                          {isExplore
                            ? 'Share your guest exploration pass with colleagues to collaborate in sample mode.'
                            : 'Your unique sanctuary passport. Share to let peers verify your accredited learning journey.'}
                        </p>
                        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                          <button
                            type="button"
                            className={styles.copyQrBtn}
                            onClick={() => {
                              const targetUrl = isExplore
                                ? 'https://explore.gurudevi.app'
                                : `https://gurudevi.app/profile/${accountId}`;
                              if (navigator.clipboard?.writeText) {
                                void navigator.clipboard.writeText(targetUrl);
                                triggerNotice('Pass link copied to clipboard!');
                              }
                            }}
                          >
                            Copy Pass Link ↗
                          </button>
                          <button
                            type="button"
                            className={styles.copyQrBtn}
                            style={{
                              backgroundColor: 'rgba(168, 80, 34, 0.1)',
                              color: 'var(--color-action, #a85022)',
                              borderColor: 'var(--color-action, #a85022)',
                            }}
                            onClick={() => setClaimModalOpen(true)}
                          >
                            🌸 Claim Thuthimal Gift
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Professional Credentials Card */}
                    <div className={styles.credentialsCard}>
                      <div className={styles.credentialsTitle}>
                        <span>🎓</span>
                        <span>Professional Credentials &amp; Pedagogical Scope</span>
                      </div>
                      <div style={{ marginBottom: '0.75rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--ink-soft)', textTransform: 'uppercase' }}>
                          Experience &amp; Tenure
                        </span>
                        <p style={{ margin: '0.25rem 0 0', fontSize: '0.9rem', fontWeight: 600, color: 'var(--ink)' }}>
                          {experienceYears} years of accredited contemplative teaching &amp; mentoring
                        </p>
                      </div>
                      <div style={{ marginBottom: '0.75rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--ink-soft)', textTransform: 'uppercase' }}>
                          Subjects &amp; Disciplines
                        </span>
                        <div className={styles.badgeRow} style={{ marginTop: '0.35rem' }}>
                          {subjectsTaught.map((subject, idx) => (
                            <span key={idx} className={styles.subjectBadge}>
                              📖 {subject}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--ink-soft)', textTransform: 'uppercase' }}>
                          Accreditations &amp; Qualifications
                        </span>
                        <div className={styles.badgeRow} style={{ marginTop: '0.35rem' }}>
                          {qualifications.map((qual, idx) => (
                            <span key={idx} className={styles.certBadge}>
                              🎓 {qual}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Living Journey & Milestones Panel */}
                    <div className={styles.journeyCard}>
                      <div className={styles.journeyTitle}>
                        <span>🧭</span>
                        <span>Living Journey &amp; Sanctuary Milestones</span>
                      </div>
                      <p style={{ margin: '0 0 0.75rem', fontSize: '0.85rem', color: 'var(--ink-soft)' }}>
                        Continuous reflection trajectory across daily cycles, peer resonance, and accredited inquiries.
                      </p>
                      <div className={styles.timelineList}>
                        <div className={styles.timelineItem}>
                          <div>
                            <div className={styles.timelineDate}>Milestone · Verified Today</div>
                            <strong>Mindful Presence Streak (5 Days)</strong>
                            <p style={{ margin: '0.2rem 0 0', color: 'var(--ink-soft)' }}>Maintained daily contemplation across morning dawn and evening wind-down.</p>
                          </div>
                        </div>
                        <div className={styles.timelineItem}>
                          <div>
                            <div className={styles.timelineDate}>Milestone · Circle Contribution</div>
                            <strong>Resonance in 3 Learning Circles</strong>
                            <p style={{ margin: '0.2rem 0 0', color: 'var(--ink-soft)' }}>Active peer dialogue in Mindful Pedagogies and Forest Learning groups.</p>
                          </div>
                        </div>
                        <div className={styles.timelineItem}>
                          <div>
                            <div className={styles.timelineDate}>Accreditation · Identity Sealed</div>
                            <strong>Sanctuary Citizen Credential Established</strong>
                            <p style={{ margin: '0.2rem 0 0', color: 'var(--ink-soft)' }}>Cryptographically bound to canonical UUIDv8 account identity.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>
                )}

                {activeSection === 'settings' && (
                  <section
                    className={styles.atmosphereSettings}
                    aria-label="Atmosphere and motion settings"
                  >
                    <h2>Workspace Atmosphere</h2>
                    <p>Choose the ambient tone and particle backdrop for your sanctuary floors.</p>

                    <div className={styles.presetGrid}>
                      {PRESET_OPTIONS.map((preset) => (
                        <button
                          key={preset.id}
                          type="button"
                          className={`${styles.presetButton} ${canvas.appearance.preset === preset.id ? styles.presetButtonActive : ''}`}
                          onClick={() =>
                            void canvas.setAppearance({
                              preset: preset.id,
                              motion: canvas.appearance.motion,
                            })
                          }
                        >
                          <span>{preset.label}</span>
                          <small>{preset.description}</small>
                        </button>
                      ))}
                    </div>

                    <div className={styles.motionRow}>
                      <div>
                        <strong>Particle Motion</strong>
                        <p>Ambient floating particles responding to the selected preset.</p>
                      </div>
                      <button
                        type="button"
                        className={`${styles.motionToggle} ${canvas.appearance.motion === 'subtle' ? styles.motionToggleActive : ''}`}
                        onClick={() =>
                          void canvas.setAppearance({
                            preset: canvas.appearance.preset,
                            motion: canvas.appearance.motion === 'subtle' ? 'off' : 'subtle',
                          })
                        }
                      >
                        {canvas.appearance.motion === 'subtle' ? 'Motion: On' : 'Motion: Off'}
                      </button>
                    </div>
                  </section>
                )}

                {activeSection === 'security' && (
                  <section className={styles.deletion} aria-label="Security and account deletion">
                    <h2>Account Safety & Data</h2>
                    {isExplore ? (
                      <div
                        style={{
                          padding: '1.25rem',
                          background: 'var(--paper-light)',
                          borderRadius: '0.75rem',
                          border: '1px solid var(--line)',
                        }}
                      >
                        <h3 style={{ margin: '0 0 0.5rem', fontSize: '1rem' }}>
                          Zero Cloud Telemetry Guarantee
                        </h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--ink-soft)', lineHeight: 1.6, margin: '0 0 1rem' }}>
                          Under Sri Lanka PDPA No. 9 of 2022, no personal biometric or learning data is uploaded to remote cloud databases during public exploration.
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm('Reset all local guest session data and cached preferences?')) {
                              localStorage.clear();
                              window.location.reload();
                            }
                          }}
                          style={{
                            padding: '0.45rem 1rem',
                            borderRadius: '0.5rem',
                            border: '1px solid var(--color-danger, #b23b3b)',
                            background: 'transparent',
                            color: 'var(--color-danger, #b23b3b)',
                            fontWeight: 600,
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                          }}
                        >
                          Purge Local Guest Storage
                        </button>
                      </div>
                    ) : (
                      <>
                        <p>
                          Manage your credentials or request permanent deletion of your account and all
                          associated sanctuary history.
                        </p>
                        <p><Link href="/sign-in">Switch account</Link></p>
                        <AccountSignOut />
                        <AccountDeletionControl />
                      </>
                    )}
                  </section>
                )}
              </main>
            </div>
          )}
          <ThuthimalClaimModal
            isOpen={claimModalOpen}
            onClose={() => setClaimModalOpen(false)}
          />
          <CreateAccountGuidanceModal
            isOpen={isGuidanceModalOpen}
            onClose={() => setIsGuidanceModalOpen(false)}
            exploreRoleTitle={exploreRole.roleTitle}
          />
          {isEnergyModalOpen && (
            <div
              className={styles.energyModalBackdrop}
              role="dialog"
              aria-modal="true"
              aria-labelledby="energy-modal-title"
              onClick={() => setIsEnergyModalOpen(false)}
            >
              <div
                className={styles.energyModal}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h2 id="energy-modal-title" style={{ margin: 0, fontSize: '1.25rem', color: '#2d2018', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>⚡</span> Negentropy Living Energy Reservoir
                  </h2>
                  <button
                    type="button"
                    onClick={() => setIsEnergyModalOpen(false)}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '1.25rem',
                      cursor: 'pointer',
                      color: '#74675d',
                    }}
                    aria-label="Close reservoir dialog"
                  >
                    ✕
                  </button>
                </div>

                <p style={{ fontSize: '0.88rem', color: '#74675d', lineHeight: 1.5, margin: '0 0 1.25rem' }}>
                  Negentropy represents stored communal attention, mindful feedback, and pedagogical vitality. Tokens regenerate through contemplative reflection and active participation.
                </p>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1rem 1.25rem',
                    background: 'rgba(154, 91, 45, 0.08)',
                    border: '1px solid rgba(154, 91, 45, 0.25)',
                    borderRadius: '0.75rem',
                    marginBottom: '1.25rem',
                  }}
                >
                  <div>
                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#74675d', fontWeight: 700 }}>
                      Active Reservoir Balance
                    </span>
                    <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#9a5b2d' }}>
                      {energyTokens} <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Joules (NT)</span>
                    </div>
                  </div>
                  <div style={{ fontSize: '2rem' }}>🌿</div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  <h4 style={{ margin: 0, fontSize: '0.85rem', color: '#2d2018', fontWeight: 700 }}>Contribute Vitality</h4>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {[5, 10, 25].map((amount) => (
                      <button
                        key={amount}
                        type="button"
                        disabled={isContributingEnergy || energyTokens < amount}
                        onClick={async () => {
                          setIsContributingEnergy(true);
                          try {
                            const updated = energyTokens - amount;
                            setEnergyTokens(updated);
                            if (isExplore) {
                              try {
                                const cached = localStorage.getItem('gurudevi_guest_profile_v1') || '{}';
                                const parsed = JSON.parse(cached);
                                parsed.energyTokens = updated;
                                localStorage.setItem('gurudevi_guest_profile_v1', JSON.stringify(parsed));
                              } catch {
                                // storage fallback
                              }
                            }
                            triggerNotice(`Pledged ${amount} NT to communal circle reservoir!`);
                          } finally {
                            setIsContributingEnergy(false);
                          }
                        }}
                        className={styles.quickBtn}
                        style={{ flex: 1, textAlign: 'center', justifyContent: 'center' }}
                      >
                        +{amount} NT
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => setIsEnergyModalOpen(false)}
                    className={styles.copyQrBtn}
                    style={{ padding: '0.5rem 1rem' }}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </SanctuaryFloorCanvas>
  );
}
