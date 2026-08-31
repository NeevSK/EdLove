/**
 * WelcomeScreen.web.tsx — Split-panel landing page
 *
 * On native, WelcomeScreen is a mobile-style centred card. On web Metro
 * resolves this file instead, rendering a fluid two-column or stacked layout:
 *
 *  ┌──────────────────────┬───────────────────────────┐
 *  │  LEFT PANEL          │  RIGHT PANEL              │
 *  │  Branding + mission  │  Auth card                │
 *  │  3 stat pills        │  Language selector        │
 *  │  Five Pillars chips  │  Explore/Login buttons    │
 *  └──────────────────────┴───────────────────────────┘
 *
 * Auth logic is identical to the native screen (same handlers, same hooks).
 * AuthScreen renders on top of this layout when the user taps "I have an account".
 *
 * The screen scrolls through ScreenWrapper (an RN ScrollView), which is the
 * app's sanctioned web scroll container — the shell disables page/body
 * scrolling (`body { overflow: hidden }`), so screens must scroll internally.
 * The two-column / stacked switch is pure CSS flex-wrap (no JS on resize).
 * Design tokens: Vellum bg · Ink text · Saffron primary · Dalu Green secondary
 * Shadow rule: Shadow Violet only, never grey/black.
 */

import { authAPI } from '@repo/core/auth';
import { handleAPIError } from '@repo/core/logic';
import { GatewayFooter } from '@repo/ui/components/GatewayFooter.web';
import { GatewayHeader } from '@repo/ui/components/GatewayHeader.web';
import { Mascot, type MascotArtworkSource } from '@repo/ui/components/Mascot';
import ScreenWrapper from '@repo/ui/components/ScreenWrapper';
import { useTheme } from '@repo/ui/hooks/useTheme';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from '@repo/ui/primitives';
import { Theme } from '@repo/ui/theme/Theme';
import { EXTERNAL_URLS } from '@repo/ui/utils';
import { hapticError, hapticLight, hapticSuccess } from '@repo/ui/utils/haptics';
import { memo, useCallback, useMemo, useReducer, useRef } from 'react';
import { useTranslation } from 'react-i18next';

// ──────────────────────────────────────────────────────────
// Constants
// ──────────────────────────────────────────────────────────

const STATS = [
  { value: 'Teacher', label: 'First' },
  { value: 'Care', label: 'Mission' },
  { value: 'LK', label: 'Home' },
];

const PILLARS = [
  { name: 'Self', emoji: '❤️', color: Theme.colors.sanctuarySaffron },
  { name: 'Workspace', emoji: '🏫', color: Theme.colors.sageGreen },
  {
    name: 'Community',
    emoji: '🤝',
    color: Theme.colors.shadowViolet,
  },
  { name: 'Library', emoji: '📚', color: Theme.colors.skyBlue },
  {
    name: 'Profile',
    emoji: '🪪',
    color: Theme.colors.sanctuarySaffron,
  },
];

// ──────────────────────────────────────────────────────────
// TYPES & REDUCER
// ──────────────────────────────────────────────────────────

interface WelcomeState {
  acceptedTerms: boolean;
  isConnecting: boolean;
  btnHover: 'explore' | 'login' | null;
}

type WelcomeAction =
  | { type: 'SET_TERMS'; accepted: boolean }
  | { type: 'SET_CONNECTING'; connecting: boolean }
  | { type: 'SET_BTN_HOVER'; btn: 'explore' | 'login' | null };

function welcomeReducer(state: WelcomeState, action: WelcomeAction): WelcomeState {
  switch (action.type) {
    case 'SET_TERMS':
      return { ...state, acceptedTerms: action.accepted };
    case 'SET_CONNECTING':
      return { ...state, isConnecting: action.connecting };
    case 'SET_BTN_HOVER':
      return { ...state, btnHover: action.btn };
    default:
      return state;
  }
}

// ──────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ──────────────────────────────────────────────────────────

