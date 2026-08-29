import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const APP_ROOT = path.resolve(__dirname, '../../..');
const WORKSPACE_ROOT = path.resolve(APP_ROOT, '..', '..');

const PROFILE_ROUTE_ROOT = path.join(APP_ROOT, 'app', '(tabs)', 'profile');
const PROFILE_ROUTE_INDEX = path.join(PROFILE_ROUTE_ROOT, 'index.tsx');
const FULL_PROFILE_ROUTE = path.join(PROFILE_ROUTE_ROOT, 'full', '[id].tsx');
const PRIVACY_LEDGER_ROUTE = path.join(PROFILE_ROUTE_ROOT, 'privacy-ledger.tsx');
const PROFILE_SCREEN_NATIVE = path.join(
  WORKSPACE_ROOT,
  'packages',
  'profile',
  'src',
  'screens',
  'ProfileScreen.tsx',
);
const PROFILE_SCREEN_WEB = path.join(
  WORKSPACE_ROOT,
  'packages',
  'profile',
  'src',
  'screens',
  'ProfileScreen.web.tsx',
);
const AVATAR_DISPLAY = path.join(
  WORKSPACE_ROOT,
  'packages',
  'profile',
  'src',
  'components',
  'AvatarDisplay.tsx',
);
const FULL_PROFILE_NATIVE = path.join(
  WORKSPACE_ROOT,
  'packages',
  'profile',
  'src',
  'screens',
  'FullProfileScreen.tsx',
);
const FULL_PROFILE_WEB = path.join(
  WORKSPACE_ROOT,
  'packages',
  'profile',
  'src',
  'screens',
  'FullProfileScreen.web.tsx',
);
const MUTE_HUB_SCREEN = path.join(
  WORKSPACE_ROOT,
  'packages',
  'profile',
  'src',
  'screens',
  'MuteHubScreen.tsx',
);

describe('Profile route capabilities', () => {
  it('exposes the current Expo Router profile capability entrypoints', () => {
    const indexSource = fs.readFileSync(PROFILE_ROUTE_INDEX, 'utf8');
    const fullProfileSource = fs.readFileSync(FULL_PROFILE_ROUTE, 'utf8');
    const privacyLedgerSource = fs.readFileSync(PRIVACY_LEDGER_ROUTE, 'utf8');

    expect(indexSource).toContain("from '@repo/profile/own'");
    expect(fullProfileSource).toContain("from '@repo/profile/own'");
    expect(fullProfileSource).toContain('Platform.OS');
    expect(privacyLedgerSource).toContain("from '@repo/self/privacy'");
  });

  it('profile surfaces use the host navigation capability hook instead of hardcoded navigator imports', () => {
    const nativeSource = fs.readFileSync(PROFILE_SCREEN_NATIVE, 'utf8');
    const webSource = fs.readFileSync(PROFILE_SCREEN_WEB, 'utf8');
    const avatarSource = fs.readFileSync(AVATAR_DISPLAY, 'utf8');

    expect(nativeSource.includes('useProfileNavigation')).toBe(true);
    expect(webSource.includes('useProfileNavigation')).toBe(true);
    expect(avatarSource.includes('useProfileNavigation')).toBe(true);

    expect(nativeSource.includes("from '@react-navigation/native'")).toBe(false);
    expect(webSource.includes("from '@react-navigation/native'")).toBe(false);
    expect(avatarSource.includes("from '@react-navigation/native'")).toBe(false);

    expect(nativeSource.includes("navigation.navigate('AppSettings')")).toBe(false);
    expect(nativeSource.includes("navigation.navigate('Auth')")).toBe(false);
    expect(webSource.includes("navigate('FullProfile'")).toBe(false);
    expect(webSource.includes("navigate('AppSettings')")).toBe(false);
    expect(webSource.includes("navigate('PrivacyLedger')")).toBe(false);
    expect(avatarSource.includes("navigate('PublicProfile'")).toBe(false);
  });

  it('full profile screens source social links from the social-links hook and use the hook-owned avatar uploader', () => {
    const nativeSource = fs.readFileSync(FULL_PROFILE_NATIVE, 'utf8');
    const webSource = fs.readFileSync(FULL_PROFILE_WEB, 'utf8');

    expect(nativeSource.includes('useSocialLinks')).toBe(true);
    expect(webSource.includes('useSocialLinks')).toBe(true);
    expect(nativeSource.includes('links={socialLinks || []}')).toBe(true);
    expect(webSource.includes('links={socialLinks || []}')).toBe(true);
    expect(nativeSource.includes('uploadAvatar(localUri)')).toBe(true);
    expect(webSource.includes('uploadAvatar(localUri)')).toBe(true);
    expect(nativeSource.includes('profile.social_links || []')).toBe(false);
    expect(webSource.includes('profile.social_links || []')).toBe(false);
    expect(webSource.includes('recipientRole=')).toBe(false);
    expect(webSource.includes('recipientTier=')).toBe(true);
  });

  it('ui safety hub does not import profile package components', () => {
    const source = fs.readFileSync(MUTE_HUB_SCREEN, 'utf8');

    expect(source.includes("from '@repo/profile'")).toBe(false);
    expect(source.includes('AvatarDisplay')).toBe(false);
    expect(source.includes('UserAvatar')).toBe(true);
  });
});
