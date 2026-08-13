import { supabaseClient as supabase } from '@repo/core/adapters/supabaseClient';
import { useStore } from '@repo/core/logic';
import { libraryAPI } from '@repo/library/api/library';
import { LibraryThumbnailCard } from '@repo/library/components/LibraryThumbnailCard';
import { LIBRARY_KEYS, useCollection } from '@repo/library/hooks/useLibrary';
import type { LibraryCollection, LibraryResource, ResourceVisibility } from '@repo/library/types';
import { buildLibraryExternalLinkOptions } from '@repo/library/utils/externalLinks';
import { buildLibraryResourceOpenParams } from '@repo/library/utils/resourceLinks';
import { SanctuaryButton } from '@repo/ui/components/SanctuaryButton';
import SanctuaryFlashList from '@repo/ui/components/SanctuaryFlashList';
import { WebScreenHeader } from '@repo/ui/components/WebScreenHeader.web';
import { ArrowLeft, Library, RefreshCw } from '@repo/ui/icons';
import { ActivityIndicator, Box, HStack, Text, useTheme, VStack } from '@repo/ui/primitives';
import { openExternalURL, showExternalLinkOptions } from '@repo/ui/utils';
import { safeBack } from '@repo/ui/utils/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  Edit2,
  Globe,
  Lock,
  ArrowLeft as LucideArrowLeft,
  Users as LucideUsers,
  Plus,
  Trash2,
  X,
} from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

