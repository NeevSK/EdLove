/**
 * WelcomeScreen.web.tsx — Split-panel landing page (Pattern A)
 *
 * On native, WelcomeScreen is a mobile-style centred card. On web Metro
 * resolves this file instead, rendering a two-column layout:
 *
 *  ┌──────────────────────┬────────────────────────────┐
 *  │  LEFT PANEL          │  RIGHT PANEL               │
 *  │  Branding + mission  │  Auth card                 │
 *  │  3 stat pills        │  Language selector         │
 *  │  Five Pillars chips  │  Explore/Login buttons     │
 *  └──────────────────────┴────────────────────────────┘
 *
 * Auth logic is identical to the native screen (same handlers, same hooks).
 * AuthScreen renders on top of this layout when the user taps "I have an account".
 *
 * Design tokens: Vellum bg · Ink text · Saffron primary · Dalu Green secondary
 * Shadow rule: Shadow Violet only, never grey/black.
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    Pressable,
    StyleSheet,
    useWindowDimensions,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Theme } from '@repo/ui';
import { useTheme } from '@repo/ui';
import { authAPI, handleAPIError } from '@repo/core';
import { hapticLight, hapticSuccess, hapticError, openExternalURL } from '@repo/ui';
import { LanguageUtils } from '../utils/LanguageUtils';
import AuthScreen from './AuthScreen';

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────
const LANGUAGES = [
    { code: 'en', label: 'EN' },
    { code: 'si', label: 'සිං' },
    { code: 'ta', label: 'தமி' },
];

const STATS = [
    { value: '500+', label: 'Teachers' },
    { value: '20k+', label: 'Students' },
    { value: '150+', label: 'Schools' },
];

const PILLARS = [
    { name: 'Self',      emoji: '♥',  color: Theme.colors.sanctuarySaffron },
    { name: 'Classroom', emoji: '🏫', color: Theme.colors.sageGreen },
    { name: 'Community', emoji: '🤝', color: Theme.colors.shadowViolet },
    { name: 'Library',   emoji: '📚', color: Theme.colors.skyBlue },
    { name: 'Profile',   emoji: '🪪', color: Theme.colors.sanctuarySaffron },
];

// Phase → gradient stop colours — mapped to Theme tokens (circadian identity, no raw hex)
const PHASE_GRADIENT: Record<string, [string, string]> = {
    predawn:   [Theme.colors.obsidian,    Theme.colors.ink],
    dawn:      [Theme.colors.dawnWhite,   Theme.colors.vellum],
    morning:   [Theme.colors.vellum,      Theme.colors.silk],
    midday:    [Theme.colors.silk,        Theme.colors.linen],
    afternoon: [Theme.colors.vellum,      Theme.colors.dawnWhite],
    evening:   [Theme.colors.eveningWarm, Theme.colors.linen],
    dusk:      [Theme.colors.ink,         Theme.colors.shroud],
    night:     [Theme.colors.obsidian,    Theme.colors.ink],
};

// ─────────────────────────────────────────────
// LeftPanel — standalone component (must NOT be defined inside render)
// ─────────────────────────────────────────────
interface LeftPanelProps {
    isDark: boolean;
    isNarrow: boolean;
}

function LeftPanel({ isDark, isNarrow }: LeftPanelProps) {
    return (
        <View style={[styles.leftPanel, isNarrow && styles.leftPanelNarrow]}>
            {/* Logo */}
            <View style={styles.logoRow}>
                <View style={styles.logoCircle}>
                    <Text style={styles.logoGlyph}>🪷</Text>
                </View>
                <Text style={[styles.logoName, { color: isDark ? Theme.colors.sacredWhite : Theme.colors.inkTruth }]}>
                    Gurudevi
                </Text>
            </View>

            {/* Headline */}
            <Text style={[styles.headline, { color: isDark ? Theme.colors.sacredWhite : Theme.colors.inkTruth }]}>
                A Sanctuary{'\n'}for Teachers
            </Text>

            {/* Tagline */}
            <Text style={[styles.tagline, { color: isDark ? Theme.colors.starlightGray : Theme.colors.bark }]}>
                Mending the teaching-learning{'\n'}impedance match — through care, not surveillance.
            </Text>

            {/* Stats */}
            <View style={styles.statsRow}>
                {STATS.map((s) => (
                    <View key={s.label} style={[styles.statPill, { borderColor: Theme.colors.sanctuarySaffron + '30' }]}>
                        <Text style={[styles.statValue, { color: Theme.colors.sanctuarySaffron }]}>
                            {s.value}
                        </Text>
                        <Text style={[styles.statLabel, { color: isDark ? Theme.colors.starlightGray : Theme.colors.bark }]}>
                            {s.label}
                        </Text>
                    </View>
                ))}
            </View>

            {/* Five Pillars */}
            <View style={styles.pillarsRow}>
                {PILLARS.map((p) => (
                    <View key={p.name} style={[styles.pillarChip, { borderColor: p.color + '30', backgroundColor: p.color + '10' }]}>
                        <Text style={styles.pillarEmoji}>{p.emoji}</Text>
                        <Text style={[styles.pillarName, { color: p.color }]}>{p.name}</Text>
                    </View>
                ))}
            </View>

            {/* Quote */}
            <View style={[styles.quoteBox, { borderLeftColor: Theme.colors.sanctuarySaffron, backgroundColor: Theme.colors.sanctuarySaffron + '0A' }]}>
                <Text style={[styles.quoteText, { color: isDark ? Theme.colors.starlightGray : Theme.colors.bark }]}>
                    "Education is a living ecology,{'\n'}not a linear process."
                </Text>
            </View>
        </View>
    );
}

