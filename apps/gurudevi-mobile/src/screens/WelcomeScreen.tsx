import { useState, useCallback, useMemo } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { LanguageUtils } from '@repo/core/logic';
import { useEnvironment } from '@repo/ui/context';
import {
  Button,
  LanguagePicker,
  Surface,
  Text,
  useScreenGround,
} from '@repo/ui/components/native';
import { Mascot } from '@repo/ui/components/Mascot';
import { useWorld } from '@repo/ui/theme/native';
import { EXTERNAL_URLS } from '@repo/ui/utils';
import { fireflyPrototypeArtwork } from '@/brand/mascotArtwork';

export interface WelcomeScreenProps {
  onLogin: () => void;
  onStartGuest: () => Promise<void>;
}

type RealmId = 'self' | 'workspace' | 'community';

interface RealmMeta {
  id: RealmId;
  label: string;
  titleKey: string;
  defaultTitle: string;
  descKey: string;
  defaultDesc: string;
}

const REALMS: readonly RealmMeta[] = [
  {
    id: 'self',
    label: 'Self',
    titleKey: 'welcome.realms.selfTitle',
    defaultTitle: 'Inner Clarity & Reflection',
    descKey: 'welcome.realms.selfDesc',
    defaultDesc: 'Mindful journaling, mood tracking, and personal breathing spaces.',
  },
  {
    id: 'workspace',
    label: 'Workspace',
    titleKey: 'welcome.realms.workspaceTitle',
    defaultTitle: 'Classroom & Schedule Calm',
    descKey: 'welcome.realms.workspaceDesc',
    defaultDesc: 'Timetable tracking, relief periods, and classroom rhythms.',
  },
  {
    id: 'community',
    label: 'Community',
    titleKey: 'welcome.realms.communityTitle',
    defaultTitle: 'Educator Connection',
    descKey: 'welcome.realms.communityDesc',
    defaultDesc: 'Shared wisdom, collaborative notes, and peer encouragement.',
  },
];

const DEFAULT_REALM: RealmMeta = REALMS[0]!;

