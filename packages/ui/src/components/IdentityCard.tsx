import { usePermissions } from '@repo/core/logic';
import { Briefcase, Crown, GraduationCap, ShieldAlert, User } from 'lucide-react-native';
import type React from 'react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dimensions, Image as RNImage, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Box, Center, HStack, Pressable, Text, VStack } from '../gluestack';
import { QRBuilder, QRCodeGenerator } from '../qr';
import { hapticLight } from '../utils/haptics';
import { UserAvatar } from './UserAvatar';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_WIDTH = SCREEN_WIDTH - 48; // Standardized spacing
const CARD_HEIGHT = 220;

/**
 * IdentityData — Generic interface for person/entity display in the IdentityCard.
 */
export interface IdentityData {
  id: string;
  display_name?: string;
  username?: string;
  capacity: string;
  avatar_url?: string;
  school_name?: string;
  nic_number?: string;
  index_number?: string;
}

interface IdentityCardProps {
  data: IdentityData;
  onEdit?: () => void;
  onViewFullProfile?: () => void;
  style?: StyleProp<ViewStyle>;
  /** Optional custom renderer for the back of the card. */
  renderBackSide?: () => React.ReactNode;
  /** Whether to allow flipping the card. Defaults to true. */
  allowFlip?: boolean;
  /** Optional permissions override. */
  canOverride?: (action: string, subject: string) => boolean;
}

/**
 * IdentityCard - Flagship component for identity visualization.
 * Hardened v3 implementation.
 */
export default function IdentityCard({
  data,
  onEdit,
  onViewFullProfile,
  style,
  renderBackSide,
  allowFlip = true,
  canOverride,
}: IdentityCardProps) {
  const { t } = useTranslation();
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

    if (onEdit) onEdit();
    if (onViewFullProfile) onViewFullProfile();
  };

  const frontStyle = useAnimatedStyle(() => {
    const rotateValue = interpolate(isFlipped.value, [0, 1], [0, 180]);
    return {
      transform: [{ rotateY: `${rotateValue}deg` }],
      opacity: interpolate(isFlipped.value, [0, 0.5, 1], [1, 0, 0]),
      zIndex: isFlipped.value < 0.5 ? 2 : 1,
    };
  });

  const backStyle = useAnimatedStyle(() => {
    const rotateValue = interpolate(isFlipped.value, [0, 1], [180, 360]);
    return {
      transform: [{ rotateY: `${rotateValue}deg` }],
      opacity: interpolate(isFlipped.value, [0, 0.5, 1], [0, 0, 1]),
      zIndex: isFlipped.value > 0.5 ? 2 : 1,
    };
  });

  const { can: internalCan } = usePermissions();
  const can = canOverride || internalCan;

  const roleContext = useMemo(() => {
    if (can('manage', 'PrincipalDashboard')) {
      return {
        label: t('roles.principal') || 'Principal 🏛️',
        icon: Crown,
        colorClass: 'text-phase-accent',
        emoji: '🏛️',
      };
    }
    if (can('manage', 'TeacherDashboard')) {
      return {
        label: t('roles.teacher') || 'Teacher 🌱',
        icon: Briefcase,
        colorClass: 'text-phase-accent',
        emoji: '🌱',
      };
    }
    if (can('manage', 'StudentDashboard')) {
      return {
        label: t('roles.student') || 'Student 📚',
        icon: GraduationCap,
        colorClass: 'text-phase-accent',
        emoji: '📚',
      };
    }
    if (can('manage', 'FounderDashboard')) {
      return {
        label: 'Holden 🛡️',
        icon: ShieldAlert,
        colorClass: 'text-phase-accent',
        emoji: '🛡️',
      };
    }
    return {
      label: 'Explorer 🌿',
      icon: User,
      colorClass: 'text-phase-text-secondary',
      emoji: '🌿',
    };
  }, [can, t]);

  const defaultBackSide = () => (
    <Center className="h-full">
      <Box className="p-4 bg-white rounded-xl">
        <QRCodeGenerator
          value={
            data.id
              ? QRBuilder.userInvite(data.id, data.capacity || 'member', data.username || undefined)
              : 'anonymous-user'
          }
          size={120}
        />
      </Box>
      <Text className="mt-4 font-bold text-phase-text-primary uppercase tracking-widest">
        INVITE
      </Text>
      <Text className="text-xs text-phase-text-secondary">{t('profile.scanToConnect')}</Text>
    </Center>
  );

  return (
    <Pressable
      onPress={handleFlip}
      disabled={!allowFlip}
      accessibilityRole="button"
      className="shadow-xl"
    >
      <Box
        style={[
          {
            width: CARD_WIDTH,
            height: CARD_HEIGHT,
          },
          style,
        ]}
      >
        {/* FRONT SIDE - IDENTITY */}
        <Animated.View
          style={frontStyle}
          className="absolute inset-0 overflow-hidden bg-phase-surface border border-phase-surface rounded-[32px] backface-hidden"
        >
          <Box className="absolute inset-0 bg-black/5" />
          <HStack className="items-center h-full p-6 gap-4">
            <UserAvatar
              avatarUrl={data.avatar_url}
              fullName={data.display_name || 'Anonymous User'}
              fallbackEmoji={roleContext.emoji}
              size={80}
            />
            {/* Details */}
            <VStack className="flex-1 gap-1">
              <HStack className="items-center gap-1">
                <Text className="text-[10px] font-bold uppercase text-phase-text-secondary tracking-widest">
                  {roleContext.label}
                </Text>
                <roleContext.icon size={14} className={roleContext.colorClass} />
              </HStack>
              <Text className="text-xl font-bold text-phase-text-primary" numberOfLines={1}>
                {data.display_name || 'Anonymous User'}
              </Text>
              <Text className="text-xs text-phase-text-secondary" numberOfLines={1}>
                {data.school_name || t('profile.noSchoolConnected')}
              </Text>
              {/* Identification Row */}
              {(data.nic_number || data.index_number) && (
                <Box className="self-start px-2 py-1 rounded-md bg-phase-accent/10 mt-2">
                  <Text className="text-[10px] font-bold text-phase-accent">
                    {can('manage', 'StudentDashboard') ? 'INDEX:' : 'NIC:'}{' '}
                    {data.nic_number || data.index_number}
                  </Text>
                </Box>
              )}
            </VStack>
          </HStack>
          <RNImage
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            source={require('../../assets/images/lotus_bloom.png')}
            style={{
              position: 'absolute',
              bottom: -20,
              right: -20,
              width: 140,
              height: 140,
              opacity: 0.1,
            }}
            resizeMode="contain"
          />
        </Animated.View>
        {/* BACK SIDE - CUSTOM OR QR CODE */}
        {allowFlip && (
          <Animated.View
            style={backStyle}
            className="absolute inset-0 overflow-hidden bg-phase-canvas border border-phase-surface rounded-[32px] backface-hidden"
          >
            <Box className="absolute inset-0 bg-black/10" />
            {renderBackSide ? renderBackSide() : defaultBackSide()}
          </Animated.View>
        )}
      </Box>
    </Pressable>
  );
}
