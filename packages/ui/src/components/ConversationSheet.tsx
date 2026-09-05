import { ChevronDown, EyeOff, Lock, Send, Shield, ThumbsUp, Trash2 } from '@repo/ui/icons';
import {
  Actionsheet,
  Box,
  FlatList,
  HStack,
  Icon,
  Input,
  InputField,
  KeyboardAvoidingView,
  Pressable,
  Text,
  VStack,
} from '@repo/ui/primitives';
import { formatTimestamp, getInitialsFromName } from '@repo/ui/utils';
import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { BrandPulse } from './BrandPulse';

export interface CommentAuthor {
  id: string;
  name: string;
  avatar?: string | null;
}

export interface CommentItem {
  id: string;
  content: string;
  createdAt: string;
  author: CommentAuthor;
  isAnonymous?: boolean;
  isOfficial?: boolean;
  upvotes: number;
  hasUpvoted?: boolean;
}

interface ConversationSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  comments: CommentItem[];
  isLoading?: boolean;
  isPosting?: boolean;
  currentUserId?: string;

  // Features
  showOfficialBadge?: boolean;
  canMarkOfficial?: boolean;
  canDeleteOwn?: boolean;
  canDeleteAll?: boolean;
  allowAnonymous?: boolean;

  // Handlers
  onPost: (content: string, isAnonymous: boolean) => Promise<void>;
  onDelete: (id: string) => void;
  onUpvote: (id: string) => void;
  onMarkOfficial?: (id: string, flag: boolean) => void;

  // Localization
  emptyTitle?: string;
  emptySubtitle?: string;
  placeholder?: string;
  anonPlaceholder?: string;
}

function CommentRow({
  comment,
  currentUserId,
  showOfficialBadge,
  canMarkOfficial,
  canDelete,
  onDelete,
  onUpvote,
  onMarkOfficial,
}: {
  comment: CommentItem;
  currentUserId?: string;
  showOfficialBadge?: boolean;
  canMarkOfficial?: boolean;
  canDelete?: boolean;
  onDelete: (id: string) => void;
  onUpvote: (id: string) => void;
  onMarkOfficial?: (id: string, flag: boolean) => void;
}) {
  const isOwn = comment.author.id === currentUserId;
  const initials = getInitialsFromName(comment.author.name);

  return (
    <Box
      className={`flex-row mb-5 pl-1 ${comment.isOfficial ? 'border-l-4 border-l-phase-reward' : ''}`}
    >
      <Box
        className={`w-9 h-9 rounded-full items-center justify-center mr-3 mt-1 shrink-0 ${comment.isAnonymous ? 'bg-phase-surface border border-border' : 'bg-phase-interactive/10'}`}
      >
        {comment.isAnonymous ? (
          <Icon as={EyeOff} size="xs" className="text-ink/40" />
        ) : (
          <Text className="text-[12px] font-bold text-phase-interactive">{initials}</Text>
        )}
      </Box>

      <Box className="flex-1">
        <HStack className="justify-between items-center h-5">
          <HStack className="items-center gap-1.5">
            <Text className="text-xs font-bold text-ink">{comment.author.name}</Text>
            {showOfficialBadge && comment.isOfficial && (
              <HStack className="items-center px-1.5 py-0.5 rounded-md bg-phase-reward">
                <Icon as={Shield} size="xs" className="text-white" />
                <Text className="text-[9px] text-white font-bold ml-0.5 uppercase tracking-tighter">
                  Official
                </Text>
              </HStack>
            )}
          </HStack>
          <Text className="text-[10px] text-ink/40">{formatTimestamp(comment.createdAt)}</Text>
        </HStack>

        <Text className="text-sm text-ink/70 mt-1 leading-relaxed">{comment.content}</Text>

        <HStack className="items-center mt-2.5 gap-6">
          <Pressable
            accessibilityRole="button"
            onPress={() => onUpvote(comment.id)}
            className="flex-row items-center"
          >
            <Icon
              as={ThumbsUp}
              size="xs"
              className={comment.hasUpvoted ? 'text-phase-interactive' : 'text-ink/40'}
            />
            {comment.upvotes > 0 && (
              <Text
                className={`text-[11px] font-bold ml-1.5 ${comment.hasUpvoted ? 'text-phase-interactive' : 'text-ink/40'}`}
              >
                {comment.upvotes}
              </Text>
            )}
          </Pressable>

          {canMarkOfficial && onMarkOfficial && (
            <Pressable
              accessibilityRole="button"
              onPress={() => onMarkOfficial(comment.id, !comment.isOfficial)}
              className="flex-row items-center"
            >
              <Icon
                as={Shield}
                size="xs"
                className={comment.isOfficial ? 'text-phase-reward' : 'text-ink/40'}
              />
              <Text
                className={`text-[11px] font-bold ml-1.5 ${comment.isOfficial ? 'text-phase-reward' : 'text-ink/40'}`}
              >
                {comment.isOfficial ? 'Unmark' : 'Mark answer'}
              </Text>
            </Pressable>
          )}

          {(isOwn || canDelete) && (
            <Pressable
              accessibilityRole="button"
              onPress={() => onDelete(comment.id)}
              className="flex-row items-center p-1"
            >
              <Icon as={Trash2} size="xs" className="text-ink/40" />
            </Pressable>
          )}
        </HStack>
      </Box>
    </Box>
  );
}

