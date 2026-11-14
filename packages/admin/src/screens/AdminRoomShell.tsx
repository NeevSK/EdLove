import { View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, ShieldAlert } from '@repo/ui/icons';

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
    <SafeAreaView edges={["bottom", "left", "right"]} className="flex-1 bg-phase-canvas">
      <View className="flex-1 bg-phase-canvas px-4 py-4">
        <View className="flex-1 gap-4">
          <Pressable
            onPress={onBack}
            accessibilityRole="button"
            accessibilityLabel="Back to admin workspace"
            accessibilityHint="Returns to the previous admin workspace"
            className="active:opacity-80 self-start"
          >
            <View className="flex-row items-center items-center gap-2 rounded-full border border-starlightGray/20 bg-sacredWhite px-4 py-2">
              <ArrowLeft size={14} color="#2A2318" />
              <Text className="text-[12px] font-bold text-phaseText-primary">
                Back to admin workspace
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

              {caution ? (
                <View className="flex-row items-center items-start gap-3 rounded-2xl border border-phase-warning/20 bg-phase-warning/10 px-4 py-3">
                  <ShieldAlert size={16} color="#8B5E34" />
                  <Text className="flex-1 text-[12px] leading-5 text-phaseText-primary">
                    {caution}
                  </Text>
                </View>
              ) : null}

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
                      {stat.hint ? (
                        <Text className="mt-1 text-[11px] text-phaseText-secondary">
                          {stat.hint}
                        </Text>
                      ) : null}
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
    <View className="rounded-[28px] border border-starlightGray/20 bg-sacredWhite px-5 py-5">
      <View className="gap-2">
        <Text className="text-[18px] font-black text-phaseText-primary">{title}</Text>
        {description ? (
          <Text className="text-[13px] leading-6 text-phaseText-secondary">{description}</Text>
        ) : null}
      </View>
      <View className="mt-4">{children}</View>
    </View>
  );
}