// ─── Resource Search Results (inline picker for Add Resources panel) ──────────────────────
function ResourceSearchResults({
  search,
  existingResourceIds,
  addingId,
  onAdd,
}: {
  collectionId: string;
  search: string;
  existingResourceIds: string[];
  addingId: string | null;
  onAdd: (resourceId: string) => Promise<void>;
}) {
  const [results, setResults] = useState<LibraryResource[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const existingSet = useMemo(() => new Set(existingResourceIds), [existingResourceIds]);

  useEffect(() => {
    const q = search.trim();
    if (!q) {
      // Show recent resources when no search term
      setIsSearching(true);
      supabase
        .from('nodes')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20)
        .then(({ data }) => {
          setResults(data || []);
          setIsSearching(false);
        });
      return;
    }
    const timer = setTimeout(() => {
      setIsSearching(true);
      supabase
        .from('nodes')
        .select('*')
        .ilike('title', `%${q}%`)
        .limit(20)
        .then(({ data }) => {
          setResults(data || []);
          setIsSearching(false);
        });
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  if (isSearching) {
    return (
      <Text style={{ color: 'var(--ink-ghost)' as any, fontSize: 13, paddingVertical: 8 }}>
        Searching…
      </Text>
    );
  }
  if (!results.length) {
    return (
      <Text style={{ color: 'var(--ink-ghost)' as any, fontSize: 13, paddingVertical: 8 }}>
        No resources found.
      </Text>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        maxHeight: '320px',
        overflowY: 'auto',
      }}
    >
      {results.map((r) => {
        const alreadyAdded = existingSet.has(r.id!);
        return (
          <div
            key={r.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 12px',
              borderRadius: '10px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.07)',
              gap: '12px',
            }}
          >
            <span
              style={{
                fontSize: '13px',
                color: 'var(--ink)',
                flex: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {r.title}
            </span>
            <button
              disabled={alreadyAdded || addingId === r.id}
              onClick={() => onAdd(r.id!)}
              style={{
                padding: '4px 12px',
                borderRadius: '8px',
                border: 'none',
                background: alreadyAdded ? 'rgba(52,168,83,0.15)' : 'rgba(103,152,214,0.2)',
                color: alreadyAdded ? '#34a853' : '#6798d6',
                fontWeight: 700,
                fontSize: '11px',
                cursor: alreadyAdded ? 'default' : 'pointer',
                whiteSpace: 'nowrap',
                opacity: addingId === r.id ? 0.5 : 1,
              }}
            >
              {alreadyAdded ? '✓ Added' : addingId === r.id ? 'Adding…' : '+ Add'}
            </button>
          </div>
        );
      })}
    </div>
  );
}

function LoadingState() {
  return (
    <Box className="flex-1 items-center justify-center p-20 bg-phase-surface">
      <VStack className="items-center gap-4">
        <ActivityIndicator size="large" />
        <Text className="text-phaseText-tertiary animate-pulse font-medium">
          Restoring collection...
        </Text>
      </VStack>
    </Box>
  );
}

// ─── Visibility Badge ────────────────────────────────────────────────────────
function VisibilityBadge({ visibility }: { visibility: ResourceVisibility }) {
  const config = {
    private: { icon: Lock, label: 'Private', color: '#e88c30', bg: 'rgba(232,140,48,0.12)' },
    personal: { icon: Lock, label: 'Private', color: '#e88c30', bg: 'rgba(232,140,48,0.12)' },
    shared: { icon: LucideUsers, label: 'Shared', color: '#6798d6', bg: 'rgba(103,152,214,0.12)' },
    public: { icon: Globe, label: 'Public', color: '#34a853', bg: 'rgba(52,168,83,0.12)' },
    class: { icon: LucideUsers, label: 'Class', color: '#6798d6', bg: 'rgba(103,152,214,0.12)' },
    grade: { icon: LucideUsers, label: 'Grade', color: '#6798d6', bg: 'rgba(103,152,214,0.12)' },
    school: { icon: LucideUsers, label: 'School', color: '#6798d6', bg: 'rgba(103,152,214,0.12)' },
  };
  const c = config[visibility] ?? config.private;
  const Icon = c.icon;
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 12px',
        borderRadius: '999px',
        background: c.bg,
        border: `1px solid ${c.color}33`,
      }}
    >
      <Icon size={13} color={c.color} />
      <span style={{ fontSize: '12px', fontWeight: 700, color: c.color }}>{c.label}</span>
    </div>
  );
}

// ─── Owner Panel ─────────────────────────────────────────────────────────────
function OwnerPanel({
  collection,
  onVisibilityChange,
  onEdit,
  onDelete,
  onAddResources,
  isUpdating,
  isDeleting,
}: {
  collection: LibraryCollection;
  onVisibilityChange: (v: ResourceVisibility) => void;
  onEdit: () => void;
  onDelete: () => void;
  onAddResources: () => void;
  isUpdating: boolean;
  isDeleting: boolean;
}) {
  const vis = collection.visibility;
  const visOptions: { value: ResourceVisibility; label: string; icon: any; color: string }[] = [
    { value: 'private', label: 'Private', icon: Lock, color: '#e88c30' },
    { value: 'shared', label: 'Shared', icon: LucideUsers, color: '#6798d6' },
    { value: 'public', label: 'Public', icon: Globe, color: '#34a853' },
  ];

  return (
    <div
      style={{
        margin: '0 0 24px 0',
        padding: '16px 20px',
        borderRadius: '16px',
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
      }}
    >
      <VisibilityBadge visibility={vis} />

      <span
        style={{
          fontSize: '13px',
          color: 'var(--ink-ghost)',
          flex: 1,
          minWidth: '160px',
        }}
      >
        {vis === 'public'
          ? 'Visible to everyone'
          : vis === 'shared'
            ? 'Visible to school members'
            : 'Only visible to you'}
      </span>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {/* Visibility toggles */}
        {visOptions
          .filter((o) => o.value !== vis)
          .map((o) => {
            const Ic = o.icon;
            return (
              <button
                key={o.value}
                onClick={() => onVisibilityChange(o.value)}
                disabled={isUpdating}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '6px 12px',
                  borderRadius: '10px',
                  border: `1px solid ${o.color}55`,
                  background: `${o.color}14`,
                  color: o.color,
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  opacity: isUpdating ? 0.5 : 1,
                }}
              >
                <Ic size={12} color={o.color} />
                {`Make ${o.label}`}
              </button>
            );
          })}

        {/* Add Resources button */}
        <button
          onClick={onAddResources}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '6px 12px',
            borderRadius: '10px',
            border: '1px solid rgba(103,152,214,0.4)',
            background: 'rgba(103,152,214,0.1)',
            color: '#6798d6',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          <Plus size={12} color="#6798d6" />
          Add Resources
        </button>

        {/* Edit button */}
        <button
          onClick={onEdit}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '6px 12px',
            borderRadius: '10px',
            border: '1px solid rgba(255,255,255,0.12)',
            background: 'rgba(255,255,255,0.06)',
            color: 'var(--ink)',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          <Edit2 size={12} color="var(--ink)" />
          Edit
        </button>

        {/* Delete button */}
        <button
          onClick={onDelete}
          disabled={isDeleting}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '6px 12px',
            borderRadius: '10px',
            border: '1px solid rgba(220,60,60,0.3)',
            background: 'rgba(220,60,60,0.1)',
            color: '#dc3c3c',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            opacity: isDeleting ? 0.5 : 1,
          }}
        >
          <Trash2 size={12} color="#dc3c3c" />
          {isDeleting ? 'Deleting…' : 'Delete'}
        </button>
      </div>
    </div>
  );
}

