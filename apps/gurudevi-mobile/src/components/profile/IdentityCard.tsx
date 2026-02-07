import React, { useState } from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import {
    Box,
    VStack,
    HStack,
    Text,
    Image,
    Pressable,
    Center,
} from '@gluestack-ui/themed';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    interpolate,
    withTiming,
    Easing,
} from 'react-native-reanimated';
import { ShieldCheck, Edit3 } from 'lucide-react-native';
import QRCodeGenerator from '../shared/QRCodeGenerator';
import { Theme } from '../../constants/Theme';
import { hapticLight, hapticSuccess } from '../../utils/haptics';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_WIDTH = SCREEN_WIDTH - Theme.spacing.xl * 2;
const CARD_HEIGHT = 220;

interface IdentityCardProps {
    profile: any;
    onEdit?: () => void;
    onExpand?: () => void;
}

export default function IdentityCard({ profile, onEdit, onExpand }: IdentityCardProps) {
    const isFlipped = useSharedValue(0); // 0 = front, 1 = back
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

    // Avatar Placeholder (Letter)
    const getInitials = (name: string) => {
        if (!name) return 'G';
        return name.charAt(0).toUpperCase();
    };

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
                                    <Image
                                        source={{ uri: profile.avatar_url }}
                                        alt="Avatar"
                                        style={styles.avatarImage}
                                    />
                                ) : (
                                    <Center style={styles.avatarPlaceholder}>
                                        <Text
                                            color={Theme.colors.sanctuarySaffron}
                                            size="3xl"
                                            bold
                                        >
                                            {getInitials(profile?.full_name)}
                                        </Text>
                                    </Center>
                                )}
                            </Box>
                            <Box style={styles.completionBadge}>
                                <Text color={Theme.colors.midnightBlue} size="xs" bold>
                                    70%
                                </Text>
                            </Box>
                        </Box>

                        {/* Details */}
                        <VStack space="xs" flex={1}>
                            <HStack alignItems="center" space="xs">
                                <Text color={Theme.colors.mistGray} size="xs" bold textTransform="uppercase">
                                    {profile?.role || 'Guest'}
                                </Text>
                                {profile?.school_name && (
                                    <ShieldCheck size={14} color={Theme.colors.sageGreen} />
                                )}
                            </HStack>

                            <Text color={Theme.colors.sacredWhite} size="xl" bold numberOfLines={2}>
                                {profile?.full_name || 'Guest User'}
                            </Text>

                            <Text color={Theme.colors.dimGray} size="sm" numberOfLines={1}>
                                {profile?.school_name || 'No school connected'}
                            </Text>

                            {/* Edit Button (Stops Propagation to open modal instead of flip) */}
                            <Pressable
                                onPress={(e) => {
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
                                    <Edit3 size={12} color={Theme.colors.sanctuarySaffron} />
                                    <Text color={Theme.colors.sanctuarySaffron} size="xs" bold>
                                        EDIT PROFILE
                                    </Text>
                                </HStack>
                            </Pressable>
                        </VStack>
                    </HStack>

                    {/* Expand Button (Top Right) - Only show if onExpand prop is provided */}
                    {onExpand && (
                        <Pressable
                            onPress={(e) => {
                                e.stopPropagation();
                                onExpand();
                            }}
                            style={{
                                position: 'absolute',
                                top: 10,
                                right: 10,
                                padding: 8,
                                zIndex: 10
                            }}
                        >
                            <Text color={Theme.colors.mistGray} size="xs" bold>
                                EXPAND ↗
                            </Text>
                        </Pressable>
                    )}

                    {/* Decorative Elements */}
                    <Image
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
                        <Text color={Theme.colors.sacredWhite} mt={Theme.spacing.md} bold>
                            Scan to Connect
                        </Text>
                    </Center>
                </Animated.View>
            </Box>
        </Pressable >
    );
}

const styles = StyleSheet.create({
    cardCommon: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        borderRadius: Theme.corners.generous,
        overflow: 'hidden',
        backgroundColor: Theme.colors.midnightBlue, // Fallback
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        backfaceVisibility: 'hidden',
        ...Theme.shadows.md,
    },
    cardBack: {
        backgroundColor: Theme.colors.deepIndigo,
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
        borderColor: Theme.colors.sanctuarySaffron,
        opacity: 0.6,
        borderStyle: 'dashed',
    },
    avatarContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: Theme.colors.voidIndigo,
    },
    avatarImage: {
        width: '100%',
        height: '100%',
    },
    avatarPlaceholder: {
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(230, 126, 34, 0.15)', // Saffron tint
    },
    completionBadge: {
        position: 'absolute',
        bottom: -6,
        alignSelf: 'center',
        backgroundColor: Theme.colors.sanctuarySaffron,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 10,
    },
    editButton: {
        backgroundColor: 'rgba(230, 126, 34, 0.1)',
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
});
