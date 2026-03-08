import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Theme } from '../theme/Theme';

export interface UserAvatarProps {
    avatarUrl?: string | null;
    fullName?: string | null;
    /** User role string — drives the fallback emoji when name is also absent */
    role?: string | null;
    size?: number;
    /** Corner radius. Defaults to circular (size/2). Pass a fixed value for squircle style. */
    borderRadius?: number;
    style?: object;
}

/** Role → fallback emoji mapping (no external dependency) */
const ROLE_ICONS: Record<string, string> = {
    teacher: '🌱',
    student: '📚',
    principal: '🏛️',
    founder: '🌸',
    admin: '🛡️',
    developer: '🛡️',
};
const DEFAULT_ICON = '🌿';

/** Deterministic background colour from user's name using theme palette */
const AVATAR_COLORS = [
    Theme.colors.gurudeviBlue,
    Theme.colors.gurudeviViolet,
    Theme.colors.sanctuarySaffron,
    Theme.colors.sageGreen,
];

function getInitials(name?: string | null): string {
    if (!name) return '';
    return name
        .split(' ')
        .filter(Boolean)
        .map((w) => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
}

const FALLBACK_COLOR = Theme.colors.gurudeviBlue;

function getAvatarColor(name?: string | null): string {
    if (!name) return FALLBACK_COLOR;
    return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length] ?? FALLBACK_COLOR;
}

/**
 * UserAvatar — display-only avatar component.
 * Fallback hierarchy: profile photo → initials → role emoji → default emoji.
 * Lives in @repo/ui to be safely consumed by GlobalHeader without circular deps.
 */
export const UserAvatar: React.FC<UserAvatarProps> = ({
    avatarUrl,
    fullName,
    role,
    size = 40,
    borderRadius,
    style,
}) => {
    const radius = borderRadius ?? size / 2;
    const bgColor = getAvatarColor(fullName);
    const initials = getInitials(fullName);
    const fallbackIcon = role ? (ROLE_ICONS[role] ?? DEFAULT_ICON) : DEFAULT_ICON;

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
            />
        );
    }

    return (
        <View
            accessible={true}
            accessibilityLabel={fullName ? `Avatar of ${fullName}` : (role ? `Avatar for ${role} role` : 'User avatar')}
            accessibilityRole="image"
            style={[
                styles.base,
                { width: size, height: size, borderRadius: radius, backgroundColor: bgColor },
                style as any,
            ]}
        >
            <Text style={[styles.label, { fontSize: size * 0.35 }]}>
                {initials || fallbackIcon}
            </Text>
        </View>
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
