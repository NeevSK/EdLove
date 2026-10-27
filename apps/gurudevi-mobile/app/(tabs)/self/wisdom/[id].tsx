import { usePermissions } from '@repo/core/logic';
import { useAuthStore } from '@repo/core/store/useAuthStore';
import { useWisdom } from '@repo/self/wisdom';
import { BrandPulse } from '@repo/ui/components/BrandPulse';
import { ChevronLeft, Leaf } from '@repo/ui/icons';
import { Box, HStack, Pressable, Text, VStack } from '@repo/ui/primitives';
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
    <VStack className="flex-1 bg-obsidian px-5 py-6 gap-4">
      <Pressable
        accessibilityRole="button"
        onPress={() => safeBack('/self')}
        className="self-start flex-row items-center gap-2 px-3.5 py-2 rounded-full bg-white/5 border border-white/10"
      >
        <ChevronLeft size={16} color={tokens.colors.primary} />
        <Text className="text-xs font-bold text-mistGray">Back</Text>
      </Pressable>

      <HStack className="items-center gap-3">
        <Box className="w-10 h-10 rounded-full bg-emeraldGreen/10 items-center justify-center">
          <Leaf size={18} color={tokens.colors.success} />
        </Box>
        <VStack className="gap-0.5">
          <Text className="text-sacredWhite text-lg font-bold">Wisdom Detail</Text>
          <Text className="text-mistGray text-xs uppercase tracking-widest">
            {id ? `Seed ${id}` : 'Wisdom seed'}
          </Text>
        </VStack>
      </HStack>

      {isLoading ? (
        <Box className="rounded-3xl bg-white/5 p-5 border border-white/10">
          <BrandPulse
            size={32}
            tintColor={tokens.colors.primary}
            accessibilityLabel="Loading wisdom"
          />
          <Text className="text-mistGray">Settling your wisdom note…</Text>
        </Box>
      ) : note ? (
        <Box className="rounded-3xl bg-white/5 p-5 border border-white/10">
          <Text className="text-sacredWhite text-base leading-7">{note.insight}</Text>
          <Text className="mt-4 text-mistGray text-xs uppercase tracking-widest">
            {new Date(note.created_at).toLocaleString()}
          </Text>
        </Box>
      ) : (
        <Box className="rounded-3xl bg-white/5 p-5 border border-white/10">
          <Text className="text-sacredWhite">Wisdom note not found.</Text>
        </Box>
      )}
    </VStack>
  );
}
