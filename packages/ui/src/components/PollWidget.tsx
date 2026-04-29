import React from 'react';
import { Animated } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { Check, Clock, Lock } from '../icons';
import { Theme } from '../theme/Theme';
import { AnimatedView, Box, HStack, Icon, Pressable, Spinner, Text, VStack } from '../primitives';

export interface PollOption {
  id: string;
  text: string;
}

export interface PollData {
  options: PollOption[];
  allow_multiple?: boolean;
  is_anonymous?: boolean;
  ends_at?: string | null;
}

interface PollWidgetProps {
  postId: string;
  pollData: PollData;
  counts: Record<string, number>;
  userVotes: Set<string>;
  totalVotes: number;
  isLoading?: boolean;
  isVoting?: boolean;
  isAuthor?: boolean;
  onVote: (optionId: string) => void;
  onRefresh?: () => void;
}

export function PollWidget({
  pollData,
  counts,
  userVotes,
  totalVotes,
  isLoading = false,
  isVoting = false,
  isAuthor = false,
  onVote,
  onRefresh,
}: PollWidgetProps) {
  const {
    options = [],
    allow_multiple = false,
    is_anonymous: pollAnon = false,
    ends_at,
  } = pollData;

  const theme = useTheme();
  const [timeLeft, setTimeLeft] = React.useState<string | null>(null);
  const [isExpired, setIsExpired] = React.useState(false);

  const progressAnims = React.useRef<Record<string, Animated.Value>>({});

  // Initialize animated values for options
  React.useEffect(() => {
    options.forEach((opt) => {
      if (!progressAnims.current[opt.id]) {
        progressAnims.current[opt.id] = new Animated.Value(0);
      }
    });
  }, [options]);

  const hasVoted = userVotes.size > 0;
  const showResults = hasVoted || isExpired || isAuthor;
  const maxCount = options.reduce((m, o) => Math.max(m, counts[o.id] ?? 0), 0);

  React.useEffect(() => {
    if (!showResults) return;
    options.forEach((opt) => {
      const pct = totalVotes > 0 ? ((counts[opt.id] ?? 0) / totalVotes) * 100 : 0;
      Animated.timing(progressAnims.current[opt.id]!, {
        toValue: pct,
        duration: 500,
        useNativeDriver: false, // Layout animation
      }).start();
    });
  }, [counts, totalVotes, showResults, options]);

  React.useEffect(() => {
    if (!ends_at) return;
    const tick = () => {
      const diff = new Date(ends_at).getTime() - Date.now();
      if (diff <= 0) {
        setIsExpired(true);
        setTimeLeft(null);
        return;
      }
      const totalMins = Math.floor(diff / 60_000);
      const d = Math.floor(totalMins / (60 * 24));
      const h = Math.floor((totalMins % (60 * 24)) / 60);
      const m = totalMins % 60;
      setTimeLeft(d > 0 ? `${d}d ${h}h left` : h > 0 ? `${h}h ${m}m left` : `${m}m left`);
    };
    tick();
    const timer = setInterval(tick, 30_000);
    return () => clearInterval(timer);
  }, [ends_at]);

  if (isLoading) {
    return <Spinner size="small" className="mt-3" />;
  }

  return (
    <VStack className="gap-2 mt-2">
      <HStack className="justify-between items-center">
        <HStack className="items-center gap-1.5">
          {pollAnon && (
            <Box className="bg-phase-interactive px-2 py-0.5 rounded-md flex-row items-center gap-1">
              <Icon as={Lock} size={11} color={theme.text.secondary} />
              <Text className="text-phaseText-secondary text-[10px]">Anonymous</Text>
            </Box>
          )}
          {allow_multiple && (
            <Box className="bg-phase-interactive px-2 py-0.5 rounded-md">
              <Text className="text-phaseText-secondary text-[10px]">Multi-select</Text>
            </Box>
          )}
        </HStack>

        {isExpired ? (
          <HStack className="items-center gap-1">
            <Icon as={Clock} size={12} color={theme.text.secondary} />
            <Text className="text-phaseText-secondary text-[11px]">Poll ended</Text>
          </HStack>
        ) : timeLeft ? (
          <HStack className="items-center gap-1">
            <Icon as={Clock} size={12} color={theme.accent.action} />
            <Text className="text-phase-accent text-[11px]">{timeLeft}</Text>
          </HStack>
        ) : null}
      </HStack>

      {options.map((opt) => {
        const count = counts[opt.id] ?? 0;
        const isSelected = userVotes.has(opt.id);
        const isWinner = isExpired && count > 0 && count === maxCount;
        const canTap = !isExpired && !isVoting;

        return (
          <Pressable
            key={opt.id}
            onPress={() => onVote(opt.id)}
            disabled={!canTap}
            accessibilityRole="button"
            accessibilityLabel={`Vote for ${opt.text}. Current votes: ${totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0}%`}
            className={`
              h-12 rounded-xl overflow-hidden relative justify-center border
              ${isWinner ? 'border-sanctuarySaffron' : isSelected ? 'border-phase-accent' : 'border-phase-interactive'}
              ${isSelected ? 'border-2' : 'border-1'}
              bg-phase-surface
            `}
          >
            {showResults && (
              <AnimatedView
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: progressAnims.current[opt.id]!.interpolate({
                    inputRange: [0, 100],
                    outputRange: ['0%', '100%'],
                  }),
                  backgroundColor: isWinner
                    ? `${Theme.colors.sanctuarySaffron}20`
                    : isSelected
                      ? `${theme.accent.action}15`
                      : `${theme.scene.interactive.bg}40`,
                }}
              />
            )}
            <HStack className="justify-between px-3 z-1 items-center w-full">
              <HStack className="items-center gap-2 flex-1">
                <Box
                  className={`
                    w-[18px] h-[18px] items-center justify-center border-2
                    ${allow_multiple ? 'rounded-[4px]' : 'rounded-full'}
                    ${isSelected ? 'bg-phase-accent border-phase-accent' : 'border-phase-interactive'}
                  `}
                >
                  {isSelected && <Icon as={Check} size={12} color="white" />}
                </Box>
                <Text
                  className={`text-phaseText-primary text-sm ${isSelected ? 'font-bold' : 'font-normal'}`}
                >
                  {opt.text}
                </Text>
              </HStack>
              {showResults && (
                <Text
                  className={`font-bold text-xs ${isSelected ? 'text-phase-accent' : 'text-phaseText-secondary'}`}
                >
                  {totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0}%
                </Text>
              )}
            </HStack>
          </Pressable>
        );
      })}

      <HStack className="justify-between mt-1">
        <Text className="text-phaseText-secondary text-[11px]">
          {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}
        </Text>
        {hasVoted && !isExpired && onRefresh && (
          <Pressable
            onPress={onRefresh}
            accessibilityRole="button"
            accessibilityLabel="Change your vote"
          >
            <Text className="text-phase-accent text-[11px] font-semibold">Change vote</Text>
          </Pressable>
        )}
      </HStack>
    </VStack>
  );
}
