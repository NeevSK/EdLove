import { formatDistanceToNow } from 'date-fns';
import React from 'react';
import { useTheme } from '../hooks/useTheme';
import {
  BookOpen,
  CircleCheck,
  FileText,
  Heart,
  Link2,
  MessageCircle,
  MoreHorizontal,
  Music,
  Share2,
  ShieldAlert,
  Sparkles,
  TriangleAlert,
  UserX,
  Video,
  X as XIcon,
} from '../icons';
import {
  Avatar,
  AvatarFallbackText,
  AvatarImage,
  Box,
  HStack,
  Icon,
  Image,
  Pressable,
  Text,
  VStack,
} from '../primitives';
import { Theme } from '../theme/Theme';
import { LivingGlow } from './LivingGlow';
import { type PollData, PollWidget } from './PollWidget';
import { SanctuaryCard } from './SanctuaryCard';

export interface Author {
  id: string;
  name: string;
  avatar?: string;
}

export type PostType =
  | 'announcement'
  | 'question'
  | 'resource'
  | 'feedback'
  | 'discussion'
  | 'poll';
export type Urgency = 'low' | 'medium' | 'high';
export type FeedbackStatus = 'pending' | 'under_review' | 'approved' | 'implemented' | 'declined';

export interface PostContent {
  id: string;
  author: Author;
  content: string;
  type: PostType;
  createdAt: string | Date;
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'audio' | 'document';
  isAnonymous?: boolean;
  pollData?: PollData;
  urgency?: Urgency;
  hasAcceptedAnswer?: boolean;
  feedbackStatus?: FeedbackStatus;
  feedbackResponse?: string;
  commentCount?: number;
}

interface PostCardProps {
  post: PostContent;
  currentUserId?: string;

  // State from parent logic hook
  isLiked: boolean;
  likeCount: number;
  hasResonated: boolean;
  isResonating: boolean;
  isMenuOpen: boolean;

  // Permissions & Flags
  canDelete?: boolean;
  isSocialShieldEnabled?: boolean;

  // Interactivity
  onPress?: () => void;
  onLike: () => void;
  onResonate: () => void;
  onComment: () => void;
  onReport?: () => void;
  onAuthorPress?: () => void;
  onShare: () => void;
  onDelete?: () => void;
  onBlock?: () => void;
  toggleMenu: () => void;

  // Poll Specifics
  pollProps?: {
    counts: Record<string, number>;
    userVotes: Set<string>;
    totalVotes: number;
    isLoading?: boolean;
    isVoting?: boolean;
    onVote: (optionId: string) => void;
    onRefresh?: () => void;
  };

  // UI Extension
  renderFooterAddon?: () => React.ReactNode;
}

const MEDIA_HEIGHT = 260;

const TYPE_BADGE: Record<
  string,
  { label: string; textClass: string; bgClass: string; borderClass: string }
> = {
  announcement: {
    label: 'Announcement',
    textClass: 'text-sanctuarySaffron',
    bgClass: 'bg-sanctuarySaffron/10',
    borderClass: 'border-sanctuarySaffron',
  },
  question: {
    label: 'Question',
    textClass: 'text-indigo-500',
    bgClass: 'bg-indigo-500/10',
    borderClass: 'border-indigo-500',
  },
  resource: {
    label: 'Resource',
    textClass: 'text-emerald-500',
    bgClass: 'bg-emerald-500/10',
    borderClass: 'border-emerald-500',
  },
  feedback: {
    label: 'Feedback',
    textClass: 'text-rose-500',
    bgClass: 'bg-rose-500/10',
    borderClass: 'border-rose-500',
  },
  discussion: {
    label: 'Discussion',
    textClass: 'text-slate-400',
    bgClass: 'bg-slate-400/10',
    borderClass: 'border-slate-400',
  },
  poll: {
    label: 'Poll',
    textClass: 'text-purple-500',
    bgClass: 'bg-purple-500/10',
    borderClass: 'border-purple-500',
  },
};