// ─────────────────────────────────────────────
// RightPanel — standalone component (must NOT be defined inside render)
// ─────────────────────────────────────────────
interface RightPanelProps {
    isDark: boolean;
    i18nLanguage: string;
    acceptedTerms: boolean;
    isConnecting: boolean;
    langHover: string | null;
    btnHover: 'explore' | 'login' | null;
    onChangeLanguage: (code: string) => void;
    onStartExploring: () => void;
    onLogin: () => void;
    onToggleTerms: () => void;
    onLangHoverIn: (code: string) => void;
    onLangHoverOut: () => void;
    onBtnHoverIn: (btn: 'explore' | 'login') => void;
    onBtnHoverOut: () => void;
    footer: string;
}

function RightPanel({
    isDark,
    i18nLanguage,
    acceptedTerms,
    isConnecting,
    langHover,
    btnHover,
    onChangeLanguage,
    onStartExploring,
    onLogin,
    onToggleTerms,
    onLangHoverIn,
    onLangHoverOut,
    onBtnHoverIn,
    onBtnHoverOut,
    footer,
}: RightPanelProps) {
    return (
        <View style={styles.rightPanel}>
            <View style={[
                styles.authCard,
                {
                    backgroundColor: isDark ? Theme.colors.shroud : '#FFFDF7',
                    borderColor: isDark ? 'rgba(252,249,242,0.08)' : 'rgba(42,35,24,0.07)',
                    shadowColor: Theme.colors.shadowViolet,
                },
            ]}>
                {/* Language selector */}
                <View style={styles.langRow}>
                    {LANGUAGES.map((lang) => {
                        const isActive = i18nLanguage?.startsWith(lang.code);
                        const isHov = langHover === lang.code;
                        return (
                            <Pressable
                                key={lang.code}
                                onPress={() => onChangeLanguage(lang.code)}
                                onHoverIn={() => onLangHoverIn(lang.code)}
                                onHoverOut={onLangHoverOut}
                                style={[
                                    styles.langPill,
                                    {
                                        backgroundColor: isActive
                                            ? Theme.colors.sanctuarySaffron
                                            : isHov
                                                ? (isDark ? 'rgba(252,249,242,0.08)' : 'rgba(42,35,24,0.05)')
                                                : 'transparent',
                                    },
                                ]}
                            >
                                <Text style={[
                                    styles.langText,
                                    {
                                        color: isActive
                                            ? '#FFFDF7'
                                            : isDark ? Theme.colors.starlightGray : Theme.colors.bark,
                                        fontWeight: isActive ? '700' : '500',
                                    },
                                ]}>
                                    {lang.label}
                                </Text>
                            </Pressable>
                        );
                    })}
                </View>

                {/* Greeting */}
                <Text style={[styles.cardTitle, { color: isDark ? Theme.colors.sacredWhite : Theme.colors.inkTruth }]}>
                    Welcome to the Sanctuary
                </Text>
                <Text style={[styles.cardSubtitle, { color: isDark ? Theme.colors.starlightGray : Theme.colors.bark }]}>
                    Choose how you'd like to begin your journey.
                </Text>

                {/* Explore button */}
                <Pressable
                    onPress={onStartExploring}
                    onHoverIn={() => onBtnHoverIn('explore')}
                    onHoverOut={onBtnHoverOut}
                    disabled={isConnecting}
                    accessibilityRole="button"
                    style={[
                        styles.primaryBtn,
                        {
                            backgroundColor: acceptedTerms
                                ? Theme.colors.sanctuarySaffron
                                : Theme.colors.willow,
                            opacity: btnHover === 'explore' ? 0.88 : 1,
                            transform: btnHover === 'explore' ? [{ scale: 1.015 }] : [{ scale: 1 }],
                        },
                    ]}
                >
                    {isConnecting ? (
                        <ActivityIndicator color="#FFFDF7" size="small" />
                    ) : (
                        <Text style={styles.primaryBtnText}>
                            Explore as Guest
                        </Text>
                    )}
                </Pressable>

                {/* Login button */}
                <Pressable
                    onPress={onLogin}
                    onHoverIn={() => onBtnHoverIn('login')}
                    onHoverOut={onBtnHoverOut}
                    accessibilityRole="button"
                    style={[
                        styles.secondaryBtn,
                        {
                            borderColor: isDark ? 'rgba(252,249,242,0.15)' : 'rgba(42,35,24,0.15)',
                            backgroundColor: btnHover === 'login'
                                ? (isDark ? 'rgba(252,249,242,0.05)' : 'rgba(42,35,24,0.03)')
                                : 'transparent',
                        },
                    ]}
                >
                    <Text style={[
                        styles.secondaryBtnText,
                        { color: isDark ? Theme.colors.starlightGray : Theme.colors.bark },
                    ]}>
                        I have an account
                    </Text>
                </Pressable>

                {/* Terms — accessible checkbox */}
                <Pressable
                    onPress={onToggleTerms}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: acceptedTerms }}
                    accessibilityLabel="Accept Terms and Privacy Pact"
                    style={styles.termsRow}
                >
                    <View style={[
                        styles.checkbox,
                        {
                            backgroundColor: acceptedTerms ? Theme.colors.sanctuarySaffron : 'transparent',
                            borderColor: acceptedTerms ? Theme.colors.sanctuarySaffron : (isDark ? Theme.colors.starlightGray : Theme.colors.willow),
                        },
                    ]}>
                        {acceptedTerms && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                    <Text style={[styles.termsText, { color: isDark ? Theme.colors.starlightGray : Theme.colors.bark }]}>
                        I agree to the{' '}
                    </Text>
                    <Pressable
                        onPress={(e) => {
                            e.stopPropagation();
                            openExternalURL('https://neevsk.org/privacy');
                        }}
                        accessibilityRole="link"
                        accessibilityLabel="Read Privacy Pact"
                    >
                        <Text style={{ color: Theme.colors.sanctuarySaffron, fontWeight: '600', textDecorationLine: 'underline', fontSize: 13 }}>
                            Privacy Pact
                        </Text>
                    </Pressable>
                </Pressable>

                {/* Footer note */}
                <Text style={[styles.cardFooter, { color: isDark ? Theme.colors.mistGray : Theme.colors.willow }]}>
                    {footer}
                </Text>
            </View>
        </View>
    );
}

