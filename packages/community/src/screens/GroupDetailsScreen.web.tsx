import { usePermissions } from '@repo/core/logic';
import { useStore, useTemporalStore } from '@repo/core/store';
import { BrandedEmptyState } from '@repo/ui/components/BrandedEmptyState';
import { ErrorState as BrandedErrorState } from '@repo/ui/components/ErrorState';
import { SanctuaryButton } from '@repo/ui/components/SanctuaryButton';
import { Box, Heading, Spinner, Text, VStack } from '@repo/ui/primitives';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { communityAPI } from '@repo/community/api/community';
import PostCard from '@repo/community/components/PostCard';
import { useCommunity } from '@repo/community/hooks/useCommunity';

export default function GroupDetailsScreenWeb() {
  const params = useLocalSearchParams<{ groupId?: string }>();
  const groupId = Array.isArray(params.groupId) ? params.groupId[0] : params.groupId;
  const { can } = usePermissions();
  const userId = useStore((state) => state.user?.id);
  const isOffline = useTemporalStore((state) => state.isOffline);
  const { posts, isLoadingPosts, error: postsError } = useCommunity(groupId);
  const [group, setGroup] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadGroup() {
      if (!groupId) {
        setError('This circle could not be identified.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const data = await communityAPI.getGroupById(groupId);
        if (!cancelled) setGroup(data);
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : 'This circle could not be loaded.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadGroup();
    return () => {
      cancelled = true;
    };
  }, [groupId]);

  const retry = useCallback(() => {
    setError(null);
    setLoading(true);
    if (groupId) {
      communityAPI
        .getGroupById(groupId)
        .then(setGroup)
        .catch((loadError: unknown) =>
          setError(loadError instanceof Error ? loadError.message : 'This circle could not be loaded.'),
        )
        .finally(() => setLoading(false));
    }
  }, [groupId]);

  if (!can('read', 'CommunityGroups')) {
    return <BrandedErrorState title="This circle is not available" message="Your current permissions do not include community groups." />;
  }

  if (loading) {
    return (
      <Box className="flex-1 items-center justify-center bg-phase-canvas">
        <Spinner />
        <Text className="mt-3 text-ink/50 text-xs font-semibold">Opening this circle…</Text>
      </Box>
    );
  }

  if (error || !group) {
    return (
      <BrandedErrorState
        title="The circle could not settle"
        message={isOffline ? 'You are offline. Reconnect and try again.' : error ?? 'Circle not found.'}
      >
        <SanctuaryButton action="secondary" onPress={retry}>
          <Text className="text-ink font-bold">Try again</Text>
        </SanctuaryButton>
      </BrandedErrorState>
    );
  }

  return (
    <Box className="flex-1 bg-phase-canvas px-8 py-8">
      <Box className="mx-auto w-full max-w-[900px]">
        <SanctuaryButton action="secondary" onPress={() => router.back()} className="mb-6">
          <Text className="text-ink font-bold">Back</Text>
        </SanctuaryButton>
        <VStack className="gap-2 mb-8">
          <Text className="text-ink/50 text-xs font-bold uppercase tracking-[2px]">Circle</Text>
          <Heading className="text-3xl text-ink font-black">{group.name}</Heading>
          <Text className="text-ink/60 leading-relaxed">
            {group.description || 'Shared resonance and practical conversation.'}
          </Text>
        </VStack>

        {isOffline ? (
          <Box className="mb-5 rounded-xl border border-phase-warning/30 bg-phase-warning/10 px-4 py-3">
            <Text className="text-phase-warning text-sm font-semibold">Offline — showing cached community data.</Text>
          </Box>
        ) : null}

        {isLoadingPosts ? (
          <Box className="py-16 items-center"><Spinner /></Box>
        ) : postsError ? (
          <BrandedErrorState title="Posts could not settle" message={isOffline ? 'Reconnect to try again.' : postsError} />
        ) : posts.length === 0 ? (
          <BrandedEmptyState
            title="This circle is ready for its first note"
            message="When someone shares, the conversation will begin here."
          />
        ) : (
          <VStack className="gap-4">
            {posts.map((post: any) => (
              <PostCard
                key={post.id}
                post={post}
                currentUserId={userId}
                onLike={() => undefined}
                onComment={() => undefined}
              />
            ))}
          </VStack>
        )}
      </Box>
    </Box>
  );
}
