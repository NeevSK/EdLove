import { authAPI } from '@repo/core/auth';
import { LanguageUtils } from '@repo/core/logic';
import {
  LanguageSwitcher,
  SanctuaryDoorwayActions,
  type SanctuaryRealmItem,
  SanctuaryRealmSelector,
} from '@repo/ui/components';
import { GatewayFooter } from '@repo/ui/components/GatewayFooter.web';
import { GatewayHeader } from '@repo/ui/components/GatewayHeader.web';
import { Mascot, type MascotArtworkSource } from '@repo/ui/components/Mascot';
import { useAccessibility } from '@repo/ui/hooks/useAccessibility';
import { useTheme } from '@repo/ui/hooks/useTheme';
import { useSanctuaryToast } from '@repo/ui/providers/ToastProvider';
import { getGuestEntryErrorMessage } from '@repo/ui/screens/welcomeFlow';
import { Theme } from '@repo/ui/theme/Theme';
import { EXTERNAL_URLS } from '@repo/ui/utils';
import { hapticLight, hapticSuccess } from '@repo/ui/utils/haptics';
import React, { memo, useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

export interface SpatialSanctuaryWelcomeScreenProps {
  onLogin?: () => void;
  onGuest?: () => void;
  exploreArtwork?: MascotArtworkSource;
}

/**
 * SpatialSanctuaryWelcomeScreen.web.tsx
 *
 * Implements the Organic Spatial Depth & Decoupled Stage Architecture:
 * - Layer 0: Fixed Ground Datum (Dotted Matrix + Sanctuary Atmospheric Gradient)
 * - Layer 1: Anchored Landmark Hero (Mascot + Mission that stays steady & breathes)
 * - Layer 2: Floating Gliding Sheet (Realm discovery + Tactile Doorway Actions with 0px-blur bevels)
 * - Layer 3: Pinned Gateway Controls (Header & Footer)
 */
export const SpatialSanctuaryWelcomeScreen = memo(
  ({ onLogin, onGuest, exploreArtwork }: SpatialSanctuaryWelcomeScreenProps) => {
    const { t, i18n } = useTranslation();
    const { accent, accentRgb, isDark, scene } = useTheme();
    const { isReduceMotionEnabled } = useAccessibility();
    const { showToast } = useSanctuaryToast();

    const [isConnecting, setIsConnecting] = useState(false);
    const [selectedRealm, setSelectedRealm] = useState<string>('self');
    const [sheetScrollProgress, setSheetScrollProgress] = useState(0);
    const guestEntryInFlightRef = useRef(false);

    const changeLanguage = useCallback((langCode: string) => {
      void LanguageUtils.setLanguage(langCode as 'en' | 'si' | 'ta');
    }, []);

    const handleStartExploring = useCallback(async () => {
      if (isConnecting || guestEntryInFlightRef.current) return;

      hapticSuccess();
      guestEntryInFlightRef.current = true;
      setIsConnecting(true);

      try {
        await authAPI.signInAnonymously();
        if (onGuest) onGuest();
      } catch (error) {
        console.error('[SpatialSanctuaryWelcomeScreen] Guest login failed:', error);
        showToast({
          message: getGuestEntryErrorMessage(
            error,
            t('auth.guestLoginFailed') ||
              'We could not open the sanctuary doors for you right now. Please try again.',
            t('common.offlineMessage') ||
              'You appear to be offline. Please check your connection to enter as a guest.',
          ),
          type: 'error',
        });
      } finally {
        guestEntryInFlightRef.current = false;
        setIsConnecting(false);
      }
    }, [isConnecting, onGuest, showToast, t]);

    const handleLoginPress = useCallback(() => {
      hapticLight();
      if (onLogin) onLogin();
    }, [onLogin]);

    const realms = useMemo<readonly SanctuaryRealmItem[]>(
      () => [
        {
          id: 'self',
          label: 'Self',
          title: 'Inner Clarity & Reflection',
          desc: 'Mindful journaling, mood tracking, and personal breathing spaces.',
          tone: accent.action,
        },
        {
          id: 'workspace',
          label: 'Workspace',
          title: 'Classroom & Schedule Calm',
          desc: 'Effortless timetable tracking, relief periods, and curriculum rhythm.',
          tone: Theme.colors.gurudeviBlue,
        },
        {
          id: 'community',
          label: 'Community',
          title: 'Educator Connection',
          desc: 'Shared wisdom, collaborative notes, and peer encouragement.',
          tone: Theme.colors.gurudeviViolet,
        },
        {
          id: 'library',
          label: 'Library',
          title: 'Curated Teaching Media',
          desc: 'Open educational resources, books, and sovereign lesson assets.',
          tone: Theme.colors.skyBlue,
        },
      ],
      [accent.action],
    );

    const activeRealm = useMemo(
      () => realms.find((r) => r.id === selectedRealm) ?? realms[0],
      [realms, selectedRealm],
    );

    const handleSheetScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
      const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
      const maxScroll = scrollHeight - clientHeight;
      if (maxScroll > 0) {
        setSheetScrollProgress(Math.min(1, Math.max(0, scrollTop / maxScroll)));
      }
    }, []);

    return (
      <div
        className="spatial-sanctuary-viewport"
        style={{
          width: '100vw',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: isDark ? '#14121E' : '#F5EDD6',
          color: isDark ? '#FAF8F5' : '#2A2318',
          fontFamily: 'var(--font-sans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif)',
        }}
      >
        {/* ============================================================ */}
        {/* LAYER 0: Ground Datum Matrix (Occluded by Upper Solid Sheets)*/}
        {/* ============================================================ */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            backgroundImage: isDark
              ? 'radial-gradient(rgba(184, 169, 224, 0.15) 0.75px, transparent 0.75px)'
              : 'radial-gradient(rgba(42, 35, 24, 0.12) 0.75px, transparent 0.75px)',
            backgroundSize: '16px 16px',
            opacity: 0.85,
            zIndex: 0,
          }}
        />

        {/* Ambient bioluminescent / sunlight gradients */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: '-15%',
            left: '-10%',
            width: '45vw',
            height: '45vw',
            maxWidth: 600,
            maxHeight: 600,
            borderRadius: '50%',
            background: `radial-gradient(circle, rgba(${accentRgb}, ${isDark ? 0.22 : 0.12}) 0%, transparent 70%)`,
            filter: 'blur(40px)',
            pointerEvents: 'none',
            zIndex: 1,
            transition: 'background 0.5s ease',
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            bottom: '-10%',
            right: '-10%',
            width: '40vw',
            height: '40vw',
            maxWidth: 550,
            maxHeight: 550,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${isDark ? 'rgba(107, 100, 128, 0.25)' : 'rgba(212, 132, 58, 0.08)'} 0%, transparent 70%)`,
            filter: 'blur(40px)',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />

        {/* ============================================================ */}
        {/* LAYER 3: Fixed Spatial Gateway Header                        */}
        {/* ============================================================ */}
        <GatewayHeader />

        {/* ============================================================ */}
        {/* STAGE CONTAINER (Split-Horizon on Desktop, Stack on Mobile)  */}
        {/* ============================================================ */}
        <main
          style={{
            flex: 1,
            display: 'flex',
            position: 'relative',
            zIndex: 2,
            overflow: 'hidden',
            width: '100%',
            maxWidth: 1200,
            margin: '0 auto',
            padding: '24px 20px 16px 20px',
            boxSizing: 'border-box',
            gap: 32,
          }}
        >
          {/* ------------------------------------------------------------ */}
          {/* LAYER 1: Anchored Landmark Hero (Fixed / Non-Displacing)    */}
          {/* ------------------------------------------------------------ */}
          <section
            aria-label="Sanctuary Landmark"
            style={{
              flex: '1 1 45%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'flex-start',
              position: 'relative',
              userSelect: 'none',
            }}
          >
            {/* Sanctuary Horizon Pill */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 14px',
                borderRadius: 999,
                border: isDark ? '1px solid rgba(255, 255, 255, 0.16)' : '1px solid rgba(42, 35, 24, 0.14)',
                backgroundColor: isDark ? 'rgba(20, 18, 30, 0.6)' : 'rgba(245, 237, 214, 0.6)',
                backdropFilter: 'blur(8px)',
                boxShadow: '0 1px 0 rgba(107, 100, 128, 0.1)',
                marginBottom: 20,
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: activeRealm?.tone || accent.action,
                  boxShadow: `0 0 8px ${activeRealm?.tone || accent.action}`,
                }}
              />
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: '1.5px',
                  textTransform: 'uppercase',
                  color: isDark ? '#E8F4F1' : '#2A2318',
                }}
              >
                GURUDEVI SANCTUARY
              </span>
            </div>

            {/* Living Mascot Presentation */}
            <div
              style={{
                position: 'relative',
                marginBottom: 16,
                transform: `scale(${1 + sheetScrollProgress * 0.04})`,
                transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              <Mascot
                artwork={exploreArtwork}
                mode="glowing"
                podVariant="halo"
                size={160}
                state="guiding"
              />
            </div>

            {/* Sanctuary Headline */}
            <h1
              style={{
                fontSize: 'clamp(28px, 3.2vw, 42px)',
                fontWeight: 900,
                letterSpacing: '-1px',
                lineHeight: 1.15,
                margin: '0 0 12px 0',
                color: isDark ? '#FAF8F5' : '#2A2318',
              }}
            >
              {t('welcome.message') || 'Welcome to Gurudevi'}
            </h1>

            <p
              style={{
                fontSize: 16,
                lineHeight: 1.5,
                margin: 0,
                color: isDark ? 'rgba(250, 248, 245, 0.7)' : 'rgba(42, 35, 24, 0.75)',
                maxWidth: 420,
              }}
            >
              {t('welcome.subtitle') || 'Education born from love, held in quiet clarity, built for teachers.'}
            </p>

            {/* Real-time spatial datum compass line */}
            <div
              style={{
                marginTop: 24,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <span style={{ fontSize: 12, fontWeight: 700, opacity: 0.6, letterSpacing: '0.5px' }}>
                SPATIAL REALM:
              </span>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  color: activeRealm?.tone || accent.action,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                }}
              >
                [{activeRealm?.label}]
              </span>
            </div>
          </section>

          {/* ------------------------------------------------------------ */}
          {/* LAYER 2: Floating Gliding Sheet (Independently Scrollable)  */}
          {/* ------------------------------------------------------------ */}
          <section
            aria-label="Sanctuary Entrance Doorway"
            onScroll={handleSheetScroll}
            style={{
              flex: '1 1 55%',
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: isDark ? '#1C1929' : '#FCF9F0',
              borderRadius: 32,
              border: isDark ? '1.5px solid #3E384D' : '1.5px solid #DED6C3',
              boxShadow: isDark
                ? '0 3px 0 rgba(107, 100, 128, 0.35), 0 20px 40px rgba(0,0,0,0.5)'
                : '0 3px 0 rgba(107, 100, 128, 0.18), 0 16px 36px rgba(42, 35, 24, 0.08)',
              overflowY: 'auto',
              padding: '28px 24px',
              boxSizing: 'border-box',
              position: 'relative',
              scrollbarWidth: 'thin',
            }}
          >
            {/* Top Sheet Anchor Indicator */}
            <div
              style={{
                width: 44,
                height: 4,
                borderRadius: 2,
                backgroundColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(42,35,24,0.15)',
                alignSelf: 'center',
                marginBottom: 20,
              }}
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Realm Navigator Bar */}
              <div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                    color: isDark ? '#A69BBF' : '#7A6E5F',
                    display: 'block',
                    marginBottom: 10,
                  }}
                >
                  DISCOVER THE SANCTUARY REALMS
                </span>

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {realms.map((r) => {
                    const isSelected = r.id === selectedRealm;
                    return (
                      <button
                        type="button"
                        key={r.id}
                        onClick={() => {
                          hapticLight();
                          setSelectedRealm(r.id);
                        }}
                        style={{
                          padding: '8px 16px',
                          borderRadius: 20,
                          fontSize: 13,
                          fontWeight: 700,
                          cursor: 'pointer',
                          border: isSelected
                            ? `1.5px solid ${r.tone}`
                            : isDark
                              ? '1.5px solid rgba(255,255,255,0.1)'
                              : '1.5px solid rgba(42,35,24,0.12)',
                          backgroundColor: isSelected
                            ? isDark
                              ? 'rgba(255,255,255,0.08)'
                              : 'rgba(42,35,24,0.05)'
                            : 'transparent',
                          color: isSelected ? (isDark ? '#FAF8F5' : '#2A2318') : isDark ? '#8C82A2' : '#7A6E5F',
                          boxShadow: isSelected ? `0 1.5px 0 ${r.tone}` : 'none',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {r.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active Realm Card Preview (Tactile Occlusion Slab) */}
              <div
                style={{
                  padding: '18px 20px',
                  borderRadius: 20,
                  backgroundColor: isDark ? '#14121E' : '#F5EDD6',
                  border: isDark ? '1.25px solid #2F2A3D' : '1.25px solid #E5DCB8',
                  boxShadow: '0 1.5px 0 rgba(107, 100, 128, 0.12)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      backgroundColor: activeRealm?.tone,
                    }}
                  />
                  <h3
                    style={{
                      fontSize: 16,
                      fontWeight: 800,
                      margin: 0,
                      color: isDark ? '#FAF8F5' : '#2A2318',
                    }}
                  >
                    {activeRealm?.title}
                  </h3>
                </div>
                <p
                  style={{
                    fontSize: 13,
                    lineHeight: 1.5,
                    margin: 0,
                    paddingLeft: 18,
                    color: isDark ? 'rgba(250, 248, 245, 0.7)' : 'rgba(42, 35, 24, 0.7)',
                  }}
                >
                  {activeRealm?.desc}
                </p>
              </div>

              {/* Doorway Entrance Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
                {/* 1-Tap Guest Exploration Button (Tactile 0px-blur 3D Bevel) */}
                <button
                  type="button"
                  onClick={() => {
                    void handleStartExploring();
                  }}
                  disabled={isConnecting}
                  style={{
                    height: 52,
                    width: '100%',
                    borderRadius: 16,
                    backgroundColor: '#D4843A',
                    color: '#FFFDF7',
                    fontSize: 16,
                    fontWeight: 800,
                    border: '1.5px solid #B06927',
                    boxShadow: '0 3px 0 #8A4F19',
                    cursor: isConnecting ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    transition: 'transform 0.08s ease, box-shadow 0.08s ease',
                  }}
                  onMouseDown={(e) => {
                    e.currentTarget.style.transform = 'translate(0, 2px)';
                    e.currentTarget.style.boxShadow = '0 1px 0 #8A4F19';
                  }}
                  onMouseUp={(e) => {
                    e.currentTarget.style.transform = 'translate(0, 0)';
                    e.currentTarget.style.boxShadow = '0 3px 0 #8A4F19';
                  }}
                >
                  {isConnecting ? (
                    <span>Opening Sanctuary Doors...</span>
                  ) : (
                    <span>{t('welcome.exploreAsGuest') || 'Explore as Guest'}</span>
                  )}
                </button>

                {/* Account Doorway Button */}
                <button
                  type="button"
                  onClick={handleLoginPress}
                  style={{
                    height: 48,
                    width: '100%',
                    borderRadius: 16,
                    backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(42,35,24,0.03)',
                    color: isDark ? '#FAF8F5' : '#2A2318',
                    fontSize: 15,
                    fontWeight: 700,
                    border: isDark ? '1.5px solid rgba(255,255,255,0.12)' : '1.5px solid rgba(42,35,24,0.14)',
                    boxShadow: '0 2px 0 rgba(107, 100, 128, 0.15)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'transform 0.08s ease, box-shadow 0.08s ease',
                  }}
                  onMouseDown={(e) => {
                    e.currentTarget.style.transform = 'translate(0, 1.5px)';
                    e.currentTarget.style.boxShadow = '0 0.5px 0 rgba(107, 100, 128, 0.15)';
                  }}
                  onMouseUp={(e) => {
                    e.currentTarget.style.transform = 'translate(0, 0)';
                    e.currentTarget.style.boxShadow = '0 2px 0 rgba(107, 100, 128, 0.15)';
                  }}
                >
                  {t('welcome.login') || 'I have an account · Log In'}
                </button>
              </div>

              {/* Legal & Security Baseline */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 6,
                  paddingTop: 12,
                  fontSize: 12,
                  color: isDark ? 'rgba(250, 248, 245, 0.5)' : 'rgba(42, 35, 24, 0.55)',
                  textAlign: 'center',
                }}
              >
                <div>
                  By entering, you agree to our{' '}
                  <a
                    href={EXTERNAL_URLS.terms}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      color: accent.action,
                      fontWeight: 700,
                      textDecoration: 'underline',
                    }}
                  >
                    Terms
                  </a>{' '}
                  &{' '}
                  <a
                    href={EXTERNAL_URLS.privacy}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      color: accent.action,
                      fontWeight: 700,
                      textDecoration: 'underline',
                    }}
                  >
                    Privacy
                  </a>
                </div>
                <div>Encrypted • Offline-First • Designed for Educators</div>
              </div>
            </div>
          </section>
        </main>

        {/* ============================================================ */}
        {/* LAYER 3: Fixed Spatial Gateway Footer                        */}
        {/* ============================================================ */}
        <GatewayFooter />
      </div>
    );
  },
);

SpatialSanctuaryWelcomeScreen.displayName = 'SpatialSanctuaryWelcomeScreen';

export default SpatialSanctuaryWelcomeScreen;