// ─────────────────────────────────────────────
// WelcomeScreen (web)
// ─────────────────────────────────────────────
interface WelcomeScreenProps {
    onNext?: () => void;
    initialShowAuth?: boolean;
}

export default function WelcomeScreen({ onNext, initialShowAuth = false }: WelcomeScreenProps) {
    const { t, i18n } = useTranslation();
    const { phase, isDark } = useTheme();
    const { width } = useWindowDimensions();

    const [showAuth, setShowAuth] = useState(initialShowAuth);
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [langHover, setLangHover] = useState<string | null>(null);
    const [btnHover, setBtnHover] = useState<'explore' | 'login' | null>(null);

    const isNarrow = width < 768;

    const [bgFrom] = PHASE_GRADIENT[phase] ?? PHASE_GRADIENT.morning;

    const changeLanguage = async (code: string) => {
        hapticLight();
        await LanguageUtils.setLanguage(code as 'en' | 'si' | 'ta');
    };

    const handleStartExploring = async () => {
        if (!acceptedTerms) { hapticError(); return; }
        hapticSuccess();
        setIsConnecting(true);
        try {
            await authAPI.signInAnonymously();
            onNext?.();
        } catch (err) {
            handleAPIError(err);
            setIsConnecting(false);
        }
    };

    const handleLogin = () => {
        if (!acceptedTerms) { hapticError(); return; }
        hapticLight();
        setShowAuth(true);
    };

    // ── Auth mode: render AuthScreen full-screen ──────────────────────────
    if (showAuth) {
        return (
            <AuthScreen
                isAnonymous
                onContinueAsGuest={handleStartExploring}
                onSuccess={() => { onNext?.(); }}
            />
        );
    }

    const footer = t('welcome.footer') || 'Part of the EdLove Constellation · Made with 💖 in Sri Lanka';

    // ─────────────────────────────────────────
    // Full layout
    // ─────────────────────────────────────────
    return (
        <View style={[styles.root, { backgroundColor: bgFrom }]}>
            {/* Subtle ambient glow blobs */}
            <View style={[styles.blob1, { backgroundColor: Theme.colors.sanctuarySaffron + '12' }]} />
            <View style={[styles.blob2, { backgroundColor: Theme.colors.sageGreen + '0D' }]} />

            {isNarrow ? (
                // ── Mobile web: stack vertically ──────────────────────────
                <ScrollView
                    contentContainerStyle={styles.narrowContent}
                    showsVerticalScrollIndicator={false}
                >
                    <LeftPanel isDark={isDark} isNarrow={isNarrow} />
                    <RightPanel
                        isDark={isDark}
                        i18nLanguage={i18n.language}
                        acceptedTerms={acceptedTerms}
                        isConnecting={isConnecting}
                        langHover={langHover}
                        btnHover={btnHover}
                        onChangeLanguage={changeLanguage}
                        onStartExploring={handleStartExploring}
                        onLogin={handleLogin}
                        onToggleTerms={() => setAcceptedTerms((v) => !v)}
                        onLangHoverIn={setLangHover}
                        onLangHoverOut={() => setLangHover(null)}
                        onBtnHoverIn={setBtnHover}
                        onBtnHoverOut={() => setBtnHover(null)}
                        footer={footer}
                    />
                </ScrollView>
            ) : (
                // ── Desktop web: two-column layout ────────────────────────
                <View style={styles.twoCol}>
                    <LeftPanel isDark={isDark} isNarrow={false} />
                    <RightPanel
                        isDark={isDark}
                        i18nLanguage={i18n.language}
                        acceptedTerms={acceptedTerms}
                        isConnecting={isConnecting}
                        langHover={langHover}
                        btnHover={btnHover}
                        onChangeLanguage={changeLanguage}
                        onStartExploring={handleStartExploring}
                        onLogin={handleLogin}
                        onToggleTerms={() => setAcceptedTerms((v) => !v)}
                        onLangHoverIn={setLangHover}
                        onLangHoverOut={() => setLangHover(null)}
                        onBtnHoverIn={setBtnHover}
                        onBtnHoverOut={() => setBtnHover(null)}
                        footer={footer}
                    />
                </View>
            )}
        </View>
    );
}

