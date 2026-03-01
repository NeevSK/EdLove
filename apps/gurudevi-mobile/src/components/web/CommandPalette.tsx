/**
 * CommandPalette — Web-exclusive Cmd+K power feature
 *
 * Brings the "developer god mode" experience to Gurudevi on web.
 * Inspired by Linear/Notion/Raycast — a searchable overlay that lets
 * power users navigate anywhere in one keystroke.
 *
 * Keyboard triggers:
 *   Cmd+K / Ctrl+K  — open / close
 *   Escape          — close
 *   ↑ / ↓          — move selection
 *   Enter           — execute selected command
 *   Cmd+1–5        — jump directly to a tab (works even when closed)
 *
 * Design: Vellum glass card · Saffron active accent · Shadow Violet depth
 * The palette is only rendered on web (Platform.OS === 'web' guard in App.tsx).
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    View,
    Text,
    TextInput,
    Pressable,
    StyleSheet,
    Platform,
    useWindowDimensions,
    ScrollView,
} from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import { Theme } from '@repo/ui';
import { useTheme } from '@repo/ui';
import { navigationRef } from '../../navigation/navigationRef';

// Helper: type-safe reference to the browser window (this file is web-only at runtime)
const win = (typeof window !== 'undefined' ? window : null) as Window | null;

// ─── Icons (inline SVG paths rendered as Text glyphs for zero extra deps) ─────
const GLYPHS: Record<string, string> = {
    Self:        '♥',
    Classroom:   '🏫',
    Community:   '🤝',
    Library:     '📚',
    Profile:     '👤',
    AIAssistant: '✦',
    QRScanner:   '⊞',
};

// ─── Command definitions ───────────────────────────────────────────────────────
interface Command {
    id: string;
    label: string;
    subtitle?: string;
    glyph: string;
    section: string;
    shortcut?: string;
    action: () => void;
}

// ─── Component ─────────────────────────────────────────────────────────────────
interface CommandPaletteProps {
    onOpenAI?: () => void;
    onOpenScanner?: () => void;
}

export default function CommandPalette({ onOpenAI, onOpenScanner }: CommandPaletteProps) {
    const [visible, setVisible] = useState(false);
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [searchFocused, setSearchFocused] = useState(false);
    const { isDark } = useTheme();
    const { width } = useWindowDimensions();
    const inputRef = useRef<TextInput>(null);

    // Animation values
    const opacity = useSharedValue(0);
    const scale = useSharedValue(0.94);
    const backdropOpacity = useSharedValue(0);

    const open = useCallback(() => {
        setVisible(true);
        setQuery('');
        setSelectedIndex(0);
        opacity.value = withSpring(1, { damping: 20, stiffness: 300 });
        scale.value = withSpring(1, { damping: 20, stiffness: 300 });
        backdropOpacity.value = withTiming(1, { duration: 180 });
        setTimeout(() => inputRef.current?.focus(), 80);
    }, []);

    const close = useCallback(() => {
        opacity.value = withTiming(0, { duration: 140 });
        scale.value = withTiming(0.94, { duration: 140 });
        backdropOpacity.value = withTiming(0, { duration: 140 });
        setTimeout(() => setVisible(false), 150);
    }, []);

    const navigate = (screen: string, params?: Record<string, unknown>) => {
        if (navigationRef.isReady()) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (navigationRef as any).navigate(screen, params);
        }
    };

    const goToTab = (tabName: string) => {
        if (!navigationRef.isReady()) return;
        // Only navigate to Main tabs when the Main route is already in the stack.
        // Pressing Cmd+1-5 on the Welcome or Onboarding screens would otherwise
        // emit an unhandled NAVIGATE action and produce a console warning.
        const state = navigationRef.getState() as { routes?: Array<{ name: string }> } | undefined;
        const hasMain = state?.routes?.some((r) => r.name === 'Main');
        if (hasMain) {
            navigate('Main', { screen: tabName });
        }
        close();
    };

    // Build command list
    const commands: Command[] = [
        // Navigate section
        {
            id: 'self',
            label: 'Self',
            subtitle: 'Your sanctuary & wellbeing',
            glyph: GLYPHS.Self,
            section: 'Navigate',
            shortcut: '⌘3',
            action: () => goToTab('Self'),
        },
        {
            id: 'classroom',
            label: 'Classroom',
            subtitle: 'Lessons, students & teaching',
            glyph: GLYPHS.Classroom,
            section: 'Navigate',
            shortcut: '⌘2',
            action: () => goToTab('Classroom'),
        },
        {
            id: 'community',
            label: 'Community',
            subtitle: 'Teachers sharing wisdom',
            glyph: GLYPHS.Community,
            section: 'Navigate',
            shortcut: '⌘4',
            action: () => goToTab('Community'),
        },
        {
            id: 'library',
            label: 'Library',
            subtitle: 'Resources & knowledge',
            glyph: GLYPHS.Library,
            section: 'Navigate',
            shortcut: '⌘5',
            action: () => goToTab('Library'),
        },
        {
            id: 'profile',
            label: 'Profile',
            subtitle: 'Your identity & settings',
            glyph: GLYPHS.Profile,
            section: 'Navigate',
            shortcut: '⌘1',
            action: () => goToTab('Profile'),
        },
        // Tools section
        {
            id: 'ai',
            label: 'AI Assistant',
            subtitle: 'Ask anything about teaching',
            glyph: GLYPHS.AIAssistant,
            section: 'Tools',
            shortcut: '⌘.',
            action: () => {
                onOpenAI?.();
                navigate('AIAssistant');
                close();
            },
        },
        {
            id: 'qr',
            label: 'Scan QR Code',
            subtitle: 'Join a class or redeem Thuthimal',
            glyph: GLYPHS.QRScanner,
            section: 'Tools',
            action: () => {
                onOpenScanner?.();
                close();
            },
        },
    ];

    // Filter by query
    const filtered = query.trim()
        ? commands.filter(
              (c) =>
                  c.label.toLowerCase().includes(query.toLowerCase()) ||
                  (c.subtitle ?? '').toLowerCase().includes(query.toLowerCase()),
          )
        : commands;

    // Group by section
    const sections = filtered.reduce<Record<string, Command[]>>((acc, cmd) => {
        if (!acc[cmd.section]) acc[cmd.section] = [];
        acc[cmd.section].push(cmd);
        return acc;
    }, {});

    // Global keyboard handler (web only)
    useEffect(() => {
        if (Platform.OS !== 'web') return;

        const TAB_MAP: Record<string, string> = {
            '1': 'Profile',
            '2': 'Classroom',
            '3': 'Self',
            '4': 'Community',
            '5': 'Library',
        };

        const handler = (e: KeyboardEvent) => {
            const meta = e.metaKey || e.ctrlKey;

            // Cmd+K — toggle
            if (meta && e.key === 'k') {
                e.preventDefault();
                if (visible) close(); else open();
                return;
            }
            // Cmd+. — AI assistant
            if (meta && e.key === '.') {
                e.preventDefault();
                navigate('AIAssistant');
                return;
            }
            // Cmd+1-5 — direct tab jump
            if (meta && TAB_MAP[e.key]) {
                e.preventDefault();
                goToTab(TAB_MAP[e.key]);
                return;
            }

            if (!visible) return;

            if (e.key === 'Escape') { close(); return; }
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
            }
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex((i) => Math.max(i - 1, 0));
            }
            if (e.key === 'Enter') {
                e.preventDefault();
                filtered[selectedIndex]?.action();
            }
        };

        (win as Window).addEventListener('keydown', handler);
        return () => (win as Window).removeEventListener('keydown', handler);
    }, [visible, filtered, selectedIndex, open, close]);

    // Reset selection when filter changes
    useEffect(() => { setSelectedIndex(0); }, [query]);

    // Animated styles
    const cardStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ scale: scale.value }],
    }));
    const backdropStyle = useAnimatedStyle(() => ({
        opacity: backdropOpacity.value,
    }));

    if (!visible) return null;

    const bg = isDark ? Theme.colors.shroud : '#FFFDF7';
    const border = isDark ? 'rgba(252,249,242,0.10)' : 'rgba(42,35,24,0.08)';
    const sectionColor = isDark ? Theme.colors.mistGray : Theme.colors.willow;
    const inputColor = isDark ? Theme.colors.sacredWhite : Theme.colors.inkTruth;

    // Flat list of commands for tracking globalIndex
    let globalIndex = 0;

    return (
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
            {/* Backdrop */}
            <Animated.View
                style={[StyleSheet.absoluteFill, styles.backdrop, backdropStyle]}
            >
                <Pressable
                    style={StyleSheet.absoluteFill}
                    onPress={close}
                    accessibilityLabel="Close command palette"
                />
            </Animated.View>

            {/* Palette card — dialog role for screen readers */}
            <View style={styles.centeredWrap} pointerEvents="box-none">
                <Animated.View
                    accessibilityViewIsModal
                    accessibilityRole="none"
                    style={[
                        styles.card,
                        {
                            backgroundColor: bg,
                            borderColor: border,
                            shadowColor: Theme.colors.shadowViolet,
                            width: Math.min(580, width - 48),
                        },
                        cardStyle,
                    ]}
                >
                    {/* Search input — border glows Saffron when focused */}
                    <View style={[
                        styles.searchRow,
                        {
                            borderBottomColor: searchFocused
                                ? Theme.colors.sanctuarySaffron
                                : border,
                            borderBottomWidth: searchFocused ? 1.5 : 1,
                        },
                    ]}>
                        <Text style={[styles.searchIcon, { color: Theme.colors.sanctuarySaffron }]}>
                            ⌕
                        </Text>
                        <TextInput
                            ref={inputRef}
                            style={[styles.searchInput, { color: inputColor }]}
                            placeholder="Navigate anywhere…"
                            placeholderTextColor={isDark ? Theme.colors.mistGray : Theme.colors.willow}
                            value={query}
                            onChangeText={setQuery}
                            onFocus={() => setSearchFocused(true)}
                            onBlur={() => setSearchFocused(false)}
                            autoCorrect={false}
                            autoCapitalize="none"
                        />
                        <View style={styles.escBadge}>
                            <Text style={[styles.escText, { color: sectionColor }]}>ESC</Text>
                        </View>
                    </View>

                    {/* Commands */}
                    <ScrollView
                        style={styles.commandList}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="always"
                    >
                        {Object.entries(sections).map(([sectionName, cmds]) => (
                            <View key={sectionName}>
                                {/* Section header */}
                                <Text style={[styles.sectionHeader, { color: sectionColor }]}>
                                    {sectionName.toUpperCase()}
                                </Text>

                                {cmds.map((cmd) => {
                                    const idx = globalIndex++;
                                    const isSelected = idx === selectedIndex;
                                    return (
                                        <Pressable
                                            key={cmd.id}
                                            onPress={cmd.action}
                                            onHoverIn={() => setSelectedIndex(idx)}
                                            style={[
                                                styles.commandItem,
                                                isSelected && [
                                                    styles.commandItemActive,
                                                    {
                                                        backgroundColor: isDark
                                                            ? 'rgba(212,132,58,0.12)'
                                                            : 'rgba(212,132,58,0.08)',
                                                    },
                                                ],
                                            ]}
                                        >
                                            {/* Active bar */}
                                            <View
                                                style={[
                                                    styles.activeBar,
                                                    { opacity: isSelected ? 1 : 0 },
                                                ]}
                                            />

                                            <View style={[styles.glyphCircle, {
                                                backgroundColor: isSelected
                                                    ? Theme.colors.sanctuarySaffron + '1A'
                                                    : (isDark ? 'rgba(252,249,242,0.06)' : 'rgba(42,35,24,0.05)'),
                                            }]}>
                                                <Text style={styles.glyph}>{cmd.glyph}</Text>
                                            </View>

                                            <View style={styles.labelWrap}>
                                                <Text style={[
                                                    styles.commandLabel,
                                                    {
                                                        color: isSelected
                                                            ? Theme.colors.sanctuarySaffron
                                                            : inputColor,
                                                        fontWeight: isSelected ? '700' : '500',
                                                    },
                                                ]}>
                                                    {cmd.label}
                                                </Text>
                                                {cmd.subtitle && (
                                                    <Text style={[styles.commandSubtitle, { color: sectionColor }]}>
                                                        {cmd.subtitle}
                                                    </Text>
                                                )}
                                            </View>

                                            {cmd.shortcut && (
                                                <View style={[
                                                    styles.shortcutBadge,
                                                    {
                                                        backgroundColor: isSelected
                                                            ? Theme.colors.sanctuarySaffron + '20'
                                                            : (isDark ? 'rgba(252,249,242,0.08)' : 'rgba(42,35,24,0.06)'),
                                                        borderColor: isSelected
                                                            ? Theme.colors.sanctuarySaffron + '40'
                                                            : border,
                                                    },
                                                ]}>
                                                    <Text style={[
                                                        styles.shortcutText,
                                                        {
                                                            color: isSelected
                                                                ? Theme.colors.sanctuarySaffron
                                                                : sectionColor,
                                                        },
                                                    ]}>
                                                        {cmd.shortcut}
                                                    </Text>
                                                </View>
                                            )}
                                        </Pressable>
                                    );
                                })}
                            </View>
                        ))}

                        {filtered.length === 0 && (
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyGlyph}>🪷</Text>
                                <Text style={[styles.emptyText, { color: sectionColor }]}>
                                    No results for "{query}"
                                </Text>
                            </View>
                        )}
                    </ScrollView>

                    {/* Footer hint */}
                    <View style={[styles.footer, { borderTopColor: border }]}>
                        <Text style={[styles.footerHint, { color: sectionColor }]}>
                            ↑↓ navigate · ↵ open · ⌘K close
                        </Text>
                    </View>
                </Animated.View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        backgroundColor: 'rgba(42,35,24,0.40)',
    },
    centeredWrap: {
        flex: 1,
        alignItems: 'center',
        paddingTop: '12%',
    },
    card: {
        borderRadius: 20,
        borderWidth: 1,
        shadowOpacity: 0.22,
        shadowRadius: 40,
        shadowOffset: { width: 0, height: 16 },
        elevation: 24,
        maxHeight: 520,
        overflow: 'hidden',
    },
    searchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        gap: 12,
    },
    searchIcon: {
        fontSize: 20,
        width: 22,
        textAlign: 'center',
    },
    searchInput: {
        flex: 1,
        fontSize: 17,
        fontWeight: '500',
        paddingVertical: 0,
    } as any,
    escBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: 'rgba(107,100,128,0.20)',
    },
    escText: {
        fontSize: 11,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    commandList: {
        maxHeight: 380,
        paddingVertical: 8,
    },
    sectionHeader: {
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 1,
        paddingHorizontal: 20,
        paddingTop: 14,
        paddingBottom: 4,
    },
    commandItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 12,
        gap: 12,
        position: 'relative',
    },
    commandItemActive: {
        borderRadius: 12,
    },
    activeBar: {
        position: 'absolute',
        left: 0,
        top: '20%',
        bottom: '20%',
        width: 3,
        borderRadius: 2,
        backgroundColor: Theme.colors.sanctuarySaffron,
    },
    glyphCircle: {
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    glyph: {
        fontSize: 17,
    },
    labelWrap: {
        flex: 1,
        gap: 1,
    },
    commandLabel: {
        fontSize: 15,
        letterSpacing: 0.1,
    },
    commandSubtitle: {
        fontSize: 12,
        lineHeight: 16,
    },
    shortcutBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 7,
        borderWidth: 1,
    },
    shortcutText: {
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 0.3,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 32,
        gap: 8,
    },
    emptyGlyph: {
        fontSize: 28,
        opacity: 0.5,
    },
    emptyText: {
        fontSize: 14,
        fontStyle: 'italic',
    },
    footer: {
        borderTopWidth: 1,
        paddingHorizontal: 20,
        paddingVertical: 10,
        alignItems: 'center',
    },
    footerHint: {
        fontSize: 11,
        letterSpacing: 0.3,
        fontWeight: '500',
    },
});