const LeftPanel = memo(
  ({ exploreArtwork }: { exploreArtwork?: MascotArtworkSource }) => {
    const { text, accent, isDark } = useTheme();
    return (
      <View style={styles.leftPanelInner}>
        {/* Logo */}
        <View style={styles.logoRow}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoGlyph}>🪷</Text>
          </View>
          <Text style={[styles.logoName, { color: text.primary }]}>Gurudevi</Text>
        </View>
        <View style={styles.mascotWelcome}>
          <Mascot
            artwork={exploreArtwork}
            mode="glowing"
            podVariant="halo"
            size={180}
            state="guiding"
          />
        </View>
        {/* Headline */}
        <Text style={[styles.headline, { color: text.primary }]}>
          A Sanctuary{'\n'}for Teachers
        </Text>
        {/* Tagline */}
        <Text
          style={[styles.tagline, { color: isDark ? Theme.colors.starlightGray : Theme.colors.bark }]}
        >
          Mending the teaching-learning{'\n'}impedance match — through care, not surveillance.
        </Text>
        {/* Stats */}
        <View style={styles.statsRow}>
          {STATS.map((s) => (
            <View key={s.label} style={[styles.statPill, { borderColor: `${accent.action}30` }]}>
              <Text style={[styles.statValue, { color: accent.action }]}>{s.value}</Text>
              <Text style={[styles.statLabel, { color: text.secondary }]}>{s.label}</Text>
            </View>
          ))}
        </View>
        {/* Five Pillars */}
        <View style={styles.pillarsRow}>
          {PILLARS.map((p) => (
            <View
              key={p.name}
              style={[
                styles.pillarChip,
                { borderColor: `${p.color}30`, backgroundColor: `${p.color}10` },
              ]}
            >
              <Text style={styles.pillarEmoji}>{p.emoji}</Text>
              <Text style={[styles.pillarName, { color: p.color }]}>{p.name}</Text>
            </View>
          ))}
        </View>
        {/* Quote */}
        <View
          style={[
            styles.quoteBox,
            {
              borderLeftColor: accent.action,
              backgroundColor: `${accent.action}0A`,
            },
          ]}
        >
          <Text style={[styles.quoteText, { color: text.secondary }]}>
            &quot;Education is a living ecology,{'\n'}not a linear process.&quot;
          </Text>
        </View>
      </View>
    );
  },
);
LeftPanel.displayName = 'LeftPanel';

interface RightPanelProps {
  acceptedTerms: boolean;
  isConnecting: boolean;
  btnHover: 'explore' | 'login' | null;
  onStartExploring: () => void;
  onLogin: () => void;
  onToggleTerms: () => void;
  onBtnHoverIn: (btn: 'explore' | 'login') => void;
  onBtnHoverOut: () => void;
  footer: string;
}

const RightPanel = memo(
  ({
    acceptedTerms,
    isConnecting,
    btnHover,
    onStartExploring,
    onLogin,
    onToggleTerms,
    onBtnHoverIn,
    onBtnHoverOut,
    footer,
  }: RightPanelProps) => {
    const { text, glass, accent } = useTheme();

    const handleExploreHoverIn = useCallback(() => {
      onBtnHoverIn('explore');
    }, [onBtnHoverIn]);

    const handleLoginHoverIn = useCallback(() => {
      onBtnHoverIn('login');
    }, [onBtnHoverIn]);

    return (
      <View style={styles.rightPanel}>
        <View
          style={[
            styles.authCard,
            {
              backgroundColor: glass.modal.bg,
              borderColor: glass.modal.border,
            },
          ]}
        >
          {/* Greeting */}
          <Text style={[styles.cardTitle, { color: text.primary }]}>Welcome to the Sanctuary</Text>
          <Text style={[styles.cardSubtitle, { color: text.secondary }]}>
            Choose how you&apos;d like to begin your journey.
          </Text>
          {/* Explore button */}
          <Pressable
            onPress={onStartExploring}
            onHoverIn={handleExploreHoverIn}
            onHoverOut={onBtnHoverOut}
            disabled={isConnecting}
            accessibilityRole="button"
            style={[
              styles.primaryBtn,
              {
                backgroundColor: acceptedTerms ? accent.action : Theme.colors.willow,
                opacity: btnHover === 'explore' ? 0.88 : 1,
                transform: btnHover === 'explore' ? [{ scale: 1.015 }] : [{ scale: 1 }],
              },
            ]}
          >
            {isConnecting ? (
              <ActivityIndicator color={Theme.colors.sacredWhite} size="small" />
            ) : (
              <Text style={styles.primaryBtnText}>Explore as Guest</Text>
            )}
          </Pressable>
          {/* Login button */}
          <Pressable
            onPress={onLogin}
            onHoverIn={handleLoginHoverIn}
            onHoverOut={onBtnHoverOut}
            accessibilityRole="button"
            style={[
              styles.secondaryBtn,
              {
                borderColor: glass.interact.border,
                backgroundColor: btnHover === 'login' ? glass.interact.bg : 'transparent',
              },
            ]}
          >
            <Text style={[styles.secondaryBtnText, { color: text.secondary }]}>
              I have an account
            </Text>
          </Pressable>
          {/* Terms — accessible checkbox */}
          <View style={styles.termsRow}>
            <Pressable
              onPress={onToggleTerms}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: acceptedTerms }}
              accessibilityLabel="Accept Terms of Use and Privacy Policy"
              accessibilityHint="Toggle acceptance of terms and privacy policy to enable exploration"
              style={{ cursor: 'pointer' }}
            >
              <View
                style={[
                  styles.checkbox,
                  {
                    backgroundColor: acceptedTerms ? accent.action : 'transparent',
                    borderColor: acceptedTerms ? accent.action : text.muted,
                  },
                ]}
              >
                {acceptedTerms && <Text style={styles.checkmark}>✓</Text>}
              </View>
            </Pressable>
            <Text style={[styles.termsText, { color: text.secondary }]}>
              I agree to the{' '}
              <a
                href={EXTERNAL_URLS.privacy}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: accent.action,
                  fontWeight: '600',
                  textDecoration: 'underline',
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                Privacy Policy
              </a>
              {' '}and{' '}
              <a
                href={EXTERNAL_URLS.terms}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: accent.action,
                  fontWeight: '600',
                  textDecoration: 'underline',
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                Terms of Use
              </a>
            </Text>
          </View>
          {/* Footer note */}
          <Text style={[styles.cardFooter, { color: text.muted }]}>{footer}</Text>
        </View>
      </View>
    );
  },
);
RightPanel.displayName = 'RightPanel';

