import React, { useState } from 'react';
import { schoolAdapter } from '@/lib/domain/adapters/school/school.adapter';
import type { SchoolProfileData } from '@/lib/domain/ports/school.port';

interface CommercialSchoolCreationModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (profile: SchoolProfileData) => void;
  styles: Record<string, string>;
}

export function CommercialSchoolCreationModal({
  open,
  onClose,
  onCreated,
  styles,
}: Readonly<CommercialSchoolCreationModalProps>) {
  const [newSchool, setNewSchool] = useState({
    name: 'Apex Commercial Academy',
    handle: 'apex-academy',
    sector: 'commercialTuition',
    motto: 'Empowering future leaders through advanced computational mastery',
    guardianPolicy: 'manual_approval',
    contactEmail: 'admissions@apexacademy.edu.lk',
    telNo: '+94 11 488 9000',
    timezone: 'Asia/Colombo',
  });

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSchool.name.trim() || !newSchool.handle.trim()) return;

    const newId = `school-${newSchool.handle.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
    const newProfile: SchoolProfileData = {
      fact: {
        id: newId,
        name: newSchool.name,
        handle: newSchool.handle,
        type: newSchool.sector === 'commercialTuition' ? 'Commercial Academy' : 'Private Institution',
        category: 'Commercial Tuition & Coaching',
        motto: newSchool.motto,
        avatarUrl: null,
        timezone: newSchool.timezone,
        contactEmail: newSchool.contactEmail,
        telNo: newSchool.telNo,
        address: 'Colombo, Western Province, Sri Lanka',
        establishedYear: new Date().getFullYear(),
      },
      census: {
        censusNo: `COMM-${newSchool.handle.toUpperCase().slice(0, 8)}`,
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
          personName: 'Principal / Institutional Founder',
          roleTitle: 'Founding Director',
          tenureStart: String(new Date().getFullYear()),
          isCurrent: true,
          citation: 'Pioneered establishment of this commercial learning sanctuary.',
        },
      ],
      societies: [
        {
          id: `soc-${newId}`,
          name: 'Academic Excellence & Innovation Circle',
          category: 'academic',
          memberCount: 12,
        },
      ],
      qrPayload: `https://gurudevi.app/qr?v=1&action=join_school&school_id=${newId}&group_id=grp-${newId}-hq&handle=${newSchool.handle}`,
      isEditable: true,
    };

    await schoolAdapter.saveSchoolProfile(newId, newProfile);
    onCreated(newProfile);
    onClose();
  };

  return (
    <form
      id="create-school-form"
      className={styles.editForm}
      onSubmit={handleSubmit}
      aria-label="Establish new commercial school"
    >
      <div>
        <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>
          Establish New Commercial Institution or Academy
        </h2>
        <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: '#666' }}>
          Provision a new educational sanctuary with instant digital credentials and guardian onboarding policy.
        </p>
      </div>

      <div className={styles.formGrid}>
        <div className={styles.fieldGroup}>
          <label htmlFor="new-school-name">School / Academy Official Name</label>
          <input
            id="new-school-name"
            className={styles.inputField}
            value={newSchool.name}
            onChange={(e) => setNewSchool({ ...newSchool, name: e.target.value })}
            required
          />
        </div>

        <div className={styles.fieldGroup}>
          <label htmlFor="new-school-handle">Institutional Handle (@)</label>
          <input
            id="new-school-handle"
            className={styles.inputField}
            value={newSchool.handle}
            onChange={(e) =>
              setNewSchool({
                ...newSchool,
                handle: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''),
              })
            }
            required
          />
        </div>

        <div className={styles.fieldGroup}>
          <label htmlFor="new-school-sector">Institutional Sector & Model</label>
          <select
            id="new-school-sector"
            className={styles.inputField}
            value={newSchool.sector}
            onChange={(e) => setNewSchool({ ...newSchool, sector: e.target.value })}
          >
            <option value="commercialTuition">Commercial Tuition & Coaching Institute</option>
            <option value="preSchool">Pre-School & Kindergarten</option>
            <option value="k12">K-12 Primary & Secondary</option>
            <option value="university">Higher Education & University</option>
            <option value="vocational">Vocational & Technical College</option>
            <option value="specialEducation">Special Education & Wellbeing</option>
            <option value="notForProfit">Not-For-Profit Educational Trust</option>
          </select>
        </div>

        <div className={styles.fieldGroup}>
          <label htmlFor="new-school-guardian-policy">Guardian Verification Policy</label>
          <select
            id="new-school-guardian-policy"
            className={styles.inputField}
            value={newSchool.guardianPolicy}
            onChange={(e) => setNewSchool({ ...newSchool, guardianPolicy: e.target.value })}
          >
            <option value="manual_approval">Manual Approval (Principal / Admin reviews each guardian)</option>
            <option value="open">Open (Instant Enrollment upon QR scan)</option>
            <option value="strict_document">Strict Document (Civil Registry / NIC verification required)</option>
          </select>
        </div>

        <div className={styles.fieldGroup}>
          <label htmlFor="new-school-motto">Institutional Motto / Academic Doctrine</label>
          <input
            id="new-school-motto"
            className={styles.inputField}
            value={newSchool.motto}
            onChange={(e) => setNewSchool({ ...newSchool, motto: e.target.value })}
          />
        </div>

        <div className={styles.fieldGroup}>
          <label htmlFor="new-school-email">Official Admissions Email</label>
          <input
            id="new-school-email"
            type="email"
            className={styles.inputField}
            value={newSchool.contactEmail}
            onChange={(e) => setNewSchool({ ...newSchool, contactEmail: e.target.value })}
          />
        </div>

        <div className={styles.fieldGroup}>
          <label htmlFor="new-school-telephone">Official Telephone</label>
          <input
            id="new-school-telephone"
            className={styles.inputField}
            value={newSchool.telNo}
            onChange={(e) => setNewSchool({ ...newSchool, telNo: e.target.value })}
          />
        </div>

        <div className={styles.fieldGroup}>
          <label htmlFor="new-school-timezone">Primary Operating Timezone</label>
          <select
            id="new-school-timezone"
            className={styles.inputField}
            value={newSchool.timezone}
            onChange={(e) => setNewSchool({ ...newSchool, timezone: e.target.value })}
          >
            <option value="Asia/Colombo">Asia/Colombo (Sri Lanka Standard Time)</option>
            <option value="UTC">UTC (Universal Coordinated Time)</option>
            <option value="Asia/Dubai">Asia/Dubai (GST)</option>
            <option value="Asia/Singapore">Asia/Singapore (SGT)</option>
            <option value="Europe/London">Europe/London (GMT/BST)</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
        <button id="btn-submit-new-school" type="submit" className={styles.primaryBtn}>
          <span>🏛️</span> Establish Commercial School ➔
        </button>
        <button type="button" className={styles.secondaryBtn} onClick={onClose}>
          Cancel
        </button>
      </div>
    </form>
  );
}

