import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Theme } from '../theme/Theme';
import { getInitialsFromName } from '../utils/stringUtils';

export interface UserAvatarProps {
    avatarUrl?: string | null;
    fullName?: string | null;
    /** Fallback emoji when name/photo is absent */
    fallbackEmoji?: string | null;
    size?: number;
    /** Corner radius. Defaults to circular (size/2). Pass a fixed value for squircle style. */
    borderRadius?: number;
    style?: object;
    authority?: string | null;
}

const DEFAULT_ICON = '\uD83C\uDF3F';

/** Deterministic background colour from user's name using theme palette */
const AVATAR_COLORS = [
    Theme.colors.gurudeviBlue,
    Theme.colors.gurudeviViolet,
    Theme.colors.sanctuarySaffron,
    Theme.colors.sageGreen,
];

const FALLBACK_COLOR = Theme.colors.gurudeviBlue;

function getAvatarColor(name?: string | null): string {
    if (!name) return FALLBACK_COLOR;
    return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length] ?? FALLBACK_COLOR;
}

/**
 * UserAvatar \u2014 display-only avatar component.
 * Fallback hierarchy: profile photo \u2192 initials \u2192 authority emoji \u2192 default emoji.
 * Lives in @repo/ui to be safely consumed by GlobalHeader without circular deps.
 */
export const UserAvatar: React.FC<UserAvatarProps> = ({
    avatarUrl,
    fullName,
    fallbackEmoji,
    size = 40,
    borderRadius,
    style,
    authority,
}) => {
    const radius = borderRadius ?? size / 2;
    const bgColor = getAvatarColor(fullName);
    const initials = getInitialsFromName(fullName);
    const finalFallback = fallbackEmoji || DEFAULT_ICON;

    if (avatarUrl) {
        return (
            <Image
                source={{ uri: avatarUrl }}
                accessible={true}
                accessibilityLabel={fullName ? `Avatar of ${fullName}` : 'User avatar'}
                accessibilityRole="image"
                style={[
                    styles.base,
                    { width: size, height: size, borderRadius: radius },
                    style as any,
                ]}
                resizeMode="cover"
            /
        );
    }

    return (
        <View
            accessible={true}
            accessibilityLabel={fullName ? `Avatar of ${fullName}` : 'User avatar'}
            accessibilityRole="image"
            style={[
                styles.base,
                { width: size, height: size, borderRadius: radius, backgroundColor: bgColor },
                style as any,
            ]}
        
            <Text style={[styles.label, { fontSize: size * 0.35 }]}
                {initials || finalFallback}
            </Text
        </View
    );
};

const styles = StyleSheet.create({
    base: {
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    label: {
        color: Theme.colors.sacredWhite,
        fontWeight: '700',
        includeFontPadding: false,
    },
});