interface WelcomeScreenProps {
  onLogin?: () => void;
  onGuest?: () => void;
  exploreArtwork?: MascotArtworkSource;
}

export const WelcomeScreen = memo(({ onLogin, onGuest, exploreArtwork }: WelcomeScreenProps) => {
  const { t } = useTranslation();
  const guestEntryInFlightRef = useRef(false);

  const [state, dispatch] = useReducer(welcomeReducer, {
    acceptedTerms: true,
    isConnecting: false,
    btnHover: null,
  });

  const { acceptedTerms, isConnecting, btnHover } = state;

  const startExploring = useCallback(async () => {
    if (isConnecting || guestEntryInFlightRef.current) return;
    if (!acceptedTerms) {
      hapticError();
      return;
    }
    hapticSuccess();
    guestEntryInFlightRef.current = true;
    dispatch({ type: 'SET_CONNECTING', connecting: true });
    try {
      await authAPI.signInAnonymously();
      if (onGuest) onGuest();
    } catch (err) {
      handleAPIError(err);
    } finally {
      guestEntryInFlightRef.current = false;
      dispatch({ type: 'SET_CONNECTING', connecting: false });
    }
  }, [acceptedTerms, onGuest]);

  const handleStartExploring = useCallback(() => {
    void startExploring();
  }, [startExploring]);

  const handleLoginPress = useCallback(() => {
    if (!acceptedTerms) {
      hapticError();
      return;
    }
    hapticLight();
    if (onLogin) onLogin();
  }, [acceptedTerms, onLogin]);

  const toggleTerms = useCallback(() => {
    dispatch({ type: 'SET_TERMS', accepted: !acceptedTerms });
  }, [acceptedTerms]);

  const setBtnHoverIn = useCallback((btn: 'explore' | 'login') => {
    dispatch({ type: 'SET_BTN_HOVER', btn });
  }, []);

  const setBtnHoverOut = useCallback(() => {
    dispatch({ type: 'SET_BTN_HOVER', btn: null });
  }, []);

  const footer = useMemo(
    () => t('welcome.footer') || 'Part of the EdLove Constellation · Made with 💖 in Sri Lanka',
    [t],
  );

  return (
    <View style={styles.root}>
      <GatewayHeader />
      <ScreenWrapper scroll>
        <View style={styles.track}>
          <View style={styles.panelLeft}>
            <LeftPanel exploreArtwork={exploreArtwork} />
          </View>
          <View style={styles.panelRight}>
            <RightPanel
              acceptedTerms={acceptedTerms}
              isConnecting={isConnecting}
              btnHover={btnHover}
              onStartExploring={handleStartExploring}
              onLogin={handleLoginPress}
              onToggleTerms={toggleTerms}
              onBtnHoverIn={setBtnHoverIn}
              onBtnHoverOut={setBtnHoverOut}
              footer={footer}
            />
          </View>
        </View>
      </ScreenWrapper>
      <GatewayFooter />
    </View>
  );
});