export const PostCard = React.memo(function PostCard({
  post,
  currentUserId,
  isLiked,
  likeCount,
  hasResonated,
  isResonating,
  isMenuOpen,
  canDelete = false,
  isSocialShieldEnabled = false,
  onPress,
  onLike,
  onResonate,
  onComment,
  onReport,
  onAuthorPress,
  onShare,
  onDelete,
  onBlock,
  toggleMenu,
  pollProps,
  renderFooterAddon,
}: PostCardProps) {
  const theme = useTheme();
  const {
    author,
    type,
    createdAt,
    mediaUrl,
    mediaType,
    isAnonymous,
    pollData,
    urgency,
    hasAcceptedAnswer,
    feedbackStatus,
    feedbackResponse,
    commentCount,
  } = post;

  const isAnnouncement = type === 'announcement';

  const renderMediaContent = () => {
    if (!mediaUrl) return null;

    if (mediaType === 'image') {
      return (
        <Box className="mt-2">
          <Box
            className="rounded-xl overflow-hidden border border-white/5 bg-phase-surface relative"
            style={{ height: MEDIA_HEIGHT }}
          >
            <Image source={{ uri: mediaUrl }} className="absolute inset-0" resizeMode="cover" />
          </Box>
        </Box>
      );
    }

    const mediaLabel =
      mediaType === 'video' ? 'Video' : mediaType === 'audio' ? 'Audio' : 'Attachment';

    return (
      <Pressable
        className="flex-row items-center px-3 py-2 rounded-xl border border-phase-interactive mt-2 self-start active:opacity-70 gap-2"
        accessibilityRole="link"
        accessibilityLabel={`View ${mediaLabel}`}
      >
        <Icon
          as={mediaType === 'video' ? Video : mediaType === 'audio' ? Music : FileText}
          size="sm"
          color={theme.accent.action}
        />
        <Text className="text-phase-accent text-sm">{mediaLabel}</Text>
        <Icon as={Link2} size={12} color={theme.accent.action} />
      </Pressable>
    );
  };

  const renderTypeMetadata = () => {
    if (type === 'question') {
      const urgencyConfig: Record<Urgency, { label: string; textClass: string; bgClass: string }> =
        {
          high: {
            label: 'Urgent',
            textClass: 'text-red-600',
            bgClass: 'bg-red-600/10',
          },
          medium: {
            label: 'Medium',
            textClass: 'text-amber-600',
            bgClass: 'bg-amber-600/10',
          },
          low: {
            label: 'Low',
            textClass: 'text-phaseText-secondary',
            bgClass: 'bg-phase-interactive',
          },
        };
      const urg = urgencyConfig[urgency ?? 'low'];
      return (
        <HStack className="items-center mb-2 gap-2">
          {urgency && urgency !== 'low' && (
            <Box className={`${urg.bgClass} px-2 py-0.5 rounded-md flex-row items-center gap-1`}>
              <Icon
                as={TriangleAlert}
                size={11}
                color={urgency === 'high' ? '#DC2626' : '#D97706'}
              />
              <Text className={`text-[11px] font-bold ${urg.textClass}`}>{urg.label}</Text>
            </Box>
          )}
          {hasAcceptedAnswer && (
            <Box className="bg-emerald-600/10 px-2 py-0.5 rounded-md flex-row items-center gap-1">
              <Icon as={CircleCheck} size={11} color="#16A34A" />
              <Text className="text-[11px] font-bold text-emerald-600">Answered</Text>
            </Box>
          )}
        </HStack>
      );
    }

    if (type === 'resource') {
      return (
        <Box className="mb-2">
          <Box className="bg-indigo-500/10 px-2 py-0.5 rounded-md self-start flex-row items-center gap-1">
            <Icon as={BookOpen} size={11} color="#6366F1" />
            <Text className="text-[11px] font-bold text-indigo-500">Resource</Text>
          </Box>
        </Box>
      );
    }

    if (type === 'feedback') {
      const statusConfig: Record<
        FeedbackStatus,
        { label: string; textClass: string; bgClass: string }
      > = {
        pending: {
          label: 'Pending',
          textClass: 'text-phaseText-secondary',
          bgClass: 'bg-phase-interactive',
        },
        under_review: {
          label: 'Under Review',
          textClass: 'text-amber-600',
          bgClass: 'bg-amber-600/10',
        },
        approved: {
          label: 'Approved',
          textClass: 'text-emerald-600',
          bgClass: 'bg-emerald-600/10',
        },
        implemented: {
          label: 'Implemented',
          textClass: 'text-sanctuarySaffron',
          bgClass: 'bg-sanctuarySaffron/15',
        },
        declined: {
          label: 'Declined',
          textClass: 'text-red-600',
          bgClass: 'bg-red-600/10',
        },
      };
      const cfg = statusConfig[feedbackStatus ?? 'pending'];
      return (
        <VStack className="mb-2 gap-1.5">
          <Box className={`${cfg.bgClass} px-2 py-0.5 rounded-md self-start`}>
            <Text className={`text-[11px] font-bold ${cfg.textClass}`}>{cfg.label}</Text>
          </Box>
          {!!feedbackResponse && (
            <Box className="bg-phase-surface/50 p-3 rounded-xl border-l-[3px] border-sanctuarySaffron">
              <Text className="text-phaseText-secondary text-xs italic">{feedbackResponse}</Text>
            </Box>
          )}
        </VStack>
      );
    }

    return null;
  };

  return (
    <SanctuaryCard onPress={onPress} elevated={isAnnouncement}>
      <VStack className="gap-4">
        {/* Header */}
        <HStack className="justify-between items-center">
          <HStack className="items-center gap-3">
            <Pressable
              onPress={!isAnonymous ? onAuthorPress : undefined}
              disabled={isAnonymous || !onAuthorPress}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityRole="button"
              accessibilityLabel={
                isAnonymous ? 'Anonymous author' : `View profile of ${author.name}`
              }
            >
              <Avatar size="sm" className={isAnonymous ? 'bg-phase-surface' : 'bg-phase-accent'}>
                <AvatarFallbackText>
                  {isAnonymous ? '?' : author.name?.[0] || 'U'}
                </AvatarFallbackText>
                {!isAnonymous && author.avatar && <AvatarImage source={{ uri: author.avatar }} />}
              </Avatar>
            </Pressable>
            <VStack>
              <Text className="text-phaseText-primary font-bold text-[13px]">
                {isAnonymous ? 'Anonymous' : author.name}
              </Text>
              <Text className="text-phaseText-secondary text-[11px]">
                {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
              </Text>
            </VStack>
          </HStack>

          <Box>
            <Pressable
              onPress={toggleMenu}
              className="p-1"
              accessibilityRole="button"
              accessibilityLabel="Open post menu"
            >
              <Icon as={MoreHorizontal} color={theme.text.secondary} size="md" />
            </Pressable>

            {isMenuOpen && (
              <Box
                className="absolute top-[25px] right-0 rounded-xl border border-white/5 bg-phase-surface relative min-w-[160px] z-20 overflow-hidden shadow-xl"
                style={{ elevation: 4 }}
              >
                <VStack>
                  {author.id === currentUserId && canDelete && onDelete && (
                    <Pressable
                      className="p-4 border-b border-white/5 active:bg-white/5"
                      onPress={onDelete}
                      accessibilityRole="button"
                      accessibilityLabel="Delete post"
                    >
                      <HStack className="items-center gap-3">
                        <Icon as={XIcon} size={16} color={Theme.colors.error} />
                        <Text className="text-[13px] text-phase-danger">Delete Post</Text>
                      </HStack>
                    </Pressable>
                  )}

                  {author.id !== currentUserId && isSocialShieldEnabled && onReport && (
                    <Pressable
                      className="p-4 border-b border-white/5 active:bg-white/5"
                      onPress={onReport}
                      accessibilityRole="button"
                      accessibilityLabel="Report post"
                    >
                      <HStack className="items-center gap-3">
                        <Icon as={ShieldAlert} size={16} color={theme.text.primary} />
                        <Text className="text-[13px] text-phaseText-primary">Report Post</Text>
                      </HStack>
                    </Pressable>
                  )}

                  {!isAnonymous &&
                    author.id !== currentUserId &&
                    isSocialShieldEnabled &&
                    onBlock && (
                      <Pressable
                        className="p-4 active:bg-white/5"
                        onPress={onBlock}
                        accessibilityRole="button"
                        accessibilityLabel={`Block ${author.name}`}
                      >
                        <HStack className="items-center gap-3">
                          <Icon as={UserX} size={16} color={Theme.colors.sanctuarySaffron} />
                          <Text className="text-[13px] text-sanctuarySaffron">Block User</Text>
                        </HStack>
                      </Pressable>
                    )}
                </VStack>
              </Box>
            )}
          </Box>
        </HStack>

        {/* Metadata */}
        {renderTypeMetadata()}

        {/* Post Content */}
        <Text
          numberOfLines={onPress ? 4 : undefined}
          className="text-phaseText-primary text-[15px] leading-[22px]"
        >
          {post.content}
        </Text>

        {/* Attachments */}
        {renderMediaContent()}

        {/* Polls */}
        {type === 'poll' && pollData && pollProps && (
          <PollWidget
            postId={post.id}
            pollData={pollData}
            {...pollProps}
            isAuthor={author.id === currentUserId}
          />
        )}

        {/* Footer Actions */}
        <HStack className="justify-between items-center mt-1">
          <HStack className="gap-6 items-center">
            <Pressable
              onPress={onLike}
              className="flex-row items-center py-1"
              accessibilityRole="button"
              accessibilityLabel={isLiked ? 'Unlike post' : 'Like post'}
              accessibilityState={{ selected: isLiked }}
            >
              <Icon
                as={Heart}
                size="md"
                color={isLiked ? '#EF4444' : theme.text.secondary}
                fill={isLiked ? '#EF4444' : 'none'}
              />
              {likeCount > 0 && (
                <Text
                  className={`text-xs ml-1 ${isLiked ? 'text-red-500' : 'text-phaseText-secondary'}`}
                >
                  {likeCount}
                </Text>
              )}
            </Pressable>

            <Pressable
              onPress={onResonate}
              className="flex-row items-center py-1"
              disabled={isResonating}
              accessibilityRole="button"
              accessibilityLabel="Resonate with post"
            >
              <LivingGlow active={hasResonated}>
                <Icon
                  as={Sparkles}
                  size="md"
                  color={hasResonated ? theme.accent.action : theme.text.secondary}
                />
              </LivingGlow>
            </Pressable>

            <Pressable
              onPress={onComment}
              className="flex-row items-center py-1"
              accessibilityRole="button"
              accessibilityLabel="View comments"
            >
              <Icon as={MessageCircle} size="md" color={theme.text.secondary} />
              <Text className="text-phaseText-secondary text-xs ml-1">{commentCount}</Text>
            </Pressable>

            <Pressable
              onPress={onShare}
              className="flex-row items-center py-1"
              accessibilityRole="button"
              accessibilityLabel="Share post"
              accessibilityHint="Opens system share dialog"
            >
              <Icon as={Share2} size={18} color={theme.text.secondary} />
            </Pressable>
          </HStack>

          <HStack className="items-center">
            <LivingGlow active={isAnnouncement}>
              <Box
                className={`${TYPE_BADGE[type]?.bgClass ?? 'bg-phase-interactive'} ${TYPE_BADGE[type]?.borderClass ?? 'border-phase-interactive'} border px-2 py-0.5 rounded-md`}
              >
                <Text
                  className={`${TYPE_BADGE[type]?.textClass ?? 'text-phase-accent'} text-[10px] font-bold`}
                >
                  {TYPE_BADGE[type]?.label ?? 'Post'}
                </Text>
              </Box>
            </LivingGlow>
          </HStack>
        </HStack>
        {renderFooterAddon?.()}
      </VStack>
    </SanctuaryCard>
  );
});
