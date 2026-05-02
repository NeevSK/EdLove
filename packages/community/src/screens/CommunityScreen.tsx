import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { communityAPI } from "@repo/core/api";
import {
	useAnnouncementsQuery,
	useGroupsInfiniteQuery,
	useManifestoHooks,
	usePostsInfiniteQuery,
} from "@repo/core/api/hooks";
import { useTracking } from "@repo/core/hooks";
import { setPendingGateAction, usePermissions } from "@repo/core/logic";
import { useStore, useTemporalStore } from "@repo/core/store";
import type {
	CommunityPost,
	CommunityStackParamList,
	DirectConversation,
	SanctuaryGroup,
} from "@repo/core/types";
import GlobalHeader from "@repo/ui/components/GlobalHeader";
import { HorizontalChipRow } from "@repo/ui/components/HorizontalChipRow";
import PositiveInvitation from "@repo/ui/components/PositiveInvitation";
import { SanctuaryButton } from "@repo/ui/components/SanctuaryButton";
import SanctuaryFlashList from "@repo/ui/components/SanctuaryFlashList";
import ScreenWrapper, {
	useBottomTabPadding,
} from "@repo/ui/components/ScreenWrapper";
import { useRegisterFAB } from "@repo/ui/context";
import { Info, Plus } from "@repo/ui/icons";
import {
	Box,
	Heading,
	HStack,
	Icon,
	ScrollView,
	Spinner,
	Text,
	VStack,
} from "@repo/ui/primitives";
import React, { useEffect, useMemo, useState } from "react";
import { Platform } from "react-native";
import { CommentSheet } from "../components/CommentSheet";
import CommunityHearth from "../components/CommunityHearth";
import CreateGroupModal from "../components/CreateGroupModal";
import CreatePostModal from "../components/CreatePostModal";
import PostCard from "../components/PostCard";
import SocialShieldModal from "../components/SocialShieldModal";
import AnnouncementsScreen from "./AnnouncementsScreen";
import {
	type CommunityWorkspaceMode,
	deriveCommunityPulse,
	getCommunityFilterOptions,
	getCommunityModeOptions,
	mapCommunitySurfaceSlots,
} from "./communityWorkspace.shared";
import DirectMessagesListScreen from "./DirectMessagesListScreen";
import GroupsScreen from "./GroupsScreen";

type Navigation = NativeStackNavigationProp<CommunityStackParamList>;

