import { View, Text, Pressable } from 'react-native';
import { usePermissions } from '@repo/core/logic';
import { useAuthStore } from '@repo/core/store/useAuthStore';
import { useWisdom } from '@repo/self/wisdom';
import { WaitingSign } from '@repo/ui/components/native';
import { ChevronLeft, Leaf } from '@repo/ui/icons';
import { tokens } from '@repo/ui/tokens';
import { safeBack } from '@repo/ui/utils/navigation';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';

export default function WisdomDetailRoute() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { context } = usePermissions();
  const userId = useAuthStore((state) => state.user?.id) ?? context?.userId;
  const { notes, isLoading } = useWisdom(userId ?? undefined);

  const note = useMemo(() => notes.find((entry) => entry.id === id), [notes, id]);

  return (
    <View className="flex-1 bg-obsidian px-5 py-6 gap-4">
      <Pressable
        accessibilityRole="button"
        onPress={() => safeBack('/self')}
        className="self-start flex-row items-center gap-2 px-3.5 py-2 rounded-full bg-white/5 border border-white/10"
      >
        <ChevronLeft size={16} color={tokens.colors.primary} />
        <Text className="text-xs font-bold text-mistGray">Back</Text>
      </Pressable>

      <View className="flex-row items-center items-center gap-3">
        <View className="w-10 h-10 rounded-full bg-emeraldGreen/10 items-center justify-center">
          <Leaf size={18} color={tokens.colors.success} />
        </View>
        <View className="gap-0.5">
          <Text className="text-sacredWhite text-lg font-bold">Wisdom Detail</Text>
          <Text className="text-mistGray text-xs uppercase tracking-widest">
            {id ? `Seed ${id}` : 'Wisdom seed'}
          </Text>
        </View>
      </View>

      {isLoading ? (
        <View className="rounded-3xl bg-white/5 p-5 border border-white/10 items-center justify-center gap-2">
          <WaitingSign size={32} />
          <Text className="text-mistGray">Settling your wisdom note…</Text>
        </View>
      ) : note ? (
        <View className="rounded-3xl bg-white/5 p-5 border border-white/10">
          <Text className="text-sacredWhite text-base leading-7">{note.insight}</Text>
          <Text className="mt-4 text-mistGray text-xs uppercase tracking-widest">
            {new Date(note.created_at).toLocaleString()}
          </Text>
        </View>
      ) : (
        <View className="rounded-3xl bg-white/5 p-5 border border-white/10">
          <Text className="text-sacredWhite">Wisdom note not found.</Text>
        </View>
      )}
    </View>
  );
}
