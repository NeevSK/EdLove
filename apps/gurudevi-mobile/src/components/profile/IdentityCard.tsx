import React, { useState, useMemo } from 'react';
import { StyleSheet, Dimensions, Image as RNImage } from 'react-native';
import {
    Box,
    VStack,
    HStack,
    Text,
    Pressable,
    Center,
    Theme,
    useThemedColors,
    hapticLight,
    hapticSuccess
} from '@repo/ui';
import { useTranslation } from 'react-i18next';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    interpolate,
} from 'react-native-reanimated';
import { User, GraduationCap, Briefcase, Crown, ShieldAlert, Compass } from 'lucide-react-native';
import { QRCodeGenerator } from '@repo/scanner-kit';
import { UserProfile } from '@repo/profile';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_WIDTH = SCREEN_WIDTH - Theme.spacing.xl * 2;
const CARD_HEIGHT = 220;

interface IdentityCardProps {
    profile: UserProfile | null;
    onEdit?: () => void;
    onViewFullProfile?: () => void;
    style?: any;
}

export default function IdentityCard({ profile, onEdit, onViewFullProfile, style }: IdentityCardProps) {
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

    // Role-specific badge logic
    const roleConfig = useMemo(() => {
        const role = profile?.role || 'guest';
        switch (role) {
            case 'teacher':
                return { label: 'Teacher 🌱', icon: Briefcase, color: colors.action };
            case 'student':
                return { label: 'Student 📚', icon: GraduationCap, color: colors.success };
            case 'principal':
                return { label: 'Principal 🏛️', icon: Crown, color: colors.warning };
            case 'founder':
                return { label: 'Founder 🌸', icon: Compass, color: colors.warning };
            case 'admin':
            case 'developer':
                return { label: 'Guardian 🛡️', icon: ShieldAlert, color: colors.action };
            default:
                return { label: 'Explorer 🌿', icon: User, color: colors.textTertiary };
        }
    }, [profile?.role, profile?.level, colors]);

    // Dynamic Profile Completion Calculator
    const completionPercentage = useMemo(() => {
        if (!profile) return 0;
        const fields = [
            'full_name',
            'phone',
            'bio',
            'avatar_url',
            profile.role === 'student' ? 'index_number' : 'nic_number'
        ];
        const filledFields = fields.filter(f => !!profile[f]);
        return Math.round((filledFields.length / fields.length) * 100);
    }, [profile]);

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
            <Box style={[{
                width: CARD_WIDTH,
                height: CARD_HEIGHT,
                shadowColor: colors.glow,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.6,
                shadowRadius: 20,
                elevation: 10,
            }, style]}>
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
                                        <roleConfig.icon
                                            size={40}
                                            color={colors.action}
                                        />
                                    </Center>
                                )}
                            </Box>
                            <Box style={styles.completionBadge}>
                                <Text color={colors.primary as any} size="xs" bold>
                                    {completionPercentage}%
                                </Text>
                            </Box>
                        </Box>

                        {/* Details */}
                        <VStack space="xs" flex={1}>
                            <HStack alignItems="center" space="xs">
                                <Text color={colors.textSecondary as any} size="xs" bold textTransform="uppercase">
                                    {roleConfig.label}
                                </Text>
                                <roleConfig.icon size={14} color={roleConfig.color} />
                            </HStack>

                            <Text color={colors.text as any} size="xl" bold numberOfLines={1}>
                                {profile?.full_name || 'Guest User'}
                            </Text>

                            <Text color={colors.textTertiary as any} size="xs" numberOfLines={1} mb={2}>
                                {profile?.school_name || t('profile.noSchoolConnected')}
                            </Text>

                            {/* Identification Row */}
                            {(profile?.nic_number || profile?.index_number) && (
                                <Box bg={`${colors.action}10`} px={8} py={2} borderRadius={6} alignSelf="flex-start">
                                    <Text color={colors.action} size="xxs" bold>
                                        {profile?.role === 'student' ? 'INDEX:' : 'NIC:'} {profile?.nic_number || profile?.index_number}
                                    </Text>
                                </Box>
                            )}
                        </VStack>
                    </HStack>

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
                            {profile?.role === 'student' ? (profile?.index_number || 'STU-SCAN') : (profile?.nic_number || 'GURU-SCAN')}
                        </Text>
                        <Text color={colors.textSecondary} size="xs">
                            {t('profile.scanToConnect')}
                        </Text>
                    </Center>
                </Animated.View>
            </Box>
        </Pressable >
    );
}
