'use client';

import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { editorialHexagonalService, type SchoolEditorialDraft } from '@/lib/domain';
import {
  CANONICAL_ANANDA_PROFILE,
  schoolHexagonalService,
} from '@/lib/domain/adapters/school/schoolHexagonalService';
import type { SchoolProfileData, SchoolProfileFact } from '@/lib/domain/ports/school.port';
import styles from './school.module.css';

interface SchoolFloorProps {
  schoolId?: string;
  isLeader?: boolean;
}

type TabKey = 'overview' | 'census' | 'rollOfHonor' | 'societies' | 'articles' | 'qr';

export function SchoolFloor({
  schoolId = 'school-ananda-colombo',
  isLeader = true,
}: Readonly<SchoolFloorProps>) {
  const [data, setData] = useState<SchoolProfileData>(CANONICAL_ANANDA_PROFILE);
  const [articles, setArticles] = useState<readonly SchoolEditorialDraft[]>([]);
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [copyNotice, setCopyNotice] = useState<string | null>(null);

  // Editable form state
  const [formData, setFormData] = useState<Partial<SchoolProfileFact>>({});

  useEffect(() => {
    let mounted = true;
    async function loadSchool() {
      try {
        const [profile, drafts] = await Promise.all([
          schoolHexagonalService.getSchoolProfile(schoolId),
          editorialHexagonalService.listDrafts(schoolId).catch(() => []),
        ]);
        if (mounted) {
          setData(profile);
          setFormData(profile.fact);
          setArticles(drafts.filter((d) => d.status === 'published'));
        }
      } catch {
        // Fall back to canonical defaults
      }
    }
    loadSchool();
    return () => {
      mounted = false;
    };
  }, [schoolId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLeader) {
      setNotice('Unauthorized: Only school leadership can modify the institutional profile.');
      return;
    }
    try {
      const updated = await schoolHexagonalService.updateSchoolProfile(schoolId, formData);
      setData(updated);
      setIsEditing(false);
      setNotice('School institutional profile successfully saved.');
      setTimeout(() => setNotice(null), 4000);
    } catch {
      setNotice('Failed to update school profile. Please retry.');
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        setCopyNotice(`${label} copied to clipboard!`);
        setTimeout(() => setCopyNotice(null), 3000);
      }
    } catch {
      setCopyNotice('Failed to copy. Please manually copy the URL.');
    }
  };

  const { fact, census, vitals, rollOfHonor, societies, qrPayload } = data;

  return (
    <div className={styles.schoolFloor}>

      {/* Hero Header */}
      <section className={styles.heroCard} aria-labelledby="school-profile-heading">
        <div className={styles.heroContent}>
          <div className={styles.crestWrapper} aria-hidden="true">
            {fact.avatarUrl ? (
              <img
                src={fact.avatarUrl}
                alt={`${fact.name} crest`}
                style={{ width: '100%', height: '100%', borderRadius: 24, objectFit: 'cover' }}
              />
            ) : (
              '🏛️'
            )}
          </div>

          <div className={styles.heroText}>
            <div className={styles.titleRow}>
              <h1 id="school-profile-heading" className={styles.schoolTitle}>
                {fact.name}
              </h1>
            </div>

            {(fact.nameSi || fact.nameTa) && (
              <div className={styles.subTitles}>
                {fact.nameSi && <span>{fact.nameSi}</span>}
                {fact.nameSi && fact.nameTa && <span>•</span>}
                {fact.nameTa && <span>{fact.nameTa}</span>}
              </div>
            )}

            <div className={styles.badgesRow}>
              <span className={styles.badge}>{fact.type}</span>
              <span className={`${styles.badge} ${styles.censusBadge}`}>
                MoE Census: {census.censusNo}
              </span>
              <span className={`${styles.badge} ${styles.handleBadge}`}>@{fact.handle}</span>
              <span className={styles.badge}>
                {census.provinceName} Province · {census.districtName}
              </span>
            </div>

            {fact.motto && <p className={styles.mottoText}>{fact.motto}</p>}
          </div>
        </div>

        {notice && (
          <div className={styles.toastNotice} role="status">
            <span>✓</span> {notice}
          </div>
        )}

        {copyNotice && (
          <div className={styles.toastNotice} role="status">
            <span>📋</span> {copyNotice}
          </div>
        )}

        <div className={styles.heroActions}>
          <button type="button" className={styles.primaryBtn} onClick={() => setActiveTab('qr')}>
            <span>📱</span> Show Sanctuary QR
          </button>

          <Link
            href={`/school/${fact.handle || fact.id}`}
            className={styles.secondaryBtn}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span>↗</span> Live School Website
          </Link>

          <Link href="/workspace/editorial" className={styles.secondaryBtn}>
            <span>✒️</span> Editorial Media Desk
          </Link>

          <Link href="/workspace/kiosk" className={styles.secondaryBtn}>
            <span>⛶</span> Doorway Kiosk
          </Link>

          {isLeader && (
            <button
              type="button"
              className={styles.secondaryBtn}
              onClick={() => setIsEditing(!isEditing)}
            >
              <span>✎</span> {isEditing ? 'Cancel Edit' : 'Edit Profile'}
            </button>
          )}

          <button
            type="button"
            className={styles.secondaryBtn}
            onClick={() => copyToClipboard(qrPayload, 'Join QR link')}
          >
            <span>🔗</span> Copy Join Link
          </button>
        </div>
      </section>

      {/* Editing Form when active (Strictly gated to leadership) */}
      {isEditing && isLeader && (
        <form className={styles.editForm} onSubmit={handleSave} aria-label="Edit school profile">
          <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>
            Edit Institutional Profile Facts
          </h2>
          <div className={styles.formGrid}>
            <div className={styles.fieldGroup}>
              <label htmlFor="school-name-input">School Official Name</label>
              <input
                id="school-name-input"
                className={styles.inputField}
                value={formData.name ?? ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className={styles.fieldGroup}>
              <label htmlFor="school-handle-input">Institutional Handle (@)</label>
              <input
                id="school-handle-input"
                className={styles.inputField}
                value={formData.handle ?? ''}
                onChange={(e) => setFormData({ ...formData, handle: e.target.value })}
                required
              />
            </div>

            <div className={styles.fieldGroup}>
              <label htmlFor="school-motto-input">Motto / Core Principle</label>
              <input
                id="school-motto-input"
                className={styles.inputField}
                value={formData.motto ?? ''}
                onChange={(e) => setFormData({ ...formData, motto: e.target.value })}
              />
            </div>

            <div className={styles.fieldGroup}>
              <label htmlFor="school-email-input">Official Contact Email</label>
              <input
                id="school-email-input"
                type="email"
                className={styles.inputField}
                value={formData.contactEmail ?? ''}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
              />
            </div>

            <div className={styles.fieldGroup}>
              <label htmlFor="school-tel-input">Official Telephone</label>
              <input
                id="school-tel-input"
                className={styles.inputField}
                value={formData.telNo ?? ''}
                onChange={(e) => setFormData({ ...formData, telNo: e.target.value })}
              />
            </div>

            <div className={styles.fieldGroup}>
              <label htmlFor="school-tz-input">School Timezone</label>
              <input
                id="school-tz-input"
                className={styles.inputField}
                value={formData.timezone ?? 'Asia/Colombo'}
                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="submit" className={styles.primaryBtn}>
              Save Profile Changes
            </button>
            <button
              type="button"
              className={styles.secondaryBtn}
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Vitals Summary Grid */}
      <section className={styles.vitalsGrid} aria-label="School operational vitals">
        <div className={styles.vitalCard}>
          <span className={styles.vitalLabel}>Students Enrolled</span>
          <span className={styles.vitalValue}>{vitals.totalStudents.toLocaleString()}</span>
          <span className={styles.vitalSub}>Active Institutional Roster</span>
        </div>

        <div className={styles.vitalCard}>
          <span className={styles.vitalLabel}>Educators & Staff</span>
          <span className={styles.vitalValue}>{vitals.totalEducators}</span>
          <span className={styles.vitalSub}>SLEAS & Academic Faculty</span>
        </div>

        <div className={styles.vitalCard}>
          <span className={styles.vitalLabel}>Classroom Spaces</span>
          <span className={styles.vitalValue}>{vitals.totalClassrooms}</span>
          <span className={styles.vitalSub}>Across {vitals.totalSections} Academic Sections</span>
        </div>

        <div className={styles.vitalCard}>
          <span className={styles.vitalLabel}>Daily Presence Rate</span>
          <span className={styles.vitalValue}>{vitals.attendanceRatePercent}%</span>
          <span className={styles.vitalSub}>Rolling 30-Day Average</span>
        </div>

        <div className={styles.vitalCard}>
          <span className={styles.vitalLabel}>Resource Tier</span>
          <span className={styles.vitalValue}>{census.cariTier ?? 'Standard'}</span>
          <span className={styles.vitalSub}>
            {census.hasMiddayMeal ? '🥗 Midday Meals Active' : 'No State Feeding'}
          </span>
        </div>
      </section>

      {/* Tabs Navigation */}
      <nav className={styles.tabsNav} role="tablist" aria-label="School profile sections">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'overview'}
          className={`${styles.tabBtn} ${activeTab === 'overview' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          🏛️ Overview & Vitals
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'census'}
          className={`${styles.tabBtn} ${activeTab === 'census' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('census')}
        >
          🗺️ National Census Fact
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'rollOfHonor'}
          className={`${styles.tabBtn} ${activeTab === 'rollOfHonor' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('rollOfHonor')}
        >
          📜 Roll of Honor ({rollOfHonor.length})
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'societies'}
          className={`${styles.tabBtn} ${activeTab === 'societies' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('societies')}
        >
          🏅 Societies & Clubs ({societies.length})
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'articles'}
          className={`${styles.tabBtn} ${activeTab === 'articles' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('articles')}
        >
          📰 Publications & News ({articles.length})
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'qr'}
          className={`${styles.tabBtn} ${activeTab === 'qr' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('qr')}
        >
          📱 Sanctuary QR & Credentials
        </button>
      </nav>

      {/* Tab Panels */}
      <div className={styles.tabContent}>
        {/* Tab 1: Overview & Vitals */}
        {activeTab === 'overview' && (
          <div className={styles.censusGrid}>
            <div className={styles.censusCard}>
              <h3>🏢 Contact & Institutional Identity</h3>
              <dl>
                <dt>Established Year</dt>
                <dd>{fact.establishedYear ?? 'Historic'}</dd>
                <dt>Telephone</dt>
                <dd>{fact.telNo ?? 'Not listed'}</dd>
                <dt>Contact Email</dt>
                <dd>{fact.contactEmail ?? 'contact@school.lk'}</dd>
                <dt>Website</dt>
                <dd>
                  {fact.website ? (
                    <a href={fact.website} target="_blank" rel="noopener noreferrer">
                      Visit ↗
                    </a>
                  ) : (
                    'Not listed'
                  )}
                </dd>
                <dt>Timezone</dt>
                <dd>{fact.timezone}</dd>
              </dl>
            </div>

            <div className={styles.censusCard}>
              <h3>📍 Physical Campus Location</h3>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#555', lineHeight: 1.5 }}>
                {fact.address ?? `${census.districtName}, ${census.provinceName} Province`}
              </p>
              <dl style={{ marginTop: '0.75rem' }}>
                <dt>Latitude</dt>
                <dd>{census.latitude ?? '7.8731'}</dd>
                <dt>Longitude</dt>
                <dd>{census.longitude ?? '80.7718'}</dd>
                <dt>Gate Verification</dt>
                <dd>{census.isGroundTruthed ? '✓ Ground Truthed' : 'Tentative Postcode'}</dd>
              </dl>
            </div>

            {articles.length > 0 && (
              <div style={{ marginTop: '1rem', gridColumn: '1 / -1' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1rem',
                  }}
                >
                  <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>
                    📰 Latest from Student Media & Societies
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveTab('articles')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#7a1c20',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    View All ({articles.length}) ➔
                  </button>
                </div>

                <div className={styles.articlesGrid}>
                  {articles.slice(0, 3).map((article) => (
                    <article key={article.id} className={styles.articleCard}>
                      <div className={styles.articleHeader}>
                        <span className={styles.articleCategory}>
                          {article.kind.replace('_', ' ')}
                        </span>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#7a1c20' }}>
                          {article.language.toUpperCase()}
                        </span>
                      </div>
                      <h4 className={styles.articleTitle}>{article.title}</h4>
                      <p className={styles.articleExcerpt}>{article.summary}</p>
                      <div className={styles.articleFooter}>
                        <span>{article.subEntityName}</span>
                        <Link
                          href={`/school/${fact.handle}/articles/${article.slug ?? article.id}`}
                          className={styles.articleLink}
                        >
                          Read ➔
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: National Census Fact */}
        {activeTab === 'census' && (
          <div className={styles.censusGrid}>
            <div className={styles.censusCard}>
              <h3>🏛️ Sri Lanka Education Atlas Fact</h3>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#666' }}>
                Every recognized school in Sri Lanka is bound to the official Ministry of Education
                Master Census Fact registry.
              </p>
              <dl style={{ marginTop: '0.5rem' }}>
                <dt>MoE Census Number</dt>
                <dd>{census.censusNo}</dd>
                <dt>Administrative Province</dt>
                <dd>{census.provinceName}</dd>
                <dt>District</dt>
                <dd>{census.districtName}</dd>
                <dt>Educational Zone</dt>
                <dd>{census.zoneName ?? 'Central'}</dd>
                <dt>Educational Division</dt>
                <dd>{census.divisionName ?? 'Zone Core'}</dd>
                <dt>GN Division</dt>
                <dd>{census.gnDivision ?? 'Unmapped'}</dd>
              </dl>
            </div>

            <div className={styles.censusCard}>
              <h3>📊 Resource Equity & Social Indicators</h3>
              <dl>
                <dt>Difficulty Index</dt>
                <dd>{census.difficultyLevel ?? 'Standard'}</dd>
                <dt>C-ARI Equity Tier</dt>
                <dd>{census.cariTier ?? 'Tier 1'}</dd>
                <dt>School Category</dt>
                <dd>{fact.type}</dd>
                <dt>Midday Meal Grant</dt>
                <dd>{census.hasMiddayMeal ? 'Active Government Program' : 'Not Participating'}</dd>
                <dt>Spatial Coordinate Tier</dt>
                <dd>{census.coordPrecision ?? 'Postal Centroid'}</dd>
              </dl>
            </div>
          </div>
        )}

        {/* Tab 3: Roll of Honor */}
        {activeTab === 'rollOfHonor' && (
          <div className={styles.rollList}>
            <p style={{ margin: 0, fontSize: '0.92rem', color: '#666' }}>
              The Living Roll of Honor (පාසල් නාමාවලිය) preserves the chronological lineage of
              institutional leadership.
            </p>
            {rollOfHonor.map((tenure) => (
              <article
                key={tenure.id}
                className={`${styles.rollItem} ${tenure.isCurrent ? styles.rollItemCurrent : ''}`}
              >
                <div className={styles.tenureDates}>
                  <span>{tenure.tenureStart}</span>
                  <span>–</span>
                  <span>{tenure.tenureEnd ?? 'Present'}</span>
                </div>

                <div className={styles.tenureDetails}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <h3 className={styles.personName}>{tenure.personName}</h3>
                    {tenure.nameSi && (
                      <span style={{ fontSize: '0.9rem', color: '#777' }}>({tenure.nameSi})</span>
                    )}
                  </div>
                  <span className={styles.personRole}>{tenure.roleTitle}</span>
                  {tenure.citation && <p className={styles.personCitation}>{tenure.citation}</p>}
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Tab 4: Societies & Clubs */}
        {activeTab === 'societies' && (
          <div className={styles.societiesGrid}>
            {societies.map((soc) => (
              <div key={soc.id} className={styles.societyCard}>
                <div className={styles.societyHeader}>
                  <h3 className={styles.societyName}>{soc.name}</h3>
                  <span className={styles.badge} style={{ textTransform: 'capitalize' }}>
                    {soc.category}
                  </span>
                </div>
                {soc.nameSi && (
                  <span style={{ fontSize: '0.85rem', color: '#7A1C20', fontWeight: 600 }}>
                    {soc.nameSi}
                  </span>
                )}
                <div className={styles.societyMeta}>
                  <span>{soc.memberCount} active members</span>
                  {soc.establishedYear && <span>Est. {soc.establishedYear}</span>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 5: Publications & News */}
        {activeTab === 'articles' && (
          <div>
            <div className={styles.authorDeskBanner}>
              <div>
                <strong style={{ fontSize: '1.05rem', color: '#1f1d1a' }}>
                  School Editorial Commons (පාසල් මාධ්‍ය හා ප්‍රකාශන)
                </strong>
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.88rem', color: '#555' }}>
                  Student-authored match reports, society journals, circulars, and roll of honor
                  bulletins.
                </p>
              </div>
              <Link href="/workspace/editorial" className={styles.authorDeskLink}>
                ✒️ Open Media Desk
              </Link>
            </div>

            {articles.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
                <p style={{ fontSize: '2rem', margin: '0 0 0.5rem' }}>📰</p>
                <p>No articles published yet for this school.</p>
              </div>
            ) : (
              <div className={styles.articlesGrid}>
                {articles.map((article) => (
                  <article key={article.id} className={styles.articleCard}>
                    <div className={styles.articleHeader}>
                      <span className={styles.articleCategory}>
                        {article.kind.replace('_', ' ')}
                      </span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#7a1c20' }}>
                        {article.language.toUpperCase()}
                      </span>
                    </div>

                    <div>
                      <h3 className={styles.articleTitle}>{article.title}</h3>
                      <p className={styles.articleExcerpt}>{article.summary}</p>
                    </div>

                    <div className={styles.articleFooter}>
                      <span>By {article.authorName}</span>
                      <Link
                        href={`/school/${fact.handle}/articles/${article.slug ?? article.id}`}
                        className={styles.articleLink}
                      >
                        Read Full Story ➔
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 6: Sanctuary QR & Credentials */}
        {activeTab === 'qr' && (
          <div className={styles.qrCard}>
            <div className={styles.qrVisual}>
              {/* Responsive SVG QR code representation */}
              <svg
                width="200"
                height="200"
                viewBox="0 0 200 200"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                role="img"
                aria-label={`QR Code for ${fact.name}`}
              >
                <rect width="200" height="200" rx="16" fill="white" />
                {/* Outer finder patterns */}
                <rect x="20" y="20" width="48" height="48" rx="8" fill="#1F1D1A" />
                <rect x="28" y="28" width="32" height="32" rx="4" fill="white" />
                <rect x="36" y="36" width="16" height="16" rx="2" fill="#7A1C20" />

                <rect x="132" y="20" width="48" height="48" rx="8" fill="#1F1D1A" />
                <rect x="140" y="28" width="32" height="32" rx="4" fill="white" />
                <rect x="148" y="36" width="16" height="16" rx="2" fill="#7A1C20" />

                <rect x="20" y="132" width="48" height="48" rx="8" fill="#1F1D1A" />
                <rect x="28" y="140" width="32" height="32" rx="4" fill="white" />
                <rect x="36" y="148" width="16" height="16" rx="2" fill="#7A1C20" />

                {/* Inner simulated data matrices */}
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
                <rect x="152" y="144" width="12" height="12" fill="#1F1D1A" rx="2" />
                <rect x="140" y="160" width="12" height="12" fill="#1F1D1A" rx="2" />
                <rect x="160" y="160" width="12" height="12" fill="#1F1D1A" rx="2" />
              </svg>
              <span className={styles.qrPayloadDisplay}>{qrPayload}</span>
            </div>

            <div className={styles.qrDetails}>
              <h2>Official Institutional QR Invitation</h2>
              <p>
                Scanning this QR code from the Gurudevi mobile or web camera connects teachers,
                students, and guardians into the official <strong>{fact.name}</strong> digital
                sanctuary.
              </p>

              <ol className={styles.qrInstructionList}>
                <li>
                  <strong>Teachers:</strong> Joins institutional roster and unlocks classroom
                  creation under school sections.
                </li>
                <li>
                  <strong>Guardians & Students:</strong> Enrolls into school announcements and
                  community circles.
                </li>
                <li>
                  <strong>Staff & Prefects:</strong> Hydrates co-curricular group permissions and
                  circular notices.
                </li>
              </ol>

              <div
                style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem', flexWrap: 'wrap' }}
              >
                <button
                  type="button"
                  className={styles.primaryBtn}
                  onClick={() => copyToClipboard(qrPayload, 'QR Link')}
                >
                  <span>📋</span> Copy QR URL
                </button>
                <a
                  href={`gurudevi://qr?action=join_school&school_id=${fact.id}`}
                  className={styles.secondaryBtn}
                >
                  <span>📱</span> Test Native Deep Link
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