// ─────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────
const styles = StyleSheet.create({
    root: {
        flex: 1,
        overflow: 'hidden',
    },
    blob1: {
        position: 'absolute',
        width: 600,
        height: 600,
        borderRadius: 300,
        top: -200,
        left: -100,
    },
    blob2: {
        position: 'absolute',
        width: 400,
        height: 400,
        borderRadius: 200,
        bottom: -100,
        right: -50,
    },
    twoCol: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'stretch',
    },
    narrowContent: {
        flexGrow: 1,
        paddingVertical: 24,
        gap: 16,
    },

    // ── Left panel ──────────────────────────────────────────────────────
    leftPanel: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 56,
        paddingVertical: 48,
        gap: 20,
    },
    leftPanelNarrow: {
        paddingHorizontal: 24,
        paddingVertical: 32,
        alignItems: 'center',
    },
    logoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 8,
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
        fontSize: 52,
        fontWeight: '800',
        letterSpacing: -1.5,
        lineHeight: 58,
    },
    tagline: {
        fontSize: 17,
        lineHeight: 26,
        maxWidth: 400,
    },
    statsRow: {
        flexDirection: 'row',
        gap: 10,
        flexWrap: 'wrap',
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
        maxWidth: 380,
    },
    quoteText: {
        fontSize: 14,
        lineHeight: 22,
        fontStyle: 'italic',
    },

    // ── Right panel ─────────────────────────────────────────────────────
    rightPanel: {
        width: 420,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
        paddingVertical: 48,
    },
    authCard: {
        width: '100%',
        borderRadius: 28,
        borderWidth: 1,
        padding: 32,
        gap: 14,
        shadowOpacity: 0.16,
        shadowRadius: 28,
        shadowOffset: { width: 0, height: 8 },
        elevation: 12,
    },
    langRow: {
        flexDirection: 'row',
        gap: 4,
        marginBottom: 6,
    },
    langPill: {
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 50,
    },
    langText: {
        fontSize: 12,
        letterSpacing: 0.3,
    },
    cardTitle: {
        fontSize: 22,
        fontWeight: '800',
        letterSpacing: -0.4,
        lineHeight: 28,
    },
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
        shadowColor: 'rgba(107,100,128,1)',
        shadowOpacity: 0.20,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 4 },
    },
    primaryBtnText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFDF7',
        letterSpacing: 0.2,
    },
    secondaryBtn: {
        borderRadius: 50,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
        minHeight: 50,
    },
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
