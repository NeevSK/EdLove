import React, { useState, useMemo } from 'react';
import { StyleSheet, Dimensions, Image as RNImage } from 'react-native';
import {
    Box,
    VStack,
    HStack,
    Text,
    Pressable,
    Center,
} from '../gluestack';
import { Theme } from '../theme/Theme';
import { useThemedColors } from '../hooks/useThemedColors';
import { hapticLight } from '../utils/haptics';
import { UserAvatar } from './UserAvatar';
import { useTranslation } from 'react-i18next';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    interpolate,
} from 'react-native-reanimated';
import { User, GraduationCap, Briefcase, Crown, ShieldAlert } from 'lucide-react-native';
import { QRCodeGenerator, QRBuilder } from '../qr'; 
import { usePermissions } from '@repo/core';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_WIDTH = SCREEN_WIDTH - Theme.spacing.xl * 2;
const CARD_HEIGHT = 220;

/**
 * IdentityData \u2014 Generic interface for person/entity display in the IdentityCard.
 * This allows @repo/ui to remain domain-agnostic.
 */
export interface IdentityData {
    id: string;
    full_name: string;
    username?: string;
    role: string;
    avatar_url?: string;
    school_name?: string;
    nic_number?: string;
    index_number?: string;
}

interface IdentityCardProps {
    data: IdentityData;
    onEdit?: () => void;
    onViewFullProfile?: () => void;
    style?: import('react-native').StyleProp<import('react-native').ViewStyle>;
    /** Optional custom renderer for the back of the card. If not provided, it defaults to a QR code of the user invite. */
    renderBackSide?: () => React.ReactNode;
    /** Whether to allow flipping the card. Defaults to true if renderBackSide or QR logic is applicable. */
    allowFlip?: boolean;
    /** Optional permissions override. If not provided, uses the internal usePermissions hook. */
    canOverride?: (action: string, subject: string) => boolean;
}

