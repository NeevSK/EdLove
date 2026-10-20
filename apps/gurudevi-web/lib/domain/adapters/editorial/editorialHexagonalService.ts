/**
 * Editorial Hexagonal Service Adapter
 *
 * Implements IWebEditorialPort.
 * Provides offline-first local storage, canonical school editorial drafts,
 * and handles the student submission -> faculty TIC review -> edge publish lifecycle.
 */

import { storage } from '@repo/core/lib/storage';
import type { IWebEditorialPort, SchoolEditorialDraft } from '../../ports/editorial.port';

const EDITORIAL_STORAGE_KEY = 'gurudevi:domain:school:editorial:drafts:v1';

export const CANONICAL_EDITORIAL_DRAFTS: SchoolEditorialDraft[] = [
  {
    id: 'draft-maroons-2026',
    schoolId: 'school-ananda-colombo',
    schoolName: 'Ananda College',
    subEntityId: 'society-media-unit',
    subEntityName: 'Media Unit (මාධ්‍ය ඒකකය)',
    authorName: 'Sithum Bandara (Grade 12)',
    title: '197th Battle of the Maroons — Day 1 Match Report',
    summary: 'Opening batsmen construct a solid 140-run partnership at the SSC ground.',
    body: `# 197th Battle of the Maroons
Under bright Colombo skies, the annual cricketing encounter opened with electric energy.
The opening pair showed textbook patience against the new ball attack...`,
    language: 'en',
    kind: 'match_report',
    status: 'published',
    safeguardingConsent: true,
    reviewerId: 'tic-cricket-perera',
    reviewerNotes: 'Verified with senior master-in-charge. Excellent reporting.',
    createdAt: '2026-03-05T08:30:00.000Z',
    updatedAt: '2026-03-05T16:00:00.000Z',
    slug: 'battle-of-maroons-day-1-report',
    publishedAt: '2026-03-05T16:00:00.000Z',
  },
  {
    id: 'draft-olympiad-2026',
    schoolId: 'school-ananda-colombo',
    schoolName: 'Ananda College',
    subEntityId: 'society-science',
    subEntityName: 'Science Society (විද්‍යා සංගමය)',
    authorName: 'Kavindu Senarath',
    title: 'ජාතික විද්‍යා ඔලිම්පියාඩ් රන් පදක්කම් ද්විත්වයක්',
    summary: 'ජාතික මට්ටමේ ජීව විද්‍යා සහ භෞතික විද්‍යා තරගාවලියේ විශිෂ්ට ජයග්‍රහණ.',
    body: `# විද්‍යා ඔලිම්පියාඩ් ජයග්‍රහණ
ආනන්ද විද්‍යාලයීය විද්‍යා සංගමයේ සාමාජිකයින් ජාතික තලයේ ඔලිම්පියාඩ් තරගාවලියේදී රන් පදක්කම් දෙකක් දිනා ගැනීමට සමත් විය...`,
    language: 'si',
    kind: 'honors',
    status: 'approved',
    safeguardingConsent: true,
    reviewerId: 'tic-science-disanayake',
    reviewerNotes: 'Approved for publication on the official school domain.',
    createdAt: '2026-03-12T10:00:00.000Z',
    updatedAt: '2026-03-13T11:30:00.000Z',
  },
  {
    id: 'draft-investiture-2026',
    schoolId: 'school-ananda-colombo',
    schoolName: 'Ananda College',
    subEntityId: 'board-prefects',
    subEntityName: 'Board of Senior Prefects',
    authorName: 'Head Prefect Office',
    title: 'Senior Prefects Investiture Ceremony 2026 Circular',
    summary: 'Official protocol and dress code for the upcoming badge pinning ceremony.',
    body: `# Official Circular: Investiture 2026
The annual investiture of the Senior Board of Prefects will take place at the Kularatne Hall on March 25th at 8:00 AM...`,
    language: 'en',
    kind: 'circular',
    status: 'submitted',
    safeguardingConsent: true,
    createdAt: '2026-03-15T09:15:00.000Z',
    updatedAt: '2026-03-15T09:15:00.000Z',
  },
];

