import React from 'react';
import { ArrowLeft } from 'lucide-react-native';
import { Box, HStack, Icon, Pressable, ScreenWrapper, Text, VStack } from '@repo/ui';

interface GuardianRoomShellProps {
  eyebrow: string;
  title: string;
  description: string;
  stats?: Array<{
    label: string;
    value: string | number;
  }>;
  onBack: () => void;
  children: React.ReactNode;
}

export function GuardianRoomShell({
  eyebrow,
  title,
  description,
  stats = [],
  onBack,
  children}: GuardianRoomShellProps) {
  return (
    <ScreenWrapper scroll={false} noTopInset>
      <Box className="flex-1 bg-silk px-4 py-4">
        <VStack className="flex-1 gap-4">
          <Pressable onPress={onBack} className="active:opacity-80 self-start">
            <HStack className="items-center gap-2 rounded-full border border-starlightGray/20 bg-sacredWhite px-4 py-2">
              <Icon as={ArrowLeft} size={14} color="#2A2318" />
              <Text className="text-[12px] font-bold text-phaseText-primary">
                Back, to guardian, workspace
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

              {stats.length > 0 ? (
                <HStack className="gap-3 flex-wrap">
                  {stats.map((stat) => (
                    <Box key={stat.label}
                      className="min-w-[31%] flex-1 rounded-2xl border border-starlightGray/20 bg-silk px-4 py-3">
                      <Text className="text-[11px] font-bold uppercase text-phaseText-secondary">
                        {stat.label}
                      </Text>
                      <Text className="mt-1 text-[22px] font-bold text-phaseText-primary">
                        {stat.value}
                      </Text>
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

