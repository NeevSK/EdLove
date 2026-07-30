/**
 * ANNOUNCEMENTS SCREEN
 *
 * School-wide news feed for announcements.
 * Refactored for Sanctuary V3.
 */

import { usePermissions } from '@repo/core/logic';
import { SanctuaryButton } from '@repo/ui/components/SanctuaryButton';
import SanctuaryModal from '@repo/ui/components/SanctuaryModal';
import ScreenWrapper from '@repo/ui/components/ScreenWrapper';
import { Globe, Megaphone, Pin, Plus } from '@repo/ui/icons';
import {
  Box,
  Heading,
  HStack,
  Icon,
  Input,
  InputField,
  ScrollView,
  Spinner,
  Switch,
  Text,
  VStack,
} from '@repo/ui/primitives';
import { useCallback, useEffect, useReducer } from 'react';
import { useTranslation } from 'react-i18next';
import { communityAPI as community } from '@community/api/community';
import type { AnnouncementWithAuthor } from '@community/types/Community';

interface AnnouncementsScreenProps {
  schoolId: string;
  userId: string;
}

type State = {
  announcements: AnnouncementWithAuthor[];
  isLoading: boolean;
  showCreateModal: boolean;
  newAnnouncementContent: string;
  isPinned: boolean;
  isCreating: boolean;
  error: string | null;
};

type Action =
  | { type: 'LOAD_START' }
  | { type: 'LOAD_SUCCESS'; announcements: AnnouncementWithAuthor[] }
  | { type: 'LOAD_FAILURE'; error: string }
  | { type: 'SET_CREATE_MODAL'; open: boolean }
  | { type: 'SET_CONTENT'; content: string }
  | { type: 'SET_PINNED'; pinned: boolean }
  | { type: 'CREATE_START' }
  | { type: 'CREATE_SUCCESS' }
  | { type: 'CREATE_FAILURE'; error: string };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'LOAD_START':
      return { ...state, isLoading: true, error: null };
    case 'LOAD_SUCCESS':
      return { ...state, isLoading: false, announcements: action.announcements };
    case 'LOAD_FAILURE':
      return { ...state, isLoading: false, error: action.error };
    case 'SET_CREATE_MODAL':
      return {
        ...state,
        showCreateModal: action.open,
        newAnnouncementContent: action.open ? state.newAnnouncementContent : '',
        isPinned: action.open ? state.isPinned : false,
      };
    case 'SET_CONTENT':
      return { ...state, newAnnouncementContent: action.content };
    case 'SET_PINNED':
      return { ...state, isPinned: action.pinned };
    case 'CREATE_START':
      return { ...state, isCreating: true, error: null };
    case 'CREATE_SUCCESS':
      return {
        ...state,
        isCreating: false,
        showCreateModal: false,
        newAnnouncementContent: '',
        isPinned: false,
      };
    case 'CREATE_FAILURE':
      return { ...state, isCreating: false, error: action.error };
    default:
      return state;
  }
}

const initialState: State = {
  announcements: [],
  isLoading: true,
  showCreateModal: false,
  newAnnouncementContent: '',
  isPinned: false,
  isCreating: false,
  error: null,
};

