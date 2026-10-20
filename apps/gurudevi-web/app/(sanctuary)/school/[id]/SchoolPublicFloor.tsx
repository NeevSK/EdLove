'use client';

import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { editorialHexagonalService, type SchoolEditorialDraft } from '@/lib/domain';
import {
  CANONICAL_ANANDA_PROFILE,
  schoolHexagonalService,
} from '@/lib/domain/adapters/school/schoolHexagonalService';
import type { SchoolProfileData } from '@/lib/domain/ports/school.port';
import styles from './school-public.module.css';

interface SchoolPublicFloorProps {
  schoolId: string;
}

type PublicTabKey = 'overview' | 'publications' | 'honor' | 'societies' | 'census' | 'qr';

export function SchoolPublicFloor({ schoolId }: Readonly<SchoolPublicFloorProps>) {
  const [data, setData] = useState<SchoolProfileData>(CANONICAL_ANANDA_PROFILE);
  const [articles, setArticles] = useState<readonly SchoolEditorialDraft[]>([]);
  const [activeTab, setActiveTab] = useState<PublicTabKey>('overview');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copyNotice, setCopyNotice] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function loadPublicDossier() {
      try {
        const [profile, drafts] = await Promise.all([
          schoolHexagonalService.getSchoolProfile(schoolId),
          editorialHexagonalService.listDrafts(schoolId).catch(() => []),
        ]);
        if (mounted) {
          setData(profile);
          setArticles(drafts.filter((d) => d.status === 'published'));
        }
      } catch {
        // Fall back gracefully
      }
    }
    loadPublicDossier();
    return () => {
      mounted = false;
    };
  }, [schoolId]);

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

  const categories = ['all', ...Array.from(new Set(articles.map((a) => a.kind)))];
  const filteredArticles =
    selectedCategory === 'all' ? articles : articles.filter((a) => a.kind === selectedCategory);

  return (
    <div className={styles.publicContainer}>
      {/* 1. Public Institutional Masthead */}
      <header className={styles.masthead}>
        <div className={styles.mastheadInner}>
          <Link href={`/school/${fact.handle}`} className={styles.brandLink}>
            <div className={styles.brandCrest} aria-hidden="true">
              {fact.avatarUrl ? (
                <img
                  src={fact.avatarUrl}
                  alt={`${fact.name} crest`}
                  style={{ width: '100%', height: '100%', borderRadius: 10, objectFit: 'cover' }}
                />
              ) : (
                '🏛️'
              )}
            </div>
            <div className={styles.brandText}>
              <h1>{fact.name}</h1>
              <p>
                {census.provinceName} Province · MoE Census: {census.censusNo}
              </p>
            </div>
          </Link>

          <nav className={styles.mastheadNav} aria-label="School sections">
            <button
              type="button"
              className={`${styles.navBtn} ${activeTab === 'overview' ? styles.navBtnActive : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button
              type="button"
              className={`${styles.navBtn} ${activeTab === 'publications' ? styles.navBtnActive : ''}`}
              onClick={() => setActiveTab('publications')}
            >
              Publications ({articles.length})
            </button>
            <button
              type="button"
              className={`${styles.navBtn} ${activeTab === 'honor' ? styles.navBtnActive : ''}`}
              onClick={() => setActiveTab('honor')}
            >
              Roll of Honor
            </button>
            <button
              type="button"
              className={`${styles.navBtn} ${activeTab === 'societies' ? styles.navBtnActive : ''}`}
              onClick={() => setActiveTab('societies')}
            >
              Clubs & Societies
            </button>
            <button
              type="button"
              className={`${styles.navBtn} ${activeTab === 'census' ? styles.navBtnActive : ''}`}
              onClick={() => setActiveTab('census')}
            >
              MoE Registry
            </button>
            <button
              type="button"
              className={`${styles.navBtn} ${activeTab === 'qr' ? styles.navBtnActive : ''}`}
              onClick={() => setActiveTab('qr')}
            >
              Sanctuary QR
            </button>
          </nav>

          <a href="https://sanctuary.gurudevi.app/sign-in" className={styles.portalBtn}>
            Enter Sanctuary ➔
          </a>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className={styles.heroSection} aria-label="School heraldry and facts">
        <div className={styles.heroInner}>
          <div className={styles.heroCrestLarge} aria-hidden="true">
            {fact.avatarUrl ? (
              <img
                src={fact.avatarUrl}
                alt={`${fact.name} crest`}
                style={{ width: '100%', height: '100%', borderRadius: 26, objectFit: 'cover' }}
              />
            ) : (
              '🏛️'
            )}
          </div>

          <div className={styles.heroContent}>
            <div className={styles.heroPills}>
              <span className={styles.heroPill}>{fact.type}</span>
              <span className={`${styles.heroPill} ${styles.heroPillCensus}`}>
                MoE Master Census #{census.censusNo}
              </span>
              <span className={styles.heroPill}>@{fact.handle}</span>
              <span className={styles.heroPill}>
                {census.provinceName} Province · {census.districtName}
              </span>
              {census.isGroundTruthed && (
                <span className={styles.heroPill}>✓ Ground Truthed Campus</span>
              )}
            </div>

            <h2 className={styles.heroTitle}>{fact.name}</h2>

            {(fact.nameSi || fact.nameTa) && (
              <div className={styles.heroLanguages}>
                {fact.nameSi && <span>{fact.nameSi}</span>}
                {fact.nameSi && fact.nameTa && <span>•</span>}
                {fact.nameTa && <span>{fact.nameTa}</span>}
              </div>
            )}

            {fact.motto && <p className={styles.heroMotto}>&ldquo;{fact.motto}&rdquo;</p>}

            <div className={styles.heroActions}>
              <button
                type="button"
                className={styles.heroActionBtnPrimary}
                onClick={() => setActiveTab('publications')}
              >
                <span>📰</span> Explore Student Media
              </button>
              <button
                type="button"
                className={styles.heroActionBtnSecondary}
                onClick={() => setActiveTab('qr')}
              >
                <span>📱</span> Show Sanctuary QR
              </button>
              <button
                type="button"
                className={styles.heroActionBtnSecondary}
                onClick={() =>
                  copyToClipboard(
                    typeof window !== 'undefined' ? window.location.href : '',
                    'School Website URL',
                  )
                }
              >
                <span>🔗</span> Share Website
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Toast Notice */}
      {copyNotice && (
        <div
          role="status"
          style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            background: '#1f1d1a',
            color: '#fff',
            padding: '0.85rem 1.4rem',
            borderRadius: '12px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
            zIndex: 100,
            fontSize: '0.9rem',
            fontWeight: 700,
          }}
        >
          <span>✓</span> {copyNotice}
        </div>
      )}

      {/* 3. Institutional Vitals Bar */}
      <section className={styles.vitalsBar} aria-label="School operational metrics">
        <div className={styles.vitalsInner}>
          <div className={styles.vitalItem}>
            <span className={styles.vitalLabel}>Students Enrolled</span>
            <span className={styles.vitalValue}>{vitals.totalStudents.toLocaleString()}</span>
            <span className={styles.vitalSub}>Active Institutional Roster</span>
          </div>

          <div className={styles.vitalItem}>
            <span className={styles.vitalLabel}>Educators & Faculty</span>
            <span className={styles.vitalValue}>{vitals.totalEducators}</span>
            <span className={styles.vitalSub}>SLEAS & Academic Staff</span>
          </div>

          <div className={styles.vitalItem}>
            <span className={styles.vitalLabel}>Classrooms & Spaces</span>
            <span className={styles.vitalValue}>{vitals.totalClassrooms}</span>
            <span className={styles.vitalSub}>Across {vitals.totalSections} Sections</span>
          </div>

          <div className={styles.vitalItem}>
            <span className={styles.vitalLabel}>Daily Presence Rate</span>
            <span className={styles.vitalValue}>{vitals.attendanceRatePercent}%</span>
            <span className={styles.vitalSub}>Rolling 30-Day Verified</span>
          </div>

          <div className={styles.vitalItem}>
            <span className={styles.vitalLabel}>Resource Tier</span>
            <span className={styles.vitalValue}>{census.cariTier ?? 'Standard'}</span>
            <span className={styles.vitalSub}>
              {census.hasMiddayMeal ? '🥗 Midday Feeding Active' : 'No State Feeding'}
            </span>
          </div>
        </div>
      </section>

      {/* 4. Tab Panels */}
      <main className={styles.mainContent}>
        {/* Tab: Overview */}
        {activeTab === 'overview' && (
          <div>
            <div className={styles.sectionHeader}>
              <div>
                <h3 className={styles.sectionTitle}>Institutional Identity & Physical Campus</h3>
                <p className={styles.sectionSub}>
                  Official public digital sanctuary recognized by the Sri Lanka Ministry of
                  Education.
                </p>
              </div>
            </div>

            <div className={styles.censusGrid}>
              <div className={styles.censusCard}>
                <h3>🏢 Identity & Official Contacts</h3>
                <dl className={styles.censusDl}>
                  <dt>Established</dt>
                  <dd>{fact.establishedYear ?? 'Historic'}</dd>
                  <dt>School Category</dt>
                  <dd>{fact.type}</dd>
                  <dt>Telephone</dt>
                  <dd>{fact.telNo ?? 'Not listed'}</dd>
                  <dt>Contact Email</dt>
                  <dd>{fact.contactEmail ?? 'contact@school.edu.lk'}</dd>
                  <dt>Official Portal</dt>
                  <dd>
                    {fact.website ? (
                      <a href={fact.website} target="_blank" rel="noopener noreferrer">
                        Visit Official Domain ↗
                      </a>
                    ) : (
                      'Gurudevi Sovereign Sanctuary'
                    )}
                  </dd>
                  <dt>Timezone</dt>
                  <dd>{fact.timezone}</dd>
                </dl>
              </div>

              <div className={styles.censusCard}>
                <h3>📍 Campus Location & Gate Verification</h3>
                <p
                  style={{
                    margin: '0 0 1rem',
                    fontSize: '0.95rem',
                    color: '#555',
                    lineHeight: 1.5,
                  }}
                >
                  {fact.address ?? `${census.districtName}, ${census.provinceName} Province`}
                </p>
                <dl className={styles.censusDl}>
                  <dt>Latitude</dt>
                  <dd>{census.latitude ?? '6.9271'}</dd>
                  <dt>Longitude</dt>
                  <dd>{census.longitude ?? '79.8612'}</dd>
                  <dt>Verification</dt>
                  <dd>{census.isGroundTruthed ? '✓ Ground Truthed Gate' : 'Postal Centroid'}</dd>
                  <dt>Education Zone</dt>
                  <dd>{census.zoneName ?? 'Central Zone'}</dd>
                </dl>
              </div>
            </div>

            {/* Featured Articles preview on overview */}
            {articles.length > 0 && (
              <div style={{ marginTop: '2.5rem' }}>
                <div className={styles.sectionHeader}>
                  <div>
                    <h3 className={styles.sectionTitle}>
                      📰 Latest from Student Media & Journalism
                    </h3>
                    <p className={styles.sectionSub}>
                      Authored by student societies and published under faculty safeguarding review.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('publications')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#7a1c20',
                      fontWeight: 750,
                      cursor: 'pointer',
                      fontSize: '0.95rem',
                    }}
                  >
                    View All ({articles.length}) ➔
                  </button>
                </div>

                <div className={styles.articlesGrid}>
                  {articles.slice(0, 3).map((article) => (
                    <article key={article.id} className={styles.articleCard}>
                      <div>
                        <div className={styles.articleHeader}>
                          <span className={styles.categoryBadge}>
                            {article.kind.replace('_', ' ')}
                          </span>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#7a1c20' }}>
                            {article.language.toUpperCase()}
                          </span>
                        </div>
                        <h4 className={styles.articleTitle}>{article.title}</h4>
                        <p className={styles.articleExcerpt}>{article.summary}</p>
                      </div>

                      <div className={styles.articleFooter}>
                        <span>{article.subEntityName}</span>
                        <Link
                          href={`/school/${fact.handle}/articles/${article.slug ?? article.id}`}
                          className={styles.readStoryLink}
                        >
                          Read Story ➔
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab: Publications & News (EmDash CMS) */}
        {activeTab === 'publications' && (
          <div>
            <div className={styles.sectionHeader}>
              <div>
                <h3 className={styles.sectionTitle}>School Editorial Commons (පාසල් මාධ්‍ය)</h3>
                <p className={styles.sectionSub}>
                  Student-authored articles, match reports, society journals, and official
                  bulletins.
                </p>
              </div>

              {/* Category Filter Chips */}
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    style={{
                      padding: '0.4rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid #ded8cf',
                      background: selectedCategory === cat ? '#7a1c20' : '#ffffff',
                      color: selectedCategory === cat ? '#ffffff' : '#554f47',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      textTransform: 'capitalize',
                    }}
                  >
                    {cat.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {filteredArticles.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#6b635b' }}>
                <p style={{ fontSize: '2.5rem', margin: '0 0 0.5rem' }}>📰</p>
                <h3>No articles published in this category yet.</h3>
                <p>Articles published via the Student Media Desk will appear here.</p>
              </div>
            ) : (
              <div className={styles.articlesGrid}>
                {filteredArticles.map((article) => (
                  <article key={article.id} className={styles.articleCard}>
                    <div>
                      <div className={styles.articleHeader}>
                        <span className={styles.categoryBadge}>
                          {article.kind.replace('_', ' ')}
                        </span>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#7a1c20' }}>
                          {article.language.toUpperCase()}
                        </span>
                      </div>

                      <h4 className={styles.articleTitle}>{article.title}</h4>
                      <p className={styles.articleExcerpt}>{article.summary}</p>
                    </div>

                    <div className={styles.articleFooter}>
                      <div>
                        <strong>By {article.authorName}</strong>
                        <div style={{ fontSize: '0.75rem', color: '#8c8275' }}>
                          {article.subEntityName}
                        </div>
                      </div>

                      <Link
                        href={`/school/${fact.handle}/articles/${article.slug ?? article.id}`}
                        className={styles.readStoryLink}
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

        {/* Tab: Roll of Honor */}
        {activeTab === 'honor' && (
          <div>
            <div className={styles.sectionHeader}>
              <div>
                <h3 className={styles.sectionTitle}>Living Roll of Honor (පාසල් නාමාවලිය)</h3>
                <p className={styles.sectionSub}>
                  Chronological record of school principals, visionary reformers, and leadership
                  tenures.
                </p>
              </div>
            </div>

            <div className={styles.rollGrid}>
              {rollOfHonor.map((tenure) => (
                <article
                  key={tenure.id}
                  className={`${styles.rollItem} ${tenure.isCurrent ? styles.rollItemCurrent : ''}`}
                >
                  <div className={styles.rollYears}>
                    {tenure.tenureStart} – {tenure.tenureEnd ?? 'Present'}
                  </div>

                  <div className={styles.rollDetails}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <h3>{tenure.personName}</h3>
                      {tenure.nameSi && (
                        <span style={{ color: '#7a1c20', fontWeight: 700 }}>({tenure.nameSi})</span>
                      )}
                    </div>
                    <span>{tenure.roleTitle}</span>
                    {tenure.citation && <p className={styles.rollCitation}>{tenure.citation}</p>}
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        {/* Tab: Societies & Clubs */}
        {activeTab === 'societies' && (
          <div>
            <div className={styles.sectionHeader}>
              <div>
                <h3 className={styles.sectionTitle}>Co-Curricular Societies & Student Guilds</h3>
                <p className={styles.sectionSub}>
                  Active clubs, academic circles, and sports platoon fraternities.
                </p>
              </div>
            </div>

            <div className={styles.societiesGrid}>
              {societies.map((soc) => (
                <div key={soc.id} className={styles.societyCard}>
                  <span className={styles.categoryBadge} style={{ marginBottom: '0.5rem' }}>
                    {soc.category}
                  </span>
                  <h4 className={styles.societyName}>{soc.name}</h4>
                  {soc.nameSi && (
                    <span style={{ fontSize: '0.85rem', color: '#7a1c20', fontWeight: 650 }}>
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
          </div>
        )}

        {/* Tab: MoE Registry */}
        {activeTab === 'census' && (
          <div>
            <div className={styles.sectionHeader}>
              <div>
                <h3 className={styles.sectionTitle}>
                  Ministry of Education Master Census Fact Binding
                </h3>
                <p className={styles.sectionSub}>
                  Verified institutional records bound to the Sri Lanka National Education Atlas.
                </p>
              </div>
            </div>

            <div className={styles.censusGrid}>
              <div className={styles.censusCard}>
                <h3>🏛️ National Census Dossier</h3>
                <dl className={styles.censusDl}>
                  <dt>Census Number</dt>
                  <dd>{census.censusNo}</dd>
                  <dt>Province</dt>
                  <dd>{census.provinceName} Province</dd>
                  <dt>District</dt>
                  <dd>{census.districtName}</dd>
                  <dt>Education Zone</dt>
                  <dd>{census.zoneName ?? 'Central'}</dd>
                  <dt>Education Division</dt>
                  <dd>{census.divisionName ?? 'Zone Division'}</dd>
                  <dt>GN Division</dt>
                  <dd>{census.gnDivision ?? 'Unmapped'}</dd>
                </dl>
              </div>

              <div className={styles.censusCard}>
                <h3>📊 Resource & Social Equity Indicators</h3>
                <dl className={styles.censusDl}>
                  <dt>C-ARI Tier</dt>
                  <dd>{census.cariTier ?? 'Standard'}</dd>
                  <dt>Difficulty Index</dt>
                  <dd>{census.difficultyLevel ?? 'Standard Urban'}</dd>
                  <dt>Midday Feeding</dt>
                  <dd>{census.hasMiddayMeal ? 'Active State Program' : 'Not Participating'}</dd>
                  <dt>Coordinate Quality</dt>
                  <dd>{census.coordPrecision ?? 'Postal Centroid'}</dd>
                  <dt>Gate GPS</dt>
                  <dd>
                    {census.latitude}, {census.longitude}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Sanctuary QR */}
        {activeTab === 'qr' && (
          <div className={styles.qrCard}>
            <div className={styles.qrVisual}>
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
                <rect x="152" y="144" width="12" height="12" fill="#1F1D1A" rx="2" />
                <rect x="140" y="160" width="12" height="12" fill="#1F1D1A" rx="2" />
                <rect x="160" y="160" width="12" height="12" fill="#1F1D1A" rx="2" />
              </svg>
              <span
                style={{
                  fontSize: '0.75rem',
                  color: '#71695f',
                  maxWidth: 220,
                  wordBreak: 'break-all',
                }}
              >
                {qrPayload}
              </span>
            </div>

            <div className={styles.qrDetails}>
              <h2>Official Institutional Sanctuary Invitation</h2>
              <p>
                Scan this QR code from the Gurudevi mobile or web camera to enter{' '}
                <strong>{fact.name}</strong> digital sanctuary.
              </p>

              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className={styles.heroActionBtnPrimary}
                  onClick={() => copyToClipboard(qrPayload, 'Sanctuary QR Link')}
                >
                  <span>📋</span> Copy Invitation Link
                </button>
                <a
                  href={`gurudevi://qr?action=join_school&school_id=${fact.id}`}
                  className={styles.heroActionBtnSecondary}
                  style={{ color: '#1f1d1a', background: '#f3ece1', borderColor: '#ded8cf' }}
                >
                  <span>📱</span> Launch Native Sanctuary
                </a>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 5. Public Institutional Footer */}
      <footer className={styles.publicFooter}>
        <div className={styles.footerInner}>
          <div className={styles.footerText}>
            <strong>{fact.name} · Democratic Socialist Republic of Sri Lanka</strong>
            <p>
              Official Digital Institutional Surface · Ministry of Education Census Registry #{' '}
              {census.censusNo} · Powered by Gurudevi Sovereign Sanctuary.
            </p>
          </div>

          <div className={styles.footerLinks}>
            <Link href={`/school/${fact.handle}`}>School Home</Link>
            <a href="https://sanctuary.gurudevi.app/welcome">Educator Portal</a>
            <a href="https://sanctuary.gurudevi.app/sign-in">Student Login</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
