const fs = require('node:fs');
const path = require('node:path');

const APP_ROOT = path.resolve(__dirname, '../../..');

const DYNAMIC_IMPORT_GUARDRAILS = [
  {
    file: path.join(APP_ROOT, 'src', 'navigation', 'ClassroomStackNavigator.web.tsx'),
    packageName: '@repo/classroom',
    requiredSubpath: '@repo/classroom/screens/',
  },
  {
    file: path.join(APP_ROOT, 'src', 'navigation', 'CommunityStackNavigator.web.tsx'),
    packageName: '@repo/community',
    requiredSubpath: '@repo/community/screens/',
  },
  {
    file: path.join(APP_ROOT, 'src', 'navigation', 'LibraryStackNavigator.web.tsx'),
    packageName: '@repo/library',
    requiredSubpath: '@repo/library/screens/',
  },
  {
    file: path.join(APP_ROOT, 'src', 'navigation', 'SelfStackNavigator.web.tsx'),
    packageName: '@repo/self',
    requiredSubpath: '@repo/self/screens/',
  },
  {
    file: path.join(APP_ROOT, 'src', 'navigation', 'TabNavigator.web.tsx'),
    packageName: '@repo/ui',
    requiredSubpath: '@repo/ui/screens/',
  },
  {
    file: path.join(APP_ROOT, 'src', 'navigation', 'FounderStackNavigator.web.tsx'),
    packageName: '@repo/admin',
    requiredSubpath: '@repo/admin/screens/',
  },
];

describe('Lazy package boundaries', () => {
  it.each(
    DYNAMIC_IMPORT_GUARDRAILS,
  )('$file does not lazy-load the heavy package root for $packageName', ({
    file,
    packageName,
    requiredSubpath,
  }) => {
    const source = fs.readFileSync(file, 'utf8');
    const rootDynamicImport = `import('${packageName}')`;
    const rootDynamicImportDoubleQuote = `import("${packageName}")`;

    expect(source.includes(rootDynamicImport)).toBe(false);
    expect(source.includes(rootDynamicImportDoubleQuote)).toBe(false);
    expect(source.includes(requiredSubpath)).toBe(true);
  });
});
