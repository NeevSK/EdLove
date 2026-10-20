import { Box, HStack, Text, useTheme } from '@repo/ui/primitives';
import { memo, useMemo } from 'react';

export type LibraryPulseProps = Readonly<{
  resourceCount: number;
  collectionCount: number;
  bookmarkCount: number;
}>;

export const SanctuaryPulse = memo(
  ({ resourceCount, collectionCount, bookmarkCount }: LibraryPulseProps) => {
    const theme = useTheme();

    const items = useMemo(
      () => [
        {
          label: 'Resources',
          value: resourceCount,
          accent: `${theme.accent.action}18`,
        },
        {
          label: 'Categories',
          value: collectionCount,
          accent: `${theme.accent.reward}16`,
        },
        {
          label: 'Bookmarks',
          value: bookmarkCount,
          accent: `${theme.accent.sageGreen}16`,
        },
      ],
      [
        resourceCount,
        collectionCount,
        bookmarkCount,
        theme.accent.action,
        theme.accent.reward,
        theme.accent.sageGreen,
      ],
    );

    return (
      <HStack className="px-md pt-sm gap-2.5">
        {items.map((item) => (
          <Box
            key={item.label}
            className="flex-1 rounded-[18px] border border-phase-border bg-phase-surface overflow-hidden"
          >
            <Box className="px-5 py-4" style={{ backgroundColor: item.accent }}>
              <Text className="text-[10px] font-extrabold tracking-widest uppercase text-phaseText-secondary">
                {item.label}
              </Text>
              <Text className="text-2xl font-extrabold text-phaseText-primary mt-1">
                {item.value}
              </Text>
            </Box>
          </Box>
        ))}
      </HStack>
    );
  },
);

SanctuaryPulse.displayName = 'SanctuaryPulse';
