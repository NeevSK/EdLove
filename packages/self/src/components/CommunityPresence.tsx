/**
 * COMMUNITY PRESENCE
 * Real-time visualization of the sanctuary's collective pulse.
 * Standardized to Zero-Legacy: purged sx props and fixed syntax corruption in animations/renders.
 */

import { Globe, Users, WifiOff } from '@repo/ui/icons';
import {
  AnimatedView,
  Box,
  Heading,
  HStack,
  Icon,
  Spinner,
  Text,
  VStack,
} from '@repo/ui/primitives';
import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Easing,
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useCommunityPresence } from '../hooks/useCommunityPresence';

interface CommunityPresenceProps {
  compact?: boolean;
  hidePadding?: boolean;
  userVibe?: string;
  userId: string;
}

export default function CommunityPresence({
  compact = false,
  hidePadding = false,
  userVibe = 'active',
  userId,
}: CommunityPresenceProps) {
  const { t } = useTranslation();
  const dominantVibe = userVibe;
  const { onlineCount, isLoading, isOffline, perspective } = useCommunityPresence({
    userId,
    userVibe,
  });

  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(0.6);

  useEffect(() => {
    pulseScale.value = withRepeat(
      withTiming(1.5, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
    pulseOpacity.value = withRepeat(
      withTiming(0.1, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [pulseScale, pulseOpacity]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: pulseOpacity.value,
  }));

  const vibeColorClass = useMemo(() => {
    if (isOffline) return 'text-mistGray';
    switch (dominantVibe.toLowerCase()) {
      case 'active':
        return 'text-sanctuarySaffron';
      case 'focused':
        return 'text-skyBlue';
      case 'reflecting':
        return 'text-emeraldGreen';
      case 'teaching':
        return 'text-templeGold';
      default:
        return 'text-emeraldGreen';
    }
  }, [isOffline, dominantVibe]);

  const roleLabel = useMemo(() => {
    if (perspective === 'student') return t('community.students') || 'Students';
    if (perspective === 'principal') return t('community.members') || 'Members';
    return t('community.educators') || 'Educators';
  }, [perspective, t]);

  const motivationText = useMemo(() => {
    if (perspective === 'student')
      return t('community.studentMotivation') || 'Flowing together through the learning path.';
    if (perspective === 'principal')
      return t('community.principalMotivation') || 'Unified leadership in the sanctuary.';
    return t('community.teacherMotivation') || 'Vibrant energy shared across the collective.';
  }, [perspective, t]);

  if (isLoading) {
    return (
      <HStack className={`items-center gap-3 ${hidePadding || compact ? '' : 'p-4'} opacity-50`}>
        <Spinner size="small" className="text-sanctuarySaffron" />
        <Text className="text-mistGray text-xs font-bold uppercase tracking-widest">
          Synchronizing Presence...
        </Text>
      </HStack>
    );
  }

  if (compact) {
    return (
      <HStack className="items-center gap-2">
        <Box className={`w-2 h-2 rounded-full ${vibeColorClass.replace('text-', 'bg-')}`} />
        <Text className="text-mistGray text-[10px] font-black uppercase tracking-wider">
          {isOffline ? t('community.offline') || 'Lurking' : `${onlineCount} ${roleLabel}`}
        </Text>
      </HStack>
    );
  }

  return (
    <AnimatedView entering={FadeIn.duration(1000)}>
      <VStack className={`gap-4 ${hidePadding ? '' : 'p-4'}`}>
        <HStack className="items-center gap-4">
          <Box className="relative">
            {isOffline ? (
              <Icon as={WifiOff} className="text-mistGray/30" size={32} />
            ) : (
              <Box className="w-12 h-12 bg-white/5 rounded-2xl items-center justify-center border border-white/10">
                <Icon as={Users} className={vibeColorClass} size={24} />
                <AnimatedView
                  style={pulseStyle}
                  className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border border-white/20 ${vibeColorClass.replace('text-', 'bg-')}`}
                />
              </Box>
            )}
          </Box>

          <VStack className="gap-0.5">
            <Heading size="xs" className="text-sacredWhite/90 uppercase tracking-widest font-black">
              {isOffline
                ? t('community.offlineTitle') || 'Connection Drift'
                : t('community.sanctuaryPulse') || 'Collective Pulse'}
            </Heading>
            <Text className="text-mistGray text-xs font-medium">
              {isOffline
                ? t('community.offlineDesc') || 'Offline Resonance'
                : `${onlineCount} ${roleLabel} breathing with you.`}
            </Text>
            {!isOffline && (
              <HStack className="items-center gap-1.5 mt-1">
                <Icon as={Globe} size={10} className="text-emeraldGreen" />
                <Text className="text-emeraldGreen text-[9px] font-black uppercase tracking-widest">
                  Vibe: {dominantVibe}
                </Text>
              </HStack>
            )}
          </VStack>
        </HStack>

        {!isOffline && onlineCount > 0 && (
          <Box className="p-4 bg-white/5 rounded-2xl border border-white/5 shadow-sm">
            <HStack className="gap-3 items-start">
              <Text className="text-2xl mt-1">✨</Text>
              <VStack className="flex-1">
                <Text className="text-mistGray/80 text-[11px] leading-relaxed italic font-medium">
                  "{motivationText}"
                </Text>
              </VStack>
            </HStack>
          </Box>
        )}
      </VStack>
    </AnimatedView>
  );
}
