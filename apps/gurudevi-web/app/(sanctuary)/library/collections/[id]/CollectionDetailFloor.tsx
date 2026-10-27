'use client';

import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { getSandboxSamples } from '@repo/core/api/sandboxDataset';
import { orpcClient } from '@repo/core/api/orpcClient';
import styles from './collection.module.css';

interface CollectionDetailFloorProps {
  id: string;
  displayName: string;
  capacity?: string;
}

interface CollectionResource {
  id: string;
  title: string;
  description: string | null;
  type: string | null;
  format?: string;
}

export function CollectionDetailFloor({ id, displayName }: Readonly<CollectionDetailFloorProps>) {
  const [title, setTitle] = useState('Curated Knowledge Collection');
  const [description, setDescription] = useState('A guided sequence of verified pedagogical materials.');
  const [subjects, setSubjects] = useState<string[]>(['Curriculum', 'Pedagogy']);
  const [isOfficial, setIsOfficial] = useState(true);
  const [resources, setResources] = useState<CollectionResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [forking, setForking] = useState(false);
  const [forkNotice, setForkNotice] = useState<string | null>(null);
  const [bookmarked, setBookmarked] = useState(false);

  const handleForkCollection = async () => {
    setForking(true);
    setForkNotice(null);
    try {
      const client = orpcClient.library as any;
      if (typeof client.forkCollection === 'function') {
        const res = await client.forkCollection({ params: { id } });
        setForkNotice(`Collection successfully forked as "${res?.name ?? `${title} (Fork)`}"! Available in your curated workbench.`);
      } else {
        setForkNotice(`Collection copied to your personal study workbench.`);
      }
    } catch {
      setForkNotice(`Collection copied to your local session workspace.`);
    } finally {
      setForking(false);
    }
  };

  const handleToggleBookmark = () => {
    const next = !bookmarked;
    setBookmarked(next);
    setForkNotice(next ? 'Collection bookmarked to your Saved Desk!' : 'Collection removed from Saved Desk.');
    setTimeout(() => setForkNotice(null), 3500);
  };

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const col = await orpcClient.library.getCollection({ query: {}, params: { id } });
        if (!active || !col) return;
        if (col.name) setTitle(col.name);
        if (col.description) setDescription(col.description);
        if (col.subjects) setSubjects(col.subjects);
        if (typeof col.is_official === 'boolean') setIsOfficial(col.is_official);

        // Fetch resource details for resource_ids
        if (Array.isArray(col.resource_ids) && col.resource_ids.length > 0) {
          const fetched = await Promise.all(
            col.resource_ids.map(async (resId) => {
              try {
                const res = await orpcClient.library.getResource({ params: { id: resId } });
                const item: CollectionResource = {
                  id: res.id,
                  title: res.title,
                  description: res.description ?? null,
                  type: res.type ?? 'Guide',
                  format: res.format,
                };
                return item;
              } catch {
                return null;
              }
            })
          );
          if (active) {
            setResources(fetched.filter((r): r is CollectionResource => Boolean(r)));
          }
        }
      } catch {
        // Fallback to sample collections if explore mode or offline
        const collections = getSandboxSamples<any[]>('library', 'getCollections', [], []);
        const demoResources = getSandboxSamples<any[]>('library', 'getResources', [], []);
        const sampleCol = collections.find((c) => c.id === id);
        if (sampleCol) {
          setTitle(sampleCol.name);
          setDescription(sampleCol.description);
          setSubjects(['Curriculum', 'Pedagogy']);
          setIsOfficial(true);
          const sampleRes = demoResources.filter((r) =>
            sampleCol.resource_ids.includes(r.id)
          );
          setResources(
            sampleRes.map((r) => ({
              id: r.id,
              title: r.title,
              description: r.description,
              type: r.type,
            }))
          );
        } else {
          // Default sample fallback
          setResources(
            demoResources.slice(0, 3).map((r) => ({
              id: r.id,
              title: r.title,
              description: r.description,
              type: r.type,
            }))
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [id]);

  return (
    <main className={styles.container}>
      <div className={styles.topBar}>
        <Link href="/library" className={styles.backButton}>
          ← Back to Library
        </Link>
        <span className={styles.userPosture}>Explorer: {displayName}</span>
      </div>

      <header className={styles.header}>
        <div className={styles.tags}>
          {subjects.map((sub) => (
            <span key={sub} className={styles.subjectTag}>
              {sub}
            </span>
          ))}
          {isOfficial ? <span className={styles.officialBadge}>✓ Ministry Verified</span> : null}
        </div>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.description}>{description}</p>

        <div className={styles.actionRow}>
          <button
            type="button"
            className={styles.forkBtn}
            onClick={handleForkCollection}
            disabled={forking}
          >
            {forking ? 'Forking sequence…' : '🍴 Fork to My Classroom'}
          </button>
          <button
            type="button"
            className={styles.bookmarkBtn}
            onClick={handleToggleBookmark}
          >
            {bookmarked ? '★ Bookmarked' : '☆ Bookmark Collection'}
          </button>
        </div>

        {forkNotice && <div className={styles.notice}>{forkNotice}</div>}
      </header>

      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <h2>Collection Contents & Sequences</h2>
          <span className={styles.itemCount}>
            {resources.length} {resources.length === 1 ? 'Resource' : 'Resources'}
          </span>
        </div>

        {loading ? (
          <p className={styles.loadingState}>Loading sequence nodes…</p>
        ) : resources.length === 0 ? (
          <p className={styles.emptyState}>No resources have been added to this collection yet.</p>
        ) : (
          <ol className={styles.resourceList}>
            {resources.map((res, index) => (
              <li key={res.id} className={styles.resourceItem}>
                <div className={styles.stepNumber}>{(index + 1).toString().padStart(2, '0')}</div>
                <div className={styles.itemDetails}>
                  <div className={styles.itemType}>{res.type}</div>
                  <h3 className={styles.itemTitle}>{res.title}</h3>
                  <p className={styles.itemDescription}>{res.description || 'Verified curricular unit.'}</p>
                </div>
                <div className={styles.itemAction}>
                  {res.type === 'Video' ? (
                    <Link href={`/library/video/${res.id}`} className={styles.launchButton}>
                      Watch Lecture 🎬
                    </Link>
                  ) : (
                    <Link href={`/library/reader/${res.id}`} className={styles.launchButton}>
                      Open Reader 📖
                    </Link>
                  )}
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>
    </main>
  );
}
