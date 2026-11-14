import { View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from '@repo/ui/icons';

import type React from 'react';

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
  children,
}: GuardianRoomShellProps) {
  return (
    <SafeAreaView edges={["bottom", "left", "right"]} className="flex-1 bg-silk">
      <View className="flex-1 bg-silk px-4 py-4">
        <View className="flex-1 gap-4">
          <Pressable
            onPress={onBack}
            accessibilityRole="button"
            accessibilityLabel="Back to guardian workspace"
            accessibilityHint="Returns to the previous guardian view"
            className="active:opacity-80 self-start"
          >
            <View className="flex-row items-center items-center gap-2 rounded-full border border-starlightGray/20 bg-sacredWhite px-4 py-2">
              <ArrowLeft size={14} color="#2A2318" />
              <Text className="text-[12px] font-bold text-phaseText-primary">
                Back to guardian workspace
              </Text>
            </View>
          </Pressable>

          <View className="rounded-[28px] border border-starlightGray/20 bg-sacredWhite px-5 py-5">
            <View className="gap-3">
              <Text className="text-[11px] font-bold uppercase tracking-[1px] text-phaseText-secondary">
                {eyebrow}
              </Text>
              <Text className="text-[28px] font-black text-phaseText-primary">{title}</Text>
              <Text className="text-[13px] leading-6 text-phaseText-secondary">{description}</Text>

              {stats.length > 0 ? (
                <View className="flex-row items-center gap-3 flex-wrap">
                  {stats.map((stat) => (
                    <View
                      key={stat.label}
                      className="min-w-[31%] flex-1 rounded-2xl border border-starlightGray/20 bg-silk px-4 py-3"
                    >
                      <Text className="text-[11px] font-bold uppercase text-phaseText-secondary">
                        {stat.label}
                      </Text>
                      <Text className="mt-1 text-[22px] font-bold text-phaseText-primary">
                        {stat.value}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : null}
            </View>
          </View>

          <View className="flex-1">{children}</View>
        </View>
      </View>
    </SafeAreaView>
  );
}
