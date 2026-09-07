import { Briefcase, Heart, School, Users } from '@repo/ui/icons';
import { Box, HStack, Text } from '@repo/ui/primitives';
import { tokens } from '@repo/ui/tokens';
import React from 'react';

export type BondBadgeKind = 'personal' | 'commercial' | 'institutional' | 'guardian';

export interface BondBadgeProps {
  label: string;
  kind?: BondBadgeKind;
  subLabel?: string;
  size?: 'sm' | 'md';
}

export function BondBadge({
  label,
  kind = 'institutional',
  subLabel,
  size = 'sm',
}: BondBadgeProps) {
  const isSm = size === 'sm';

  const badgeConfig = {
    personal: {
      bg: 'rgba(212, 132, 58, 0.12)',
      border: 'rgba(212, 132, 58, 0.28)',
      text: tokens.colors.primary,
      icon: <Heart size={isSm ? 11 : 13} color={tokens.colors.primary} />,
    },
    commercial: {
      bg: 'rgba(79, 125, 163, 0.12)',
      border: 'rgba(79, 125, 163, 0.28)',
      text: tokens.colors.info,
      icon: <Briefcase size={isSm ? 11 : 13} color={tokens.colors.info} />,
    },
    institutional: {
      bg: 'rgba(91, 140, 79, 0.12)',
      border: 'rgba(91, 140, 79, 0.28)',
      text: tokens.colors.success,
      icon: <School size={isSm ? 11 : 13} color={tokens.colors.success} />,
    },
    guardian: {
      bg: 'rgba(184, 169, 224, 0.18)',
      border: 'rgba(107, 100, 128, 0.25)',
      text: tokens.colors.inkSubtle,
      icon: <Users size={isSm ? 11 : 13} color="#6B6480" />,
    },
  }[kind];

  return (
    <Box
      style={{
        backgroundColor: badgeConfig.bg,
        borderColor: badgeConfig.border,
        borderWidth: 1,
        borderRadius: tokens.radii.full,
        paddingHorizontal: isSm ? 8 : 12,
        paddingVertical: isSm ? 2 : 4,
        alignSelf: 'flex-start',
      }}
    >
      <HStack style={{ alignItems: 'center', gap: 5 }}>
        {badgeConfig.icon}
        <Text
          style={{
            fontSize: isSm ? 11 : 12,
            fontWeight: '700',
            color: badgeConfig.text,
          }}
          numberOfLines={1}
        >
          {label}
        </Text>
        {subLabel ? (
          <Text
            style={{
              fontSize: isSm ? 10 : 11,
              color: tokens.semantic.text.secondary,
              opacity: 0.8,
            }}
          >
            · {subLabel}
          </Text>
        ) : null}
      </HStack>
    </Box>
  );
}

export default BondBadge;