export function WelcomeScreen({ onLogin, onStartGuest }: WelcomeScreenProps) {
  const { t, i18n } = useTranslation();
  const { isDark, setThemeMode } = useEnvironment();
  const world = useWorld();
  const wt = world.tokens;
  useScreenGround('home');

  const [isConnecting, setIsConnecting] = useState(false);
  const [activeRealm, setActiveRealm] = useState<RealmId>('self');

  const toggleTheme = useCallback(() => {
    setThemeMode(isDark ? 'light' : 'dark').catch((err) => {
      console.warn('[WelcomeScreen] Failed to toggle theme mode:', err);
    });
  }, [isDark, setThemeMode]);

  const selectedRealmMeta = useMemo(
    () => REALMS.find((r) => r.id === activeRealm) ?? DEFAULT_REALM,
    [activeRealm],
  );

  const handleStartExploring = useCallback(async () => {
    if (isConnecting) {
      return;
    }
    setIsConnecting(true);
    try {
      await onStartGuest();
    } finally {
      setIsConnecting(false);
    }
  }, [isConnecting, onStartGuest]);

  const handleLanguageChange = useCallback((lang: 'en' | 'si' | 'ta') => {
    LanguageUtils.setLanguage(lang).catch((err) => {
      console.warn('[WelcomeScreen] Failed to set language:', err);
    });
  }, []);

  const openUrl = useCallback((url: string) => {
    Linking.openURL(url).catch((err) => {
      console.warn('[WelcomeScreen] Failed to open external URL:', err);
    });
  }, []);

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Top Bar: Brand Badge & Language Selector */}
          <View style={styles.topBar}>
            <View style={[styles.brandBadge, { backgroundColor: wt.raised, borderColor: wt.line }]}>
              <View style={[styles.brandDot, { backgroundColor: wt.lamp }]} />
              <Text kind="caption" tone="soft" style={styles.brandBadgeText}>
                {(
                  world.definition.names[
                    (i18n.language?.slice(0, 2) ?? 'en') as 'en' | 'si' | 'ta'
                  ] ?? world.id
                ).toUpperCase()}
              </Text>
            </View>

            <View style={styles.topBarRight}>
              <Pressable
                onPress={toggleTheme}
                accessibilityRole="button"
                accessibilityLabel={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                style={[styles.modePill, { backgroundColor: wt.raised, borderColor: wt.line }]}
              >
                <Text kind="caption" tone="ink">
                  {isDark ? '🌙 Dark' : '☀️ Light'}
                </Text>
              </Pressable>

              <LanguagePicker
                value={(i18n.language?.slice(0, 2) ?? 'en') as 'en' | 'si' | 'ta'}
                onChange={handleLanguageChange}
                variant="capsule"
              />
            </View>
          </View>

          {/* Living Mascot Hero with World Lamp Glow */}
          <View style={styles.mascotSection}>
            <View style={styles.mascotGlowWrapper}>
              <Mascot
                artwork={fireflyPrototypeArtwork}
                mode="glowing"
                glowColor={wt.lamp}
                podVariant="halo"
                size={164}
                state="guiding"
              />
            </View>

            <View style={styles.titleStack}>
              <Text kind="display" align="center" tone="ink">
                {t('welcome.message') || 'Welcome to Gurudevi'}
              </Text>
              <Text kind="body" align="center" tone="soft" style={styles.subtitle}>
                {t('welcome.subtitle') || 'Education born from love, built with love.'}
              </Text>
            </View>
          </View>

          {/* Horizon Realm Discovery: Self, Workspace, Community */}
          <Surface tone="raised" style={styles.realmSurface}>
            <View style={styles.realmPills}>
              {REALMS.map((r) => {
                const isSelected = r.id === activeRealm;
                return (
                  <Pressable
                    key={r.id}
                    onPress={() => setActiveRealm(r.id)}
                    accessibilityRole="tab"
                    accessibilityState={{ selected: isSelected }}
                    accessibilityLabel={r.label}
                    style={[
                      styles.realmPill,
                      {
                        backgroundColor: isSelected ? wt.ground : 'transparent',
                        borderColor: isSelected ? wt.line : 'transparent',
                      },
                    ]}
                  >
                    <Text
                      kind="label"
                      tone={isSelected ? 'lamp' : 'soft'}
                      style={isSelected ? styles.realmPillTextActive : undefined}
                    >
                      {r.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.realmDetail}>
              <Text kind="title" tone="ink">
                {t(selectedRealmMeta.titleKey) || selectedRealmMeta.defaultTitle}
              </Text>
              <Text kind="body" tone="soft">
                {t(selectedRealmMeta.descKey) || selectedRealmMeta.defaultDesc}
              </Text>
            </View>
          </Surface>

          {/* Doorway Action Buttons */}
          <View style={styles.actionsStack}>
            <Button
              label={t('welcome.startExploring') || 'Start Exploring'}
              variant="primary"
              size="lg"
              fullWidth
              loading={isConnecting}
              onPress={handleStartExploring}
            />

            <Button
              label={t('welcome.alreadyHaveAccount') || 'I already have an account'}
              variant="quiet"
              size="md"
              fullWidth
              onPress={onLogin}
            />
          </View>

          {/* Trust and Compliance Footer */}
          <View style={styles.footerSection}>
            <View style={styles.legalLinks}>
              <Text kind="caption" tone="faint">
                By entering, you accept our{' '}
              </Text>
              <Pressable
                onPress={() => openUrl(EXTERNAL_URLS.terms)}
                accessibilityRole="link"
                accessibilityLabel="Terms of Use"
                hitSlop={8}
              >
                <Text kind="caption" tone="lamp" style={styles.underlined}>
                  Terms
                </Text>
              </Pressable>
              <Text kind="caption" tone="faint">
                {' '}
                and{' '}
              </Text>
              <Pressable
                onPress={() => openUrl(EXTERNAL_URLS.privacy)}
                accessibilityRole="link"
                accessibilityLabel="Privacy Policy"
                hitSlop={8}
              >
                <Text kind="caption" tone="lamp" style={styles.underlined}>
                  Privacy
                </Text>
              </Pressable>
            </View>

            <Text kind="caption" tone="faint" align="center" style={styles.trustBadge}>
              Encrypted • Offline-First • Designed for Educators
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 36,
    gap: 24,
    maxWidth: 520,
    width: '100%',
    alignSelf: 'center',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modePill: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 9999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 9999,
    borderWidth: 1,
  },
  brandDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  brandBadgeText: {
    letterSpacing: 1.2,
    fontWeight: '700',
  },
  mascotSection: {
    alignItems: 'center',
    gap: 16,
    paddingTop: 8,
  },
  mascotGlowWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 170,
    height: 170,
  },
  titleStack: {
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
  },
  subtitle: {
    maxWidth: 340,
  },
  realmSurface: {
    padding: 16,
    gap: 14,
  },
  realmPills: {
    flexDirection: 'row',
    gap: 8,
  },
  realmPill: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 9999,
    borderWidth: 1,
  },
  realmPillTextActive: {
    fontWeight: '700',
  },
  realmDetail: {
    gap: 4,
    paddingHorizontal: 4,
  },
  actionsStack: {
    gap: 10,
    width: '100%',
    paddingTop: 4,
  },
  footerSection: {
    alignItems: 'center',
    gap: 8,
    paddingTop: 4,
  },
  legalLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  underlined: {
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
  trustBadge: {
    opacity: 0.8,
  },
});
