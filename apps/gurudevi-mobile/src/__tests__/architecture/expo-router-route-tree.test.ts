import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { appNavigation, getNavigationItems } from '@/lib/navigation/appNavigation';

const APP_ROOT = path.resolve(__dirname, '../../../app');
const NATIVE_TABS_LAYOUT = path.join(APP_ROOT, '(tabs)', '_layout.tsx');
const WEB_TABS_LAYOUT = path.join(APP_ROOT, '(tabs)', '_layout.web.tsx');
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

function getNativeTabConfiguration(source: string) {
  return [...source.matchAll(/<Tabs\.Screen\s+name="(?<name>[^"]+)"[\s\S]*?\n\s*\/>/g)].map(
    (match) => ({
      name: match.groups?.name,
      hidden: /href:\s*null/.test(match[0]),
    }),
  );
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

  it('resolves every shared navigation destination to a live default route', () => {
    const defaultRoutes = new Set(
      getRouteFiles()
        .map(routeDefinition)
        .filter(
          (definition): definition is NonNullable<typeof definition> =>
            definition !== null && definition.platform === 'default',
        )
        .map((definition) => definition.route),
    );

    const missingDestinations = appNavigation
      .filter((item) => !defaultRoutes.has(item.href))
      .map((item) => ({ id: item.id, href: item.href }));

    expect(missingDestinations).toEqual([]);
  });

  it('keeps native chrome and the web shell on the shared navigation contract', () => {
    const nativeLayout = readFileSync(NATIVE_TABS_LAYOUT, 'utf8');
    const webLayout = readFileSync(WEB_TABS_LAYOUT, 'utf8');
    const nativeTabs = getNativeTabConfiguration(nativeLayout);
    const visibleNativeTabs = nativeTabs.filter((tab) => !tab.hidden).map((tab) => tab.name);
    const hiddenNativeRoutes = nativeTabs.filter((tab) => tab.hidden).map((tab) => tab.name);

    expect(visibleNativeTabs).toEqual(getNavigationItems('tab').map((item) => item.id));
    expect(hiddenNativeRoutes).toEqual(['notifications', 'settings']);
    expect(nativeLayout).toContain('tabBarHideOnKeyboard: true');
    expect(nativeLayout).toContain("router.push('/notifications')");
    expect(nativeLayout).toContain("router.push('/settings')");
    expect(webLayout).toContain('appNavigation.map');
  });
});
