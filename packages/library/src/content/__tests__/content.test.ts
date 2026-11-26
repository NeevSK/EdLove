import { describe, expect, it } from 'vitest';
import { planDownload } from '../downloadPlan';
import { type PackFile, type PackManifest, readPackManifest } from '../packManifest';
import { verifyPack, webCryptoSha256 } from '../verifyPack';

const hash = (n: number) => n.toString(16).padStart(64, '0');
const MB = 1024 * 1024;
const file = (
  path: string,
  role: PackFile['role'],
  bytes: number,
  n: number,
  extra: Partial<PackFile> = {},
): PackFile => ({
  path,
  role,
  mediaType: 'video/mp4',
  bytes,
  sha256: hash(n),
  ...extra,
});

const manifest: PackManifest = {
  format: 'gurudevi-pack',
  formatVersion: 1,
  packId: 'pack:fractions-intro@3',
  workId: 'work:fractions-intro',
  versionId: 'version:fractions-intro@3',
  kind: 'video',
  title: { si: 'භාග හැඳින්වීම', ta: 'பின்னங்கள் அறிமுகம்', en: 'Introducing fractions' },
  licence: { id: 'CC-BY-4.0', attribution: 'A teacher, Kandy' },
  files: [
    file('video/si-low.mp4', 'main', 40 * MB, 1, { language: 'si', quality: 'low' }),
    file('video/si-standard.mp4', 'main', 120 * MB, 2, { language: 'si', quality: 'standard' }),
    file('video/ta-low.mp4', 'main', 42 * MB, 3, { language: 'ta', quality: 'low' }),
    file('captions/si.vtt', 'caption', 20_000, 4, { language: 'si', mediaType: 'text/vtt' }),
    file('captions/en.vtt', 'caption', 20_000, 5, { language: 'en', mediaType: 'text/vtt' }),
    file('thumb.webp', 'thumbnail', 30_000, 6, { mediaType: 'image/webp' }),
  ],
  requires: [],
};

const roomy = { freeBytes: 4000 * MB, keepFreeBytes: 500 * MB, metered: false, dataBudgetBytes: 0 };

describe('pack manifest', () => {
  it('accepts a well-formed manifest and refuses unsafe or duplicate paths and a pack with no main file', () => {
    expect(readPackManifest(manifest).ok).toBe(true);
    const bad = {
      ...manifest,
      files: [
        file('../x.mp4', 'asset', 1, 7),
        file('a.png', 'asset', 1, 8),
        file('A.png', 'asset', 1, 9),
      ],
    };
    expect(readPackManifest(bad)).toEqual({
      ok: false,
      problems: [
        { code: 'unsafe_path', path: '../x.mp4' },
        { code: 'duplicate_path', path: 'A.png' },
        { code: 'no_main_file' },
      ],
    });
    expect(readPackManifest({ ...manifest, format: 'other' }).ok).toBe(false);
  });
});

describe('download plan', () => {
  it('takes the preferred language and quality, captions the person reads, and neutral files', () => {
    const plan = planDownload(manifest, ['si', 'en'], roomy);
    expect(plan).toMatchObject({ fits: true, language: 'si', quality: 'standard', reasons: [] });
    expect(plan.files.map((f) => f.path)).toEqual([
      'video/si-standard.mp4',
      'captions/si.vtt',
      'captions/en.vtt',
      'thumb.webp',
    ]);
  });

  it('starts low on a metered connection and refuses to go over the data budget', () => {
    const metered = { ...roomy, metered: true, dataBudgetBytes: 50 * MB };
    expect(planDownload(manifest, ['si'], metered)).toMatchObject({ fits: true, quality: 'low' });
    expect(planDownload(manifest, ['si'], { ...metered, dataBudgetBytes: 10 * MB })).toMatchObject({
      fits: false,
      files: [],
      reasons: ['over_data_budget'],
    });
  });

  it('steps quality down when space is short, and says so', () => {
    const tight = { ...roomy, freeBytes: 600 * MB, keepFreeBytes: 500 * MB };
    expect(planDownload(manifest, ['si'], tight)).toMatchObject({
      fits: true,
      quality: 'low',
      reasons: ['stepped_down_quality'],
    });
  });

  it('falls back to an offered language, and uses the only quality a language has', () => {
    expect(planDownload(manifest, ['ta'], roomy)).toMatchObject({
      fits: true,
      language: 'ta',
      quality: 'low',
    });
    expect(planDownload(manifest, ['de'], roomy)).toMatchObject({
      fits: true,
      language: 'si',
      reasons: ['language_fallback'],
    });
  });

  it('does not fetch files already on the device', () => {
    const plan = planDownload(manifest, ['si'], roomy, new Set([hash(2), hash(6)]));
    expect(plan.toFetch.map((f) => f.path)).toEqual(['captions/si.vtt']);
    expect(plan.fetchBytes).toBe(20_000);
  });
});

describe('verify pack', () => {
  it('names missing, wrong-size and wrong-hash files', async () => {
    const good = new TextEncoder().encode('hello');
    const goodHash = await webCryptoSha256(good);
    const files: PackFile[] = [
      { path: 'a.txt', role: 'main', mediaType: 'text/plain', bytes: 5, sha256: goodHash },
      { path: 'b.txt', role: 'asset', mediaType: 'text/plain', bytes: 5, sha256: goodHash },
      { path: 'c.txt', role: 'asset', mediaType: 'text/plain', bytes: 9, sha256: goodHash },
      { path: 'd.txt', role: 'asset', mediaType: 'text/plain', bytes: 5, sha256: hash(1) },
    ];
    const disk = new Map([
      ['a.txt', good],
      ['c.txt', good],
      ['d.txt', good],
    ]);
    const problems = await verifyPack(files, {
      read: async (p) => disk.get(p),
      sha256: webCryptoSha256,
    });
    expect(problems).toEqual([
      { path: 'b.txt', code: 'missing' },
      { path: 'c.txt', code: 'size_mismatch' },
      { path: 'd.txt', code: 'hash_mismatch' },
    ]);
  });
});
