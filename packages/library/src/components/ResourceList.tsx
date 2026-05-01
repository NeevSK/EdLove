/**
 * RESOURCE LIST - Telegram-Style High-Density Resource List
 *
 * Refactored for Sanctuary Resonance.
 */
import { formatDuration, formatFileSize } from "@repo/core/lib";
import { useStore } from '@repo/core/logic';
import SanctuaryFlashList from '@repo/ui/components/SanctuaryFlashList';
import { Actionsheet, ActionsheetBackdrop, ActionsheetContent, ActionsheetDragIndicator, ActionsheetDragIndicatorWrapper, Box } from '@repo/ui/primitives';
import { HStack, Text, VStack } from '@repo/ui/primitives';
import { SanctuaryButton } from '@repo/ui/components/SanctuaryButton';
import { useTheme } from '@repo/ui/primitives';
import { Theme } from '@repo/ui/theme';
import { AlertTriangle, ArrowLeftRight, Play, X } from 'lucide-react-native';
import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { libraryAPI } from '../api/library';
import type { LibraryResource } from '../types';
import { LibraryThumbnailCard } from './LibraryThumbnailCard';
import { ResourceRow, resolveResourceDisplayType as resolveDisplayType, RESOURCE_TYPE_CONFIG as TYPE_CONFIG, } from './ResourceRow';
export interface ResourceListProps {
    resources: LibraryResource[];
    onOpenResource?: (resource: LibraryResource) => void;
    onOpenResourceOptions?: (resource: LibraryResource) => void;
    onPullToDesk?: (resource: LibraryResource) => void;
    ListHeaderComponent?: React.ReactElement | null;
    ListFooterComponent?: React.ReactElement | null;
    onEndReached?: () => void;
    refreshing?: boolean;
    onRefresh?: () => void;
    viewMode?: 'grid' | 'list';
}
export function ResourceList({ resources, onOpenResource, onOpenResourceOptions, onPullToDesk, ListHeaderComponent, ListFooterComponent, onEndReached, refreshing, onRefresh, viewMode = 'list', }: ResourceListProps) {
    const [flashPlayResource, setFlashPlayResource] = useState<LibraryResource | null>(null);
    const showToast = useStore((state) => state.showToast);
    const handleFlashPlay = useCallback((resource: LibraryResource) => {
        setFlashPlayResource(resource);
    }, []);
    const handleCloseFlashPlay = useCallback(() => {
        setFlashPlayResource(null);
    }, []);
    const handleReportBroken = useCallback(async (resourceId: string) => {
        try {
            await libraryAPI.reportBrokenLink(resourceId);
            showToast('Thank you. Our curators will check this link.', 'success');
            if (onRefresh)
                onRefresh();
        }
        catch (_err: any) {
            showToast('Failed to report link.', 'error');
        }
    }, [onRefresh, showToast]);
    const renderItem = useCallback(({ item }: {
        item: LibraryResource;
    }) => {
        if (viewMode === 'grid') {
            return (<Box className="m-1.5">
            <LibraryThumbnailCard resource={item} onPress={onOpenResource || (() => { })} onLongPress={onOpenResourceOptions}/>
          </Box>);
        }
        return (<ResourceRow resource={item} onOpen={() => onOpenResource?.(item)} onOpenAnotherWay={item.url ? () => onOpenResourceOptions?.(item) : undefined} onFlashPlay={() => handleFlashPlay(item)} onPullToDesk={onPullToDesk ? () => onPullToDesk(item) : undefined}/>);
    }, [onOpenResource, handleFlashPlay, onPullToDesk, viewMode, onOpenResourceOptions]);
    return (<Box className="flex-1">
      <SanctuaryFlashList data={resources} renderItem={renderItem} key={`resource-list-${viewMode}`} numColumns={viewMode === 'grid' ? 2 : 1} keyExtractor={(item: LibraryResource) => item.id} estimatedItemSize={viewMode === 'grid' ? 200 : Theme.listSizes.resourceRow} ListHeaderComponent={ListHeaderComponent} ListFooterComponent={ListFooterComponent} onEndReached={onEndReached} onEndReachedThreshold={0.5} refreshing={refreshing} onRefresh={onRefresh} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Theme.spacing.xl }}/>
      <FlashPlaySheet resource={flashPlayResource} onClose={handleCloseFlashPlay} onReportBroken={handleReportBroken} onOpenAnotherWay={onOpenResourceOptions
            ? () => {
                if (flashPlayResource)
                    onOpenResourceOptions(flashPlayResource);
            }
            : undefined} onOpenFull={() => {
            if (flashPlayResource)
                onOpenResource?.(flashPlayResource);
            handleCloseFlashPlay();
        }}/>
    </Box>);
}
// ============================================================================
// FLASH-PLAY BOTTOM SHEET
// ============================================================================
interface FlashPlaySheetProps {
    resource: LibraryResource | null;
    onClose: () => void;
    onOpenFull: () => void;
    onOpenAnotherWay?: () => void;
    onReportBroken: (id: string) => void;
}
function FlashPlaySheet({ resource, onClose, onOpenFull, onOpenAnotherWay, onReportBroken, }: FlashPlaySheetProps) {
    const _theme = useTheme();
    const [resonantIslands, setResonantIslands] = useState<any[]>([]);
    useEffect(() => {
        if (resource) {
            libraryAPI.getResonantKnowledge(resource.id).then(setResonantIslands);
        }
        else {
            setResonantIslands([]);
        }
    }, [resource]);
    if (!resource)
        return null;
    const displayType = resolveDisplayType(resource.type);
    const config = TYPE_CONFIG[displayType];
    const Icon = config.icon;
    const fileSize = formatFileSize(resource.media?.bytes);
    const duration = formatDuration(resource.media?.duration);
    const metaParts = [fileSize, duration, resource.difficulty].filter(Boolean).join(' \u00B7 ');
    return (<Actionsheet isOpen={!!resource} onClose={onClose}>
      <ActionsheetBackdrop />
      <ActionsheetContent className="bg-phase-surface">
        <ActionsheetDragIndicatorWrapper>
          <ActionsheetDragIndicator />
        </ActionsheetDragIndicatorWrapper>

        <VStack className="gap-6 p-6 w-full">
          <HStack className="gap-4 items-center">
            <Box className="w-14 h-14 rounded-xl items-center justify-center border" style={{
            backgroundColor: `${config.color}20`,
            borderColor: `${config.color}40`,
        }}>
              <Icon color={config.color} size={28}/>
              <Text className="text-[10px] font-bold" style={{ color: config.color }}>
                {config.label}
              </Text>
            </Box>

            <VStack className="flex-1">
              <Text className="text-phaseText-primary text-base font-bold" numberOfLines={2}>
                {resource.title}
              </Text>
              <Text className="text-phaseText-secondary text-sm">{resource.creator_name}</Text>
              {metaParts ? (<Text className="text-phaseText-tertiary text-xs">{metaParts}</Text>) : null}
            </VStack>
          </HStack>

          {resource.description ? (<Box className="bg-phase-surface-light p-4 rounded-xl">
              <Text className="text-phaseText-secondary text-sm leading-5" numberOfLines={3}>
                {resource.description}
              </Text>
            </Box>) : null}

          {resonantIslands.length > 0 && (<VStack className="gap-1">
              <Text className="text-phaseText-tertiary text-[10px] font-bold uppercase">
                Resonant Islands
              </Text>
              <HStack className="gap-2 flex-wrap">
                {resonantIslands.map((island) => (<Box key={island.id} className="px-2 py-1 rounded-lg bg-white/5 border border-white/10">
                    <Text className="text-white text-[10px]">{island.name}</Text>
                  </Box>))}
              </HStack>
            </VStack>)}

          <HStack className="gap-4">
            <Box className="flex-1">
              <SanctuaryButton onPress={onOpenFull} leftIcon={Play} isDisabled={resource.link_status === 'broken'}>
                {resource.link_status === 'broken' ? 'Broken Link' : 'Open Resonance'}
              </SanctuaryButton>
            </Box>

            {onOpenAnotherWay && resource.url && resource.link_status !== 'broken' && (<SanctuaryButton onPress={onOpenAnotherWay} variant="outline" leftIcon={ArrowLeftRight}>
                {''}
              </SanctuaryButton>)}

            {resource.link_status !== 'broken' && (<SanctuaryButton onPress={() => onReportBroken(resource.id)} variant="outline" leftIcon={AlertTriangle}>
                {''}
              </SanctuaryButton>)}

            <SanctuaryButton onPress={onClose} variant="outline" leftIcon={X}>
              {''}
            </SanctuaryButton>
          </HStack>
        </VStack>
      </ActionsheetContent>
    </Actionsheet>);
}
