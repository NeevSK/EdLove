/**
 * LibraryScreen \u2014 Netflix-Style Holistic Digital Library
 */
import { useNavigation } from "@react-navigation/native";
import { identityAPI } from "@repo/core/api";
import { useTracking } from "@repo/core/hooks";
import { FeatureGuard, useStore } from "@repo/core/logic";
import { FadeInDown, GlobalHeader, ScreenWrapper } from "@repo/ui";
import {
	HorizontalChipRow,
	SkeletonCard,
	useBottomTabPadding,
} from "@repo/ui/components";
import { SmartShelf } from "@repo/ui/components/SmartShelf";
import { useRegisterFAB } from "@repo/ui/context/FABContext";
import { useThemedColors } from "@repo/ui/hooks";
import { Box, HStack, Text, VStack } from "@repo/ui/primitives";
import { Theme } from "@repo/ui/theme";
import { openExternalURL, showExternalLinkOptions } from "@repo/ui/utils";
import { LinearGradient } from "expo-linear-gradient";
import {
	FileText,
	Layers,
	LayoutGrid,
	Library,
	List,
	Map as MapIcon,
	Play,
	Plus,
} from "lucide-react-native";
import React, { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
	ActivityIndicator,
	ImageBackground,
	Pressable,
	ScrollView,
	Share,
	StyleSheet,
	TouchableOpacity,
} from "react-native";
import Animated from "react-native-reanimated";
import { libraryAPI } from "../api/library";
import AddCollectionModal from "../components/AddCollectionModal";
import AddResourceModal from "../components/AddResourceModal";
import { CollectionCard } from "../components/CollectionCard";
import { CollectionPickerModal } from "../components/CollectionPickerModal";
import { LibraryThumbnailCard } from "../components/LibraryThumbnailCard";
import { ResourceActionSheet } from "../components/ResourceActionSheet";
import { ResourceList } from "../components/ResourceList";
import { getOrderedShelfDefs } from "../constants/shelf";
import { useBookmarkedResources, useLibrary } from "../hooks/useLibrary";
import type { LibraryResource } from "../types";
import { buildLibraryExternalLinkOptions } from "../utils/externalLinks";