WelcomeScreen.displayName = 'WelcomeScreen';

export default WelcomeScreen;

// ──────────────────────────────────────────────────────────
// Styles
// ──────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // The screen root fills the fixed-height shell (#root/body) and lays out
  // header / scroll body / footer in a column. Scroll happens INSIDE
  // ScreenWrapper's ScrollView, never on the page (body overflow is hidden).
  // position relative + zIndex 1 lift the content above any stray
  // full-viewport absolute overlay the navigation shell may leave (which
  // would otherwise swallow pointer events) — matches how the gateway shell
  // stayed clickable.
  root: {
    height: '100vh',
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'transparent',
  } as Record<string, unknown>,
  // Fluid auto-collapse track: side-by-side on wide, stacked on narrow.
  track: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    justifyContent: 'center',
    width: '100%',
    maxWidth: 1240,
    marginInline: 'auto',
    paddingHorizontal: 48,
    paddingVertical: 40,
    gap: 40,
    boxSizing: 'border-box',
  } as Record<string, unknown>,

  // ── Left panel ──────────────────────────────────────────────────────────────────
  panelLeft: {
    flex: 1,
    minWidth: 360,
    maxWidth: 680,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 16,
  } as Record<string, unknown>,
  leftPanelInner: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 16,
    width: '100%',
  } as Record<string, unknown>,
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 4,
  },
  mascotWelcome: {
    alignItems: 'flex-start',
    marginLeft: -14,
    marginBottom: -6,
  },
  logoCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(212,132,58,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoGlyph: {
    fontSize: 22,
  },
  logoName: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  headline: {
    fontSize: 'clamp(28px, 4vw, 50px)',
    fontWeight: '800',
    letterSpacing: -1.5,
    lineHeight: 'clamp(34px, 4.4vw, 56px)',
  } as Record<string, unknown>,
  tagline: {
    fontSize: 'clamp(14px, 1.4vw, 17px)',
    lineHeight: 'clamp(20px, 2vw, 26px)',
    maxWidth: 440,
  } as Record<string, unknown>,
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  statPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 50,
    borderWidth: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  pillarsRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  pillarChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 50,
    borderWidth: 1,
  },
  pillarEmoji: {
    fontSize: 13,
  },
  pillarName: {
    fontSize: 12,
    fontWeight: '600',
  },
  quoteBox: {
    borderLeftWidth: 3,
    paddingLeft: 14,
    paddingVertical: 4,
    maxWidth: 400,
  },
  quoteText: {
    fontSize: 14,
    lineHeight: 22,
    fontStyle: 'italic',
  },

  // ── Right panel ───────────────────────────────────────────────────────────
  panelRight: {
    flex: 1,
    minWidth: 360,
    maxWidth: 460,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  } as Record<string, unknown>,
  rightPanel: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  } as Record<string, unknown>,
  authCard: {
    width: '100%',
    borderRadius: 28,
    borderWidth: 1,
    padding: 'clamp(20px, 2.5vw, 32px)',
    gap: 14,
    boxShadow: '0 8px 28px rgba(107, 100, 128, 0.16)',
    elevation: 12,
  } as Record<string, unknown>,
  cardTitle: {
    fontSize: 'clamp(20px, 2vw, 24px)',
    fontWeight: '800',
    letterSpacing: -0.4,
    lineHeight: 28,
  } as Record<string, unknown>,
  cardSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  primaryBtn: {
    borderRadius: 50,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 54,
    boxShadow: '0 4px 14px rgba(107, 100, 128, 0.20)',
    cursor: 'pointer',
  } as Record<string, unknown>,
  primaryBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: Theme.colors.sacredWhite,
    letterSpacing: 0.2,
  },
  secondaryBtn: {
    borderRadius: 50,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    minHeight: 50,
    cursor: 'pointer',
  } as Record<string, unknown>,
  secondaryBtnText: {
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: 0.1,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 2,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  checkmark: {
    color: '#FFFDF7',
    fontSize: 12,
    fontWeight: '700',
  },
  termsText: {
    fontSize: 13,
    lineHeight: 18,
    flexShrink: 1,
  },
  cardFooter: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
    marginTop: 4,
  },
});