// ─── Edit Modal ──────────────────────────────────────────────────────────────
function EditCollectionModal({
  collection,
  onClose,
  onSave,
  isSaving,
}: {
  collection: LibraryCollection;
  onClose: () => void;
  onSave: (name: string, description: string) => void;
  isSaving: boolean;
}) {
  const [name, setName] = useState(collection.name);
  const [desc, setDesc] = useState(collection.description);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: 'var(--surface)',
          borderRadius: '24px',
          padding: '28px',
          width: '100%',
          maxWidth: '480px',
          border: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--ink)' }}>
            Edit Collection
          </span>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--ink-ghost)',
            }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label
            style={{
              fontSize: '12px',
              fontWeight: 700,
              color: 'var(--ink-ghost)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            Collection Name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              padding: '10px 14px',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.12)',
              background: 'rgba(255,255,255,0.06)',
              color: 'var(--ink)',
              fontSize: '15px',
              outline: 'none',
            }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label
            style={{
              fontSize: '12px',
              fontWeight: 700,
              color: 'var(--ink-ghost)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            Description
          </label>
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            rows={3}
            style={{
              padding: '10px 14px',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.12)',
              background: 'rgba(255,255,255,0.06)',
              color: 'var(--ink)',
              fontSize: '14px',
              resize: 'vertical',
              outline: 'none',
              fontFamily: 'inherit',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '9px 18px',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.12)',
              background: 'rgba(255,255,255,0.06)',
              color: 'var(--ink)',
              fontWeight: 700,
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(name.trim(), desc.trim())}
            disabled={isSaving || !name.trim()}
            style={{
              padding: '9px 20px',
              borderRadius: '12px',
              border: 'none',
              background: 'var(--action)',
              color: '#fff',
              fontWeight: 800,
              fontSize: '14px',
              cursor: 'pointer',
              opacity: isSaving || !name.trim() ? 0.5 : 1,
            }}
          >
            {isSaving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────
/**
 * CollectionDetailScreenWeb  Web-optimized view for library collections.
 * Sanctuary V3: Owner management panel + privacy controls.
 */
export default function CollectionDetailScreenWeb() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { user } = useStore();
  const theme = useTheme();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { collection, isLoading, error, refetch } = useCollection(id, user?.id);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [isAddResourcesOpen, setIsAddResourcesOpen] = useState(false);
  const [resourceSearch, setResourceSearch] = useState('');
  const [addingResourceId, setAddingResourceId] = useState<string | null>(null);

  const isOwner = !!user?.id && !!collection?.creator_id && collection.creator_id === user.id;

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleVisibilityChange = useCallback(
    async (visibility: ResourceVisibility) => {
      if (!collection) return;
      setIsUpdating(true);
      try {
        await libraryAPI.updateCollection(collection.id, { visibility } as any);
        queryClient.invalidateQueries({ queryKey: LIBRARY_KEYS.collectionsAll() });
        queryClient.invalidateQueries({ queryKey: LIBRARY_KEYS.collection(collection.id) });
      } catch (e) {
        console.error('Failed to update visibility', e);
      } finally {
        setIsUpdating(false);
      }
    },
    [collection, queryClient],
  );

  const handleSaveEdit = useCallback(
    async (name: string, description: string) => {
      if (!collection) return;
      setIsUpdating(true);
      try {
        await libraryAPI.updateCollection(collection.id, { name, description } as any);
        queryClient.invalidateQueries({ queryKey: LIBRARY_KEYS.collectionsAll() });
        queryClient.invalidateQueries({ queryKey: LIBRARY_KEYS.collection(collection.id) });
        setIsEditModalOpen(false);
      } catch (e) {
        console.error('Failed to update collection', e);
      } finally {
        setIsUpdating(false);
      }
    },
    [collection, queryClient],
  );

  const handleDelete = useCallback(async () => {
    if (!collection) return;
    const confirmed = window.confirm(`Delete "${collection.name}"? This cannot be undone.`);
    if (!confirmed) return;
    setIsDeleting(true);
    try {
      await libraryAPI.deleteCollection(collection.id);
      queryClient.invalidateQueries({ queryKey: LIBRARY_KEYS.collectionsAll() });
      router.replace('/library');
    } catch (e) {
      console.error('Failed to delete collection', e);
      setIsDeleting(false);
    }
  }, [collection, queryClient, router]);

  const handleRemoveResource = useCallback(
    async (resourceId: string) => {
      if (!collection) return;
      setRemovingId(resourceId);
      try {
        await libraryAPI.removeFromCollection(collection.id, resourceId);
        queryClient.invalidateQueries({ queryKey: LIBRARY_KEYS.collection(collection.id) });
      } catch (e) {
        console.error('Failed to remove resource', e);
      } finally {
        setRemovingId(null);
      }
    },
    [collection, queryClient],
  );

  const handleOpenResource = useCallback(
    (resource: LibraryResource) => {
      if (!resource.url) return;
      if (resource.type === 'pdf') {
        router.push({
          pathname: '/library/document/[resourceId]',
          params: buildLibraryResourceOpenParams(resource),
        });
        return;
      }
      if (resource.type === 'video' || resource.type === 'movie_trailer') {
        router.push({
          pathname: '/library/video/[resourceId]',
          params: buildLibraryResourceOpenParams(resource),
        });
        return;
      }
      openExternalURL(resource.url, buildLibraryExternalLinkOptions(resource, 'Collection')).catch(
        (err: any) => console.error("Couldn't load page", err),
      );
    },
    [router],
  );

  const handleOpenResourceOptions = useCallback((resource: LibraryResource) => {
    if (
      !resource.url ||
      resource.type === 'pdf' ||
      resource.type === 'video' ||
      resource.type === 'movie_trailer'
    ) {
      return;
    }
    showExternalLinkOptions(
      resource.url,
      buildLibraryExternalLinkOptions(resource, 'Collection'),
    ).catch((err: any) => console.error("Couldn't show external link options", err));
  }, []);

  const renderResource = useCallback(
    ({ item }: { item: LibraryResource }) => (
      <Box className="p-3">
        <div style={{ position: 'relative' }}>
          <LibraryThumbnailCard
            resource={item}
            onPress={handleOpenResource}
            onLongPress={handleOpenResourceOptions}
          />
          {isOwner && (
            <button
              onClick={() => handleRemoveResource(item.id)}
              disabled={removingId === item.id}
              style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                background: 'rgba(220,60,60,0.88)',
                border: 'none',
                borderRadius: '8px',
                padding: '4px 8px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                color: '#fff',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                opacity: removingId === item.id ? 0.5 : 1,
              }}
            >
              <X size={11} color="#fff" />
              {removingId === item.id ? '…' : 'Remove'}
            </button>
          )}
        </div>
      </Box>
    ),
    [handleOpenResource, handleOpenResourceOptions, handleRemoveResource, isOwner, removingId],
  );

  // ── Render ─────────────────────────────────────────────────────────────────
  if (isLoading || !id) return <LoadingState />;

  if (error || !collection) {
    return (
      <Box className="flex-1 bg-phase-surface items-center justify-center p-10">
        <VStack className="max-w-md w-full p-10 rounded-[32px] bg-white/5 border border-white/10 items-center gap-6">
          <Box className="w-16 h-16 rounded-2xl bg-phase-accent/20 items-center justify-center">
            <Library size={32} color={theme.accent.action} />
          </Box>
          <VStack className="items-center gap-2">
            <Text className="text-xl font-bold text-phaseText-primary text-center">
              {error ? t('library.errorLoading') : t('library.emptyTitle')}
            </Text>
            <Text className="text-md text-phaseText-secondary text-center leading-6">
              {error ? String(error) : t('library.emptyDesc')}
            </Text>
          </VStack>
          <HStack className="gap-3 w-full">
            <SanctuaryButton
              variant="outline"
              onPress={() => safeBack('/library')}
              leftIcon={ArrowLeft}
              className="flex-1"
            >
              {t('library.goBack')}
            </SanctuaryButton>
            <SanctuaryButton onPress={() => refetch()} leftIcon={RefreshCw} className="flex-1">
              {t('library.retry') || 'Retry'}
            </SanctuaryButton>
          </HStack>
        </VStack>
      </Box>
    );
  }

  return (
    <Box className="flex-1 bg-phase-surface">
      {isEditModalOpen && (
        <EditCollectionModal
          collection={collection}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleSaveEdit}
          isSaving={isUpdating}
        />
      )}

      <VStack className="max-w-screen-xl mx-auto w-full px-6 py-8">
        <WebScreenHeader
          title={collection.name}
          note={
            collection.is_virtual ? t('library.dynamicCollection') : t('library.curatedCollection')
          }
          actions={
            <SanctuaryButton
              variant="ghost"
              onPress={() => safeBack('/library')}
              leftIcon={ArrowLeft}
              size="sm"
            >
              {t('library.backToLibrary')}
            </SanctuaryButton>
          }
        />

        {/* Owner management panel */}
        {isOwner && !collection.is_virtual && (
          <OwnerPanel
            collection={collection}
            onVisibilityChange={handleVisibilityChange}
            onEdit={() => setIsEditModalOpen(true)}
            onDelete={handleDelete}
            onAddResources={() => setIsAddResourcesOpen(true)}
            isUpdating={isUpdating}
            isDeleting={isDeleting}
          />
        )}

        {/* Add Resources Panel */}
        {isOwner && isAddResourcesOpen && (
          <div
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '18px',
              padding: '20px',
              marginBottom: '16px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '14px',
              }}
            >
              <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--ink)' }}>
                Add Resources
              </span>
              <button
                onClick={() => setIsAddResourcesOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--ink-ghost)',
                }}
              >
                <X size={18} />
              </button>
            </div>
            <input
              type="text"
              placeholder="Search resources by title..."
              value={resourceSearch}
              onChange={(e) => setResourceSearch((e.target as HTMLInputElement).value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '10px',
                border: '1px solid rgba(255,255,255,0.12)',
                background: 'rgba(255,255,255,0.06)',
                color: 'var(--ink)',
                fontSize: '14px',
                outline: 'none',
                marginBottom: '12px',
                boxSizing: 'border-box',
              }}
            />
            <ResourceSearchResults
              collectionId={collection.id}
              search={resourceSearch}
              existingResourceIds={collection.resource_ids || []}
              addingId={addingResourceId}
              onAdd={async (resourceId) => {
                setAddingResourceId(resourceId);
                try {
                  await libraryAPI.addToCollection(collection.id, resourceId);
                  queryClient.invalidateQueries({ queryKey: LIBRARY_KEYS.collectionsAll() });
                  queryClient.invalidateQueries({
                    queryKey: LIBRARY_KEYS.collection(collection.id),
                  });
                } catch (e) {
                  console.error('Failed to add resource', e);
                } finally {
                  setAddingResourceId(null);
                }
              }}
            />
          </div>
        )}

        <Box className="mt-4 mb-10 p-8 rounded-3xl bg-white/5 border border-white/5">
          <Text className="text-lg text-phaseText-primary leading-8 mb-6 font-medium">
            {collection.description || t('library.noDescription')}
          </Text>
          <HStack className="items-center gap-6">
            <Box className="px-4 py-1.5 rounded-full bg-phase-accent/10 border border-phase-accent/20">
              <Text className="text-xs font-black text-phase-accent uppercase tracking-wider">
                {t('library.resourcesCount', {
                  count: collection.resources.length,
                })}
              </Text>
            </Box>
            {collection.creator_name && (
              <HStack className="gap-1.5 items-center">
                <Text className="text-sm text-phaseText-tertiary">{t('library.curatedBy')}</Text>
                <Text className="text-sm font-bold text-phaseText-secondary">
                  {collection.creator_name}
                </Text>
              </HStack>
            )}
            <Box className="w-1 h-1 rounded-full bg-white/20" />
            <Text className="text-sm text-phaseText-tertiary">
              {collection.is_virtual ? t('library.dynamic') : t('library.collection')}
            </Text>
            {!collection.is_virtual && (
              <>
                <Box className="w-1 h-1 rounded-full bg-white/20" />
                <VisibilityBadge visibility={collection.visibility} />
              </>
            )}
          </HStack>
        </Box>

        <SanctuaryFlashList
          data={collection.resources}
          renderItem={renderResource}
          keyExtractor={(item: LibraryResource) => item.id}
          numColumns={4}
          contentContainerStyle={{ paddingBottom: 80 }}
          ListEmptyComponent={
            <Box className="py-20 items-center">
              <Text className="text-phaseText-muted italic">
                {isOwner
                  ? 'No resources yet — add resources from the Library and use the bookmark/add action.'
                  : t('library.emptyCollection')}
              </Text>
            </Box>
          }
        />
      </VStack>
    </Box>
  );
}
