import { strToU8, zipSync } from 'fflate';
import { describe, expect, it } from 'vitest';
import { openH5PArchive } from './h5pArchive';
import { indexPackage, libraryKey, safeEntryPath } from './h5pPackage';

const json = (v: unknown) => strToU8(JSON.stringify(v));

const manifest = {
  title: 'ගුරුදෙවි: සංඛ්‍යා',
  language: 'si',
  mainLibrary: 'H5P.MultiChoice',
  embedTypes: ['div'],
  preloadedDependencies: [{ machineName: 'H5P.MultiChoice', majorVersion: 1, minorVersion: 16 }],
};

const multiChoice = {
  machineName: 'H5P.MultiChoice',
  majorVersion: 1,
  minorVersion: 16,
  patchVersion: 4,
  runnable: 1,
  preloadedJs: [{ path: 'js/multichoice.js' }],
  preloadedCss: [{ path: 'css/multichoice.css' }],
  preloadedDependencies: [{ machineName: 'H5P.Question', majorVersion: '1', minorVersion: '5' }],
};

const question = {
  machineName: 'H5P.Question',
  majorVersion: 1,
  minorVersion: 5,
  patchVersion: 2,
  preloadedJs: [{ path: 'scripts/question.js' }],
};

const goodFiles = (): Record<string, Uint8Array> => ({
  'h5p.json': json(manifest),
  'content/content.json': json({ question: 'எண்கள்?', answers: [{ text: '4', correct: true }] }),
  'content/images/apple.png': new Uint8Array([137, 80, 78, 71]),
  'H5P.MultiChoice-1.16/library.json': json(multiChoice),
  'H5P.MultiChoice-1.16/js/multichoice.js': strToU8('/* js */'),
  'H5P.MultiChoice-1.16/css/multichoice.css': strToU8('/* css */'),
  'H5P.Question-1.5/library.json': json(question),
  'H5P.Question-1.5/scripts/question.js': strToU8('/* js */'),
});

describe('safeEntryPath', () => {
  it.each([
    '../evil.js',
    'content/../../x',
    '/etc/passwd',
    'C:/x',
    'a\\b',
    'a//b',
    './a',
    'a/./b',
    'a\u0000b',
    '',
  ])('refuses %j', (p) => expect(safeEntryPath(p)).toBeNull());
  it('keeps ordinary paths, including Sinhala and Tamil names', () => {
    expect(safeEntryPath('content/images/පින්තූරය.png')).toBe('content/images/පින්තූරය.png');
    expect(safeEntryPath('content/படம்.jpg')).toBe('content/படம்.jpg');
  });
});