const LIBRARY_UI_CATEGORIES = [
	{ id: "All", en: "All" },
	{ id: "video", en: "Videos" },
	{ id: "pdf", en: "Documents" },
	{ id: "link", en: "Web Resources" },
	{ id: "text", en: "Articles" },
	{ id: "note", en: "Personal Notes" },
];
function MapInvitation({ onPress }: { onPress: () => void }) {
	const colors = useThemedColors();
	return (
		<Animated.View entering={FadeInDown.delay(200).springify()}>
			<Pressable onPress={onPress}>
				<Box
					className="m-4 rounded-3xl overflow-hidden border"
					style={{
						backgroundColor: colors.secondary,
						borderColor: colors.border,
					}}
				>
					<LinearGradient
						colors={[`${Theme.colors.gurudeviViolet}26`, "transparent"]}
						start={{ x: 0, y: 0 }}
						end={{ x: 1, y: 1 }}
						style={StyleSheet.absoluteFill}
					/>
					<HStack className="p-5 gap-4 items-center">
						<Box
							className="w-[60px] h-[60px] rounded-full justify-center items-center"
							style={{ backgroundColor: colors.overlay }}
						>
							<MapIcon size={32} color={Theme.colors.sanctuarySaffron} />
						</Box>
						<VStack className="flex-1 gap-1">
							<Text
								className="text-lg font-extrabold"
								style={{ color: colors.textPrimary }}
							>
								Enter the Cosmos
							</Text>
							<Text
								className="text-[13px] leading-[18px]"
								style={{ color: colors.textSecondary }}
							>
								Explore the hidden connections between knowledge and shared
								wisdom.
							</Text>
						</VStack>
						<Box
							className="p-2.5 rounded-xl"
							style={{ backgroundColor: colors.overlay }}
						>
							<Play
								size={16}
								color={colors.textPrimary}
								fill={colors.textPrimary}
							/>
						</Box>
					</HStack>
				</Box>
			</Pressable>
		</Animated.View>
	);
}
function CuratorInvitation({ onPress }: { onPress: () => void }) {
	const colors = useThemedColors();
	return (
		<Animated.View entering={FadeInDown.delay(300).springify()}>
			<Pressable onPress={onPress}>
				<Box
					className="m-4 mt-0 rounded-3xl overflow-hidden border"
					style={{
						backgroundColor: colors.secondary,
						borderColor: `${Theme.colors.sanctuarySaffron}33`,
					}}
				>
					<HStack className="p-4 gap-4 items-center">
						<Box
							className="w-12 h-12 rounded-full justify-center items-center"
							style={{ backgroundColor: `${Theme.colors.sanctuarySaffron}11` }}
						>
							<FileText size={24} color={Theme.colors.sanctuarySaffron} />
						</Box>
						<VStack className="flex-1 gap-0.5">
							<Text
								className="text-base font-extrabold"
								style={{ color: colors.textPrimary }}
							>
								Curator Dashboard
							</Text>
							<Text className="text-xs" style={{ color: colors.textSecondary }}>
								Review {"&"} publish new knowledge streams.
							</Text>
						</VStack>
						<Plus size={16} color={colors.textSecondary} />
					</HStack>
				</Box>
			</Pressable>
		</Animated.View>
	);
}
export default function LibraryScreen() {
	const { t } = useTranslation();
	const navigation = useNavigation<any>();
	const [searchQuery, setSearchQuery] = useState("");
	const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
	const [selectedCategoryId, setSelectedCategoryId] = useState("All");
	const [selectedSort, setSelectedSort] = useState<
		"recent" | "popular" | "most_endorsed" | "most_bookmarked"
	>("recent");
	const [viewMode, setViewMode] = useState<"shelf" | "grid" | "list">("shelf");
	const [isAddModalOpen, setIsAddModalOpen] = useState(false);
	const [isAddCollectionModalOpen, setIsAddCollectionModalOpen] =
		useState(false);
	const [refreshing, setRefreshing] = useState(false);
	const [isSyncing, setIsSyncing] = useState(false);
	const [fallbackAttempted, setFallbackAttempted] = useState(false);
	const isFetchingPublicRef = React.useRef(false);
	// Resource Actions State
	const [selectedResource, setSelectedResource] =
		useState<LibraryResource | null>(null);
	const [isActionSheetVisible, setIsActionSheetVisible] = useState(false);
	const [isCollectionPickerVisible, setIsCollectionPickerVisible] =
		useState(false);
	// Search Debouncing
	React.useEffect(() => {
		const handler = setTimeout(() => {
			setDebouncedSearchQuery(searchQuery);
		}, 500);
		return () => clearTimeout(handler);
	}, [searchQuery]);
	const colors = useThemedColors();
	const bottomPadding = useBottomTabPadding();
	const { discoverFeature } = useTracking();
	const isSearchMode =
		searchQuery.trim().length > 0 || selectedCategoryId !== "All";
	const resourceTypeFilter = useMemo(() => {
		if (selectedCategoryId === "All") return undefined;
		return selectedCategoryId as any;
	}, [selectedCategoryId]);
	const libraryFilters = useMemo(
		() =>
			isSearchMode
				? {
						type: resourceTypeFilter,
						search: debouncedSearchQuery || undefined,
						sort_by: selectedSort,
						limit: 60,
					}
				: { limit: 60 },
		[isSearchMode, resourceTypeFilter, debouncedSearchQuery, selectedSort],
	);
	const { deskItems, user } = useStore();
	const orientationSeeds = user?.orientation_seeds ?? null;
	const orderedShelfDefs = useMemo(
		() => getOrderedShelfDefs(orientationSeeds),
		[orientationSeeds],
	);
	const {
		resources: rawResources,
		collections: rawUserCollections,
		loading,
		error: libraryError,
		fetchResources,
		fetchNextResources,
		hasNextResources,
		isFetchingNextResources,
		syncLibrary,
		bookmarkResource,
		addToCollection,
		isAddingToCollection,
	} = useLibrary(libraryFilters, libraryFilters);
	// Get Bookmarks
	const {
		resources: bookmarkedResources,
		isLoading: loadingBookmarks,
		refetch: refetchBookmarks,
	} = useBookmarkedResources(user?.id);
	const [publicCollections, setPublicCollections] = useState<any[]>([]);
	const [isFetchingPublic, setIsFetchingPublic] = useState(false);
	React.useEffect(() => {
		discoverFeature("section_library");
		setIsSyncing(true);
		syncLibrary()
			.catch((err) => console.error("Library sync failed:", err))
			.finally(() => setIsSyncing(false));
	}, [syncLibrary, discoverFeature]);
	React.useEffect(() => {
		if (
			!loading &&
			rawResources.length === 0 &&
			rawUserCollections.length === 0 &&
			publicCollections.length === 0 &&
			!fallbackAttempted &&
			!isFetchingPublicRef.current
		) {
			isFetchingPublicRef.current = true;
			setIsFetchingPublic(true);
			libraryAPI
				.getCollections({ limit: 10, visibility: "public" })
				.then((cols) => {
					setPublicCollections(cols);
					setFallbackAttempted(true);
				})
				.catch((_err) => {
					setFallbackAttempted(true);
				})
				.finally(() => {
					setIsFetchingPublic(false);
					isFetchingPublicRef.current = false;
				});
		}
	}, [
		loading,
		rawResources.length,
		rawUserCollections.length,
		publicCollections.length,
		fallbackAttempted,
	]);
	const resources = useMemo(() => rawResources, [rawResources]);
	const collections = useMemo(
		() =>
			rawUserCollections.length > 0 ? rawUserCollections : publicCollections,
		[rawUserCollections, publicCollections],
	);
	const trending = useMemo(() = [...resources].sort((a, b) => (b.endorsements ?? 0) - (a.endorsements ?? 0)).slice(0, 10), []);
	const newArrivals = useMemo(() = [...resources].sort((a, b) = new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()).slice(0, 10), []);
	const heroResource = trending[0] ?? newArrivals[0] ?? null;
	// (moved up)
	const handleOpenResource = useCallback(
		(resource: LibraryResource) => {
			if (!resource.url) return;
			if (resource.type === "pdf") {
				navigation.navigate("PDFViewer", {
					resourceId: resource.id,
					title: resource.title,
					url: resource.url,
				});
				return;
			}
			if (resource.type === "video" || resource.type === "movie_trailer") {
				navigation.navigate("VideoPlayer", {
					resourceId: resource.id,
					title: resource.title,
					url: resource.url,
					creator: resource.creator_name,
				});
				return;
			}
			openExternalURL(
				resource.url,
				buildLibraryExternalLinkOptions(resource),
			).catch((err) => console.error("Couldn't load page", err));
		},
		[navigation],
	);
	const handleOpenResourceOptions = useCallback((resource: LibraryResource) => {
		if (
			!resource.url ||
			resource.type === "pdf" ||
			resource.type === "video" ||
			resource.type === "movie_trailer"
		) {
			return;
		}
		showExternalLinkOptions(
			resource.url,
			buildLibraryExternalLinkOptions(resource),
		).catch((err = console.error("Couldn't show external link options", err)));
	}, []);
	const handleAddResource = useCallback(async () => {
		try {
			await fetchResources();
			await refetchBookmarks();
		} catch (err) {
			console.error("Failed to refresh after add", err);
		}
	}, [fetchResources, refetchBookmarks]);
	const handleBookmark = useCallback(
		async (resource: LibraryResource) => {
			if (!user?.id) return;
			try {
				await bookmarkResource({ resourceId: resource.id, userId: user.id });
				await refetchBookmarks();
			} catch (err) {
				console.error("Failed to bookmark:", err);
			}
		},
		[user?.id, bookmarkResource, refetchBookmarks],
	);
	const handleShare = useCallback(async (resource: LibraryResource) => {
		if (!resource.url) return;
		try {
			await Share.share({
				message: `Check out this resource on Polymath: ${resource.title}\n${resource.url}`,
				url: resource.url,
				title: resource.title,
			});
		} catch (err) {
			console.error("Failed to share:", err);
		}
	}, []);
	const handleAddToCollection = useCallback(
		async (collectionId: string) => {
			if (!selectedResource) return;
			try {
				await addToCollection({
					collectionId,
					resourceId: selectedResource.id,
				});
				setIsCollectionPickerVisible(false);
			} catch (err) {
				console.error("Failed to add to collection:", err);
			}
		},
		[selectedResource, addToCollection],
	);
	const onRefresh = useCallback(async () => {
		setRefreshing(true);
		await fetchResources();
		const userId = await identityAPI.getMyInternalId();
		if (resources.length === 0) {
			const pub = await libraryAPI.getCollections({
				limit: 10,
				visibility: "public",
				userId: userId ?? undefined,
			});
			setPublicCollections(pub);
		}
		setRefreshing(false);
	}, [fetchResources, resources.length]);
	const handleCreateCollection = useCallback(
		async (data: any) => {
			try {
				const userId = await identityAPI.getMyInternalId();
				if (!userId) return;
				await libraryAPI.createCollection(
					{
						...data,
						resource_ids: [],
						subject: "",
						grades: [],
					},
					userId,
				);
				await fetchResources();
				setRefreshing(true);
				setTimeout(() => setRefreshing(false), 500);
			} catch (err) {
				console.error("Failed to create collection:", err);
			}
		},
		[fetchResources],
	);
	const chipData = useMemo(
		() =>
			LIBRARY_UI_CATEGORIES.map((cat) => ({
				label: cat.en,
				value: cat.id,
			})),
		[],
	);
	const sortChips = useMemo(
		() => [
			{ label: `\uD83D\uDD52 ${t("library.sort.recent")}`, value: "recent" },
			{ label: `\uD83D\uDD25 ${t("library.sort.popular")}`, value: "popular" },
			{
				label: `\uD83C\uDF1F ${t("library.sort.most_endorsed")}`,
				value: "most_endorsed",
			},
			{
				label: `\uD83D\uDD16 ${t("library.sort.most_bookmarked")}`,
				value: "most_bookmarked",
			},
		],
		[t],
	);
	const handleEndReached = useCallback(() => {
		if (hasNextResources && !isFetchingNextResources) fetchNextResources();
	}, [hasNextResources, isFetchingNextResources, fetchNextResources]);
	const fabConfig = useMemo(
		() => ({
			tabType: "library" as const,
			onPress: () => setIsAddModalOpen(true),
			visible: !loading,
		}),
		[loading],
	);
	useRegisterFAB(fabConfig);
	const getYoutubeThumbnail = (url?: string) => {
		if (!url) return undefined;
		const match = url.match(
			/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]{11})/,
		);
		return match
			? `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg`
			: undefined;
	};
	const renderShelf = useCallback(
		(label: string, items: LibraryResource[], onSeeAll?: () => void) => {
			if (items.length === 0) return null;
			return (
				<Box className="mb-6">
					<SmartShelf key={label} title={label} onSeeAll={onSeeAll}>
						{items.map((res) => (
							<LibraryThumbnailCard
								key={`shelf-${label}-${res.id}`}
								title={res.title}
								type={res.type}
								subject={res.subjects?.[0] || ""}
								thumbnailUrl={
									res.media?.url ||
									(res as any).thumbnail_url ||
									(res.type === "video" || res.type === "movie_trailer"
										? getYoutubeThumbnail(res.url)
										: undefined)
								}
								endorsements={res.endorsements}
								verified={res.verified}
								copyrightNotice={res.copyright_notice}
								onPress={() => handleOpenResource(res)}
								has_bookmarked={res.has_bookmarked}
								onBookmarkToggle={() => handleBookmark(res)}
								onLongPress={() => {
									setSelectedResource(res);
									setIsActionSheetVisible(true);
								}}
							/>
						))}
					</SmartShelf>
				</Box>
			);
		},
		[handleOpenResource, handleBookmark, getYoutubeThumbnail],
	); // Added missing dependencies
	return (
		(<ScreenWrapper scroll={!isSearchMode} noTopInset={true} />),
		(
			<GlobalHeader
				title={t("tabs.library") || "Library"}
				subtitle={t("library.knowledgeSanctuary")}
				showSearch
				searchProps={{
					value: searchQuery,
					onChangeText: setSearchQuery,
					placeholder: t("library.searchPlaceholder"),
				}}
				rightAction={
					<HStack className="gap-2 items-center">
						{isSyncing && (
							<Animated.View entering={FadeInDown}>
								<Box
									className="w-2 h-2 rounded-full"
									style={{ backgroundColor: Theme.colors.sanctuarySaffron }}
								/>
							</Animated.View>
						)}
						<TouchableOpacity
							onPress={() => navigation.navigate("LibraryMap" as any)}
							style={styles.mapToggleButton}
						>
							<MapIcon size={20} color={colors.textPrimary} />
						</TouchableOpacity>
					</HStack>
				}
			/>
		)
	);
	libraryError ? (<VStack className="p-4 mt-6 items-center gap-3">
                    <Text className="text-center" style={{ color: colors.error }}>
                        {t('library.errorLoading') || 'Failed to load sanctuary wisdom.'}
                    </Text>
                    <TouchableOpacity onPress={() => fetchResources()}>
                        <Text className="font-bold" style={{ color: Theme.colors.sanctuarySaffron }}>Retry</Text>
                    </TouchableOpacity>
                </VStack>) : (loading || isFetchingPublic) && !refreshing ? (<VStack className="p-4 mt-6 gap-4">
                    <SkeletonCard height={200}/>
                    <SkeletonCard height={160}/>
                    <SkeletonCard height={160}/>
                </VStack>) : (<Box className="flex-1">
                    {!isSearchMode && (<HStack className="px-4 py-3 gap-3">
                            <TouchableOpacity onPress={() => setIsAddCollectionModalOpen(true)} style={[styles.actionBtn, { borderColor: `${Theme.colors.sanctuarySaffron}88` }]}>
                                <Library size={14} color={Theme.colors.sanctuarySaffron}/>
                                <Text className="text-[13px] font-bold" style={{ color: colors.textPrimary }}>+ Collection</Text>
                            </TouchableOpacity>
                        </HStack>)}

                    <Box className="flex-1" style={{ backgroundColor: colors.secondary }}>
                        <Animated.View entering={FadeInDown.delay(100).springify()}>
                            <HorizontalChipRow chips={chipData} selectedValue={selectedCategoryId} onSelect={setSelectedCategoryId} size="sm"/>
                        </Animated.View>
                        
                        <Animated.View entering={FadeInDown.delay(160).springify()}>
                            <HStack className="px-4 pb-2 justify-between items-center">
                                <Box className="flex-1">
                                    <HorizontalChipRow chips={sortChips} selectedValue={selectedSort} onSelect={(v) => setSelectedSort(v as typeof selectedSort)} size="sm"/>
                                </Box>
                                <HStack className="gap-1 rounded-xl p-1 border" style={{ backgroundColor: colors.overlay, borderColor: colors.border }}>
                                    <TouchableOpacity onPress={() => setViewMode('shelf')} style={[styles.toggleBtn, viewMode === 'shelf' && { backgroundColor: Theme.colors.sanctuarySaffron }]}>
                                        <Layers size={14} color={viewMode === 'shelf' ? Theme.colors.sacredWhite : colors.textSecondary}/>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => setViewMode('grid')} style={[styles.toggleBtn, viewMode === 'grid' && { backgroundColor: Theme.colors.sanctuarySaffron }]}>
                                        <LayoutGrid size={14} color={viewMode === 'grid' ? Theme.colors.sacredWhite : colors.textSecondary}/>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => setViewMode('list')} style={[styles.toggleBtn, viewMode === 'list' && { backgroundColor: Theme.colors.sanctuarySaffron }]}>
                                        <List size={14} color={viewMode === 'list' ? Theme.colors.sacredWhite : colors.textSecondary}/>
                                    </TouchableOpacity>
                                </HStack>
                            </HStack>
                        </Animated.View>
                        {viewMode === 'shelf' && !isSearchMode ? (<ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: bottomPadding + Theme.spacing.xl }} refreshControl={<ActivityIndicator animating={refreshing} color={Theme.colors.sanctuarySaffron}/>} {...heroResource && (<HeroBanner resource={heroResource} onPress={() => handleOpenResource(heroResource)}/>)}/>
                ,
                    <MapInvitation onPress={() => navigation.navigate('LibraryMap' as any)}/>
                        ,
                            <FeatureGuard action="manage" subject="LibraryCuratorDashboard">
                                    <CuratorInvitation onPress={() => navigation.navigate('CuratorReview' as any)}/>
                                </FeatureGuard>
                                ,
                                    <Box className="pt-4">
                                    {deskItems && deskItems.filter((r: any) => r.type === 'resource').length > 0 && (<SmartShelf title="\u25B6 Continue Learning">
                                            {deskItems.filter((r: any) => r.type === 'resource').map((res: any) => (<LibraryThumbnailCard key={res.id} title={res.title} type={res.type} onPress={() => handleOpenResource(res)} onLongPress={res.url ? () => handleOpenResourceOptions(res) : undefined}/>))}
                                        </SmartShelf>)}
                                    {bookmarkedResources.length > 0 && (<SmartShelf title="\uD83D\uDD16 My Bookmarks">
                                            {bookmarkedResources.map((res: any) => (<LibraryThumbnailCard key={`bookmark-${res.id}`} title={res.title} type={res.type} onPress={() => handleOpenResource(res)} has_bookmarked={res.has_bookmarked} onBookmarkToggle={() => handleBookmark(res)} onLongPress={() => {
                                                    setSelectedResource(res);
                                                    setIsActionSheetVisible(true);
                                                }}/>))}
                                        </SmartShelf>)}
                                    {collections.length > 0 && (<Box className="mb-6">
                                            <SmartShelf title={rawUserCollections.length > 0 ? "\uD83D\uDCDA Your Collections" : "\uD83C\uDF1F Discover Collections"}>
                                                {collections.map((col: any) => (<CollectionCard key={col.id} collection={col} onPress={(collection) => navigation.navigate('CollectionDetail', { id: collection.id, title: collection.name })}/>))}
                                            </SmartShelf>
                                        </Box>)}
                                    {orderedShelfDefs.map(shelf => {
                                            const items = resources.filter((r: LibraryResource) => (shelf.types as readonly string[]).includes(r.type));
                                            return renderShelf(shelf.label, items);
                                        })}
                                    {trending.length > 0 && renderShelf('\u2B50 Trending', trending)}
                                    {newArrivals.length > 0 && renderShelf('\u2728 New Arrivals', newArrivals)}
                                </Box>)
                :
            }
                            </ScrollView>
                        ) : (
                            <ResourceList resources={resources} onOpenResource={handleOpenResource} onOpenResourceOptions={handleOpenResourceOptions} onPullToDesk={(res) => console.log('Pull', res.id)} viewMode={viewMode === 'grid' ? 'grid' : 'list'} ListHeaderComponent={<Box className="p-4">
                                        <Text className="text-[13px]" style={{ color: colors.textSecondary }}>
                                            {searchQuery ? `Found ${resources.length} resources for "${searchQuery}"` : `Showing curated findings`}
                                        </Text>
                                    </Box>} onEndReached={handleEndReached} refreshing={refreshing} onRefresh={onRefresh}/>
                        )}
                    </Box>);
	Box >
        ;
	(
		<AddResourceModal
			isOpen={isAddModalOpen}
			onClose={() => setIsAddModalOpen(false)}
			onAdd={handleAddResource}
		/>
	),
		(
			<AddCollectionModal
				isOpen={isAddCollectionModalOpen}
				onClose={() => setIsAddCollectionModalOpen(false)}
				onAdd={handleCreateCollection}
			/>
		);
	selectedResource && (
		<ResourceActionSheet
			visible={isActionSheetVisible}
			onClose={() => setIsActionSheetVisible(false)}
			resource={selectedResource}
			onBookmark={() => handleBookmark(selectedResource)}
			onAddToCollection={() => setIsCollectionPickerVisible(true)}
			onShare={() => handleShare(selectedResource)}
		/>
	);
	<CollectionPickerModal
		visible={isCollectionPickerVisible}
		onClose={() => setIsCollectionPickerVisible(false)}
		collections={rawUserCollections as any}
		onSelect={handleAddToCollection}
		isAdding={isAddingToCollection}
	/>;
	ScreenWrapper;
}
interface HeroBannerProps {
	resource: LibraryResource;
	onPress: () => void;
}
const _HERO_HEIGHT = 220;
function HeroBanner({ resource, onPress }: HeroBannerProps) {
	const colors = useThemedColors();
	return (
		<Pressable onPress={onPress}>
			<Box
				className="h-[220px] overflow-hidden mb-4"
				style={{ backgroundColor: colors.secondary }}
			>
				{resource.media?.url ? (
					<ImageBackground
						source={{ uri: resource.media.url as string }}
						style={{ flex: 1 }}
						resizeMode="cover"
					>
						<HeroOverlay resource={resource} colors={colors} />
					</ImageBackground>
				) : (
					<Box
						className="flex-1"
						style={{ backgroundColor: `${colors.action}18` }}
					>
						<HeroOverlay resource={resource} colors={colors} />
					</Box>
				)}
			</Box>
		</Pressable>
	);
}
function HeroOverlay({
	resource,
	colors,
}: {
	resource: LibraryResource;
	colors: any;
}) {
	return (
		<LinearGradient
			colors={["transparent", `${colors.obsidian}88`, `${colors.obsidian}EE`]}
			style={{
				...StyleSheet.absoluteFillObject,
				justifyContent: "flex-end",
				padding: 20,
			}}
		>
			<Box
				className="self-start px-2 py-0.5 rounded mb-2"
				style={{ backgroundColor: Theme.colors.sanctuarySaffron }}
			>
				<Text
					className="text-[10px] font-extrabold tracking-widest"
					style={{ color: Theme.colors.sacredWhite }}
				>
					\u2727 FEATURED
				</Text>
			</Box>
			<Text
				className="text-[22px] font-extrabold leading-7 mb-1.5"
				style={{ color: colors.textPrimary }}
			>
				{resource.title}
			</Text>
			{resource.description && (
				<Text
					className="text-[13px] leading-[18px] mb-3"
					style={{ color: colors.textSecondary }}
					numberOfLines={2}
				>
					{resource.description}
				</Text>
			)}
			<HStack className="items-center gap-2.5">
				<Box
					className="flex-row items-center gap-1.5 px-3.5 py-2 rounded-xl"
					style={{ backgroundColor: Theme.colors.sanctuarySaffron }}
				>
					<Play
						size={14}
						color={Theme.colors.sacredWhite}
						fill={Theme.colors.sacredWhite}
					/>
					<Text
						className="text-[13px] font-bold"
						style={{ color: Theme.colors.sacredWhite }}
					>
						Open
					</Text>
				</Box>
			</HStack>
		</LinearGradient>
	);
}
const styles = StyleSheet.create({
	mapToggleButton: {
		padding: 8,
		borderRadius: 12,
		backgroundColor: Theme.colors.glass.light.highlight,
		borderWidth: 1,
		borderColor: Theme.colors.glass.light.border,
		marginRight: 4,
	},
	toggleBtn: {
		width: 32,
		height: 32,
		borderRadius: 8,
		justifyContent: "center",
		alignItems: "center",
	},
	actionBtn: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
		paddingHorizontal: 16,
		paddingVertical: 10,
		borderRadius: 14,
		backgroundColor: Theme.colors.glass.light.highlight,
		borderWidth: 1,
		borderColor: Theme.colors.glass.light.border,
	},
});
