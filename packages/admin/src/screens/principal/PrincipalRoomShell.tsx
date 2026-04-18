import React from 'react';
import { ArrowLeft } from 'lucide-react-native';
import { Box, VStack, HStack, Text, Pressable, Icon } from '@repo/ui';

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
    description: 'Used as part of routine leadership and immediate institutional stewardship.'
  },
  setup: {
    label: 'Setup Room',
    description: 'Opened when shaping school structure, then revisited only when the institution changes.'
  },
  periodic: {
    label: 'Periodic Room',
    description: 'Used at moments of onboarding, review, or governance rhythm, rather than all day long.'
  },
  horizon: {
    label: 'Horizon Room',
    description: 'Reserved for longer-range institutional planning and future operating layers.'
  }
};

export function PrincipalRoomShell({
  eyebrow,
  title,
  description,
  cadence,
  accent = 'text-primary',
  isPastView = false,
  onBack,
  stats = [],
  children
}: PrincipalRoomShellProps) {
  const cadenceMeta = cadenceCopy[cadence];

  return (
    <VStack className="gap-6">
      <Pressable 
        onPress={onBack}
        className="flex-row items-center gap-2 self-start px-4 py-2 rounded-full border border-border bg-white/70 active:opacity-70"
      >
        <Icon as={ArrowLeft} size={14} />
        <Text className="text-[13px] font-bold text-ink">Back to Principal Workspace</Text>
      </Pressable>

      <Box className="p-7 rounded-[32px] bg-gradient-to-b from-silk/90 to-phase-warning/10 border border-primary/20 shadow-lg">
        <HStack className="justify-between items-start gap-4 flex-wrap">
          <VStack className="flex-1 min-w-0 max-w-[760px]">
            <Text className={`text-[11px] font-extrabold uppercase tracking-widest ${accent}`}>
              {eyebrow}
            </Text>
            <Text className="mt-2 text-3xl font-black text-ink leading-tight">
              {title}
            </Text>
            <Text className="mt-3 text-sm leading-relaxed text-ink/60">
              {description}
            </Text>
          </VStack>

          <VStack className="min-w-[240px] p-4 rounded-2xl bg-white/60 border border-border gap-2">
            <Text className={`text-[10px] font-extrabold uppercase tracking-widest ${accent}`}>
              {cadenceMeta.label}
            </Text>
            <Text className="text-xs leading-normal text-ink/60">
              {cadenceMeta.description}
            </Text>
            <Box className={`self-start px-3 py-1 rounded-full ${isPastView ? 'bg-slate-500/10' : 'bg-primary/10'}`}>
              <Text className={`text-[10px] font-extrabold uppercase tracking-wider ${isPastView ? 'text-ink/60' : accent}`}>
                {isPastView ? 'Past Snapshot' : 'Live Workspace'}
              </Text>
            </Box>
          </VStack>
        </HStack>

        {stats.length > 0 && (
          <Box className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
            {stats.map((stat) => (
              <Box 
                key={stat.label}
                className="p-4 rounded-2xl bg-white/50 border border-border"
              >
                <Text className="text-[10px] font-extrabold uppercase tracking-widest text-ink/60">
                  {stat.label}
                </Text>
                <Text className={`mt-2 text-2xl font-black ${
                  stat.tone === 'accent' ? accent : stat.tone === 'muted' ? 'text-ink/60' : 'text-ink'
                }`}>
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
  tone = 'default'
}: PrincipalRoomPanelProps) {
  const toneClasses = {
    default: 'bg-white/60 border-border',
    accent: 'bg-primary/5 border-primary/20',
    muted: 'bg-slate-50 border-dashed border-border'
  };

  return (
    <Box className={`p-6 rounded-3xl border flex-col gap-4 ${toneClasses[tone]}`}>
      <VStack className="gap-1">
        <Text className="text-lg font-extrabold text-ink">{title}</Text>
        {description && (
          <Text className="text-[13px] leading-relaxed text-ink/60">{description}</Text>
        )}
      </VStack>
      {children}
    </Box>
  );
}

export function PrincipalRoomEmptyState({ title, description }: PrincipalRoomEmptyStateProps) {
  return (
    <VStack className="p-7 rounded-3xl border border-dashed border-border bg-phase-warning/5 gap-2">
      <Text className="text-base font-extrabold text-ink">{title}</Text>
      <Text className="text-[13px] leading-relaxed text-ink/60">{description}</Text>
    </VStack>
  );
}
