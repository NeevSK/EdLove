import { Link } from '@tanstack/react-router';
import { resolveSurfaceUrl } from '@/lib/surface-urls';
import type { SchoolEditorialDraft, SchoolProfileData } from '@/lib/domain';
import { SanctuaryShell } from '../../../../components/SanctuaryShell';
import styles from './article.module.css';

/** Clean a school id and article slug taken from a shared link. */
export function articleAddress(
  id: string,
  slug: string,
): Readonly<{ schoolId: string; slug: string }> {
  return {
    schoolId: id.replace(/[^A-Za-z0-9_-]/g, '').slice(0, 64),
    slug: slug.replace(/[^A-Za-z0-9_-]/g, '').slice(0, 80),
  };
}

/** The article a slug names: matched on its slug, its id, or a fragment of its id. */
export function findArticle(
  drafts: readonly SchoolEditorialDraft[],
  slug: string,
): SchoolEditorialDraft | undefined {
  return drafts.find((d) => d.slug === slug || d.id === slug || d.id.includes(slug));
}

/** A school's published article, read on the school's own public page. */
export function SchoolArticleReader({
  schoolId,
  slug,
  profile,
  drafts,
}: Readonly<{
  schoolId: string;
  slug: string;
  profile: SchoolProfileData;
  drafts: readonly SchoolEditorialDraft[];
}>) {
  // Locate article by slug or ID
  const article = findArticle(drafts, slug);

  if (!article) {
    return (
      <main id="main-content" className={styles.articleContainer}>
        <div style={{ padding: '1rem 0' }}>
          <Link to="/school/$id" params={{ id: schoolId }} className={styles.backLink}>
            ← Back to {profile.fact.name} Official Website
          </Link>
        </div>
        <div className={styles.headerCard}>
          <h1 className={styles.title}>Publication Not Found</h1>
          <p className={styles.summary}>
            The article with slug &ldquo;{slug}&rdquo; could not be found or may still be awaiting
            faculty review.
          </p>
          <div>
            <Link to="/school/$id" params={{ id: schoolId }} className={styles.backLink}>
              Return to School Homepage ➔
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fbf9f5' }}>
      {/* Public Article Reader Header */}
      <header
        style={{
          borderBottom: '1px solid #ded8cf',
          background: 'rgba(255, 253, 248, 0.95)',
          backdropFilter: 'blur(12px)',
          padding: '0.85rem 1.5rem',
          position: 'sticky',
          top: 0,
          zIndex: 40,
        }}
      >
        <div
          style={{
            maxWidth: 860,
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Link
            to="/school/$id" params={{ id: schoolId }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              textDecoration: 'none',
              color: '#7a1c20',
              fontWeight: 750,
              fontSize: '0.92rem',
            }}
          >
            <span>←</span> {profile.fact.name} Commons
          </Link>

          <a
            href={resolveSurfaceUrl('sanctuary', '/sign-in')}
            style={{
              background: '#1f1d1a',
              color: '#ffffff',
              padding: '0.45rem 0.9rem',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            Enter Sanctuary ➔
          </a>
        </div>
      </header>

      <main id="main-content" className={styles.articleContainer}>
        {/* Article Header Card */}
        <header className={styles.headerCard}>
          <div className={styles.badgesRow}>
            <span className={styles.categoryBadge}>{article.kind.replace('_', ' ')}</span>
            <span className={styles.langPill}>{article.language.toUpperCase()}</span>
            {article.safeguardingConsent && (
              <span className={styles.safeguardingPill}>✓ Child Safeguarding & PDPA Verified</span>
            )}
          </div>

          <h1 className={styles.title}>{article.title}</h1>

          {article.summary && <p className={styles.summary}>{article.summary}</p>}

          <div className={styles.authorMeta}>
            <div>
              <strong>By {article.authorName}</strong>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                {article.subEntityName} • {profile.fact.name}
              </div>
            </div>

            <div>
              <span>
                Published: {new Date(article.publishedAt ?? article.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </header>

        {/* Article Body Content Card */}
        <article className={styles.bodyCard}>
          <div className={styles.bodyContent}>{article.body}</div>
        </article>

        {/* Footer & Provenance */}
        <footer className={styles.footerBar}>
          <div>
            <strong>Institutional Provenance:</strong> Published by {profile.fact.name} Media Unit
            on Gurudevi School Commons.
          </div>
          <div>
            <Link to="/school/$id" params={{ id: schoolId }} className={styles.backLink}>
              View More Publications ➔
            </Link>
          </div>
        </footer>
      </main>
    </div>
  );
}