export function ConversationSheet({
  isOpen,
  onClose,
  title = 'Conversation',
  comments,
  isLoading,
  isPosting,
  currentUserId,
  showOfficialBadge = true,
  canMarkOfficial = false,
  canDeleteOwn = true,
  canDeleteAll = false,
  allowAnonymous = true,
  onPost,
  onDelete,
  onUpvote,
  onMarkOfficial,
  emptyTitle = 'No reflections yet',
  emptySubtitle = 'Be the first to share your thoughts.',
  placeholder = 'Add a reflection...',
  anonPlaceholder = 'Reflect anonymously...',
}: ConversationSheetProps) {
  const [draft, setDraft] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (comments.length === 0) return;
    const timer = setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 150);
    return () => clearTimeout(timer);
  }, [comments.length]);

  const handleSend = async () => {
    const trimmed = draft.trim();
    if (!trimmed || isPosting) return;
    setDraft('');
    await onPost(trimmed, isAnonymous);
  };

  return (
    <Actionsheet isOpen={isOpen} onClose={onClose}>
      <Box style={{ height: '80%' }} className="w-full bg-phase-surface">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
          style={{ flex: 1 }}
        >
          <Box className="flex-1 overflow-hidden">
            {/* Header */}
            <HStack className="items-center px-5 py-4 border-b border-border">
              <Pressable
                accessibilityRole="button"
                onPress={onClose}
                className="w-10 h-10 items-center justify-center rounded-full bg-ink/5"
                hitSlop={12}
              >
                <Icon as={ChevronDown} size="md" className="text-ink/60" />
              </Pressable>
              <Text className="text-md font-bold text-ink flex-1 text-center">
                {isLoading ? 'Loading...' : `${comments.length} ${title}`}
              </Text>
              <Box className="w-10" />
            </HStack>

            {/* Content */}
            {isLoading ? (
              <Box className="flex-1 items-center justify-center">
                <BrandPulse size={28} tintColor="#D4843A" />
              </Box>
            ) : comments.length === 0 ? (
              <VStack className="flex-1 items-center justify-center py-12 px-8 gap-3">
                <Text className="text-md font-bold text-ink/20">{emptyTitle}</Text>
                <Text className="text-sm text-ink/40 text-center leading-relaxed">
                  {emptySubtitle}
                </Text>
              </VStack>
            ) : (
              <FlatList
                ref={flatListRef}
                data={comments}
                keyExtractor={(item: CommentItem) => item.id}
                contentContainerStyle={{
                  paddingHorizontal: 20,
                  paddingTop: 10,
                  paddingBottom: 24,
                }}
                renderItem={({ item }: { item: CommentItem }) => (
                  <CommentRow
                    comment={item}
                    currentUserId={currentUserId}
                    showOfficialBadge={showOfficialBadge}
                    canMarkOfficial={canMarkOfficial}
                    canDelete={canDeleteAll}
                    onDelete={onDelete}
                    onUpvote={onUpvote}
                    onMarkOfficial={onMarkOfficial}
                  />
                )}
              />
            )}

            {/* Composer */}
            <HStack className="items-end p-4 gap-3 border-t border-border bg-phase-surface/80">
              {allowAnonymous && (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setIsAnonymous((v) => !v)}
                  className={`w-11 h-11 rounded-2xl border items-center justify-center shrink-0 ${isAnonymous ? 'bg-phase-interactive border-phase-interactive' : 'bg-phase-surface border-border'}`}
                  hitSlop={8}
                >
                  <Icon
                    as={Lock}
                    size="sm"
                    className={isAnonymous ? 'text-white' : 'text-ink/40'}
                  />
                </Pressable>
              )}

              <Input className="flex-1 bg-ink/5 rounded-2xl border border-border">
                <InputField
                  className="text-ink text-sm py-2.5 px-3 min-h-[44px] max-h-[120px]"
                  placeholder={isAnonymous ? anonPlaceholder : placeholder}
                  placeholderTextColor="#94a3b8"
                  value={draft}
                  onChangeText={setDraft}
                  multiline
                />
              </Input>

              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  void handleSend();
                }}
                disabled={!draft.trim() || isPosting}
                className={`w-11 h-11 rounded-2xl items-center justify-center shrink-0 ${!draft.trim() ? 'bg-ink/5' : 'bg-phase-interactive'}`}
              >
                {isPosting ? (
                  <BrandPulse size={18} tintColor="#FFFFFF" />
                ) : (
                  <Icon
                    as={Send}
                    size="sm"
                    className={!draft.trim() ? 'text-ink/20' : 'text-white'}
                  />
                )}
              </Pressable>
            </HStack>
          </Box>
        </KeyboardAvoidingView>
      </Box>
    </Actionsheet>
  );
}
