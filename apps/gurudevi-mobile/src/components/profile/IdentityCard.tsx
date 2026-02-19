import React, { useState, useMemo } from 'react';
import { StyleSheet, Dimensions, Image as RNImage } from 'react-native';
import {
    Box,
    VStack,
    HStack,
    Text,
    Pressable,
    Center,
} from '@repo/ui';
import { useTranslation } from 'react-i18next';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    interpolate,
    withTiming,
    Easing,
} from 'react-native-reanimated';
import { ShieldCheck, Edit3, Compass, Database } from 'lucide-react-native';
import { QRCodeGenerator } from '@repo/scanner-kit';
import { Theme } from '@repo/ui';
import { useThemedColors } from '@repo/ui';
import { hapticLight, hapticSuccess } from '@repo/ui';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_WIDTH = SCREEN_WIDTH - Theme.spacing.xl * 2;
const CARD_HEIGHT = 220;

interface IdentityCardProps {
    profile: any;
    onEdit?: () => void;
    onViewFullProfile?: () => void;
}

export default function IdentityCard({ profile, onEdit, onViewFullProfile }: IdentityCardProps) {
    const { t } = useTranslation();
    const colors = useThemedColors();
    const isFlipped = useSharedValue(0);
    const [flipState, setFlipState] = useState(false);

    const handleFlip = () => {
        hapticLight();
        setFlipState(!flipState);
        isFlipped.value = withSpring(flipState ? 0 : 1, {
            damping: 15,
            stiffness: 90,
        });
    };

    const frontStyle = useAnimatedStyle(() => {
        const rotateValue = interpolate(isFlipped.value, [0, 1], [0, 180]);
        return {
            transform: [
                { rotateY: `${rotateValue}deg` }
            ],
            opacity: interpolate(isFlipped.value, [0, 0.5, 1], [1, 0, 0]),
            zIndex: isFlipped.value < 0.5 ? 2 : 1, // Ensure front is clickable when visible
        };
    });

    const backStyle = useAnimatedStyle(() => {
        const rotateValue = interpolate(isFlipped.value, [0, 1], [180, 360]);
        return {
            transform: [
                { rotateY: `${rotateValue}deg` }
            ],
            opacity: interpolate(isFlipped.value, [0, 0.5, 1], [0, 0, 1]),
            zIndex: isFlipped.value > 0.5 ? 2 : 1,
        };
    });

    // Role-specific badge text
    const getRoleBadge = () => {
        if (profile?.role === 'founder') return t('profile.stats.visionAlignment');
        if (profile?.role === 'admin' || profile?.role === 'developer') return t('profile.stats.coreActive');
        if (profile?.role === 'student') return `LVL ${profile?.level || 3}`;
        return '70%'; // Default
    };

    const styles = useMemo(() => StyleSheet.create({
        // ... (rest of styles omitted for brevity, keeping same)
        cardCommon: {
            position: 'absolute',
            width: '100%',
            height: '100%',
            borderRadius: Theme.corners.generous,
            overflow: 'hidden',
            backgroundColor: colors.secondary,
            borderWidth: 1,
            borderColor: colors.border,
            backfaceVisibility: 'hidden',
            ...Theme.shadows.md,
        },
        cardBack: {
            backgroundColor: colors.tertiary,
        },
        glassLayer: {
            ...StyleSheet.absoluteFillObject,
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
        },
        progressRing: {
            position: 'absolute',
            top: -4,
            left: -4,
            width: 88,
            height: 88,
            borderRadius: 44,
            borderWidth: 2,
            borderColor: colors.action,
            opacity: 0.6,
            borderStyle: 'dashed',
        },
        avatarContainer: {
            width: 80,
            height: 80,
            borderRadius: 40,
            overflow: 'hidden',
            borderWidth: 2,
            borderColor: colors.primary,
        },
        avatarImage: {
            width: '100%',
            height: '100%',
        },
        avatarPlaceholder: {
            width: '100%',
            height: '100%',
            backgroundColor: `${colors.action}15`,
        },
        completionBadge: {
            position: 'absolute',
            bottom: -6,
            alignSelf: 'center',
            backgroundColor: colors.action,
            paddingHorizontal: 6,
            paddingVertical: 2,
            borderRadius: 10,
        },
        editButton: {
            backgroundColor: `${colors.action}10`,
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 20,
            alignSelf: 'flex-start',
        },
        watermark: {
            position: 'absolute',
            bottom: -20,
            right: -20,
            width: 140,
            height: 140,
            opacity: 0.1,
        }
    }), [colors]);

    return (
        <Pressable onPress={handleFlip}>
            <Box style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}>
                {/* FRONT SIDE - IDENTITY */}
                <Animated.View style={[styles.cardCommon, frontStyle]}>
                    <Box style={styles.glassLayer} />

                    <HStack space="lg" alignItems="center" h="100%" p={Theme.spacing.xl}>
                        {/* Avatar with Ring */}
                        <Box>
                            <Box style={styles.progressRing} />
                            <Box style={styles.avatarContainer}>
                                {profile?.avatar_url ? (
                                    <RNImage
                                        source={{ uri: profile.avatar_url }}
                                        style={styles.avatarImage}
                                    />
                                ) : (
                                    <Center style={styles.avatarPlaceholder}>
                                        <Text
                                            color={colors.action as any}
                                            size="3xl"
                                            bold
                                        >
                                            {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : 'G'}
                                        </Text>
                                    </Center>
                                )}
                            </Box>
                            <Box style={styles.completionBadge}>
                                <Text color={colors.primary as any} size="xs" bold>
                                    {getRoleBadge()}
                                </Text>
                            </Box>
                        </Box>

                        {/* Details */}
                        <VStack space="xs" flex={1}>
                            <HStack alignItems="center" space="xs">
                                <Text color={colors.textSecondary as any} size="xs" bold textTransform="uppercase">
                                    {profile?.role === 'teacher' && 'Teacher 🌱'}
                                    {profile?.role === 'student' && 'Student 📚'}
                                    {profile?.role === 'principal' && 'Principal 🏛️'}
                                    {profile?.role === 'founder' && 'Founder 🌸'}
                                    {(profile?.role === 'admin' || profile?.role === 'developer') && 'Guardian 🛡️'}
                                    {!profile?.role && (t('profile.guestUser') || 'Guest Explorer 🌿')}
                                </Text>
                                {profile?.role === 'founder' && <Compass size={14} color={colors.warning} />}
                                {(profile?.role === 'admin' || profile?.role === 'developer') && <Database size={14} color={colors.action} />}
                                {profile?.school_name && !['founder', 'admin', 'developer'].includes(profile?.role) && (
                                    <ShieldCheck size={14} color={colors.success} />
                                )}
                            </HStack>

                            <Text color={colors.text as any} size="xl" bold numberOfLines={2}>
                                {profile?.full_name || 'Guest User'}
                            </Text>

                            <Text color={colors.textTertiary as any} size="sm" numberOfLines={1}>
                                {profile?.school_name || t('profile.noSchoolConnected')}
                            </Text>

                            {/* Edit Button (Stops Propagation to open modal instead of flip) */}
                            <Pressable
                                onPress={(e: any) => {
                                    e.stopPropagation();
                                    onEdit?.();
                                }}
                                style={{
                                    marginTop: 8,
                                    // Increase touch target
                                    padding: 8,
                                    margin: -8,
                                    zIndex: 10
                                }}
                            >
                                <HStack
                                    space="xs"
                                    alignItems="center"
                                    style={styles.editButton}
                                >
                                    <Edit3 size={12} color={colors.action} />
                                    <Text color={colors.action} size="xs" bold>
                                        {(t('common.edit') || 'Edit').toUpperCase()} {t('profile.title').toUpperCase()}
                                    </Text>
                                </HStack>
                            </Pressable>
                        </VStack>
                    </HStack>

                    {/* Expand Button (Top Right) - Only show if onViewFullProfile prop is provided */}
                    {onViewFullProfile && (
                        <Pressable
                            onPress={(e: any) => {
                                e.stopPropagation();
                                onViewFullProfile();
                            }}
                            style={{
                                position: 'absolute',
                                top: 10,
                                right: 10,
                                padding: 8,
                                zIndex: 10
                            }}
                        >
                            <Text color={colors.textTertiary} size="xs" bold>
                                {t('common.fullView') || 'FULL VIEW'} ↗
                            </Text>
                        </Pressable>
                    )}

                    {/* Decorative Elements */}
                    <RNImage
                        source={require('../../assets/images/lotus_bloom.png')}
                        style={styles.watermark}
                        resizeMode="contain"
                    />
                </Animated.View>

                {/* BACK SIDE - QR CODE */}
                <Animated.View style={[styles.cardCommon, styles.cardBack, backStyle]}>
                    <Box style={styles.glassLayer} />
                    <Center h="100%">
                        <Box p={Theme.spacing.md} bg="white" borderRadius={Theme.corners.comfortable}>
                            <QRCodeGenerator
                                value={profile?.id || 'gurudevi-guest'}
                                size={120}
                            />
                        </Box>
                        <Text color={colors.text} mt={Theme.spacing.md} bold>
                            {t('profile.scanToConnect')}
                        </Text>
                    </Center>
                </Animated.View>
            </Box>
        </Pressable >
    );
}
