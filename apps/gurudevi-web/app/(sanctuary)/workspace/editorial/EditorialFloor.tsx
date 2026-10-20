'use client';

import Link from 'next/link';
import React, { useEffect, useMemo, useState } from 'react';
import {
  type EditorialContentKind,
  type EditorialLanguage,
  editorialHexagonalService,
  type SchoolEditorialDraft,
} from '@/lib/domain';
import styles from './editorial.module.css';

interface EditorialFloorProps {
  schoolId?: string;
  authorName?: string;
  isFaculty?: boolean;
}

const SOCIETIES = [
  { id: 'society-media-unit', name: 'Media Unit (මාධ්‍ය ඒකකය)' },
  { id: 'society-ict', name: 'ICT Society (තොරතුරු තාක්ෂණ සංගමය)' },
  { id: 'society-science', name: 'Science Society (විද්‍යා සංගමය)' },
  { id: 'board-prefects', name: 'Board of Senior Prefects' },
  { id: 'sports-council', name: 'Sports Council & Athletic Association' },
];

export function EditorialFloor({
  schoolId = 'school-ananda-colombo',
  authorName = 'Student Contributor',
  isFaculty = true,
}: Readonly<EditorialFloorProps>) {
  const [drafts, setDrafts] = useState<readonly SchoolEditorialDraft[]>([]);
  const [activeTab, setActiveTab] = useState<'author' | 'outbox' | 'review' | 'commons'>('author');
  const [selectedSocietyId, setSelectedSocietyId] = useState('society-media-unit');

  // Authoring Form State
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [body, setBody] = useState('');
  const [language, setLanguage] = useState<EditorialLanguage>('en');
  const [kind, setKind] = useState<EditorialContentKind>('match_report');
  const [safeguardingConsent, setSafeguardingConsent] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Load drafts on mount
  useEffect(() => {
    let active = true;
    void editorialHexagonalService.listDrafts(schoolId).then((loaded) => {
      if (active) setDrafts(loaded);
    });
    return () => {
      active = false;
    };
  }, [schoolId]);

  const activeSociety = useMemo(() => {
    return SOCIETIES.find((s) => s.id === selectedSocietyId) ?? SOCIETIES[0];
  }, [selectedSocietyId]);

  const reviewPendingCount = useMemo(() => {
    return drafts.filter((d) => d.status === 'submitted' || d.status === 'in_review').length;
  }, [drafts]);

  const publishedCount = useMemo(() => {
    return drafts.filter((d) => d.status === 'published').length;
  }, [drafts]);

  const handleSubmitDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;

    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      const created = await editorialHexagonalService.submitDraft({
        schoolId,
        schoolName: 'Ananda College',
        subEntityId: activeSociety?.id ?? 'society-media-unit',
        subEntityName: activeSociety?.name ?? 'Media Unit',
        authorName,
        title: title.trim(),
        summary: summary.trim() || title.trim(),
        body: body.trim(),
        language,
        kind,
        safeguardingConsent,
      });

      setDrafts((prev) => [created, ...prev]);
      setTitle('');
      setSummary('');
      setBody('');
      setStatusMessage('Article draft submitted for Teacher-in-Charge (TIC) review!');
      setActiveTab('outbox');
    } catch (err: unknown) {
      setStatusMessage(err instanceof Error ? err.message : 'Failed to submit article.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReviewDecision = async (
    id: string,
    decision: 'in_review' | 'approved' | 'rejected',
  ) => {
    try {
      const note =
        decision === 'approved' ? 'Verified by Teacher-in-Charge.' : 'Revision requested.';
      const updated = await editorialHexagonalService.reviewDraft(
        id,
        'tic-faculty-reviewer',
        decision,
        note,
      );
      setDrafts((prev) => prev.map((d) => (d.id === id ? updated : d)));
    } catch (err: unknown) {
      setStatusMessage(err instanceof Error ? err.message : 'Review action failed.');
    }
  };

  const handlePublish = async (id: string, proposedSlug: string) => {
    try {
      const published = await editorialHexagonalService.publishApproved(id, proposedSlug);
      setDrafts((prev) => prev.map((d) => (d.id === id ? published : d)));
      setStatusMessage(`Article published to edge commons! Slug: /articles/${published.slug}`);
    } catch (err: unknown) {
      setStatusMessage(err instanceof Error ? err.message : 'Publish failed.');
    }
  };

  return (
    <div className={styles.container}>

      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerTitleArea}>
          <span className={styles.schoolBadge} role="img" aria-label="School Emblem">
            🏛
          </span>
          <div>
            <h1 className={styles.title}>School Editorial Commons</h1>
            <p className={styles.subtitle}>
              Decentralized student journalism, match reports, and society publications with
              Teacher-in-Charge oversight.
            </p>
          </div>
        </div>

        <div className={styles.metaControls}>
          <label htmlFor="society-select" className={styles.label}>
            Active Club:
          </label>
          <select
            id="society-select"
            className={styles.societySelect}
            value={selectedSocietyId}
            onChange={(e) => setSelectedSocietyId(e.target.value)}
          >
            {SOCIETIES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <Link
            href={`/school/${schoolId}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.5rem 0.9rem',
              borderRadius: '8px',
              background: '#f3ece1',
              border: '1px solid #ded8cf',
              color: '#7a1c20',
              fontWeight: 700,
              fontSize: '0.85rem',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            <span>↗</span> Live School Website
          </Link>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className={styles.tabsBar} role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'author'}
          className={`${styles.tabBtn} ${activeTab === 'author' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('author')}
        >
          ✍️ Author Desk
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'outbox'}
          className={`${styles.tabBtn} ${activeTab === 'outbox' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('outbox')}
        >
          📋 Outbox <span className={styles.countPill}>{drafts.length}</span>
        </button>

        {isFaculty && (
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'review'}
            className={`${styles.tabBtn} ${activeTab === 'review' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('review')}
          >
            🧑‍🏫 TIC Review Queue{' '}
            {reviewPendingCount > 0 && (
              <span className={styles.countPill}>{reviewPendingCount}</span>
            )}
          </button>
        )}

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'commons'}
          className={`${styles.tabBtn} ${activeTab === 'commons' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('commons')}
        >
          🌐 Edge Commons <span className={styles.countPill}>{publishedCount}</span>
        </button>
      </div>

      {statusMessage && (
        <div className={styles.consentCard} role="status">
          <strong>Notice:</strong> {statusMessage}
        </div>
      )}

      {/* Tab: Author Desk */}
      {activeTab === 'author' && (
        <div className={styles.editorGrid}>
          {/* Author Form */}
          <form className={styles.pane} onSubmit={handleSubmitDraft}>
            <h2 className={styles.paneTitle}>New Article Submission</h2>

            <div className={styles.formGroup}>
              <label htmlFor="article-title" className={styles.label}>
                Headline / Title
              </label>
              <input
                id="article-title"
                className={styles.input}
                type="text"
                placeholder="e.g. 197th Battle of the Maroons — Day 1 Live Report"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="article-summary" className={styles.label}>
                Executive Summary / Dek
              </label>
              <input
                id="article-summary"
                className={styles.input}
                type="text"
                placeholder="Brief one-sentence summary for search and previews"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className={styles.formGroup}>
                <label htmlFor="article-lang" className={styles.label}>
                  Language
                </label>
                <select
                  id="article-lang"
                  className={styles.select}
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as EditorialLanguage)}
                >
                  <option value="en">English</option>
                  <option value="si">සිංහල (Sinhala)</option>
                  <option value="ta">தமிழ் (Tamil)</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="article-kind" className={styles.label}>
                  Category
                </label>
                <select
                  id="article-kind"
                  className={styles.select}
                  value={kind}
                  onChange={(e) => setKind(e.target.value as EditorialContentKind)}
                >
                  <option value="match_report">Big Match Report</option>
                  <option value="honors">Roll of Honor / Awards</option>
                  <option value="society_journal">Society Journal</option>
                  <option value="circular">Official Notice / Circular</option>
                  <option value="original">General Feature</option>
                </select>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="article-body" className={styles.label}>
                Markdown Article Body
              </label>
              <textarea
                id="article-body"
                className={styles.textarea}
                rows={10}
                placeholder="# Introduction&#10;Write student match report or society update here..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                required
              />
            </div>

            {/* PDPA Safeguarding Checkbox */}
            <label className={styles.consentCard}>
              <input
                type="checkbox"
                checked={safeguardingConsent}
                onChange={(e) => setSafeguardingConsent(e.target.checked)}
              />
              <span>
                <strong>Child Safeguarding & PDPA Verified:</strong> Confirmed that photographs of
                identifiable students have parental consent on file and comply with Sri Lanka PDPA
                guidelines.
              </span>
            </label>

            <button
              type="submit"
              className={styles.submitBtn}
              disabled={isSubmitting || !safeguardingConsent || !title.trim()}
            >
              {isSubmitting ? 'Submitting...' : 'Submit for Faculty Review ➔'}
            </button>
          </form>

          {/* Live Preview Pane */}
          <div className={styles.pane}>
            <h2 className={styles.paneTitle}>EmDash Live Preview</h2>
            <div className={styles.previewArea}>
              {title ? (
                <>
                  <h3 className={styles.previewHeading}>{title}</h3>
                  <div className={styles.previewMeta}>
                    <span className={styles.countPill}>{language.toUpperCase()}</span>
                    <span className={styles.countPill}>{kind.replace('_', ' ')}</span>
                    <span className={styles.countPill}>By {authorName}</span>
                    <span className={styles.countPill}>{activeSociety?.name}</span>
                  </div>
                  {summary && (
                    <p style={{ fontStyle: 'italic', color: '#64748b', marginBottom: '1rem' }}>
                      {summary}
                    </p>
                  )}
                  <div className={styles.previewBody}>
                    {body || 'Start writing to see live preview...'}
                  </div>
                </>
              ) : (
                <div style={{ color: '#94a3b8', textAlign: 'center', marginTop: '6rem' }}>
                  <p style={{ fontSize: '2rem' }}>✒️</p>
                  <p>Type a headline and body to preview your article.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Submissions Outbox */}
      {activeTab === 'outbox' && (
        <div className={styles.tableCard}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Title / Headline</th>
                <th>Society / Unit</th>
                <th>Language</th>
                <th>Status</th>
                <th>Submitted</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {drafts.map((d) => (
                <tr key={d.id}>
                  <td>
                    <strong>{d.title}</strong>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>By {d.authorName}</div>
                  </td>
                  <td>{d.subEntityName}</td>
                  <td>
                    <span className={styles.countPill}>{d.language.toUpperCase()}</span>
                  </td>
                  <td>
                    <span
                      className={`${styles.statusPill} ${
                        d.status === 'published'
                          ? styles.statusPublished
                          : d.status === 'approved'
                            ? styles.statusApproved
                            : d.status === 'in_review'
                              ? styles.statusInReview
                              : d.status === 'rejected'
                                ? styles.statusRejected
                                : styles.statusSubmitted
                      }`}
                    >
                      {d.status}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.85rem', color: '#64748b' }}>
                    {new Date(d.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    {d.status === 'published' && d.slug ? (
                      <Link
                        href={`/school/ananda-college/articles/${d.slug}`}
                        className={styles.publicLink}
                      >
                        View on Commons ↗
                      </Link>
                    ) : (
                      <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Awaiting review</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab: TIC Review Queue */}
      {activeTab === 'review' && isFaculty && (
        <div className={styles.tableCard}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Headline & Author</th>
                <th>Category</th>
                <th>Safeguarding</th>
                <th>Current State</th>
                <th>Faculty Action</th>
              </tr>
            </thead>
            <tbody>
              {drafts.map((d) => (
                <tr key={d.id}>
                  <td>
                    <strong>{d.title}</strong>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      {d.authorName} • {d.subEntityName}
                    </div>
                  </td>
                  <td>{d.kind}</td>
                  <td>
                    {d.safeguardingConsent ? (
                      <span style={{ color: '#16a34a', fontWeight: 600 }}>✓ PDPA Verified</span>
                    ) : (
                      <span style={{ color: '#dc2626' }}>⚠ Pending</span>
                    )}
                  </td>
                  <td>
                    <span
                      className={`${styles.statusPill} ${
                        d.status === 'approved'
                          ? styles.statusApproved
                          : d.status === 'published'
                            ? styles.statusPublished
                            : styles.statusInReview
                      }`}
                    >
                      {d.status}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actionBtnGroup}>
                      {d.status === 'submitted' && (
                        <button
                          type="button"
                          className={styles.btnAction}
                          onClick={() => handleReviewDecision(d.id, 'in_review')}
                        >
                          Pick Up Review
                        </button>
                      )}

                      {(d.status === 'submitted' || d.status === 'in_review') && (
                        <>
                          <button
                            type="button"
                            className={`${styles.btnAction} ${styles.btnApprove}`}
                            onClick={() => handleReviewDecision(d.id, 'approved')}
                          >
                            ✓ Approve
                          </button>
                          <button
                            type="button"
                            className={styles.btnAction}
                            style={{ color: '#dc2626' }}
                            onClick={() => handleReviewDecision(d.id, 'rejected')}
                          >
                            Reject
                          </button>
                        </>
                      )}

                      {d.status === 'approved' && (
                        <button
                          type="button"
                          className={`${styles.btnAction} ${styles.btnPublish}`}
                          onClick={() =>
                            handlePublish(
                              d.id,
                              d.title
                                .toLowerCase()
                                .replace(/[^a-z0-9]+/g, '-')
                                .replace(/^-|-$/g, '')
                                .slice(0, 48),
                            )
                          }
                        >
                          🚀 Edge Publish
                        </button>
                      )}

                      {d.status === 'published' && (
                        <span style={{ fontSize: '0.8rem', color: '#16a34a' }}>Live on Edge</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab: Edge Commons Feed */}
      {activeTab === 'commons' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className={styles.consentCard}>
            <span>
              <strong>Wildcard Edge Routing:</strong> Articles published here are immediately
              available on{' '}
              <Link href="/school/ananda" className={styles.publicLink}>
                ananda.gurudevi.app
              </Link>{' '}
              via Cloudflare SWR caching.
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {drafts
              .filter((d) => d.status === 'published')
              .map((article) => (
                <div key={article.id} className={styles.pane} style={{ gap: '0.75rem' }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span className={styles.countPill}>{article.language.toUpperCase()}</span>
                    <span className={`${styles.statusPill} ${styles.statusPublished}`}>Live</span>
                  </div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem' }}>{article.title}</h3>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>
                    {article.summary}
                  </p>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginTop: '0.5rem',
                    }}
                  >
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                      {article.subEntityName}
                    </span>
                    <Link
                      href={`/school/ananda-college/articles/${article.slug ?? article.id}`}
                      className={styles.publicLink}
                      style={{ fontSize: '0.85rem' }}
                    >
                      Read Article ➔
                    </Link>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