export function EstablishedSchoolBanner({
  profile,
  onViewQr,
  onDismiss,
  styles,
}: Readonly<{
  profile: SchoolProfileData;
  onViewQr: () => void;
  onDismiss: () => void;
  styles: Record<string, string>;
}>) {
  return (
    <div
      id="created-school-banner"
      style={{
        background: 'linear-gradient(135deg, rgba(122, 28, 32, 0.08), rgba(212, 175, 55, 0.16))',
        border: '2px solid #7a1c20',
        borderRadius: '20px',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#7a1c20', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            ✓ New Commercial School Established
          </span>
          <h2 style={{ margin: '0.25rem 0', fontSize: '1.4rem', fontWeight: 800, color: '#1f1d1a' }}>
            {profile.fact.name}
          </h2>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.25rem' }}>
            <span style={{ background: '#7a1c20', color: '#fff', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 }}>
              @{profile.fact.handle}
            </span>
            <span style={{ fontSize: '0.85rem', color: '#555' }}>
              Sector: {profile.fact.category}
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button type="button" id="btn-view-created-qr" className={styles.primaryBtn} onClick={onViewQr}>
            <span>📱</span> View QR Code & Credentials
          </button>
          <button type="button" id="btn-dismiss-welcome" className={styles.secondaryBtn} onClick={onDismiss}>
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
