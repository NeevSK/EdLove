import ScreenWrapper from '@repo/ui/components/ScreenWrapper';
import { ArrowLeft, ShieldAlert } from '@repo/ui/icons';
import { Box, HStack, Icon, Pressable, Text, VStack } from '@repo/ui/primitives';

import type React from 'react';

export function AdminRoomShell({
  eyebrow,
  title,
  description,
  onBack,
  stats = [],
  children,
  caution,
}: {
  eyebrow: string;
  title: string;
  description: string;
  onBack: () => void;
  stats?: Array<{ label: string; value: string | number; hint?: string }>;
  caution?: string;
  children: React.ReactNode;
}) {
  return (
    <ScreenWrapper scroll={false} noTopInset>
      <Box className="flex-1 bg-phase-canvas px-4 py-4">
        <VStack className="flex-1 gap-4">
          <Pressable
            onPress={onBack}
            accessibilityRole="button"
            accessibilityLabel="Back to admin workspace"
            accessibilityHint="Returns to the previous admin workspace"
            className="active:opacity-80 self-start"
          >
            <HStack className="items-center gap-2 rounded-full border border-starlightGray/20 bg-sacredWhite px-4 py-2">
              <Icon as={ArrowLeft} size={14} color="#2A2318" />
              <Text className="text-[12px] font-bold text-phaseText-primary">
                Back to admin workspace
              </Text>
            </HStack>
          </Pressable>

          <Box className="rounded-[28px] border border-starlightGray/20 bg-sacredWhite px-5 py-5">
            <VStack className="gap-3">
              <Text className="text-[11px] font-bold uppercase tracking-[1px] text-phaseText-secondary">
                {eyebrow}
              </Text>
              <Text className="text-[28px] font-black text-phaseText-primary">{title}</Text>
              <Text className="text-[13px] leading-6 text-phaseText-secondary">{description}</Text>

              {caution ? (
                <HStack className="items-start gap-3 rounded-2xl border border-phase-warning/20 bg-phase-warning/10 px-4 py-3">
                  <Icon as={ShieldAlert} size={16} color="#8B5E34" />
                  <Text className="flex-1 text-[12px] leading-5 text-phaseText-primary">
                    {caution}
                  </Text>
                </HStack>
              ) : null}

              {stats.length > 0 ? (
                <HStack className="gap-3 flex-wrap">
                  {stats.map((stat) => (
                    <Box
                      key={stat.label}
                      className="min-w-[31%] flex-1 rounded-2xl border border-starlightGray/20 bg-silk px-4 py-3"
                    >
                      <Text className="text-[11px] font-bold uppercase text-phaseText-secondary">
                        {stat.label}
                      </Text>
                      <Text className="mt-1 text-[22px] font-bold text-phaseText-primary">
                        {stat.value}
                      </Text>
                      {stat.hint ? (
                        <Text className="mt-1 text-[11px] text-phaseText-secondary">
                          {stat.hint}
                        </Text>
                      ) : null}
                    </Box>
                  ))}
                </HStack>
              ) : null}
            </VStack>
          </Box>

          <Box className="flex-1">{children}</Box>
        </VStack>
      </Box>
    </ScreenWrapper>
  );
}

export function AdminRoomPanel({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <Box className="rounded-[28px] border border-starlightGray/20 bg-sacredWhite px-5 py-5">
      <VStack className="gap-2">
        <Text className="text-[18px] font-black text-phaseText-primary">{title}</Text>
        {description ? (
          <Text className="text-[13px] leading-6 text-phaseText-secondary">{description}</Text>
        ) : null}
      </VStack>
      <Box className="mt-4">{children}</Box>
    </Box>
  );
}
