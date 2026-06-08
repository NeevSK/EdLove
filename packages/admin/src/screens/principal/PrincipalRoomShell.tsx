import { ArrowLeft } from '@repo/ui/icons';
import { Box, HStack, Icon, Pressable, Text, VStack } from '@repo/ui/primitives';
import { hapticLight } from '@repo/ui/utils/haptics';

import type React from 'react';

type PrincipalRoomCadence = 'daily' | 'setup' | 'periodic' | 'horizon';

interface PrincipalRoomShellProps {
  eyebrow: string;
  title: string;
  description: string;
  cadence: PrincipalRoomCadence;
  accent?: string;
  isPastView?: boolean;
  onBack: () => void;
  stats?: Array<{
    label: string;
    value: string | number;
    tone?: 'default' | 'accent' | 'muted';
  }>;
  children: React.ReactNode;
}

interface PrincipalRoomPanelProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  tone?: 'default' | 'accent' | 'muted';
}

interface PrincipalRoomEmptyStateProps {
  title: string;
  description: string;
}

const cadenceCopy: Record<PrincipalRoomCadence, { label: string; description: string }> = {
  daily: {
    label: 'Daily Room',
    description: 'Used as part of routine leadership and immediate institutional stewardship.',
  },
  setup: {
    label: 'Setup Room',
    description:
      'Opened when shaping school structure, then revisited only when the institution changes.',
  },
  periodic: {
    label: 'Periodic Room',
    description:
      'Used at moments of onboarding, review, or governance rhythm, rather than all day long.',
  },
  horizon: {
    label: 'Horizon Room',
    description: 'Reserved for longer-range institutional planning and future operating layers.',
  },
};

export function PrincipalRoomShell({
  eyebrow,
  title,
  description,
  cadence,
  accent = 'text-phase-interactive',
  isPastView = false,
  onBack,
  stats = [],
  children,
}: PrincipalRoomShellProps) {
  const cadenceMeta = cadenceCopy[cadence];

  return (
    <VStack className="gap-8">
      <Pressable
        onPress={() => {
          hapticLight();
          onBack();
        }}
        className="flex-row items-center gap-2 self-start px-4 py-2.5 rounded-2xl border border-phase-border bg-phase-surface shadow-sm active:scale-95 transition-all"
      >
        <Icon as={ArrowLeft} size={14} className="text-phaseText-primary" />
        <Text className="text-[13px] font-black text-phaseText-primary uppercase tracking-widest">
          Back to Hub
        </Text>
      </Pressable>

      <Box className="p-8 rounded-[40px] bg-phase-surface border border-phase-border shadow-xl">
        <HStack className="justify-between items-start gap-6 flex-wrap">
          <VStack className="flex-1 min-w-0 max-w-[760px] gap-2">
            <Text className={`text-[10px] font-black uppercase tracking-[0.25em] ${accent}`}>
              {eyebrow}
            </Text>
            <Text className="text-[34px] font-black text-phaseText-primary tracking-tighter leading-tight">
              {title}
            </Text>
            <Text className="text-[15px] leading-relaxed text-phaseText-secondary font-medium mt-1">
              {description}
            </Text>
          </VStack>

          <VStack className="min-w-[260px] p-5 rounded-3xl bg-phase-canvas border border-phase-border gap-2.5 shadow-inner">
            <Text className={`text-[10px] font-black uppercase tracking-widest ${accent}`}>
              {cadenceMeta.label}
            </Text>
            <Text className="text-[11px] leading-relaxed text-phaseText-secondary font-bold">
              {cadenceMeta.description}
            </Text>
            <Box
              className={`self-start px-3.5 py-1.5 rounded-full mt-1 border border-phase-border/20 ${isPastView ? 'bg-phase-canvas' : 'bg-phase-interactive'}`}
            >
              <Text
                className={`text-[9px] font-black uppercase tracking-[0.15em] ${isPastView ? 'text-phaseText-muted' : 'text-white'}`}
              >
                {isPastView ? 'Past Snapshot' : 'Live Vector'}
              </Text>
            </Box>
          </VStack>
        </HStack>

        {stats.length > 0 && (
          <Box className="flex-row flex-wrap gap-4 mt-8">
            {stats.map((stat) => (
              <Box
                key={stat.label}
                className="flex-1 min-w-[140px] p-5 rounded-2xl bg-phase-canvas border border-phase-border shadow-inner gap-1"
              >
                <Text className="text-[9px] font-black uppercase tracking-widest text-phaseText-muted">
                  {stat.label}
                </Text>
                <Text
                  className={`text-[24px] font-black tracking-tight ${
                    stat.tone === 'accent'
                      ? accent
                      : stat.tone === 'muted'
                        ? 'text-phaseText-muted'
                        : 'text-phaseText-primary'
                  }`}
                >
                  {stat.value}
                </Text>
              </Box>
            ))}
          </Box>
        )}
      </Box>

      {children}
    </VStack>
  );
}

export function PrincipalRoomPanel({
  title,
  description,
  children,
  tone = 'default',
}: PrincipalRoomPanelProps) {
  const toneClasses = {
    default: 'bg-phase-surface border-phase-border shadow-sm',
    accent: 'bg-phase-interactive/5 border-phase-interactive/20 shadow-sm',
    muted: 'bg-phase-canvas border-dashed border-phase-border shadow-none',
  };

  return (
    <Box className={`p-7 rounded-[32px] border flex-col gap-5 ${toneClasses[tone]}`}>
      <VStack className="gap-1 px-1">
        <Text className="text-[19px] font-black text-phaseText-primary tracking-tight">
          {title}
        </Text>
        {description && (
          <Text className="text-[13px] leading-relaxed text-phaseText-secondary font-medium">
            {description}
          </Text>
        )}
      </VStack>
      {children}
    </Box>
  );
}

export function PrincipalRoomEmptyState({ title, description }: PrincipalRoomEmptyStateProps) {
  return (
    <VStack className="p-8 rounded-[32px] border border-dashed border-phase-border bg-phase-canvas items-center justify-center gap-3">
      <Text className="text-[16px] font-black text-phaseText-primary tracking-tight text-center">
        {title}
      </Text>
      <Text className="text-[13px] leading-relaxed text-phaseText-muted font-bold text-center max-w-[280px]">
        {description}
      </Text>
    </VStack>
  );
}