export default function AnnouncementsScreen({ schoolId, userId }: AnnouncementsScreenProps) {
  const { t } = useTranslation();
  const { can } = usePermissions();
  const [state, dispatch] = useReducer(reducer, initialState);

  const {
    announcements,
    isLoading,
    showCreateModal,
    newAnnouncementContent,
    isPinned,
    isCreating,
    error,
  } = state;

  const loadAnnouncements = useCallback(async () => {
    dispatch({ type: 'LOAD_START' });
    try {
      const data = await community.getAnnouncements(schoolId);
      dispatch({ type: 'LOAD_SUCCESS', announcements: data });
    } catch (err: unknown) {
      console.error('Failed to load announcements:', err);
      dispatch({
        type: 'LOAD_FAILURE',
        error: (err as Error).message || 'Failed to load announcements',
      });
    }
  }, [schoolId]);

  useEffect(() => {
    void loadAnnouncements();
  }, [loadAnnouncements]);

  const handleCreateAnnouncement = async () => {
    if (!newAnnouncementContent.trim()) {
      dispatch({
        type: 'CREATE_FAILURE',
        error: 'Announcement content cannot be empty',
      });
      return;
    }

    dispatch({ type: 'CREATE_START' });
    try {
      await community.createAnnouncement(schoolId, userId, newAnnouncementContent, isPinned);
      dispatch({ type: 'CREATE_SUCCESS' });
      void loadAnnouncements();
    } catch (err: unknown) {
      console.error('Failed to create announcement:', err);
      dispatch({
        type: 'CREATE_FAILURE',
        error: (err as Error).message || 'Failed to create announcement',
      });
    }
  };

  const formatDate = (date?: string | Date): string => {
    if (!date) return '';
    const d = date instanceof Date ? date : new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) {
      return t('announcements.justNow') || 'Just now';
    } else if (diffHours < 24) {
      return t('announcements.hoursAgo', { hours: diffHours }) || `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return t('announcements.daysAgo', { days: diffDays }) || `${diffDays}d ago`;
    } else {
      return d.toLocaleDateString();
    }
  };

  const pinnedAnnouncements = announcements.filter((a) => a.is_pinned);
  const regularAnnouncements = announcements.filter((a) => !a.is_pinned);

  return (
    <ScreenWrapper noTopInset scroll={false} className="bg-phase-canvas">
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <VStack className="p-5 gap-6">
          {/* Hero Section */}
          <Box className="bg-phase-surface p-6 rounded-[32px] border border-border shadow-sm">
            <VStack className="gap-4">
              <HStack className="items-center gap-3">
                <Box className="w-12 h-12 rounded-2xl bg-phase-interactive/10 items-center justify-center">
                  <Icon as={Megaphone} size="md" className="text-phase-interactive" />
                </Box>
                <VStack className="gap-0.5">
                  <Heading className="text-2xl font-black text-ink">The Broadcaster</Heading>
                  <Text className="text-ink/60 text-sm">
                    School-wide resonance and critical updates.
                  </Text>
                </VStack>
              </HStack>

              {can('create', 'Announcement') && (
                <SanctuaryButton
                  action="primary"
                  className="h-12 rounded-xl mt-2"
                  onPress={() => dispatch({ type: 'SET_CREATE_MODAL', open: true })}
                >
                  <HStack className="items-center gap-2">
                    <Icon as={Plus} size="sm" className="text-white" />
                    <Text className="text-white font-bold">New Announcement</Text>
                  </HStack>
                </SanctuaryButton>
              )}
            </VStack>
          </Box>

          {/* Loading State */}
          {isLoading && (
            <Box className="py-20 items-center">
              <Spinner />
              <Text className="text-ink/40 text-sm mt-4 font-medium uppercase tracking-widest">
                Gathering Updates...
              </Text>
            </Box>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <Box className="p-4 bg-red-500/10 rounded-2xl border border-red-500/20">
              <Text className="text-red-500 font-medium text-center">{error}</Text>
            </Box>
          )}

          {/* Pinned Announcements */}
          {!isLoading && pinnedAnnouncements.length > 0 && (
            <VStack className="gap-4">
              <HStack className="items-center gap-2 px-1">
                <Icon as={Pin} size="xs" className="text-phase-interactive" />
                <Text className="text-ink/40 text-[10px] font-bold tracking-[2px] uppercase">
                  {t('announcements.pinned') || 'Pinned to Top'}
                </Text>
              </HStack>
              {pinnedAnnouncements.map((announcement) => (
                <Box
                  key={announcement.id}
                  className="p-5 bg-phase-interactive/5 rounded-3xl border border-phase-interactive/20"
                >
                  <VStack className="gap-3">
                    <HStack className="justify-between items-center">
                      <Text className="text-ink font-bold text-sm">
                        {announcement.author_name || 'Authority'}
                      </Text>
                      <Text className="text-ink/40 text-[10px] font-bold">
                        {formatDate(announcement.created_at)}
                      </Text>
                    </HStack>
                    <Text className="text-ink text-base leading-relaxed">
                      {announcement.content}
                    </Text>
                  </VStack>
                </Box>
              ))}
            </VStack>
          )}

          {/* Regular Announcements */}
          {!isLoading && regularAnnouncements.length > 0 && (
            <VStack className="gap-4">
              <HStack className="items-center gap-2 px-1">
                <Icon as={Globe} size="xs" className="text-ink/40" />
                <Text className="text-ink/40 text-[10px] font-bold tracking-[2px] uppercase">
                  {t('announcements.recent') || 'Recent Streams'}
                </Text>
              </HStack>

              {regularAnnouncements.map((announcement) => (
                <Box
                  key={announcement.id}
                  className="p-5 bg-phase-surface rounded-3xl border border-border shadow-sm"
                >
                  <VStack className="gap-3">
                    <HStack className="justify-between items-center">
                      <Text className="text-ink font-bold text-sm">
                        {announcement.author_name || 'Staff Member'}
                      </Text>
                      <Text className="text-ink/40 text-[10px] font-bold">
                        {formatDate(announcement.created_at)}
                      </Text>
                    </HStack>
                    <Text className="text-ink/70 text-base leading-relaxed">
                      {announcement.content}
                    </Text>
                  </VStack>
                </Box>
              ))}
            </VStack>
          )}

          {/* Empty State */}
          {!isLoading && announcements.length === 0 && (
            <Box className="py-20 items-center justify-center">
              <Box className="w-16 h-16 rounded-full bg-ink/5 items-center justify-center mb-4">
                <Icon as={Megaphone} size="lg" className="text-ink/20" />
              </Box>
              <Text className="text-lg text-ink/20 font-bold text-center">All is Quiet</Text>
              <Text className="text-sm text-ink/40 text-center px-10 mt-2">
                No school-wide resonance has been broadcast yet. Check back for future updates.
              </Text>
            </Box>
          )}
        </VStack>
      </ScrollView>

      <SanctuaryModal
        isOpen={showCreateModal}
        onClose={() => dispatch({ type: 'SET_CREATE_MODAL', open: false })}
        title="Draft Resonance"
      >
        <VStack className="gap-6 py-6 px-4">
          <VStack className="gap-2">
            <Text className="text-ink/60 text-xs font-bold uppercase tracking-wider">
              Announcement Content
            </Text>
            <Box className="bg-ink/5 rounded-2xl border border-border p-1">
              <Input className="min-h-[150px] border-none bg-transparent">
                <InputField
                  className="text-ink text-base py-3 px-4 flex-1"
                  placeholder={t('announcements.contentPlaceholder') || 'What needs to be heard?'}
                  placeholderTextColor="#94a3b8"
                  value={newAnnouncementContent}
                  onChangeText={(text) => dispatch({ type: 'SET_CONTENT', content: text })}
                  multiline
                />
              </Input>
            </Box>
          </VStack>

          <HStack className="justify-between items-center p-3 bg-ink/5 rounded-2xl">
            <HStack className="items-center gap-3">
              <Icon
                as={Pin}
                size="sm"
                className={isPinned ? 'text-phase-interactive' : 'text-ink/40'}
              />
              <Text className="text-ink text-sm font-bold">
                {t('announcements.pinAnnouncement') || 'Pin to Sanctuary Top'}
              </Text>
            </HStack>
            <Switch
              value={isPinned}
              onValueChange={(val) => dispatch({ type: 'SET_PINNED', pinned: val })}
            />
          </HStack>

          <HStack className="gap-3 mt-4">
            <SanctuaryButton
              action="secondary"
              className="flex-1 h-14 rounded-2xl"
              onPress={() => dispatch({ type: 'SET_CREATE_MODAL', open: false })}
              isDisabled={isCreating}
            >
              <Text className="text-ink font-bold">Withdraw</Text>
            </SanctuaryButton>
            <SanctuaryButton
              action="primary"
              className="flex-[2] h-14 rounded-2xl"
              onPress={handleCreateAnnouncement}
              isDisabled={isCreating}
            >
              {isCreating ? (
                <Spinner />
              ) : (
                <Text className="text-white font-bold text-lg">Broadcast</Text>
              )}
            </SanctuaryButton>
          </HStack>
        </VStack>
      </SanctuaryModal>
    </ScreenWrapper>
  );
}
