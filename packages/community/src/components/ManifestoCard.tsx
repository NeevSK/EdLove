import { View, Text, Pressable } from 'react-native';
import { LivingGlow } from '@repo/ui/components/LivingGlow';
import { Surface } from '@repo/ui/components/native';
import { Heart, ShieldCheck, Star, Target } from '@repo/ui/icons';
import Animated, { LinearTransition } from 'react-native-reanimated';
import type { SanctuaryManifesto } from '@repo/community/types';

interface ManifestoCardProps extends SanctuaryManifesto {
  onEndorse?: (id: string) => void;
  onPress?: () => void;
}

export default function ManifestoCard({
  id,
  title,
  content,
  vibe,
  endorsement_count = 0,
  has_endorsed = false,
  onEndorse,
  onPress,
}: ManifestoCardProps) {
  const vibeConfig: Record<string, { icon: any; color: string; textColorClass: string }> = {
    visionary: {
      icon: Star,
      color: '#E67E22',
      textColorClass: 'text-primary-500',
    },
    supportive: {
      icon: Heart,
      color: '#E74C3C',
      textColorClass: 'text-error-500',
    },
    academic: {
      icon: Target,
      color: '#3498DB',
      textColorClass: 'text-secondary-500',
    },
    wellbeing: {
      icon: ShieldCheck,
      color: '#2ECC71',
      textColorClass: 'text-success-500',
    },
  };

  const config = (vibeConfig[vibe] || vibeConfig.visionary) as {
    icon: any;
    color: string;
    textColorClass: string;
  };
  const VibeIcon = config.icon;

  return (
    <Pressable onPress={onPress} className="active:opacity-90"><Surface tone="raised" className="p-4 rounded-2xl">
      <View className="gap-4">
        <View className="flex-row items-center justify-between items-center">
          <View className="flex-row items-center items-center gap-2">
            <View className="p-1 bg-white/5 border border-outline-variant rounded-md">
              <VibeIcon size={16} color={config.color} />
            </View>
            <Text className={`text-[10px] font-extrabold uppercase ${config.textColorClass}`}>
              {vibe} Manifesto
            </Text>
          </View>

          <View className="flex-row items-center items-center gap-1">
            <Heart
              size={16}
              fill={has_endorsed ? '#E74C3C' : 'none'}
              color={has_endorsed ? '#E74C3C' : 'rgba(255,255,255,0.4)'}
            />
            <Text className="text-[12px] font-bold text-muted-foreground">{endorsement_count}</Text>
          </View>
        </View>

        <View className="gap-1">
          <Text className="text-foreground">
            {title}
          </Text>
          <Text
            numberOfLines={onPress ? 3 : undefined}
            className="text-sm leading-relaxed text-muted-foreground"
          >
            {content}
          </Text>
        </View>

        <Animated.View layout={LinearTransition}>
          <View className="flex-row items-center justify-between items-center mt-1">
            <Pressable
              onPress={(e) => {
                e.stopPropagation();
                onEndorse?.(id);
              }}
              className={`py-1.5 px-3 rounded-full border ${has_endorsed ? 'bg-primary-500 border-primary-500' : 'bg-transparent border-outline-variant'}`}
            >
              <Text
                className={`text-[11px] font-bold ${has_endorsed ? 'text-white' : 'text-muted-foreground'}`}
              >
                {has_endorsed ? 'Identified with Mission' : 'Endorse Mission'}
              </Text>
            </Pressable>

            {has_endorsed && (
              <LivingGlow duration={3000}>
                <Star size={18} color="#E67E22" />
              </LivingGlow>
            )}
          </View>
        </Animated.View>
      </View>
    </Surface></Pressable>
  );
}
