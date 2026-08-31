import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const roots = [
  { publication: 'edlove', directory: path.resolve('apps/edlove-web/src/content/journal') },
  {
    publication: 'gurudevi',
    directory: path.resolve('apps/gurudevi-marketingWeb/src/content/journal'),
  },
];
const requiredFields = ['title', 'subtitle', 'workId', 'author', 'language', 'publishDate'];
const allowedLanguages = new Set(['en', 'si', 'ta']);
const allowedKinds = new Set(['original', 'curated', 'licensed', 'guest', 'translation']);
const allowedTranslationStatuses = new Set(['not_applicable', 'draft', 'in_review', 'approved']);
const errors = [];

async function markdownFiles(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await markdownFiles(fullPath)));
    else if (/\.(md|mdx)$/.test(entry.name)) files.push(fullPath);
  }
  return files;
}

function frontmatter(text) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return null;
  return Object.fromEntries(
    match[1]
      .split(/\r?\n/)
      .filter((line) => line.trim() && !line.trim().startsWith('#'))
      .map((line) => {
        const separator = line.indexOf(':');
        return separator === -1
          ? [line.trim(), '']
          : [
              line.slice(0, separator).trim(),
              line
                .slice(separator + 1)
                .trim()
                .replace(/^['"]|['"]$/g, ''),
            ];
      }),
  );
}

for (const root of roots) {
  const seen = new Set();
  for (const file of await markdownFiles(root.directory)) {
    const data = frontmatter(await readFile(file, 'utf8'));
    const relative = path.relative(process.cwd(), file);
    if (!data) {
      errors.push(`${relative}: missing YAML frontmatter`);
      continue;
    }
    for (const field of requiredFields)
      if (!data[field]) errors.push(`${relative}: missing ${field}`);
    if (data.language && !allowedLanguages.has(data.language))
      errors.push(`${relative}: unsupported language ${data.language}`);
    if (data.contentKind && !allowedKinds.has(data.contentKind))
      errors.push(`${relative}: unsupported contentKind ${data.contentKind}`);
    if (data.translationStatus && !allowedTranslationStatuses.has(data.translationStatus))
      errors.push(`${relative}: unsupported translationStatus ${data.translationStatus}`);
    if (data.contentKind === 'curated' && !data.source)
      errors.push(`${relative}: curated work requires source`);
    if (data.contentKind === 'licensed' && !data.rightsAgreementId)
      errors.push(`${relative}: licensed work requires rightsAgreementId`);
    if (data.contentKind === 'translation' && !data.translationOf)
      errors.push(`${relative}: translation requires translationOf`);
    if (
      data.contentKind === 'translation' &&
      data.translationStatus !== 'approved' &&
      data.draft !== 'true'
    )
      errors.push(`${relative}: published translation requires translationStatus: approved`);
    if (data.publishDate && Number.isNaN(Date.parse(data.publishDate)))
      errors.push(`${relative}: invalid publishDate ${data.publishDate}`);
    if (data.draft === 'true') continue;
    const key = `${data.language ?? 'en'}:${path.basename(file).replace(/\.(md|mdx)$/, '')}`;
    if (seen.has(key)) errors.push(`${relative}: duplicate published journal slug/language ${key}`);
    seen.add(key);
  }
}

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join('\n'));
  process.exitCode = 1;
} else {
  console.log('Editorial content check passed.');
}