export default function IdentityCard({ 
    data, 
    onEdit, 
    onViewFullProfile, 
    style,
    renderBackSide,
    allowFlip = true,
    canOverride
}: IdentityCardProps) {
    const { t } = useTranslation();
    const colors = useThemedColors();
    const isFlipped = useSharedValue(0);
    const [flipState, setFlipState] = useState(false);

    const handleFlip = () => {
        if (!allowFlip) return;
        hapticLight();
        setFlipState(!flipState);
        isFlipped.value = withSpring(flipState ? 0 : 1, {
            damping: 15,
            stiffness: 90,
        });
        
        // Suppress unused warnings for now as these are planned API slots
        if (onEdit) onEdit();
        if (onViewFullProfile) onViewFullProfile();
    };

    const frontStyle = useAnimatedStyle(() => {
        const rotateValue = interpolate(isFlipped.value, [0, 1], [0, 180]);
        return {
            transform: [
                { rotateY: `${rotateValue}deg` }
            ],
            opacity: interpolate(isFlipped.value, [0, 0.5, 1], [1, 0, 0]),
            zIndex: isFlipped.value < 0.5 ? 2 : 1,
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

    // Use internal hook if no override provided. 
    // This maintains backward compatibility while allowing decoupling.
    const { can: internalCan } = usePermissions();
    const can = canOverride || internalCan;

    const roleContext = useMemo(() => {
        if (can('manage', 'PrincipalDashboard')) {
            return { label: t('roles.principal') || 'Principal \uD83C\uDFDB\uFE0F', icon: Crown, color: colors.warning, emoji: '\uD83C\uDFDB\uFE0F' };
        }
        if (can('manage', 'TeacherDashboard')) {
            return { label: t('roles.teacher') || 'Teacher \uD83C\uDF31', icon: Briefcase, color: colors.action, emoji: '\uD83C\uDF31' };
        }
        if (can('manage', 'StudentDashboard')) {
            return { label: t('roles.student') || 'Student \uD83D\uDCDA', icon: GraduationCap, color: colors.success, emoji: '\uD83D\uDCDA' };
        }
        if (can('manage', 'FounderDashboard')) {
            return { label: 'Guardian \uD83D\uDEE1\uFE0F', icon: ShieldAlert, color: colors.action, emoji: '\uD83D\uDEE1\uFE0F' };
        }
        return { label: 'Explorer \uD83C\uDF3F', icon: User, color: colors.textTertiary, emoji: '\uD83C\uDF3F' };
    }, [can, t, colors]);

    const styles = useMemo(() => StyleSheet.create({
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
            backgroundColor: Theme.colors.glass.dark.highlight,
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

    const defaultBackSide = () => (
        <Center h="100%"            <Box sx={{ p: Theme.spacing.md, bg: "white", borderRadius: Theme.corners.comfortable }}                <QRCodeGenerator>
                    value={
                        data.id
                            ? QRBuilder.userInvite(data.id, data.role || 'unknown', data.username || undefined)
                            : 'gurudevi-guest'
                    }
                    size={120}
                /            ></Box            <Text color={colors.text} mt={Theme.spacing.md} bold                INVITE
            </Text            <Text color={colors.textSecondary} size="xs"                {t('profile.scanToConnect')}
            </Text        </Center    );

    return (
        <Pressable>
            onPress={handleFlip}
            disabled={!allowFlip}
            accessibilityRole="button"
            accessibilityLabel={t('profile.flipCard')}
            accessibilityHint={t('profile.flipCardHint')}>
                    <Box style={[{
                width: CARD_WIDTH,
                height: CARD_HEIGHT,
                shadowColor: colors.glow,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.6,
                shadowRadius: 20,
                elevation: 10,
            }, style]}                {/* FRONT SIDE - IDENTITY */}>
                <Animated.View style={[styles.cardCommon, frontStyle]}                    <Box style={styles.glassLayer} /
                    ><HStack space="lg" alignItems="center" h="100%" sx={{ p: Theme.spacing.xl }}                        <UserAvatar 
                            avatarUrl={data.avatar_url}
                            fullName={data.full_name}
                            fallbackEmoji={roleContext.emoji}
                            size={80}
                        />
                        >{/* Details */}
                        <VStack space="xs" flex={1}                            <HStack alignItems="center" space="xs"                                <Text color={colors.textSecondary as string} size="xs" bold textTransform="uppercase"                                    {roleContext.label}>
                                </Text                                ><roleContext.icon size={14} color={roleContext.color} /                            ></HStack>
                            <Text color={colors.text} size="xl" bold numberOfLines={1}                                {data.full_name || 'Guest User'}>
                            </Text>
                            <Text color={colors.textSecondary} size="xs" numberOfLines={1} mb={2}                                {data.school_name || t('profile.noSchoolConnected')}>
                            </Text>
                            {/* Identification Row */}
                            {(data.nic_number || data.index_number) && (
                                <Box sx={{ bg: `${colors.action}10`, px: Theme.spacing.sm, py: Theme.spacing.xs, borderRadius: Theme.corners.tight, alignSelf: "flex-start" }}                                    <Text color={colors.action} size="xxs" bold                                        {can('manage', 'StudentDashboard') ? 'INDEX:' : 'NIC:'} {data.nic_number || data.index_number}>
                                    </Text                                </Box                            )}>
                        </VStack                    </HStack
                    <RNImage
                        // eslint-disable-next-line @typescript-eslint/no-require-imports
                        source={require('../../assets/images/lotus_bloom.png')}
                        style={styles.watermark}
                        resizeMode="contain"
                        accessibilityIgnoresInvertColors={true}
                    /                </Animated.View>
                {/* BACK SIDE - CUSTOM OR QR CODE */}
                {allowFlip && (
                    <Animated.View style={[styles.cardCommon, styles.cardBack, backStyle]}                        <Box style={styles.glassLayer} /                        >{renderBackSide ? renderBackSide() : defaultBackSide()}
                    </Animated.View                )}>
            </Box        </Pressable     );
}
