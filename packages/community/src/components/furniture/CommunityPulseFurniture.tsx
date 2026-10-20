import { Box, Heading, Text } from '@repo/ui/primitives';
import { memo } from 'react';

export type PulseCardProps = Readonly<{
  label: string;
  value: string;
}>;

export const PulseCard = memo(({ label, value }: PulseCardProps) => {
  return (
    <Box className="flex-1 min-w-[92px] px-3 py-4 rounded-2xl bg-white/30 border border-white/20">
      <Text className="text-[9px] text-ink/40 font-bold uppercase tracking-wider">{label}</Text>
      <Heading className="mt-1 text-2xl font-bold text-ink">{value}</Heading>
    </Box>
  );
});

PulseCard.displayName = 'PulseCard';

export type SectionCardProps = Readonly<{
  title: string;
  description: string;
  children: React.ReactNode;
}>;

export const SectionCard = memo(({ title, description, children }: SectionCardProps) => {
  return (
    <Box className="rounded-3xl border border-border bg-phase-surface/30 overflow-hidden mb-4">
      <Box className="gap-1 p-5">
        <Heading className="text-md text-ink font-bold">{title}</Heading>
        <Text className="text-ink/60 text-xs leading-snug">{description}</Text>
      </Box>
      {children}
    </Box>
  );
});

SectionCard.displayName = 'SectionCard';
