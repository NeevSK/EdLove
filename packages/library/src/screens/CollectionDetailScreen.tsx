import { useStore } from '@repo/core/logic';
import ScreenWrapper from '@repo/ui/components/ScreenWrapper';
import { useThemedColors } from '@repo/ui/hooks';
import {
  Box,
  HStack,
  Icon,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  VStack,
} from '@repo/ui/primitives';
import { safeBack } from '@repo/ui/utils/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  Edit2,
  Globe,
  Lock,
  MoreVertical,
  Trash2,
  Users,
  X,
} from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { LibraryThumbnailCard } from '../components/LibraryThumbnailCard';
import { libraryAPI } from '../api/library';
import { LIBRARY_KEYS, useCollection } from '../hooks/useLibrary';
import type { LibraryCollection, LibraryResource, ResourceVisibility } from '../types';

const VISIBILITY_OPTIONS: {
  value: ResourceVisibility;
  label: string;
  icon: any;
  color: string;
}[] = [
  { value: 'private', label: 'Private — Only me', icon: Lock, color: '#e88c30' },
  { value: 'shared', label: 'Shared — School members', icon: Users, color: '#6798d6' },
  { value: 'public', label: 'Public — Everyone', icon: Globe, color: '#34a853' },
];

export default function CollectionDetailScreen() {
  const router = useRouter();
  const colors = useThemedColors();
  const { user } = useStore();
  const queryClient = useQueryClient();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { collection, isLoading, error, refetch } = useCollection(id, user?.id);

  const [actionSheetOpen, setActionSheetOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const isOwner = !!user?.id && !!collection?.creator_id && collection.creator_id === user.id;

  const handleOpenResource = useCallback(
    (resource: LibraryResource) => {
      router.push(`/library/resource/${resource.id}`);
    },
    [router],
  );

  // ── Edit ──────────────────────────────────────────────────────────────────
  const openEdit = useCallback(() => {
    if (!collection) return;
    setEditName(collection.name);
    setEditDesc(collection.description || '');
    setActionSheetOpen(false);
    setEditModalOpen(true);
  }, [collection]);

  const handleSaveEdit = useCallback(async () => {
    if (!collection || !editName.trim()) return;
    setIsUpdating(true);
    try {
      await libraryAPI.updateCollection(collection.id, {
        name: editName.trim(),
        description: editDesc.trim(),
      } as any);
      queryClient.invalidateQueries({ queryKey: LIBRARY_KEYS.collections() });
      queryClient.invalidateQueries({ queryKey: LIBRARY_KEYS.collection(collection.id) });
      setEditModalOpen(false);
    } catch {
      Alert.alert('Error', 'Failed to update collection.');
    } finally {
      setIsUpdating(false);
    }
  }, [collection, editName, editDesc, queryClient]);

  // ── Visibility ────────────────────────────────────────────────────────────
  const handleChangeVisibility = useCallback(
    async (visibility: ResourceVisibility) => {
      if (!collection) return;
      setActionSheetOpen(false);
      setIsUpdating(true);
      try {
        await libraryAPI.updateCollection(collection.id, { visibility } as any);
        queryClient.invalidateQueries({ queryKey: LIBRARY_KEYS.collections() });
        queryClient.invalidateQueries({ queryKey: LIBRARY_KEYS.collection(collection.id) });
      } catch {
        Alert.alert('Error', 'Failed to update visibility.');
      } finally {
        setIsUpdating(false);
      }
    },
    [collection, queryClient],
  );

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = useCallback(() => {
    if (!collection) return;
    setActionSheetOpen(false);
    Alert.alert(
      'Delete Collection',
      `Delete "${collection.name}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            try {
              await libraryAPI.deleteCollection(collection.id);
              queryClient.invalidateQueries({ queryKey: LIBRARY_KEYS.collections() });
              safeBack('/library');
            } catch {
              Alert.alert('Error', 'Failed to delete collection.');
              setIsDeleting(false);
            }
          },
        },
      ],
    );
  }, [collection, queryClient]);

  // ── Remove resource ───────────────────────────────────────────────────────
  const handleRemoveResource = useCallback(
    async (resourceId: string) => {
      if (!collection) return;
      Alert.alert('Remove Resource', 'Remove this resource from the collection?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            setRemovingId(resourceId);
            try {
              await libraryAPI.removeFromCollection(collection.id, resourceId);
              queryClient.invalidateQueries({ queryKey: LIBRARY_KEYS.collection(collection.id) });
            } catch {
              Alert.alert('Error', 'Failed to remove resource.');
            } finally {
              setRemovingId(null);
            }
          },
        },
      ]);
    },
    [collection, queryClient],
  );

  const getYoutubeThumbnail = (url?: string) => {
    if (!url) return undefined;
    const match = url.match(
      /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]{11})/,
    );
    return match ? `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg` : undefined;
  };

  // ── Loading / Error states ─────────────────────────────────────────────────
  if (isLoading) {
    return (
      <ScreenWrapper>
        <Box className="flex-1 items-center justify-center">
          <Text className="text-phaseText-secondary">Loading collection...</Text>
        </Box>
      </ScreenWrapper>
    );
  }

  if (error || !collection) {
    return (
      <ScreenWrapper>
        <VStack className="flex-1 items-center justify-center p-lg gap-3">
          <Text className="text-xl font-extrabold text-phaseText-primary">
            Collection unavailable
          </Text>
          <Text className="text-center text-phaseText-secondary">
            {String(error || 'We could not load this collection right now.')}
          </Text>
          <HStack className="gap-2.5 mt-2">
            <Pressable
              onPress={() => safeBack('/library')}
              className="h-10 px-6 rounded-xl border border-phase-border bg-phase-interactive/5 items-center justify-center"
            >
              <Text className="font-bold text-phaseText-primary">Back</Text>
            </Pressable>
            <Pressable
              onPress={() => refetch()}
              className="h-10 px-6 rounded-xl bg-phase-accent items-center justify-center"
            >
              <Text className="font-bold text-white">Retry</Text>
            </Pressable>
          </HStack>
        </VStack>
      </ScreenWrapper>
    );
  }

  const currentVis = collection.visibility;
  const visLabel =
    currentVis === 'public' ? '🌐 Public' : currentVis === 'shared' ? '👥 Shared' : '🔒 Private';

  return (
    <ScreenWrapper scroll={false}>
      {/* ── Edit Modal ──────────────────────────────────────────────────── */}
      {editModalOpen && (
        <Box
          className="absolute inset-0 z-50 bg-black/60 items-center justify-center"
          style={{ position: 'absolute' as any, top: 0, left: 0, right: 0, bottom: 0 }}
        >
          <Box className="mx-5 p-lg rounded-[24px] bg-phase-surface border border-phase-border w-full max-w-md">
            <HStack className="justify-between items-center mb-4">
              <Text className="text-lg font-extrabold text-phaseText-primary">Edit Collection</Text>
              <Pressable onPress={() => setEditModalOpen(false)}>
                <Icon as={X} size={20} color={colors.textSecondary} />
              </Pressable>
            </HStack>
            <VStack className="gap-3">
              <VStack className="gap-1.5">
                <Text className="text-xs font-bold text-phaseText-tertiary uppercase tracking-wider">
                  Name
                </Text>
                <TextInput
                  value={editName}
                  onChangeText={setEditName}
                  className="p-3 rounded-xl border border-phase-border bg-phase-surface/60 text-phaseText-primary"
                />
              </VStack>
              <VStack className="gap-1.5">
                <Text className="text-xs font-bold text-phaseText-tertiary uppercase tracking-wider">
                  Description
                </Text>
                <TextInput
                  value={editDesc}
                  onChangeText={setEditDesc}
                  multiline
                  numberOfLines={3}
                  className="p-3 rounded-xl border border-phase-border bg-phase-surface/60 text-phaseText-primary"
                />
              </VStack>
              <HStack className="gap-2.5 mt-1">
                <Pressable
                  onPress={() => setEditModalOpen(false)}
                  className="flex-1 h-11 rounded-xl border border-phase-border items-center justify-center"
                >
                  <Text className="font-bold text-phaseText-primary">Cancel</Text>
                </Pressable>
                <Pressable
                  onPress={handleSaveEdit}
                  disabled={isUpdating}
                  className="flex-1 h-11 rounded-xl bg-phase-accent items-center justify-center"
                >
                  <Text className="font-bold text-white">
                    {isUpdating ? 'Saving…' : 'Save'}
                  </Text>
                </Pressable>
              </HStack>
            </VStack>
          </Box>
        </Box>
      )}

      {/* ── Action Sheet ───────────────────────────────────────────────── */}
      {actionSheetOpen && (
        <Pressable
          onPress={() => setActionSheetOpen(false)}
          className="absolute inset-0 z-40 bg-black/50"
          style={{ position: 'absolute' as any, top: 0, left: 0, right: 0, bottom: 0 }}
        >
          <Box
            className="absolute bottom-0 left-0 right-0 bg-phase-surface rounded-t-[28px] border-t border-phase-border p-5"
            style={{ position: 'absolute' as any }}
          >
            <Pressable onPress={(e) => e.stopPropagation()}>
              <VStack className="gap-1">
                <Text className="text-base font-extrabold text-phaseText-primary mb-3">
                  Manage Collection
                </Text>

                {/* Edit */}
                <Pressable
                  onPress={openEdit}
                  className="flex-row items-center gap-3 p-3.5 rounded-xl bg-phase-surface/60"
                >
                  <Icon as={Edit2} size={18} color={colors.textPrimary} />
                  <Text className="font-semibold text-phaseText-primary">Edit name & description</Text>
                </Pressable>

                {/* Visibility options */}
                <Text className="text-xs font-bold text-phaseText-tertiary uppercase tracking-wider mt-3 mb-1 px-1">
                  Visibility
                </Text>
                {VISIBILITY_OPTIONS.map((opt) => {
                  const isActive = currentVis === opt.value;
                  return (
                    <Pressable
                      key={opt.value}
                      onPress={() => !isActive && handleChangeVisibility(opt.value)}
                      className="flex-row items-center gap-3 p-3.5 rounded-xl"
                      style={{ backgroundColor: isActive ? `${opt.color}18` : 'transparent' }}
                    >
                      <Icon as={opt.icon} size={18} color={isActive ? opt.color : colors.textSecondary} />
                      <Text
                        className="font-semibold flex-1"
                        style={{ color: isActive ? opt.color : colors.textPrimary }}
                      >
                        {opt.label}
                      </Text>
                      {isActive && (
                        <Box
                          className="px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: `${opt.color}22` }}
                        >
                          <Text style={{ color: opt.color, fontSize: 11, fontWeight: '800' }}>
                            Current
                          </Text>
                        </Box>
                      )}
                    </Pressable>
                  );
                })}

                {/* Delete */}
                <Pressable
                  onPress={handleDelete}
                  className="flex-row items-center gap-3 p-3.5 rounded-xl mt-2"
                  style={{ backgroundColor: 'rgba(220,60,60,0.08)' }}
                >
                  <Icon as={Trash2} size={18} color="#dc3c3c" />
                  <Text className="font-semibold" style={{ color: '#dc3c3c' }}>
                    {isDeleting ? 'Deleting…' : 'Delete collection'}
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => setActionSheetOpen(false)}
                  className="items-center p-3 mt-1"
                >
                  <Text className="font-bold text-phaseText-tertiary">Cancel</Text>
                </Pressable>
              </VStack>
            </Pressable>
          </Box>
        </Pressable>
      )}

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }}>
        {/* ── Header ────────────────────────────────────────────────────── */}
        <Box className="px-md pt-md">
          <HStack className="justify-between items-center">
            <Pressable
              onPress={() => safeBack('/library')}
              className="flex-row items-center gap-2 px-3.5 py-2.5 rounded-xl border border-phase-border bg-phase-surface/50 self-start"
            >
              <Icon as={ArrowLeft} size={16} color={colors.textPrimary} />
              <Text className="text-[13px] font-bold text-phaseText-primary">Back to Library</Text>
            </Pressable>

            {/* Owner ⋯ menu button */}
            {isOwner && !collection.is_virtual && (
              <Pressable
                onPress={() => setActionSheetOpen(true)}
                className="w-10 h-10 rounded-xl border border-phase-border bg-phase-surface/50 items-center justify-center"
              >
                <Icon as={MoreVertical} size={18} color={colors.textPrimary} />
              </Pressable>
            )}
          </HStack>
        </Box>

        <Box className="px-md pt-md">
          <Box className="p-lg rounded-[24px] bg-phase-surface border border-phase-border mb-lg shadow-sm">
            <HStack className="justify-between items-start mb-2">
              <Text className="text-[26px] font-extrabold text-phaseText-primary flex-1 mr-2">
                {collection.name}
              </Text>
              {!collection.is_virtual && (
                <Box
                  className="px-3 py-1 rounded-full self-start mt-1"
                  style={{
                    backgroundColor:
                      currentVis === 'public'
                        ? 'rgba(52,168,83,0.14)'
                        : currentVis === 'shared'
                          ? 'rgba(103,152,214,0.14)'
                          : 'rgba(232,140,48,0.14)',
                  }}
                >
                  <Text
                    className="text-[11px] font-black uppercase tracking-wider"
                    style={{
                      color:
                        currentVis === 'public'
                          ? '#34a853'
                          : currentVis === 'shared'
                            ? '#6798d6'
                            : '#e88c30',
                    }}
                  >
                    {visLabel}
                  </Text>
                </Box>
              )}
            </HStack>
            <Text className="text-sm leading-6 text-phaseText-secondary mb-3">
              {collection.description || 'Curated resources gathered into one place.'}
            </Text>
            <Text className="text-[12px] text-phaseText-secondary">
              {collection.resources.length} resources
              {collection.creator_name ? ` • Curated by ${collection.creator_name}` : ''}
            </Text>
          </Box>

          <VStack className="gap-3.5">
            {collection.resources.map((resource: any) => (
              <Box key={resource.id} className="relative">
                <LibraryThumbnailCard
                  title={resource.title}
                  type={resource.type}
                  subject={resource.subjects?.[0] || 'General'}
                  thumbnailUrl={
                    resource.media?.url ||
                    resource.thumbnail_url ||
                    (resource.type === 'video' || resource.type === 'movie_trailer'
                      ? getYoutubeThumbnail(resource.url)
                      : undefined)
                  }
                  endorsements={resource.endorsements}
                  verified={resource.verified}
                  onPress={() => handleOpenResource(resource)}
                />
                {isOwner && (
                  <Pressable
                    onPress={() => handleRemoveResource(resource.id)}
                    disabled={removingId === resource.id}
                    className="absolute top-2 right-2 flex-row items-center gap-1 px-2.5 py-1.5 rounded-lg"
                    style={{ backgroundColor: 'rgba(220,60,60,0.85)' }}
                  >
                    <Icon as={X} size={12} color="#fff" />
                    <Text className="text-[11px] font-bold" style={{ color: '#fff' }}>
                      {removingId === resource.id ? '…' : 'Remove'}
                    </Text>
                  </Pressable>
                )}
              </Box>
            ))}
          </VStack>

          {collection.resources.length === 0 && (
            <Box className="py-16 items-center">
              <Text className="text-phaseText-muted italic text-center">
                {isOwner
                  ? 'No resources yet. Add resources from the Library.'
                  : 'This collection has no resources yet.'}
              </Text>
            </Box>
          )}
        </Box>
      </ScrollView>
    </ScreenWrapper>
  );
}
