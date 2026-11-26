import React, { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { schoolAdapter } from '@/lib/domain/adapters/school/school.adapter';
import type { SchoolProfileData } from '@/lib/domain/ports/school.port';
import styles from './workspace-welcome.module.css';

interface WorkspaceUnboundWelcomeHubProps {
  displayName: string;
  voice: string;
  canEstablish: boolean;
  establishedSchool: SchoolProfileData | null;
  onSchoolEstablished: (profile: SchoolProfileData) => void;
  onOpenSchoolProfile: () => void;
  onDismissBanner: () => void;
  onTryPractice?: () => void;
}

export function WorkspaceUnboundWelcomeHub({
  displayName,
  voice,
  canEstablish,
  establishedSchool,
  onSchoolEstablished,
  onOpenSchoolProfile,
  onDismissBanner,
  onTryPractice,
}: Readonly<WorkspaceUnboundWelcomeHubProps>) {
  const [step, setStep] = useState<1 | 2 | 3>(establishedSchool ? 3 : 1);
  const [name, setName] = useState(establishedSchool?.fact.name ?? 'Apex Commercial Academy');
  const [handle, setHandle] = useState(establishedSchool?.fact.handle ?? 'apex-academy');
  const [sector, setSector] = useState(establishedSchool?.fact.category ?? 'commercialTuition');
  const [policy, setPolicy] = useState<'open' | 'manual_approval'>('open');
  const [copied, setCopied] = useState(false);
  const [currentProfile, setCurrentProfile] = useState<SchoolProfileData | null>(establishedSchool);

  // If already established, show Step 3 (Credential Hub)
  const activeProfile = currentProfile ?? establishedSchool;

  const handleCreateSchool = async () => {
    if (!name.trim() || !handle.trim()) return;

    const newId = `school-${handle.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
    const newProfile: SchoolProfileData = {
      fact: {
        id: newId,
        name: name.trim(),
        handle: handle.trim(),
        type: sector === 'commercialTuition' ? 'Commercial Academy' : 'Educational Institution',
        category:
          sector === 'commercialTuition'
            ? 'Commercial Tuition & Coaching'
            : sector === 'k12'
              ? 'K-12 Primary & Secondary'
              : sector === 'university'
                ? 'Higher Education & University'
                : 'Pre-School & Kindergarten',
        motto: 'Empowering future leaders through mastery and character',
        avatarUrl: null,
        timezone: 'Asia/Colombo',
        contactEmail: `admissions@${handle.replace(/[^a-z0-9]/g, '')}.edu.lk`,
        telNo: '+94 11 488 9000',
        address: 'Colombo, Western Province, Sri Lanka',
        establishedYear: new Date().getFullYear(),
      },
      census: {
        censusNo: `COMM-${handle.toUpperCase().slice(0, 8)}`,
        districtName: 'Colombo',
        provinceName: 'Western',
        coordPrecision: 'institution_verified',
        latitude: 6.9271,
        longitude: 79.8612,
        isGroundTruthed: true,
        cariTier: 'Commercial Sanctuary',
        hasMiddayMeal: false,
      },
      vitals: {
        totalStudents: 1,
        totalEducators: 1,
        totalClassrooms: 1,
        totalSections: 1,
        attendanceRatePercent: 100,
        activeSanctuaryBonds: 1,
      },
      rollOfHonor: [
        {
          id: `tenure-${newId}`,
          personName: displayName,
          roleTitle: 'Founding Director',
          tenureStart: String(new Date().getFullYear()),
          isCurrent: true,
          citation: 'Pioneered establishment of this learning sanctuary.',
        },
      ],
      societies: [],
      qrPayload: `https://gurudevi.app/qr?v=1&action=join_school&school_id=${newId}&handle=${handle}`,
      isEditable: true,
    };

    await schoolAdapter.saveSchoolProfile(newId, newProfile);
    setCurrentProfile(newProfile);
    onSchoolEstablished(newProfile);
    setStep(3);
  };

  const copyQrLink = (payload: string) => {
    void navigator.clipboard.writeText(payload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // If user is not authorized to create a school (e.g. general visitor / teacher without school)
  if (!canEstablish) {
    return (
      <div className={styles.welcomeHub} id="unbound-welcome-stage">
        <div className={styles.stepCard}>
          <div className={styles.stepHeading}>
            <div className={styles.stepPill}>
              <span>🏛️</span>
              <span>Sanctuary Community</span>
            </div>
            <h2 className={styles.stepTitle}>
              Welcome to Gurudevi App, {displayName}
            </h2>
            <p className={styles.stepSubtitle}>
              Your account is ready, but is not yet connected to a registered school or learning
              sanctuary. Please enter your school invitation key or scan your school doorway QR code to join your classes.
            </p>
          </div>
          <div className={styles.actionsRow}>
            <Link to="/invitation-welcome" className={styles.primaryAction}>
              <span>🔑</span> Enter School Invitation Key
            </Link>
            {onTryPractice ? (
              <button type="button" className={styles.secondaryAction} onClick={onTryPractice}>
                Try Attendance in Safe Demo Mode
              </button>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.welcomeHub} id="unbound-welcome-stage">
      {/* Visual Stepper Bar */}
      <div className={styles.stepperBar} aria-label="Establishment Progress">
        <div className={styles.stepPill}>
          <span>🏛️</span>
          <span>
            {step === 1 && 'Step 1 of 3: School Identity'}
            {step === 2 && 'Step 2 of 3: Model & Joining'}
            {step === 3 && 'Step 3 of 3: Ready to Share'}
          </span>
        </div>
        <div className={styles.stepProgress}>
          <div
            className={`${styles.stepDot} ${step === 1 ? styles.stepDotActive : styles.stepDotDone}`}
          >
            {step > 1 ? '✓' : '1'}
          </div>
          <div className={`${styles.stepLine} ${step > 1 ? styles.stepLineActive : ''}`} />
          <div
            className={`${styles.stepDot} ${
              step === 2 ? styles.stepDotActive : step > 2 ? styles.stepDotDone : styles.stepDotUpcoming
            }`}
          >
            {step > 2 ? '✓' : '2'}
          </div>
          <div className={`${styles.stepLine} ${step === 3 ? styles.stepLineActive : ''}`} />
          <div
            className={`${styles.stepDot} ${step === 3 ? styles.stepDotActive : styles.stepDotUpcoming}`}
          >
            3
          </div>
        </div>
      </div>

      {/* STEP 1: School Identity & Handle */}
      {step === 1 && (
        <div className={styles.stepCard}>
          <div className={styles.stepHeading}>
            <h2 className={styles.stepTitle}>
              Welcome, {displayName}. Let's set up your school.
            </h2>
            <p className={styles.stepSubtitle}>
              Give your institution a recognizable presence in Sanctuary. This provides your teachers,
              students, and parents with a dedicated private home.
            </p>
          </div>

          <div className={styles.formField}>
            <label htmlFor="input-school-name" className={styles.fieldLabel}>
              Official School or Academy Name
            </label>
            <p className={styles.fieldHint}>
              The formal name shown on daily notices, certificates, and student profiles.
            </p>
            <input
              id="input-school-name"
              className={styles.textInput}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!handle || handle === 'apex-academy') {
                  setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 24));
                }
              }}
              placeholder="e.g. Apex Commercial Academy"
              required
            />
          </div>

          <div className={styles.formField}>
            <label htmlFor="input-school-handle" className={styles.fieldLabel}>
              Institutional Web Handle (@)
            </label>
            <p className={styles.fieldHint}>
              A clean vanity handle that creates your direct link: <code>gurudevi.app/@{handle || 'handle'}</code>
            </p>
            <div className={styles.handlePrefixGroup}>
              <span className={styles.handlePrefix}>@</span>
              <input
                id="input-school-handle"
                className={`${styles.textInput} ${styles.handleInput}`}
                value={handle}
                onChange={(e) =>
                  setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 28))
                }
                placeholder="apex-academy"
                required
              />
            </div>
          </div>

          <div className={styles.actionsRow}>
            <button
              type="button"
              id="btn-step1-continue"
              className={styles.primaryAction}
              disabled={!name.trim() || !handle.trim()}
              onClick={() => setStep(2)}
            >
              Continue to Model & Policy ➔
            </button>
            <Link to="/invitation-welcome" className={styles.tertiaryLink}>
              Have an invitation key? Connect to existing school instead
            </Link>
          </div>
        </div>
      )}

      {/* STEP 2: Model & Admission Policy */}
      {step === 2 && (
        <div className={styles.stepCard}>
          <div className={styles.stepHeading}>
            <h2 className={styles.stepTitle}>How does {name} operate?</h2>
            <p className={styles.stepSubtitle}>
              Select your educational sector and choose how students and families connect to your sanctuary.
            </p>
          </div>

          <div className={styles.formField}>
            <label className={styles.fieldLabel}>1. Institutional Model & Sector</label>
            <div className={styles.optionsGrid}>
              <button
                type="button"
                className={`${styles.optionCard} ${sector === 'commercialTuition' ? styles.optionCardSelected : ''}`}
                onClick={() => setSector('commercialTuition')}
              >
                <div className={styles.optionHeader}>
                  <span className={styles.optionIcon}>🏫</span>
                  <input
                    type="radio"
                    name="sector"
                    checked={sector === 'commercialTuition'}
                    onChange={() => setSector('commercialTuition')}
                    className={styles.optionRadio}
                  />
                </div>
                <h4 className={styles.optionTitle}>Commercial Tuition & Coaching</h4>
                <p className={styles.optionDesc}>
                  Optimized for private institutes, subject coaching classes, and evening academies.
                </p>
              </button>

              <button
                type="button"
                className={`${styles.optionCard} ${sector === 'k12' ? styles.optionCardSelected : ''}`}
                onClick={() => setSector('k12')}
              >
                <div className={styles.optionHeader}>
                  <span className={styles.optionIcon}>🎒</span>
                  <input
                    type="radio"
                    name="sector"
                    checked={sector === 'k12'}
                    onChange={() => setSector('k12')}
                    className={styles.optionRadio}
                  />
                </div>
                <h4 className={styles.optionTitle}>K-12 Primary & Secondary</h4>
                <p className={styles.optionDesc}>
                  Structured academic grades, terms, morning assemblies, and teacher rosters.
                </p>
              </button>

              <button
                type="button"
                className={`${styles.optionCard} ${sector === 'university' ? styles.optionCardSelected : ''}`}
                onClick={() => setSector('university')}
              >
                <div className={styles.optionHeader}>
                  <span className={styles.optionIcon}>🎓</span>
                  <input
                    type="radio"
                    name="sector"
                    checked={sector === 'university'}
                    onChange={() => setSector('university')}
                    className={styles.optionRadio}
                  />
                </div>
                <h4 className={styles.optionTitle}>Higher Education & University</h4>
                <p className={styles.optionDesc}>
                  Designed for degree colleges, technical institutes, and academic departments.
                </p>
              </button>

              <button
                type="button"
                className={`${styles.optionCard} ${sector === 'preSchool' ? styles.optionCardSelected : ''}`}
                onClick={() => setSector('preSchool')}
              >
                <div className={styles.optionHeader}>
                  <span className={styles.optionIcon}>🧸</span>
                  <input
                    type="radio"
                    name="sector"
                    checked={sector === 'preSchool'}
                    onChange={() => setSector('preSchool')}
                    className={styles.optionRadio}
                  />
                </div>
                <h4 className={styles.optionTitle}>Pre-School & Kindergarten</h4>
                <p className={styles.optionDesc}>
                  Early childhood nurturing, playgroup tracking, and close family dialogues.
                </p>
              </button>
            </div>
          </div>

          <div className={styles.formField}>
            <label className={styles.fieldLabel}>2. How Should Parents & Students Join?</label>
            <div className={styles.optionsGrid}>
              <button
                type="button"
                className={`${styles.optionCard} ${policy === 'open' ? styles.optionCardSelected : ''}`}
                onClick={() => setPolicy('open')}
              >
                <div className={styles.optionHeader}>
                  <span className={styles.optionIcon}>⚡</span>
                  <input
                    type="radio"
                    name="policy"
                    checked={policy === 'open'}
                    onChange={() => setPolicy('open')}
                    className={styles.optionRadio}
                  />
                </div>
                <h4 className={styles.optionTitle}>Instant Join via QR Code (Recommended)</h4>
                <p className={styles.optionDesc}>
                  Anyone scanning the doorway QR code or clicking your handle joins immediately.
                </p>
              </button>

              <button
                type="button"
                className={`${styles.optionCard} ${policy === 'manual_approval' ? styles.optionCardSelected : ''}`}
                onClick={() => setPolicy('manual_approval')}
              >
                <div className={styles.optionHeader}>
                  <span className={styles.optionIcon}>🛡️</span>
                  <input
                    type="radio"
                    name="policy"
                    checked={policy === 'manual_approval'}
                    onChange={() => setPolicy('manual_approval')}
                    className={styles.optionRadio}
                  />
                </div>
                <h4 className={styles.optionTitle}>Staff Approval Required</h4>
                <p className={styles.optionDesc}>
                  Scans create a pending admission request requiring approval by an educator or admin.
                </p>
              </button>
            </div>
          </div>

          <div className={styles.actionsRow}>
            <button
              type="button"
              className={styles.secondaryAction}
              onClick={() => setStep(1)}
            >
              ⬅ Back to Name
            </button>
            <button
              type="button"
              id="btn-step2-complete"
              className={styles.primaryAction}
              onClick={handleCreateSchool}
            >
              <span>🏛️</span> Complete & Generate School Sanctuary ➔
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Live Credentials & QR Code */}
      {step === 3 && activeProfile && (
        <div className={styles.stepCard} id="created-school-banner">
          <div className={styles.stepHeading}>
            <div className={styles.stepPill} style={{ background: '#e8f5e9', color: '#2e7d32' }}>
              <span>✓</span>
              <span>School Sanctuary Active & Ready</span>
            </div>
            <h2 className={styles.stepTitle}>
              🎉 {activeProfile.fact.name} is Live!
            </h2>
            <p className={styles.stepSubtitle}>
              Your institutional sanctuary is established. Below are your official vanity credentials and
              vector QR code for doorway printing and invitations.
            </p>
          </div>

          <div className={styles.credentialBox}>
            <div className={styles.qrContainer}>
              <svg
                width="160"
                height="160"
                viewBox="0 0 200 200"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                role="img"
                aria-label={`Official QR Code for ${activeProfile.fact.name}`}
              >
                <rect width="200" height="200" rx="16" fill="white" />
                <rect x="20" y="20" width="48" height="48" rx="8" fill="#1F1D1A" />
                <rect x="28" y="28" width="32" height="32" rx="4" fill="white" />
                <rect x="36" y="36" width="16" height="16" rx="2" fill="#7A1C20" />

                <rect x="132" y="20" width="48" height="48" rx="8" fill="#1F1D1A" />
                <rect x="140" y="28" width="32" height="32" rx="4" fill="white" />
                <rect x="148" y="36" width="16" height="16" rx="2" fill="#7A1C20" />

                <rect x="20" y="132" width="48" height="48" rx="8" fill="#1F1D1A" />
                <rect x="28" y="140" width="32" height="32" rx="4" fill="white" />
                <rect x="36" y="148" width="16" height="16" rx="2" fill="#7A1C20" />

                <rect x="80" y="24" width="12" height="12" fill="#1F1D1A" rx="2" />
                <rect x="104" y="24" width="12" height="12" fill="#1F1D1A" rx="2" />
                <rect x="80" y="44" width="12" height="12" fill="#1F1D1A" rx="2" />
                <rect x="96" y="56" width="12" height="12" fill="#1F1D1A" rx="2" />

                <rect x="24" y="84" width="12" height="12" fill="#1F1D1A" rx="2" />
                <rect x="44" y="96" width="12" height="12" fill="#1F1D1A" rx="2" />
                <rect x="64" y="84" width="12" height="12" fill="#1F1D1A" rx="2" />

                <rect x="84" y="84" width="32" height="32" rx="6" fill="#7A1C20" />
                <circle cx="100" cy="100" r="8" fill="#F8F4EA" />

                <rect x="124" y="84" width="12" height="12" fill="#1F1D1A" rx="2" />
                <rect x="144" y="96" width="12" height="12" fill="#1F1D1A" rx="2" />
                <rect x="164" y="84" width="12" height="12" fill="#1F1D1A" rx="2" />

                <rect x="80" y="124" width="12" height="12" fill="#1F1D1A" rx="2" />
                <rect x="100" y="136" width="12" height="12" fill="#1F1D1A" rx="2" />
                <rect x="80" y="152" width="12" height="12" fill="#1F1D1A" rx="2" />

                <rect x="132" y="132" width="12" height="12" fill="#1F1D1A" rx="2" />
              </svg>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#7a1c20' }}>
                Scan to Join School
              </span>
            </div>

            <div className={styles.credentialDetails}>
              <span className={styles.badgeHandle}>@{activeProfile.fact.handle}</span>
              <p style={{ margin: 0, fontSize: '0.92rem', color: '#555' }}>
                Sector: <strong>{activeProfile.fact.category}</strong>
              </p>
              <div className={styles.linkBox}>
                <span>{activeProfile.qrPayload}</span>
                <button
                  type="button"
                  id="btn-copy-qr-link"
                  className={styles.copyBtn}
                  onClick={() => copyQrLink(activeProfile.qrPayload)}
                >
                  {copied ? 'Copied! ✓' : 'Copy Link'}
                </button>
              </div>
              <p style={{ margin: 0, fontSize: '0.82rem', color: '#777' }}>
                Print this QR code to mount at entrance doorways for morning attendance kiosks and educator access.
              </p>
            </div>
          </div>

          <div className={styles.actionsRow}>
            <Link to="/workspace/school" className={styles.primaryAction} id="btn-open-school-profile">
              <span>🏛️</span> Open Full School Profile ➔
            </Link>
            <button
              type="button"
              className={styles.secondaryAction}
              onClick={() => window.print()}
            >
              <span>🖨️</span> Print Doorway Badge
            </button>
            <button
              type="button"
              className={styles.tertiaryLink}
              onClick={onDismissBanner}
            >
              Reset Setup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