describe('openH5PArchive', () => {
  it('opens a complete package and loads dependencies before dependants', () => {
    const result = openH5PArchive(zipSync(goodFiles()));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.opened.index.loadOrder).toEqual(['H5P.Question-1.5', 'H5P.MultiChoice-1.16']);
    expect(result.opened.index.manifest.title).toBe(manifest.title);
    expect(result.opened.files.has('content/images/apple.png')).toBe(true);
  });

  it('skips zip-tool noise rather than failing on it', () => {
    const files = {
      ...goodFiles(),
      '__MACOSX/._h5p.json': strToU8('x'),
      'content/.DS_Store': strToU8('x'),
    };
    const result = openH5PArchive(zipSync(files));
    expect(result.ok).toBe(true);
    if (result.ok)
      expect([...result.opened.files.keys()].some((k) => k.includes('DS_Store'))).toBe(false);
  });

  it('refuses scripts and pages outside library folders', () => {
    const result = openH5PArchive(
      zipSync({
        ...goodFiles(),
        'content/x.js': strToU8('alert(1)'),
        'content/x.html': strToU8('<p>'),
      }),
    );
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.problems).toEqual(
      expect.arrayContaining([
        { code: 'script_outside_library', path: 'content/x.js' },
        { code: 'file_type_not_allowed', path: 'content/x.html', detail: 'html' },
      ]),
    );
  });

  it('refuses Flash even inside a library', () => {
    const result = openH5PArchive(
      zipSync({ ...goodFiles(), 'H5P.Question-1.5/old.swf': new Uint8Array([1]) }),
    );
    expect(result.ok).toBe(false);
  });

  it('refuses entries that differ only in case', () => {
    const result = openH5PArchive(
      zipSync({ ...goodFiles(), 'content/images/APPLE.png': new Uint8Array([1]) }),
    );
    expect(!result.ok && result.problems[0]?.code).toBe('duplicate_entry');
  });

  it('enforces file, total and entry limits', () => {
    const big = { ...goodFiles(), 'content/video.mp4': new Uint8Array(2048) };
    const limits = { maxEntries: 100, maxFileBytes: 1024, maxTotalBytes: 1_000_000 };
    expect(!openH5PArchive(zipSync(big), { limits }).ok).toBe(true);
    expect(
      openH5PArchive(zipSync(goodFiles()), { limits: { ...limits, maxEntries: 3 } }),
    ).toMatchObject({
      ok: false,
      problems: [{ code: 'too_many_entries' }],
    });
    expect(
      openH5PArchive(zipSync(goodFiles()), { limits: { ...limits, maxTotalBytes: 100 } }),
    ).toMatchObject({
      ok: false,
      problems: [{ code: 'too_large', detail: 'package' }],
    });
  });

  it('says so when the bytes are not a zip', () => {
    expect(openH5PArchive(strToU8('not a zip'))).toMatchObject({
      ok: false,
      problems: [{ code: 'archive_unreadable' }],
    });
  });

  it('reports a library the package leaves out, and plays when the device already holds it', () => {
    const files = goodFiles();
    delete files['H5P.Question-1.5/library.json'];
    delete files['H5P.Question-1.5/scripts/question.js'];
    expect(openH5PArchive(zipSync(files))).toMatchObject({
      ok: false,
      problems: [{ code: 'library_missing', detail: 'H5P.Question-1.5' }],
    });
    const installed = new Map([[libraryKey(question), { ...question }]]);
    expect(openH5PArchive(zipSync(files), { installedLibraries: installed }).ok).toBe(true);
  });

  it('reports a missing manifest, content, asset and a folder that disagrees with its library', () => {
    const noManifest = goodFiles();
    delete noManifest['h5p.json'];
    expect(openH5PArchive(zipSync(noManifest))).toMatchObject({
      ok: false,
      problems: [{ code: 'manifest_missing' }],
    });

    const broken = goodFiles();
    delete broken['content/content.json'];
    delete broken['H5P.MultiChoice-1.16/css/multichoice.css'];
    broken['H5P.Question-1.5/library.json'] = json({ ...question, minorVersion: 6 });
    const result = openH5PArchive(zipSync(broken));
    expect(result.ok).toBe(false);
    if (result.ok) return;
    const codes = result.problems.map((p) => p.code);
    expect(codes).toEqual(
      expect.arrayContaining([
        'content_missing',
        'asset_missing',
        'library_mismatch',
        'library_missing',
      ]),
    );
  });

  it('refuses a manifest whose main library is not among its dependencies', () => {
    const files = { ...goodFiles(), 'h5p.json': json({ ...manifest, mainLibrary: 'H5P.Blanks' }) };
    const result = openH5PArchive(zipSync(files));
    expect(!result.ok && result.problems.map((p) => p.code)).toContain(
      'main_library_not_preloaded',
    );
  });
});

describe('indexPackage', () => {
  it('survives a dependency cycle', () => {
    const a = {
      machineName: 'A',
      majorVersion: 1,
      minorVersion: 0,
      patchVersion: 0,
      preloadedDependencies: [{ machineName: 'B', majorVersion: 1, minorVersion: 0 }],
    };
    const b = {
      machineName: 'B',
      majorVersion: 1,
      minorVersion: 0,
      patchVersion: 0,
      preloadedDependencies: [{ machineName: 'A', majorVersion: 1, minorVersion: 0 }],
    };
    const text: Record<string, string> = {
      'h5p.json': JSON.stringify({
        ...manifest,
        mainLibrary: 'A',
        preloadedDependencies: [{ machineName: 'A', majorVersion: 1, minorVersion: 0 }],
      }),
      'content/content.json': '{}',
      'A-1.0/library.json': JSON.stringify(a),
      'B-1.0/library.json': JSON.stringify(b),
    };
    const result = indexPackage(new Set(Object.keys(text)), (p) => text[p]);
    expect(result).toMatchObject({ ok: true, index: { loadOrder: ['B-1.0', 'A-1.0'] } });
  });
});