export default function CommunityScreen() {
	const navigation = useNavigation<Navigation>();
	const bottomPadding = useBottomTabPadding();
	const { discoverFeature } = useTracking();
	const { can } = usePermissions();
	const { isPastView } = useTemporalStore();
	const { user, flags } = useStore();

	const userId = user?.id ?? "guest";
	const schoolId = user?.school_id ?? undefined;
	const userAuthority = user?.authority ?? "student";

	const canReadFeed = can("read", "CommunityFeed");
	const canReadGroups = can("read", "CommunityGroups");
	const canReadMessages = can("read", "DirectMessages");
	const canCreatePost = can("create", "Post");
	const canCreateGroup = can("create", "Group");
	const canReadAnnouncements = Boolean(schoolId) && can("read", "Group");

	const isMessagingEnabled = flags.isMessagingEnabled && canReadMessages;
	const isCommunityEnabled = flags.isCommunityEnabled;

	const [activeMode, setActiveMode] = useState<CommunityWorkspaceMode>("feed");
	const [selectedFilter, setSelectedFilter] = useState<string>("all");
	const [showCreatePost, setShowCreatePost] = useState(false);
	const [showCreateGroup, setShowCreateGroup] = useState(false);

	// Comment State
	const [commentPostId, setCommentPostId] = useState<string | null>(null);
	const [commentPostAuthorId, setCommentPostAuthorId] = useState<
		string | undefined
	>(undefined);
	const [commentPostType, setCommentPostType] = useState<string | undefined>(
		undefined,
	);

	const [reportPostId, setReportPostId] = useState<string | undefined>(
		undefined,
	);
	const [reportTargetUserId, setReportTargetUserId] = useState<
		string | undefined
	>(undefined);
	const [reportTargetUserName, setReportTargetUserName] = useState<
		string | undefined
	>(undefined);
	const [showReportModal, setShowReportModal] = useState(false);
	const [conversations, setConversations] = useState<DirectConversation[]>([]);
	const [loadingMessages, setLoadingMessages] = useState(false);

	const {
		data: postsData,
		isLoading: loadingPosts,
		refetch: fetchPosts,
		fetchNextPage: fetchNextPosts,
		hasNextPage: hasNextPosts,
		isFetchingNextPage: isFetchingNextPosts,
	} = usePostsInfiniteQuery(selectedFilter !== "all" ? selectedFilter : "all");

	const posts = useMemo(
		() => (postsData?.pages?.flat() as unknown as CommunityPost[]) ?? [],
		[postsData],
	);

	const {
		data: groupsData,
		isLoading: loadingGroups,
		refetch: fetchGroups,
	} = useGroupsInfiniteQuery({ schoolId });

	const groups = useMemo(
		() => (groupsData?.pages?.flat() as SanctuaryGroup[]) ?? [],
		[groupsData],
	);

	const { sanctuaryGroups = [] } = { sanctuaryGroups: groups }; // Compatibility alias
	const { manifestos = [] } = useManifestoHooks(
		schoolId || "default",
		user?.id ?? undefined,
	);
	const { data: announcements = [] } = useAnnouncementsQuery(schoolId || "");
	const announcementCount = announcements?.length ?? 0;

	const loading = loadingPosts || loadingGroups;

	const pulse = useMemo(
		() => deriveCommunityPulse(posts, groups, manifestos, conversations),
		[conversations, groups, manifestos, posts],
	);
	const filters = useMemo(() => getCommunityFilterOptions(groups), [groups]);
	const workspaceSlots = useMemo(
		() =>
			mapCommunitySurfaceSlots(
				Platform.OS as "web" | "android" | "ios",
				userId,
			),
		[userId],
	);
	const modeChips = useMemo(
		() =>
			getCommunityModeOptions(
				canReadAnnouncements,
				flags.isMessagingEnabled,
			).map((mode) => ({
				label: mode.label,
				value: mode.key,
			})),
		[canReadAnnouncements, flags.isMessagingEnabled],
	);

	const handleFabPress = React.useCallback(() => {
		if (activeMode === "circles" && canCreateGroup) {
			setShowCreateGroup(true);
			return;
		}
		if (canCreatePost) {
			setShowCreatePost(true);
			return;
		}
		if (canCreateGroup) {
			setShowCreateGroup(true);
		}
	}, [activeMode, canCreateGroup, canCreatePost]);

	useRegisterFAB({
		tabType: "community",
		visible:
			!isPastView && (canCreatePost || canCreateGroup) && isCommunityEnabled,
		icon: <Plus size={24} color="#FFF" />,
		onPress: handleFabPress,
	});

	useEffect(() => {
		discoverFeature("section_community");
	}, [discoverFeature]);

	useEffect(() => {
		if (activeMode !== "messages" || !isMessagingEnabled) {
			return;
		}

		let cancelled = false;
		communityAPI
			.getDirectConversations()
			.then((data) => {
				if (!cancelled) {
					setConversations(data as DirectConversation[]);
				}
			})
			.catch((error) => {
				console.error(
					"[CommunityScreen] Failed to load direct conversations",
					error,
				);
			})
			.finally(() => {
				if (!cancelled) {
					setLoadingMessages(false);
				}
			});

		return () => {
			cancelled = true;
		};
	}, [activeMode, isMessagingEnabled]);

	const handleModeChange = React.useCallback(
		(value: string) => {
			setActiveMode(value as CommunityWorkspaceMode);
			if (value === "messages" && isMessagingEnabled) {
				setLoadingMessages(true);
			}
		},
		[isMessagingEnabled],
	);

	const handleFilterChange = React.useCallback((value: string) => {
		setSelectedFilter(value);
	}, []);

	const handlePostPress = React.useCallback(
		(groupId?: string, groupName?: string) => {
			if (groupId) {
				navigation.navigate("GroupDetails", {
					groupId,
					groupName: groupName ?? "Circle",
				});
			}
		},
		[navigation],
	);

	const handlePostLike = React.useCallback(
		(postId: string) => {
			if (userId !== "guest") {
				communityAPI.togglePostReaction(postId, userId).catch(console.error);
			}
		},
		[userId],
	);

	const handlePostComment = React.useCallback(
		(id: string, authorId?: string, type?: string) => {
			setCommentPostId(id);
			setCommentPostAuthorId(authorId);
			setCommentPostType(type);
		},
		[],
	);

	const handlePostReport = React.useCallback(
		(id: string, authorId?: string, authorName?: string) => {
			setReportPostId(id);
			setReportTargetUserId(authorId);
			setReportTargetUserName(authorName);
			setShowReportModal(true);
		},
		[],
	);

	const handleAuthorPress = React.useCallback(
		(authorId?: string, isAnonymous?: boolean) => {
			if (authorId && !isAnonymous) {
				navigation.navigate("PublicProfile", {
					id: authorId,
					type: "user",
				});
			}
		},
		[navigation],
	);

	const handleOpenCircle = React.useCallback(() => {
		const mainGroup = sanctuaryGroups[0];
		if (mainGroup) {
			navigation.navigate("GroupDetails", {
				groupId: mainGroup.id,
				groupName: mainGroup.name,
			});
		}
	}, [navigation, sanctuaryGroups]);

	const handleNavigateToGroup = React.useCallback(
		(groupId: string) => {
			const selected = sanctuaryGroups.find((group) => group.id === groupId);
			navigation.navigate("GroupDetails", {
				groupId,
				groupName: selected?.name,
			});
		},
		[navigation, sanctuaryGroups],
	);

	const openGuestUpgrade = React.useCallback(() => {
		setPendingGateAction({
			kind: "community_open_create_group",
			createdAt: Date.now(),
		}).catch(() => {});
		navigation.navigate("Auth" as never);
	}, [navigation]);

	const handleClosePostModal = React.useCallback(
		() => setShowCreatePost(false),
		[],
	);
	const handleCloseGroupModal = React.useCallback(() => {
		setShowCreateGroup(false);
		fetchGroups();
	}, [fetchGroups]);
	const handleCloseReportModal = React.useCallback(() => {
		setShowReportModal(false);
		setReportPostId(undefined);
		setReportTargetUserId(undefined);
		setReportTargetUserName(undefined);
	}, []);
	const handleCloseCommentSheet = React.useCallback(
		() => setCommentPostId(null),
		[],
	);

	const handleNewPost = React.useCallback(() => {
		if (canCreatePost) {
			setShowCreatePost(true);
		} else {
			openGuestUpgrade();
		}
	}, [canCreatePost, openGuestUpgrade]);

	const handleNewGroup = React.useCallback(() => {
		if (canCreateGroup) {
			setShowCreateGroup(true);
		} else {
			openGuestUpgrade();
		}
	}, [canCreateGroup, openGuestUpgrade]);

	const renderModeGate = React.useCallback(
		(title: string, description: string, actionLabel = "Create account") => (
			<Box className="px-4 py-8">
				<PositiveInvitation
					title={title}
					description={description}
					type="guest"
					context="community"
					actionLabel={actionLabel}
					onAction={openGuestUpgrade}
				/>
			</Box>
		),
		[openGuestUpgrade],
	);

	if (!isCommunityEnabled) {
		return (
			<ScreenWrapper noTopInset={true}>
				<GlobalHeader title="Community" subtitle="Currently Expanding" />
				<Box className="flex-1 items-center justify-center p-8 bg-phase-canvas">
					<VStack space="xl" className="items-center">
						<Box className="w-16 h-16 bg-phase-warning/10 rounded-full items-center justify-center">
							<Icon as={Info} size="xl" className="text-phase-warning" />
						</Box>
						<Heading className="text-center">Sanctuary Maintenance</Heading>
						<Text className="text-center text-phase-text-secondary">
							The community spaces are currently undergoing a structural
							expansion. Please check back soon for a calmer, more resonant
							experience.
						</Text>
					</VStack>
				</Box>
			</ScreenWrapper>
		);
	}

	const renderHero = () => (
		<Box className="mx-4 mt-3 px-5 py-6 rounded-3xl bg-phase-surface border border-border">
			<VStack className="gap-4">
				<VStack className="gap-1">
					<Text className="text-ink/60 text-[10px] font-bold uppercase tracking-[2px]">
						{workspaceSlots.hearth ? "Community workspace" : "Community"}
					</Text>
					<Heading className="text-3xl text-ink font-bold">The Heart</Heading>
					<Text className="text-ink/60 leading-relaxed text-sm mt-1">
						Shared pulse, groups, and conversation. Presence leads before
						activity so the sanctuary feels alive before it feels busy.
					</Text>
				</VStack>

				<HStack className="gap-2 flex-wrap items-center">
					<HeroPill label={`${pulse.circlesActive} circles`} />
					<HeroPill label={`${pulse.newPostsToday} new posts`} />
					<HeroPill label={`${pulse.messagesOpen} conversations`} />
					{canReadAnnouncements ? (
						<HeroPill label={`${announcementCount} announcements`} />
					) : null}
				</HStack>

				<Box className="pt-2">
					<HorizontalChipRow
						chips={modeChips}
						selectedValue={activeMode}
						onSelect={handleModeChange}
						center={false}
					/>
				</Box>
			</VStack>
		</Box>
	);

	const renderHearthCard = () => (
		<Box className="mx-4 mt-4 rounded-3xl border border-border bg-phase-surface/50 overflow-hidden">
			<VStack className="gap-4 p-5">
				<VStack className="gap-1">
					<Heading className="text-lg text-ink font-bold">
						Community hearth
					</Heading>
					<Text className="text-ink/60 leading-snug text-sm">
						Presence, welcome, and manifesto energy stay first so the community
						feels alive before it feels busy.
					</Text>
				</VStack>
				<HStack className="justify-between gap-3 flex-wrap">
					<PulseCard
						label="Members seen"
						value={String(pulse.membersSeen || 0)}
					/>
					<PulseCard
						label="Active manifestos"
						value={String(pulse.manifestosActive)}
					/>
					<PulseCard
						label="Joined circles"
						value={String(sanctuaryGroups.length)}
					/>
				</HStack>
			</VStack>
			<CommunityHearth manifestos={manifestos} userId={userId} />
		</Box>
	);

	const renderComposeCard = () => (
		<Box className="mx-4 mt-4 px-5 py-5 rounded-3xl border border-border bg-phase-surface">
			<VStack className="gap-4">
				<VStack className="gap-1">
					<Heading className="text-md text-ink font-bold">
						Compose into the circle
					</Heading>
					<Text className="text-ink/60 text-sm leading-snug">
						Posting feels like contribution, not just a button.
					</Text>
				</VStack>
				<HStack className="gap-3 flex-wrap">
					<SanctuaryButton
						action="primary"
						size="sm"
						onPress={handleNewPost}
						className="bg-phase-interactive rounded-xl"
					>
						<Text className="text-white font-bold">New Post</Text>
					</SanctuaryButton>
					<SanctuaryButton
						action="secondary"
						size="sm"
						onPress={handleNewGroup}
						className="bg-phase-surface border-border rounded-xl"
					>
						<Text className="text-ink font-bold">New Group</Text>
					</SanctuaryButton>
					{sanctuaryGroups[0] && (
						<SanctuaryButton
							action="secondary"
							size="sm"
							onPress={handleOpenCircle}
							className="bg-phase-surface border-border rounded-xl"
						>
							<Text className="text-ink font-bold">Open Circle</Text>
						</SanctuaryButton>
					)}
				</HStack>
			</VStack>
		</Box>
	);

	const renderFilterRow = () => (
		<Box className="mt-4 px-4">
			<HorizontalChipRow
				chips={filters}
				selectedValue={selectedFilter}
				onSelect={handleFilterChange}
				center={false}
			/>
		</Box>
	);

	const renderFeed = () => {
		if (!canReadFeed) {
			return renderModeGate(
				"Become a citizen of the hearth",
				"Create an account and receive a positive invitation into circles, posts, and the living community feed.",
			);
		}

		return (
			<SanctuaryFlashList
				data={posts}
				keyExtractor={(item) => item.id}
				estimatedItemSize={260}
				renderItem={({ item }: { item: CommunityPost }) => (
					<Box className="px-4 pb-4">
						<PostCard
							post={item}
							currentUserId={userId}
							isSocialShieldEnabled={flags.isSocialShieldEnabled}
							onPress={() => handlePostPress(item.group_id, item.group_name)}
							onLike={() => handlePostLike(item.id)}
							onComment={() =>
								handlePostComment(item.id, item.author_id, item.post_type)
							}
							onReport={() =>
								handlePostReport(item.id, item.author_id, item.author_name)
							}
							onAuthorPress={() =>
								handleAuthorPress(item.author_id, item.is_anonymous)
							}
						/>
					</Box>
				)}
				ListHeaderComponent={
					<VStack>
						{renderHero()}
						{renderHearthCard()}
						{renderFilterRow()}
						{renderComposeCard()}
					</VStack>
				}
				ListEmptyComponent={
					!loading ? (
						<Box className="px-4 pt-8">
							<PositiveInvitation
								title="Seed the first note"
								description="The feed opens when circles begin speaking. Start a post or join a circle to let the sanctuary resonate."
								context="community"
								actionLabel={
									canCreatePost ? "Create first post" : "Explore circles"
								}
								onAction={() => {
									if (canCreatePost) {
										setShowCreatePost(true);
									} else {
										setActiveMode("circles");
									}
								}}
							/>
						</Box>
					) : null
				}
				onEndReached={() => {
					if (hasNextPosts) {
						fetchNextPosts();
					}
				}}
				onEndReachedThreshold={0.5}
				ListFooterComponent={
					isFetchingNextPosts ? (
						<Box className="py-8 items-center">
							<Spinner />
						</Box>
					) : null
				}
				contentContainerStyle={{ paddingBottom: bottomPadding + 32 }}
			/>
		);
	};

	const renderCircles = () => {
		if (!canReadGroups) {
			return renderModeGate(
				"Circles open with belonging",
				"Create your account to enter joined circles, discover new groups, and contribute to shared resonance.",
			);
		}

		return (
			<ScrollView contentContainerStyle={{ paddingBottom: bottomPadding + 32 }}>
				{renderHero()}
				{renderHearthCard()}
				<Box className="px-4 pt-4">
					<SectionCard
						title="My sanctuary"
						description="Joined circles stay close, while discoverable circles remain one step away."
					>
						<GroupsScreen
							userId={user?.id}
							schoolId={schoolId}
							onCreateGroup={() => setShowCreateGroup(true)}
							onNavigateToGroup={handleNavigateToGroup}
						/>
					</SectionCard>
				</Box>
			</ScrollView>
		);
	};

	const renderMessages = () => {
		if (!canReadMessages) {
			return renderModeGate(
				"Messages become available with citizenship",
				"Create an account to continue private conversations without leaving the sanctuary shell.",
			);
		}

		return (
			<ScrollView contentContainerStyle={{ paddingBottom: bottomPadding + 32 }}>
				{renderHero()}
				<Box className="px-4 pt-4">
					<SectionCard
						title="Direct conversations"
						description="Messages stay close to the hearth without overtaking the workspace."
					>
						{loadingMessages ? (
							<Box className="py-12 items-center">
								<Spinner />
							</Box>
						) : (
							<DirectMessagesListScreen />
						)}
					</SectionCard>
				</Box>
			</ScrollView>
		);
	};

	const renderAnnouncements = () => {
		if (!canReadAnnouncements || !schoolId || !user?.id) {
			return renderModeGate(
				"Announcements travel with school attachment",
				"Attach to a sanctuary and accept your invitation to receive school-wide guidance here.",
			);
		}

		return (
			<ScrollView contentContainerStyle={{ paddingBottom: bottomPadding + 32 }}>
				{renderHero()}
				<Box className="px-4 pt-4">
					<SectionCard
						title="School guidance"
						description="Announcements remain reachable without crowding the feed."
					>
						<AnnouncementsScreen
							schoolId={schoolId}
							userId={user.id}
							userAuthority={userAuthority}
						/>
					</SectionCard>
				</Box>
			</ScrollView>
		);
	};

	return (
		<ScreenWrapper scroll={false} noTopInset className="bg-phase-canvas">
			<Box className="flex-1">
				<GlobalHeader title="Community" />

				{activeMode === "feed" && renderFeed()}
				{activeMode === "circles" && renderCircles()}
				{activeMode === "messages" && renderMessages()}
				{activeMode === "announcements" && renderAnnouncements()}

				<CreatePostModal
					isOpen={showCreatePost && !isPastView}
					onClose={handleClosePostModal}
					groupId={selectedFilter !== "all" ? selectedFilter : undefined}
				/>

				<CreateGroupModal
					isOpen={showCreateGroup && !isPastView}
					onClose={handleCloseGroupModal}
				/>

				<SocialShieldModal
					isOpen={showReportModal}
					onClose={handleCloseReportModal}
					postId={reportPostId}
					targetUserId={reportTargetUserId}
					targetUserName={reportTargetUserName}
				/>

				<CommentSheet
					postId={commentPostId}
					postAuthorId={commentPostAuthorId}
					currentUserId={user?.id}
					postType={commentPostType}
					onClose={handleCloseCommentSheet}
				/>
			</Box>
		</ScreenWrapper>
	);
}

function HeroPill({ label }: { label: string }) {
	return (
		<Box className="px-3 py-1.5 rounded-full bg-white/40 border border-white/20">
			<Text className="text-[10px] font-bold text-ink uppercase tracking-wide">
				{label}
			</Text>
		</Box>
	);
}

function PulseCard({ label, value }: { label: string; value: string }) {
	return (
		<Box className="flex-1 min-w-[92px] px-3 py-4 rounded-2xl bg-white/30 border border-white/20">
			<Text className="text-[9px] text-ink/40 font-bold uppercase tracking-wider">
				{label}
			</Text>
			<Heading className="mt-1 text-2xl font-bold text-ink">{value}</Heading>
		</Box>
	);
}

function SectionCard({
	title,
	description,
	children,
}: {
	title: string;
	description: string;
	children: React.ReactNode;
}) {
	return (
		<Box className="rounded-3xl border border-border bg-phase-surface/30 overflow-hidden mb-4">
			<VStack className="gap-1 p-5">
				<Heading className="text-md text-ink font-bold">{title}</Heading>
				<Text className="text-ink/60 text-xs leading-snug">{description}</Text>
			</VStack>
			{children}
		</Box>
	);
}
