import type { PackFile, PackManifest, Quality } from './packManifest';

/**
 * Which files of a pack to fetch for this person on this device. One language and one quality
 * for the main content; every language-neutral file; captions and transcripts in each language
 * the person reads. If it doesn't fit, quality steps down before the plan gives up, and it says
 * why. It never plans a half download.
 */

export interface DeviceBudget {
  /** Free storage on the device. */
  readonly freeBytes: number;
  /** Storage to leave free for the rest of the phone. */
  readonly keepFreeBytes: number;
  readonly metered: boolean;
  /** How much a metered connection may use for this download. */
  readonly dataBudgetBytes: number;
}

export interface PlanPolicy {
  /** Quality when unmetered with room to spare. */
  readonly preferred: Quality;
  /** Quality to start from on a metered connection. */
  readonly onMetered: Quality;
}

export const DEFAULT_PLAN_POLICY: PlanPolicy = { preferred: 'standard', onMetered: 'low' };

export type PlanReason =
  | 'stepped_down_quality'
  | 'language_fallback'
  | 'not_enough_space'
  | 'over_data_budget'
  | 'no_variant';

export interface DownloadPlan {
  readonly fits: boolean;
  /** Files to have on the device for this pack. */
  readonly files: readonly PackFile[];
  /** Of those, the ones not already on the device. */
  readonly toFetch: readonly PackFile[];
  readonly fetchBytes: number;
  readonly language: string | null;
  readonly quality: Quality | null;
  readonly reasons: readonly PlanReason[];
}

const QUALITIES: readonly Quality[] = ['low', 'standard', 'high'];

/** Qualities to try: `start`, then lower ones, then higher ones only if nothing at or below exists. */
const qualitiesFrom = (start: Quality) => {
  const i = QUALITIES.indexOf(start);
  return [...QUALITIES.slice(0, i + 1).reverse(), ...QUALITIES.slice(i + 1)];
};

function pickLanguage(
  files: readonly PackFile[],
  languages: readonly string[],
): { language: string | null; fallback: boolean } {
  const offered = new Set(
    files.filter((f) => f.role === 'main' && f.language !== undefined).map((f) => f.language),
  );
  if (offered.size === 0) return { language: null, fallback: false };
  const wanted = languages.find((l) => offered.has(l));
  if (wanted !== undefined) return { language: wanted, fallback: false };
  return { language: [...offered].sort()[0] ?? null, fallback: true };
}

function selectFor(
  files: readonly PackFile[],
  language: string | null,
  quality: Quality,
  readable: ReadonlySet<string>,
) {
  const languageOk = (f: PackFile) => f.language === undefined || f.language === language;
  const mains = files.filter((f) => f.role === 'main' && languageOk(f));
  const qualities = new Set(mains.map((f) => f.quality));
  // A main file in exactly this quality, or the single-quality one when no variants exist.
  const chosenQuality = qualities.has(quality)
    ? quality
    : qualities.has(undefined)
      ? undefined
      : null;
  if (chosenQuality === null) return null;
  return files.filter((f) => {
    if (f.role === 'main') return languageOk(f) && f.quality === chosenQuality;
    if (f.role === 'caption' || f.role === 'transcript')
      return f.language === undefined || readable.has(f.language);
    return (
      languageOk(f) &&
      (f.quality === undefined || f.quality === chosenQuality || !qualities.has(f.quality))
    );
  });
}

/**
 * `have` holds the SHA-256 of files already on the device, so packs that share files (H5P
 * libraries, a sequence's images) and interrupted downloads aren't fetched twice.
 */
export function planDownload(
  manifest: PackManifest,
  languages: readonly string[],
  budget: DeviceBudget,
  have: ReadonlySet<string> = new Set(),
  policy: PlanPolicy = DEFAULT_PLAN_POLICY,
): DownloadPlan {
  const reasons: PlanReason[] = [];
  const { language, fallback } = pickLanguage(manifest.files, languages);
  if (fallback) reasons.push('language_fallback');
  const readable = new Set(language === null ? languages : [language, ...languages]);
  const room = budget.freeBytes - budget.keepFreeBytes;
  const start = budget.metered ? policy.onMetered : policy.preferred;

  let lastReason: PlanReason = 'no_variant';
  let tooBig = false;
  for (const quality of qualitiesFrom(start)) {
    const files = selectFor(manifest.files, language, quality, readable);
    if (files === null) continue;
    // Once a quality didn't fit, a higher one won't either.
    if (tooBig && QUALITIES.indexOf(quality) > QUALITIES.indexOf(start)) break;
    if (tooBig) reasons.push('stepped_down_quality');
    const toFetch = files.filter((f) => !have.has(f.sha256));
    const fetchBytes = toFetch.reduce((sum, f) => sum + f.bytes, 0);
    if (fetchBytes > room) {
      lastReason = 'not_enough_space';
      tooBig = true;
      continue;
    }
    if (budget.metered && fetchBytes > budget.dataBudgetBytes) {
      lastReason = 'over_data_budget';
      tooBig = true;
      continue;
    }
    const hasQualities = files.some((f) => f.role === 'main' && f.quality !== undefined);
    return {
      fits: true,
      files,
      toFetch,
      fetchBytes,
      language,
      quality: hasQualities ? quality : null,
      reasons: [...new Set(reasons)],
    };
  }
  return {
    fits: false,
    files: [],
    toFetch: [],
    fetchBytes: 0,
    language,
    quality: null,
    reasons: [...new Set([...reasons, lastReason])],
  };
}
