/**
 * PWAInstallBanner — Web-exclusive component
 *
 * Shows an on-brand "Install Gurudevi" banner at the bottom of the screen when
 * the browser's PWA install criteria are met.  Tapping "Install" triggers the
 * native browser install dialog; tapping "Maybe later" dismisses for 30 days.
 *
 * On iOS/iPadOS (where the beforeinstallprompt event is never fired) a short
 * manual instruction ("Tap Share → Add to Home Screen") is shown instead.
 *
 * Only renders on web (Platform.OS guard + hook internals).
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import Animated, { SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { Icon, useTheme, useThemedColors, sanctuarySaffron, shadowViolet } from '@repo/ui';
import { usePWAInstallPrompt } from '@/utils/usePWAInstallPrompt';
import { Download, X, Share } from 'lucide-react-native';

export function PWAInstallBanner() {
    const { canInstall, promptInstall, isDismissed, dismiss, isIOS, isInstalled } = usePWAInstallPrompt();
    // All hooks must be called unconditionally — early returns come AFTER all hook calls
    const { scene, text } = useTheme();

    // Never render on native, when already installed, or after user dismissed
    if (Platform.OS !== 'web') return null;
    if (isInstalled) return null;
    if (isDismissed) return null;
    if (!canInstall && !isIOS) return null;

    return (
        <Animated.View
            entering={SlideInDown.springify().damping(18)}
            exiting={SlideOutDown.duration(220)}
            style={[styles.banner, { backgroundColor: scene.surface.bg, borderTopColor: scene.surface.border }]}>
            <View style={styles.left}>
                {isIOS ? (
                    <Icon as={Share} size={20} color={sanctuarySaffron} />
                ) : (
                    <Icon as={Download} size={20} color={sanctuarySaffron} />
                )}
                <View style={styles.textBlock}>
                    <Text style={[styles.title, { color: text.primary }]}>
                        {isIOS ? 'Add to Home Screen' : 'Install Gurudevi'}
                    </Text>
                    <Text style={[styles.sub, { color: text.secondary }]}>
                        {isIOS
                            ? 'Tap the Share icon, then "Add to Home Screen"'
                            : 'Your Sanctuary, one tap away'}
                    </Text>
                </View>
            </View>

            <View style={styles.actions}>
                {!isIOS && (
                    <TouchableOpacity
                        onPress={async () => {
                            try {
                                await promptInstall();
                            } catch {
                                // User cancelled or browser rejected — dismiss the banner quietly
                                dismiss();
                            }
                        }}
                        style={[styles.installBtn, { backgroundColor: sanctuarySaffron }]}
                        accessibilityLabel="Install Gurudevi as an app">
                        <Text style={styles.installBtnText}>Install</Text>
                    </TouchableOpacity>
                )}
                <TouchableOpacity
                    onPress={dismiss}
                    style={styles.dismissBtn}
                    accessibilityLabel="Dismiss install prompt">
                    <Icon as={X} size={18} color={text.secondary} />
                </TouchableOpacity>
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    banner: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderTopWidth: 1,
        // boxShadow: `0 -4px 12px ${shadowViolet}1F`, 
        zIndex: 999},
    left: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 12},
    textBlock: {
        flexDirection: 'column',
        flex: 1},
    title: {
        fontSize: 14,
        fontWeight: '700'},
    sub: {
        fontSize: 12,
        marginTop: 2},
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12},
    installBtn: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12},
    installBtnText: {
        color: '#2A2318',
        fontSize: 13,
        fontWeight: '700'},
    dismissBtn: {
        padding: 6}});
