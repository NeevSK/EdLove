import {
  getDomainFeatureRegistry,
  type MobileDomainRegistry,
  type MobileFeatureItem,
} from '@/navigation/registries';
import { useActiveSubTabsStore } from '@repo/core/store/useActiveSubTabsStore';
import { usePerspectiveStore } from '@repo/core/store/usePerspectiveStore';
import { ChevronRight, Plus, Search, Sparkles, X } from '@repo/ui/icons';
import {
  Box,
  HStack,
  Modal,
  ModalContent,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  VStack,
} from '@repo/ui/primitives';
import { tokens } from '@repo/ui/tokens';
import { hapticLight, hapticSuccess } from '@repo/ui/utils/haptics';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';

export interface TabFeatureCatalogSheetProps {
  isOpen: boolean;
  onClose: () => void;
  activeTabKey: 'self' | 'workspace' | 'library' | 'community' | 'profile';
}

/**
 * TabFeatureCatalogSheet: Dynamic, role-aware feature catalog for mobile domains.
 *
 * Accessible via long-pressing any bottom tab or tapping the '+' button on the
 * ActiveSubTabStrip. Opens items directly into active sub-tabs by default.
 */
export const TabFeatureCatalogSheet: React.FC<TabFeatureCatalogSheetProps> = ({
  isOpen,
  onClose,
  activeTabKey,
}) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const activePerspective = usePerspectiveStore((s) => s.activePerspective);
  const openTab = useActiveSubTabsStore((s) => s.openTab);
  const preferences = useActiveSubTabsStore((s) => s.preferences);

  // Derive role capacity from perspective
  const capacity = useMemo(() => {
    if (!activePerspective) return null;
    if (activePerspective.kind === 'institutional') return activePerspective.capacity;
    if (activePerspective.kind === 'guardian') return 'guardian';
    if (activePerspective.kind === 'commercial') return activePerspective.role;
    return 'personal';
  }, [activePerspective]);

  // Resolve dynamic registry for active domain and capacity
  const registry: MobileDomainRegistry = useMemo(() => {
    return getDomainFeatureRegistry(activeTabKey, capacity);
  }, [activeTabKey, capacity]);

  // Filter items based on search query
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return registry.items;
    const query = searchQuery.toLowerCase();
    return registry.items.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query),
    );
  }, [registry.items, searchQuery]);

  // Primary action: Default is to open into active sub-tab and navigate
  const handleSelectFeature = (item: MobileFeatureItem) => {
    hapticSuccess();

    if (preferences.catalogDefaultAction === 'open_in_subtab') {
      openTab({
        id: item.id,
        title: item.title,
        route: item.route,
        params: item.params,
        domain: activeTabKey,
      });
    }

    onClose();

    router.push({
      pathname: item.route,
      params: item.params,
    } as Parameters<typeof router.push>[0]);
  };

  // Secondary action: Explicitly pin to sub-tab without immediate navigation
  const handlePinSubTabOnly = (item: MobileFeatureItem, e: unknown) => {
    if (
      e &&
      typeof e === 'object' &&
      'stopPropagation' in e &&
      typeof (e as { stopPropagation: () => void }).stopPropagation === 'function'
    ) {
      (e as { stopPropagation: () => void }).stopPropagation();
    }
    hapticLight();
    openTab({
      id: item.id,
      title: item.title,
      route: item.route,
      params: item.params,
      domain: activeTabKey,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent
        style={{
          maxHeight: '84%',
          borderTopLeftRadius: tokens.radii.lg,
          borderTopRightRadius: tokens.radii.lg,
          backgroundColor: tokens.semantic.surface.canvas,
          padding: 0,
        }}
      >
        <VStack style={{ flex: 1 }}>
          {/* Header Bar */}
          <Box
            style={{
              paddingHorizontal: tokens.spacing.lg,
              paddingTop: tokens.spacing.md,
              paddingBottom: tokens.spacing.sm,
              borderBottomWidth: 1,
              borderBottomColor: tokens.semantic.border.subtle,
            }}
          >
            {/* Grabber indicator */}
            <Box
              style={{
                width: 36,
                height: 4,
                borderRadius: 2,
                backgroundColor: tokens.semantic.border.subtle,
                alignSelf: 'center',
                marginBottom: tokens.spacing.sm,
              }}
            />

            <HStack style={{ alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <VStack style={{ flex: 1, gap: 2 }}>
                <HStack style={{ alignItems: 'center', gap: 6 }}>
                  <Text
                    style={{
                      fontSize: tokens.typography.sizes.lg,
                      fontWeight: '800',
                      color: tokens.semantic.text.primary,
                      letterSpacing: -0.3,
                    }}
                  >
                    {registry.title}
                  </Text>
                  {registry.roleBadge ? (
                    <Box
                      style={{
                        backgroundColor: tokens.semantic.surface.interactive,
                        paddingHorizontal: 8,
                        paddingVertical: 2,
                        borderRadius: tokens.radii.full,
                        borderWidth: 1,
                        borderColor: tokens.semantic.border.subtle,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: tokens.typography.sizes.xs,
                          fontWeight: '700',
                          color: tokens.colors.primary,
                        }}
                      >
                        {registry.roleBadge}
                      </Text>
                    </Box>
                  ) : null}
                </HStack>
                <Text
                  style={{
                    fontSize: tokens.typography.sizes.xs,
                    color: tokens.semantic.text.secondary,
                    fontWeight: '500',
                  }}
                >
                  {registry.subtitle}
                </Text>
              </VStack>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close feature catalog"
                onPress={() => {
                  hapticLight();
                  onClose();
                }}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: tokens.semantic.surface.interactive,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={16} color={tokens.semantic.text.primary} />
              </Pressable>
            </HStack>

            {/* Quick Search */}
            <Box
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: tokens.semantic.surface.elevated,
                borderRadius: tokens.radii.lg,
                borderWidth: 1,
                borderColor: tokens.semantic.border.subtle,
                paddingHorizontal: tokens.spacing.sm,
                paddingVertical: 6,
                marginTop: tokens.spacing.sm,
                gap: tokens.spacing.xs,
              }}
            >
              <Search size={14} color={tokens.semantic.text.muted} />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search rooms, tools & actions..."
                placeholderTextColor={tokens.semantic.text.muted}
                style={{
                  flex: 1,
                  fontSize: tokens.typography.sizes.xs,
                  color: tokens.semantic.text.primary,
                  padding: 0,
                }}
              />
              {searchQuery ? (
                <Pressable onPress={() => setSearchQuery('')}>
                  <X size={12} color={tokens.semantic.text.secondary} />
                </Pressable>
              ) : null}
            </Box>
          </Box>

          {/* Catalog Items List */}
          <ScrollView
            contentContainerStyle={{
              padding: tokens.spacing.md,
              gap: tokens.spacing.sm,
            }}
            showsVerticalScrollIndicator={false}
          >
            {filteredItems.map((item) => {
              const IconComponent = item.icon || Sparkles;
              return (
                <Pressable
                  key={item.id}
                  accessibilityRole="button"
                  accessibilityLabel={`Open ${item.title}`}
                  accessibilityHint={item.description}
                  onPress={() => handleSelectFeature(item)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: tokens.semantic.surface.elevated,
                    borderRadius: tokens.radii.lg,
                    padding: tokens.spacing.md,
                    borderWidth: 1,
                    borderColor: tokens.semantic.border.subtle,
                    gap: tokens.spacing.md,
                  }}
                >
                  {/* Icon Avatar */}
                  <Box
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: tokens.radii.md,
                      backgroundColor: tokens.semantic.surface.interactive,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <IconComponent size={20} color={tokens.colors.primary} />
                  </Box>

                  {/* Title & Description */}
                  <VStack style={{ flex: 1, gap: 2 }}>
                    <HStack style={{ alignItems: 'center', gap: 6 }}>
                      <Text
                        style={{
                          fontSize: tokens.typography.sizes.sm,
                          fontWeight: '700',
                          color: tokens.semantic.text.primary,
                        }}
                      >
                        {item.title}
                      </Text>
                      {item.badge ? (
                        <Box
                          style={{
                            backgroundColor: tokens.semantic.surface.interactive,
                            paddingHorizontal: 6,
                            paddingVertical: 1,
                            borderRadius: 4,
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 9,
                              fontWeight: '700',
                              color: tokens.semantic.text.secondary,
                            }}
                          >
                            {item.badge}
                          </Text>
                        </Box>
                      ) : null}
                    </HStack>

                    <Text
                      style={{
                        fontSize: tokens.typography.sizes.xs,
                        color: tokens.semantic.text.secondary,
                        lineHeight: 16,
                      }}
                      numberOfLines={2}
                    >
                      {item.description}
                    </Text>
                  </VStack>

                  {/* Actions: Pin to sub-tab + Chevron */}
                  <HStack style={{ alignItems: 'center', gap: 6 }}>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Pin ${item.title} to active tasks`}
                      onPress={(e) => handlePinSubTabOnly(item, e)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 14,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: tokens.semantic.surface.interactive,
                      }}
                    >
                      <Plus size={14} color={tokens.semantic.text.secondary} />
                    </Pressable>

                    <ChevronRight size={16} color={tokens.semantic.text.muted} />
                  </HStack>
                </Pressable>
              );
            })}

            {filteredItems.length === 0 ? (
              <Box style={{ padding: tokens.spacing.xl, alignItems: 'center' }}>
                <Text
                  style={{
                    fontSize: tokens.typography.sizes.sm,
                    color: tokens.semantic.text.secondary,
                  }}
                >
                  No matching features found.
                </Text>
              </Box>
            ) : null}
          </ScrollView>
        </VStack>
      </ModalContent>
    </Modal>
  );
};