class EditorialHexagonalService implements IWebEditorialPort {
  private memoryCache: SchoolEditorialDraft[] | null = null;

  private async loadDrafts(): Promise<SchoolEditorialDraft[]> {
    if (this.memoryCache) return this.memoryCache;

    try {
      const stored = storage.getString(EDITORIAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as SchoolEditorialDraft[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.memoryCache = parsed;
          return parsed;
        }
      }
    } catch {
      // Storage unavailable or unparseable; fall back to defaults
    }

    this.memoryCache = [...CANONICAL_EDITORIAL_DRAFTS];
    return this.memoryCache;
  }

  private async saveDrafts(drafts: SchoolEditorialDraft[]): Promise<void> {
    this.memoryCache = drafts;
    try {
      storage.set(EDITORIAL_STORAGE_KEY, JSON.stringify(drafts));
    } catch {
      // Storage write error ignored in read-only / SSR environments
    }
  }

  async listDrafts(schoolId?: string): Promise<readonly SchoolEditorialDraft[]> {
    const drafts = await this.loadDrafts();
    if (!schoolId) return drafts;
    return drafts.filter((d) => d.schoolId === schoolId);
  }

  async submitDraft(
    draftInput: Omit<SchoolEditorialDraft, 'id' | 'status' | 'createdAt' | 'updatedAt'>,
  ): Promise<SchoolEditorialDraft> {
    const drafts = await this.loadDrafts();
    const now = new Date().toISOString();
    const id = `draft-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

    const newDraft: SchoolEditorialDraft = {
      ...draftInput,
      id,
      status: 'submitted',
      createdAt: now,
      updatedAt: now,
    };

    const next = [newDraft, ...drafts];
    await this.saveDrafts(next);
    return newDraft;
  }

  async reviewDraft(
    id: string,
    reviewerId: string,
    decision: 'in_review' | 'approved' | 'rejected',
    notes?: string,
  ): Promise<SchoolEditorialDraft> {
    const drafts = await this.loadDrafts();
    const index = drafts.findIndex((d) => d.id === id);
    if (index === -1) {
      throw new Error(`Editorial draft '${id}' not found.`);
    }

    const current = drafts[index];
    if (!current) throw new Error(`Editorial draft '${id}' not found.`);

    const updated: SchoolEditorialDraft = {
      ...current,
      status: decision,
      reviewerId,
      reviewerNotes: notes,
      updatedAt: new Date().toISOString(),
    };

    const next = [...drafts];
    next[index] = updated;
    await this.saveDrafts(next);
    return updated;
  }

  async publishApproved(id: string, slug: string): Promise<SchoolEditorialDraft> {
    const drafts = await this.loadDrafts();
    const index = drafts.findIndex((d) => d.id === id);
    if (index === -1) {
      throw new Error(`Editorial draft '${id}' not found.`);
    }

    const current = drafts[index];
    if (!current) throw new Error(`Editorial draft '${id}' not found.`);

    if (current.status !== 'approved') {
      throw new Error(
        `Cannot publish draft '${id}' with status '${current.status}'. Must be 'approved'.`,
      );
    }

    const now = new Date().toISOString();
    const cleanSlug = slug
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '-')
      .replace(/-+/g, '-');

    const published: SchoolEditorialDraft = {
      ...current,
      status: 'published',
      slug: cleanSlug,
      publishedAt: now,
      updatedAt: now,
    };

    const next = [...drafts];
    next[index] = published;
    await this.saveDrafts(next);
    return published;
  }

  async getPublishedArticles(schoolId: string): Promise<readonly SchoolEditorialDraft[]> {
    const drafts = await this.loadDrafts();
    return drafts.filter((d) => d.schoolId === schoolId && d.status === 'published');
  }
}

export const editorialHexagonalService = new EditorialHexagonalService();
