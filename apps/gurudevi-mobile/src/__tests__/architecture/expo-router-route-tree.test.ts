import { readdirSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const APP_ROOT = path.resolve(__dirname, '../../../app');
const ROUTE_FILE = /(?:\.(?<platform>web|ios|android|native))?\.(?<extension>ts|tsx|js|jsx)$/;

function getRouteFiles(directory = APP_ROOT): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    return entry.isDirectory() ? getRouteFiles(entryPath) : [entryPath];
  });
}

function routeDefinition(filePath: string) {
  const relativePath = path.relative(APP_ROOT, filePath).split(path.sep).join('/');
  const match = relativePath.match(ROUTE_FILE);
  if (!match?.groups) {
    return null;
  }

  const routePath = relativePath.replace(ROUTE_FILE, '');
  if (routePath.endsWith('/_layout') || routePath === '_layout') {
    return null;
  }

  const segments: string[] = routePath
    .split('/')
    .filter((segment: string) => !/^\(.*\)$/.test(segment));
  const visibleSegments =
    segments[segments.length - 1] === 'index' ? segments.slice(0, -1) : segments;

  return {
    file: relativePath,
    platform: match.groups.platform ?? 'default',
    route: `/${visibleSegments.join('/')}`,
  };
}

describe('Expo Router route tree', () => {
  it('keeps helper modules out of app and retains only UI route module extensions', () => {
    const routeFiles = getRouteFiles();
    expect(routeFiles.filter((filePath) => path.extname(filePath) === '.ts')).toEqual([]);
  });

  it('does not define the same URL stem twice for one platform', () => {
    const routeDefinitions = getRouteFiles()
      .map(routeDefinition)
      .filter((definition): definition is NonNullable<typeof definition> => definition !== null);
    const duplicateDefinitions = routeDefinitions.filter(
      (definition, index) =>
        routeDefinitions.findIndex(
          (candidate) =>
            candidate.route === definition.route && candidate.platform === definition.platform,
        ) !== index,
    );

    expect(duplicateDefinitions).toEqual([]);
  });
});
